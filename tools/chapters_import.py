#!/usr/bin/env python3
"""chapters_import.py — build the AGW Tagungsband chapter corpus.

The 43 volumes of *Studien zur Entwicklung der ökonomischen Theorie*
(Duncker & Humblot) are the committee's own publication record. This tool
harvests them chapter by chapter, from two sanctioned machine interfaces:

    EconStor OAI-PMH   handle (in PUBLICATIONS) → e-ISBN + volume DOI
    Crossref REST      e-ISBN                   → the chapters

Why two steps: EconStor holds each volume as a single `doc-type:book` item —
it has no chapter children and never will. But its Dublin Core record carries
the *electronic* ISBN, and that is the key Crossref indexes D&H's chapter
deposits under. The PRINT ISBN returns nothing. (978-3-428-19638-8 → 0 hits;
978-3-428-59638-6 → 11 chapters. This cost us an afternoon; it is why the
e-ISBN is fetched rather than guessed.)

EconStor's web UI sits behind an anti-bot wall and MUST NOT be scraped. The
OAI endpoint is the sanctioned interface. Both APIs are polled politely, and
every response is cached under tools/.cache/ so a re-run costs nothing.

USAGE
  python3 tools/chapters_import.py --probe
      Dry run. For every volume: does OAI give an e-ISBN, and does Crossref
      hold chapters under it? Prints a coverage table and stops. Run this
      FIRST — the older volumes may predate D&H's chapter deposits, and the
      table tells you how much of the corpus is machine-harvestable and how
      much needs the PDF/ToC fallback.

  python3 tools/chapters_import.py --build > agw_volume_chapters.js
      Full harvest, emits the data file.

  python3 tools/chapters_import.py --build --vol 43 --vol 42
      Just those volumes (numeric volN), for spot checks and re-runs.

  python3 tools/chapters_import.py --lint
      Validate agw_volume_chapters.js: known volumes, `mid` resolves or is
      null, no unknown themes, no unreviewed GUESSED markers left in.

WHAT IT DOES NOT DO
  It does not write biographies, and it does not decide themes. Every emitted
  line carries `// themes GUESSED — verify`; the theme keyword map is a
  suggestion engine, not an authority (it once tagged a housing paper
  `spatial` because the journal was *Journal of Regional Science*). Selection
  stays with the maintainer.

  `mid` is NULLABLE and usually null. A large share of Tagungsband
  contributors are guests and foreign scholars, not AGW members. A null `mid`
  is the normal case, not a failure — the chapter still belongs in the volume
  ToC on archive.html, it simply doesn't hang under anyone's member entry.
"""

import argparse
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

# Reuse the existing conventions rather than re-deriving them. ascii_fold and
# the surname + first-initial matching rule in particular: Adolph Wagner is not
# Helmut Wagner, and this bibliography contains both.
import pubs_import as pi  # noqa: E402

REPO = os.path.dirname(HERE)
DATA_JS = os.path.join(REPO, "agw_data.js")
PUBS_JS = os.path.join(REPO, "agw_member_pubs.js")
OUT_JS = os.path.join(REPO, "agw_volume_chapters.js")
CACHE = os.path.join(HERE, ".cache")

OAI = ("https://www.econstor.eu/oai/request"
       "?verb=GetRecord&metadataPrefix=oai_dc&identifier=oai:econstor.eu:{handle}")
CROSSREF_ISBN = ("https://api.crossref.org/works"
                 "?filter=isbn:{isbn}&rows=200&mailto=" + pi.MAILTO +
                 "&select=DOI,type,title,author,page,published,ISBN")

CHAPTER_TYPES = ("book-chapter", "book-part", "book-section", "reference-entry")

# Front/back matter Crossref sometimes deposits as chapters. Not contributions.
SKIP_TITLE = re.compile(
    r"^(inhalt|inhaltsverzeichnis|titelei|frontmatter|backmatter|impressum|"
    r"autoren(verzeichnis)?|verzeichnis der autoren|personenregister|"
    r"sachregister|register|index|abbildungsverzeichnis|tabellenverzeichnis)\b",
    re.I)


