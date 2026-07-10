# AGW Website — Architecture Decision Records (ADRs)

Each record documents a significant decision: what was decided, why, what alternatives were rejected, and what consequences follow.

Statuses: `Accepted` | `Superseded` | `Deprecated` | `Proposed`

---

## ADR-001: Single Self-Contained HTML File Architecture

**Date:** 2026-05-29
**Status:** Superseded by ADR-013 (multi-page architecture, 2026-06-04)

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
**Status:** Superseded by ADR-014 (paper-title Option 3 hybrid, 2026-06-04)

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

## ADR-013: Multi-Page Architecture (supersedes ADR-001)

**Date:** 2026-06-04
**Status:** Accepted (supersedes ADR-001)

**Decision:**
Split the monolithic `index.html` into multiple static HTML pages sharing a set of extracted foundation files. Keep the no-bundler / no-framework posture for the pages and foundation files; the React analytics bundles remain the sole build-step exception (ADR-018).

**Rationale:**
The single file passed ~300 KB — the explicit Phase-3 trigger written into ADR-001 — once archive, committee, and analytics content landed. One file became unmaintainable and shipped every section to every visitor. Multiple pages improve load, caching, and editing isolation while staying build-free.

**Consequences:**
- Each page carries `<div id="nav-mount"></div>` and calls `AGW.renderNav('pageId')`.
- Foundation files must stay extracted, never re-inlined (ADR-015).
- Because pages share `agw_app.js`, every `render*()`/`init*()` must early-return on a missing target (ADR-016).
- The service worker precaches all pages + foundation files and must bump on any change.

---

## ADR-014: Paper Titles — Option 3 Hybrid (supersedes ADR-003)

**Date:** 2026-06-04
**Status:** Accepted (supersedes ADR-003)

**Decision:**
The German paper title is always shown. In EN mode a translated subtitle is appended in `<span class="title-trans">`. Speaker names, addresses, and venue names remain German regardless of toggle.

**Rationale:**
ADR-003's "never translate" left EN visitors with no sense of a paper's topic; full translation (rejected) would misrepresent German-language works. The hybrid preserves scholarly identity while giving EN readers a topical gloss.

**Consequences:**
- `prog_title_N` keys carry both DE and EN; `agw_strings.js` is the single source of truth.
- The appended subtitle wraps to a new line on mobile (≤640 px).

---

## ADR-015: Foundation Files Extracted

**Date:** 2026-06-04
**Status:** Accepted

**Decision:**
CSS, shared data, render logic, nav/footer, strings, and the Chronik panel are extracted into shared foundation files (`agw_styles.css`, `agw_strings.js`, `agw_data.js`, `agw_app.js`, `agw_nav.js`, `agw_chronik.js`) loaded by every page. They must not be re-inlined into any page.

**Rationale:**
DRY across pages: one edit propagates everywhere, and the browser caches the foundation files once across navigation.

**Consequences:**
- A single foundation edit changes all pages — powerful and risky; validate broadly.
- Sharing `agw_app.js` across pages is what makes the ADR-016 render-guard rule non-negotiable.
- The service worker must precache the foundation files and bump its cache on any change.

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

---

## ADR-020 — Runtime/load-failure debugging discipline: evidence-first, verify-the-deploy, minimal-fix-first

**Status:** Accepted (2026-06-08)
**Related:** Amends the recorded "definitive fix" in ADR-018 (see Consequences); reinforces ADR-016 (render guards).

### Context

The Rezeptionsatlas / analytics React-loading bug consumed roughly a full day across several chats (with compaction mid-flight) and was ultimately resolved not in-session but by handing the page to a browser-capable agent (Manus AI). The post-mortem identified that the time sunk was not caused by the bug's difficulty — the fix is a single importmap line — but by *how it was debugged*:

1. **Blind diagnosis.** The failure was a 404 on a transitively-imported CDN module (`react/jsx-runtime` from esm.sh, whose root-relative internal imports resolved against the GitHub Pages origin), whose HTML error body was then parsed as JS → `SyntaxError`. That failure mode is trivially visible in a browser Network + Console tab and nearly impossible to pin down by reasoning from screenshots of a blank render. Debugging proceeded from the rendered symptom, not the runtime evidence.
2. **Corrupted feedback loop.** Several "fixes" shipped HTML/CSS/SW but not the compiled `dist/*.js` bundles. Failed verifications were therefore misattributed to "wrong hypothesis" when the true cause was "the experiment never ran." Belief updates went the wrong direction.
3. **Wrong-shape fix.** The working solution was to vendor the `jsx-runtime` shim locally (`"react/jsx-runtime": "./vendor/react-jsx-runtime.mjs"`). The in-session plan instead drifted toward rebuilding all three bundles with React inlined and *deleting* `vendor/` — heavier, slower, and discarding the artifact that turned out to be the fix.
4. **Hypothesis discipline lapsed under fragmentation.** The standing rule (discard any hypothesis that cannot explain BOTH "the site used to work" AND "the other tabs still work") was not applied ruthlessly, partly because the ruled-out space was reconstructed from notes each session rather than held in one context.

### Decision

For any runtime or load-time failure (blank render, module won't load, console error, "it used to work," a fix that didn't take effect), the following sequence is mandatory **before proposing a fix**:

1. **State the two invariants in writing.** "It used to work" + "the other tabs/pages still work." Any hypothesis that cannot explain both is discarded immediately.
2. **Get runtime evidence first.** The actual Console error and the Network tab (failing requests + their response content-type/body) must be in hand before any hypothesis is formed. For load failures, the Network tab is the entire diagnosis. Drive Claude in Chrome against the live page, or have David paste the verbatim console error + a Network-tab screenshot filtered to failures — never a screenshot of the rendered (blank) result alone.
3. **Verify the experiment ran before interpreting it.** Fingerprint the live deployed artifact (e.g. SHA of the on-server `dist/*.js`) against what was built. If they don't match, the deploy was incomplete and the result is void — do not update beliefs on it. Any deploy touching analytics behavior MUST include `dist/agw_gaze_map.js`, `dist/agw_analysis.js`, `dist/agw_pmi.js` (per the 2026-06-05 deploy-artifact lesson).
4. **Prefer the minimal dependency-severing fix.** A one-line importmap repoint beats a three-bundle WSL rebuild. Reach for architectural cleanliness only after the bug is dead.
5. **Reach for a browser-capable agent early** when the bug is environment/runtime-specific rather than logic-specific. That capability gap is precisely what resolved this bug; treat it as a routing decision, not a last resort.

The operational protocol lives in `AGW_DEBUG.md` (skill).

### Consequences

- **ADR-018 correction.** The actual production fix is local vendoring of `react/jsx-runtime` (`./vendor/react-jsx-runtime.mjs`), with `react`/`react-dom` still external via esm.sh and recharts still `?external=react,react-dom`. The previously recorded "definitive fix = rebuild with React bundled in, remove `vendor/`" is **wrong** and superseded: `vendor/` is load-bearing and must be kept. ADR-018's externalization principle stands; only the jsx-runtime delivery mechanism is amended.
- Debugging gains an explicit evidence gate, which front-loads a small cost (get the Network tab) to avoid multi-hour blind iteration.
- Deploy verification by artifact hash becomes routine for analytics changes.

---

## ADR-021: Custom-Domain Base-Path Rule

**Date:** 2026-07-09
**Status:** Accepted

**Decision:**
On `www.agw-vfs.de` the site serves from root `/`. Internal paths must be root-absolute (`/…`) or relative, never `/agw-vfs/`-prefixed. `canonical` / `og:url` must reference the **served** host (`www.agw-vfs.de`), not the apex. Any domain or base-path change must sweep `agw_app.js` as well — the iCal export URL, the footer QR text, and the service-worker registration path — not only the HTML/manifest/SW set.

**Rationale:**
The `/agw-vfs/` sub-path is a `github.io` project-site artifact; on the custom root domain those paths 404. In the first migration sweep the SW registration path (`register('/agw-vfs/service-worker.js', {scope:'/agw-vfs/'})`) was missed, so the service worker never registered on the new origin.

**Consequences:**
- Grep beyond HTML/manifest/SW (into `agw_app.js`) whenever domain or paths change.
- Verify `canonical` matches the served host, or it contradicts the Pages redirect.

