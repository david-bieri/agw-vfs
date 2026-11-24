# AGW Session Notes

**Last session:** 2026-11-24
**Topic:** Privacy hardening — no third-party request on page load (fonts, Leaflet, qrcodejs, analytics libraries all self-hosted); housekeeping (notes v66–v77, AGW_HANDOVER.md retired, ADR-034).
**Horizon:** none scheduled — the 47. Jahrestagung (2027) is not yet in `EVENTS`.
**Current version:** v80 (`agw-2026-v80-page-check`) — verified on raw.githubusercontent.com.

---
## Project configuration
**Prefix:** AGW
**Registry:** AGW_PROGRESS.md + AGW_DECISIONS.md
**Dispatch:**
  → git push           (git add <files> && git commit -m "..." && git push)
**Horizon:** [conference date / T-minus days]
---

> **This file is in a public repo.** Nothing private here: no money, no attendee
> lists, no private addresses, no personal notes. Those belong in the notes Doc.

## 1. Completed

**Between sessions, 13–17 Jul (v66–v77, reconstructed from `git log`):**
- ✓ v66–v68 — **roster sync with the VfS list (Stand 07/2026): `MEMBERS` 49 → 52** (Nientiedt, Grudev, Kremser); all 52 titles match the official list; Kolev and Greitens affiliations corrected; optional `MEMBERS.orcid` with an inlined iD mark (33 members); update notice also listens for `updatefound` (`AGW.showUpdateBar()` to test).
- ✓ v68 — **two fabricated `MEMBER_PUBS` entries removed** (neither DOI resolved); `orcid_seed.py --verify` resolves every DOI. Two unsafe ORCID iDs blanked and added to `BLOCKED` (cd248fd).
- ✓ v69–v76 — **production hero constellation**: factor-sized nodes, click → Stammbaum deep-link, school legend + tooltip + mobile tap, top 40, rebalanced school palette; hero build inputs committed (repo-only regen). No v70/v71 exist.
- ✓ v77 — analytics back button reads "Zur Startseite / Back to Home".

**This session (2026-11-24):**
- ✓ **v78** `fonts/` — EB Garamond + Source Sans 3 self-hosted (same weights as the Google URL; latin + latin-ext). Fixed: guide/analytics footers carried Cloudflare email-obfuscation remnants (dead maintainer link).
- ✓ **v79** `vendor/` — Leaflet 1.9.4, qrcodejs, and the analytics React/recharts/d3 (was esm.sh, ~180 requests a visit) as one esbuild `--splitting` build: one React instance (ADR-018 amended). Fixed: **the committee QR box had been empty since the multi-page split** (qrcodejs loaded on the wrong page).
- ✓ **v80** `tools/page_check.py` — all 10 pages × 1280/390/320. **Result: zero third-party requests on load, zero console errors.** After user action, only `{a,b,c}.tile.openstreetmap.org`.
- ✓ Housekeeping: these notes (v66–v77 reconstructed).
- ? Retire AGW_HANDOVER.md; ADR-034; deploy-pages v5 — next commits.

## 2. Pending dispatch

**Nothing.** Docs-only commits did not bump the SW (no precached asset changed).

## 3. Decisions

- **ADR-034 — derive, never hardcode** (with the fallback-slot corollary) — to be written this session.
- **ADR-018 amended:** esm.sh retired; `vendor/esm/` is one build. Never swap a single file in it; rebuild with `tools/vendor/build_vendor.sh`, click every analytics tab, then commit.
- **Standing release check:** `python tools/page_check.py` before every release. Its target is no third party before user action.

## 4. Latent issues

- **The conference map loads OSM tiles on scroll** (IntersectionObserver), not on click. Scrolling is not consent. A click-to-load placeholder (DE/EN) would make OSM consent-gated; the archive map is already behind a tab click.
- **Overflow at 320 px** (older than this session): `events.html` +4 px (`.ev-card` min width), `archive.html` +14 px (view/filter buttons don't wrap), `styleguide.html` +55 px (token table).
- **OCR artefacts in `agw_volume_chapters.js`:** Greek Κ in "V. Κ . Dmitriev" (l. 350), Greek Ε in "Hans-Ε. Loef" (l. 503). They break search and citation export.
- **Private content in a public repo:** earlier versions of this file (e.g. `bed1d71`) contain attendee, booking and payment details, and `AGW_CLAUDE.md` § Working style has a personal note. Removing the history needs a rewrite; that is David's call.
- Carried: `MEMBER_PUBS` co-authorship is single-`mid`; `overlord.bib` lost ligatures; only 5 of 46 conferences have a `host`; ORCID homonyms remain the standing hazard (check `venue`, not name + affiliation).

## 5. Open questions

### 🔴 Persistent open items
- **Impressum + Datenschutzerklärung** — pending since 2026-07 (seventh session). A prerequisite under ADR-031. Blocked on the Diensteanbieter facts, or one email to the VfS Geschäftsstelle. **Easier now:** the privacy notice only has to cover OSM tiles (after user action), GitHub Pages hosting and the SW cache. Google, Cloudflare/cdnjs and esm.sh are gone.
- **Participant settlement email** — pending since 2026-07-13. Drafted; recipients, amounts and two ambiguous mailboxes are private and are kept out of this file.
- **`p4901` gallery caption** — pending since 2026-07-10. It is the first photo in the grid.

### Session-specific
- Click-to-load for the conference map (§4)? It needs two DE/EN strings.
- The five member emails (Molavi, Wohlgemuth, Blomert, Lorenz, Weizsäcker); Küsters' preferred affiliation; Ehnts 2019 / Barens 2011 still unchecked; `archive.html` loaded with no hash: does it still scroll to the bottom?

## 6. Suggested next session

"Read AGW_SESSION_NOTES.md, then build click-to-load for the conference map and draft the Datenschutzerklärung around the remaining processors (GitHub Pages, OSM tiles)."
