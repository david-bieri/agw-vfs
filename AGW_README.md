# AGW Website — Ausschuss für die Geschichte der Wirtschaftswissenschaften

**Version:** Final (index.html, 152 KB)
**Status:** Content complete · Pre-deployment · Conference June 25–27, 2026
**Last updated:** 2026-05-29
**Owner:** David Bieri (bieri@vt.edu), Core Faculty, VT SPIA · Gastgeber Jahrestagung 2026

---

## What This Is

Conference microsite and standing committee website for the **AGW** — the standing committee for the history of economic thought within the **Verein für Socialpolitik (VfS)**, the oldest professional economics association in the world (founded 1873). The AGW was founded in 1980 (1. Jahrestagung, Gießen).

**Conference:** *Zukunftsperspektiven der Theoriegeschichte: Methoden, Themen, Kontroversen*
**Venue:** Virginia Tech Steger Center, Via Settala 8, CH-6826 Riva San Vitale
**VfS page:** https://history-economicthought.committee.socialpolitik.de/
**Live URL (post-push):** https://david-bieri.github.io/agw-vfs/
**GitHub repo:** https://github.com/david-bieri/agw-vfs

---

## Repository File Inventory

| File | Description | Status |
|---|---|---|
| `index.html` | Complete website — 152 KB, 1955 lines | ✅ Deploy-ready |
| `AGW_en.json` | EN translation file for editorial review | ⚠ Awaiting Klump review |
| `AGW_SVfS_Band115.bib` | BibTeX bibliography, 40 volumes | ✅ |
| `AGW_Satzung.pdf` | Committee charter PDF | ✅ |
| `README.md` | GitHub-facing repo description | ✅ |
| `SETUP.md` | Step-by-step deployment guide | ✅ |
| `404.html` | Custom 404 redirect | ✅ |
| `CNAME` | Custom domain (`agw-vfs.de`) | ⚠ Confirm or delete before first push |
| `.gitignore` | OS/editor exclusions | ✅ |
| `.github/workflows/pages.yml` | GitHub Actions Pages deployment | ✅ |
| `AGW_Rahmenprogramm_2026.pdf` | Social programme PDF | ⚠ Remove watermark first |
| `AGW_Partnerprogramm_2026.pdf` | Partner programme PDF | ⚠ Remove watermark first |

**Do not include in repo:** `AGW_Website_v2.html` through `AGW_Website_v5.html` — build artefacts only. `index.html` is the canonical deliverable.

---

## Architecture

Single self-contained HTML file. No build step, no framework, no backend.

```
index.html  (152 KB, 1955 lines)
  ├── <style>        All CSS (no external sheets)
  ├── HTML           German default; 139 data-i18n attrs throughout
  └── <script>
        ├── const EN        133 EN keys — editorial document
        ├── setLang()       data-i18n swap + localStorage
        ├── initLang()      localStorage → navigator.language → 'de'
        ├── CHAIRS[12]      Chair succession 1980–present
        ├── MEMBERS[48]     Full member list (no emails)
        ├── ARCHIVE[46]     All Jahrestagungen 1980–2026
        ├── PUBLICATIONS[40] Series volumes with metadata
        ├── PUB_CHAPTERS{}  ToC for 4 volumes
        └── render*()       Section rendering functions

AGW_en.json              Editorial file: 133 keys, glossary, review_status
AGW_SVfS_Band115.bib     40 @Book entries, key format SVfS_115_[ROMAN]
```

---

## Site Sections

| Section | Anchor | Content |
|---|---|---|
| Hero | `#top` | Conference title, date, venue pills, host attribution |
| Tagungsprogramm | `#tagungsprogramm` | 3-tab daily timeline, full 2026 academic programme |
| Rahmenprogramm | `#rahmenprogramm` | 4 social event cards + 4 partner programme cards |
| Anreise & Logistik | `#logistik` | Hotels, TILO train, Ticino Ticket, OSM map, venue info |
| Archiv | `#archiv` | 46 Jahrestagungen (1980–2026), decade+search filter, papers for 7 |
| Publikationen | `#publikationen` | 40 volumes, expandable ToC + citations, master .bib download |
| Über den Ausschuss | `#ueber` | About prose, contact card, membership callout |
| Geschichte des AGW | `#geschichte` | History prose + chair succession timeline |
| Mitgliederliste | `#mitglieder` | 48 members, status/country/text filters |
| Satzung | `#satzung` | Key charter provisions + PDF download + founding facts |
| Footer | — | VfS links, bieri@vt.edu, host credit |

---

## Content Update Guide

### Programme items
```html
<div class="tl-item highlight">   <!-- highlight|social|opening|memorial|assembly -->
  <div class="tl-time">09:45–10:45</div>
  <div class="tl-dot"></div>
  <div class="tl-content">
    <div class="tl-title"><em>Paper title</em></div>
    <div class="tl-speaker">Author (Institution)</div>
  </div>
</div>
```

### Members
Edit `const MEMBERS = [...]`. Fields: `name`, `title`, `inst`, `city`, `country` (DE/AT/CH/US/UK/JP), `emeritus` (bool), `role` (''|'chair'|'host2026'), `focus_de`, `focus_en`.
**CRITICAL: No email addresses** — MV 2024 data protection decision.

### Chair succession
Edit `const CHAIRS = [...]`. `end: null` + `past: false` = current chair.

### Archive
Edit `const ARCHIVE = [...]`. Required fields: `nr`, `year`, `loc_de`, `loc_en`, `theme`, `theme_en`, `vol` (or null), `papers` array.

### Publications
Edit `const PUBLICATIONS = [...]` for volume metadata. Edit `PUB_CHAPTERS` for ToC. Keep `AGW_SVfS_Band115.bib` in sync when adding volumes.

### English translations
Edit `const EN = { ... }` at top of `<script>`. Entries marked `// [FLAG]` or `// [REVIEW]` need Rainer Klump sign-off before the EN toggle goes live. After review, sync to `AGW_en.json`.

---

## Language System

| Mechanism | Detail |
|---|---|
| Default language | German — text is in HTML |
| Toggle | DE/EN button in nav |
| Persistence | `localStorage('agw-lang')` — survives page reloads |
| Auto-detection | `navigator.language` → EN for non-German browsers on first visit |
| HTML translation | `data-i18n="key"` (textContent) + `data-i18n-html="key"` (innerHTML) |
| JS sections | MEMBERS, ARCHIVE, PUBLICATIONS, CHAIRS re-render on toggle |
| Paper titles | Always German — not translated (scholarly convention) |
| Editorial file | `AGW_en.json` — 133 keys, 6 FLAG items need sign-off |

---

## Data Protection

The MV Fulda 2024 decided member contact details require written consent before web publication. **`MEMBERS` array contains no email addresses.** Names and affiliations are public under Satzung §7.2. The site directs contact enquiries to klump@wiwi.uni-frankfurt.de.

---

## Branding

**VfS/AGW colours — not VT colours:**
- Navy `#1B3A6B` · Accent `#3A6BAF` · Gold `#B8860B` · Cream `#FAFAF7`
- VT maroon (`#861F41`) and VT orange (`#E87722`) do not appear
- Typography: EB Garamond (headings) + Source Sans 3 (body)

---

## Key Contacts

| Role | Person | Email |
|---|---|---|
| Gastgeber 2026 | Dr. David Bieri, VT SPIA | bieri@vt.edu |
| Vorsitzender | Prof. Dr. Rainer Klump, Frankfurt | klump@wiwi.uni-frankfurt.de |
