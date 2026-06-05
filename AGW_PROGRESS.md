# AGW Website — Implementation Progress

**Current version:** v9 (analytics UX + repo tidy)
**Last updated:** 2026-06-05
**Conference:** June 25–27, 2026 (T-20 days)

---

## Completed ✅

### Website versions
- [x] **v1** — Conference microsite: hero, programme (3-tab timeline), Rahmenprogramm cards, venue/travel, footer. VfS navy palette, EB Garamond + Source Sans 3 typography.
- [x] **v2** — Expanded navigation: dropdown nav, DE/EN language toggle (dual-DOM), hamburger menu, VfS link, Archive, Publikationen, Über den Ausschuss, Geschichte des AGW, Mitgliederliste (searchable), localStorage persistence, navigator.language auto-detection.
- [x] **v3** — Publications section: 26 confirmed volumes (*Studien zur Entwicklung der ökonomischen Theorie*, Band 115), decade filter, text search, Duncker & Humblot links.
- [x] **v4** — Expandable publication entries: ToC panel (4 volumes with real chapter data), 4 citation formats (BibTeX, EndNote, RIS, Chicago), download + clipboard copy, named output files.
- [x] **v5** — Language toggle refactor: dual-DOM (`de-content`/`en-content`) replaced with `data-i18n` attribute system. 128 span pairs converted, 68 lifted to parent elements, 9 prose paragraphs get `data-i18n-html`. `setLang()` uses EN object lookup + `data-de` capture. `initLang()` cascade: localStorage → navigator.language → DE default.
- [x] **v6** (2026-05-31, commit `547ec7e`) — Launch-ready: PWA service worker, og:image social preview card, SPIA logo (base64), archive map (Leaflet, 46 venues), global search overlay (Ctrl+K), news feed, sister societies, iCal download, countdown timer, mobile CSS (3 breakpoints), VT SPIA logo as base64 data URI.
- [x] **v7** (2026-06-03, commit `7d0bbbf` + Phase 1) — Analytics integration: Chronik tab (vanilla-JS showcase) in Archive section, standalone `analytics.html` (Gaze Map + Analytics A–E + Topic Analysis A–F), `guide.html` (user manual), central `agw_strings.js` translation registry with extended `AGW.applyLang()` handling both legacy `data-i18n` and new `data-str` patterns.
- [x] **v8** (2026-06-03, commits `61435b4` + `00856cc` + `67b5ab4` + `4335b8d` + multi-page push) — Multi-page architecture: monolithic `index.html` (310 KB) split into 5 pages with shared foundation files. New top-level routes: `archive.html` (scholarly archive + publications) and `committee.html` (about + history + members + chairs + sister societies + statutes). Foundation extracted: `agw_styles.css`, `agw_data.js`, `agw_app.js`, `agw_nav.js`. Cross-page hash redirects; service worker v2-multipage precaches all 5 pages + 6 foundation files. Reception Atlas renaming complete. Mobile responsive fixes across all JSX SVGs. 21 missing i18n keys gap-filled; 0 keys missing across pages. Hero conference theme + paper titles tagged for translation (Option 3 hybrid).
- [x] **v9** (2026-06-05) — Analytics UX hardening + repo tidy: zoom+pan for all analytics tabs (CSS `zoom` on scroll container, not `transform:scale`); tooltips stay in viewport; BipNetView force simulation removed (clean static bipartite columns); gray text legibility across all 3 bundles; Receptionsatlas tooltips show birth–death years; Nach Epoche tooltip lists actual figure names. Orphan root-level bundles (`agw_gaze_map.js`, `agw_analysis.js`, `agw_pmi.js`) removed — `dist/` is canonical. SW cache v9-zoom-tooltips.

