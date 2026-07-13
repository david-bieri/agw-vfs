#!/usr/bin/env python3
"""
pubs_import.py — build MEMBER_PUBS entries for agw_member_pubs.js.  (v3)

Supersedes tools/doi_expand.py (which emitted the pre-v53 schema: `member:` by
display name, and no `type` field). Delete that file.

This is a *maintainer* tool. It runs on your machine, never on the website.
Standard library only — no API key, no token, no account, no dependencies.

────────────────────────────────────────────────────────────────────────────
WHAT IT DOES

Three sources, used together, because none is sufficient alone. This is not
over-engineering: on the one member whose record we could fully audit, ORCID
returned nine DOI-bearing journal articles and missed BOTH of his German book
chapters — which were the most subject-relevant things he had written. A local
.bib had them. Neither source alone produces a defensible entry.

  ORCID  (pub.orcid.org)   — the member's OWN deposited works list. Includes
                             monographs, edited volumes, chapters and pre-DOI
                             work that Crossref will never return. This is the
                             discovery layer.
  Crossref (api.crossref.org) — rich, clean metadata (full author list, exact
                             venue, canonical type) for anything with a DOI.
                             This is the enrichment layer.
  A local .bib (--bib)     — your own bibliography. Catches the chapters,
                             Festschrift contributions and German-language book
                             work that never got a DOI and never reached ORCID.
                             Needs `pip install bibtexparser`.

So: discover via ORCID, enrich via Crossref, merge, emit. Works without a DOI
still make it into the output — flagged, with whatever ORCID knows.

────────────────────────────────────────────────────────────────────────────
USAGE

  # Everything a member has deposited on ORCID (the normal case):
  python3 tools/pubs_import.py 0000-0002-1825-0097 --mid schefold-bertram

  # ...only recent work, capped:
  python3 tools/pubs_import.py 0000-0002-1825-0097 --mid kurz-heinz-d --since 2010 --limit 15

  # A few DOIs, no ORCID:
  python3 tools/pubs_import.py --doi 10.1215/00182702-26-2-327 --mid schefold-bertram

  # Everything by a member in your own .bib (matched on surname + first initial):
  python3 tools/pubs_import.py --bib ~/refs/overlord.bib --mid schefold-bertram

  # ...and enrich the .bib hits that carry a DOI:
  python3 tools/pubs_import.py --bib overlord.bib --mid kurz-heinz-d --enrich

  # Validate the data file after pasting (do this every time):
  python3 tools/pubs_import.py --lint

────────────────────────────────────────────────────────────────────────────
BEFORE YOU RUN IT  (policy revised 2026-07-12 — ADR-031)

The old rule here read: "Only run this for a member who has SENT you their ORCID
iD. Consent comes from the submission, not from the data being findable."

That rule has been superseded, because the model it described no longer matches
what the site is. The Tagungsband chapters (VOLUME_CHAPTERS, 288 across 43
volumes) are the COMMITTEE'S OWN publication record, not member submissions, and
47 of 48 members appear in them because they wrote in them. MEMBER_PUBS is now a
committee-curated SELECTION of further work, on the same footing.

So the basis is legitimate interest in maintaining an accurate scholarly record
of the committee's own field, using data the members themselves made public
(ORCID, Crossref, the publisher's own metadata) — not consent-by-submission.

Three things follow, and they are not optional:

  1. A PRIVACY NOTICE must exist. Legitimate interest without a Datenschutz-
     erklärung telling data subjects what is processed and why is not a legal
     basis, it is just a preference. Impressum + Datenschutzerklärung are a
     PREREQUISITE for running this at scale, not a follow-up task.
  2. AN OPT-OUT must be offered, and must be honoured without argument.
  3. ACCURACY IS ON US (DSGVO Art. 5(1)(d)). Read every line before it ships.
     Working papers get published — check. Names collide — check. A wrong entry
     on a colleague's page is a data-protection failure, not a typo.

AFTER YOU RUN IT

Read every line. Themes are keyword guesses, not scholarly judgements, and are
marked as such. Drop what doesn't belong. Then run --lint.
────────────────────────────────────────────────────────────────────────────
"""

import argparse
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

CROSSREF_DOI = "https://api.crossref.org/works/{doi}"
ORCID_WORKS = "https://pub.orcid.org/v3.0/{orcid}/works"

