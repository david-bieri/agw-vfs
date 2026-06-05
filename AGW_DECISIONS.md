# AGW Website — Architecture Decision Records (ADRs)

Each record documents a significant decision: what was decided, why, what alternatives were rejected, and what consequences follow.

Statuses: `Accepted` | `Superseded` | `Deprecated` | `Proposed`

---

## ADR-001: Single Self-Contained HTML File Architecture

**Date:** 2026-05-29
**Status:** Accepted

**Decision:**
Ship the website as a single self-contained HTML file with all CSS, JS, translations, and data embedded. No build step, no framework, no backend required.

**Rationale:**
The AGW is a small scholarly committee with no dedicated web infrastructure or technical maintainer. A single file can be emailed, shared as an attachment, deployed by drag-and-drop, and updated by anyone with a text editor. It eliminates dependency on a build pipeline at the cost of some scalability. The site's content (programme, members, publications) changes infrequently and is managed by one person.

**Alternatives considered:**
- **Static site generator (Hugo/Astro):** Better for scale and i18n, but requires a build step, Node.js/Go toolchain, and a maintainer with CLI familiarity. Deferred to Phase 3 (see ADR-007 trigger conditions).
- **CMS (WordPress/Contentful):** Over-engineered for this use case; introduces hosting costs, security surface area, and dependency on a third-party platform.
- **Separate HTML files per language:** Doubles maintenance burden; no shared data layer; sync errors inevitable.

**Consequences:**
- Content updates require editing the HTML file directly — no visual editor
- File size (~106 KB) is acceptable for a conference site with no images
- EN strings are embedded, not lazy-loaded — both languages ship to all visitors
- Phase 2 (lazy-load EN via `AGW_en.json`) addresses the language overhead when translations are editorially settled
- Phase 3 trigger: site grows beyond ~300 KB, or committee acquires a technical maintainer comfortable with a build tool

---

## ADR-002: VfS/AGW Branding Independent of VT Colours

**Date:** 2026-05-29
**Status:** Accepted

**Decision:**
The website uses VfS institutional colours (navy `#1B3A6B`) and an academic editorial aesthetic. VT maroon (`#861F41`) and VT orange (`#E87722`) do not appear on the site. Virginia Tech appears only in the footer and contact card as host institution credit for the 2026 conference.

**Rationale:**
The AGW is an independent committee of the VfS. The website is its permanent online presence, not a conference page for a VT event. Using VT branding would misrepresent the institutional ownership. The LaTeX print documents (Rahmenprogramm, Partnerprogramm) intentionally use VT maroon as host-institution credit — this is correct for those documents but should not drive the website palette.

**Consequences:**
- Future years' conferences hosted by other institutions require no rebranding
- The site feels institutionally continuous rather than event-specific
- VfS SVG logo should be added to the nav when available (currently text-only)

---

## ADR-003: Paper Titles and Speaker Names Not Translated

**Date:** 2026-05-29
**Status:** Accepted

**Decision:**
Academic paper titles, speaker names, and institutional affiliations remain in German in both DE and EN modes of the language toggle. Only UI chrome, section labels, informational prose, and editorial text are translated.

**Rationale:**
Paper titles are the scholarly identity of the work. Translating them would be inaccurate (the papers are in German) and potentially confusing for citation purposes. Speaker names and affiliations are proper nouns. The distinction between "translatable UI" and "non-translatable scholarly content" is a well-established convention in multilingual academic conference sites.

**Consequences:**
- English visitors see German paper titles — acceptable and expected in this context
- The `const EN` object in the HTML has no paper-title keys
- Any future abstract or paper content added to the site should be treated the same way

---

## ADR-004: data-i18n Attribute System Replacing Dual-DOM

**Date:** 2026-05-29
**Status:** Accepted  
**Supersedes:** Dual-DOM approach used in v1–v4

**Decision:**
Replace the dual-DOM pattern (`<span class="de-content">X</span><span class="en-content">Y</span>`) with a `data-i18n="key"` attribute system. German text is the HTML default; `setLang('en')` swaps `textContent` from the `EN` object using the key. `data-de` is captured on first switch for clean restoration. `data-i18n-html` handles elements with markup.

**Rationale:**
The dual-DOM approach was adequate for v1–v3 but broke down as a maintainability strategy:
1. EN strings were scattered across 128 locations in the HTML, making editorial review impossible without reading the entire file
2. DOM weight doubled for every translated string — both languages always rendered
3. No single place to audit translation completeness or quality
4. No mechanism for an editor to review and correct translations without touching markup

