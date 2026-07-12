#!/usr/bin/env python3
"""dh_toc.py — build the AGW Tagungsband chapter corpus from two independent sources.

  tools/html/book_*.html   D&H eLibrary ToC   → printed page numbers, hierarchy
  tools/pdf_toc.json       PDF outlines       → independent witness to the structure

Neither source alone is trustworthy. The eLibrary ToC nests contributions under part
headings in some volumes, and a naive "shallowest authored row" reading silently loses
every chapter underneath one (vol. XI: seven chapters vanish behind "Erster Teil"). The
PDF outline has the same hierarchy but no printed page numbers. So: take structure from
both, pages from the HTML, and REPORT every case where the two disagree instead of
quietly picking one.

THE DISCRIMINATOR that makes this work — a heading with children is either

  a PART HEADING   its children are authored          ("Bertram Schefold: Spiegelungen…")
                   → the heading is not a chapter; its children are.

  a LONG CHAPTER   its children are numbered sections ("I. Allerhand Vor-Urteile")
                   → the heading IS the chapter; its children are internal.

Both look identical at the row level, which is why a depth heuristic cannot tell them
apart. Vol. XI is the first kind. Heinz Rieter's 245-page bibliography in vol. XXII is
the second kind — and it is a real chapter, not an extraction failure. Do not "fix" it.

    python tools\\dh_toc.py --report            # coverage + every disagreement, no output file
    python tools\\dh_toc.py --build > agw_volume_chapters.js
"""

import argparse
import csv
import json
import os
import re
import sys
from html.parser import HTMLParser

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import pubs_import as pi  # noqa: E402  — ascii_fold, js_str, suggest_themes, the mid matcher

REPO = os.path.dirname(HERE)
DATA_JS = os.path.join(REPO, "agw_data.js")
HTML_DIR = os.path.join(HERE, "html")
PDF_TOC = os.path.join(HERE, "pdf_toc.json")

# book_id → volume number. From the eLibrary catalogue (Schriften des VfS, 115/I–115/XLIII).
BOOKS = {}   # filled by load_books() from the HTML filenames + the volume line in each page

ROMAN = {"I": 1, "V": 5, "X": 10, "L": 50}

FRONT = re.compile(
    r"^(vorwort|geleitwort|vorbemerkung|inhalt|inhaltsverzeichnis|inhaltsübersicht|"
    r"titelei|impressum|autoren|autorenverzeichnis|verzeichnis der autoren|"
    r"mitarbeiterverzeichnis|personenregister|sachregister|namenregister|register|"
    r"literaturverzeichnis|abkürzungsverzeichnis|abbildungsverzeichnis|"
    r"tabellenverzeichnis|backmatter|frontmatter)\b", re.I)

# "I." "II." "1." "A." "a)" "Anhang" "Literatur" — an internal section of a chapter,
# never a contribution in its own right.
INTERNAL = re.compile(
    r"^\s*(\d+[.)]|[IVXLC]+[.)]|[A-Za-z][.)]\s|anhang|literatur|summary|zusammenfassung|"
    r"schlußbemerkung|schlussbemerkung|einleitung\b|fazit|ausblick|anmerkungen)", re.I)

# "Erster Teil:" / "Zweiter Teil" / "Teil I" / "Abschnitt" / "Sektion" — a part heading.
PART = re.compile(
    r"^\s*(erster|zweiter|dritter|vierter|fünfter|sechster|"
    r"i{1,3}v?|iv|v|vi{0,3})?\s*(teil|abschnitt|sektion|kapitel|part)\b", re.I)

# "Vorname Nachname: Titel" — the authored-contribution form. The author side must look
# like a person: no digits, no roman-numeral prefix, at most a few words.
AUTHORED = re.compile(r"^([^:]{3,90}?):\s+(.{5,})$", re.S)