MAILTO = "bieri@vt.edu"
UA = "agw-vfs-pubs-tool/2.0 (https://www.agw-vfs.de; mailto:%s)" % MAILTO

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
DATA_JS = os.path.join(REPO, "agw_data.js")
PUBS_JS = os.path.join(REPO, "agw_member_pubs.js")

VALID_TYPES = ("article", "book", "chapter", "edited", "wp")

# Crossref `type` → our vocabulary
CROSSREF_TYPE = {
    "journal-article": "article",
    "proceedings-article": "article",
    "book": "book",
    "monograph": "book",
    "reference-book": "book",
    "edited-book": "edited",
    "book-chapter": "chapter",
    "book-part": "chapter",
    "book-section": "chapter",
    "reference-entry": "chapter",
    "posted-content": "wp",
    "report": "wp",
}

# ORCID `type` → our vocabulary (used when there is no DOI to enrich from)
ORCID_TYPE = {
    "JOURNAL_ARTICLE": "article",
    "CONFERENCE_PAPER": "article",
    "BOOK": "book",
    "BOOK_CHAPTER": "chapter",
    "EDITED_BOOK": "edited",
    "WORKING_PAPER": "wp",
    "PREPRINT": "wp",
    "REPORT": "wp",
    "DISSERTATION": "book",
}

# Theme suggestion: keyword → PUB_THEMES id. Suggestions only, never authoritative.
THEME_HINTS = [
    ("classical",      ["sraffa", "ricard", "classical political economy", "surplus", "long-period"]),
    ("smith",          ["adam smith", "wealth of nations", "moral sentiments", "enlighten"]),
    ("austrian",       ["hayek", "mises", "menger", "böhm-bawerk", "bohm-bawerk", "austrian"]),
    ("keynesian",      ["keynes", "kalecki", "post-keynesian", "effective demand", "kaleckian"]),
    ("monetary",       ["monetary", "money", "geld", "central bank", "inflation", "business cycle", "konjunktur"]),
    ("ordoliberal",    ["ordo", "eucken", "röpke", "roepke", "freiburg", "ordnungsökonomik", "neoliberal"]),
    ("historical",     ["historical school", "schmoller", "roscher", "sombart", "methodenstreit", "historische schule"]),
    ("marxian",        ["marx", "marxian", "marxist"]),
    # v60: `cameralism` was retired and replaced by `preclassical`, which spans the
    # mercantilists, the cameralists AND the physiocrats — the committee's own Band
    # XXXIX pairs "Kameralismus und Merkantilismus" in its title. Emitting the old id
    # here would produce a theme that no longer exists in PUB_THEMES (--lint catches it).
    ("preclassical",   ["cameral", "kameral", "mercantil", "merkantil", "preindustrial",
                        "physiokrat", "physiocrat", "quesnay", "turgot", "tableau économique",
                        "justi", "seckendorff", "sonnenfels", "graumann", "vorklassi"]),
    ("evolutionary",   ["evolutionary", "schumpeter", "institution", "veblen", "innovation"]),
    ("distribution",   ["distribution", "growth theory", "capital theory", "verteilung", "wachstum"]),
    ("public_finance", ["public finance", "taxation", "finanzwissenschaft", "fiscal"]),
    ("methodology",    ["methodolog", "philosophy of econom", "popper", "wissenschaftstheorie", "epistem"]),
    ("econ_history",   ["economic history", "wirtschaftsgeschichte", "history of econom"]),
    ("spatial",        ["lösch", "loesch", "christaller", "thünen", "thuenen", "standort",
                        "location theory", "spatial econom", "economic geography",
                        "regional science", "raumwirtschaft", "agglomeration"]),
    ("feminist",       ["feminist", "gender", "women", "ökonominnen"]),
]


# ── helpers ─────────────────────────────────────────────────────────────────
def member_name(mid):
    """Display name for a mid, read from MEMBERS in agw_data.js. Used as the
    author fallback: Crossref returns no author list for edited volumes."""
    try:
        data = open(DATA_JS, encoding="utf-8").read()
    except OSError:
        return ""
    m = re.search(r"\{ id:'%s', name:'([^']+)'" % re.escape(mid), data)
    return m.group(1) if m else ""


def get_json(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode("utf-8"))


def strip_markup(s):
    return re.sub(r"<[^>]+>", "", s or "")


def js_str(s):
    s = strip_markup(str(s or "")).replace("\n", " ").strip()
    return "'" + s.replace("\\", "\\\\").replace("'", "\\'") + "'"