### Translation infrastructure (unified, Phase 1)
- [x] `const EN` extracted from `index.html` → moved to `agw_strings.js` (250 keys total: 58 analytics + 192 main-site)
- [x] `AGW.applyLang()` extended to handle three patterns: `data-str` (new, both DE+EN in JS), `data-i18n` (legacy text, DE in HTML), `data-i18n-html` (legacy innerHTML)
- [x] `AGW.setLang()` broadcasts `agw-lang-change` custom event so React components can react without their own toggles
- [x] React JSX components subscribe to the event via `useLang()` hook — single language toggle (page nav) now controls Chronik + Reception Atlas + Analytics + Topic Analysis simultaneously
- [x] In-component DE/EN toggle removed from `agw_pmi_viz.jsx`; bilingual support added to `agw_gaze_map.jsx` and `agw_analysis_views.jsx`
- [x] `AGW_en.json` retained as editorial review companion document (not loaded at runtime)
- [x] Domain terminology issues identified and documented (Dogmengeschichte, Theoriegeschichte, Wirtschaftswissenschaften, committee full name)
- [x] **i18n audit clean** — 151 keys used across all 3 main pages, 250 defined; zero missing references
- [x] **Conference theme** tagged: `hero_title` key with DE + EN ("Future Directions in the History of Economic Thought…")
- [x] **Paper titles Option 3 hybrid** (ADR-014, overrides ADR-003) — all 10 plenary/keynote titles tagged with `data-i18n-html="prog_title_N"`; DE original preserved in italic, EN subtitle appended in EN mode via `<span class="title-trans">`; mobile-responsive subtitle wraps to new line ≤640 px

### Multi-page architecture (v8)
- [x] **Foundation extraction** (commit `61435b4`) — inline `<style>`, data constants, render functions, and nav HTML extracted from `index.html` into 4 shared files: `agw_styles.css` (31 KB), `agw_data.js` (60 KB), `agw_app.js` (46 KB), `agw_nav.js` (7 KB)
- [x] **Page split** — `archive.html` (73 KB, archive + publications) and `committee.html` (84 KB, about + history + members + chairs + sister societies + statutes); `index.html` slimmed to 151 KB (-14.6%)
- [x] **Shared nav** — `AGW.renderNav(activePage)` injects header into `#nav-mount` on every page; active-page highlighting; DE/EN persists across navigation via shared `localStorage`
- [x] **Hash anchor redirects** — `index.html#archiv` → `archive.html#archiv`, etc. (7 anchors total) for bookmark continuity
- [x] **Service worker v2-multipage** — PRECACHE expanded from 3 → 13 entries (5 pages + 6 foundation files + 4 CDN resources); offline fallback returns `index.html`
- [x] **Sister societies split** — extracted from `#aktuelles` right column into standalone `#gesellschaften` section on `committee.html`; News-only on `index.html` with link cross-reference
- [x] **Section-nav-strip alignment** — sub-nav with section anchors + iCal button refactored: outer keeps full-width navy background, inner content lives in 1200 px centred container matching `.section-inner` pattern

### Reception Atlas naming (resolved)
- [x] Renamed from "Gaze Map" → "Rezeptionsatlas / Reception Atlas" everywhere (commit `00856cc`)
- [x] React JSX components use central registry: `agwT(key, fallbackEN, fallbackDE)` helper reads from `window.AGW.t()` when available, falls back to in-component string
- [x] Sub-view labels A–E / A–F removed from public-facing titles

### Mobile responsive (resolved)
- [x] **agw_chronik.js** — stat cards auto-fill grid, SVG viewBox + width:100%, two-column stacks (commit `67b5ab4`)
- [x] **All 11 JSX SVGs** — responsive viewBox pattern (`preserveAspectRatio="xMidYMid meet"`, width="100%", height="auto")
- [x] **analytics.html / guide.html** — media queries at 640/480/380 px breakpoints

