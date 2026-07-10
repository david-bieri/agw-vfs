# AGW — Design Cohesion Audit

**Date:** 2026-07-10 · **Reviewed at:** v48 (7 pages, custom domain live, post-conference)
**Scope:** cross-page visual consistency — colour, type, cards, spacing, interaction, and the new social-card language vs. the site.

---

## Verdict

The site is **fundamentally cohesive**. It has a strong, legible identity — VfS navy, EB Garamond headings over Source Sans 3 body, restrained cards on a warm-white (`--cream`) canvas — that reads consistently from the hero to the gallery to "Im Fokus." Nothing here is broken. What follows is *drift*: small inconsistencies that accumulated as the site grew across ~48 cache versions and three feature waves. All of it is systematisable — a half-day of token cleanup, not a redesign. Fixing it raises the site from "consistent enough" to "obviously one hand."

Findings are ordered by leverage (impact ÷ effort).

---

## 1. Corner radius has forked (quick win)

The original card family uses `border-radius: 10px` (`.card`, `.info-card`, `.archive-item`, `.chairs-list`, `.pub-list-inner`); the two newest components use `12px` (`.hl-card`, `.hl-feature`), and the lightbox image uses `6px`. Three values, no rule.

**Fix:** pick one card radius (recommend **12px** — it reads a touch more contemporary and the newest work already uses it), define it as `--radius-card`, and apply everywhere. One token, global.

## 2. Card hover states use three different idioms (quick win)

- `.archive-item` → animates `border-color` only.
- `.gal-thumb` → `translateY(-2px)` + drop shadow (a "lift").
- `.hl-card` / `.hl-feature` → `border-color` → navy **+** shadow.

Same gesture (hovering a clickable card), three behaviours. **Fix:** standardise on one — recommend the `.hl-card` idiom (navy border + soft shadow, no lift) since it's the most restrained and already on the most prominent surface. Retire the `translateY` lift.

## 3. The eyebrow / kicker / label system needs one token (quick win)

Uppercase mini-labels appear as `.section-label`, `.hl-eyebrow`, `.hl-kicker`, `.footer-col-title`, `.nav-brand-sub` — with **letter-spacing drifting across `.07em / .1em / .14em / .18em`** and varying sizes/colours. They're conceptually the same element.

**Fix:** define one `--tracking-label` (recommend `.14em`) and a single `.eyebrow` utility (11px, weight 600, navy, uppercase); have the others inherit. Consolidates ~5 near-duplicate rules.

## 4. Two blues, and now a gold that lives only off-site (a real decision)

The palette carries `--navy #1B3A6B`, `--navy-dark #122852`, `--navy-mid #24477F`, and `--accent #3A6BAF` (a lighter blue). The navies form a clean scale; `--accent` is used sparingly and mostly reads fine, but it's worth auditing whether it earns its place or should fold into the navy scale.

The sharper issue: the **thumbnail/social-card generator introduced gold `#CBA13A`** as the kicker accent — and gold appears **nowhere in the site CSS**. So the committee's social cards and its website are now subtly different brands. This is the one finding with strategic weight, not just cleanup.

**Decision needed (pick one):**
- **(a) Adopt gold as a site accent** — add `--gold`, and use it lightly (kicker underscores, the `.gold-rule`, active-tab indicator). This unifies site ↔ social and adds warmth against all that navy. My lean.
- **(b) Keep gold social-only** — then soften/retire gold in the generator so the cards match the site's navy-only accenting instead.

Either is fine; the current state (gold on cards, none on site) is the only wrong answer.

## 5. Responsive breakpoints are ad hoc (medium)

Across the CSS: `~403px` (nav), `600px` (lightbox), `820px` (`.hl-grid`), and `640 / 480 / 380` inside `analytics.html`. Six breakpoints, no shared scale.

**Fix:** standardise on a small set (e.g. **520 / 768 / 1024**) as comment-documented conventions and migrate components to them over time. Low urgency, but it's why some pages reflow at different widths than others.

## 6. Buttons are one-offs (medium)

`.nav-vfs`, `.btn-cal`, `.prog-tab`, `.arch-view-btn`, `.print-btn`, `.lang-toggle` are each styled independently. They look *related* (navy, pill-ish) but aren't a system.

**Fix:** define a `.btn` base + modifiers (`.btn-ghost`, `.btn-pill`, `.btn-active`). Not urgent; do it opportunistically when a button next needs editing.

---

## Prioritised plan

**Quick wins (one pass, ~1–2h, mechanical):** items 1, 2, 3 — radius token, one hover idiom, one eyebrow utility. These alone remove most of the visible drift.

**The one real decision:** item 4 — resolve gold (adopt site-wide vs. pull from social). This is the highest-leverage *design* call; everything else is hygiene.

**Slow burn (as you touch them):** items 5, 6 — breakpoint scale and button system.

## Where Claude Design fits

This audit is the analysis. If you want to *explore* the item-4 gold decision visually — see the homepage hero and an "Im Fokus" card with vs. without a gold accent, side by side — that's exactly the kind of divergent, on-canvas exploration the **Claude Design** app is built for; take this file in as the brief. The item 1–3 fixes don't need exploration; they're mechanical and can go straight to a CSS-token commit.

---

*Not in scope (deliberately): content, copy, IA, or the analytics visualisations' internal design — this is a shell-cohesion audit. The hero constellation, gallery, and Im Fokus feature were all judged cohesive as-is.*