def normalise_orcid(x):
    raw = re.sub(r"[^0-9Xx]", "", x).upper()
    if len(raw) != 16:
        sys.exit("Not a valid ORCID iD: %s (expected 16 digits/X)" % x)
    return "-".join(raw[i:i + 4] for i in range(0, 16, 4))


def clean_doi(d):
    return re.sub(r"^https?://(dx\.)?doi\.org/", "", (d or "").strip(), flags=re.I)


def suggest_themes(title, venue):
    hay = (str(title) + " " + str(venue or "")).lower()
    hits = [tid for tid, kws in THEME_HINTS if any(k in hay for k in kws)]
    return hits[:2] or ["general"]


# ── Crossref ────────────────────────────────────────────────────────────────
def crossref(doi):
    """Return a normalised record for a DOI, or None if Crossref doesn't have it."""
    try:
        msg = get_json(CROSSREF_DOI.format(doi=urllib.parse.quote(doi)))["message"]
    except (urllib.error.HTTPError, urllib.error.URLError, KeyError, ValueError):
        return None

    authors = []
    for a in (msg.get("author") or [])[:4]:
        n = ((a.get("given", "") + " " + a.get("family", "")).strip() or a.get("name", ""))
        if n:
            authors.append(n)
    author_str = " \u00b7 ".join(authors)
    if len(msg.get("author") or []) > 4:
        author_str += " et al."

    ctype = CROSSREF_TYPE.get(msg.get("type", ""), "article")
    ct = [c for c in (msg.get("container-title") or []) if c]
    if ctype in ("chapter", "edited", "book") and len(ct) > 1:
        # For book chapters Crossref often lists the SERIES first and the book
        # second ("Advances in Spatial Science" vs the actual volume title).
        # The longer string is almost always the book. Flagged for review anyway.
        venue = max(ct, key=len)
    elif ct:
        venue = ct[0]
    else:
        venue = msg.get("publisher") or ""
    if ct and ctype == "article" and msg.get("volume"):
        venue += " %s" % msg["volume"]
        if msg.get("issue"):
            venue += "(%s)" % msg["issue"]

    year = None
    for k in ("published-print", "published-online", "issued", "created"):
        dp = (msg.get(k) or {}).get("date-parts") or []
        if dp and dp[0] and dp[0][0]:
            year = int(dp[0][0])
            break

    return {
        "title": strip_markup((msg.get("title") or [""])[0]),
        "authors": author_str,
        "venue": venue,
        "year": year,
        "type": ctype,
        "doi": doi,
    }


# ── ORCID ───────────────────────────────────────────────────────────────────
def orcid_works(orcid):
    """Discovery layer: everything the member has deposited, DOI or not."""
    try:
        summary = get_json(ORCID_WORKS.format(orcid=orcid))
    except urllib.error.HTTPError as e:
        sys.exit("ORCID returned HTTP %s for %s. Check the iD." % (e.code, orcid))
    except urllib.error.URLError as e:
        sys.exit("Network error talking to ORCID: %s" % e.reason)

    out = []
    for g in summary.get("group", []):
        ws = g.get("work-summary") or []
        if not ws:
            continue
        w = ws[0]
        title = (((w.get("title") or {}).get("title") or {}).get("value") or "").strip()
        if not title:
            continue
        year = ((w.get("publication-date") or {}).get("year") or {}).get("value")
        doi = ""
        for eid in ((w.get("external-ids") or {}).get("external-id") or []):
            if (eid.get("external-id-type") or "").lower() == "doi":
                doi = clean_doi(eid.get("external-id-value", ""))
                break
        out.append({
            "title": strip_markup(title),
            "authors": "",
            "venue": (w.get("journal-title") or {}).get("value", "") or "",
            "year": int(year) if year and str(year).isdigit() else None,
            "type": ORCID_TYPE.get(w.get("type", ""), "article"),
            "doi": doi,
        })
    return out


# ── local .bib ──────────────────────────────────────────────────────────────
BIB_TYPE = {
    "article": "article", "book": "book", "inbook": "chapter", "incollection": "chapter",
    "techreport": "wp", "phdthesis": "book", "inproceedings": "article",
    "proceedings": "edited", "conference": "article", "manual": "wp",
    "unpublished": "wp", "misc": "wp", "mastersthesis": "wp", "booklet": "wp",
}
LATEX_ACCENT = {"a": "\u00e4", "o": "\u00f6", "u": "\u00fc",
                "A": "\u00c4", "O": "\u00d6", "U": "\u00dc"}