### Analytics pipeline (svfs_archive, separate development tree)
- [x] **Figure extraction** — 4-format bibliography parser (A author-year, B footnote-numbered, C no-comma, D ALL-CAPS); Claude API disambiguation (claude-sonnet-4-6); post-processing with school corrections → 240 figures, 17 schools (`agw_figures_clean.json`)
- [x] **Year mapping** — complete TAGUNGEN registry (43 volumes); all 43 PDFs renamed to `YYYY_theme-slug_ROMAN.pdf` convention
- [x] **Gaze data** — 228/231 figures have temporal data joined with conference years (`agw_gaze_data.json`)
- [x] **Context extraction** — ±400-char windows around figure mentions with bibliography masking (236 eligible figures)
- [x] **PMI matrix** — 53 Tier-1 curated topics (bilingual DE/EN patterns), TF-IDF emergent vocabulary, temporal PMI per decade; 193 figures × 6138 terms (`agw_pmi_matrix.json`)
- [x] **Six aggregate "stylized facts"** computed and visualized: cumulative canon growth, temporal reach, school entropy, school shares, canon pyramid, key headline numbers
- [x] **React visualization components** (3 files):
  - `agw_gaze_map.jsx` — 3 views (Presence Scatter, Era Heatmap, Top Figures Timeline)
  - `agw_analysis_views.jsx` — 5 views A–E (Tides, Constellation, Rising/Fading, Long Reach, Pillars/Guests)
  - `agw_pmi_viz.jsx` — 6 views A–F (Heatmap, Portrait, Decades, Bridges, Terrain, Web)
- [x] **Build pipeline** — `build_analytics.sh` (esbuild via npx, no global install) compiles JSX → ESM bundles with `--external:react/d3/recharts`; analytics.html loads via importmap from `esm.sh`
- [x] **Line-ending hygiene** (commit `4335b8d`) — `.gitattributes` enforces LF for `*.sh` (was breaking WSL bash execution from Windows checkouts)