# ── volume table (from PUBLICATIONS in agw_data.js) ──────────────────────────
def volumes():
    """[{vol, volN, year, editor, handle}] — handle is None for non-EconStor."""
    src = open(DATA_JS, encoding="utf-8").read()
    m = re.search(r"const PUBLICATIONS = \[(.*?)\n\];", src, re.S)
    if not m:
        sys.exit("Could not locate the PUBLICATIONS array in agw_data.js.")
    out = []
    # + "\n": the LAST row of the array has no trailing newline inside the
    # captured block, and without this the newest volume is silently dropped.
    for row in re.findall(r"\{ num:'([^']+)',\s*numN:(\d+),(.*?)\},?\n", m.group(1) + "\n", re.S):
        num, numN, rest = row
        ec = re.search(r"econstor:'([^']+)'", rest)
        yr = re.search(r"year:(\d{4})", rest)
        ed = re.search(r"editor:'([^']*)'", rest)
        handle = None
        if ec:
            h = re.search(r"handle/(10419/\d+)", ec.group(1))
            handle = h.group(1) if h else None   # vol XLI is DOAB, not EconStor
        out.append({"vol": num, "volN": int(numN),
                    "year": int(yr.group(1)) if yr else None,
                    "editor": (ed.group(1) if ed else "").replace("hrsg. v. ", ""),
                    "handle": handle})
    return out


# ── polite, cached fetching ─────────────────────────────────────────────────
def fetch(url, key, is_json=False):
    os.makedirs(CACHE, exist_ok=True)
    path = os.path.join(CACHE, key)
    if os.path.exists(path):
        body = open(path, encoding="utf-8").read()
    else:
        req = urllib.request.Request(url, headers={"User-Agent": pi.UA})
        try:
            with urllib.request.urlopen(req, timeout=45) as r:
                body = r.read().decode("utf-8")
        except (urllib.error.HTTPError, urllib.error.URLError) as e:
            return None if not is_json else None
        open(path, "w", encoding="utf-8").write(body)
        time.sleep(1)                       # be a good citizen: 1 req/sec
    if is_json:
        import json
        try:
            return json.loads(body)
        except ValueError:
            return None
    return body


def oai_identifiers(handle):
    """(e-isbn, volume-doi) for an EconStor handle, from its dc:identifier list."""
    xml = fetch(OAI.format(handle=handle), "oai_%s.xml" % handle.replace("/", "_"))
    if not xml:
        return None, None
    try:
        root = ET.fromstring(xml)
    except ET.ParseError:
        return None, None
    ns = {"dc": "http://purl.org/dc/elements/1.1/"}
    isbn = doi = None
    for el in root.iter():
        if not el.tag.endswith("}identifier") or not (el.text or "").strip():
            continue
        v = el.text.strip()
        if v.lower().startswith("urn:isbn:"):
            isbn = re.sub(r"[^0-9Xx]", "", v[9:]).upper()
        elif v.lower().startswith("doi:"):
            doi = v[4:]
    return isbn, doi


def crossref_chapters(isbn):
    data = fetch(CROSSREF_ISBN.format(isbn=isbn), "cr_%s.json" % isbn, is_json=True)
    if not data:
        return []
    return (data.get("message") or {}).get("items") or []


# ── member matching ─────────────────────────────────────────────────────────
def members():
    src = open(DATA_JS, encoding="utf-8").read()
    blk = re.search(r"const MEMBERS = \[(.*?)\n\];", src, re.S)
    if not blk:
        sys.exit("Could not locate the MEMBERS array in agw_data.js.")
    out = []
    for mid, name in re.findall(r"\{ id:'([^']+)', name:'([^']+)'", blk.group(1)):
        parts = name.split()
        out.append({
            "mid": mid, "name": name,
            "sur": pi.ascii_fold(parts[-1]),
            "ini": pi.ascii_fold(parts[0])[:1] if len(parts) > 1 else "",
        })
    return out


def match_mid(author_objs, MEM):
    """Crossref author list → mid, or None. Surname + first initial, per
    pubs_import.bib_works. Surname alone is not safe. None is the normal case."""
    for a in author_objs or []:
        sur = pi.ascii_fold(a.get("family") or "")
        giv = pi.ascii_fold(a.get("given") or "")
        if not sur:
            continue
        for m in MEM:
            if m["sur"] != sur:
                continue
            if m["ini"] and giv and not giv.startswith(m["ini"]):
                continue            # different person sharing a surname
            return m["mid"]
    return None