The `data-i18n` approach centralises all EN strings in `const EN = { ... }` — a single reviewable block that can be extracted to `AGW_en.json` for editorial handoff.

**Alternatives considered:**
- **Keep dual-DOM but extract EN to JS object:** Hybrid — still sends both languages to browser but centralises strings. Rejected as an interim step; cleaner to commit to data-i18n fully.
- **URL-based routing (`/de/`, `/en/`):** Correct for SEO but requires either separate files (doubles maintenance) or a build step (requires toolchain). Deferred to Phase 3.

**Transformation statistics (v4 → v5):**
- 128 span pairs replaced
- 68 `data-i18n` attributes lifted to parent elements
- 9 prose paragraphs assigned `data-i18n-html`
- 0 remaining `de-content`/`en-content` class references

**Consequences:**
- EN strings are defined in one place; editorial review is a single-block operation
- Switching back to DE restores original HTML text via `data-de` — no page reload needed
- JS-rendered sections (Members, Archive, Publications) read `lang` directly at render time — consistent approach
- Phase 2 upgrade path: move `const EN` block to external `AGW_en.json`, load lazily on first EN switch

---

## ADR-005: English Translations as Editorial Document with Review Status

**Date:** 2026-05-29
**Status:** Accepted

**Decision:**
All EN strings carry a `review_status` field (`SETTLED` / `DRAFT` / `REVIEW` / `FLAG`) in `AGW_en.json`. The `_glossary` section documents the 8 contested domain-specific terms with alternatives and rationale. The `const EN` object in the HTML mirrors this with inline `// [FLAG]` and `// [REVIEW]` comments. No EN string goes live without matching its review status.

**Rationale:**
The history of economics contains terminology without settled English equivalents. *Dogmengeschichte*, *Theoriegeschichte*, *Wirtschaftswissenschaften* in the committee name, and the translation of *Ausschuss* all require scholarly editorial judgment, not just dictionary translation. A website that mistranslates these terms damages the committee's scholarly credibility. The review_status system makes the outstanding decisions explicit and actionable.

**Flagged items requiring sign-off before EN toggle goes live:**
1. `committee_full_name` — "Committee for the History of Economics" vs alternatives
2. `Dogmengeschichte` — "history of economic doctrines" vs "doctrinal history"
3. `Theoriegeschichte` — "history of economic thought" vs "history of economic theories"
4. `Wirtschaftswissenschaften` — "economics" vs "economic science"

**Consequences:**
- EN toggle can be deployed to the site before all translations are reviewed — the toggle works; the FLAG strings are simply awaiting confirmation
- Editorial workflow: share `AGW_en.json` with domain expert → receive corrected `"en"` values → copy into `const EN` block in HTML
- One copy-paste operation propagates all editorial decisions to the live site

---

## ADR-006: Language Persistence: localStorage + navigator.language Cascade

**Date:** 2026-05-29
**Status:** Accepted

**Decision:**
Language preference is persisted via `localStorage.setItem('agw-lang', l)`. On page load, `initLang()` applies the cascade: (1) saved localStorage preference; (2) `navigator.language` — switch to EN for non-German browsers (en, fr, it, nl, es, pt, pl, cs, sv, no, fi); (3) default to German.

**Rationale:**
- **localStorage** gives memory without server infrastructure. A returning participant sees their previous language choice without re-selecting.
- **navigator.language** auto-detection means an international scholar arriving for the first time sees English without manual action, while German-speaking members see German.
- **German default** is correct: the AGW is a German-language committee; German is the primary audience and the authoritative language of all scholarly content.

**Alternatives considered:**
- **URL parameter (`?lang=en`):** Clean, shareable, bookmarkable. Requires parsing on load and rewriting on toggle. Added complexity for marginal gain at this scale. Deferred.
- **Cookie:** Adds complexity; same persistence result as localStorage for a purely client-side site.
- **No persistence:** Simplest but forces re-selection on every visit.

**Consequences:**
- Language choice survives tab close and browser restart
- International visitors get a better first-impression experience automatically
- No server-side logic required

---

## ADR-007: Deployment Strategy — GitHub Pages / Netlify Now, VfS Subdomain Later

**Date:** 2026-05-29
**Status:** Accepted

**Decision:**
Deploy immediately to GitHub Pages or Netlify for the conference. Pursue VfS subdomain (`agw.socialpolitik.de` or similar) as the long-term canonical URL after the conference. Register an independent domain (`agw-vfs.de` / `agw-theoriegeschichte.de`) as a fallback if VfS coordination takes time.

