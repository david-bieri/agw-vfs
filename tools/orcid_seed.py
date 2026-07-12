#!/usr/bin/env python3
"""orcid_seed.py — seed MEMBER_PUBS from ORCID for the members who have nothing yet.

Three steps, each stopping for a human. Nothing is written to the site automatically,
because every failure mode here is a failure mode with a colleague's name on it.

    python tools\\orcid_seed.py --find
        Who has no MEMBER_PUBS entry? Searches ORCID by name, prints candidate iDs with
        their affiliations, and writes tools/orcid_ids.csv. YOU then delete the wrong
        rows and keep the right one per member. ORCID name search returns homonyms —
        "Helmut Wagner" is several people — so nothing is auto-accepted.

    python tools\\orcid_seed.py --fetch
        Reads the confirmed tools/orcid_ids.csv, pulls each iD's works, enriches DOIs via
        Crossref (type / venue / authors / year), and writes tools/orcid_review.csv with an
        empty KEEP column. Flags any preprint/working paper that appears to have a
        published version (see WHY below).

    python tools\\orcid_seed.py --emit
        Reads tools/orcid_review.csv, takes the rows you marked KEEP=x, and prints a
        MEMBER_PUBS block to stdout. Paste it into agw_member_pubs.js.

WHY THE WORKING-PAPER CHECK EXISTS
    A bibliography freezes an item at the moment it was entered. Working papers get
    published; the record does not notice. Of four WPs checked by hand in July 2026,
    THREE had been published — one under a changed title ("Ludwig von Mises and the
    Ordo-interventionists" became "Paleo- and Neoliberals: ..."). Listing a colleague's
    2016 working paper six years after it appeared in a Springer volume is a small,
    entirely avoidable embarrassment. So: for every preprint, this queries Crossref by
    title and flags near matches that have a journal or book container.

WHAT ORCID WILL NOT GIVE YOU
    ORCID systematically misses German-language book chapters. On the maintainer's own
    record, 9 of 15 items were absent — including both Lösch chapters in the AGW
    Tagungsbände. So an empty or thin ORCID result is NOT evidence that a member has
    published little. It is evidence that ORCID has poor coverage of this literature.
    Where ORCID comes back empty, the answer is to ask the member, not to conclude.

    This is also why the AGW chapters are the SPINE of a member's record and ORCID is
    only a supplement: our own Tagungsband corpus is complete where ORCID is not.

NO API KEY NEEDED — the ORCID public API and Crossref are both open. Be polite: this
sleeps between requests and caches every response under tools/.cache_orcid/.
"""

import argparse
import csv
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
DATA_JS = os.path.join(REPO, "agw_data.js")
PUBS_JS = os.path.join(REPO, "agw_member_pubs.js")
CHAPS_JS = os.path.join(REPO, "agw_volume_chapters.js")

IDS_CSV = os.path.join(HERE, "orcid_ids.csv")
REVIEW_CSV = os.path.join(HERE, "orcid_review.csv")
CACHE = os.path.join(HERE, ".cache_orcid")

MAILTO = "bieri@vt.edu"
UA = "agw-vfs/1.0 (https://www.agw-vfs.de; mailto:%s)" % MAILTO

ORCID_SEARCH = ("https://pub.orcid.org/v3.0/expanded-search/"
                "?q=given-names:%s+AND+family-name:%s&rows=8")
ORCID_WORKS = "https://pub.orcid.org/v3.0/%s/works"
CROSSREF_DOI = "https://api.crossref.org/works/%s?mailto=" + MAILTO
CROSSREF_TITLE = ("https://api.crossref.org/works?query.bibliographic=%s"
                  "&rows=3&select=DOI,title,type,container-title,published"
                  "&mailto=" + MAILTO)

# ORCID work types -> our MEMBER_PUBS `type` vocabulary (mpub_type_* strings exist for
# exactly these five; anything else must be mapped, not invented).
TYPE_MAP = {
    "journal-article": "article", "book": "book", "book-chapter": "chapter",
    "edited-book": "edited", "working-paper": "wp", "preprint": "wp",
    "report": "wp", "conference-paper": "chapter", "book-review": "article",
}
PREPRINTISH = {"wp"}


# ── plumbing ────────────────────────────────────────────────────────────────
def get(url, key, tries=2):
    os.makedirs(CACHE, exist_ok=True)
    path = os.path.join(CACHE, re.sub(r"[^\w.-]", "_", key)[:120] + ".json")
    if os.path.exists(path):
        try:
            return json.load(open(path, encoding="utf-8"))
        except ValueError:
            pass
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json"})
    for _ in range(tries):
        try:
            with urllib.request.urlopen(req, timeout=45) as r:
                data = json.loads(r.read().decode("utf-8"))
            json.dump(data, open(path, "w", encoding="utf-8"), ensure_ascii=False)
            time.sleep(1)                     # polite: ~1 request/second
            return data
        except (urllib.error.HTTPError, urllib.error.URLError, ValueError):
            time.sleep(2)
    return None


