# Claude Design brief — AGW gold reconciliation

*Paste this whole file into a fresh Claude Design session, and attach a screenshot of the live `www.agw-vfs.de` landing page. This brief is deliberately narrow: it settles one accent-colour decision, not a redesign.*

---

## Who / what

The AGW is the standing committee for the history of economic thought within the Verein für Socialpolitik. Its site (`www.agw-vfs.de`) is a restrained, scholarly, bilingual (DE/EN) institutional site. **Do not** propose layout, IA, typography, or content changes — those are settled. This is purely about one colour.

**Design language (fixed):**
- Navy scale — primary `#1B3A6B`, dark `#122852`, mid `#24477F`
- Hover blue (accent) `#3A6BAF`
- Canvas — warm white / cream `#FAFAF7`
- Type — EB Garamond (headings/serif) + Source Sans 3 (body/UI)

## The problem to solve

Gold is an established AGW accent, but there are **two different gold values in play**, on two different backgrounds:

- **Site gold `#B8860B`** (darkgoldenrod) — used on the **cream** canvas: the hero rule, chair emphasis, pullquotes, callouts, memorial items.
- **Social-card gold `#CBA13A`** (brighter) — used on **navy** backgrounds in the generated social/og cards (`tools/agw_thumbnail.py`).

So the website and the committee's social cards accent with different golds. It might be a legitimate perceptual need (a darker gold reads on cream, a brighter gold reads on navy) — or it might just be drift. The goal is to make it **intentional**.

## What to explore (side by side)

Produce a small comparison board with these surfaces, each rendered in **2–3 gold variants**:

1. **On cream** — the landing hero (navy eyebrow, a thin gold rule under the title, EB Garamond H1) and one "Im Fokus" card (white card on cream, gold kicker accent).
2. **On navy** — a social card (navy lower third, gold uppercase kicker over an EB Garamond white headline) — the generator's `lowerthird`/`c` look.

Variants to compare:
- **A — one gold `#B8860B` everywhere** (the site's current gold, also on navy).
- **B — one gold `#CBA13A` everywhere** (the brighter gold, also on cream).
- **C — a documented pair**: keep a warm gold on cream and a brighter gold on navy, tuned so they read as *the same family* (propose the two hexes).

For each, judge: legibility (esp. gold text/rules on navy and on cream), warmth against all that navy, and whether it still reads "institutional/scholarly," not decorative.

## Deliverable

A recommendation — **one gold** (with the hex) **or** a **documented on-cream/on-navy pair** (two hexes) — with a one-line rationale. That's it. I'll wire the result into `--gold` / `--gold-light` in `agw_styles.css` and into the `GOLD` constant in `tools/agw_thumbnail.py` so the site and the social cards finally match.

## Constraints

- Gold is **decoration only** (rules, kicker accents, emphasis borders) — never body text or large fills; the site is bilingual and text stays real DOM.
- Whatever you pick must pass legibility on **both** `#FAFAF7` cream and `#1B3A6B` navy.
- Keep navy primary; gold is the warm secondary accent, used sparingly.
