# AGW Website — Progress & Task Tracking

**Last updated:** 2026-05-29
**Conference:** 46. Jahrestagung, June 25–27, 2026, Riva San Vitale
**T-minus:** 27 days

---

## Completed ✅

### Website build (chronological)
- [x] **v1** — Conference microsite: hero, 3-tab programme timeline, Rahmenprogramm cards, venue/travel, footer. VfS navy palette, EB Garamond + Source Sans 3.
- [x] **v2** — Full-site expansion: dropdown nav, DE/EN toggle (dual-DOM), hamburger, VfS link, Archive, Publikationen, Über, Geschichte, Mitgliederliste.
- [x] **v3** — Publications section: 26 volumes (Band 115), decade filter, text search, D&H links.
- [x] **v4** — Expandable publication entries: ToC panel, 4 citation formats (BibTeX/EndNote/RIS/Chicago), download + clipboard copy.
- [x] **v5** — Language toggle refactor: dual-DOM → `data-i18n` attribute system. 128 spans converted, 9 prose paragraphs get `data-i18n-html`. `setLang()` + `initLang()` + localStorage persistence.

### Data integration (from uploaded documents)
- [x] **48 members** (Stand 2026) — all with name, title, institution, city, country, research focus. No emails (data protection). Status/country/text filters. Data protection callout.
- [x] **46 Jahrestagungen** (1980–2026) — complete from AGW_Tagungen.pdf. Decade filter + search. Papers for 7 conferences (2017, 2019, 2021, 2022, 2023, 2024, 2025). Volume badges where correlation confirmed (38/46). 2020 COVID gap marked.
- [x] **Chair succession** — 12 Vorsitzende (Neumark 1980 → Klump 2023–). Years inferred from volume editors + confirmed programme headings for last 2 transitions. Timeline with duration display.
- [x] **Satzung** — Key provisions summary + PDF download link (AGW_Satzung.pdf in repo). Founding facts card (1980, 46 Tagungen, 48 Mitglieder, 42 Bände).
- [x] **40 publications** — all volumes Band I–XLII (gaps: XXXIII, XXXVIII). All editors corrected from catalog note. XXVIII year = 2014 confirmed.
- [x] **AGW_SVfS_Band115.bib** — 40 BibTeX entries, `@Book` type, key format `SVfS_115_[ROMAN]`, LaTeX-encoded umlauts.

### Infrastructure
- [x] **History section** — confirmed founding 1980 (1. JT Gießen), factual content from search
- [x] **OG meta tags** — title, description, locale, og:url (canonical). og:image placeholder (commented, awaiting image)
- [x] **Favicon** — inline SVG, navy rectangle with "AGW" in serif
- [x] **OSM map embed** — Via Settala 8, Riva San Vitale, no API key required
- [x] **bieri@vt.edu** — mailto links in contact card and footer
- [x] **VfS link** — https://www.socialpolitik.de/de in nav
- [x] **GitHub deployment files** — pages.yml, 404.html, .gitignore, CNAME, SETUP.md, README.md
- [x] **All URLs** — corrected to `david-bieri/agw-vfs` throughout
- [x] **AGW_en.json** — 133 keys, glossary with 8 domain terms, review_status per key
- [x] **data-i18n system** — 139 attributes, `setLang()` + `initLang()`, localStorage + navigator.language
- [x] **GitHub repo name** — `david-bieri/agw-vfs` confirmed and propagated to all files

---

## Pre-Conference Checklist 🔴 (Before June 25)

### BLOCKING — do these first
- [ ] **1. Push to GitHub** — `david-bieri/agw-vfs` repo. See SETUP.md. ~20 min.
- [ ] **2. Domain decision** — CNAME says `agw-vfs.de`. Either: (a) delete CNAME → use `david-bieri.github.io/agw-vfs` immediately, or (b) register `agw-vfs.de` → configure DNS. Update `canonical` and `og:url` in `index.html` to match.
- [ ] **3. Enable GitHub Pages** — Settings → Pages → Source: GitHub Actions. Site live in ~60s.