def looks_like_person(s):
    s = s.strip()
    if not s or any(ch.isdigit() for ch in s):
        return False
    if PART.match(s) or INTERNAL.match(s) or FRONT.match(s):
        return False
    # strip the common "unter Mitarbeit von …" tail before counting words
    if re.search(r"[\u201e\u201c\u201d\u00ab\u00bb\"]", s):
        return False                      # a quoted phrase is a title, not a person
    core = re.split(r",?\s+unter\s+Mitarbeit", s)[0]
    words = core.replace(" und ", " ").replace("/", " ").split()
    if not (1 < len(words) <= 8):
        return False
    PARTICLE = {"von", "van", "de", "der", "den", "du", "zu", "ter", "dos", "di", "le", "la"}
    for w in words:
        if w.lower().strip(".,") in PARTICLE:
            continue
        if not w[:1].isupper():
            return False                  # 'Wicksells "neue Krisentheorie"' dies here
    return sum(1 for w in words if w[:1].isupper()) >= 2


# ── HTML ToC ────────────────────────────────────────────────────────────────
class TocParser(HTMLParser):
    """Flat [(level, title, printed_page)] from table#toc."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.rows, self.in_toc = [], False
        self.lvl = self.cell = self.href = None
        self.buf, self.pending = [], None

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "table" and a.get("id") == "toc":
            self.in_toc = True
        if not self.in_toc:
            return
        cls = a.get("class", "")
        if tag == "th" and "toc-level-" in cls:
            m = re.search(r"toc-level-(\d+)", cls)
            self.lvl, self.cell, self.buf, self.href = int(m.group(1)), "title", [], None
        elif tag == "td" and "count" in cls:
            self.cell, self.buf = "count", []
        elif tag == "a" and self.cell == "title" and not self.href:
            self.href = a.get("href")          # deep link to the chapter in the reader

    def handle_data(self, data):
        if self.in_toc and self.cell:
            self.buf.append(data)

    def handle_endtag(self, tag):
        if tag == "table" and self.in_toc:
            self.in_toc = False
        if not self.in_toc:
            return
        if tag == "th" and self.cell == "title":
            self.pending = (self.lvl, re.sub(r"\s+", " ", "".join(self.buf)).strip(), self.href)
            self.cell = None
        elif tag == "td" and self.cell == "count":
            txt = "".join(self.buf).strip()
            if self.pending:
                pg = int(re.sub(r"\D", "", txt)) if re.search(r"\d", txt) else None
                self.rows.append((self.pending[0], self.pending[1], pg, self.pending[2]))
                self.pending = None
            self.cell = None


def html_rows(path):
    """[(level, title, printed_page, href)] — href is the eLibrary deep link."""
    p = TocParser()
    p.feed(open(path, encoding="utf-8").read())
    return [r for r in p.rows if r[1]]


def volume_of(path):
    """Roman numeral + volN from the page's 'Vol. 115/XXIII' series line."""
    h = open(path, encoding="utf-8").read()
    m = re.search(r"115\s*/\s*([IVXLC]+)", h)
    if not m:
        return None, None
    r = m.group(1)
    tot = prev = 0
    for c in reversed(r.upper()):
        v = ROMAN[c]
        tot += -v if v < prev else v
        prev = max(prev, v)
    return r, tot


def title_of(path):
    h = open(path, encoding="utf-8").read()
    m = re.search(r'<meta name="citation_title" content="([^"]+)"', h)
    return m.group(1).strip() if m else ""



# ── volume metadata, from the publisher's own citation block ────────────────
# Each eLibrary book page renders an APA/MLA/Harvard citation. That block is the
# ONLY reliable source for the volume's imprint year and editors:
#   - PUBLICATIONS in agw_data.js has year:null for 31 of 43 volumes.
#   - <meta citation_publication_date> is the E-EDITION date, not the print year
#     (Band X reports 2021, Band XX reports 2015 — both are digitisation dates).
#   - The PDF filenames carry stale band numbers, so their year prefixes are unsafe.
# The citation block says "Neumark, F. (Ed.) (1981)." — publisher-supplied, correct.
APA = re.compile(r"Style\s+APA\s+MLA\s+Harvard\s+(.{20,900}?)\s+Duncker\s*&(?:amp;)?\s*Humblot", re.S)