def author_names(author_objs, limit=4):
    names = []
    for a in author_objs or []:
        n = ((a.get("given", "") + " " + a.get("family", "")).strip()
             or a.get("name", "")).strip()
        if n:
            names.append(n)
    out = " \u00b7 ".join(names[:limit])
    return out + (" et al." if len(names) > limit else "")


# ── harvest ─────────────────────────────────────────────────────────────────
def harvest(vol, MEM):
    """→ (status, [chapter dicts]). status is one of:
       ok | no-handle | no-isbn | no-chapters"""
    if not vol["handle"]:
        return "no-handle", []
    isbn, vdoi = oai_identifiers(vol["handle"])
    if not isbn:
        return "no-isbn", []
    vol["isbn"] = isbn
    vol["doi"] = vdoi

    rows = []
    for it in crossref_chapters(isbn):
        if it.get("type") not in CHAPTER_TYPES:
            continue                                   # skips the edited-book row
        title = pi.strip_markup((it.get("title") or [""])[0]).strip()
        if not title or SKIP_TITLE.match(title):
            continue                                   # front/back matter
        rows.append({
            "vol": vol["vol"], "volN": vol["volN"],
            "pages": (it.get("page") or "").replace("-", "\u2013"),
            "title": title,
            "authors": author_names(it.get("author")),
            "mid": match_mid(it.get("author"), MEM),
            "themes": pi.suggest_themes(title, ""),
            "doi": pi.clean_doi(it.get("DOI")),
        })
    if not rows:
        return "no-chapters", []

    def pagekey(r):
        m = re.match(r"(\d+)", r["pages"] or "")
        return int(m.group(1)) if m else 9999
    rows.sort(key=pagekey)
    return "ok", rows


# ── emit ────────────────────────────────────────────────────────────────────
def emit(vols, chapters):
    L = []
    L.append("/* agw_volume_chapters.js — chapters of the AGW Tagungsbände")
    L.append(" * " + "\u2500" * 71)
    L.append(" * The 43 volumes of *Studien zur Entwicklung der ökonomischen Theorie*")
    L.append(" * (Duncker & Humblot), chapter by chapter. Generated by")
    L.append(" * tools/chapters_import.py from EconStor OAI + Crossref. Do not hand-edit")
    L.append(" * the harvested fields; DO curate `themes` and `mid`.")
    L.append(" *")
    L.append(" * DELIBERATELY SEPARATE FROM MEMBER_PUBS. Different provenance (the")
    L.append(" * committee's own proceedings, not a member's submission), different")
    L.append(" * consent basis (a published chapter in our own volume is our own")
    L.append(" * publication record), different rendering (volume ToC + the primary")
    L.append(" * block on a member's entry). Do not merge the two arrays.")
    L.append(" *")
    L.append(" * `mid` IS NULLABLE and null is the common case: most contributors are")
    L.append(" * guests and foreign scholars, not AGW members. Never key on the display")
    L.append(" * name — names drift, slugs do not (ADR-028).")
    L.append(" *")
    L.append(" * `src` records where a row came from: 'crossref' (harvested) or")
    L.append(" * 'manual' (typed in from a ToC). When a row looks wrong in two years,")
    L.append(" * you will want to know which.")
    L.append(" */")
    L.append("(function () {")
    L.append("  const VOLUME_META = [")
    for v in vols:
        if not v.get("isbn"):
            continue
        L.append("    { volN:%d, vol:%s, isbn:%s, doi:%s }," % (
            v["volN"], pi.js_str(v["vol"]), pi.js_str(v["isbn"]), pi.js_str(v.get("doi"))))
    L.append("  ];")
    L.append("")
    L.append("  const VOLUME_CHAPTERS = [")
    cur = None
    for c in chapters:
        if c["volN"] != cur:
            cur = c["volN"]
            L.append("")
            L.append("    /* ── Band %s (%d) ─────────────────────────────────── */" % (c["vol"], cur))
        L.append("    { volN:%d, vol:%s, pages:%s,   // themes GUESSED \u2014 verify" % (
            c["volN"], pi.js_str(c["vol"]), pi.js_str(c["pages"])))
        L.append("      title:%s," % pi.js_str(c["title"]))
        L.append("      authors:%s, mid:%s," % (
            pi.js_str(c["authors"]), pi.js_str(c["mid"]) if c["mid"] else "null"))
        L.append("      themes:[%s], doi:%s, src:'crossref' }," % (
            ", ".join(pi.js_str(t) for t in c["themes"]), pi.js_str(c["doi"])))
    L.append("  ];")
    L.append("")
    L.append("  window.AGW_DATA = window.AGW_DATA || {};")
    L.append("  window.AGW_DATA.VOLUME_META = VOLUME_META;")
    L.append("  window.AGW_DATA.VOLUME_CHAPTERS = VOLUME_CHAPTERS;")
    L.append("})();")
    return "\n".join(L) + "\n"


