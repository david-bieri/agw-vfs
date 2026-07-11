#!/usr/bin/env python3
"""
pubs_import.py — build MEMBER_PUBS entries for agw_member_pubs.js.

Supersedes tools/doi_expand.py (which emitted the pre-v53 schema: `member:` by
display name, and no `type` field). Delete that file.

This is a *maintainer* tool. It runs on your machine, never on the website.
Standard library only — no API key, no token, no account, no dependencies.

────────────────────────────────────────────────────────────────────────────
WHAT IT DOES

Two sources, used together, because neither is sufficient alone:

  ORCID  (pub.orcid.org)   — the member's OWN deposited works list. Includes
                             monographs, edited volumes, chapters and pre-DOI
                             work that Crossref will never return. This is the
                             discovery layer.
  Crossref (api.crossref.org) — rich, clean metadata (full author list, exact
                             venue, canonical type) for anything with a DOI.
                             This is the enrichment layer.

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

  # Validate the data file after pasting (do this every time):
  python3 tools/pubs_import.py --lint

────────────────────────────────────────────────────────────────────────────
BEFORE YOU RUN IT

Only run this for a member who has SENT you their ORCID iD. An ORCID iD being
public is not the same thing as a member asking to be listed on the AGW site.
Consent comes from the submission, not from the data being findable.

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
    ("cameralism",     ["cameral", "kameral", "mercantil", "preindustrial"]),
    ("evolutionary",   ["evolutionary", "schumpeter", "institution", "veblen", "innovation"]),
    ("distribution",   ["distribution", "growth theory", "capital theory", "verteilung", "wachstum"]),
    ("public_finance", ["public finance", "taxation", "finanzwissenschaft", "fiscal"]),
    ("methodology",    ["methodolog", "philosophy of econom", "popper", "wissenschaftstheorie", "epistem"]),
    ("econ_history",   ["economic history", "wirtschaftsgeschichte"]),
    ("feminist",       ["feminist", "gender", "women", "ökonominnen"]),
]


# ── helpers ─────────────────────────────────────────────────────────────────
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

    ct = msg.get("container-title") or []
    venue = ct[0] if ct else (msg.get("publisher") or "")
    if ct and msg.get("volume"):
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
        "type": CROSSREF_TYPE.get(msg.get("type", ""), "article"),
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


# ── emit ────────────────────────────────────────────────────────────────────
def to_entry(rec, mid, fixed_themes=None, fallback_author=""):
    guessed = fixed_themes is None
    themes = fixed_themes or suggest_themes(rec["title"], rec.get("venue"))
    authors = rec.get("authors") or fallback_author

    warn = []
    if guessed:
        warn.append("themes GUESSED")
    if not rec.get("doi"):
        warn.append("no DOI \u2014 metadata from ORCID only")
    if not authors:
        warn.append("no author list")
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
    if not a.orcid and not a.doi:
        ap.print_help()
        sys.exit(1)

    fixed = [t.strip() for t in a.themes.split(",")] if a.themes else None

    if a.doi:
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

    if a.since:
        records = [r for r in records if not r.get("year") or r["year"] >= a.since]
    records.sort(key=lambda r: -(r.get("year") or 0))
    records = records[:a.limit]

    if not records:
        print("// Nothing found. If the member has no ORCID deposits, ask them to send\n"
              "// a plain list \u2014 then use tools/cv_extract.py.", file=sys.stderr)
        return

    n_nodoi = sum(1 for r in records if not r.get("doi"))
    print("\n    // \u2500\u2500 %s \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500" % a.mid)
    for r in records:
        print(to_entry(r, a.mid, fixed, a.author))
    print("\n// %d entries (%d without a DOI \u2014 check those first). Review themes,\n"
          "// drop what doesn't belong, paste into MEMBER_PUBS, then run --lint."
          % (len(records), n_nodoi), file=sys.stderr)


if __name__ == "__main__":
    main()