---

## ADR-022: Events Data Model

**Date:** 2026-07-09
**Status:** Accepted

**Decision:**
`ARCHIVE` is the single source of truth for AGW's own Jahrestagungen (all treated as past). Upcoming and affiliated dated events live in a separate `EVENTS` array with ISO dates (an event migrates into `ARCHIVE` once past). Peer networks with their own event feeds are modelled in `EVENT_NETWORKS`. `renderEvents()` merges `ARCHIVE` + `EVENTS` and derives past/upcoming status from the date at render time.

**Rationale:**
Avoid duplicating the 46-conference record; derive status once rather than hand-maintaining it.

**Consequences:**
- `events.html` reads both sources; adding a Jahrestagung means one `ARCHIVE` entry, nothing more.

---

## ADR-023: Archival Event-Page Standard

**Date:** 2026-07-09
**Status:** Accepted

**Decision:**
Each archived Jahrestagung gets a standalone page; its `ARCHIVE` entry carries a `page:` field, and `renderEvents()` + `renderArchive()` auto-link to it. `jahrestagung-2026.html` is the first instance and the template for future events.

**Rationale:**
A durable per-event landing (programme, proceedings, photos) that outlives the rolling conference page.

**Consequences:**
- Future events follow the `jahrestagung-2026.html` template.
- `index.html` is now the evergreen committee landing, not a conference page (see the committee-home split).

---

## ADR-024: "Im Fokus" Landing Highlight — Live HTML, Not Baked Rasters

**Date:** 2026-07-10
**Status:** Accepted

**Decision:**
The `index.html` "Im Fokus" band (a featured item + a supporting rail) is rendered as live, bilingual HTML from `data/highlights.js` via `agw_highlights.js` — never as pre-rendered image cards. The featured slot takes a landscape image or a two-portrait diptych; the rail holds photo/publication/press cards plus optional stats/analytics tiles. Member and volume counts bind to live `MEMBERS`/`PUBLICATIONS` so they never go stale.

**Rationale:**
Baking text into raster cards would break the site's non-negotiables — the DE/EN toggle (ADR-004/014), accessibility, responsiveness, and SEO. Live HTML keeps all of these while sharing the branded design language. Branded raster cards are reserved for social / `og:image` (ADR-025), where a single-language raster is the correct medium.

**Consequences:**
- Featured images reuse the gallery variant pipeline (`img/gallery/<id>-{480,960,1440}`); rail thumbnails are plain `img/highlights/<name>.{webp,jpg}`.
- `index.html` gained a real `og:image` (the first the site has had), pointing at a generated card in `img/highlights/`.
- Images are runtime-cached (SW image branch broadened from `/img/gallery/` to `/img/`); the two JS files are precached and require a cache bump on edit.

---

## ADR-025: Branded Social/Thumbnail Cards Are a Generator, Not Hand-Made

**Date:** 2026-07-10
**Status:** Accepted

**Decision:**
Social and `og:image` cards are produced by `tools/agw_thumbnail.py` (Pillow, bundled EB Garamond + Source Sans 3 fonts), not designed by hand. Four styles (`a` floating coverline · `b` editorial split · `c` display headline · `lowerthird` institutional) × formats (`og` 1200×630 · `square` 1080×1080 · `portrait` 1080×1350), with a per-image `--focus` crop. The tool, fonts, docs, and example renders live under `tools/`; generated cards for actual use go to `img/highlights/`.

**Rationale:**
A generator guarantees a consistent AGW visual language across many future items and doubles the site's brand into social channels, at near-zero marginal effort. The magazine-style register (image-forward, gold kicker) is a deliberate *contrast* to the disciplined main site — acceptable because these are standalone posters, not on-page chrome.

**Consequences:**
- `tools/` is a repo utility tree, not part of the served app shell — not precached, no SW impact.
- The generator introduced gold `#CBA13A`, which currently exists only on cards, not in the site CSS — see the design audit (item 4) for the pending unify-or-retire decision.
- The scholarly-title convention (German titles untranslated, ADR-014) carries into card text; only kicker/meta translate.

