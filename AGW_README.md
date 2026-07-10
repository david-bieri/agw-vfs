# AGW Website — Project Reference

**What this is, where things live, and how to update content.** For session context see `AGW_CLAUDE.md`; for decisions `AGW_DECISIONS.md`; for milestones `AGW_PROGRESS.md`.

**Version:** v48 · **Live:** `www.agw-vfs.de` · **Repo:** `david-bieri/agw-vfs`
**Status:** Post-conference standing-committee site (the 46th Jahrestagung concluded 25–27 June 2026).

---

## Architecture

Static, multi-page, no framework/backend. **No build step for the pages**; the React analytics bundles are the only compiled artifact (esbuild → `dist/`, loaded via importmap from esm.sh). 7 pages share foundation files. PWA via `service-worker.js`. Bilingual DE/EN through `agw_strings.js` (toggle broadcasts `agw-lang-change`).

**Pages:** `index.html` (committee landing) · `events.html` · `jahrestagung-2026.html` · `archive.html` · `committee.html` · `analytics.html` · `guide.html`

**Foundation:** `agw_styles.css` · `agw_strings.js` (i18n) · `agw_data.js` (CHAIRS, MEMBERS, ARCHIVE, PUBLICATIONS, EVENTS, EVENT_NETWORKS, ANNOUNCEMENTS) · `agw_app.js` (render/init) · `agw_nav.js` (nav+footer) · `agw_chronik.js` · `agw_hero_viz.js` · `agw_schools_net.js` · `agw_gallery.js` · `agw_highlights.js`

**Data/tools:** `data/gallery.js`, `data/highlights.js`, `data/*.json` · `dist/` (React bundles) · `img/gallery/`, `img/highlights/` · `tools/` (generators + fonts + docs).

---

## Updating content

### Members / chairs / archive / publications / announcements
Edit the arrays in `agw_data.js`. `renderGlance`/`renderMembers`/etc. pick up counts automatically. Bump the SW cache and push.

### Events (affiliated conferences, seminars)
Add to `EVENTS` in `agw_data.js` with ISO dates; peer networks go in `EVENT_NETWORKS`. `events.html` derives past/upcoming at render (ADR-022). AGW's own Jahrestagungen live in `ARCHIVE`; give an archived one a `page:` field to auto-link its standalone page (ADR-023). Example `EVENTS` entry: `{ id, series, edition, kind, affiliation:'affiliated', title, start:'YYYY-MM-DD', end:'YYYY-MM-DD', loc_de, loc_en, host, url, tags:[], desc_de, desc_en }`.

### Translations
`agw_strings.js` → `window.AGW.S[key] = { de, en }`. `data-i18n="key"` on an element swaps its text on toggle. Scholarly titles stay German in both modes (ADR-014).

### Gallery photos (Impressionen) — `tools/GALLERY.md`
Run `python tools/gallery_add.py <id> <source.jpg>` (needs `pillow pillow-avif-plugin`) → writes `img/gallery/<id>-{480,960,1440}.{avif,webp}` + `<id>.jpg` and prints a manifest snippet. Paste into `data/gallery.js` → `shots[]`, edit `cap`/`alt`, bump the SW cache. Never precache images.

### "Im Fokus" landing highlights
Edit `data/highlights.js`: `featured` (diptych/landscape image + bilingual text) and `rail[]` (photo/publication/press cards + stats/analytics tiles). Live HTML, no rebuild (ADR-024). Member/volume counts bind to `MEMBERS`/`PUBLICATIONS`.

### Denkschulen network (analytics.html → Schulen)
Everything is the embedded `var NET = { nodes, edges, colors }` at the top of `agw_schools_net.js`. Node `{ id, n, s, b, d, c, app }` (id = join key); edge `{ s, t, w, ty }` with `ty` ∈ co-citation | influence | strong | methodenstreit | parallel. Vanilla, no build — edit + bump the SW cache. (Known fixes pending: Walras/Pareto laned "Austrian School"; Alfred Weber's blurb is Max Weber's.)

### Social / og:image cards — `tools/THUMBNAIL.md`
`python tools/agw_thumbnail.py --image X.jpg --kicker "…" --title "…" --byline "…" --out name --style a|b|c|lowerthird|all --formats og,square [--focus top|center|0.0-1.0]`. Outputs branded rasters; put og cards under `img/highlights/` and reference via `<meta property="og:image">` (ADR-025). Not the on-page rail — that's live HTML.

---

## Deploy ritual

Copy files from `outputs\` → repo, bump `const CACHE` in `service-worker.js` if a precached asset changed, `git add` named paths, commit (conventional-commit style), push. Then unregister the SW once + hard-reload to confirm. Cross-machine sync: `git fetch origin && git reset --hard origin/main`.

## Environment notes

Windows/PowerShell primary; WSL for the analytics esbuild (`npx esbuild src-jsx/... --bundle --format=esm --jsx=automatic`). Validate JS with `node --check`, HTML with `python3 html.parser`. Verify live files via `raw.githubusercontent.com/david-bieri/agw-vfs/main/<file>`.
