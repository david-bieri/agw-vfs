"""AGW page check — third-party requests, console errors, fonts, overflow.

Loads every page at 1280 / 390 / 320 px (service worker blocked, so the network
is real), then performs the user actions that are allowed to reach a third
party (open the archive map, scroll to the conference map, click every
analytics tab) and lists what each one requested.

    python tools/page_check.py                      # http://127.0.0.1:8765
    python tools/page_check.py https://www.agw-vfs.de --shots out/

Serve the repo first:  python -m http.server 8765 --bind 127.0.0.1
Chromium: Playwright's default; set AGW_CHROME to an executable to override.
Target (v79): zero third-party requests before user action; after it, only
tile.openstreetmap.org.
"""
import os, sys, argparse
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

PAGES = ['index.html', 'events.html', 'jahrestagung-2026.html', 'archive.html',
         'committee.html', 'publications-members.html', 'analytics.html',
         'guide.html', 'styleguide.html', '404.html']
WIDTHS = [1280, 390, 320]
HARNESS_NOISE = ('Service Worker registration blocked',)


def watch(page, own):
    log = {'third': [], 'console': []}
    page.on('request', lambda r: log['third'].append(r.url)
            if urlparse(r.url).netloc not in (own, '') else None)
    page.on('console', lambda m: log['console'].append(f'{m.type}: {m.text}')
            if m.type in ('error', 'warning') and not m.text.startswith(HARNESS_NOISE) else None)
    page.on('pageerror', lambda e: log['console'].append(f'pageerror: {e}'))
    page.on('response', lambda r: log['console'].append(f'HTTP {r.status} {r.url}')
            if r.status >= 400 else None)
    return log


def hosts(urls):
    return sorted({urlparse(u).netloc for u in urls})


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('base', nargs='?', default='http://127.0.0.1:8765')
    ap.add_argument('--shots', help='directory for screenshots')
    a = ap.parse_args()
    base, own = a.base.rstrip('/'), urlparse(a.base).netloc
    if a.shots:
        os.makedirs(a.shots, exist_ok=True)
    problems = 0
    with sync_playwright() as p:
        exe = os.environ.get('AGW_CHROME')
        b = p.chromium.launch(**({'executable_path': exe} if exe else {}))

        print('== page load (no interaction) ==')
        for w in WIDTHS:
            ctx = b.new_context(viewport={'width': w, 'height': 900}, service_workers='block')
            for pg in PAGES:
                page = ctx.new_page()
                log = watch(page, own)
                page.goto(f'{base}/{pg}', wait_until='networkidle', timeout=90000)
                page.wait_for_timeout(1200)
                ov = page.evaluate('document.documentElement.scrollWidth - document.documentElement.clientWidth')
                fonts = page.evaluate("async()=>{await document.fonts.ready;return [...document.fonts].filter(f=>f.status==='loaded').length}")
                if a.shots:
                    page.screenshot(path=os.path.join(a.shots, f'{pg[:-5]}-{w}.png'))
                bad = log['third'] or log['console']
                problems += bool(bad)
                print(f"{pg:28} {w:4}px  3p={hosts(log['third']) or '-'}  console={len(log['console'])}"
                      f"  fonts={fonts}  overflow={ov}px{'  <--' if bad else ''}")
                for m in log['console']:
                    print('      ', m[:200])
                page.close()
            ctx.close()

        print('\n== after user action ==')
        ctx = b.new_context(viewport={'width': 1280, 'height': 900}, service_workers='block')
        actions = [
            ('archive.html', 'open Karte', lambda pg: pg.click("[onclick^=\"setArchiveView('map'\"]")),
            ('jahrestagung-2026.html', 'scroll to map', lambda pg: pg.locator('#logistik-map').scroll_into_view_if_needed()),
            ('analytics.html', 'click all tabs', lambda pg: [
                (pg.click(f'[onclick="{oc}"]'), pg.wait_for_timeout(800))
                for oc in pg.eval_on_selector_all("[onclick^='showTool']", "e=>e.map(x=>x.getAttribute('onclick'))")]),
        ]
        for pg_name, label, act in actions:
            page = ctx.new_page()
            log = watch(page, own)
            page.goto(f'{base}/{pg_name}', wait_until='networkidle', timeout=90000)
            before = list(log['third'])
            act(page)
            page.wait_for_timeout(3000)
            after = log['third'][len(before):]
            print(f"{pg_name:28} {label:15} before={hosts(before) or '-'}  after={hosts(after) or '-'}"
                  f"  console={len(log['console'])}")
            for m in log['console']:
                print('      ', m[:200])
            problems += bool(before or log['console'])
            page.close()
        b.close()
    print(f'\n{problems} problem(s)')
    return 1 if problems else 0


if __name__ == '__main__':
    sys.exit(main())
