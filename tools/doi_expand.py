#!/usr/bin/env python3
"""
doi_expand.py — Fetch clean publication metadata for the Members' Publications page.

This is a *maintainer* tool. It runs on your machine (or the Manus sandbox),
NOT on the live website. It turns a DOI — or a whole ORCID profile — into
ready-to-paste JavaScript objects for `agw_member_pubs.js`.

Why ORCID and not Google Scholar?
  Google Scholar has no official API; importing from it means scraping, which
  violates Google's terms, triggers CAPTCHAs, and breaks without warning.
  ORCID and Crossref are free, official, stable, and require no API key.

────────────────────────────────────────────────────────────────────────────
USAGE
  # 1) Expand one or more DOIs into pub objects:
  python3 tools/doi_expand.py 10.1215/00182702-26-2-327 10.1111/meca.12018

  # 2) Import every work from an ORCID profile (then tick/untick by hand):
  python3 tools/doi_expand.py --orcid 0000-0002-1825-0097 --member "Jane Doe"

  # 3) Add a member name and theme id to each printed object:
  python3 tools/doi_expand.py 10.1111/meca.12018 --member "Jochen Hartwig" --theme keynesian

Output is printed to stdout — copy the objects into the MEMBER_PUBS array.
────────────────────────────────────────────────────────────────────────────
"""

import argparse
import json
import re
import sys
import urllib.request
import urllib.error

CROSSREF = "https://api.crossref.org/works/{doi}"
ORCID_WORKS = "https://pub.orcid.org/v3.0/{orcid}/works"
ORCID_DETAIL = "https://pub.orcid.org/v3.0/{orcid}/work/{put_code}"

UA = "AGW-MemberPubs/1.0 (mailto:bieri@vt.edu)"  # polite identification


def _get_json(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode("utf-8"))


def _strip_html(s):
    """Crossref titles may carry inline markup like <i>…</i> or <sub>…</sub>."""
    if not s:
        return s
    return re.sub(r"<[^>]+>", "", s)


def _js_escape(s):
    if s is None:
        return ""
    s = _strip_html(str(s))
    return s.replace("\\", "\\\\").replace("'", "\\'").replace("\n", " ").strip()


def _authors_from_crossref(msg):
    names = []
    for a in msg.get("author", []) or []:
        given = a.get("given", "")
        family = a.get("family", "")
        full = (given + " " + family).strip() or a.get("name", "")
        if full:
            names.append(full)
    return " · ".join(names)


def _venue_from_crossref(msg):
    ct = msg.get("container-title") or []
    if ct:
        return ct[0]
    # books: publisher
    return msg.get("publisher", "")


def _year_from_crossref(msg):
    for k in ("published-print", "published-online", "issued", "created"):
        dp = (msg.get(k) or {}).get("date-parts") or []
        if dp and dp[0] and dp[0][0]:
            return dp[0][0]
    return None


def fetch_doi(doi, member=None, theme=None):
    doi = doi.strip().replace("https://doi.org/", "").replace("http://doi.org/", "")
    try:
        data = _get_json(CROSSREF.format(doi=urllib.parse.quote(doi)))
    except urllib.error.HTTPError as e:
        return {"_error": f"Crossref HTTP {e.code} for DOI {doi}"}
    except Exception as e:
        return {"_error": f"Could not fetch DOI {doi}: {e}"}
    msg = data.get("message", {})
    title = (msg.get("title") or [""])[0]
    return {
        "member": member or "TODO_MEMBER_NAME",
        "themes": [theme] if theme else ["general"],
        "title": title,
        "authors": _authors_from_crossref(msg),
        "venue": _venue_from_crossref(msg),
        "year": _year_from_crossref(msg),
        "doi": doi,
    }


def fetch_orcid(orcid, member=None, theme=None, limit=200):
    orcid = orcid.strip()
    try:
        summary = _get_json(ORCID_WORKS.format(orcid=orcid))
    except Exception as e:
        return [{"_error": f"Could not fetch ORCID {orcid}: {e}"}]
    out = []
    groups = summary.get("group", [])[:limit]
    for g in groups:
        ws = g.get("work-summary", [])
        if not ws:
            continue
        w = ws[0]
        title = ((w.get("title") or {}).get("title") or {}).get("value", "")
        year = ((w.get("publication-date") or {}).get("year") or {}).get("value")
        venue = (w.get("journal-title") or {}).get("value", "")
        doi = ""
        for eid in ((w.get("external-ids") or {}).get("external-id") or []):
            if eid.get("external-id-type") == "doi":
                doi = eid.get("external-id-value", "")
                break
        rec = {
            "member": member or "TODO_MEMBER_NAME",
            "themes": [theme] if theme else ["general"],
            "title": title,
            "authors": member or "",
            "venue": venue,
            "year": int(year) if year and str(year).isdigit() else None,
        }
        if doi:
            rec["doi"] = doi
        out.append(rec)
    return out


def to_js(rec):
    if "_error" in rec:
        return "  // ⚠ " + rec["_error"]
    themes = ", ".join("'%s'" % t for t in rec.get("themes", []))
    lines = ["  { member:'%s', themes:[%s]," % (_js_escape(rec["member"]), themes)]
    lines.append("    title:'%s'," % _js_escape(rec["title"]))
    if rec.get("authors"):
        lines.append("    authors:'%s'," % _js_escape(rec["authors"]))
    venue = "    venue:'%s'" % _js_escape(rec.get("venue", ""))
    year = (", year:%d" % rec["year"]) if rec.get("year") else ""
    if rec.get("doi"):
        lines.append(venue + year + ",")
        lines.append("    doi:'%s' }," % _js_escape(rec["doi"]))
    else:
        lines.append(venue + year + " },")
    return "\n".join(lines)


def main():
    ap = argparse.ArgumentParser(description="Expand DOIs / ORCID into MEMBER_PUBS objects.")
    ap.add_argument("dois", nargs="*", help="One or more DOIs")
    ap.add_argument("--orcid", help="ORCID iD (e.g. 0000-0002-1825-0097)")
    ap.add_argument("--member", help="Member name to set on each record")
    ap.add_argument("--theme", help="Theme id to set on each record (see PUB_THEMES)")
    args = ap.parse_args()

    if not args.dois and not args.orcid:
        ap.print_help()
        sys.exit(1)

    print("// ── Paste the objects below into MEMBER_PUBS in agw_member_pubs.js ──")
    print("// Review each one: set the correct `member`, adjust `themes`, verify metadata.\n")

    if args.orcid:
        for rec in fetch_orcid(args.orcid, args.member, args.theme):
            print(to_js(rec))
    for doi in args.dois:
        print(to_js(fetch_doi(doi, args.member, args.theme)))


if __name__ == "__main__":
    import urllib.parse  # noqa: E402 (used in fetch_doi)
    main()