def read_array(path, name):
    """Pull a JS array out of a data file without executing it."""
    src = open(path, encoding="utf-8").read()
    m = re.search(r"%s\s*=\s*\[(.*?)\n\s*\];" % name, src, re.S)
    return m.group(1) if m else ""


def members():
    blk = read_array(DATA_JS, "const MEMBERS")
    return [{"mid": mid, "name": name}
            for mid, name in re.findall(r"\{ id:'([^']+)', name:'([^']+)'", blk)]


def members_without_pubs():
    have = set(re.findall(r"mid:'([^']+)'", read_array(PUBS_JS, "MEMBER_PUBS")))
    chaps = read_array(CHAPS_JS, "const VOLUME_CHAPTERS") if os.path.exists(CHAPS_JS) else ""
    nchap = {}
    for mids in re.findall(r"mids:\[([^\]]*)\]", chaps):
        for mid in re.findall(r"'([^']+)'", mids):
            nchap[mid] = nchap.get(mid, 0) + 1
    out = []
    for m in members():
        if m["mid"] not in have:
            m["chapters"] = nchap.get(m["mid"], 0)
            out.append(m)
    return out


def split_name(name):
    parts = name.split()
    PART = {"von", "van", "de", "der", "zu", "zur", "den", "ter"}
    i = len(parts) - 1
    while i > 1 and parts[i - 1].lower() in PART:
        i -= 1
    return " ".join(parts[:i]), " ".join(parts[i:])     # (given, family)


# ── step 1: find candidate iDs ──────────────────────────────────────────────
def find():
    todo = members_without_pubs()
    print("%d members have no MEMBER_PUBS entry.\n" % len(todo))
    rows = []
    for m in todo:
        given, family = split_name(m["name"])
        url = ORCID_SEARCH % (urllib.parse.quote(given), urllib.parse.quote(family))
        data = get(url, "search_" + m["mid"])
        hits = (data or {}).get("expanded-result") or []
        print("%-30s %-28s %d candidate(s)" % (m["name"], "(%d chapters)" % m["chapters"], len(hits)))
        if not hits:
            rows.append({"mid": m["mid"], "name": m["name"], "orcid": "",
                         "cand_name": "", "affiliation": "", "note": "NO ORCID HIT — ask the member"})
        for h in hits:
            inst = "; ".join((h.get("institution-name") or [])[:2])
            cand = "%s %s" % (h.get("given-names") or "", h.get("family-names") or "")
            print("    %-20s %-28s %s" % (h.get("orcid-id"), cand.strip()[:28], inst[:44]))
            rows.append({"mid": m["mid"], "name": m["name"], "orcid": h.get("orcid-id"),
                         "cand_name": cand.strip(), "affiliation": inst, "note": ""})
    with open(IDS_CSV, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["mid", "name", "orcid", "cand_name", "affiliation", "note"])
        w.writeheader()
        w.writerows(rows)
    print("\nwrote %s" % IDS_CSV)
    print("NOW: open it, delete the wrong rows, keep AT MOST ONE per member.")
    print("     ORCID name search returns homonyms. Check the affiliation column.")
    return 0


# ── step 2: fetch works ─────────────────────────────────────────────────────
def published_version(title):
    """Does a preprint have a published version? Returns a hint string, or ''."""
    q = urllib.parse.quote(re.sub(r"\s+", " ", title)[:120])
    data = get(CROSSREF_TITLE % q, "cr_title_" + title[:60])
    for it in ((data or {}).get("message") or {}).get("items", []):
        t = (it.get("title") or [""])[0]
        if not t:
            continue
        # crude but adequate: same opening words, and it has a real container
        a = re.sub(r"\W+", " ", t.lower()).split()[:6]
        b = re.sub(r"\W+", " ", title.lower()).split()[:6]
        cont = (it.get("container-title") or [""])[0]
        if a and a == b and it.get("type") in ("journal-article", "book-chapter") and cont:
            return "PUBLISHED? %s (%s) doi:%s" % (cont[:40], it.get("type"), it.get("DOI"))
    return ""