### Deployment
- [x] **GitHub repository** — `david-bieri/agw-vfs`, deployed via GitHub Pages
- [x] **CNAME / custom domain** configured
- [x] **Live URL** — `https://david-bieri.github.io/agw-vfs/`
- [x] **Cross-machine workflow** — home machine (`C:\Users\bieri\Documents\GitHub\`) + office machine (`OneDrive - Virginia Tech\Documents\GitHub\`); standard sync via `git fetch origin && git reset --hard origin/main`

### Data
- [x] Full scientific programme 2026 (Do/Fr/Sa) — all 8 papers, social events, assembly, excursion
- [x] Rahmenprogramm — 4 social events with full details
- [x] Partnerprogramm — 4 options with links
- [x] Hotels — 4 options with badges
- [x] Travel info — TILO S10, recommended departure times, Ticino Ticket
- [x] 13 members from 2026 programme with DE + EN research focus
- [x] **Enriched archive** — 150 papers across 18 conferences, country/speaker/venue filter (commit `441b6e1`)
- [x] 26 publication volumes (Band II–XLII, with gaps documented)
- [x] PUB_CHAPTERS for 4 volumes: IV, XXIII, XXXI, XLI
- [x] 8 EconStor open-access URLs with badges

### Contact / attribution
- [x] `bieri@vt.edu` as mailto link in contact card and footer
- [x] VfS link in nav (https://www.socialpolitik.de/de)
- [x] Steger Center and SPIA attribution in footer

---

## Pre-Conference Checklist (Before June 25) 🔴

### Content (urgent)
- [ ] **Saturday lunch** — confirm catering at Steger Center; add to programme if confirmed
- [ ] **PDF watermarks** — remove "Provisorische Version · Änderungen vorbehalten" from both PDFs
- [ ] **EN editorial review** — send `AGW_en.json` to Rainer Klump; resolve all FLAG items (committee name, Dogmengeschichte, Theoriegeschichte) before EN toggle goes live

### Technical (urgent)
- [x] ~~Map embed — Google Maps iframe for Via Settala 8, Riva San Vitale~~ (done in v6)
- [x] ~~OG meta tags — `og:title`, `og:description`, `og:image` for link preview~~ (done in v6; per-page tags added in v8)
- [x] ~~Favicon — SVG or PNG~~ (done in v6 with SPIA logo)
- [x] ~~VfS logo — SVG in nav~~ (done in v6)
- [x] ~~Multi-page restructure~~ (done in v8: index/archive/committee/analytics/guide)
- [x] ~~Service worker for multi-page caching~~ (done in v8: cache v2-multipage, 13 entries)
- [x] ~~Mobile responsive across analytics pages~~ (done in v8: all 11 JSX SVGs + media queries)
- [x] ~~Translation gap-fill~~ (done in v8: 21 missing keys filled, 0 missing across all pages)
- [x] ~~Paper title translation strategy~~ (done in v8: Option 3 hybrid; DE original + EN subtitle)
- [x] ~~Section-nav-strip alignment~~ (done in v8: inner content centred in 1200 px container)
- [ ] **PDF links** — add download buttons for Rahmenprogramm + Partnerprogramm PDFs once watermarks removed
- [ ] **Multi-page deploy smoke test** — after push, verify: (1) all 4 nav items navigate correctly; (2) each page's data renders; (3) DE/EN toggle persists across pages; (4) hash redirects work; (5) all 4 Archive tabs work on archive.html; (6) members search + chairs timeline + statutes render on committee.html

### Deployment (urgent)
- [x] ~~Netlify preview / GitHub repo / GitHub Pages~~ (live since v6)
- [ ] **Share URL** — send to Rainer Klump and registered participants (after smoke test passes)
- [ ] **VfS subdomain** — contact VfS secretariat if canonical URL still wanted by June 25

### Quality
- [ ] **Full DE read-through** — read the site as a participant arriving in Riva on June 25; flag anything unclear
- [ ] **Full EN read-through** — same exercise in EN; catch awkward translations, terminology slips
- [ ] **Mobile sanity check on real device** — open all 5 pages on iPhone/Android; note any horizontal scrolling, cramped layouts, broken cards

---

## Post-Conference Backlog 🟡

### Content gaps
- [ ] **Publication volumes** — add missing volumes: I, VI, VII, VIII, XII, XVII–XXII, XXIV–XXVI, XXXIII, XXXVIII (David has full list)
- [ ] **Publication ToC** — add chapter/contributor data for 22 remaining volumes
- [ ] **Members list** — expand beyond 13 from 2026 programme to full AGW membership
- [ ] **History section** — add AGW founding date and factual institutional history
- [ ] **2026 archive entry** — add the just-completed conference to the archive

### Translation system — Phase 2 (deferred)
- [ ] **Extract remaining DE strings from HTML into `agw_strings.js`** — Phase 2 extracts ~133 DE strings still living in HTML into the central registry for true single-source-of-truth. 250 keys already defined (192 with EN, of which most still rely on DE-from-HTML fallback via `dataset.de` capture). Estimated 1 hour with a Python extraction script.
- [ ] **`AGW_en.json` as build artifact** — once Phase 2 complete, regenerate from `agw_strings.js` automatically rather than maintaining separately
- [ ] **Cross-page search** — currently each page's `Ctrl+K` overlay only searches DOM on that page. Build a JSON content index covering all 3 main pages, load it via fetch on first search. Alternative: defer until SSG migration.

### Analytics — refinement
- [ ] **1991 data gap** — "Osteuropäische Dogmengeschichte" volume has 0% across all 17 schools. Figures from Russian/Polish/Czech traditions didn't get classified. Re-run figure extraction with expanded school taxonomy (add "Eastern European" / "Russian Historical School" / "Marxist-Leninist") OR widen `Other` to capture these.
- [x] ~~Reception Atlas naming~~ (done in v8: commit `00856cc`)
- [x] ~~React component label alignment~~ (done in v8: `agwT()` helper reads from `window.AGW.t()` in all 3 JSX files)
- [ ] **Network visualization decision** — six prototypes built (Options A–F in `agw_network_prototypes.jsx` and `agw_advanced_viz.jsx`); pick the strongest and retire the others

### Technical features
- [ ] **Paper upload backend** — current UI is placeholder; implement via Netlify Forms, Formspree (mailto fallback), or dedicated backend
- [ ] **Print stylesheet for programme pages** — participants print from phone
- [ ] **Accessibility audit** — keyboard navigation for dropdowns, ARIA labels, focus management
- [ ] **PWA test on iOS/Android** — service worker v2-multipage installed in v8; verify add-to-home-screen and offline caching for all 5 pages
- [ ] **Build automation** — GitHub Actions workflow that runs `build_analytics.sh` on JSX-source changes, committing `dist/` automatically. Removes manual rebuild step.

### Longer term
- [ ] **Past conference PDFs** — link archived programmes where available
- [ ] **News/announcements section** — calls for papers, job postings (basic version already in v6)
- [ ] **SSG migration** — Hugo or Astro if content grows significantly (see ADR-007); now less urgent given multi-page split already provides routing

---

## Blocked / Waiting

| Item | Blocked on | Owner |
|---|---|---|
| EN editorial review | Send AGW_en.json to Rainer Klump | David |
| Saturday lunch in programme | Catering confirmation from Steger Center | David |
| PDF watermarks | Remove before publication | David |
| VfS subdomain | Contact VfS secretariat | David |
| Full publication list | David has in print; needs transcription | David |
| Real archive data | Past conference records | Committee |
| Full members list | Obtain from AGW secretariat or Rainer Klump | David |
| 1991 data classification | Re-run extraction with widened taxonomy | David (post-conference) |

---

## Decisions Log Summary
*(Full records in AGW_DECISIONS.md)*

| # | Decision | Date |
|---|---|---|
| ADR-001 | Single self-contained HTML file (no SSG for Phase 1) — **superseded by ADR-013** | 2026-05-29 |
| ADR-002 | VfS/AGW branding independent of VT colours | 2026-05-29 |
| ADR-003 | Paper titles not translated (scholarly convention) — **superseded by ADR-014** | 2026-05-29 |
| ADR-004 | `data-i18n` attribute system (replacing dual-DOM) | 2026-05-29 |
| ADR-005 | EN as editorial document (`AGW_en.json`) with review_status | 2026-05-29 |
| ADR-006 | localStorage + navigator.language persistence cascade | 2026-05-29 |
| ADR-007 | GitHub Pages / Netlify now → VfS subdomain later | 2026-05-29 |
| ADR-008 | Four citation formats: BibTeX, EndNote, RIS, Chicago | 2026-05-29 |
| ADR-009 | Central string registry (`agw_strings.js`) as single source of truth; legacy `data-i18n` pattern remains supported through extended `AGW.applyLang()` | 2026-06-03 |
| ADR-010 | React components react to language changes via `agw-lang-change` custom event broadcast by `AGW.setLang()`; no in-component DE/EN toggle | 2026-06-03 |
| ADR-011 | Analytics pipeline (`svfs_archive`) developed separately from deployment repo (`agw-vfs`); only compiled `dist/*.js` bundles are committed | 2026-06-03 |
| ADR-012 | Chronik tab rendered as vanilla JS (no React overhead); `analytics.html` as separate page for the React-heavy tools | 2026-06-03 |
| ADR-013 | **Multi-page architecture** (overrides ADR-001): monolithic `index.html` split into 5 pages (index/archive/committee/analytics/guide) with shared foundation files (`agw_styles.css`, `agw_data.js`, `agw_app.js`, `agw_nav.js`). Each page under 100 KB excluding hero/footer base64. Service worker precaches all 5 + foundation. | 2026-06-03 |
| ADR-014 | **Paper titles: Option 3 hybrid** (supersedes ADR-003): DE original always shown; EN mode appends translated subtitle in `<span class="title-trans">` (lighter grey, smaller, wraps to new line on mobile). Preserves scholarly artifact while improving accessibility for international attendees. Applied to all 10 plenary/keynote titles in 2026 programme. | 2026-06-03 |
| ADR-015 | **Foundation files extracted** from monolithic HTML: CSS via `<link>`, data via `<script>`, render functions via `<script>`, nav via shared renderer mounted into `#nav-mount`. Enables multi-page reuse without build step. | 2026-06-03 |
| ADR-016 | **Render-guard pattern** — every `render*()`/`init*()` and every DOM access in shared init paths must early-return if its target is missing. Prevents cascade failures when pages share `agw_app.js`. | 2026-06-04 |
| ADR-017 | **Data-file self-containment** — `agw_data.js` must never reference a constant declared in a later-loaded file at top level; doing so aborts the entire data file silently under script load order. | 2026-06-04 |
| ADR-018 | **esm.sh React externalization** — any CDN module that depends on React must be loaded with `?external=react,react-dom`; otherwise it bundles a second React instance whose hook dispatcher is null, causing `useRef` etc. to throw. | 2026-06-05 |
| ADR-019 | **CSS `zoom` over `transform:scale` for scrollable zoom** — `scale()` keeps the layout box at original size, so overflow:auto has nothing to scroll. `zoom` rescales the layout box too; applying it directly to the scroll container means no intermediate layer intercepts mouse events. | 2026-06-05 |

---

## File map (as of v8)

### `agw-vfs/` (deployment repo)
```
index.html             Conference 2026 page (~151 KB)
archive.html           NEW - Scholarly archive + publications (~73 KB)
committee.html         NEW - About + history + members + chairs + societies + statutes (~84 KB)
analytics.html         Standalone analytics page (~13 KB)
guide.html             User manual (~23 KB)

agw_styles.css         NEW - Shared CSS (31 KB, extracted from inline <style>)
agw_strings.js         Translation registry (35 KB, 250 keys)
agw_data.js            NEW - Shared data: CHAIRS, MEMBERS, ARCHIVE, PUBLICATIONS, FMTS, ANNOUNCEMENTS (60 KB)
agw_app.js             NEW - Shared render functions, setLang, initLang, all init* and render* (46 KB)
agw_nav.js             NEW - Shared header + footer renderer with active-page highlighting (7 KB)
agw_chronik.js         Vanilla-JS Chronik panel content (29 KB)
service-worker.js      PWA, cache v2-multipage, precaches 5 pages + 6 foundation files (3 KB)

dist/                  Compiled JSX bundles (built by build_analytics.sh; sources in src-jsx/, gitignored)
  agw_gaze_map.js      100 KB - Reception Atlas (3 views)
  agw_analysis.js      104 KB - Historical Analytics (5 views A–E)
  agw_pmi.js           295 KB - Topic Analysis (6 views A–F)
build_analytics.sh     esbuild compile via npx; LF endings enforced via .gitattributes
AGW_en.json            Editorial review companion (not runtime)
```

### `src-jsx/` (local-only, gitignored)
```
agw_gaze_map.jsx
agw_analysis_views.jsx
agw_pmi_viz.jsx
```

### `svfs_archive/` (analytics development, not in deployment repo)
```
agw_extract_figures.py     Bibliography parser, 4 formats
agw_phase4_*.py            Disambiguation + post-processing
agw_compute_pmi.py         53-topic PPMI matrix
agw_build_gaze_data.py     Year × figure join
agw_*.jsx                  React source for analytics components (deprecated; use src-jsx/)
agw_figures_clean.json     240 figures, 17 schools
agw_gaze_data.json         Temporal data per figure
agw_pmi_matrix.json        PMI scores
```

---

## What's next (after v9 deploy)

Code work is done. Three content tasks remain before June 25:

1. **Content** — confirm Saturday lunch; remove PDF watermarks; send `AGW_en.json` to Klump
2. **Share** — send live URL to registered participants
3. **Smoke test** — walk every page (DE+EN), confirm zoom+pan on analytics, Tab F bipartite net, gaze-map tooltips

Post-conference: Phase 2 i18n (extract remaining DE strings), cross-page Ctrl+K search index, GitHub Actions for JSX rebuilds.