**Rationale:**
The conference is June 25. GitHub Pages and Netlify both provide free HTTPS static hosting with custom domain support in under 30 minutes. The VfS subdomain is the correct permanent home but requires external coordination with the VfS secretariat, which may not resolve before the conference. The file-only architecture means there are no hardcoded URLs that would break on domain migration.

**Phase 1 trigger conditions (stay on simple hosting):**
- Site is a single HTML file
- EN translations are not yet lazy-loaded (no need to serve JSON alongside)
- Traffic is low (committee members and conference participants only)

**Phase 2 trigger conditions (lazy-load EN, CDN):**
- `AGW_en.json` editorial review complete
- EN strings moved out of HTML to reduce initial payload
- Hosting must serve both files (trivial for any static host)

**Phase 3 trigger conditions (SSG migration):**
- Site grows to include news, job postings, per-year conference pages
- Content editing burden exceeds what direct HTML editing can support
- Committee acquires a maintainer comfortable with a build tool

**Consequences:**
- Conference URL is live within hours of the decision to deploy
- Long-term canonical URL requires one DNS change — no site rebuild needed
- VfS secretariat coordination should begin now regardless of timeline

---

## ADR-008: Four Citation Formats — BibTeX, EndNote, RIS, Chicago

**Date:** 2026-05-29
**Status:** Accepted

**Decision:**
Each publication volume provides citation download in four formats: BibTeX (`.bib`), EndNote (`.enw`), RIS/Zotero (`.ris`), and Chicago plain text (`.txt`). Generated dynamically from the `PUBLICATIONS` array. Files named `AGW_SVfS_115_{VOL}.{ext}`.

**Rationale:**
The *Studien zur Entwicklung der ökonomischen Theorie* volumes are actively cited in the history of economics literature. The four formats cover the major reference managers in use across the DACH academic community: LaTeX workflows (BibTeX), Endnote (dominant in German humanities faculties), Zotero/Mendeley (growing adoption), and manual citation (Chicago). All four are generated from a single data source, so adding a volume once makes it citable in all four systems immediately.

**BibTeX key convention:** `SVfS_115_{ROMAN_NUMERAL}` (e.g., `SVfS_115_XLI`)
**Editor name format:** Inverted for BibTeX (`Last, First`); natural order for other formats.
**Year fallback:** `o.J.` (ohne Jahresangabe) for volumes with unconfirmed publication year.

**Consequences:**
- Citation generation is entirely client-side — no server required
- Adding a new volume to `PUBLICATIONS[]` automatically makes it citable in all four formats
- Publication years for ~16 volumes are unconfirmed and fall back to `o.J.` — update `year` field when confirmed

---

## ADR-009: No Email Addresses in Member List

**Date:** 2026-05-29
**Status:** Accepted

**Decision:**
The `MEMBERS` array in `index.html` does not contain email addresses. The contact callout in the Mitgliederliste section directs enquiries to the chair (klump@wiwi.uni-frankfurt.de). The footer carries bieri@vt.edu as the 2026 conference contact.

**Rationale:**
The MV Fulda 2024 (Tagesordnungspunkt 3, "Bericht aus dem Erweiterten Vorstand") explicitly recorded: *"Aus Datenschutzgründen müssten die Mitglieder eines Ausschusses schriftlich zustimmen, dass ihre persönlichen Daten auf der Homepage des Ausschusses öffentlich gemacht werden."* Without documented written consent from all 48 members, publishing emails would violate GDPR requirements.

**Note on names and affiliations:**
Satzung §7 Abs. 2 states: *"Die Satzung, das Mitgliederverzeichnis und die Programme der Tagungen des Ausschusses sind öffentlich zugänglich."* Names and institutional affiliations are therefore publishable without individual consent. Only contact details (email, phone) require consent.

**Consequences:**
- MEMBERS array has no `email` field — this is intentional
- When consent process is implemented, emails can be added to the array and a `mailto:` link added to member cards
- Chair email (klump@wiwi.uni-frankfurt.de) appears on site because it is a public-role address

---

## ADR-010: Chair Succession Years — Inferred from Volume Editors

**Date:** 2026-05-29
**Status:** Accepted

**Decision:**
Chair tenure years are inferred from the editors of the *Studien zur Entwicklung der ökonomischen Theorie* volumes, cross-referenced with conference programme headings where available. The site displays these dates with a caveat note ("Amtszeiten ab ca. 1990 aus Tagungsbänden erschlossen; Angaben vor 1990 approximativ").

