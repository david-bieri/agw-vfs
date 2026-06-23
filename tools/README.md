# AGW Maintainer Tools — Members' Publications

These two scripts help the host curate the **Members' Publications** page
(`publications-members.html`). They run **on your machine or in Manus**, never
on the live website, so no API key is ever exposed publicly.

The page itself is plain static data: everything these tools produce is
**paste-ready JavaScript** for the `MEMBER_PUBS` array in `agw_member_pubs.js`.
You always review before pasting — the tools never edit the site directly.

---

## 1. `doi_expand.py` — DOI & ORCID importer

Turns a DOI (or an entire ORCID profile) into clean publication objects using
the free, official **Crossref** and **ORCID** APIs. No key required.

```bash
# Expand one or more DOIs
python3 tools/doi_expand.py 10.1215/00182702-26-2-327 10.1111/meca.12018 \
        --member "Bertram Schefold" --theme classical

# Import every work from an ORCID profile, then keep the ones you want
python3 tools/doi_expand.py --orcid 0000-0002-1825-0097 --member "Jane Doe"
```

> **Why not Google Scholar?** Scholar has no official API. Importing from it
> means scraping, which breaks Google's terms, hits CAPTCHAs, and stops working
> whenever their HTML changes. ORCID gives the same "import then select/deselect"
> workflow on a stable, sanctioned API. Members can paste their ORCID iD in
> seconds. (See `AGW_MEMBER_PUBLICATIONS_FEASIBILITY.md` for the full rationale.)

## 2. `cv_to_bio.py` — CV → standardized bio + publications

Reads a member's CV (plain text or piped from a PDF) and produces a short
bilingual (DE/EN) biography plus a themed, paste-ready publication list, using
an OpenAI-compatible model.

```bash
# Plain-text CV
python3 tools/cv_to_bio.py cv.txt --member "Jane Doe"

# PDF CV (pdftotext ships with poppler-utils)
pdftotext cv.pdf - | python3 tools/cv_to_bio.py - --member "Jane Doe"

# Pick a model / save the raw JSON
python3 tools/cv_to_bio.py cv.txt --member "Jane Doe" --model gpt-5 --out jane.json
```

**Platform-independent by design.** It calls whatever OpenAI-compatible endpoint
`OPENAI_API_BASE` / `OPENAI_API_KEY` point at — Manus, OpenAI, Azure, or a local
model — without code changes. In the Manus sandbox these are pre-set; available
models include `gpt-5-mini` (default), `gpt-5`, `claude-sonnet-4-6`, and others.
Set `AGW_CV_MODEL` to change the default.

---

## Typical workflow

1. A member emails their CV, ORCID iD, or a list of DOIs.
2. Run `cv_to_bio.py` (CV) and/or `doi_expand.py` (DOIs/ORCID).
3. Review the printed objects: fix the `member` name, adjust `themes`
   (see the list at the top of `agw_member_pubs.js`), verify titles/years.
4. Paste into the `MEMBER_PUBS` array in `agw_member_pubs.js`.
5. Commit and push — GitHub Pages redeploys in about a minute.

All publications are verified by a human before they go live, so the page stays
accurate and the society keeps full editorial control.
