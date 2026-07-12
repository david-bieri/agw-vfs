#!/usr/bin/env python3
"""orcid_seed.py — batch companion to pubs_import.py, for the members who have nothing yet.

pubs_import.py already does the hard parts: ORCID works, Crossref enrichment, the type
map, theme suggestion, --lint. This does NOT reimplement any of it — it imports it.
What it adds is the four things pubs_import cannot do:

  1. TRIAGE     Who actually has no MEMBER_PUBS entry, and how thin is their chapter
                record? pubs_import takes one mid on the command line; it has no view
                of the whole membership.
  2. DISCOVERY  Find candidate ORCID iDs BY NAME. pubs_import requires you to already
                have the iD.   ⚠ READ THE CONSENT NOTE BELOW BEFORE USING --find.
  3. REVIEW     A CSV round-trip with a KEEP column, so 100+ candidates get triaged in
                a spreadsheet instead of a terminal.
  4. WP CHECK   For every working paper, ask Crossref whether a published version now
                exists.

────────────────────────────────────────────────────────────────────────────
⚠ CONSENT — READ BEFORE RUNNING --find

pubs_import.py says, and has always said:

    "Only run this for a member who has SENT you their ORCID iD. An ORCID iD being
     public is not the same thing as a member asking to be listed on the AGW site.
     Consent comes from the submission, not from the data being findable."

--find searches ORCID BY NAME, for members who have submitted nothing. That is exactly
what the rule forbids.

It exists because the model has arguably already changed: the Tagungsband chapters are
the committee's OWN publication record, and the 2026 supplements were curated from the
maintainer's own .bib — neither was submission-based. If curation is the model, then the
rule above should be REVISED, not quietly broken. And the Datenschutzerklärung that tells
members this is happening stops being optional: a privacy notice is what makes
"legitimate interest" defensible rather than merely convenient.

So --find is gated behind an explicit flag. If the question is unsettled, use --fetch
with iDs that members sent you, and email the rest.
────────────────────────────────────────────────────────────────────────────

USAGE

    python tools\\orcid_seed.py --triage
        Who has nothing? Offline, no requests. Start here.

    python tools\\orcid_seed.py --find --i-have-decided-the-consent-question
        ORCID name search -> tools/orcid_ids.csv (candidate iDs + affiliations).
        THEN CURATE BY HAND: delete wrong rows, keep AT MOST ONE per member. Name
        search returns homonyms — MEMBERS contains a "Helmut Wagner", and so does half
        of German economics. Nothing is auto-accepted.

    python tools\\orcid_seed.py --fetch
        Reads the curated tools/orcid_ids.csv, pulls works via pubs_import.orcid_works(),
        flags preprints that look published, writes tools/orcid_review.csv (KEEP column).

    python tools\\orcid_seed.py --emit
        KEEP=x rows -> a MEMBER_PUBS block on stdout.
        Then: python tools\\pubs_import.py --lint

WHAT ORCID WILL NOT GIVE YOU
    ORCID systematically misses German-language book chapters. On the one record we could
    fully audit it returned nine DOI-bearing articles and missed BOTH German book
    chapters — the most subject-relevant things that member had written. An empty ORCID
    result is NOT evidence that a member has published little; it is evidence that ORCID
    covers this literature badly. Where it comes back empty: ask the member.
"""

import argparse
import csv
import os
import re
import sys
import time
import urllib.parse

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import pubs_import as pi  # noqa: E402  — single source of truth for fetch / enrich / emit

REPO = os.path.dirname(HERE)
CHAPS_JS = os.path.join(REPO, "agw_volume_chapters.js")
IDS_CSV = os.path.join(HERE, "orcid_ids.csv")
REVIEW_CSV = os.path.join(HERE, "orcid_review.csv")

ORCID_SEARCH = ("https://pub.orcid.org/v3.0/expanded-search/"
                "?q=given-names:%s+AND+family-name:%s&rows=8")
CROSSREF_TITLE = ("https://api.crossref.org/works?query.bibliographic=%s&rows=3"
                  "&select=DOI,title,type,container-title&mailto=" + pi.MAILTO)

FIELDS = ["KEEP", "THEMES", "mid", "member", "year", "type", "title",
          "venue", "authors", "doi", "published_version"]

PARTICLES = {"von", "van", "de", "der", "den", "zu", "zur", "ter"}


def _array(path, name):
    if not os.path.exists(path):
        return ""
    m = re.search(r"%s\s*=\s*\[(.*?)\n\s*\];" % name,
                  open(path, encoding="utf-8").read(), re.S)
    return m.group(1) if m else ""


