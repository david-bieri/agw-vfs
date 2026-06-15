# AGW Website — Ausschuss für die Geschichte der Wirtschaftswissenschaften

**Version:** Final (multi-page: index.html, archive.html, committee.html, analytics.html, guide.html)
**Status:** Content complete · Deployed · Conference June 25–27, 2026
**Last updated:** 2026-06-15
**Owner:** David Bieri (bieri@vt.edu), Core Faculty, VT SPIA · Gastgeber Jahrestagung 2026

---

## What This Is

Conference microsite and standing committee website for the **AGW** — the standing committee for the history of economic thought within the **Verein für Socialpolitik (VfS)**, the oldest professional economics association in the world (founded 1873). The AGW was founded in 1980 (1. Jahrestagung, Gießen).

**Conference:** *Zukunftsperspektiven der Theoriegeschichte: Methoden, Themen, Kontroversen*
**Venue:** Virginia Tech Steger Center, Via Settala 8, CH-6826 Riva San Vitale
**VfS page:** https://history-economicthought.committee.socialpolitik.de/
**Live URL:** https://david-bieri.github.io/agw-vfs/
**GitHub repo:** https://github.com/david-bieri/agw-vfs

---

## Repository File Inventory

| File | Description | Status |
|---|---|---|
| `index.html` | Main conference page | ✅ Deploy-ready |
| `archive.html` | Archive & Publications page | ✅ Deploy-ready |
| `committee.html` | About, Members, Statutes, Societies | ✅ Deploy-ready |
| `analytics.html` | Analytics dashboard (D3.js, networks, heatmaps) | ✅ Tested & ready |
| `guide.html` | User guide for analytics dashboard | ✅ |
| `agw_data.js` | Shared data: CHAIRS, MEMBERS, ARCHIVE, PUBLICATIONS, ANNOUNCEMENTS | ✅ |
| `agw_app.js` | Shared rendering logic, PUB_CHAPTERS, citation generation | ✅ |
| `agw_strings.js` | Bilingual string registry (DE/EN) | ✅ |
| `agw_nav.js` | Shared navigation & footer | ✅ |
| `agw_styles.css` | Shared CSS | ✅ |
| `AGW_User_Guide.pdf` | Academic manual for analytics (LaTeX compiled) | ✅ |
| `AGW_en.json` | EN translation file for editorial review | ⚠ Awaiting Klump review |
| `AGW_SVfS_Band115.bib` | BibTeX bibliography, 43 volumes | ✅ |
| `README.md` | GitHub-facing repo description | ✅ |
| `SETUP.md` | Step-by-step deployment guide | ✅ |
| `404.html` | Custom 404 redirect | ✅ |
| `CNAME` | Custom domain (`agw-vfs.de`) | ⚠ Confirm or delete before first push |
| `.gitignore` | OS/editor exclusions | ✅ |
| `.github/workflows/pages.yml` | GitHub Actions Pages deployment | ✅ |

---

## Architecture

Multi-page static site. No build step, no framework, no backend.

```
index.html           Main conference page (hero, programme, social, travel, news)
archive.html         Conference archive + Publications
committee.html       About, Members, Statutes, Societies
analytics.html       D3.js analytics dashboard
guide.html           User guide for analytics

agw_data.js          Shared data constants:
  ├── CHAIRS[12]         Chair succession 1980–present
  ├── MEMBERS[48]        Full member list (no emails)
  ├── ARCHIVE[46]        All Jahrestagungen 1980–2026
  ├── PUBLICATIONS[43]   Series volumes with metadata
  └── ANNOUNCEMENTS[]    News items (most recent first)

agw_app.js           Shared rendering & logic:
  ├── PUB_CHAPTERS{}     ToC for selected volumes
  ├── renderPubs()       Publications section renderer
  ├── renderAnnouncements()  News section renderer
  └── generateCitation() Citation export (BibTeX/RIS/Chicago/EndNote)

agw_strings.js       Bilingual string registry (DE/EN)
agw_nav.js           Shared navigation & footer component
agw_styles.css       Shared CSS

AGW_SVfS_Band115.bib  BibTeX entries, key format SVfS_115_[ROMAN]
```

---

## Content Update Guide

### Publications (New Volume Published)

When a new volume of *Studien zur Entwicklung der ökonomischen Theorie* appears at Duncker & Humblot, follow this checklist:

#### Step 1: Add volume to `PUBLICATIONS` in `agw_data.js`

Add a new entry at the **end** of the `PUBLICATIONS` array (before the closing `];`):

```js
{ num:'XLIV', numN:44, year:2027, decade:'2020s',
  title_de:'Deutscher Titel',
  title_en:'English Title',
  editor:'hrsg. v. Editor Name',
  url:'https://www.duncker-humblot.de/buch/SLUG-ISBN/',
  econstor:'https://www.econstor.eu/handle/10419/XXXXXX' },
```