# ── lint ────────────────────────────────────────────────────────────────────
def lint():
    if not os.path.exists(OUT_JS):
        sys.exit("No agw_volume_chapters.js yet \u2014 run --build first.")
    src = open(OUT_JS, encoding="utf-8").read()
    data = open(DATA_JS, encoding="utf-8").read()
    pubs = open(PUBS_JS, encoding="utf-8").read()

    blk = re.search(r"const MEMBERS = \[(.*?)\n\];", data, re.S)
    member_ids = set(re.findall(r"\{ id:'([^']+)'", blk.group(1))) if blk else set()
    theme_ids = set(re.findall(r"\{ id:'([^']+)',\s*order:", pubs))
    vol_ns = {v["volN"] for v in volumes()}

    problems = 0
    for mid in sorted(set(re.findall(r"mid:'([^']+)'", src))):
        if mid not in member_ids:
            print("  \u2717 unknown mid: %s" % mid); problems += 1
    for chunk in re.findall(r"themes:\[([^\]]*)\]", src):
        for t in re.findall(r"'([^']+)'", chunk):
            if t not in theme_ids:
                print("  \u2717 unknown theme: %s (not in PUB_THEMES)" % t); problems += 1
    for n in sorted({int(x) for x in re.findall(r"volN:(\d+)", src)}):
        if n not in vol_ns:
            print("  \u2717 unknown volume: %d" % n); problems += 1

    rows = len(re.findall(r"\{ volN:\d+, vol:'[^']*', pages:", src))   # not VOLUME_META
    named = len(re.findall(r"mid:'", src))
    vols_seen = len({int(x) for x in re.findall(r"volN:(\d+)", src)})
    if "themes GUESSED" in src:
        print("  \u26a0 unreviewed tool output still in the file (search for 'GUESSED')")
    print("\n%d chapters across %d volumes; %d attributed to a member, %d guest/unmatched \u2014 %s"
          % (rows, vols_seen, named, rows - named,
             "OK" if not problems else "%d problem(s)" % problems))
    return 1 if problems else 0


# ── main ────────────────────────────────────────────────────────────────────
def main():
    ap = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--probe", action="store_true",
                    help="coverage table only: which volumes yield an e-ISBN and chapters")
    ap.add_argument("--build", action="store_true", help="harvest and emit the data file (stdout)")
    ap.add_argument("--lint", action="store_true", help="validate agw_volume_chapters.js")
    ap.add_argument("--vol", type=int, action="append", help="restrict to volN (repeatable)")
    a = ap.parse_args()

    if a.lint:
        return lint()
    if not (a.probe or a.build):
        ap.print_help()
        return 0

    vols = volumes()
    if a.vol:
        vols = [v for v in vols if v["volN"] in set(a.vol)]
    MEM = members()

    results, allrows = [], []
    for v in vols:
        status, rows = harvest(v, MEM)
        results.append((v, status, len(rows)))
        allrows.extend(rows)
        if a.probe:
            print("  %-6s %-5s %-11s %s" % (
                v["vol"], v["volN"],
                {"ok": "%d chapters" % len(rows), "no-handle": "\u2014",
                 "no-isbn": "no e-ISBN", "no-chapters": "0 chapters"}[status],
                v.get("isbn") or ("DOAB, not EconStor" if not v["handle"] else "")),
                file=sys.stderr)

    ok = [r for r in results if r[1] == "ok"]
    gap = [r for r in results if r[1] != "ok"]
    print("\n%d/%d volumes harvestable, %d chapters total."
          % (len(ok), len(results), len(allrows)), file=sys.stderr)
    if gap:
        print("Needs the PDF/ToC fallback: %s"
              % ", ".join("%s (%s)" % (v["vol"], s) for v, s, _ in gap), file=sys.stderr)

    if a.build:
        sys.stdout.write(emit(vols, allrows))
    return 0


if __name__ == "__main__":
    sys.exit(main())