def triage():
    """[{mid, name, chapters}] for members with no MEMBER_PUBS entry, thinnest first."""
    members = re.findall(r"\{ id:'([^']+)', name:'([^']+)'",
                         _array(pi.DATA_JS, "const MEMBERS"))
    have = set(re.findall(r"mid:'([^']+)'", _array(pi.PUBS_JS, "MEMBER_PUBS")))
    nchap = {}
    for mids in re.findall(r"mids:\[([^\]]*)\]", _array(CHAPS_JS, "const VOLUME_CHAPTERS")):
        for mid in re.findall(r"'([^']+)'", mids):
            nchap[mid] = nchap.get(mid, 0) + 1
    out = [{"mid": mid, "name": name, "chapters": nchap.get(mid, 0)}
           for mid, name in members if mid not in have]
    out.sort(key=lambda m: m["chapters"])
    return out


def show_triage():
    todo = triage()
    thin = [m for m in todo if m["chapters"] <= 1]
    fat = [m for m in todo if m["chapters"] > 1]
    print("%d members have no MEMBER_PUBS entry.\n" % len(todo))
    print("THIN (\u22641 AGW chapter) \u2014 %d members. These are the ones a supplement helps:" % len(thin))
    for m in thin:
        print("   %-32s %d chapter(s)" % (m["name"], m["chapters"]))
    print("\nAlso without a MEMBER_PUBS entry, but their AGW chapters already carry the")
    print("page (%d members). A supplement adds little here:" % len(fat))
    for m in fat:
        print("   %-32s %d chapters" % (m["name"], m["chapters"]))
    return 0


def split_name(name):
    parts = name.split()
    i = len(parts) - 1
    while i > 1 and parts[i - 1].lower() in PARTICLES:
        i -= 1
    return " ".join(parts[:i]), " ".join(parts[i:])


def find():
    rows = []
    for m in [x for x in triage() if x["chapters"] <= 1]:
        given, family = split_name(m["name"])
        data = pi.get_json(ORCID_SEARCH % (urllib.parse.quote(given), urllib.parse.quote(family)))
        hits = (data or {}).get("expanded-result") or []
        print("%-32s %d candidate(s)" % (m["name"], len(hits)))
        if not hits:
            rows.append({"mid": m["mid"], "name": m["name"], "orcid": "", "cand_name": "",
                         "affiliation": "", "note": "NO HIT \u2014 ask the member directly"})
            continue
        for h in hits:
            inst = "; ".join((h.get("institution-name") or [])[:2])
            cand = ("%s %s" % (h.get("given-names") or "", h.get("family-names") or "")).strip()
            print("     %-20s %-26s %s" % (h.get("orcid-id"), cand[:26], inst[:46]))
            rows.append({"mid": m["mid"], "name": m["name"], "orcid": h.get("orcid-id"),
                         "cand_name": cand, "affiliation": inst, "note": ""})
        time.sleep(1)
    with open(IDS_CSV, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["mid", "name", "orcid", "cand_name", "affiliation", "note"])
        w.writeheader()
        w.writerows(rows)
    print("\nwrote %s" % IDS_CSV)
    print("NOW CURATE IT: keep AT MOST ONE orcid per mid, and check the affiliation column.")
    return 0


def published_version(title):
    """Has this preprint since appeared in a journal or book? '' if not.

    Exists because a .bib freezes an item at the moment it was entered, and working papers
    get published. Of four WPs audited by hand in July 2026, THREE had been published, one
    under a changed title. Listing a colleague's working paper years after it appeared in a
    Springer volume is small and entirely avoidable."""
    data = pi.get_json(CROSSREF_TITLE % urllib.parse.quote(re.sub(r"\s+", " ", title)[:120]))
    want = re.sub(r"\W+", " ", title.lower()).split()[:6]
    for it in ((data or {}).get("message") or {}).get("items", []):
        got = re.sub(r"\W+", " ", (it.get("title") or [""])[0].lower()).split()[:6]
        cont = (it.get("container-title") or [""])[0]
        if want and got == want and cont and it.get("type") in ("journal-article", "book-chapter"):
            return "%s (%s) doi:%s" % (cont[:44], it.get("type"), it.get("DOI"))
    return ""


