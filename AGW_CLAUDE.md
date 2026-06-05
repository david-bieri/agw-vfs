# AGW Website — Claude Session Context

This file is read at the start of every Claude session working on the AGW website.
Keep it concise. Full detail lives in the files listed below.

---

## What This Project Is

Conference microsite and standing committee website for the
**Ausschuss für die Geschichte der Wirtschaftswissenschaften (AGW)**,
the standing committee for the history of economic thought within the
Verein für Socialpolitik (VfS).

**Conference:** Jahrestagung 2026, June 25–27, Riva San Vitale, Switzerland
**Owner:** David Bieri (bieri@vt.edu), Virginia Tech SPIA

---

## Read These Files First

**At session start, always:**
0. `AGW_SESSION_NOTES.md` — live in-flight state from the previous session (pending deploys, open questions, latent issues). **Read this BEFORE doing anything else, even before asking the user what they want.** If it's missing, fall through to file 1.

**Project context (slow-changing reference):**
1. `AGW_README.md` — architecture, site structure, content update guide
2. `AGW_PROGRESS.md` — what's done, pre-conference checklist, backlog
3. `AGW_DECISIONS.md` — only if facing a design/architecture question (19 ADRs as of v9: ADR-016 render guards, ADR-017 data-file self-containment, ADR-018 esm.sh React externalize, ADR-019 CSS zoom vs transform)

**Protocol for ending the session:**
4. `AGW_HANDOVER.md` — the skill that defines how to write `AGW_SESSION_NOTES.md` at session end. Invoke when David says "handover", "wrap up", "switching chats", "compaction prep", or at any version milestone.

---

## Current Version: v9 (analytics UX + repo tidy)

**Live site:** `https://david-bieri.github.io/agw-vfs/`
**Repo:** `david-bieri/agw-vfs` (GitHub Pages)

**Five pages:**
- `index.html` (~151 KB) — Conference 2026: hero, programme, social, logistics, news
- `archive.html` (~73 KB) — archive (4 tabs: List/Map/Speakers/Chronik) + publications
- `committee.html` (~84 KB) — about, history, members, chairs, sister societies, statutes
- `analytics.html` (~13 KB) — Reception Atlas + Historical Analytics + Topic Analysis
- `guide.html` (~23 KB) — user manual

**Six foundation files** shared across pages:
- `agw_styles.css` — all CSS (42 KB; grew from 31 KB after SVG-icon utilities + a11y batch in v3-ui-batch)
- `agw_strings.js` — translation registry (~36 KB, ~251 keys; `lbl_map` added in v3-ui-batch)
- `agw_data.js` — CHAIRS, MEMBERS, ARCHIVE, PUBLICATIONS, FMTS, ANNOUNCEMENTS (60 KB)
- `agw_app.js` — render functions, setLang, init* (49 KB; grew from 46 KB after setLang null-guards + SVG-icon escape fixes)
- `agw_nav.js` — shared header + mobile menu renderer (9 KB)
- `agw_chronik.js` — vanilla-JS Chronik panel (29 KB)

**Compiled bundles** (built via `build_analytics.sh`, sources in gitignored `src-jsx/`):
- `dist/agw_gaze_map.js` — Reception Atlas (~101 KB)
- `dist/agw_analysis.js` — Historical Analytics A–E (~106 KB)
- `dist/agw_pmi.js` — Topic Analysis A–F (~303 KB)

**PWA:** service-worker.js with cache `agw-2026-v9-zoom-tooltips`, precaches all 5 pages + 6 foundation files. Bump pattern: v1 → v2-multipage → v3-ui-batch → v4-analytics-fix → v5-print-restore → v6-analytics-ux → v7-zoom-pan-colors → v8-bipnet-fix → v9-zoom-tooltips. Every change to a precached asset requires a cache-version bump.
**Companion:** `AGW_en.json` (editorial review document for Rainer Klump, not loaded at runtime)
**Status:** Live and functional. Pre-conference content tasks outstanding (see `AGW_PROGRESS.md` checklist).

---

## Architecture in One Paragraph

Five static HTML pages served from GitHub Pages, sharing six foundation files (`agw_styles.css`, `agw_strings.js`, `agw_data.js`, `agw_app.js`, `agw_nav.js`, `agw_chronik.js`). Each page has `<div id="nav-mount"></div>`; `AGW.renderNav('pageId')` injects the shared header + mobile menu and highlights the active page. German is the default language in HTML; `agw_strings.js` exports `window.AGW.S = {key: {de, en}}` and `AGW.applyLang(lang)` swaps text by reading `data-i18n` / `data-i18n-html` / `data-str` attributes. The cascade for initial language is localStorage → `navigator.language` → German. Data arrays (`MEMBERS`, `ARCHIVE`, `PUBLICATIONS`, `CHAIRS`, `ANNOUNCEMENTS`) live in `agw_data.js` and feed `render*()` functions that early-return if their target DOM is missing (multi-page safety). React-based analytics live on `analytics.html` and subscribe to language via the `agw-lang-change` CustomEvent broadcast by `AGW.setLang()`.

