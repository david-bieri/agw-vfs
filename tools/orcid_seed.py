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
BASIS FOR PROCESSING  (settled 2026-07-12 — ADR-031)

The site's member bibliography is COMMITTEE-CURATED, not submission-based. The
Tagungsband chapters are the committee's own publication record; MEMBER_PUBS is a
curated selection of further work. Searching ORCID by name is therefore on the same
footing as curating from a bibliography — public data, curated by the committee.

The old "consent comes from the submission" rule in pubs_import.py has been revised
accordingly. What replaces it is NOT weaker, it is different, and it has teeth:

  * A Datenschutzerklärung must exist. Legitimate interest without a privacy notice
    is not a legal basis. This is now the binding prerequisite for running --find at
    scale — not a follow-up task.
  * An opt-out must be offered and honoured without argument.
  * Accuracy is on the maintainer (DSGVO Art. 5(1)(d)). Read every line. Homonyms
    and stale working papers are data-protection failures, not typos.
────────────────────────────────────────────────────────────────────────────

USAGE

    python tools\\orcid_seed.py --triage
        Who has nothing? Offline, no requests. Start here.

    python tools\\orcid_seed.py --find
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
import io
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


def safe_json(url):
    """pubs_import.get_json() raises on network errors by design — its own callers wrap
    it. We wrap it too: one unreachable name must not abort a 25-member run."""
    try:
        return pi.get_json(url)
    except Exception as e:                       # noqa: BLE001 — any network failure
        print("     ! %s" % str(e)[:70], file=sys.stderr)
        return None


def read_csv(path):
    """Read a CSV that PowerShell may have written in the OEM codepage.

    `Out-File` / `>` on a German Windows box writes **CP850**, not UTF-8: `Krämer`
    arrives as `Kr„mer` and byte 0x84 kills a utf-8 read outright. Try the sane
    encodings in order rather than making the user think about codepages.
    Tip for the user: `... | Set-Content -Encoding utf8 file.csv`."""
    raw = open(path, "rb").read()
    for enc in ("utf-8-sig", "utf-8", "cp1252", "cp850"):
        try:
            txt = raw.decode(enc)
        except UnicodeDecodeError:
            continue
        if enc in ("cp1252", "cp850"):
            print("  (note: %s was %s-encoded, not UTF-8 \u2014 decoded anyway)"
                  % (os.path.basename(path), enc), file=sys.stderr)
        return list(csv.DictReader(io.StringIO(txt)))
    sys.exit("Cannot decode %s in any known encoding." % path)


def check_mids(rows):
    """Every mid must exist in MEMBERS. A typo here ('turn-richard' for 'sturn-richard')
    silently attaches a publication to nobody \u2014 nothing downstream complains."""
    known = set(re.findall(r"\{ id:'([^']+)', name:", open(pi.DATA_JS, encoding="utf-8").read()))
    bad = sorted({r["mid"] for r in rows if r.get("mid") and r["mid"] not in known})
    if bad:
        sys.exit("Unknown mid(s) in the CSV: %s\nThese do not exist in MEMBERS \u2014 fix the "
                 "spelling before going further." % ", ".join(bad))


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


def without_orcid():
    """Members who have no `orcid:` in MEMBERS. THIS is the right set for --find.

    It used to reuse triage() — members with no MEMBER_PUBS entry — which is a different
    question entirely. Once Sturn, Krämer, Braun, Wagner and Landmann were given supplements
    they vanished from that list, so --find silently stopped searching for exactly the people
    whose iDs were still missing. Ask the question you actually mean.
    """
    src = open(pi.DATA_JS, encoding="utf-8").read()
    out = []
    for line in src.split("\n"):
        m = re.search(r"\{ id:'([^']+)', name:'([^']+)'", line)
        if not m:
            continue
        if "orcid:'" in line:
            continue
        inst = re.search(r"inst:'([^']*)'", line)
        out.append({"mid": m.group(1), "name": m.group(2),
                    "inst": inst.group(1) if inst else ""})
    return out