def fetch():
    if not os.path.exists(IDS_CSV):
        sys.exit("No %s. Run --triage, then --find \u2014 or write the file by hand "
                 "(columns: mid,name,orcid) from iDs members sent you." % IDS_CSV)
    ids = [r for r in csv.DictReader(open(IDS_CSV, encoding="utf-8-sig")) if r.get("orcid")]
    per = {}
    for r in ids:
        per.setdefault(r["mid"], []).append(r["orcid"])
    dupes = [k for k, v in per.items() if len(v) > 1]
    if dupes:
        sys.exit("More than one ORCID kept for: %s\nPick ONE per member \u2014 this is the step that "
                 "stops another person's work landing on a colleague's page." % ", ".join(dupes))

    rows = []
    for r in ids:
        works = pi.orcid_works(pi.normalise_orcid(r["orcid"]))
        print("%-30s %-21s %d works" % (r["name"], r["orcid"], len(works)))
        for w in works:
            e = pi.to_entry(w, r["mid"], fallback_author=r["name"])
            if not e:
                continue
            flag = published_version(e["title"]) if e.get("type") == "wp" else ""
            rows.append({"KEEP": "", "THEMES": ",".join(e.get("themes") or []),
                         "mid": r["mid"], "member": r["name"], "year": e.get("year") or "",
                         "type": e.get("type") or "article", "title": e["title"],
                         "venue": e.get("venue") or "", "authors": e.get("authors") or r["name"],
                         "doi": e.get("doi") or "", "published_version": flag})
    rows.sort(key=lambda x: (x["member"], -int(x["year"] or 0)))
    with open(REVIEW_CSV, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=FIELDS)
        w.writeheader()
        w.writerows(rows)
    flagged = sum(1 for r in rows if r["published_version"])
    print("\nwrote %s  (%d candidates)" % (REVIEW_CSV, len(rows)))
    if flagged:
        print("  \u26a0 %d working paper(s) appear to HAVE BEEN PUBLISHED \u2014 see the last column." % flagged)
    print("NOW: KEEP=x on 2\u20133 per member. THEMES is a GUESS \u2014 verify it.")
    return 0


def emit():
    if not os.path.exists(REVIEW_CSV):
        sys.exit("Run --fetch first.")
    rows = [r for r in csv.DictReader(open(REVIEW_CSV, encoding="utf-8-sig"))
            if str(r.get("KEEP", "")).strip().lower() in ("x", "y", "yes", "1")]
    if not rows:
        sys.exit("Nothing marked KEEP.")

    themes = set(re.findall(r"\{\s*id:'([^']+)',\s*order:",
                            open(pi.PUBS_JS, encoding="utf-8").read()))
    bad = {t for r in rows for t in re.split(r"[,\s]+", r["THEMES"]) if t and t not in themes}
    if bad:
        sys.exit("Unknown theme id(s): %s\nValid: %s"
                 % (", ".join(sorted(bad)), ", ".join(sorted(themes))))

    zombies = [r for r in rows if r["type"] == "wp" and r["published_version"]]
    if zombies:
        print("\u26a0 %d kept working paper(s) appear to be PUBLISHED \u2014 cite the published version:"
              % len(zombies), file=sys.stderr)
        for r in zombies:
            print("    %-50s \u2192 %s" % (r["title"][:50], r["published_version"]), file=sys.stderr)
        print("", file=sys.stderr)

    for member in sorted({r["member"] for r in rows}):
        print("")
        print("    // \u2500\u2500 %s \u2500\u2500" % member)
        for r in [x for x in rows if x["member"] == member]:
            ts = [t for t in re.split(r"[,\s]+", r["THEMES"]) if t]
            print("    { mid:%s, themes:[%s]," % (pi.js_str(r["mid"]),
                                                  ",".join(pi.js_str(t) for t in ts)))
            print("      title:%s, type:%s," % (pi.js_str(r["title"]), pi.js_str(r["type"])))
            tail = "      authors:%s, venue:%s, year:%s" % (
                pi.js_str(r["authors"]), pi.js_str(r["venue"]), r["year"])
            print(tail + (",\n      doi:%s }," % pi.js_str(r["doi"]) if r["doi"] else " },"))
    print("\n/* %d entries \u2014 paste into MEMBER_PUBS, then: python tools\\pubs_import.py --lint */"
          % len(rows), file=sys.stderr)
    return 0


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--triage", action="store_true", help="who has no MEMBER_PUBS entry (offline)")
    ap.add_argument("--find", action="store_true",
                    help="search ORCID by NAME \u2014 read the CONSENT note first")
    ap.add_argument("--i-have-decided-the-consent-question", action="store_true", dest="consent",
                    help="required for --find")
    ap.add_argument("--fetch", action="store_true", help="works \u2192 tools/orcid_review.csv")
    ap.add_argument("--emit", action="store_true", help="KEEP rows \u2192 MEMBER_PUBS block")
    a = ap.parse_args()

    if a.triage:
        return show_triage()
    if a.find:
        if not a.consent:
            sys.exit(
                "\n--find searches ORCID BY NAME for members who submitted nothing.\n"
                "pubs_import.py's own rule says: \"Consent comes from the submission, not\n"
                "from the data being findable.\"\n\n"
                "Settle that first (see the CONSENT section at the top of this file).\n"
                "If it is settled, re-run with --i-have-decided-the-consent-question.\n")
        return find()
    if a.fetch:
        return fetch()
    if a.emit:
        return emit()
    ap.print_help()
    return 0


if __name__ == "__main__":
    sys.exit(main())
