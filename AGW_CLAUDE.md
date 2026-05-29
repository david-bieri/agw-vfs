# AGW Website — Claude Session Context

Read this file at the start of every session working on the AGW website.
Full documentation: AGW_README.md · AGW_PROGRESS.md · AGW_DECISIONS.md

---

## Project in one sentence

Single-file website (index.html) for the AGW — the VfS standing committee for the history of economics — covering the 2026 Jahrestagung and the committee's permanent presence. Conference June 25–27, Riva San Vitale. Owner: David Bieri (bieri@vt.edu).

---

## Current state

| Item | Value |
|---|---|
| **Canonical file** | `index.html` (152 KB, 1955 lines) |
| **Companion files** | `AGW_en.json`, `AGW_SVfS_Band115.bib`, `AGW_Satzung.pdf` |
| **GitHub repo** | `david-bieri/agw-vfs` |
| **Live URL** | `https://david-bieri.github.io/agw-vfs/` (after push) |
| **Status** | Content complete — NOT YET PUSHED |
| **Blocking task** | Push to GitHub + enable Pages |

---

## Data arrays (in `<script>` block)

| Array | Count | Notes |
|---|---|---|
| `CHAIRS[12]` | 12 | Chair succession 1980–present; `end:null, past:false` = current |
| `MEMBERS[48]` | 48 | No emails (data protection). Fields: name/title/inst/city/country/emeritus/role/focus_de/focus_en |
| `ARCHIVE[46]` | 46 | All Jahrestagungen 1980–2026. Fields: nr/year/loc_de/loc_en/theme/theme_en/vol/vol_label/papers |
| `PUBLICATIONS[40]` | 40 | Band I–XLII (gaps: XXXIII, XXXVIII). Fields: num/numN/year/decade/title_de/title_en/editor/url |
| `PUB_CHAPTERS{}` | 4 | ToC data for vols. IV, XXIII, XXXI, XLI |
| `const EN` | 133 | All EN strings. `// [FLAG]` = needs Klump sign-off before use |

---

## Non-negotiable rules

### Data protection
- **NEVER add email addresses to the MEMBERS array** — MV 2024 decision (GDPR)
- Chair email (klump@wiwi.uni-frankfurt.de) is public-role, appears in contact card
- bieri@vt.edu appears in contact card and footer as 2026 host

### Branding
- Navy `#1B3A6B` (VfS primary), gold `#B8860B` (accent rule)
- **No VT maroon** (`#861F41`) or **VT orange** (`#E87722`) anywhere
- VT/SPIA credited only in footer + contact card as 2026 host

### Language
- Paper titles, speaker names: always German — never translated
- `data-i18n="key"` for text; `data-i18n-html="key"` for markup elements
- `const EN` is the single source of truth — sync to AGW_en.json after changes
- `// [FLAG]` or `// [REVIEW]` strings need Klump sign-off before the EN toggle goes live

### Architecture
- No build step, no external JS, no CDN (except Google Fonts)
- `setLang()` must call `renderChairs()`, `renderMembers()`, `renderArchive()`, `renderPubs()` — in that order
- `initLang()` is called once on page load after all render functions
- `data-de` attribute is auto-captured on first `setLang('en')` call — do not pre-populate it

---

## Sections and their IDs

```
#tagungsprogramm  #rahmenprogramm  #logistik  #archiv
#publikationen    #ueber           #geschichte  #mitglieder  #satzung
```

All 9 sections are present. Nav dropdown "Über den AGW" covers: #ueber, #geschichte, #mitglieder, #satzung.

---

## Files in the repo (deploy these)

```
index.html                     ← THE website
AGW_en.json                    ← editorial translation document
AGW_SVfS_Band115.bib           ← linked from Publications download button
AGW_Satzung.pdf                ← linked from Satzung section download button
AGW_Rahmenprogramm_2026.pdf    ← add after removing watermark
AGW_Partnerprogramm_2026.pdf   ← add after removing watermark
README.md                      ← GitHub display
SETUP.md                       ← deployment instructions
404.html                       ← custom redirect
.gitignore
CNAME                          ← set to agw-vfs.de or delete for github.io URL
.github/workflows/pages.yml    ← auto-deploy on push to main
```

**Do NOT include:** AGW_Website_v2.html through v5.html (build artefacts).

---

## Immediate next tasks (in order)

1. Push to `david-bieri/agw-vfs` on GitHub (see SETUP.md)
2. Decide on CNAME domain — update canonical URL in index.html
3. Send AGW_en.json to Rainer Klump for EN review
4. Confirm Saturday lunch with Steger Center → add to programme if confirmed
5. Remove watermarks from LaTeX PDFs → add to repo + add download buttons
6. Fetch VfS SVG logo → replace text nav brand
7. Create og:image (1200×630) → add to repo → uncomment og:image meta tags
8. Mobile + cross-browser testing
9. Share live URL with conference participants

---

## Known data gaps (post-conference)

- Archive entries 2016 and 2018: no programme PDFs → paper lists missing
- Volumes XXXIII and XXXVIII: still unlocated
- Volume years: ~28 unconfirmed (only 10 known: IV/IX/X/XI/XIII/XIV/XV/XVI/XXVIII/XXXIX)
- Editors: Vols. I, XL, XLII unknown
- Chair years: pre-1996 approximate — needs verification against VfS records