**Rationale:**
Satzung §3.4: *"Die/der Vorsitzende…gibt die jeweiligen Tagungsbände heraus."* The chair at the time of a conference typically edits the proceedings volume. This creates a recoverable chain from volume editors to chair succession. The two most recent transitions are directly confirmed from programme headings ("Leitung: Prof. Dr. Peter Spahn" in 2021 and 2022; "Leitung: Prof. Dr. Rainer Klump" in 2023). Earlier transitions are inferred.

**Known ambiguities:**
- Harald Scherf's 1982–1990 tenure (8 years) predates the current 4-year maximum — may reflect the original Satzung having different term rules
- Vol. XIII (1993 Augsburg) is edited by Christian Scheer despite Heinz Rieter likely being chair at the time — Scheer was probably local organiser who took editorial responsibility
- Vol. XXXII (2012 or 2013) is co-edited by Kurz and Caspari — suggests a transition year

**Verification path:**
Rainer Klump or the VfS secretariat holds the formal MV records. The table should be verified and corrected once those records are consulted. Flag this as post-conference action.

**Consequences:**
- Years before ~1996 should be treated as approximate (±1 year)
- The caveat note renders on the site; users are informed
- Once verified, remove the caveat note and set `verified: true` in the CHAIRS array

---

## ADR-011: Archive Full-Text Search + Decade Filters

**Date:** 2026-05-29
**Status:** Accepted

**Decision:**
The archive has two parallel filter mechanisms: decade-tab buttons (1980s / 1990s / 2000s / 2010s / 2020s / All) and a free-text search box. Both filter the same rendered list. The text search spans: conference theme, location, year, and paper author/title strings within expanded paper lists.

**Rationale:**
With 46 entries spanning 46 years, flat scrolling is unmanageable. Decade tabs mirror the Publications section filter (same UX pattern = lower learning curve). Free text enables finding, for example, all conferences where Hayek was discussed, without knowing the year.

**Conference-volume linking:**
Each archive entry has a `vol` field (Roman numeral or null) and `vol_label` field (display string). Where confirmed, a volume badge appears in the header row. 38 of 46 entries have confirmed volume links; 4 remaining entries (2015 Erfurt, 2007 Lüdinghausen year-confirmed, 1980s early entries without matching volumes) are left unlinked. This is intentional — a null link is more honest than a wrong link.

**Consequences:**
- When new programmes arrive, add `papers` arrays to existing skeleton entries
- When volume correlations are confirmed, update the `vol` field
- The 2020 gap marker renders automatically when both 2021 and 2019 entries are visible

---

## ADR-012: Satzung Section — Summary + PDF, Not Full Text

**Date:** 2026-05-29
**Status:** Accepted

**Decision:**
The Satzung section displays a structured plain-prose summary of the key provisions (§1 purpose, §2 membership/2/3 majority, §3 chair election/2-year terms, §4 quorum, §7 public accessibility) alongside a PDF download link and a founding facts info card. The full legal text is not reproduced inline.

**Rationale:**
Satzung §7.2 requires public accessibility of the charter — a download link satisfies this. Rendering the full 3-page legal text inline would break the editorial register of the site and add scroll burden. The summary covers the facts most relevant to a prospective member or interested visitor. The PDF is authoritative; the summary is navigational.

**Consequences:**
- If the Satzung is revised, the PDF must be replaced in the repo and the summary prose updated
- The summary is in German only (appropriate for an institutional legal document)
- The founding facts card (1980, 46 conferences, 48 members, 42 volumes) must be kept manually up to date after each Jahrestagung

---

## ADR-016: Render-Guard Pattern for All Shared Init Paths

**Date:** 2026-06-04
**Status:** Accepted

**Decision:**
Every `render*()` / `init*()` function in `agw_app.js` that touches page-specific DOM must early-return (`if (!el) return;`) as its first line. This rule extends beyond a function's primary target to *every* DOM access in the shared init path — including elements injected dynamically after init (e.g. `btn-de`/`btn-en` inside `setLang()`, which are mounted by `renderNav()` that runs *after* `agw_app.js` initialises).

**Rationale:**
All five pages share `agw_app.js`. A missing-element throw anywhere in the shared init block cascades and kills all subsequent initialisation on that page — unrelated features (countdown, news feed, Logistik map) all go dark from a single missing element. The pattern was discovered the hard way when the multi-page split caused the Logistik map `#map-logistik` to be absent on non-index pages, aborting the entire init chain.

**Alternatives considered:**
- Per-page `agw_app_index.js` / `agw_app_archive.js` etc.: avoids the guard requirement but multiplies the number of files and breaks the "one render function, used everywhere" maintenance model.
- Try/catch around the full init block: hides bugs rather than preventing them; error messages become harder to locate.

