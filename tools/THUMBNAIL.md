# AGW thumbnail / social-card generator

`tools/agw_thumbnail.py` stamps the AGW design language onto a photo and writes
share-ready cards (Open Graph link previews, social posts). Self-contained — the
EB Garamond + Source Sans 3 fonts are bundled under `tools/fonts/`.

## Setup
```bash
pip install pillow
```

## Usage (from the repo root)
```bash
python tools/agw_thumbnail.py \
  --image path/to/photo.jpg \
  --kicker "Im Feuilleton" \
  --title  "Geoökonom August Lösch: Der räumliche Visionär" \
  --byline "David Bieri · Frankfurter Allgemeine Zeitung" \
  --out    oped_loesch \
  --style  all \
  --formats og,square
```

- `--style`  `a` floating coverline · `b` editorial split · `c` display headline ·
  `lowerthird` institutional baseline · `all` writes one file per style
- `--formats` `og` 1200×630 (link previews) · `square` 1080×1080 (IG/LinkedIn) ·
  `portrait` 1080×1350
- `--outdir` defaults to `img/highlights`
- Output: `<outdir>/<out>-<style>-<format>.jpg`

The title auto-wraps and shrinks to fit; EXIF orientation is applied automatically;
the photo is cover-cropped to fill. For style `c`, prefer images with headroom at the
bottom (the scrim covers the lower third). Colours: navy `#1B3A6B`, gold `#CBA13A`.

## Using the output
- **Social posts:** upload the `square` (or `portrait`) file directly.
- **Link previews (og):** put the `og` file under `img/highlights/` and reference it in
  the page head — `<meta property="og:image" content="https://www.agw-vfs.de/img/highlights/<file>.jpg">`
  (1200×630 is the standard OG size). Bump the SW cache if the page is precached.