---

## Non-Negotiable Rules

**Branding**
- Navy `#1B3A6B` (VfS primary), not VT maroon `#861F41`
- VT appears only in footer/contact card as host institution credit for 2026 only
- EB Garamond (headings/display) + Source Sans 3 (body/UI)

**Language**
- Paper titles use **Option 3 hybrid** (ADR-014): German original always shown; EN mode appends translated subtitle in `<span class="title-trans">`. Speaker names, addresses, and venue names remain German regardless of toggle.
- Only UI chrome, section labels, prose, and paper-title English subtitles are translated
- `agw_strings.js` (the `window.AGW.S` registry) is the single source of truth for EN translations
- Every `data-i18n` / `data-i18n-html` / `data-str` key must have an entry in `agw_strings.js`; run the audit script in any session that adds keys
- FLAG items in `AGW_en.json` require Rainer Klump sign-off before going live (file is review-only, not loaded at runtime)

**Content**
- `bieri@vt.edu` is the correct email — appears as `mailto:` in contact card and footer
- Saturday lunch at Steger Center is unconfirmed — do not add to programme until confirmed
- "Provisorische Version" watermark must be removed from PDFs before linking

**Architecture**
- No bundler for the 5 pages or 6 foundation files; static HTML + plain CSS + plain JS only. The React analytics components are the only exception: built via `build_analytics.sh` (esbuild) into `dist/`.
- Foundation files MUST stay extracted — do not inline CSS/JS back into pages (ADR-015)
- Every `render*()` / `init*()` function MUST early-return if its primary target DOM element is missing (`if (!el) return;` as the first line). This is non-negotiable: pages share `agw_app.js`, so a missing-element throw on one page cascades and breaks unrelated init on that page. **This extends to every DOM access in shared init paths** — e.g. `setLang` must null-guard `btn-de`/`btn-en` because those are mounted by `renderNav`, which runs AFTER `agw_app.js` init. ADR-016.
- Data files (`agw_data.js`) MUST be self-contained — never reference a constant declared in a later-loaded file at top level. The reference will hit the temporal dead zone, abort the entire data file silently, and leave everything below undefined site-wide. ADR-017.
- **esm.sh modules in `analytics.html` that depend on React MUST use `?external=react,react-dom`** — otherwise the module bundles its own React, creating two instances with separate hook dispatchers; calls like `useRef` then throw on null. The recharts case was the manifestation: `"recharts": "https://esm.sh/recharts@2?external=react,react-dom"`. Pattern applies to any future React-dependent bundle. ADR-018.
- `setLang()` re-renders all JS-driven sections: `renderChairs()`, `renderMembers()`, `renderArchive()`, `renderPubs()`, `renderAnnouncements()`, `updateCountdown()`. Anything added to JS-driven render must be added to `setLang()` too.
- Service worker cache version (`agw-2026-vN-...`) must be bumped on any change to precached assets, or clients will serve stale files

---

## File Map

```
# Pages (5)
index.html              Conference 2026 page
archive.html            Scholarly archive + publications
committee.html          About + history + members + chairs + societies + statutes
analytics.html          React analytics (Reception Atlas + Analytics + Topic Analysis)
guide.html              User manual

# Foundation (6)
agw_styles.css          All CSS
agw_strings.js          Translation registry (window.AGW.S)
agw_data.js             Shared data arrays
agw_app.js              Render functions, setLang, init*
agw_nav.js              Shared header + mobile menu
agw_chronik.js          Vanilla-JS Chronik panel

# Compiled bundles
dist/agw_gaze_map.js    Reception Atlas (esbuild from src-jsx/, sources gitignored)
dist/agw_analysis.js    Historical Analytics A–E
dist/agw_pmi.js         Topic Analysis A–F
build_analytics.sh      Rebuild dist/ from src-jsx/ (run in WSL on Windows)

# PWA + companions
service-worker.js       Cache v9-zoom-tooltips, precaches all 5 pages + 6 foundation files
manifest.json           PWA manifest
AGW_en.json             Editorial review document for Klump — not loaded at runtime

# Markdown / project memory
AGW_README.md           Project overview + content update guide
AGW_PROGRESS.md         Version milestones + checklists + backlog
AGW_DECISIONS.md        Architecture decisions (ADRs)
AGW_HANDOVER.md         Skill: how to produce/consume session handovers
AGW_SESSION_NOTES.md    Live in-flight state — rewritten every session
AGW_CLAUDE.md           This file
```

---

## Immediate Next Tasks

See `AGW_PROGRESS.md` → "Pre-Conference Checklist" for remaining tasks. Code work complete as of v9 — remaining items are content (Saturday lunch, PDF watermarks, AGW_en.json to Klump) and sharing the URL with registrants.