**Consequences:**
- Every new `render*()` or `init*()` function must include the guard as its first line — this is a code-review checklist item
- `setLang()` must null-guard any element it touches that might not exist on every page
- Violations are easy to detect: a missing guard produces a cascade of unrelated failures rather than an isolated error

---

## ADR-017: Data-File Self-Containment

**Date:** 2026-06-04
**Status:** Accepted

**Decision:**
`agw_data.js` (and any future shared data file) must be entirely self-contained. It must never reference a `const`, `let`, or `var` that is declared in a *later-loaded* file (`agw_app.js`, `agw_strings.js`, etc.) at the top level of the module.

**Rationale:**
Script load order in the browser is sequential. A top-level reference to a name that sits in a later file hits the temporal dead zone and throws a `ReferenceError` before the data file finishes executing. Because `agw_data.js` is loaded first (it is a dependency of everything else), this silently leaves `PUBLICATIONS`, `FMTS`, `ANNOUNCEMENTS`, and any other data declared after the offending line as `undefined` site-wide. The root cause of the "DH_SEARCH already declared" bug in v8: `DH_SEARCH` lived in `agw_app.js` but was referenced at the top level of `agw_data.js`, aborting the data file mid-parse.

**Consequences:**
- Data-only constants (lookup tables, URL prefixes) belong in `agw_data.js`, not in `agw_app.js`
- If `agw_app.js` needs a constant that is also needed by `agw_data.js`, it lives in `agw_data.js`
- Any future data file added to the foundation set must follow the same rule

---

## ADR-018: esm.sh React Externalization

**Date:** 2026-06-05
**Status:** Accepted

**Decision:**
Any CDN module loaded via the importmap in `analytics.html` that has React as a peer dependency **must** be loaded with the `?external=react,react-dom` query parameter. Example: `"recharts": "https://esm.sh/recharts@2?external=react,react-dom"`.

**Rationale:**
Without the `?external` flag, esm.sh bundles its own copy of React inside the module. The page then has two React instances with separate internal state (hook dispatcher, context registry, etc.). The second instance has `currentDispatcher === null` because no React tree is rendering under it, so any hook call (`useRef`, `useState`, `useEffect`) throws `TypeError: Cannot read properties of null`. This manifested as `TypeError: Cannot read properties of null (reading 'useRef')` in `ResponsiveContainer.js:45:22` (recharts) after the analytics refactor.

**Consequences:**
- The importmap in `analytics.html` must be reviewed whenever a new React-dependent library is added
- Libraries that are React-agnostic (d3, lodash, etc.) do not need the flag
- The pattern applies to any future page that uses an importmap + CDN React

---

## ADR-019: CSS `zoom` over `transform: scale()` for Scrollable Zoom

**Date:** 2026-06-05
**Status:** Accepted

**Decision:**
When implementing user-adjustable zoom on visualisation panels that need to remain scrollable, apply the CSS `zoom` property directly to the scroll container element. Do not use `transform: scale()` for this purpose.

**Rationale:**
`transform: scale()` visually enlarges the element but does not change its layout box — the browser still allocates space as if the element were at its original size. `overflow: auto` on the parent therefore sees no overflow and shows no scrollbars, making zoomed-in content unreachable. A nested structure (zoom on inner div, overflow:auto on outer div) partially solves the scroll problem but creates an intermediate layer that intercepts pointer events, breaking React's synthetic event system — `onMouseEnter`/`onMouseLeave` on SVG children stop firing when zoom ≠ 1.

CSS `zoom` rescales the element's layout box as well as its rendered output. Applying it directly to the scroll container means the container's own `overflow: auto` sees the correct enlarged dimensions and exposes scrollbars accordingly. No intermediate layer exists, so mouse events reach React components unimpeded.

**Alternatives considered:**
- `transform: scale()` + manual `width`/`height` override to force layout: brittle, breaks on dynamic content
- Nested `.viz-zoom-inner` with `zoom`: partially worked for scrolling but broke mouse events (the regression that prompted this ADR)
- `transform: scale()` + `transform-origin: top left` + synthetic scroll range via `padding-bottom`: complex and fragile

**Consequences:**
- Zoom is implemented as a single `.viz-zoom-wrap { zoom: N; overflow: auto; }` element — no nested inner div needed
- `window.setZoom()` targets `.viz-zoom-wrap` directly
- The CSS `zoom` property is not part of the CSS spec (it is a legacy property), but has universal browser support including Firefox as of 2024; it is safe to use here
- If a future browser drops `zoom` support, the fallback is `transform: scale()` with the scroll limitation accepted, or a full reimplementation using a ResizeObserver to measure content and set explicit dimensions