def find():
    rows = []
    todo = [m for m in without_orcid() if m["mid"] not in BLOCKED]
    print("%d member(s) have no ORCID iD yet.\n" % len(todo))
    for m in todo:
        given, family = split_name(m["name"])
        data = safe_json(ORCID_SEARCH % (urllib.parse.quote(given), urllib.parse.quote(family)))
        hits = (data or {}).get("expanded-result") or []
        print("%-30s %-34s %d candidate(s)" % (m["name"], m["inst"][:34], len(hits)))
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
    print("NOW CURATE IT. Delete every row you cannot confirm; keep at most ONE per member.")
    print("The affiliation column is the test, not the name. In the July 2026 run, three of")
    print("nine searches returned a confident WRONG person: a clinician in Innsbruck for")
    print("Kremser, a librarian in Dresden for Wohlgemuth, and eight unrelated 'Christian")
    print("von ...' records for von Weizsäcker. A blank affiliation is NOT a confirmation.")
    return 0


def published_version(title):
    """Has this preprint since appeared in a journal or book? '' if not.

    Exists because a .bib freezes an item at the moment it was entered, and working papers
    get published. Of four WPs audited by hand in July 2026, THREE had been published, one
    under a changed title. Listing a colleague's working paper years after it appeared in a
    Springer volume is small and entirely avoidable."""
    data = safe_json(CROSSREF_TITLE % urllib.parse.quote(re.sub(r"\s+", " ", title)[:120]))
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
    rows_in = read_csv(IDS_CSV)
    check_mids(rows_in)
    ids = [r for r in rows_in if r.get("orcid")]
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
            # ORCID gives a thin record (title/type/year/doi, no authors, often no venue).
            # Crossref is the better source wherever a DOI exists — this is exactly what
            # pubs_import does in its own --orcid path; mirror it rather than inventing one.
            rec = w
            if w.get("doi"):
                enriched = pi.crossref(w["doi"])
                if enriched:
                    rec = enriched
                time.sleep(0.2)                      # be polite to Crossref
            title = (rec.get("title") or "").strip()
            if not title:
                continue
            rtype = rec.get("type") or "article"
            flag = published_version(title) if rtype == "wp" else ""
            rows.append({
                "KEEP": "",
                "THEMES": ",".join(pi.suggest_themes(title, rec.get("venue"))),
                "mid": r["mid"], "member": r["name"],
                "year": rec.get("year") or "",
                "type": rtype, "title": title,
                "venue": rec.get("venue") or "",
                "authors": rec.get("authors") or r["name"],
                "doi": rec.get("doi") or "",
                "published_version": flag,
            })
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
    rows = [r for r in read_csv(REVIEW_CSV)
            if str(r.get("KEEP", "")).strip().lower() in ("x", "y", "yes", "1")]
    check_mids(rows)
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



# ── write iDs back into MEMBERS ─────────────────────────────────────────────
ORCID_RE = re.compile(r"^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$")

# Never write an iD for these, whatever a CSV says. Each was a name-search match that
# turned out to be a DIFFERENT PERSON. The member card renders the iD as a live public
# link, so a wrong one does not merely misattribute a bibliography — it points at a
# stranger's record under a colleague's name.
BLOCKED = {
    "wohlgemuth-michael": "name-matched iD belongs to an open-access researcher at Bielefeld, "
                          "not the ordoliberal economist",
}


def orcid_checksum_ok(oid):
    """ORCID iDs carry a MOD-11-2 check digit. A transposed digit is therefore
    detectable — and a transposed digit yields a live link to somebody else."""
    digits = oid.replace("-", "")
    total = 0
    for ch in digits[:-1]:
        total = (total + int(ch)) * 2
    expected = (12 - total % 11) % 11
    return ("X" if expected == 10 else str(expected)) == digits[-1].upper()


