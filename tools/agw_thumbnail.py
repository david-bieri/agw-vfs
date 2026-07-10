#!/usr/bin/env python3
"""
tools/agw_thumbnail.py — AGW branded social / thumbnail card generator.

Stamps the AGW design language (navy, gold kicker, EB Garamond headline,
committee wordmark) onto a photo and writes share-ready raster cards.

Usage (from the repo root):
    python tools/agw_thumbnail.py \
        --image path/to/photo.jpg \
        --kicker "Im Feuilleton" \
        --title  "Geoökonom August Lösch: Der räumliche Visionär" \
        --byline "David Bieri · Frankfurter Allgemeine Zeitung" \
        --out    oped_loesch \
        --style  all \
        --formats og,square

Styles:  a = floating coverline · b = editorial split · c = display headline
         lowerthird = institutional baseline · all = one file per style
Formats: og 1200x630 · square 1080x1080 · portrait 1080x1350
Output:  <outdir>/<out>-<style>-<format>.jpg   (default outdir: img/highlights)

Requires: pillow  (fonts are bundled under tools/fonts/)
"""
import argparse, os, sys
from PIL import Image, ImageDraw, ImageFont, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))
FONTS = {'garamond': os.path.join(HERE, 'fonts', 'EBGaramond.ttf'),
         'source':   os.path.join(HERE, 'fonts', 'SourceSans3.ttf')}
# ── AGW palette (kept in lock-step with agw_styles.css :root) ──
# Gold is a documented PAIR, not one value: the site accents on the cream
# canvas with the darker --gold (#B8860B); every card this tool renders sits
# on navy or a photo, so it uses the brighter --gold-on-navy (#CBA13A) that
# reads on a dark background. Change both surfaces together, never just one.
NAVY = (27, 58, 107); NAVY_DEEP = (20, 32, 54); WHITE = (255, 255, 255)
GOLD_ON_CREAM = (184, 134, 11)   # #B8860B — matches --gold        (site, on cream)
GOLD          = (203, 161, 58)   # #CBA13A — matches --gold-on-navy (cards, on navy)
FORMATS = {'og': (1200, 630), 'square': (1080, 1080), 'portrait': (1080, 1350)}

def font(fam, wght, size):
    f = ImageFont.truetype(FONTS[fam], size)
    try: f.set_variation_by_axes([wght])
    except Exception: pass
    return f

def tw(d, t, f):
    b = d.textbbox((0, 0), t, font=f); return b[2] - b[0]
def th(f):
    a, de = f.getmetrics(); return a + de

def wrap(d, text, f, maxw):
    words, lines, cur = text.split(), [], ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if tw(d, t, f) <= maxw or not cur: cur = t
        else: lines.append(cur); cur = w
    if cur: lines.append(cur)
    return lines

def fit_title(d, text, maxw, maxh, hi, lo, wght=500, lh=1.16):
    size = hi
    while size >= lo:
        f = font('garamond', wght, size)
        lines = wrap(d, text, f, maxw)
        line_h = int(th(f) * lh)
        if line_h * len(lines) <= maxh and max(tw(d, l, f) for l in lines) <= maxw:
            return lines, f, line_h
        size -= 2
    f = font('garamond', wght, lo)
    return wrap(d, text, f, maxw), f, int(th(f) * lh)

def draw_lines(d, x, y, lines, f, fill, line_h):
    for l in lines:
        d.text((x, y), l, font=f, fill=fill); y += line_h
    return y

def draw_tracked(d, x, y, text, f, fill, track):
    for ch in text:
        d.text((x, y), ch, font=f, fill=fill)
        x += d.textbbox((0, 0), ch, font=f)[2] + track
    return x
def tracked_w(d, text, f, track):
    return sum(d.textbbox((0, 0), c, font=f)[2] for c in text) + track * max(0, len(text) - 1)

def cover(img, w, h, focus=0.5):
    img = ImageOps.exif_transpose(img).convert('RGB')
    sw, sh = img.size; s = max(w / sw, h / sh)
    nw, nh = int(sw * s + .5), int(sh * s + .5)
    img = img.resize((nw, nh), Image.LANCZOS)
    x, y = (nw - w) // 2, int((nh - h) * focus)
    return img.crop((x, y, x + w, y + h))

def scrim(base, box, rgba):
    ov = Image.new('RGBA', base.size, (0, 0, 0, 0))
    ImageDraw.Draw(ov).rectangle(box, fill=rgba)
    return Image.alpha_composite(base, ov)

