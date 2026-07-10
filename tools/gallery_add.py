#!/usr/bin/env python3
"""
tools/gallery_add.py — add photo(s) to the "Impressionen" gallery.

Generates the AVIF + WebP + JPEG variants that agw_gallery.js expects, and
prints a ready-to-paste manifest entry for data/gallery.js.

Usage (run from the repo root):
    python tools/gallery_add.py ID SOURCE [ID2 SOURCE2 ...]
    e.g.  python tools/gallery_add.py p1473 ~/photos/P1011473.JPG

ID is any short unique stem (it becomes the filename + the manifest id).
Requires:  pip install pillow pillow-avif-plugin
"""
import sys, os
try:
    import pillow_avif  # noqa: F401  registers the AVIF encoder
except ImportError:
    sys.exit("!! pillow-avif-plugin missing — run: pip install pillow pillow-avif-plugin")
from PIL import Image

WIDTHS      = [480, 960, 1440]   # must match the other shots
FALLBACK_W  = 1440
OUT         = os.path.join("img", "gallery")

def process(pid, src):
    im = Image.open(src).convert("RGB")
    W, H = im.size
    os.makedirs(OUT, exist_ok=True)
    for w in WIDTHS:
        h = round(H * w / W)
        rs = im.resize((w, h), Image.LANCZOS)
        rs.save(f"{OUT}/{pid}-{w}.webp", "WEBP", quality=80, method=6)
        rs.save(f"{OUT}/{pid}-{w}.avif", "AVIF", quality=52)
    hf = round(H * FALLBACK_W / W)
    im.resize((FALLBACK_W, hf), Image.LANCZOS).save(
        f"{OUT}/{pid}.jpg", "JPEG", quality=82, optimize=True, progressive=True)
    return W, H

def main(argv):
    a = argv[1:]
    if len(a) < 2 or len(a) % 2:
        sys.exit(__doc__)
    print("\n// Paste into data/gallery.js  →  AGW.GALLERY.shots[]  (then edit captions):\n")
    for i in range(0, len(a), 2):
        pid, src = a[i], a[i + 1]
        W, H = process(pid, src)
        print(f"""    {{ id: '{pid}', w: {W}, h: {H},
      alt: {{ de: 'TODO Bildbeschreibung', en: 'TODO alt text' }},
      cap: {{ de: 'TODO Bildunterschrift', en: 'TODO caption' }} }},""")
    print(f"\nWrote variants to {OUT}/  ({', '.join('%dw' % w for w in WIDTHS)} + .jpg fallback).")
    print("Then: paste above → edit captions → bump the SW cache → commit img/gallery + data/gallery.js.")

if __name__ == "__main__":
    main(sys.argv)
