# AGW_CLAUDE.md — Session Entry Point

**Read this and `AGW_SESSION_NOTES.md` before doing anything.** This file is slow-moving project context and non-negotiables; `AGW_SESSION_NOTES.md` is authoritative for present, undeployed state.

**Current version:** v48 (SW cache `agw-2026-v48-fokus`) · **Repo:** `david-bieri/agw-vfs` · **Live:** `www.agw-vfs.de`
**Status:** post-conference. The 46th Jahrestagung (Riva San Vitale, 25–27 June 2026) has concluded; the site is now the committee's evergreen home.

---

## What this is

Static, multi-page site for the AGW — the VfS standing committee for the history of economic thought. **7 pages**, shared foundation files, vanilla JS. The only build step is the React analytics bundles (esbuild → `dist/`, loaded via importmap from esm.sh).

**Pages:** `index.html` (committee landing) · `events.html` · `jahrestagung-2026.html` · `archive.html` · `committee.html` · `analytics.html` · `guide.html`
**Nav:** Aktuelles · Veranstaltungen · Forschung · Über den AGW
**Foundation JS/CSS:** `agw_styles.css`, `agw_strings.js`, `agw_data.js`, `agw_app.js`, `agw_nav.js`, `agw_chronik.js`, `agw_hero_viz.js`, `agw_schools_net.js`, `agw_gallery.js`, `agw_highlights.js`
**Data:** `data/gallery.js`, `data/highlights.js`, `data/*.json` · **Tools:** `tools/agw_thumbnail.py`, `tools/gallery_add.py`

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