| Field | Description | Required |
|---|---|---|
| `num` | Roman numeral (series number within SVfS 115) | Yes |
| `numN` | Arabic numeral equivalent (for sorting) | Yes |
| `year` | Publication year (integer), or `null` if unknown | Yes |
| `decade` | `'1980s'` / `'1990s'` / `'2000s'` / `'2010s'` / `'2020s'` | Yes |
| `title_de` | German title | Yes |
| `title_en` | English title | Yes |
| `editor` | Editor string, format: `'hrsg. v. Firstname Lastname'` | Yes |
| `url` | Direct Duncker & Humblot product page (or `DH_SEARCH` fallback) | Yes |
| `econstor` | EconStor Open Access URL (if available) | Optional |

#### Step 2: Add table of contents to `PUB_CHAPTERS` in `agw_app.js`

Add a new entry at the **top** of the `PUB_CHAPTERS` object:

```js
'XLIV': [
  { author: 'Author Name', title: 'Chapter Title' },
  { author: 'Another Author', title: 'Another Chapter' },
],
```

The chapter list can be sourced from the corresponding `ARCHIVE` entry's `papers` array (same `vol` number).

#### Step 3: Add news announcement to `ANNOUNCEMENTS` in `agw_data.js`

Add at the **top** of the array (most recent first):

```js
{date:'2027-MM-DD', icon:'\U0001F4DA',
 title_de:'Band XLIV (Ort Jahr) erschienen', title_en:'Volume XLIV published',
 text_de:'Der Tagungsband „Titel" (hrsg. v. Name) ist beim Verlag Duncker & Humblot erschienen.',
 text_en:'The proceedings volume "Title" (ed. Name) has been published by Duncker & Humblot.'},
```

#### Step 4: Update volume count in `agw_strings.js`

Find `satz_val_pub` and increment:

```js
satz_val_pub: { en: '44 volumes (as of 2027)' },
```

#### Step 5: Update footer date in `agw_strings.js`

```js
footer_updated: { en: 'Updated: Month Year · Subject to change' },
```

#### Step 6: Update `AGW_SVfS_Band115.bib`

Add a BibTeX entry. Key format: `SVfS_115_[ROMAN]`. Example:

```bibtex
@book{SVfS_115_XLIV,
  editor    = {Lastname, Firstname},
  title     = {German Title},
  booktitle = {Studien zur Entwicklung der ökonomischen Theorie XLIV},
  series    = {Schriften des Vereins für Socialpolitik},
  volume    = {115/XLIV},
  publisher = {Duncker \& Humblot},
  address   = {Berlin},
  year      = {2027},
}
```

#### Step 7: Decade filter (only if new decade starts)

If a new decade begins (e.g., 2030s), add a filter button in `archive.html` in the `#pub-filter-btns` div.

#### Verification

After pushing to `main`, check on the live site:
1. `archive.html#publikationen` — new volume appears at top of list
2. `index.html` — new announcement visible in News section
3. Click the volume → ToC expands correctly
4. Citation export (BibTeX/RIS/Chicago) generates correctly
5. Decade filter includes the new volume

---

### News / Announcements

Edit `const ANNOUNCEMENTS` in `agw_data.js`. Array is ordered **most-recent-first**. Each entry:

| Field | Description |
|---|---|
| `date` | ISO date string `'YYYY-MM-DD'` |
| `icon` | Unicode emoji: 📚 `\U0001F4DA` (book), 🌐 `\U0001F310` (globe), 📄 `\U0001F4C4` (document) |
| `title_de` / `title_en` | Short headline |
| `text_de` / `text_en` | One-sentence description |

---

### Members

Edit `const MEMBERS = [...]` in `agw_data.js`. Fields: `name`, `title`, `inst`, `city`, `country` (DE/AT/CH/US/UK/JP), `emeritus` (bool), `role` (''|'chair'|'host2026'), `focus_de`, `focus_en`.

**CRITICAL: No email addresses** — MV 2024 data protection decision.

---

### Chair succession

Edit `const CHAIRS = [...]` in `agw_data.js`. `end: null` + `past: false` = current chair.

---

### Archive (new conference)

Edit `const ARCHIVE = [...]` in `agw_data.js`. Required fields: `nr`, `year`, `dates`, `country`, `loc_de`, `loc_en`, `venue`, `theme`, `theme_en`, `vol` (or null), `papers` array.

---

### English translations

Edit `agw_strings.js`. Keys with `en` values only are used for the English toggle. German text lives in the HTML. After review, sync to `AGW_en.json`.

---

## Cross-Reference: Conference → Volume Mapping

The `vol` field in `ARCHIVE` entries maps conferences to their published volume number:

| Conference Nr | Year | Location | Theme | Volume |
|---|---|---|---|---|
| 46 | 2026 | Riva San Vitale | Zukunftsperspektiven der Theoriegeschichte | (forthcoming) |
| 45 | 2025 | Bayreuth | Theoriegeschichte der Geoökonomik | (forthcoming) |
| 44 | 2024 | Fulda | Frauen in der Geschichte der Wirtschaftswissenschaften | XLIII |
| 43 | 2023 | Edinburgh | Adam Smith @ 300 | XLII |
| 42 | 2022 | Jena | Zur Geschichte des Vereins für Socialpolitik | XLI |

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