def de_latex(s):
    """Strip the LaTeX that lives in every real-world .bib file."""
    if not s:
        return ""
    s = re.sub(r"\\enquote\{([^{}]*)\}", "\u201c\\1\u201d", s)
    s = re.sub(r"\\(emph|textit|textbf|texttt|textsc|mkbibquote)\{([^{}]*)\}", r"\2", s)
    s = re.sub(r'\\"\{?([aouAOU])\}?', lambda m: LATEX_ACCENT[m.group(1)], s)
    s = re.sub(r"\\'\{?([a-zA-Z])\}?", r"\1", s)
    s = re.sub(r"\\`\{?([a-zA-Z])\}?", r"\1", s)
    s = re.sub(r"\\ss\{?\}?", "\u00df", s)
    s = s.replace("\\&", "&")
    s = re.sub(r"\\[a-zA-Z]+\s*", "", s)          # any macro left standing
    s = s.replace("{", "").replace("}", "").replace("~", " ").replace("--", "\u2013")
    return re.sub(r"\s+", " ", s).strip()


def ascii_fold(s):
    s = de_latex(s).replace("\u00e4", "ae").replace("\u00f6", "oe") \
                   .replace("\u00fc", "ue").replace("\u00df", "ss")
    import unicodedata
    return unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode().lower().strip()


def bib_works(path, mid):
    """Every work in `path` authored/edited by the member `mid`.

    Matched on surname + first initial of the given name. Surname alone is not
    safe: Adolph Wagner is not Helmut Wagner, and a bibliography of this field
    contains both.
    """
    try:
        import bibtexparser
        from bibtexparser.bparser import BibTexParser
    except ImportError:
        sys.exit("--bib needs bibtexparser:  pip install bibtexparser")

    name = member_name(mid)
    if not name:
        sys.exit("Unknown --mid '%s' (no such id in MEMBERS)." % mid)
    parts = name.split()
    surname, given = ascii_fold(parts[-1]), (ascii_fold(parts[0])[:1] if len(parts) > 1 else "")

    parser = BibTexParser(common_strings=True)
    parser.ignore_nonstandard_types = False
    with open(path, encoding="utf-8", errors="replace") as f:
        db = bibtexparser.load(f, parser)

    out, seen = [], set()
    for e in db.entries:
        field = e.get("author") or e.get("editor") or ""
        # repair the classic "Kurz, Heinz D.and Salvadori, Neri" missing-space bug
        field = re.sub(r"([A-Z]\.)and\s", r"\1 and ", field)
        matched = False
        for a in re.split(r"\s+and\s+", field):
            a = a.strip()
            if not a:
                continue
            sur = a.split(",")[0] if "," in a else a.split()[-1]
            giv = a.split(",", 1)[1] if "," in a else " ".join(a.split()[:-1])
            if ascii_fold(sur) != surname:
                continue
            g = ascii_fold(giv)
            if given and g and not g.startswith(given):
                continue          # different person sharing a surname
            matched = True
            break
        if not matched:
            continue

        # `chapter` is the piece, `title` the containing book — but some entries
        # carry a bare chapter NUMBER, which is not a title.
        chap = de_latex(e.get("chapter", ""))
        title = chap if (chap and not chap.strip().isdigit()) else de_latex(e.get("title", ""))
        if not title:
            continue
        key = ascii_fold(title)[:55]
        if key in seen:
            continue
        seen.add(key)

        etype = (e.get("ENTRYTYPE") or "article").lower()
        typ = BIB_TYPE.get(etype, "article")
        if not e.get("author") and e.get("editor"):
            typ = "edited"

        venue = ""
        for k in ("journal", "booktitle", "publisher", "institution", "school", "series"):
            if e.get(k):
                venue = de_latex(e[k])
                break

        ym = re.search(r"(1[6-9]\d\d|20\d\d)", str(e.get("year", "")))
        out.append({
            "title": title, "type": typ,
            "authors": bib_authors(field),
            "venue": venue, "year": int(ym.group(1)) if ym else None,
            "doi": (e.get("doi") or "").strip(), "_bib": e.get("ID", ""),
        })
    return out


def bib_authors(field, limit=4):
    """BibTeX 'Kurz, Heinz D. and Salvadori, Neri' -> 'Heinz D. Kurz \u00b7 Neri Salvadori',
    matching the display convention already used in MEMBER_PUBS."""
    names = []
    for a in re.split(r"\s+and\s+", field or ""):
        a = de_latex(a.strip())
        if not a:
            continue
        if "," in a:
            sur, giv = [x.strip() for x in a.split(",", 1)]
            names.append((giv + " " + sur).strip())
        else:
            names.append(a)
    out = " \u00b7 ".join(names[:limit])
    if len(names) > limit:
        out += " et al."
    return out


