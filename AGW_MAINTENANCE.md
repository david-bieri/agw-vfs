# AGW Website — Maintenance & Update Procedures

**Repository:** `david-bieri/agw-vfs` (GitHub Pages, auto-deploys on push to `main`)
**Live URL:** https://david-bieri.github.io/agw-vfs/

---

## How to Update Publications

When a new volume of *Studien zur Entwicklung der ökonomischen Theorie* is published by Duncker & Humblot:

### 1. Add the volume to `PUBLICATIONS` in `agw_data.js`

```js
{ num:'XLIV', numN:44, year:2026, decade:'2020s',
  title_de:'German title here',
  title_en:'English title here',
  editor:'hrsg. v. Editor Name',
  url:'https://www.duncker-humblot.de/buch/SLUG/',
  econstor:'https://www.econstor.eu/handle/10419/XXXXXX' },
```

Key fields:
- `num`: Roman numeral (series number within SVfS 115)
- `numN`: Arabic numeral equivalent (for sorting)
- `year`: Publication year (integer)
- `decade`: One of `'1980s'`, `'1990s'`, `'2000s'`, `'2010s'`, `'2020s'`
- `url`: Direct Duncker & Humblot product page (or `DH_SEARCH` as fallback)
- `econstor`: Open Access link if available (optional)

### 2. Add table of contents to `PUB_CHAPTERS` in `agw_app.js`

```js
'XLIV': [
  { author: 'Author Name', title: 'Chapter Title' },
  // ...
],
```

The chapter list can be sourced from the ARCHIVE entry for the corresponding conference (same `vol` number).

### 3. Add a news announcement to `ANNOUNCEMENTS` in `agw_data.js`

```js
{date:'YYYY-MM-DD', icon:'\U0001F4DA',
 title_de:'Band XLIV (Ort Jahr) erschienen', title_en:'Volume XLIV published',
 text_de:'Der Tagungsband „Titel" (hrsg. v. Name) ist beim Verlag Duncker & Humblot erschienen.',
 text_en:'The proceedings volume "Title" (ed. Name) has been published by Duncker & Humblot.'},
```

Place the new entry at the **top** of the array (most recent first).

### 4. Update the volume count in `agw_strings.js`

Find `satz_val_pub` and increment the number:
```js
satz_val_pub: { en: '44 volumes (as of 2027)' },
```

### 5. Update the footer date in `agw_strings.js`

```js
footer_updated: { en: 'Updated: Month Year · Subject to change' },
```

### 6. (Optional) Update `AGW_SVfS_Band115.bib`

Add a BibTeX entry for the new volume. Key format: `SVfS_115_[ROMAN]`.

### 7. Decade filter buttons

If a new decade starts (e.g., 2030s), add a filter button in `archive.html` in the `#pub-filter-btns` div.

---

## How to Update News / Announcements

Edit `const ANNOUNCEMENTS` in `agw_data.js`. Array is ordered most-recent-first. Each entry has:
- `date`: ISO date string (`'YYYY-MM-DD'`)
- `icon`: Unicode emoji (book `\U0001F4DA`, globe `\U0001F310`, document `\U0001F4C4`)
- `title_de` / `title_en`: Short headline
- `text_de` / `text_en`: One-sentence description

---

## Cross-Reference: Conference to Volume Mapping

The `vol` field in `ARCHIVE` entries maps conferences to their published volume number.

| Conference Nr | Year | Location | Volume |
|---|---|---|---|
| 46 | 2026 | Riva San Vitale | (forthcoming) |
| 45 | 2025 | Bayreuth | (forthcoming) |
| 44 | 2024 | Fulda | XLIII |
| 43 | 2023 | Edinburgh | XLII |
| 42 | 2022 | Jena | XLI |

---

## Key Data Files

| File | Contains | Edit for |
|---|---|---|
| `agw_data.js` | PUBLICATIONS, ANNOUNCEMENTS, ARCHIVE, MEMBERS, CHAIRS | New volumes, news, conferences, members |
| `agw_app.js` | PUB_CHAPTERS, rendering logic | Table of contents for volumes |
| `agw_strings.js` | All bilingual UI strings | Volume count, footer date, labels |
| `archive.html` | Publications page markup | Decade filter buttons |
| `AGW_SVfS_Band115.bib` | BibTeX bibliography | Citation data |

---

## Verification After Updates

After pushing changes, check on the live site:
1. Publications section on `archive.html#publikationen` — new volume appears at top
2. News section on `index.html` — new announcement visible
3. Decade filter buttons work correctly
4. Citation export (BibTeX/RIS/Chicago) generates correctly for new volume
5. Volume count in Statutes section is correct

---

## How to Update Members' Publications (`publications-members.html`)

The **Members' Publications** page lists members' work grouped by thematic
category. It is a static, data-driven page — no backend, no login.

### Data files

| File | Contains |
|---|---|
| `agw_member_pubs.js` | `PUB_THEMES` (thematic vocabulary) and `MEMBER_PUBS` (the publications) |
| `agw_member_pubs_app.js` | Rendering, theme filters, search, bilingual re-render |
| `publications-members.html` | The page markup (head, nav mount, footer, script includes) |
| `agw_strings.js` | Bilingual UI labels for the page (keys prefixed `mpub_`, plus `nav_member_pubs`) |
| `tools/doi_expand.py` | Maintainer tool: DOI / ORCID → paste-ready pub objects |
| `tools/cv_to_bio.py` | Maintainer tool: CV → standardized bio + pub objects |

### Add a publication manually

Add an object to `MEMBER_PUBS` in `agw_member_pubs.js`:

```js
{ member:'Member Name', themes:['classical','monetary'],
  title:'Publication Title',
  authors:'First Author · Second Author',
  venue:'Journal or Publisher', year:2024,
  doi:'10.xxxx/yyyyy' },   // omit doi and use url:'…' if no DOI
```

- `member` must match the member's `name` in `MEMBERS` (used for cross-linking).
- `themes` takes one or more ids from `PUB_THEMES` (list at top of the file).
- Use `doi` (renders a DOI link) **or** `url` (any other link); both optional.
- Ordering does not matter — the page sorts by year (newest first) within each theme.

### Add publications with the helper tools

```bash
# From DOIs or an ORCID profile (free, no key):
python3 tools/doi_expand.py 10.1111/meca.12018 --member "Jochen Hartwig" --theme keynesian
python3 tools/doi_expand.py --orcid 0000-0002-1825-0097 --member "Jane Doe"

# From a CV (uses an OpenAI-compatible model; key read from environment):
pdftotext cv.pdf - | python3 tools/cv_to_bio.py - --member "Jane Doe"
```

Each tool prints paste-ready objects. **Always review** (member name, themes,
titles, years) before pasting into `MEMBER_PUBS`. See `tools/README.md`.

### Add a new theme

Add an entry to `PUB_THEMES` in `agw_member_pubs.js` (set `id`, `order`, `de`,
`en`), then tag publications with the new `id`. Empty themes are hidden
automatically, so a theme only appears once at least one publication uses it.

### Verification after updates

1. `publications-members.html` — new publication appears under the right theme heading.
2. Theme filter chip counts are correct; clicking a chip filters the list.
3. Toggle DE/EN — all headings, labels, and the search placeholder switch language.
4. DOI / link buttons open the correct target.
