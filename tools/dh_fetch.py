#!/usr/bin/env python3
"""dh_fetch.py — save the 43 AGW Tagungsband book pages from the D&H eLibrary.

Fetch only. No parsing: the ToC extraction happens offline (tools/dh_toc.py) so it can be
re-run and corrected without ever touching the publisher again. Book IDs come from the
eLibrary catalogue; all 43 volumes are CC-BY open access.

    python tools\\dh_fetch.py        →  tools/html/book_<id>.html   (43 files)

Polite: 1 request/sec, resumable (skips files already on disk).
"""
import os, sys, time, urllib.request

UA = "agw-vfs/1.0 (https://www.agw-vfs.de; mailto:bieri@vt.edu)"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "html")

BOOKS = [  # (volN, roman, book_id, url)
    (1, 'I', 50440, 'https://elibrary.duncker-humblot.com/book/50440/klassische-themen-der-dogmengeschichte'),
    (2, 'II', 51259, 'https://elibrary.duncker-humblot.com/book/51259/geschichte-merkantilistischer-ideen-und-praktiken'),
    (3, 'III', 47226, 'https://elibrary.duncker-humblot.com/book/47226/bedeutung-und-fortwirkung-der-physiokraten'),
    (4, 'IV', 45074, 'https://elibrary.duncker-humblot.com/book/45074/drei-jubilaumlen-1983-karl-marx-joseph-schumpeter-john-maynard-keynes'),
    (5, 'V', 51388, 'https://elibrary.duncker-humblot.com/book/51388/deutsche-nationaloumlkonomie-zu-beginn-des-19-jahrhunderts'),
    (6, 'VI', 51309, 'https://elibrary.duncker-humblot.com/book/51309/deutsche-nationaloumlkonomie-im-19-jahrhundert'),
    (7, 'VII', 56211, 'https://elibrary.duncker-humblot.com/book/56211/probleme-der-konjunkturtheorie-im-ausgehenden-19-jahrhundert'),
    (8, 'VIII', 56214, 'https://elibrary.duncker-humblot.com/book/56214/deutsche-nationaloumlkonomie-in-der-zwischenkriegszeit'),
    (9, 'IX', 44118, 'https://elibrary.duncker-humblot.com/book/44118/untersuchungen-zu-quesnay-stein-jevons-und-zur-allgemeinen-gleichgewichtstheorie'),
    (10, 'X', 56215, 'https://elibrary.duncker-humblot.com/book/56215/friedrich-list-voraussetzungen-und-folgen'),
    (11, 'XI', 56216, 'https://elibrary.duncker-humblot.com/book/56216/die-darstellung-der-wirtschaft-und-der-wirtschaftswissenschaften-in-der-belletristik'),
    (12, 'XII', 45462, 'https://elibrary.duncker-humblot.com/book/45462/osteuropaumlische-dogmengeschichte'),
    (13, 'XIII', 44574, 'https://elibrary.duncker-humblot.com/book/44574/deutsche-finanzwissenschaft-zwischen-1918-und-1939'),
    (14, 'XIV', 45185, 'https://elibrary.duncker-humblot.com/book/45185/johann-heinrich-von-thuumlnen-als-wirtschaftstheoretiker'),
    (15, 'XV', 44467, 'https://elibrary.duncker-humblot.com/book/44467/studien-zur-entwicklung-der-oumlkonomischen-theorie-xv'),
    (16, 'XVI', 46642, 'https://elibrary.duncker-humblot.com/book/46642/die-umsetzung-wirtschaftspolitischer-grundkonzeptionen-in-die-kontinentaleuropaumlische-praxis-des-19-und-20-jahrhunderts-i-teil'),
    (17, 'XVII', 35847, 'https://elibrary.duncker-humblot.com/book/35847/die-umsetzung-wirtschaftspolitischer-grundkonzeptionen-in-die-kontinentaleuropaumlische-praxis-des-19-und-20-jahrhunderts-ii-teil'),
    (18, 'XVIII', 35737, 'https://elibrary.duncker-humblot.com/book/35737/knut-wicksell-als-oumlkonom'),
    (19, 'XIX', 35501, 'https://elibrary.duncker-humblot.com/book/35501/john-stuart-mill'),
    (20, 'XX', 35540, 'https://elibrary.duncker-humblot.com/book/35540/die-aumlltere-historische-schule-wirtschaftstheoretische-beitraumlge-und-wirtschaftspolitische-vorstellungen'),
    (21, 'XXI', 31777, 'https://elibrary.duncker-humblot.com/book/31777/oumlkonomie-und-religion'),
    (22, 'XXII', 34520, 'https://elibrary.duncker-humblot.com/book/34520/ideen-methoden-und-entwicklungen-der-geschichte-des-oumlkonomischen-denkens'),
    (23, 'XXIII', 31443, 'https://elibrary.duncker-humblot.com/book/31443/oumlkonomie-und-technik'),
    (24, 'XXIV', 31991, 'https://elibrary.duncker-humblot.com/book/31991/wechselseitige-einfluumlsse-zwischen-dem-deutschen-wirtschaftswissenschaftlichen-denken-und-dem-anderer-europaumlischer-sprachraumlume'),
    (25, 'XXV', 32017, 'https://elibrary.duncker-humblot.com/book/32017/die-deutschsprachige-wirtschaftswissenschaft-in-den-ersten-jahrzehnten-nach-1945'),
    (26, 'XXVI', 32200, 'https://elibrary.duncker-humblot.com/book/32200/wissen-the-knowledge-economy'),
    (27, 'XXVII', 33023, 'https://elibrary.duncker-humblot.com/book/33023/der-einfluss-deutschsprachigen-wirtschaftswissenschaftlichen-denkens-in-japan'),
    (28, 'XXVIII', 34731, 'https://elibrary.duncker-humblot.com/book/34731/die-oumlkonomik-im-spannungsfeld-zwischen-natur-und-geisteswissenschaften'),
    (29, 'XXIX', 35231, 'https://elibrary.duncker-humblot.com/book/35231/die-entwicklung-der-raumwirtschaftslehre-von-ihren-anfaumlngen-bis-in-die-gegenwart'),
    (30, 'XXX', 36139, 'https://elibrary.duncker-humblot.com/book/36139/die-zeit-um-den-ersten-weltkrieg-als-krisenzeit-der-oumlkonomen'),
    (31, 'XXXI', 36391, 'https://elibrary.duncker-humblot.com/book/36391/geschichte-der-entwicklungstheorien'),
    (32, 'XXXII', 36913, 'https://elibrary.duncker-humblot.com/book/36913/german-influences-on-american-economic-thought-and-american-influences-on-german-economic-thought'),
    (33, 'XXXIII', 37778, 'https://elibrary.duncker-humblot.com/book/37778/kontinuitaumlt-und-wandel-in-der-institutionenoumlkonomie'),
    (34, 'XXXIV', 51639, 'https://elibrary.duncker-humblot.com/book/51639/neue-perspektiven-auf-die-politische-oumlkonomie-von-karl-marx-und-friedrich-engels'),
    (35, 'XXXV', 52868, 'https://elibrary.duncker-humblot.com/book/52868/macht-oder-oumlkonomisches-gesetz'),
    (36, 'XXXVI', 53787, 'https://elibrary.duncker-humblot.com/book/53787/oumlkonomie-und-evolution'),
    (37, 'XXXVII', 53933, 'https://elibrary.duncker-humblot.com/book/53933/einkommens-und-vermoumlgensverteilung-in-historischer-sicht'),
    (38, 'XXXVIII', 55211, 'https://elibrary.duncker-humblot.com/book/55211/stagnations-und-deflationstheorien'),
    (39, 'XXXIX', 56244, 'https://elibrary.duncker-humblot.com/book/56244/kameralismus-und-merkantilismus'),
    (40, 'XL', 58605, 'https://elibrary.duncker-humblot.com/book/58605/entwicklung-der-konjunkturforschung-im-fruumlhen-20-jahrhundert'),
    (41, 'XLI', 63036, 'https://elibrary.duncker-humblot.com/book/63036/zur-geschichte-des-vereins-fuumlr-socialpolitik'),
    (42, 'XLII', 63382, 'https://elibrary.duncker-humblot.com/book/63382/adam-smith-at-300'),
    (43, 'XLIII', 63943, 'https://elibrary.duncker-humblot.com/book/63943/oumlkonominnen-frauen-in-der-geschichte-der-wirtschaftswissenschaften'),
]


def main():
    os.makedirs(OUT, exist_ok=True)
    got = 0
    for n, roman, bid, url in BOOKS:
        dest = os.path.join(OUT, "book_%d.html" % bid)
        if os.path.exists(dest):
            got += 1
            continue
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                html = r.read().decode("utf-8", "replace")
        except Exception as e:
            print("  ! %-6s vol %-2d  %s" % (roman, n, e))
            continue
        open(dest, "w", encoding="utf-8").write(html)
        got += 1
        print("  %-6s vol %-2d  book %-6d  %d KB" % (roman, n, bid, len(html) // 1024))
        time.sleep(1)
    print("\n%d/43 pages in %s" % (got, OUT))
    return 0 if got == 43 else 1


if __name__ == "__main__":
    sys.exit(main())