# ── emit ────────────────────────────────────────────────────────────────────
def to_entry(rec, mid, fixed_themes=None, fallback_author=""):
    guessed = fixed_themes is None
    themes = fixed_themes or suggest_themes(rec["title"], rec.get("venue"))
    # Crossref returns no author list for edited volumes; fall back to the member.
    authors = rec.get("authors") or fallback_author or member_name(mid)

    warn = []
    if guessed:
        warn.append("themes GUESSED")
    if not rec.get("doi"):
        warn.append("no DOI" + (" \u2014 from .bib" if rec.get("_bib") else " \u2014 from ORCID only"))
    if rec.get("type") in ("chapter", "edited") and rec.get("venue"):
        warn.append("venue may be the series, not the book")
    if not rec.get("authors"):
        warn.append("author list inferred")
    if not rec.get("venue"):
        warn.append("no venue")
    note = ("   // " + "; ".join(warn) + " \u2014 verify") if warn else ""

    lines = [
        "    { mid:%s, themes:[%s],%s" % (js_str(mid), ", ".join(js_str(t) for t in themes), note),
        "      title:%s, type:%s," % (js_str(rec["title"]), js_str(rec["type"])),
        "      authors:%s, venue:%s, year:%s%s" % (
            js_str(authors), js_str(rec.get("venue")), rec.get("year") or "null",
            "," if rec.get("doi") else " },"),
    ]
    if rec.get("doi"):
        lines.append("      doi:%s }," % js_str(rec["doi"]))
    return "\n".join(lines)


# ── lint ────────────────────────────────────────────────────────────────────
def lint():
    if not (os.path.exists(DATA_JS) and os.path.exists(PUBS_JS)):
        sys.exit("Run from inside the repo (expected agw_data.js and agw_member_pubs.js one level up).")
    data = open(DATA_JS, encoding="utf-8").read()
    pubs = open(PUBS_JS, encoding="utf-8").read()

    block = re.search(r"const MEMBERS = \[(.*?)\n\];", data, re.S)
    if not block:
        sys.exit("Could not locate the MEMBERS array in agw_data.js.")
    member_ids = set(re.findall(r"\{ id:'([^']+)'", block.group(1)))
    theme_ids = set(re.findall(r"\{ id:'([^']+)',\s*order:", pubs))

    problems = 0
    for mid in sorted(set(re.findall(r"mid:'([^']+)'", pubs))):
        if mid not in member_ids:
            print("  \u2717 unknown mid: %s" % mid)
            problems += 1
    for chunk in re.findall(r"themes:\[([^\]]*)\]", pubs):
        for t in re.findall(r"'([^']+)'", chunk):
            if t not in theme_ids:
                print("  \u2717 unknown theme: %s" % t)
                problems += 1
    for t in set(re.findall(r"type:'([^']+)'", pubs)):
        if t not in VALID_TYPES:
            print("  \u2717 unknown type: %s (allowed: %s)" % (t, ", ".join(VALID_TYPES)))
            problems += 1
    if re.search(r"member:'", pubs):
        print("  \u2717 legacy `member:` key present \u2014 re-key to `mid:` (see v53 schema)")
        problems += 1
    n_entries = len(re.findall(r"\{ mid:'", pubs))
    n_typed = len(re.findall(r"type:'", pubs))
    if n_typed < n_entries:
        print("  \u2717 %d entr(y/ies) missing a `type`" % (n_entries - n_typed))
        problems += 1
    if re.search(r"//\s*(themes GUESSED|TODO)", pubs):
        print("  \u26a0 unreviewed tool output still in the file (search for 'GUESSED')")

    print("\n%d members, %d themes, %d publications \u2014 %s"
          % (len(member_ids), len(theme_ids), n_entries,
             "OK" if not problems else "%d problem(s)" % problems))
    return 1 if problems else 0