def volume_meta(path):
    h = open(path, encoding="utf-8").read()
    txt = re.sub(r"<script.*?</script>|<style.*?</style>", " ", h, flags=re.S)
    txt = re.sub(r"<[^>]+>", " ", txt)
    txt = re.sub(r"\s+", " ", txt)
    m = APA.search(txt)
    year, editors = None, ""
    if m:
        cite = m.group(1)
        y = re.search(r"\((\d{4})\)\.", cite)
        e = re.match(r"(.*?)\s*\(Eds?\.\)\s*\(\d{4}\)", cite)
        year = int(y.group(1)) if y else None
        editors = e.group(1).strip() if e else ""
    def meta(k):
        x = re.search(r'citation_%s" content="([^"]*)"' % k, h)
        return x.group(1) if x else ""
    return {"year": year, "editors": editors, "isbn": meta("isbn"), "doi": meta("doi")}


# ── the hierarchy rule ──────────────────────────────────────────────────────
def contributions(rows):
    """Flat rows → the authored contributions, descending through part headings.

    A node's children are the rows following it with a strictly greater level, up to
    the next row at its own level or shallower. If ANY child is authored, the node is a
    part heading and we recurse into it. Otherwise the node stands on its own — and if
    it is itself authored, it is a chapter."""
    out = []

    def walk(i, end, depth):
        while i < end:
            lvl, title, pg = rows[i][0], rows[i][1], rows[i][2]
            href = rows[i][3] if len(rows[i]) > 3 else None
            j = i + 1
            while j < end and rows[j][0] > lvl:
                j += 1                                  # j = end of this node's subtree
            kids = rows[i + 1:j]
            kids_authored = any(
                AUTHORED.match(k[1]) and looks_like_person(AUTHORED.match(k[1]).group(1))
                for k in kids)

            if kids_authored and depth < 4:
                walk(i + 1, j, depth + 1)               # PART heading → its children are the work
            elif FRONT.match(title) or INTERNAL.match(title):
                pass                                    # front matter / internal section
            else:
                m = AUTHORED.match(title)
                if m and looks_like_person(m.group(1)):
                    out.append({"authors": m.group(1).strip(),
                                "title": m.group(2).strip(), "page": pg, "url": href})
                else:
                    m2 = re.match(r"^(.{5,}?)\.\s+(?:Von|By)\s+(.{3,60})$", title)
                    if m2:                              # "Titel. Von Autor"
                        out.append({"authors": m2.group(2).strip(),
                                    "title": m2.group(1).strip(), "page": pg, "url": href})
            i = j

    walk(0, len(rows), 0)
    return out


def page_ranges(chs, rows, last_page):
    """End page = the page before the next CONTRIBUTION or front-matter row.

    NOT the next ToC row of any kind: a chapter's own internal sections ('I.', 'II.')
    are rows too, and treating them as boundaries ends every chapter at its own first
    subsection — which silently turns a 40-page essay into a 2-page one. The boundary
    set is contributions + front matter only."""
    boundary = set()
    for r in rows:
        t, pg = r[1], r[2]
        if pg is None:
            continue
        m = AUTHORED.match(t)
        if (m and looks_like_person(m.group(1))) or FRONT.match(t):
            boundary.add(pg)
    boundary |= {c["page"] for c in chs if c["page"]}
    starts = sorted(boundary)
    for c in chs:
        if c["page"] is None:
            c["pages"] = ""
            continue
        nxt = next((p for p in starts if p > c["page"]), None)
        end = (nxt - 1) if nxt else last_page
        c["pages"] = "%d\u2013%d" % (c["page"], end) if end and end >= c["page"] else str(c["page"])
    return chs