def fetch():
    if not os.path.exists(IDS_CSV):
        sys.exit("Run --find first, then curate %s." % IDS_CSV)
    ids = [r for r in csv.DictReader(open(IDS_CSV, encoding="utf-8-sig")) if r.get("orcid")]
    seen = {}
    for r in ids:
        seen.setdefault(r["mid"], []).append(r)
    dupes = [k for k, v in seen.items() if len(v) > 1]
    if dupes:
        sys.exit("More than one ORCID kept for: %s — pick one per member." % ", ".join(dupes))

    rows = []
    for r in ids:
        data = get(ORCID_WORKS % r["orcid"], "works_" + r["orcid"])
        groups = (data or {}).get("group") or []
        print("%-30s %s  %d works" % (r["name"], r["orcid"], len(groups)))
        for g in groups:
            s = (g.get("work-summary") or [{}])[0]
            title = (((s.get("title") or {}).get("title") or {}).get("value") or "").strip()
            if not title:
                continue
            year = (((s.get("publication-date") or {}).get("year") or {}).get("value") or "")
            wtype = TYPE_MAP.get((s.get("type") or "").lower().replace("_", "-"), "")
            doi = ""
            for eid in ((s.get("external-ids") or {}).get("external-id") or []):
                if (eid.get("external-id-type") or "").lower() == "doi":
                    doi = (eid.get("external-id-value") or "").strip()
                    break
            venue = (s.get("journal-title") or {}).get("value") or ""
            authors = ""
            # Crossref is the better source for venue/authors/type when we have a DOI
            if doi:
                cr = get(CROSSREF_DOI % urllib.parse.quote(doi), "cr_" + doi)
                msg = (cr or {}).get("message") or {}
                if msg:
                    venue = (msg.get("container-title") or [venue])[0] or venue
                    wtype = TYPE_MAP.get(msg.get("type", ""), wtype)
                    au = msg.get("author") or []
                    authors = " \u00b7 ".join(
                        ("%s %s" % (a.get("given", ""), a.get("family", ""))).strip()
                        for a in au[:4] if a.get("family"))
                    if len(au) > 4:
                        authors += " et al."
            flag = published_version(title) if wtype in PREPRINTISH else ""
            rows.append({"KEEP": "", "THEMES": "", "mid": r["mid"], "member": r["name"],
                         "year": year, "type": wtype or "article", "title": title,
                         "venue": venue, "authors": authors or r["name"], "doi": doi,
                         "flag": flag})
    rows.sort(key=lambda x: (x["member"], -int(x["year"] or 0)))
    with open(REVIEW_CSV, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["KEEP", "THEMES", "mid", "member", "year", "type",
                                          "title", "venue", "authors", "doi", "flag"])
        w.writeheader()
        w.writerows(rows)
    flagged = sum(1 for r in rows if r["flag"])
    print("\nwrote %s  (%d candidates, %d preprints look PUBLISHED — check the flag column)"
          % (REVIEW_CSV, len(rows), flagged))
    print("NOW: mark KEEP=x on 2-3 per member and fill THEMES (ids from PUB_THEMES).")
    return 0


# ── step 3: emit ────────────────────────────────────────────────────────────
def emit():
    if not os.path.exists(REVIEW_CSV):
        sys.exit("Run --fetch first.")
    rows = [r for r in csv.DictReader(open(REVIEW_CSV, encoding="utf-8-sig"))
            if str(r.get("KEEP", "")).strip().lower() in ("x", "y", "yes", "1")]
    if not rows:
        sys.exit("Nothing marked KEEP in %s." % REVIEW_CSV)

    themes = set(re.findall(r"\{\s*id:'([^']+)',\s*order:", open(PUBS_JS, encoding="utf-8").read()))
    bad = {t for r in rows for t in re.split(r"[,\s]+", r["THEMES"]) if t and t not in themes}
    if bad:
        sys.exit("Unknown theme id(s): %s\nValid: %s" % (", ".join(bad), ", ".join(sorted(themes))))

    def js(s):
        return "'" + str(s or "").replace("\\", "\\\\").replace("'", "\\'") + "'"

    out = []
    for member in sorted({r["member"] for r in rows}):
        out.append("")
        out.append("    // \u2500\u2500 %s \u2500\u2500" % member)
        for r in [x for x in rows if x["member"] == member]:
            ts = [t for t in re.split(r"[,\s]+", r["THEMES"]) if t]
            out.append("    { mid:%s, themes:[%s]," % (js(r["mid"]), ",".join(js(t) for t in ts)))
            out.append("      title:%s, type:%s," % (js(r["title"]), js(r["type"])))
            tail = "      authors:%s, venue:%s, year:%s" % (js(r["authors"]), js(r["venue"]), r["year"])
            out.append(tail + (",\n      doi:%s }," % js(r["doi"]) if r["doi"] else " },"))
    print("\n".join(out))
    print("\n/* %d entries for %d members — paste into MEMBER_PUBS in agw_member_pubs.js,\n"
          "   then: node --check agw_member_pubs.js  and bump the service worker. */"
          % (len(rows), len({r["member"] for r in rows})), file=sys.stderr)
    return 0


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--find", action="store_true", help="step 1: candidate ORCID iDs")
    ap.add_argument("--fetch", action="store_true", help="step 2: works -> review CSV")
    ap.add_argument("--emit", action="store_true", help="step 3: KEEP rows -> MEMBER_PUBS block")
    a = ap.parse_args()
    if a.find:
        return find()
    if a.fetch:
        return fetch()
    if a.emit:
        return emit()
    ap.print_help()
    return 0


if __name__ == "__main__":
    sys.exit(main())