def render(style, W, H, src, kicker, title, byline, focus=0.5):
    if style == 'b':
        pw = int(W * 0.56)
        base = Image.new('RGB', (W, H), NAVY)
        base.paste(cover(src, pw, H, focus), (0, 0)); base = base.convert('RGBA')
        d = ImageDraw.Draw(base)
        px, panel_w = pw, W - pw; pad = int(panel_w * 0.10)
        ks = int(H * 0.026); fk = font('source', 600, ks)
        foot_h = int(H * 0.05)
        avail_top, avail_bot = int(H * 0.10), H - foot_h - int(H * 0.06)
        lines, ft, lh = fit_title(d, title, panel_w - 2 * pad, int(H * 0.42), int(H * 0.052), int(H * 0.030))
        fby = font('source', 400, int(H * 0.024)); bh = th(fby)
        block = ks + int(ks * 1.4) + lh * len(lines) + int(H * 0.03) + bh
        y = max(avail_top, (avail_top + avail_bot - block) // 2)
        draw_tracked(d, px + pad, y, kicker.upper(), fk, GOLD, int(ks * 0.14)); y += int(ks * 1.9)
        y = draw_lines(d, px + pad, y, lines, ft, WHITE, lh); y += int(H * 0.02)
        d.text((px + pad, y), byline, font=fby, fill=(255, 255, 255, 200))
        fmast = font('garamond', 600, int(H * 0.032)); furl = font('source', 500, int(H * 0.020))
        fy = H - foot_h; d.text((px + pad, fy), 'AGW', font=fmast, fill=WHITE)
        d.text((px + pad + tw(d, 'AGW', fmast) + int(W * 0.012), fy + int(H * 0.006)),
               'agw-vfs.de', font=furl, fill=(255, 255, 255, 150))
        return base.convert('RGB')

    if style == 'lowerthird':
        ph = int(H * 0.57); band = H - ph
        base = Image.new('RGB', (W, H), NAVY)
        base.paste(cover(src, W, ph, focus), (0, 0)); base = base.convert('RGBA')
        d = ImageDraw.Draw(base); m = int(W * 0.032)
        d.rectangle([m, ph, W - m, ph + 3], fill=GOLD)
        pad = int(H * 0.035); ks = int(H * 0.024); fk = font('source', 600, ks)
        y = ph + pad
        draw_tracked(d, m, y, kicker.upper(), fk, GOLD, int(ks * 0.16)); y += int(ks * 1.8)
        foot_y = H - pad - int(H * 0.028)
        lines, ft, lh = fit_title(d, title, W - 2 * m, foot_y - y - int(H * 0.05), int(H * 0.050), int(H * 0.030))
        y = draw_lines(d, m, y, lines, ft, WHITE, lh)
        fby = font('source', 400, int(H * 0.024))
        d.text((m, y + int(H * 0.012)), byline, font=fby, fill=(255, 255, 255, 200))
        d.line([m, foot_y - int(H * 0.012), W - m, foot_y - int(H * 0.012)], fill=(255, 255, 255, 45), width=1)
        fmast = font('garamond', 600, int(H * 0.026)); fc = font('source', 400, int(H * 0.017))
        d.text((m, foot_y), 'AGW', font=fmast, fill=WHITE)
        d.text((m + tw(d, 'AGW', fmast) + int(W * 0.010), foot_y + int(H * 0.006)),
               'Ausschuss für die Geschichte der Wirtschaftswissenschaften · agw-vfs.de',
               font=fc, fill=(255, 255, 255, 150))
        return base.convert('RGB')

    # a and c share a full-bleed photo
    base = cover(src, W, H, focus).convert('RGBA'); d = ImageDraw.Draw(base); m = int(W * 0.026)

    if style == 'a':
        fm = font('garamond', 600, int(H * 0.030)); fv = font('source', 500, int(H * 0.018))
        brand = 'AGW'; sub = '  ·  Verein für Socialpolitik'
        bw = tw(d, brand, fm) + tw(d, sub, fv); bh = th(fm)
        pill = [m, m, m + bw + int(W * 0.028), m + bh + int(H * 0.02)]
        base = scrim(base, None, None) if False else base
        ov = Image.new('RGBA', base.size, (0, 0, 0, 0))
        ImageDraw.Draw(ov).rounded_rectangle(pill, radius=int(bh * 0.7), fill=NAVY + (210,))
        base = Image.alpha_composite(base, ov); d = ImageDraw.Draw(base)
        bx, by = m + int(W * 0.014), m + int(H * 0.01)
        d.text((bx, by), brand, font=fm, fill=WHITE)
        d.text((bx + tw(d, brand, fm), by + int(H * 0.006)), sub, font=fv, fill=(255, 255, 255, 220))
        boxpad = int(W * 0.022); box_maxw = int(W * 0.64)
        ks = int(H * 0.024); fk = font('source', 600, ks)
        lines, ft, lh = fit_title(d, title, box_maxw - 2 * boxpad, int(H * 0.30), int(H * 0.050), int(H * 0.030))
        fby = font('source', 400, int(H * 0.022))
        content_w = max(tracked_w(d, kicker.upper(), fk, int(ks * 0.16)),
                        max(tw(d, l, ft) for l in lines), tw(d, byline, fby))
        box_w = min(box_maxw, content_w + 2 * boxpad)
        box_h = 2 * boxpad + ks + int(ks * 0.7) + lh * len(lines) + int(H * 0.02) + th(fby)
        bx0, by0 = m, H - m - box_h
        ov = Image.new('RGBA', base.size, (0, 0, 0, 0))
        ImageDraw.Draw(ov).rounded_rectangle([bx0, by0, bx0 + box_w, by0 + box_h], radius=int(W * 0.008), fill=NAVY + (255,))
        base = Image.alpha_composite(base, ov); d = ImageDraw.Draw(base)
        d.rectangle([bx0 + int(W * 0.008), by0, bx0 + box_w - int(W * 0.008), by0 + 3], fill=GOLD)
        ty = by0 + boxpad
        draw_tracked(d, bx0 + boxpad, ty, kicker.upper(), fk, GOLD, int(ks * 0.16)); ty += int(ks * 1.5)
        ty = draw_lines(d, bx0 + boxpad, ty, lines, ft, WHITE, lh); ty += int(H * 0.012)
        d.text((bx0 + boxpad, ty), byline, font=fby, fill=(255, 255, 255, 200))
        return base.convert('RGB')

    if style == 'c':
        fmast = font('garamond', 600, int(H * 0.052))
        d.text((m + 2, m + 2), 'AGW', font=fmast, fill=(0, 0, 0, 140))
        d.text((m, m), 'AGW', font=fmast, fill=WHITE)
        band = int(H * 0.46)
        base = scrim(base, [0, H - band, W, H], NAVY_DEEP + (188,)); d = ImageDraw.Draw(base)
        pad = int(W * 0.032); ks = int(H * 0.026); fk = font('source', 600, ks)
        ky = H - band + pad
        draw_tracked(d, pad, ky, kicker.upper(), fk, GOLD, int(ks * 0.16))
        ty = ky + int(ks * 1.7)
        by_y = H - pad - int(H * 0.030)
        lines, ft, lh = fit_title(d, title, int((W - 2 * pad) * 0.94), by_y - ty - int(H * 0.02),
                                  int(H * 0.088), int(H * 0.048))
        draw_lines(d, pad, ty, lines, ft, WHITE, lh)
        fby = font('source', 400, int(H * 0.024)); furl = font('source', 500, int(H * 0.020))
        d.text((pad, by_y), byline, font=fby, fill=(255, 255, 255, 205))
        url = 'agw-vfs.de'
        d.text((W - pad - tw(d, url, furl), by_y + int(H * 0.005)), url, font=furl, fill=(255, 255, 255, 150))
        return base.convert('RGB')

    raise ValueError('unknown style: ' + style)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--image', required=True)
    ap.add_argument('--kicker', default='')
    ap.add_argument('--title', required=True)
    ap.add_argument('--byline', default='')
    ap.add_argument('--out', required=True, help='output filename stem')
    ap.add_argument('--style', default='c', help='a | b | c | lowerthird | all')
    ap.add_argument('--formats', default='og', help='comma list: og,square,portrait')
    ap.add_argument('--outdir', default=os.path.join('img', 'highlights'))
    ap.add_argument('--focus', default='center', help="vertical crop: top | center | bottom | 0.0-1.0")
    a = ap.parse_args()
    for fam, p in FONTS.items():
        if not os.path.exists(p): sys.exit('missing font: ' + p + ' (expected under tools/fonts/)')
    styles = ['a', 'b', 'c', 'lowerthird'] if a.style == 'all' else [a.style]
    fmts = [f.strip() for f in a.formats.split(',') if f.strip()]
    os.makedirs(a.outdir, exist_ok=True)
    src = Image.open(a.image)
    for st in styles:
        for fm in fmts:
            if fm not in FORMATS: sys.exit('unknown format: ' + fm)
            W, H = FORMATS[fm]
            fv = {'top':0.0,'center':0.5,'bottom':1.0}.get(a.focus, None)
            fv = fv if fv is not None else float(a.focus)
            out = render(st, W, H, src, a.kicker, a.title, a.byline, fv)
            path = os.path.join(a.outdir, f'{a.out}-{st}-{fm}.jpg')
            out.save(path, 'JPEG', quality=88, optimize=True, progressive=True)
            print('wrote', path, f'({W}x{H})')

if __name__ == '__main__':
    main()
