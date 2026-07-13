# AGW Session Notes

**Last session:** 2026-07-12/13 (long, single-topic, one compaction)
**Topic:** The Tagungsband chapter corpus — harvest → theme curation → volume ToCs → member research spine → citation export → ORCID harvest. Then a data-integrity sweep (chair, badges, hosts, counts) and the PWA update notice. **Seven silent-failure bugs** found and fixed.
**Version at session end:** **v65** (`agw-2026-v65-update-notice-facts`) — verified live on `main`
**Conference status:** CONCLUDED (46. JT, 25–27 June 2026). Standing-committee-home phase.

---

## 1. Deployed this session — all verified live on `main`

- **v58 — the chapter corpus.** `agw_volume_chapters.js`: **288 chapters, 43 volumes**, zero HTML↔PDF disagreements, plus `VOLUME_META` (year, editors, ISBN, DOI for all 43). Volume ToCs on `archive.html`; the two-block member spine on `publications-members.html`; `agw_cite.js` (Chicago/Harvard/BibTeX, bulk `.bib` per volume and per member); `preclassical` replacing `cameralism`.
- **v60 — archive fixes + supplements.** Leaflet **JS** added to `archive.html` (it had loaded the CSS only, so the Karte tab had been silently empty since the multi-page split); Referenten tab rebuilt on the corpus with name folding; 19 curated supplements; four working papers upgraded to their published versions.
- **v61 — theme-view fix.** `rowsFor(view)`: aggregate views count `VOLUME_CHAPTERS`, member views count `MEMBER_CHAPTERS`. Chapter years from `VOLUME_META`.
- **v62 — member data.** 11 ORCID-sourced supplements (Sturn, Braun, Krämer, Wagner, Landmann); four institution records corrected (Lorenz → Friedrich-Schiller-Universität Jena; Weizsäcker → MPI **für Verhaltensökonomik**, renamed end-2025; city dropped from `inst` for Bieri and Chaloupek).
- **v63 — Küsters + captions.** **Anselm Küsters** added (neu gewählt 2026; `MEMBERS` 48→49) with his dissertation. Gallery captions written for 8 of 9 photos, DE/EN.
- **v64 — badges + hosts.** Badges now **inflect**: Emeritus/**Emerita**, Vorsitzende/**Vorsitzender**, Gastgeber/**Gastgeberin**, via the new `MEMBERS.gender` field. Host badges for **2022–2026**, derived from the new `ARCHIVE[].host` field (was a single `role:'host2026'` literal).
- **v65 — committee facts + PWA update notice.** `committee.html` had **six hardcoded facts** on two cards: the chair's name (twice — still read *Klump* months after the handover), the member count, the volume count ("42 Bände" in German against "43 volumes" in the English string), the host's name ("Dr. David Bieri" while `MEMBERS` says *Prof. Dr.*), and the host year. All now derived from `CHAIRS`/`MEMBERS`/`PUBLICATIONS`/`ARCHIVE`. Duplicate ESHET/HES rows dropped from the Kontakt card. **`agw_nav.js` now carries `mountUpdateNotice()`** — an in-page "Neue Inhalte verfügbar — Neu laden" bar.

**State of the record:** `MEMBERS` 49 · `MEMBER_PUBS` 50 · `VOLUME_CHAPTERS` 288 · `VOLUME_META` 43 · 48 of 49 members have content (only Arash Molavi does not).

---

## 2. Pending deploy

**Nothing.** Everything is on `main` and verified via `raw.githubusercontent.com`.

**One-off:** v65 is the deploy that *installs* the update notice, so it could not announce itself — a manual SW unregister was needed once. **From v66 onwards visitors get the reload bar automatically and nobody ever needs to be told to hard-refresh again.**

---

## 3. Decisions

**ADR-026 … ADR-033** are on `main`. The three that matter most:

- **030** The corpus: the D&H eLibrary is the source of truth. Crossref has chapter DOIs for only 2 of 43 volumes; `PUBLICATIONS` has `year:null` for 31 of 43; `citation_publication_date` is the *e-edition* date; PDF filenames carry stale band numbers. **`tools/themes.csv` is the curation overlay and must stay in the repo.**
- **031** *(David's call)* The member bibliography is **committee-curated on a legitimate-interest basis**, not consent-by-submission. This **withdrew** the standing rule in `pubs_import.py`. The consequences are obligations: a Datenschutzerklärung must exist, an opt-out must be honoured, accuracy is on the maintainer.
- **033** **Aggregate views count the corpus; member views count the expansion.**

### 🔜 Write ADR-034 next session — "Derive, never hardcode"

`committee.html` was a museum of this failure mode: **six** literals that no data edit could reach, on two cards. The data was *already correct* in every case — that is the sting. The chair is now "the `CHAIRS` entry that is not `past`"; the hosts are `ARCHIVE[].host`; the counts are `.length`. In 2030 the page updates itself.

**Corollary, learned the hard way in v65:** a derived slot must ship with **fallback text**, not an empty `<span>`. GitHub Pages caches assets (~10 min) independently of the HTML, so a visitor can hold new HTML with a stale `agw_app.js` — and an empty slot renders a blank box. The derived value overwrites the fallback on every load and every language toggle, so the fallback cannot rot the way the old literal did.

---

## 4. Latent issues

- **`data/gallery.js`: `p4901` is still the placeholder caption.** It is the FIRST photo in the grid. One line from David finishes the set.
- **Two working papers unchecked:** `Ehnts 2019`, `Barens 2011`. Of the five checked, **four had been published** — one under a changed title.
- **ORCID homonyms are the standing hazard.** `Michael Wohlgemuth`'s ORCID belongs to an open-access/bibliometrics researcher at Bielefeld, **not** the ordoliberal economist. Nothing was taken from it. The `venue` column caught it; the name and affiliation did not.
- **ORCID deposits carry the depositor's own errors.** Thomsen's record types Band XXXVII as an *edited* volume (the publisher gives Caspari as editor); Wagner's five hits were one book in two language editions plus three of its own chapters, one DOI reading `10.10l07/…` with a lowercase L. All excluded; the exclusions are documented in a comment block in `agw_member_pubs.js`.
- **`MEMBERS.gender`** exists only on the three women (Allgoewer, Flechtner, Horn) and only for German grammar (Emerita, Vorsitzende, Gastgeberin). Never inferred from first names at runtime. Karen Horn hosted 2023 — that is why it exists.
- **Only 5 of 46 conferences have a `host`.** The other 41 are equally derivable; that is David's archive knowledge, not something inferable from a venue string.
- **The `archive.html` scroll question was never answered.** David reported the page scrolling to the bottom, but the URL carried `#publikationen` — the last section — so an anchor jump and "scrolled to the bottom" are indistinguishable. **Load it with no hash.**
- **PowerShell writes CSVs in CP850**, not UTF-8. `orcid_seed.py` now decodes utf-8/cp1252/cp850 and hard-fails on an unknown `mid` (a `turn-richard` typo would otherwise have attached a publication to nobody).
- **`overlord.bib` has lost ligatures** — `Œconomia` arrived as `conomia`. Grep the master bib.
- **`MEMBER_PUBS` co-authorship is single-`mid`.** `VOLUME_CHAPTERS` uses `mids[]` and does this correctly.
- **Two clones exist.** Keep `C:\Users\bieri\Documents\GitHub\agw-vfs`, not the OneDrive one.

---

## 5. Open for David

### 🔴 Persistent — five sessions now

**Impressum + Datenschutzerklärung.** ADR-031 makes this a **prerequisite**, not a follow-up: legitimate interest without a privacy notice is not a legal basis, it is a preference. Independent of the member feature anyway — the site publishes 288 chapter records naming ~200 people, plus photo captions naming six colleagues. Blocked on six facts (Diensteanbieter — VfS e.V. recommended; postal address; Vertretungsberechtigte; Vereinsregister-Nr. + Registergericht; contact email; DSB) — **or one email to the VfS Geschäftsstelle** for their Impressum boilerplate, Datenschutzerklärung and member-consent template. Every German e.V. has all three.

### The participant email — drafted, not sent

Apericena (CHF 40) + Monte Generoso (CHF 48.50) settlement plus the website invitation, in German, with the ADR-031 opt-out sentence embedded. Before sending:

- **Send to the 29 registrants, BCC — not the 89-address mailing list.** **57 of the 89 did not attend Riva**; a payment demand to them would be a mistake. BCC because it is an invoice and private addresses are in the list.
- **Nine bookings were multi-person.** Rieter booked **three** (CHF 265.50); Spahn, Allgoewer, Hagemann, Krämer, Küsters, Milford, Sturn, Trautwein, Wegner booked two (CHF 177.00). The draft says so explicitly — without it, nine people would pay half.
- **Unresolved:** which **Schmidt** (Johannes, h-ka.de — or Karl-Heinz, Paderborn)? Which **Klump** mailbox (`klump@wiwi…` or `klump@hof…`)?
- **Placeholders:** account holder's full name, payment deadline; confirm PostFinance AG 3030 Bern.
- The roster records *registrations*, not per-event attendance; the draft asks people to self-declare.

### Five emails — the last mile no tool can walk

**Molavi** (0 chapters, ORCID registered but empty — the only member with an empty page), **Wohlgemuth** (ORCID hit was a different person), **Blomert**, **Lorenz**, **Weizsäcker** (no iD; he co-authors with Krämer in *Wirtschaftsdienst* — a direct ask beats any harvest).

### Smaller

- `p4901` gallery caption.
- `archive.html` with no hash — does it still scroll?
- Ehnts 2019 / Barens 2011.
- Ask **Küsters** which affiliation to show: cep Berlin (his post, currently used) or the MPI (his scholarly home, and the address he registered with). He is on the Riva list — one extra line in the participant email.

---

## 6. Next session

1. **Impressum + Datenschutzerklärung.** The binding constraint on the whole member-research track.
2. **Privacy hardening** — self-host Google Fonts (every page load currently sends visitor IPs to Google: the *LG München I, 20.01.2022* fact pattern), vendor Leaflet + qrcode, click-to-load the OSM map. **Needs nothing from anyone**, and it *shortens* the Datenschutzerklärung that has to be written. The right thing to build while waiting on the VfS.
3. **Promote ADR-034** (derive, never hardcode) and the fallback-slot corollary.
4. **The five emails**, and the participant email once §5 is resolved.
5. **Backlog:** hosts for the other 41 conferences; the v49 "Im Fokus" rail tiles + ESHET–HES Nice event; the design cohesion pass (`AGW_DESIGN_AUDIT.md`, gold accent); school-laning (Jevons, Sraffa); `MEMBER_PUBS` co-authorship → `mids[]`.

---

## Method notes worth keeping

- **Seven silent failures this session**, none of which threw an error: an empty map (Leaflet CSS without its JS); a contributor ranking built from 18 of 46 conferences (Dieter Schneider's 12 chapters simply absent); theme pills counting the member expansion instead of the corpus; a curation file that was never committed; a chair name hardcoded into markup, still naming Klump after the handover; a badge reading the placeholder `'Emeritus/a'` for fourteen people; and a host row demoting the maintainer to "Dr." while the data said "Prof. Dr.". **A wrong number is more dangerous than a crash** — it looks like an answer.
- **A file in a deploy block is not a file that was pushed.** This happened **twice**: `tools/themes.csv` (four versions; a rebuild would have wiped 288 curated themes) and `agw_nav.js` (the SW cache name already claimed the update notice while `grep` returned 0). Verify the artefact against `raw.githubusercontent.com`, not the instruction.
- **A guard that returns empty protects the page and hides the fault** (ADR-016). When something renders blank, suspect a missing dependency before a logic bug.
- **Use the instrument that answers the question.** Web search happily returns ORCID iDs — belonging to the wrong people. ORCID's API returns the affiliation alongside the iD. Under ADR-031 the accuracy obligation is the maintainer's.
- **Verify the instrument before believing the reading.** Every self-corrected error this session was the same mistake — print-vs-electronic ISBN; reading Crossref's 476-item relevance sweep as a ceiling; calling Rieter's genuine 245-page bibliography chapter a parse bug; assuming `to_entry()` returned a dict when it returns a formatted string; a Node 22 built-in `navigator` silently shadowing a test stub.
- **JS smoke-test pattern:** concatenate the data file with an inline test and pipe to `node`. Stub `setInterval`/`setTimeout` before loading `agw_app.js`. Build the vm context from a **plain object**, not `global` — Node 22 has its own `navigator`.

---

*Generated via the AGW_HANDOVER.md protocol, 2026-07-13.*
