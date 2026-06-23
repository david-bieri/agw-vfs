# AGW Website — Member Publications & Self-Service Profiles

**Feasibility & architecture assessment**
Scope requested:
1. A page listing **AGW members' publications by thematic category**.
2. Member tiles that open a per-member panel where the member can **(a) upload a CV that AI converts into a standardized bio + extracts publications**, and **(b) manually add/update publications via a DOI loader or a Google Scholar profile import, with a select/unselect checklist** of imported items.

---

## 1. The key architectural fact this hinges on

The AGW site today is a **purely static HTML/JS site** hosted on **GitHub Pages**, with all content in flat JS files (`agw_data.js`, `agw_strings.js`) and **no backend, no database, and no per-user login**. The `MEMBERS` array already carries useful structure — each of the ~48 members has `name`, `inst`, `city`, `country`, `role`, and bilingual `focus_de`/`focus_en` thematic keywords — but there is **no place to store a publication list, an uploaded CV, or member-specific edits**, and no way to know *who* is editing.

That single fact splits your request cleanly into two tiers:

| Tier | What it needs | Where it fits today |
|---|---|---|
| **Tier 1 — display only** | Read-only data the maintainer curates | Works on the current static site, no new infrastructure |
| **Tier 2 — member self-service** (CV upload, AI bio, DOI/Scholar import, save) | Server-side code + storage + authentication + AI API calls | **Cannot** run on GitHub Pages; requires a real backend app |

So the honest answer is: **part 1 is easy; the self-service parts are a different class of project.** Below I break each feature down with a difficulty rating and the realistic options.

---

## 2. Feature-by-feature feasibility

### Feature A — Publications listed by thematic category — **EASY (static)**

This is very doable on the current site and is a natural extension of what already exists.

- The `focus_de`/`focus_en` fields already encode themes (e.g. *"Sraffa, klassische politische Ökonomie"*, *"Ordoliberalismus"*, *"Post-Keynesianismus"*). These can be normalized into a controlled set of **thematic categories** (Austrian School, Sraffa/Classical, Post-Keynesian, Ordoliberalism, Monetary theory, Methodology/Philosophy of science, Economic history, etc.).
- Add an optional `pubs:[…]` array to each member object (or a separate `MEMBER_PUBLICATIONS` array keyed by member), each publication tagged with one or more `themes`.
- Build a new page `publications-members.html` (mirroring `archive.html`/`committee.html`) that groups publications under theme headings with filter chips — reusing the existing `.badge`, `.archive-*`, and filter-button patterns.

**Difficulty: 1–2 days** of work, entirely within the current architecture. The only real cost is **populating and maintaining the data** — which is exactly what Tier 2 tries to automate.

> Bottom line: a beautiful, filterable themed-publications page is low-risk and can ship immediately. The question is purely *how the data gets in*.

---

### Feature B — Member tile → upload CV → AI standardized bio + publication extraction — **HARD (needs backend + auth)**

Technically the AI step is straightforward and high-quality:

- A CV (PDF/DOCX) → text → LLM prompt → returns a **standardized bilingual bio** in the site's voice plus a **structured list of extracted publications** (title, year, venue, co-authors, DOI if present). This is reliable with current models and is exactly the kind of extraction these tools do well.

The hard part is **everything around the AI call**, none of which the static site can do:

1. **File upload & parsing** — needs a server endpoint to receive the file and extract text.
2. **An LLM API key** — must live server-side; it can **never** be shipped in a static page (it would be public and abusable).
3. **Authentication** — you must know *which member* is uploading so the result attaches to the right tile, and so a stranger cannot overwrite someone's profile.
4. **Storage** — the generated bio + extracted publications must be saved somewhere (database or, at minimum, written back to a repo file).
5. **A review/approval step** — AI extraction needs human confirmation before it goes live (academics are rightly picky about their bios and publication lists).

**Difficulty: significant.** This is not an add-on to the static site; it requires a small web application with login, a database, file storage, and a server-side LLM integration. Realistically a **multi-week build**, plus ongoing hosting and a maintenance/moderation workflow.

---

### Feature C — Manual add/update with DOI loader — **MODERATE**

The DOI lookup itself is genuinely easy and **free**: the **Crossref** and **DataCite** REST APIs (and `doi.org` content negotiation) return full metadata for a DOI with no key required. A "paste a DOI → fetch title/authors/year/venue → preview → add" flow is a small amount of client-side JS.

