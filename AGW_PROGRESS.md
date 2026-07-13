# AGW Website — Implementation Progress

**Current version:** v61 (SW cache `agw-2026-v61-theme-view-corpus`)
**Last updated:** 2026-07-12
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

## Phase 3 — The scholarly record (v49–v61) ✅

The site acquired its own bibliographic backbone.

- **Data repairs (v51)** — `data/unified_network.json` was corrupt in a way nobody had noticed: the `school` field on **32 of 81 nodes** held a *lane id* (`aut`, `hist`, `raum`…) instead of a school name, so four analytics bundles had been grouping a third of the corpus off a broken key. Also: 19 death years backfilled (`d:null` had meant both "alive" and "unknown"), Walras/Pareto re-laned, two copy-paste biography bleeds fixed (Alfred Weber carried Max Weber's blurb; Franz Böhm carried Böhm-Bawerk's).
- **Post-conference news (v52)** — `ANNOUNCEMENTS` rebuilt; the dead `icon:` field (an invalid `\U0001F4DA` escape printing the literal string `U0001F4DA` on the landing page) removed.
- **Member data model (v53–v55)** — stable `id` slugs on all 48 members; `MEMBER_PUBS` re-keyed on `mid` (ADR-028); type badges; ORCID/homepage links; `spatial` theme added; `pubs_import.py` v3.
- **The Tagungsband chapter corpus (v58)** — **288 chapters across all 43 volumes**, harvested from the D&H eLibrary and cross-checked against PDF outlines, with `VOLUME_META` (year, editors, ISBN, DOI) for all 43 (ADR-030). Themes curated by hand over two passes; **`tools/themes.csv` is the overlay and must stay in the repo**. 47 of 48 members appear in the corpus.
- **Volume tables of contents** — `archive.html` volume tiles now expand into their real ToC (author · title · pages, deep-linked into the eLibrary), replacing the "Inhaltsverzeichnis wird ergänzt" placeholder.
- **"Forschung der Mitglieder" spine** — member cards render two blocks: *Beiträge zu AGW-Tagungsbänden* (primary) then *Weitere Publikationen* (supplement).
- **Citation export (v58)** — `agw_cite.js`: Chicago / Harvard / BibTeX per chapter, bulk `.bib` per volume and per member (ADR-032).
- **Member supplements (v60)** — 19 curated entries for the 13 thin-record members; **four working papers upgraded to their published versions** (three of four checked had been published, one under a changed title).
- **Archive fixes (v60)** — `archive.html` loaded Leaflet's **CSS but not its JS**, so the Karte tab had been silently rendering an empty box since the multi-page split; the Referenten tab was rebuilt on the 43-volume corpus with name folding, having previously ranked contributors from 150 talks covering 18 of 46 conferences and omitted Dieter Schneider's 12 chapters entirely (ADR-033).
- **Theme view fix (v61)** — the theme filter counted the per-member expansion, listing one co-authored chapter twice and dropping all 145 guest-authored chapters; every pill undercounted. Chapter years now come from `VOLUME_META` (ADR-033).
- **Policy** — the member bibliography is committee-curated on a legitimate-interest basis, not consent-by-submission (**ADR-031**). This makes the Datenschutzerklärung a prerequisite, not a follow-up.

---

## 🔴 Blocked / must not slide

| Item | Blocked on |
|---|---|
| **Impressum + Datenschutzerklärung** | Six facts from David (Diensteanbieter, postal address, Vertretungsberechtigte, Vereinsregister-Nr. + Registergericht, contact email, DSB) — **or one email to the VfS Geschäftsstelle** asking for their Impressum boilerplate, Datenschutzerklärung, and member-consent template. Every German e.V. has all three. This is now a **prerequisite** for the ORCID harvest (ADR-031), and independent of it: the site publishes 288 chapter records naming ~200 people. |
| **ORCID harvest for the 11 thin members** | David running `orcid_seed.py --find` / `--fetch` locally (the container cannot reach `pub.orcid.org`), then curating one iD per member. |
| **Privacy hardening** | Nothing — buildable now. Self-host Google Fonts, vendor Leaflet + qrcode, click-to-load OSM. *Shortens the Datenschutzerklärung that has to be written.* |

---

## File map (v61)

```
index.html events.html jahrestagung-2026.html archive.html committee.html analytics.html guide.html
agw_styles.css agw_strings.js agw_data.js agw_app.js agw_nav.js agw_chronik.js
agw_hero_viz.js agw_schools_net.js agw_gallery.js agw_highlights.js
data/  gallery.js highlights.js analysis_data.json lineage_data.json sankey_flows.json unified_network.json
dist/  (compiled React analytics bundles; sources in gitignored src-jsx/)
img/gallery/  img/highlights/
agw_volume_chapters.js  (VOLUME_CHAPTERS 288 + VOLUME_META 43)
agw_member_pubs.js agw_member_pubs_app.js agw_cite.js
publications-members.html
tools/ agw_thumbnail.py gallery_add.py fonts/ THUMBNAIL.md GALLERY.md examples/
       dh_fetch.py dh_toc.py pdf_toc.py themes.csv   <- themes.csv is the theme curation
       pubs_import.py orcid_seed.py cv_extract.py       overlay; a rebuild without it
       html/ pdf_toc.json                                regenerates GUESSED themes
service-worker.js  manifest.json  CNAME  .github/workflows/
```

---

## What's next

1. **Impressum + Datenschutzerklärung** — see the blocked table. The one item that should not sit.
2. **ORCID harvest** — `orcid_seed.py --find` → curate → `--fetch` → selection pass → `MEMBER_PUBS`.
3. **Privacy hardening** — self-host fonts, vendor Leaflet/qrcode, click-to-load map. No input needed.
4. **Two unchecked working papers** — Ehnts 2019, Barens 2011. Three of four checked had been published.
5. **The 11 thin members ORCID cannot reach** — an email, not a scrape.
6. **"Im Fokus" rail tiles (v49 spec)** + the ESHET–HES Nice event — still unbuilt, spec preserved in git history.
7. **Design cohesion pass** — `AGW_DESIGN_AUDIT.md` (radius/hover/eyebrow tokens; resolve the gold accent).
8. **Analytics data** — `lineage_reference_edges.csv`; school-laning correction (Jevons, Sraffa).
9. **Lösch correspondence companion site** — separate future project.
