#!/usr/bin/env python3
"""
pubs_from_orcid.py — batch-generate MEMBER_PUBS entries for agw_member_pubs.js

WHY THIS EXISTS
───────────────
Hand-curating members' publications is a permanent drip of small edits that
lands entirely on the maintainer. This tool converts that drip into an annual
batch job: collect ORCID iDs once, run this, paste, commit.

WHAT IT DOES
────────────
Given an ORCID iD, it asks Crossref for every DOI-registered work associated
with that iD, normalises the metadata into the site's publication schema, and
prints ready-to-paste JavaScript objects.

    python3 tools/pubs_from_orcid.py 0000-0002-1825-0097 --mid schefold-bertram

Given DOIs instead, it does the same without ORCID:

    python3 tools/pubs_from_orcid.py --doi 10.1215/00182702-26-2-327 \
        --doi 10.1017/S1053837216000638 --mid kurz-heinz-d

And it can check the existing data file for broken references:

    python3 tools/pubs_from_orcid.py --lint

COVERAGE — READ THIS
────────────────────
Crossref only knows about works that (a) have a DOI and (b) have the author's
ORCID attached to the DOI record. For HET scholars this is a real limitation:
journal articles from roughly 2015 onward are well covered; monographs, edited
volumes, Festschrift chapters and anything pre-DOI are frequently missing.

So this tool is an accelerator, not an oracle. The intended workflow is:

    1. run it to get the machine-findable works for free
    2. ask the member to add the handful of books the machine missed
    3. review the suggested themes — they are keyword guesses, not judgements

Never paste the output unread.

CONSENT
───────
Only run this for members who have submitted their ORCID iD (see the intake
text on publications-members.html). An ORCID iD being public is not the same
thing as a member asking to be listed on the committee's site.

DEPENDENCIES
────────────
Standard library only. No API key, no token, no account.
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

CROSSREF = "https://api.crossref.org/works"
# Crossref asks for a contact address in the User-Agent; it buys you the
# "polite pool" (faster, more reliable). Change if the maintainer changes.
MAILTO = "bieri@vt.edu"
UA = "agw-vfs-pubs-tool/1.0 (https://www.agw-vfs.de; mailto:%s)" % MAILTO

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
DATA_JS = os.path.join(REPO, "agw_data.js")
PUBS_JS = os.path.join(REPO, "agw_member_pubs.js")

# ── Crossref type → our controlled vocabulary ────────────────────────────────
TYPE_MAP = {
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

# ── Theme suggestion: keyword → PUB_THEMES id. Suggestions only. ─────────────
THEME_HINTS = [
    ("classical",     ["sraffa", "ricard", "classical political economy", "surplus", "long-period"]),
    ("smith",         ["adam smith", "wealth of nations", "moral sentiments", "enlighten"]),
    ("austrian",      ["hayek", "mises", "menger", "böhm-bawerk", "bohm-bawerk", "austrian"]),
    ("keynesian",     ["keynes", "kalecki", "post-keynesian", "effective demand", "kaleckian"]),
    ("monetary",      ["monetary", "money", "geld", "central bank", "inflation", "macroecon", "business cycle", "konjunktur"]),
    ("ordoliberal",   ["ordo", "eucken", "röpke", "roepke", "freiburg", "constitutional econom", "ordnungsökonomik", "neoliberal"]),
    ("historical",    ["historical school", "schmoller", "roscher", "sombart", "methodenstreit", "historische schule"]),
    ("marxian",       ["marx", "marxian", "marxist"]),
    ("cameralism",    ["cameral", "kameral", "mercantil", "preindustrial"]),
    ("evolutionary",  ["evolutionary", "schumpeter", "institution", "veblen", "innovation"]),
    ("distribution",  ["distribution", "growth theory", "capital theory", "verteilung", "wachstum"]),
    ("public_finance",["public finance", "taxation", "finanzwissenschaft", "fiscal"]),
    ("methodology",   ["methodolog", "philosophy of econom", "popper", "wissenschaftstheorie", "epistem"]),
    ("econ_history",  ["economic history", "wirtschaftsgeschichte", "institutional history"]),
    ("feminist",      ["feminist", "gender", "women", "ökonominnen", "heterodox"]),
]


def suggest_themes(title, venue):
    hay = (title + " " + (venue or "")).lower()
    hits = [tid for tid, kws in THEME_HINTS if any(k in hay for k in kws)]
    return hits[:2] or ["general"]


def get_json(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode("utf-8"))


def normalise_orcid(x):
    x = re.sub(r"[^0-9Xx]", "", x).upper()
    if len(x) != 16:
        sys.exit("Not a valid ORCID iD: %s (expected 16 characters)" % x)
    return "-".join(x[i:i + 4] for i in range(0, 16, 4))


def crossref_by_orcid(orcid, rows=200):
    q = urllib.parse.urlencode({
        "filter": "orcid:" + orcid,
        "rows": rows,
        "select": "DOI,title,container-title,issued,type,author,publisher,volume,issue",
        "mailto": MAILTO,
    })
    return get_json("%s?%s" % (CROSSREF, q)).get("message", {}).get("items", [])


def crossref_by_doi(doi):
    return get_json("%s/%s" % (CROSSREF, urllib.parse.quote(doi)))["message"]


def fmt_authors(item, limit=4):
    names = []
    for a in (item.get("author") or [])[:limit]:
        given, family = a.get("given", ""), a.get("family", "")
        n = (given + " " + family).strip()
        if n:
            names.append(n)
    out = " \u00b7 ".join(names)
    if len(item.get("author") or []) > limit:
        out += " et al."
    return out


def year_of(item):
    for key in ("issued", "published-print", "published-online", "created"):
        parts = (item.get(key) or {}).get("date-parts") or []
        if parts and parts[0] and parts[0][0]:
            return int(parts[0][0])
    return None


def venue_of(item):
    ct = item.get("container-title") or []
    if ct:
        v = ct[0]
        vol = item.get("volume")
        iss = item.get("issue")
        if vol:
            v += " %s" % vol
            if iss:
                v += "(%s)" % iss
        return v
    return item.get("publisher") or ""


def js_str(s):
    return "'" + str(s).replace("\\", "\\\\").replace("'", "\\'") + "'"


def to_entry(item, mid, themes=None):
    title = (item.get("title") or [""])[0].strip()
    if not title:
        return None
    ctype = TYPE_MAP.get(item.get("type", ""), "article")
    venue = venue_of(item)
    year = year_of(item)
    th = themes or suggest_themes(title, venue)
    guessed = themes is None
    lines = [
        "    { mid:%s, themes:[%s]," % (js_str(mid), ", ".join(js_str(t) for t in th))
        + ("   // themes: GUESSED \u2014 verify" if guessed else ""),
        "      title:%s, type:%s," % (js_str(title), js_str(ctype)),
        "      authors:%s, venue:%s, year:%s," % (js_str(fmt_authors(item)), js_str(venue), year or "null"),
        "      doi:%s }," % js_str(item.get("DOI", "")),
    ]
    return "\n".join(lines), year or 0


# ── lint ─────────────────────────────────────────────────────────────────────
def lint():
    if not (os.path.exists(DATA_JS) and os.path.exists(PUBS_JS)):
        sys.exit("Run this from inside the repo (expected agw_data.js and agw_member_pubs.js one level up).")
    data = open(DATA_JS, encoding="utf-8").read()
    pubs = open(PUBS_JS, encoding="utf-8").read()

    members_block = re.search(r"const MEMBERS = \[(.*?)\n\];", data, re.S)
    member_ids = set(re.findall(r"\{ id:'([^']+)'", members_block.group(1)))
    theme_ids = set(re.findall(r"\{ id:'([^']+)',\s*order:", pubs))

    problems = 0
    for mid in re.findall(r"mid:'([^']+)'", pubs):
        if mid not in member_ids:
            print("  \u2717 unknown mid: %s" % mid)
            problems += 1
    for block in re.findall(r"themes:\[([^\]]*)\]", pubs):
        for t in re.findall(r"'([^']+)'", block):
            if t not in theme_ids:
                print("  \u2717 unknown theme: %s" % t)
                problems += 1
    for m in re.finditer(r"type:'([^']+)'", pubs):
        if m.group(1) not in ("article", "book", "chapter", "edited", "wp"):
            print("  \u2717 unknown type: %s" % m.group(1))
            problems += 1
    n_pubs = len(re.findall(r"\{ mid:'", pubs))
    if re.search(r"member:'", pubs):
        print("  \u2717 legacy `member:` key still present \u2014 re-key to `mid:`")
        problems += 1

    print("\n%d members, %d themes, %d publications \u2014 %s"
          % (len(member_ids), len(theme_ids), n_pubs,
             "OK" if not problems else "%d problem(s)" % problems))
    return 1 if problems else 0


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("orcid", nargs="?", help="ORCID iD, e.g. 0000-0002-1825-0097")
    ap.add_argument("--mid", help="member id slug from MEMBERS in agw_data.js (e.g. schefold-bertram)")
    ap.add_argument("--doi", action="append", default=[], help="DOI (repeatable); use instead of an ORCID iD")
    ap.add_argument("--themes", help="comma-separated theme ids to apply to ALL entries (skips guessing)")
    ap.add_argument("--since", type=int, help="only works published in or after this year")
    ap.add_argument("--limit", type=int, default=25, help="max entries to print (default 25, newest first)")
    ap.add_argument("--lint", action="store_true", help="validate agw_member_pubs.js against MEMBERS and PUB_THEMES")
    a = ap.parse_args()

    if a.lint:
        sys.exit(lint())

    if not a.mid:
        sys.exit("--mid is required: the member's id slug from MEMBERS in agw_data.js")
    if not a.orcid and not a.doi:
        sys.exit("Give an ORCID iD or one or more --doi values.")

    themes = [t.strip() for t in a.themes.split(",")] if a.themes else None

    try:
        if a.doi:
            items = []
            for d in a.doi:
                items.append(crossref_by_doi(d))
                time.sleep(0.2)
        else:
            items = crossref_by_orcid(normalise_orcid(a.orcid))
    except urllib.error.HTTPError as e:
        sys.exit("Crossref returned HTTP %s. If this is 404, the iD has no DOI-registered works." % e.code)
    except urllib.error.URLError as e:
        sys.exit("Network error talking to Crossref: %s" % e.reason)

    entries = []
    for it in items:
        e = to_entry(it, a.mid, themes)
        if not e:
            continue
        text, yr = e
        if a.since and yr and yr < a.since:
            continue
        entries.append((yr, text))

    entries.sort(key=lambda x: -x[0])
    entries = entries[:a.limit]

    if not entries:
        print("// No DOI-registered works found. This is common for monographs and\n"
              "// pre-DOI work \u2014 ask the member to send those separately.", file=sys.stderr)
        return

    print("\n    // \u2500\u2500 %s \u2500\u2500 %s" % (a.mid, "\u2500" * max(0, 60 - len(a.mid))))
    for _, text in entries:
        print(text)
    print("\n// %d entr%s \u2014 review themes, drop what doesn't belong, paste into\n"
          "// MEMBER_PUBS in agw_member_pubs.js, then run --lint."
          % (len(entries), "y" if len(entries) == 1 else "ies"), file=sys.stderr)


if __name__ == "__main__":
    main()
