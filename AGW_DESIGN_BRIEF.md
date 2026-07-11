# Claude Design brief — AGW comprehensive design review

*Paste this whole file into a fresh Claude Design session. Attach screenshots of the live pages (at least the landing page www.agw-vfs.de, plus committee.html, archive.html, analytics.html, and jahrestagung-2026.html). Optionally attach AGW_DESIGN_AUDIT.md as internal reference — but treat it as one input, not a script; go broader.*

---

## Who / what

The AGW is the standing committee for the history of economic thought within the **Verein für Socialpolitik (VfS)**. www.agw-vfs.de is its permanent home: a scholarly, institutional, bilingual (DE/EN) site — restrained and text-forward, but with a few distinctive data-visualisation showpieces. It is a static, hand-built site (vanilla HTML/CSS/JS, no framework); the only compiled part is the React analytics.

**Goal of this review:** a **comprehensive, best-practice design assessment for cohesion and polish across the whole site** — then on-canvas explorations of the highest-impact improvements. Not a redesign; an elevation of what's there so it reads unmistakably as one considered hand.

## Pages to assess

- index.html — committee landing: animated hero constellation of thinkers → "Im Fokus" highlight band → next Jahrestagung → Aktuelles → Bereiche gateways → Auf einen Blick → Kontakt
- committee.html — about, history, members, chairs, sister societies, statutes
- archive.html — scholarly archive (list/map/speakers/chronik) + publications
- events.html — unified timeline of AGW + affiliated events
- jahrestagung-2026.html — archival conference page + "Impressionen" photo gallery
- analytics.html — interactive HET analytics (Stammbaum, Denkschulen network, Rezeptionsatlas, topic analysis)
- guide.html — analytics user guide

## What to evaluate (and propose improvements for)

1. **Visual hierarchy & density** — does the eye land in the right order on each page? Is spacing doing enough work?
2. **Typographic system** — the EB Garamond / Source Sans 3 pairing: scale, rhythm, heading/label consistency, measure/line-length.
3. **Colour system** — palette discipline and contrast/accessibility across navy, the accent blue, gold, green, and the neutrals. Is the palette used consistently and intentionally on both the cream canvas and the navy surfaces?
4. **Component consistency** — cards, tiles, badges, buttons, nav, footer, the "Im Fokus" band, gallery: do they feel like one system? Where do they drift?
5. **Spacing & layout grid** — section rhythm, container widths, alignment, gutters.
6. **Responsive behaviour** — breakpoint consistency and how each page reflows on mobile.
7. **Accessibility** — colour contrast, focus states, motion (there's hover-lift + an animated hero), tap targets.
8. **Cohesion of the showpieces with the chrome** — do the hero constellation, the analytics visualisations, the gallery, and the branded social cards feel of-a-piece with the institutional shell, or like separate worlds?
9. **Overall polish** — the small things that separate "competent" from "considered."

## Deliverable

- A **prioritised set of findings** (high-impact → slow-burn), each with a concrete, implementable recommendation.
- **On-canvas explorations** of the top few: e.g. a refined component set, a tightened type scale, and a before/after of the landing page and one content page.
- Everything must be realisable in **vanilla CSS** (no framework, no build) using CSS custom properties.

## Current design tokens (for accuracy)

```
Navy: --navy #1B3A6B · --navy-dark #122852 · --navy-mid #24477F
Accent (hover blue): --accent #3A6BAF · --accent-pale #EAF0F8
Gold: --gold #B8860B · --gold-light #F5EED0        Green: --green #4A7C59 · --green-pale #EAF2EC
Canvas: --cream #FAFAF7 · --white #FFFFFF
Text: --text-dark #1C1C1E · --text-body #2C2C30 · --text-muted #6B7280 · --text-faint #9CA3AF
Borders: --border #DDE2EA · --border-light #EEF1F5
Recently tokenised: --radius-card 12px · --hover-shadow · --tracking-label .14em
Type: EB Garamond (headings/serif, display) + Source Sans 3 (body/UI)
```

## Non-negotiables (do NOT change)

- **Bilingual** — all UI text is real, translatable DOM (DE/EN toggle); no text baked into images.
- **Register** — scholarly, institutional, understated. Not a startup landing page.
- **Identity** — VfS **navy** #1B3A6B is primary (never VT maroon); EB Garamond + Source Sans 3.
- **Architecture** — static vanilla CSS/JS, no framework/build; keep it implementable by hand.
- **Content & IA** — leave copy, navigation structure, and page inventory as-is; this is about the visual system, not the information architecture.