- **If read-only display is acceptable** (maintainer pastes DOIs while editing data), this can even be a **build-time helper script** that the maintainer runs locally to expand DOIs into `agw_data.js` entries — *zero* new infrastructure.
- **If members must do it themselves and save**, then it inherits the **same auth + storage requirement** as Feature B (it's the "save" that needs a backend, not the lookup).

**Difficulty: the lookup is trivial (hours). The "members save it themselves" wrapper is the same backend problem as B.**

---

### Feature D — Google Scholar import with select/unselect checklist — **HARD / FRAGILE**

This is the riskiest item, for reasons that are external to your site:

- **Google Scholar has no public/official API.** Importing a profile means scraping, which (a) violates Google's terms, (b) is frequently blocked by CAPTCHAs, and (c) breaks whenever Google changes its HTML. Tools that do this (e.g. the `scholarly` Python library) work but are **unreliable and need a server with rotating proxies** to run at any scale.
- A robust, *sanctioned* alternative is **ORCID**: members link their ORCID iD and you pull their works list via the **official ORCID public API** (free, stable, designed for exactly this). This gives you the same "import my publications, then tick/untick which to show" UX — the checklist part is easy once you have a list — **without** the fragility and ToS issues of Scholar.
- **OpenAlex** and **Semantic Scholar** also offer free APIs that can fetch an author's works and are far more dependable than Scholar.

**Difficulty: Google Scholar specifically — high effort, low reliability, needs a backend. Recommend ORCID/OpenAlex instead**, which downgrades this to *moderate* and gives a much better long-term experience. The select/unselect checklist is trivial UI in all cases.

---

## 3. Summary table

| Feature | Technically possible? | Fits current static site? | Difficulty | Main blocker |
|---|---|---|---|---|
| A. Themed publications page | Yes | **Yes** | Easy (1–2 days) | Just data entry |
| B. CV → AI bio + pub extraction | Yes | No | **Hard** | Backend + auth + storage + LLM key |
| C. DOI loader (lookup) | Yes | Yes (as tool) | Easy | none |
| C. DOI loader (members save) | Yes | No | Hard | Backend + auth |
| D. Google Scholar import | Yes, but fragile | No | **Hard / risky** | No official API, scraping, backend |
| D. ORCID/OpenAlex import (recommended) | Yes | No | Moderate | Backend + auth |

---

## 4. Three realistic paths forward

### Path 1 — Static + maintainer-curated (lowest cost, ships now)
Keep the site static. Build **Feature A** (themed publications page). Provide a **local DOI-expander script** and an **AI-assisted CV→bio helper that *you* (the maintainer) run** to generate entries, then commit them. Members email you their CV / ORCID / DOIs; you batch them in. 

- **Pros:** no new infrastructure, no hosting cost, no security surface, full editorial control, AI quality is excellent because it's done offline with review.
- **Cons:** members can't self-serve; you remain the bottleneck.
- **Effort:** ~2–4 days total. **This is what I'd recommend starting with.**

### Path 2 — Add a lightweight backend app for self-service
Build a small companion web app (with login, database, file storage, and server-side LLM + ORCID integration) that members use to manage their own profile; the app writes approved data that the public site reads. The public AGW site can stay where it is and simply consume the published data.

- **Pros:** delivers the full vision — CV upload, AI bio, DOI/ORCID import, select/unselect, members self-edit.
- **Cons:** it's a real application: authentication, a database, file storage, an LLM API budget, moderation workflow, and **ongoing maintenance and hosting costs**. Multi-week build.
- **Effort:** weeks, plus recurring upkeep.

### Path 3 — Hybrid (recommended end-state)
Ship **Path 1 now** (themed page + maintainer tooling), and *only if member demand justifies it* graduate the self-service pieces to **Path 2**, preferring **ORCID over Google Scholar** and always keeping an **approval step** before anything goes public. This sequences the easy value first and defers the expensive, higher-maintenance build until it's clearly worth it.

---

## 5. Specific recommendations

1. **Decouple "display" from "data entry."** The themed-publications *page* is easy and worth building regardless of how data is sourced. Do that first.
2. **For publication identifiers, prefer DOI + ORCID over Google Scholar.** They're free, official, stable, and avoid scraping/ToS problems. The "import then tick/untick" UX is identical and easier to build on top of them.
3. **Treat CV→AI bio as a maintainer-assisted step first.** The extraction quality is excellent; doing it offline with your review avoids the entire backend/auth/security burden while you validate that members actually want this.
4. **Only build the self-service app if there's real demand**, and budget for the fact that it carries auth, storage, an LLM key, hosting, and an ongoing moderation responsibility — categorically different from the current zero-maintenance static site.
5. **Keep an approval gate** on anything members submit. Academic bios and publication lists are sensitive; auto-publishing AI output unreviewed will create more correction work than it saves.

---

### One-line answer to "how difficult would it be?"

> **The themed-publications page and DOI/ORCID lookup are easy and fit the current site. The member self-service features (CV upload, AI bio, save-your-own-publications, Scholar import) are a separate, multi-week web-application project requiring a backend, authentication, storage, and an LLM budget — very doable, but a real step up in cost and ongoing maintenance from today's static site.** I'd recommend shipping the easy display layer first and adding self-service only if member demand justifies it, using ORCID rather than Google Scholar.
