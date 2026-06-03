# AGW Website — Implementation Progress

**Current version:** v7 (analytics + unified i18n)
**Last updated:** 2026-06-03
**Conference:** June 25–27, 2026 (T-22 days)

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

### Translation infrastructure (unified, Phase 1)
- [x] `const EN` extracted from `index.html` → moved to `agw_strings.js` (195 keys total: 58 analytics + 137 main-site)
- [x] `AGW.applyLang()` extended to handle three patterns: `data-str` (new, both DE+EN in JS), `data-i18n` (legacy text, DE in HTML), `data-i18n-html` (legacy innerHTML)
- [x] `AGW.setLang()` broadcasts `agw-lang-change` custom event so React components can react without their own toggles
- [x] React JSX components subscribe to the event via `useLang()` hook — single language toggle (page nav) now controls Chronik + Gaze Map + Analytics + Topic Analysis simultaneously
- [x] In-component DE/EN toggle removed from `agw_pmi_viz.jsx`; bilingual support added to `agw_gaze_map.jsx` and `agw_analysis_views.jsx`
- [x] `AGW_en.json` retained as editorial review companion document (not loaded at runtime)
- [x] Domain terminology issues identified and documented (Dogmengeschichte, Theoriegeschichte, Wirtschaftswissenschaften, committee full name)

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
- [x] ~~OG meta tags — `og:title`, `og:description`, `og:image` for link preview~~ (done in v6)
- [x] ~~Favicon — SVG or PNG~~ (done in v6 with SPIA logo)
- [ ] **PDF links** — add download buttons for Rahmenprogramm + Partnerprogramm PDFs once watermarks removed
- [x] ~~VfS logo — SVG in nav~~ (done in v6)

### Deployment (urgent)
- [x] ~~Netlify preview / GitHub repo / GitHub Pages~~ (live since v6)
- [ ] **Share URL** — send to Rainer Klump and registered participants
- [ ] **VfS subdomain** — contact VfS secretariat if canonical URL still wanted by June 25

### Analytics (this session, T-22 days)
- [ ] **JSX source files** — store in `src-jsx/` outside repo root; rebuild bundles via `build_analytics.sh` whenever a JSX changes
- [ ] **Test analytics.html on live site** — confirm Gaze Map / Analytics / Topic Analysis all render and respond to DE/EN toggle
- [ ] **Test Chronik tab** — verify it loads on Archive section and language toggle propagates
- [ ] **Mobile sanity check** — analytics pages haven't been mobile-tested; viewport may need adjustment for the heatmap and bipartite network

---

## Post-Conference Backlog 🟡

### Content gaps
- [ ] **Publication volumes** — add missing volumes: I, VI, VII, VIII, XII, XVII–XXII, XXIV–XXVI, XXXIII, XXXVIII (David has full list)
- [ ] **Publication ToC** — add chapter/contributor data for 22 remaining volumes
- [ ] **Members list** — expand beyond 13 from 2026 programme to full AGW membership
- [ ] **History section** — add AGW founding date and factual institutional history
- [ ] **2026 archive entry** — add the just-completed conference to the archive

### Translation system — Phase 2 (deferred)
- [ ] **Extract DE strings from HTML into `agw_strings.js`** — currently 137 main-site keys have only EN values; DE comes from HTML at runtime. Phase 2 extracts ~133 DE strings into the central registry for true single-source-of-truth. Estimated 1 hour with a Python extraction script.
- [ ] **`AGW_en.json` as build artifact** — once Phase 2 complete, regenerate from `agw_strings.js` automatically rather than maintaining separately

### Analytics — refinement
- [ ] **1991 data gap** — "Osteuropäische Dogmengeschichte" volume has 0% across all 17 schools. Figures from Russian/Polish/Czech traditions didn't get classified. Re-run figure extraction with expanded school taxonomy (add "Eastern European" / "Russian Historical School" / "Marxist-Leninist") OR widen `Other` to capture these.
- [ ] **Naming: "Gaze Map" → "Rezeptionsatlas / Reception Atlas"** — agreed in this session; one edit needed in `agw_strings.js` (keys `tab_gaze` and `tool_gaze`). React component internal labels would also benefit from renaming for full consistency.
- [ ] **React component label alignment** — sub-view names inside JSX (e.g. "Presence Scatter") should read from `window.AGW.t('gaze_A', lang)` rather than being hardcoded with `lang.t()` ternaries. Brings them under central registry control.
- [ ] **CPAP common-core compliance check** — verify against SCHEV; reflects analytics-pipeline scope creep flagged in white paper
- [ ] **Network visualization decision** — six prototypes built (Options A–F in `agw_network_prototypes.jsx` and `agw_advanced_viz.jsx`); pick the strongest and retire the others