# ── main ────────────────────────────────────────────────────────────────────
def main():
    ap = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("orcid", nargs="?", help="ORCID iD, e.g. 0000-0002-1825-0097")
    ap.add_argument("--mid", help="member id slug from MEMBERS in agw_data.js (e.g. schefold-bertram)")
    ap.add_argument("--doi", action="append", default=[], help="DOI (repeatable); use instead of an ORCID iD")
    ap.add_argument("--bib", help="path to a local .bib; emits every work by --mid found in it")
    ap.add_argument("--enrich", action="store_true",
                    help="with --bib: fetch Crossref metadata for entries that carry a DOI")
    ap.add_argument("--no-wp", action="store_true",
                    help="drop working papers / reports (recommended: the site shows selected work)")
    ap.add_argument("--themes", help="comma-separated theme ids applied to ALL entries (skips guessing)")
    ap.add_argument("--since", type=int, help="only works published in or after this year")
    ap.add_argument("--limit", type=int, default=25, help="max entries to print, newest first (default 25)")
    ap.add_argument("--author", default="", help="fallback author string for works ORCID has no authors for")
    ap.add_argument("--lint", action="store_true", help="validate agw_member_pubs.js against MEMBERS and PUB_THEMES")
    a = ap.parse_args()

    if a.lint:
        sys.exit(lint())
    if not a.mid:
        sys.exit("--mid is required: the member's id slug from MEMBERS in agw_data.js")
    if not a.orcid and not a.doi and not a.bib:
        ap.print_help()
        sys.exit(1)

    fixed = [t.strip() for t in a.themes.split(",")] if a.themes else None

    if a.bib:
        records = bib_works(a.bib, a.mid)
        n_doi = sum(1 for r in records if r["doi"])
        print("// %s: %d work(s) by %s (%d with a DOI)"
              % (os.path.basename(a.bib), len(records), member_name(a.mid), n_doi), file=sys.stderr)
        if a.enrich:
            for i, r in enumerate(records):
                if r["doi"]:
                    better = crossref(r["doi"])
                    if better:
                        better["_bib"] = r["_bib"]
                        records[i] = better
                    time.sleep(0.2)
    elif a.doi:
        records = []
        for d in a.doi:
            r = crossref(clean_doi(d))
            if r:
                records.append(r)
            else:
                print("// \u26a0 Crossref has nothing for DOI %s" % d, file=sys.stderr)
            time.sleep(0.2)
    else:
        works = orcid_works(normalise_orcid(a.orcid))
        print("// ORCID reports %d work(s); enriching those with DOIs via Crossref\u2026"
              % len(works), file=sys.stderr)
        records = []
        for w in works:
            if w["doi"]:
                enriched = crossref(w["doi"])
                records.append(enriched or w)
                time.sleep(0.2)
            else:
                records.append(w)

    if a.no_wp:
        records = [r for r in records if r.get("type") != "wp"]
    if a.since:
        records = [r for r in records if not r.get("year") or r["year"] >= a.since]
    records.sort(key=lambda r: -(r.get("year") or 0))
    records = records[:a.limit]

    if not records:
        print("// Nothing found. If the member has no ORCID deposits, ask them to send\n"
              "// a plain list \u2014 then use tools/cv_extract.py.", file=sys.stderr)
        return

    n_nodoi = sum(1 for r in records if not r.get("doi"))
    src = "your .bib" if a.bib else ("ORCID + Crossref" if a.orcid else "Crossref")
    print("\n    // \u2500\u2500 %s \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500" % a.mid)
    for r in records:
        print(to_entry(r, a.mid, fixed, a.author))
    print("\n// %d entries from %s (%d without a DOI \u2014 check those first).\n"
          "// This is a candidate list, not a selection: the page shows *selected* work.\n"
          "// Review themes, drop what doesn't belong, paste into MEMBER_PUBS, run --lint."
          % (len(records), src, n_nodoi), file=sys.stderr)


if __name__ == "__main__":
    main()

def crossref_title(title, rows=3):
    """Look a work up in Crossref BY TITLE. Used by orcid_seed.py --verify to triage entries
    that carry no DOI. A miss is weak evidence (books are patchily indexed), a hit is strong."""
    try:
        url = ("https://api.crossref.org/works?query.bibliographic="
               + urllib.parse.quote(title[:120]) + "&rows=%d&mailto=bieri@vt.edu" % rows)
        with urllib.request.urlopen(url, timeout=20) as r:
            items = json.load(r).get("message", {}).get("items", [])
    except Exception:
        return None
    want = re.sub(r"[^a-z0-9]+", " ", title.lower()).strip()
    for it in items:
        got = re.sub(r"[^a-z0-9]+", " ", (it.get("title") or [""])[0].lower()).strip()
        if got and (got[:40] == want[:40] or got in want or want in got):
            return it
    return None