# ── PDF outline, the second witness ─────────────────────────────────────────
def pdf_contributions():
    """PDF outlines, keyed by a CONTENT fingerprint — never by the filename's roman
    numeral. The local archive's filenames carry stale band numbers (IX/X and
    XXXV/XXXVII are demonstrably swapped: the file named `..._IX.pdf` opens with
    Eisermann on Friedrich List, which is vol. X). The publisher's own page is
    authoritative for which volume is which; the PDF is matched to it by the chapters
    it actually contains."""
    if not os.path.exists(PDF_TOC):
        return []
    out = []
    for rec in json.load(open(PDF_TOC, encoding="utf-8")):
        if not rec.get("outline"):
            continue
        rows = [(e["lvl"], e["title"], e["page"], None) for e in rec["outline"]]
        out.append({"file": rec["file"], "chs": contributions(rows)})
    return out


def fingerprint(chs):
    """The set of chapter titles, folded — enough to identify a volume by content."""
    return {pi.ascii_fold(c["title"])[:40].lower() for c in chs if c["title"]}


def match_pdf(html_chs, pdfs):
    """→ (pdf record, overlap) for the best content match, or (None, 0)."""
    want = fingerprint(html_chs)
    if not want:
        return None, 0
    best, score = None, 0.0
    for p in pdfs:
        have = fingerprint(p["chs"])
        if not have:
            continue
        j = len(want & have) / float(len(want | have))
        if j > score:
            best, score = p, j
    return (best, score) if score >= 0.4 else (None, score)


# ── publisher typos + the themes overlay ────────────────────────────────────
# D&H's own eLibrary ToC contains OCR typos. We transcribe faithfully by default and
# correct only what has been verified against the printed volume. Keep this list short
# and auditable — it is the one place where our text departs from the publisher's.
TYPO_FIXES = {
    "Wie bilden eich die Marktpreise nach Adam Smith?":
        "Wie bilden sich die Marktpreise nach Adam Smith?",   # 'eich' -> 'sich' (Band I, verified)
}


def fix_typos(title):
    for bad, good in TYPO_FIXES.items():
        if title.startswith(bad):
            return good + title[len(bad):]
    return title


THEMES_CSV = os.path.join(HERE, "themes.csv")


def theme_overlay():
    """Curated themes, keyed 'volN|pages' → [theme ids].

    The generator's theme guesses are suggestions, not authority. Curation therefore
    lives OUTSIDE the generated file, in tools/themes.csv, so that re-running the
    harvest never destroys it. A row here overrides the guess and drops the GUESSED
    marker; a chapter with no row keeps its guess and stays marked for review."""
    if not os.path.exists(THEMES_CSV):
        return {}
    out = {}
    with open(THEMES_CSV, encoding="utf-8-sig", newline="") as f:
        for row in csv.DictReader(f):
            key = "%s|%s" % (row.get("volN", "").strip(), row.get("pages", "").strip())
            ts = [t.strip() for t in (row.get("themes") or "").split(",") if t.strip()]
            if ts:
                out[key] = ts
    return out


# ── members ─────────────────────────────────────────────────────────────────
def members():
    src = open(DATA_JS, encoding="utf-8").read()
    blk = re.search(r"const MEMBERS = \[(.*?)\n\];", src, re.S)
    out = []
    for mid, name in re.findall(r"\{ id:'([^']+)', name:'([^']+)'", blk.group(1)):
        parts = name.split()
        out.append({"mid": mid, "sur": pi.ascii_fold(parts[-1]),
                    "ini": pi.ascii_fold(parts[0])[:1] if len(parts) > 1 else ""})
    return out


def clean_authors(s):
    """Strip the affiliation tail the eLibrary sometimes appends ('Heinz Rieter, Hamburg')
    and normalise the separator between co-authors to ' / '."""
    s = re.sub(r",\s*(unter Mitarbeit von .*)$", r" (\1)", s.strip())
    parts = [p.strip() for p in re.split(r"\s*/\s*|\s+und\s+|\s+and\s+", s) if p.strip()]
    out = []
    for p in parts:
        # "Nachname, Stadt" -> drop the city; a real name has no comma at this point
        p = re.sub(r",\s*[A-ZÄÖÜ][\wäöüß.-]*(\s+[A-ZÄÖÜ][\wäöüß.-]*)?$", "", p) \
            if re.search(r",\s*[A-ZÄÖÜ]", p) and not re.search(r"\bMitarbeit\b", p) else p
        out.append(p.strip())
    return " / ".join(out)


