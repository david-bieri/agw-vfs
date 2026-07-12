#!/usr/bin/env python3
"""pdf_toc.py — dump the embedded ToC (bookmark outline) of each Tagungsband PDF.

The volume PDFs are the ground truth for where chapters actually begin. The D&H
eLibrary HTML gives us structure (authors, page ranges, DOIs); the PDF outline gives
us an independent witness to the same structure. Where the two agree, a chapter record
needs no human check. Where they disagree, that is the signal — it is how a sectioned
volume whose contributions were collapsed into a section heading announces itself.

This writes METADATA ONLY: outline titles, hierarchy level, and start page. No text,
no images, no PDF content. The output is a few hundred KB and safe to hand around,
which the 600 MB of PDFs is not.

    pip install pymupdf
    python tools\\pdf_toc.py "C:\\Users\\bieri\\OneDrive\\Projects\\Admin\\dev\\agw-vfs\\svfs_archive"

Writes tools/pdf_toc.json. If a PDF has no embedded outline (likely for the oldest
scanned volumes), it is reported with outline:null rather than guessed at — a missing
outline is a fact worth knowing, not a gap to paper over.
"""

import json
import os
import re
import sys

try:
    import fitz  # PyMuPDF
except ImportError:
    sys.exit("Needs PyMuPDF:  pip install pymupdf")

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "pdf_toc.json")

# The D&H PDFs are named after the volume DOI, e.g. 10_3790_978_3_428_59638_6.pdf,
# which carries the e-ISBN — that is how each file is matched back to its volume.
ISBN_RE = re.compile(r"(978[_\-]?3[_\-]?428[_\-]?\d{5}[_\-]?\d)")


def isbn_of(name):
    m = ISBN_RE.search(name)
    return re.sub(r"[^0-9X]", "", m.group(1)) if m else None


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    root = sys.argv[1]
    pdfs = []
    for dirpath, _, files in os.walk(root):
        for f in files:
            if f.lower().endswith(".pdf"):
                pdfs.append(os.path.join(dirpath, f))
    pdfs.sort()
    print("found %d PDFs under %s\n" % (len(pdfs), root))

    out = []
    for p in pdfs:
        base = os.path.basename(p)
        try:
            doc = fitz.open(p)
            toc = doc.get_toc()          # [[level, title, page], ...]
            rec = {
                "file": base,
                "isbn": isbn_of(base),
                "pages": doc.page_count,
                "outline": [{"lvl": l, "title": t.strip(), "page": pg} for l, t, pg in toc] or None,
            }
            doc.close()
        except Exception as e:
            rec = {"file": base, "isbn": isbn_of(base), "pages": None,
                   "outline": None, "error": str(e)}
        n = len(rec["outline"]) if rec["outline"] else 0
        print("  %-46s %4s pp  %3d outline entries%s" % (
            base[:46], rec["pages"] or "?", n, "   <- NO OUTLINE" if not n else ""))
        out.append(rec)

    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    have = sum(1 for r in out if r["outline"])
    print("\nwrote %s  (%d PDFs, %d with an embedded outline)" % (OUT, len(out), have))
    return 0


if __name__ == "__main__":
    sys.exit(main())
