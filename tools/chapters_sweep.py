#!/usr/bin/env python3
"""chapters_sweep.py — pull every AGW Tagungsband chapter Crossref holds, in one sweep.

Why a sweep and not per-volume lookups: asking Crossref volume-by-volume, keyed on
the electronic ISBN that EconStor reports, found 57 chapters. Asking the series as a
whole finds 476. D&H evidently deposited chapters under a mix of print and electronic
ISBNs, so the e-ISBN key hits only where the two happen to coincide. The sweep sidesteps
the key problem entirely: take everything, then bucket it by ISBN afterwards.

    python tools\\chapters_sweep.py

Writes tools/chapters_raw.json (the raw Crossref items, unfiltered — bucketing and
volume-mapping happen downstream, where they can be inspected).

Note this is a RELEVANCE query on the container title, not a strict filter, so it may
over-collect: other Duncker & Humblot series can score well on it. That is deliberate —
over-collect here, filter visibly downstream. Anything that cannot be matched to one of
the 43 known volumes gets reported, never silently kept and never silently dropped.
"""

import json
import sys
import time
import urllib.parse
import urllib.request

MAILTO = "bieri@vt.edu"
UA = "agw-vfs-chapters/1.0 (https://www.agw-vfs.de; mailto:%s)" % MAILTO
OUT = "tools/chapters_raw.json"

BASE = ("https://api.crossref.org/works"
        "?filter=prefix:10.3790,type:book-chapter"
        "&query.container-title=Studien+zur+Entwicklung+der+oekonomischen+Theorie"
        "&select=DOI,title,author,page,ISBN,container-title,published"
        "&rows=200&mailto=" + MAILTO + "&cursor=")


def main():
    cursor, items, total = "*", [], None
    while True:
        req = urllib.request.Request(BASE + urllib.parse.quote(cursor),
                                     headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=60) as r:
            msg = json.load(r)["message"]
        got = msg.get("items") or []
        total = msg.get("total-results")
        items.extend(got)
        print("  %d of %s" % (len(items), total))
        if not got:
            break
        cursor = msg.get("next-cursor")
        if not cursor:
            break
        time.sleep(1)                      # polite: 1 request/sec

    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(items, f, ensure_ascii=False)
    print("\nwrote %s  (%d items, Crossref reported %s)" % (OUT, len(items), total))
    if total and len(items) < total:
        print("  ! fewer than reported — paging stopped early, worth a re-run")
    return 0


if __name__ == "__main__":
    sys.exit(main())