def match_mids(authors, MEM):
    """→ EVERY member among the authors, not just the first.

    A chapter by 'Christian Gehrke / Heinz D. Kurz' belongs on BOTH members' pages. A
    single `mid` field silently drops the second author, and the loss is invisible — the
    chapter still renders, just under one name. Hence a list.

    Surname + first initial, never surname alone: this corpus contains both Adolph and
    Helmut Wagner. An EMPTY list is the normal case — most contributors are guests."""
    found = []
    for one in re.split(r"\s*(?:/|,| und | and )\s*", authors):
        w = [x for x in one.split() if x]
        if len(w) < 2:
            continue
        sur, ini = pi.ascii_fold(w[-1]), pi.ascii_fold(w[0])[:1]
        for m in MEM:
            if m["sur"] == sur and (not m["ini"] or m["ini"] == ini):
                if m["mid"] not in found:
                    found.append(m["mid"])
    return found


# ── main ────────────────────────────────────────────────────────────────────
def build():
    MEM = members()
    OVERLAY = theme_overlay()
    pdfs = pdf_contributions()
    vols, allch, diffs = [], [], []

    for f in sorted(os.listdir(HTML_DIR)):
        if not f.endswith(".html"):
            continue
        path = os.path.join(HTML_DIR, f)
        roman, volN = volume_of(path)
        if not roman:
            diffs.append(("?", f, "no volume line in page"))
            continue
        rows = html_rows(path)
        chs = page_ranges(contributions(rows), rows, None)

        pdf, overlap = match_pdf(chs, pdfs)
        pdf_n = len(pdf["chs"]) if pdf else 0
        vm = volume_meta(path)
        vols.append({"vol": roman, "volN": volN, "title": title_of(path),
                     "html_n": len(chs), "pdf_n": pdf_n, "overlap": overlap,
                     "pdf_file": pdf["file"] if pdf else None, **vm})
        if not pdf:
            diffs.append((roman, "no PDF match", "best overlap %.2f \u2014 HTML is single source" % overlap))
        elif pdf_n != len(chs):
            diffs.append((roman, "%d html vs %d pdf" % (len(chs), pdf_n),
                          "overlap %.2f \u2014 %s" % (overlap, pdf["file"][:38])))

        for c in chs:
            c["authors"] = clean_authors(c["authors"])
            c["title"] = fix_typos(c["title"])
            key = "%d|%s" % (volN, c["pages"])
            curated = OVERLAY.get(key)
            c.update(vol=roman, volN=volN,
                     mids=match_mids(c["authors"], MEM),
                     themes=curated or pi.suggest_themes(c["title"], ""),
                     curated=bool(curated))
            allch.append(c)

    vols.sort(key=lambda v: v["volN"])
    allch.sort(key=lambda c: (c["volN"], c["page"] or 0))
    return vols, allch, diffs