### High priority (do this week)
- [ ] **4. Send AGW_en.json to Rainer Klump** — longest lead time. Flag the 6 `[FLAG]` items. Request ~10-day turnaround. Can go live in German while EN awaits review.
- [ ] **5. Confirm Saturday lunch** — one email to Steger Center. If confirmed: add `tl-item social` to Saturday in `index.html`. If unconfirmed by June 15: add note "Mittagessen wird vor Ort arrangiert".
- [ ] **6. Remove PDF watermarks** — recompile `AGW_Rahmenprogramm_2026.tex` and `AGW_Partnerprogramm_2026.tex` removing `Provisorische Version · Änderungen vorbehalten`. Add to repo. Add download buttons in Rahmenprogramm section of `index.html`.
- [ ] **7. VfS SVG logo** — fetch from `https://www.socialpolitik.de/themes/custom/uv_verein_fuer_socialpolitik_theme/src/icons/Logo-verein-fuer-socialpolitik.svg`. Replace the `AGW` text wordmark in `.nav-brand-primary` with the inline SVG.

### Medium priority (before June 15)
- [ ] **8. og:image** — create 1200×630px image (navy background, white EB Garamond text with conference title + date). Add to repo as `og-image.jpg`. Uncomment the 3 `og:image` lines in `<head>`.
- [ ] **9. Mobile testing** — test on iPhone (Safari) and Android (Chrome). Check: nav dropdown, tab-switching, expandable publications, language toggle, OSM map.
- [ ] **10. Cross-browser check** — Chrome, Firefox, Safari desktop. Check: font loading, flag emoji rendering, BibTeX download.
- [ ] **11. EN review sync** — once Klump returns `AGW_en.json`, copy approved values into `const EN = { ... }` block. ~2 hours.

### Final (Week 3)
- [ ] **12. Share URL with participants** — brief email with URL + key logistics (hotels, TILO departure times). Link to Rahmenprogramm/Partnerprogramm PDFs.

---

## Post-Conference Backlog 🟡

### Content gaps
- [ ] Archive 2018 (Darmstadt, "Kameralismus") — no programme PDF uploaded; add paper list
- [ ] Archive 2016 (Karlsruhe, "Stagnations- und Deflationstheorien") — no programme PDF
- [ ] Archive 2020 — confirmed no conference (COVID); gap already marked in timeline
- [ ] Archive 2026 — add this conference after the event
- [ ] Publications: confirm editors for Vols. I, XL, XLII (3 remaining gaps)
- [ ] Publications: confirm publication years for ~28 volumes (only 10 known)
- [ ] Publications: locate missing Vols. XXXIII and XXXVIII
- [ ] ToC: add chapter data for remaining 36 volumes (currently 4 populated)
- [ ] Chair succession: verify transition years with Rainer Klump (especially pre-1990)
- [ ] Members: confirm any additions/departures since Stand 2026

### Technical features
- [ ] Paper upload backend — current "Beitrag einreichen" button is placeholder. Options: Netlify Forms, Formspree (mailto), or a form-to-email service.
- [ ] Print stylesheet — programme pages currently render poorly when printed from mobile
- [ ] Accessibility audit — keyboard navigation for dropdowns, focus management, ARIA review
- [ ] Phase 2 EN translation — move `const EN` to lazy-loaded `AGW_en.json` once editorial review complete

### Strategic
- [ ] VfS subdomain — contact VfS secretariat for `agw.socialpolitik.de` or similar
- [ ] Invite from VfS committee page — ask VfS webmaster to update the link on their committee page

---

## Blocked / Waiting

| Item | Blocked on | Owner | Urgency |
|---|---|---|---|
| Go-live URL | GitHub push (step 1) | David | 🔴 Today |
| EN toggle live | Klump review of AGW_en.json | David → Klump | 🔴 This week |
| Saturday lunch in programme | Steger Center confirmation | David | 🔴 This week |
| PDF downloads on site | Watermark removal | David | 🟡 This week |
| VfS subdomain | VfS secretariat | David | 🟡 Post-conference |
| Chair year verification | Klump / committee records | David → Klump | 🟢 Post-conference |
| Publication years | D&H catalog | David | 🟢 Post-conference |