def members(dry_run=False):
    """Write `orcid:` into MEMBERS in agw_data.js from the curated tools/orcid_ids.csv."""
    if not os.path.exists(IDS_CSV):
        sys.exit("No %s. Curate it first (columns: mid,name,orcid)." % IDS_CSV)
    rows = [r for r in read_csv(IDS_CSV) if (r.get("orcid") or "").strip()]
    check_mids(rows)

    # Two members cannot share an iD. A duplicate is not a near-miss, it is a guaranteed
    # misattribution — and it is exactly what a careless copy-paste down a spreadsheet
    # column produces. (This check exists because a test fixture did precisely that.)
    seen = {}
    dupes = []
    for r in rows:
        oid = (r.get("orcid") or "").strip().replace("https://orcid.org/", "").strip("/")
        if oid in seen and seen[oid] != r["mid"]:
            dupes.append((oid, seen[oid], r["mid"]))
        seen.setdefault(oid, r["mid"])
    if dupes:
        for oid, a, b in dupes:
            print("  \u2717 %s is assigned to BOTH %s and %s" % (oid, a, b), file=sys.stderr)
        sys.exit("\nRefusing to write: an ORCID iD identifies one person. Nothing was changed.")

    src = open(pi.DATA_JS, encoding="utf-8").read()
    added, changed, skipped, bad = [], [], [], []

    for r in rows:
        mid = r["mid"].strip()
        oid = r["orcid"].strip().replace("https://orcid.org/", "").strip("/")

        if mid in BLOCKED:
            skipped.append((mid, BLOCKED[mid]))
            continue
        if not ORCID_RE.match(oid):
            bad.append((mid, oid, "malformed \u2014 expected 0000-0000-0000-0000"))
            continue
        if not orcid_checksum_ok(oid):
            bad.append((mid, oid, "CHECKSUM FAILS \u2014 this is a typo, and it would link to "
                                  "someone else's record"))
            continue

        m = re.search(r"^(\s*\{ id:'%s'.*)$" % re.escape(mid), src, re.M)
        if not m:
            bad.append((mid, oid, "mid not found in MEMBERS"))
            continue
        line = m.group(1)

        have = re.search(r"orcid:'([^']*)'", line)
        if have and have.group(1) == oid:
            continue                                    # already correct, nothing to do
        if have:
            new = line.replace("orcid:'%s'" % have.group(1), "orcid:'%s'" % oid)
            changed.append((mid, have.group(1), oid))
        else:
            new = line.replace("emeritus:", "orcid:'%s', emeritus:" % oid, 1)
            added.append((mid, oid))
        src = src.replace(line, new, 1)

    for mid, oid, why in bad:
        print("  \u2717 %-30s %-22s %s" % (mid, oid, why), file=sys.stderr)
    if bad:
        sys.exit("\nRefusing to write: %d bad iD(s) above. Nothing was changed." % len(bad))

    for mid, oid in added:
        print("  + %-30s %s" % (mid, oid))
    for mid, old, oid in changed:
        print("  ~ %-30s %s \u2192 %s" % (mid, old, oid))
    for mid, why in skipped:
        print("  \u2013 %-30s SKIPPED \u2014 %s" % (mid, why))

    if dry_run:
        print("\n--dry-run: agw_data.js NOT written. %d to add, %d to change."
              % (len(added), len(changed)))
        return 0
    if not added and not changed:
        print("Nothing to do \u2014 every iD in the CSV is already in MEMBERS.")
        return 0

    open(pi.DATA_JS, "w", encoding="utf-8").write(src)
    total = len(re.findall(r"orcid:'", src))
    print("\nwrote %s \u2014 %d member(s) now carry an ORCID iD." % (pi.DATA_JS, total))
    print("Now: node --check agw_data.js, then bump the service-worker cache.")
    return 0


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--triage", action="store_true", help="who has no MEMBER_PUBS entry (offline)")
    ap.add_argument("--find", action="store_true",
                    help="search ORCID by NAME for the thin members \u2192 tools/orcid_ids.csv")
    ap.add_argument("--fetch", action="store_true", help="works \u2192 tools/orcid_review.csv")
    ap.add_argument("--emit", action="store_true", help="KEEP rows \u2192 MEMBER_PUBS block")
    ap.add_argument("--members", action="store_true",
                    help="write orcid: into MEMBERS in agw_data.js from tools/orcid_ids.csv")
    ap.add_argument("--dry-run", action="store_true", help="with --members: report, change nothing")
    a = ap.parse_args()

    if a.triage:
        return show_triage()
    if a.find:
        return find()
    if a.fetch:
        return fetch()
    if a.emit:
        return emit()
    if a.members:
        return members(dry_run=a.dry_run)
    ap.print_help()
    return 0


if __name__ == "__main__":
    sys.exit(main())