def emit(vols, chs):
    def meta_lines():
        L = []
        for v in sorted(vols, key=lambda x: x["volN"]):
            L.append("    { volN:%d, vol:%s, year:%s, editors:%s, isbn:%s, doi:%s, title:%s }," % (
                v["volN"], pi.js_str(v["vol"]), v.get("year") or "null",
                pi.js_str(v.get("editors") or ""), pi.js_str(v.get("isbn") or ""),
                pi.js_str(v.get("doi") or ""), pi.js_str(v.get("title") or "")))
        return L

    L = ["/* agw_volume_chapters.js \u2014 the AGW Tagungsband chapter corpus",
         " * Generated by tools/dh_toc.py from the D&H eLibrary ToC + the volume PDF",
         " * outlines (two independent sources, cross-checked). Do not hand-edit the",
         " * harvested fields; DO curate `themes` and `mid`.",
         " *",
         " * Separate from MEMBER_PUBS by design: different provenance (the committee's",
         " * own proceedings), different consent basis, different rendering.",
         " *",
         " * `mids` is a LIST and is often EMPTY. Empty is the NORMAL case \u2014 roughly half",
         " * the contributors are guests and foreign scholars, not AGW members. It is a",
         " * list rather than a single id because a co-authored chapter belongs on EVERY",
         " * member author's page; a scalar field silently drops the second author, and",
         " * the loss is invisible (the chapter still renders, just under one name).",
         " * Never key on the display name \u2014 names drift, slugs do not (ADR-028).",
         " */",
         "(function () {",
         "",
         "  /* Volume-level metadata, needed for citations. `year` and `editors` come from",
         "   * the publisher's own citation block on the eLibrary page \u2014 PUBLICATIONS in",
         "   * agw_data.js has year:null for 31 of 43 volumes, and the citation_publication_date",
         "   * meta tag is the e-edition date, not the print year. */",
         "  const VOLUME_META = ["]
    L += meta_lines()
    L += ["  ];", "", "  const VOLUME_CHAPTERS = ["]
    cur = None
    for c in chs:
        if c["volN"] != cur:
            cur = c["volN"]
            L.append("")
            L.append("    /* \u2500\u2500 Band %s \u2500\u2500 */" % c["vol"])
        mark = "" if c.get("curated") else "   // themes GUESSED \u2014 verify"
        L.append("    { volN:%d, vol:%s, pages:%s,%s" % (
            c["volN"], pi.js_str(c["vol"]), pi.js_str(c["pages"]), mark))
        L.append("      title:%s," % pi.js_str(c["title"]))
        L.append("      authors:%s, mids:[%s]," % (
            pi.js_str(c["authors"]), ", ".join(pi.js_str(m) for m in c["mids"])))
        L.append("      themes:[%s], url:%s, src:'dh' }," % (
            ", ".join(pi.js_str(t) for t in c["themes"]), pi.js_str(c.get("url") or "")))
    L += ["  ];", "",
          "  window.AGW_DATA = window.AGW_DATA || {};",
          "  window.AGW_DATA.VOLUME_META = VOLUME_META;",
          "  window.AGW_DATA.VOLUME_CHAPTERS = VOLUME_CHAPTERS;",
          "})();"]
    return "\n".join(L) + "\n"


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--report", action="store_true")
    ap.add_argument("--build", action="store_true")
    a = ap.parse_args()
    if not (a.report or a.build):
        ap.print_help()
        return 0

    vols, chs, diffs = build()
    w = sys.stderr if a.build else sys.stdout
    print("%d volumes, %d chapters\n" % (len(vols), len(chs)), file=w)
    for v in vols:
        flag = "" if v["pdf_n"] == v["html_n"] else "   \u2190 HTML %d / PDF %d" % (
            v["html_n"], v["pdf_n"])
        print("  %-7s %2d  %2d chapters%s  %s" % (
            v["vol"], v["volN"], v["html_n"], flag, v["title"][:44]), file=w)
    cur = sum(1 for c in chs if c.get("curated"))
    print("  themes: %d curated, %d still guessed" % (cur, len(chs) - cur), file=w)
    named = sum(1 for c in chs if c["mids"])
    multi = sum(1 for c in chs if len(c["mids"]) > 1)
    print("\n  %d chapters touch a member (%d of them co-authored by 2+ members), "
          "%d guest-only" % (named, multi, len(chs) - named), file=w)
    if diffs:
        print("\n  DISAGREEMENTS (arbitrate these):", file=w)
        for d in diffs:
            print("    %-7s %-22s %s" % d, file=w)
    if a.build:
        sys.stdout.write(emit(vols, chs))
    return 0


if __name__ == "__main__":
    sys.exit(main())
