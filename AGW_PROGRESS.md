# AGW Website — Implementation Progress

**Current version:** v48 (SW cache `agw-2026-v48-fokus`)
**Last updated:** 2026-07-10
**Status:** Post-conference — the 46th Jahrestagung (25–27 June 2026) has concluded.

---

## Phase 1 — Pre-conference (v1–v9) ✅ complete

Conference microsite → multi-page site. Delivered: programme, Rahmenprogramm, venue/travel, members, chairs, archive (150 papers / 18 conferences), publications with 4 citation formats, PWA service worker, archive map (Leaflet), global search (Ctrl+K), `data-i18n` DE/EN system, the multi-page split (5 pages + foundation files), the React analytics suite (Rezeptionsatlas, Analytics, Topic Analysis) with the `agw_strings.js` registry, and analytics UX hardening. Detail is preserved in `AGW_DECISIONS.md` (ADR-001…019) and git history.

## Phase 2 — Post-conference standing-committee site ✅ (through v48)

The site evolved from a conference microsite into the committee's permanent home:

- **Custom domain** `www.agw-vfs.de` live (GitHub Pages hosting unchanged). Base-path sweep incl. `agw_app.js` iCal/QR/SW registration (ADR-021).
- **Events model** — `ARCHIVE` (own Jahrestagungen, all past) + `EVENTS` (affiliated dated events) + `EVENT_NETWORKS`; `events.html` merges and derives past/upcoming (ADR-022). Erfurt Doktorandenseminar seeded.
- **Archival event pages** — `jahrestagung-2026.html` as the template; `ARCHIVE` entries carry a `page:` link (ADR-023).
- **Committee-home rebuild** — `index.html` retired the countdown/registration framing; now hero + "Im Fokus" + Nächste Jahrestagung + Aktuelles + Bereiche + Auf einen Blick + Kontakt.
- **Hero constellation** (`agw_hero_viz.js`) — Denkschulen figures; the old five-mode randomizer was retired.
- **Denkschulen panel** (`agw_schools_net.js`) — vanilla force network in `analytics.html` (81 figures · 14 schools · 199 edges).
- **Nav restructure + sticky-nav fix** (v44) — `#nav-mount{display:contents}` so the sticky bar actually pins; on-scroll shadow.
- **Impressionen gallery + lightbox** (v45) on `jahrestagung-2026.html` — `data/gallery.js` manifest, AVIF/WebP/JPEG pipeline (`tools/gallery_add.py`), accessible lightbox; images runtime-cached, never precached. Reordered "Impressionen aus Riva" to lead (v46); EXIF-orientation fix for two portrait shots (v47).
- **"Im Fokus" landing highlight** (v48) — featured diptych + rail (volume, op-ed), live bilingual HTML (ADR-024); first `og:image` on the site.
- **Social-card generator** — `tools/agw_thumbnail.py` (4 styles × og/square/portrait, bundled fonts) for social + og:image (ADR-025).
- **Docs consolidated** — decisions log backfilled (ADR-013/14/15), merged (020), extended (021–025); misfiled/redundant files removed; `.gitignore` rules added.

## File map (v48)

```
index.html events.html jahrestagung-2026.html archive.html committee.html analytics.html guide.html
agw_styles.css agw_strings.js agw_data.js agw_app.js agw_nav.js agw_chronik.js
agw_hero_viz.js agw_schools_net.js agw_gallery.js agw_highlights.js
data/  gallery.js highlights.js analysis_data.json lineage_data.json sankey_flows.json unified_network.json
dist/  (compiled React analytics bundles; sources in gitignored src-jsx/)
img/gallery/  img/highlights/
tools/ agw_thumbnail.py gallery_add.py fonts/ THUMBNAIL.md GALLERY.md examples/
service-worker.js  manifest.json  CNAME  .github/workflows/
```

---

## What's next

- **v49 (ready to build):** "Im Fokus" rail tiles — Option 1 (a "Der AGW in Zahlen" stats tile with live member/volume counts + a Stammbaum analytics teaser, linking to both `analytics.html` and `committee.html`); and add the **Joint ESHET–HES Nice conference** (26–29 May 2026) to `EVENTS`. Spec + data in `AGW_SESSION_NOTES.md`.
- **Design cohesion pass** — act on `AGW_DESIGN_AUDIT.md` (radius/hover/eyebrow token cleanup; resolve the gold accent).
- **Member "Forschung der Mitglieder" feature** — static-vs-backend + vitae/GDPR decision (original request, still open).
- **Analytics data** — complete `lineage_reference_edges.csv` (64 reference-track edges); school-laning correction on `unified_network.json` (Jevons, Sraffa).
- **Lösch correspondence companion site** — separate future project.
