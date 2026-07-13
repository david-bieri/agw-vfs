# AGW_CLAUDE.md — Session Entry Point

**Read this and `AGW_SESSION_NOTES.md` before doing anything.** This file is slow-moving project context and non-negotiables; `AGW_SESSION_NOTES.md` is authoritative for present, undeployed state.

**Current version:** v61 (SW cache `agw-2026-v61-theme-view-corpus`) · **Repo:** `david-bieri/agw-vfs` · **Live:** `www.agw-vfs.de`
**Status:** post-conference. The 46th Jahrestagung (Riva San Vitale, 25–27 June 2026) has concluded; the site is now the committee's evergreen home.

---

## What this is

Static, multi-page site for the AGW — the VfS standing committee for the history of economic thought. **8 pages**, shared foundation files, vanilla JS. The only build step is the React analytics bundles (esbuild → `dist/`, loaded via importmap from esm.sh).

**Pages:** `index.html` (committee landing) · `events.html` · `jahrestagung-2026.html` · `archive.html` · `committee.html` · `publications-members.html` · `analytics.html` · `guide.html`
**Nav:** Aktuelles · Veranstaltungen · Forschung · Über den AGW
**Foundation JS/CSS:** `agw_styles.css`, `agw_strings.js`, `agw_data.js`, `agw_app.js`, `agw_nav.js`, `agw_chronik.js`, `agw_hero_viz.js`, `agw_schools_net.js`, `agw_gallery.js`, `agw_highlights.js`
**Scholarly record:** `agw_volume_chapters.js` (`VOLUME_CHAPTERS` — 288 chapters, 43 volumes; `VOLUME_META` — year/editors/ISBN/DOI for all 43), `agw_member_pubs.js` (`MEMBER_PUBS`, `PUB_THEMES` ×17), `agw_member_pubs_app.js`, `agw_cite.js`
**Data:** `data/gallery.js`, `data/highlights.js`, `data/*.json`
**Tools:** `tools/agw_thumbnail.py`, `gallery_add.py`, `dh_fetch.py`, `dh_toc.py`, `pdf_toc.py`, **`themes.csv`**, `pubs_import.py`, `orcid_seed.py`, `cv_extract.py`

### Five things that will bite you

1. **`tools/themes.csv` is load-bearing.** It is the per-chapter theme curation overlay (keyed `volN|pages`), read by `dh_toc.py --build`. Rebuilding the corpus *without* it silently regenerates every theme as `GUESSED` and destroys two passes of human curation. Never gitignore it. (ADR-030)
2. **Aggregate views count `VOLUME_CHAPTERS`; member views count `MEMBER_CHAPTERS`.** Confusing the two has now caused two silent, plausible, wrong outputs — a contributor ranking missing its most prolific author, and theme pills undercounting by half. (ADR-033)
3. **`PUBLICATIONS` has `year:null` for 31 of 43 volumes.** Never read a volume year from it. Use `VOLUME_META`. (ADR-030)
4. **A guard that returns empty hides the fault.** ADR-016 stops one broken thing from cascading — and is exactly why `archive.html` rendered an empty map for weeks with no console error. When something looks blank, suspect a missing dependency, not a logic bug. (`AGW_DEBUG.md`)
5. **Verify against `raw.githubusercontent.com`, never the Pages CDN.** The CDN lies for minutes; raw does not.

## Non-negotiables

- **Bilingual (DE/EN).** All UI text via `agw_strings.js`; toggle broadcasts `agw-lang-change`. Scholarly titles (papers, books) stay German in both modes (ADR-014). New on-page features render live HTML, never baked-in-image text (ADR-024).
- **Render guards.** Shared code runs on every page — every `render*/init*` must early-return on a missing target element (ADR-016).
- **Foundation files stay extracted** (ADR-015); pages are thin. `analytics.html` is self-contained (inline `<style>`, no `agw_styles.css`).
- **`dist/` bundles are the deploy artifact** for React analytics; never ship HTML/CSS without the compiled `dist/*.js`.
- **Service worker:** bump `const CACHE` on any change to a precached asset. Images live under `img/` and are **runtime-cached, never precached**.
- **Custom-domain paths** are root-absolute or relative — never `/agw-vfs/`-prefixed (ADR-021). A domain/path change must sweep `agw_app.js` too (iCal URL, QR text, SW registration).

## Working environment

- Windows/PowerShell primary; WSL for the analytics esbuild; deploy = copy from `outputs\` → `git add`/`commit`/`push`.
- Cross-machine sync: `git fetch origin && git reset --hard origin/main` (never `git pull`).
- Verify live files via `raw.githubusercontent.com/david-bieri/agw-vfs/main/<file>` (faster/more accurate than the Pages URL).
- "Yes" = execute all previously offered suggestions. Ship critical fixes independently before layering feature work.

## Working style

Direct numbered action sequences; explicit before/after verification at each phase; surface architectural constraints before implementing. David notes reading social tone is hard for him — explicit register interpretation in colleague comms is welcome. Handover triggers: "handover / wrap up / switching chats / compaction prep / end of session" → regenerate `AGW_SESSION_NOTES.md` per `AGW_HANDOVER.md`.

## Key recent work (see AGW_PROGRESS.md for the full log)

Custom-domain migration · events model + `events.html` · archival `jahrestagung-2026.html` · committee-home rebuild of `index.html` · hero constellation (`agw_hero_viz.js`) · Denkschulen panel (`agw_schools_net.js`) · **Impressionen gallery + lightbox** · **"Im Fokus" landing highlight** · **social-card generator** (`tools/agw_thumbnail.py`) · first `og:image`.

## Docs

`AGW_README.md` (what/where) · `AGW_PROGRESS.md` (milestones) · `AGW_DECISIONS.md` (ADR-001…025) · `AGW_SESSION_NOTES.md` (in-flight) · `AGW_HANDOVER.md` (protocol) · `AGW_DEBUG.md` (debug discipline) · `AGW_DESIGN_AUDIT.md` (cohesion audit, 2026-07-10).