### Technical features
- [ ] **Paper upload backend** — current UI is placeholder; implement via Netlify Forms, Formspree (mailto fallback), or dedicated backend
- [ ] **Print stylesheet for programme pages** — participants print from phone
- [ ] **Accessibility audit** — keyboard navigation for dropdowns, ARIA labels, focus management
- [ ] **PWA test on iOS/Android** — service worker installed in v6; verify add-to-home-screen and offline caching
- [ ] **Build automation** — GitHub Actions workflow that runs `build_analytics.sh` on JSX-source changes, committing `dist/` automatically. Removes manual rebuild step.

### Longer term
- [ ] **Past conference PDFs** — link archived programmes where available
- [ ] **News/announcements section** — calls for papers, job postings (basic version already in v6)
- [ ] **SSG migration** — Hugo or Astro if content grows significantly (see ADR-007)

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
| ADR-001 | Single self-contained HTML file (no SSG for Phase 1) | 2026-05-29 |
| ADR-002 | VfS/AGW branding independent of VT colours | 2026-05-29 |
| ADR-003 | Paper titles not translated (scholarly convention) | 2026-05-29 |
| ADR-004 | `data-i18n` attribute system (replacing dual-DOM) | 2026-05-29 |
| ADR-005 | EN as editorial document (`AGW_en.json`) with review_status | 2026-05-29 |
| ADR-006 | localStorage + navigator.language persistence cascade | 2026-05-29 |
| ADR-007 | GitHub Pages / Netlify now → VfS subdomain later | 2026-05-29 |
| ADR-008 | Four citation formats: BibTeX, EndNote, RIS, Chicago | 2026-05-29 |
| ADR-009 | Central string registry (`agw_strings.js`) as single source of truth; legacy `data-i18n` pattern remains supported through extended `AGW.applyLang()` | 2026-06-03 |
| ADR-010 | React components react to language changes via `agw-lang-change` custom event broadcast by `AGW.setLang()`; no in-component DE/EN toggle | 2026-06-03 |
| ADR-011 | Analytics pipeline (`svfs_archive`) developed separately from deployment repo (`agw-vfs`); only compiled `dist/*.js` bundles are committed | 2026-06-03 |
| ADR-012 | Chronik tab rendered as vanilla JS (no React overhead); `analytics.html` as separate page for the React-heavy tools | 2026-06-03 |

---

## File map (as of v7)

### `agw-vfs/` (deployment repo)
```
index.html             Main microsite (313 KB after Phase 1)
agw_strings.js         Central translation registry (27 KB, 195 keys)
agw_chronik.js         Vanilla-JS Chronik panel content (28 KB)
analytics.html         Standalone analytics page (11 KB)
guide.html             User manual (22 KB)
build_analytics.sh     Compile JSX → dist/*.js via npx esbuild
dist/
  agw_gaze_map.js      Compiled Gaze Map bundle (~85 KB expected)
  agw_analysis.js      Compiled Analytics A–E (~90 KB)
  agw_pmi.js           Compiled Topic Analysis A–F (~145 KB)
AGW_en.json            Editorial review companion (not runtime)
```

### `svfs_archive/` (analytics development, not in deployment repo)
```
agw_extract_figures.py     Bibliography parser, 4 formats
agw_phase4_*.py            Disambiguation + post-processing
agw_compute_pmi.py         53-topic PPMI matrix
agw_build_gaze_data.py     Year × figure join
agw_*.jsx                  React source for analytics components
agw_figures_clean.json     240 figures, 17 schools
agw_gaze_data.json         Temporal data per figure
agw_pmi_matrix.json        PMI scores
```

