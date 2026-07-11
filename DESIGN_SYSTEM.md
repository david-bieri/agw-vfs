# AGW — Design System

The visual and structural conventions of **www.agw-vfs.de**. This is the record of *decisions* so contributors extend the system rather than rediscover (or re-fork) it. Everything here is realised in vanilla CSS custom properties + a few shared JS modules — no framework, no build (the only compiled artefacts are the React analytics bundles in `dist/`).

**Golden rule:** every page loads `agw_styles.css` and consumes the shared nav/footer/i18n. Do **not** re-declare tokens, nav, or base styles inside a page — that fork is the exact drift this system was built to end.

---

## 1 · Foundations

### Type
- **Display / serif:** EB Garamond (`'EB Garamond', Georgia, serif`) — headings, card titles, pull-quotes, numerals in showpieces. Weight 500 for headings, italic for quotes/emphasis.
- **UI / sans:** Source Sans 3 — body, labels, controls, data. Weights 300–700.
- Loaded once per page via the Google Fonts `<link>`; never swap families.

### Colour tokens (`:root` in `agw_styles.css`)
| Token | Hex | Use |
|---|---|---|
| `--navy` | `#1B3A6B` | **Primary.** VfS navy — never VT maroon. |
| `--navy-dark` | `#122852` | Nav bar, footer, deep surfaces |
| `--navy-mid` | `#24477F` | Hover on navy, secondary navy |
| `--accent` | `#3A6BAF` | Links, active states, clickable-card border |
| `--accent-pale` | `#EAF0F8` | Accent fills, sub-tab strips |
| `--green` / `--green-pale` | `#4A7C59` / `#EAF2EC` | Success / affiliation |
| `--cream` | `#FAFAF7` | Page background |
| `--white` | `#FFFFFF` | Cards, panels |
| `--text-dark` | `#1C1C1E` | Emphasis text |
| `--text-body` | `#2C2C30` | Body copy |
| `--text-muted` | `#6B7280` | Secondary text (AA on cream) |
| `--text-meta` | `#5A6270` | **Small print** — captions, meta (AA on cream) |
| `--text-faint` | `#9CA3AF` | **Decoration only** — rules, dividers. **Never for text** (~2.5:1, fails AA) |
| `--border` / `--border-light` | `#DDE2EA` / `#EEF1F5` | Card borders / inner dividers |

### The gold pair (documented, not accidental)
Gold is **two values** because it sits on two surfaces:
- `--gold` `#B8860B` — on **cream/white**: rules, left-borders, large accents.
- `--gold-on-navy` `#CBA13A` — on **navy**: countdown, constellation, OG cards (4.6:1 on navy, AA).
- `--gold-ink` `#6B4F00` — the single gold **text** colour (e.g. gold badges on cream). Do not invent per-component gold darkenings.

### Contrast floor
Body text ≥ 4.5:1, large text ≥ 3:1. Verified: `--text-body` 13:1 (AAA), `--text-muted`/`--text-meta` ~4.7:1 (AA), `--accent` on white 5.4:1, `--gold-on-navy` on navy 4.6:1. **`--text-faint` is decoration only.** The living style guide (`styleguide.html`) computes these live from the tokens — check it after any colour change.

---

## 2 · Scales

### Type scale (`--fs-*`) — snap to these; no half-pixels, no ad-hoc sizes
`--fs-micro:10` · `--fs-label:11` · `--fs-note:12` · `--fs-meta:13` · `--fs-ui:14` · `--fs-body:15` · `--fs-md:16` · `--fs-card:18` · `--fs-lead:20`. Headings above this use the existing `clamp()` display sizes.

### Spacing scale (`--space-*`) — 8px-based
`1:4 · 2:8 · 3:12 · 4:16 · 5:24 · 6:32 · 7:48 · 8:68`. Section rhythm is `--space-8` (68px). On-scale paddings/gaps reference these; a few deliberately-tuned odd values remain literal by design.

### Radii
`--radius-sm:8px` (controls, chips, inner tiles) · `--radius-card:12px` (cards, panels) · `--radius-pill:100px` (badges, toggles, pill buttons). Nothing else.

### Measure
`--measure-prose:68ch` (reading columns) · `--measure-card:640px` (card content width).

---

## 3 · Layout & container convention

**One convention, everywhere.** The horizontal gutter lives on the **full-width parent** (`.nav`, `.hero`, `.section`, `.section-nav-strip`, `.footer`); the **inner** element is a bare centred box (`max-width:1200px; margin:0 auto`) with **no** padding of its own. This guarantees the nav brand, hero, section content, and footer all share the same left edge at every width.

> Anti-pattern (fixed): putting the gutter *inside* the centred box (`.nav-inner{max-width:1200px;padding:0 1.5rem}`) pushes that content inboard of the body once the viewport exceeds ~1248px. Never reintroduce it.

Reading columns use `--measure-prose`; card grids use `--measure-card` or an explicit grid.

### Breakpoints — canonical, only these three
**`420px`** (narrow phone) · **`600px`** (phone / nav collapse) · **`768px`** (tablet). The gutter steps `1.5rem → 1rem (≤600) → 14px (≤420)` on the full-width parents. Do not add one-off widths.

---

## 4 · Components

### Cards
`.card` — white, `--border`, `--radius-card`. 
- **Navy header bar** (`.card-header`, uppercase `--tracking-label`) is for **reference / structured data only** — info tables, programme schedules. Gateways, teasers, and stat tiles stay **headerless**.
- **Teaser accent:** a `--gold` 3px left-border marks a "look back / featured" teaser.

### Clickable-card hover — one idiom
`.is-clickable` → on hover: `border-color:var(--accent)` + `box-shadow:var(--hover-shadow)`. **No `translateY` lift.** Calm and institutional. Every clickable card (gateways, archive items, Im Fokus tiles, glance link) uses this.

### Buttons vs controls — two distinct families
- **Buttons** = `.btn` base + modifiers: `.btn-primary`, `.btn-outline`, `.btn-sm`, `.btn-pill`, `.btn-ghost`, `.btn-block`. One family, one radius logic.
- **Controls** = tabs, segmented toggles, the DE/EN pill. These are *not* buttons and intentionally have their own styling (e.g. `.tool-tabs`, `.lang-toggle`). Don't force them into `.btn`.

### Badges
Pill (`--radius-pill`), uppercase, `.04em`. Three tones: blue (`accent-pale`/`accent`), green (`green-pale`/`green`), gold (`gold-light`/`gold-ink`).

### Disclosure toggle — one everywhere
28px circle, `--border-light` default → **navy fill + rotate 180°** open. Reused across archive, publications, and members' publications. Keeps a 44px hit area.

### Utilities
- `.eyebrow` — the label/kicker: `--fs-label`, weight 600, `--tracking-label`, uppercase, **colour-agnostic**. Colour comes from the element or `--accent` by default. (Legacy component kickers already match it.)
- `.is-clickable` — see above.

---

## 5 · Chrome (shared JS — `agw_nav.js`)

Rendered into mount points, not hand-written per page.

### Nav — two variants
- **Full nav:** `<div id="nav-mount"></div>` + `AGW.renderNav('home'|'events'|'archive'|'committee'|…)`. Main links, dropdowns, search, VfS button, hamburger + mobile menu. Depends on `agw_app.js` for `openSearch()` / `toggleMobileMenu()`. Used by the main content pages.
- **Utility nav:** `AGW.renderUtilityNav({ back: { href, key } })`. Minimal — brand + a contextual back-link + DE/EN, nothing else. No `agw_app.js` dependency. Used by focused sub-pages (`analytics.html`, `guide.html`). `back.key` is an `AGW.S` key (both languages in JS).

### Footer
`<div id="footer-mount"></div>` + `AGW.renderFooter()`. Column titles use `.eyebrow`.

### Focus & motion (accessibility)
- Global `:focus-visible` = 2px `--accent` ring; **light ring on dark surfaces** (`.nav`, `.footer`, `.hero`, `.mobile-menu`, `.section-nav-strip`).
- `prefers-reduced-motion` halts the hero constellation and card transitions.
- Small toggles engineer a **44px tap target**.

---

## 6 · Internationalisation (`agw_strings.js`)

**Single source of truth** for DE/EN across all pages. Don't build a second mechanism.

- **Registry:** `window.AGW.S[key] = { de, en }` (or `{ en }` for legacy main-site keys whose German lives in the HTML).
- **Apply:** `AGW.applyLang(lang)` walks the DOM and translates three tagged patterns:
  1. `data-str="key"` — both DE + EN from `AGW.S` (preferred for new content).
  2. `data-i18n="key"` — DE is the HTML's own text (cached), EN from `AGW.S[key].en`.
  3. `data-i18n-html="key"` — same, via `innerHTML`.
- **Persist:** `AGW.setLang(lang)` writes `localStorage['agw-lang']` and dispatches `agw-lang-change` (so compiled React viz can react). `AGW.getLang()` reads it. `AGW.t(key, lang)` returns a string.
- **Page toggle pattern:** a page-local `setLang(l)` calls `AGW.setLang(l)`, toggles the `#btn-de`/`#btn-en` active class, then `AGW.applyLang(l)`; it runs once at load. The nav's DE/EN buttons call this global `setLang`.

> Note: `data-i18n-de` is **not** a handled pattern — any such attributes are inert leftover hooks.

---

## 7 · File architecture

| File | Role |
|---|---|
| `agw_styles.css` | **The** stylesheet. Loaded by every page. Tokens + all shared component CSS. |
| `agw_strings.js` | i18n registry + `applyLang`/`setLang`/`getLang`/`t`. |
| `agw_nav.js` | `renderNav`, `renderUtilityNav`, `renderFooter`. |
| `agw_app.js` | Main-site logic: search overlay, countdown, mobile menu, disclosure toggles, glance/next render. |
| `agw_data.js` | Structured content (members, chairs, archive, …). |
| `agw_hero_viz.js` | Hero constellation (school-coded palette; halts under reduced-motion). |
| `agw_highlights.js` | "Im Fokus" band. |
| `agw_member_pubs*.js` | Members' publications page. |
| `styleguide.html` | **Living** style guide — reads tokens at runtime; keep it linked to `agw_styles.css`. |
| `analytics.html`, `guide.html` | Standalone pages. Now consume shared CSS + utility nav + i18n; keep only page-specific CSS inline. |

**Page-specific CSS** (e.g. analytics `.hetl-*`/`.schn-*`/tool-tabs, guide feature cards) stays inline in that page, *after* the `agw_styles.css` link so overrides win. Never copy shared base rules back into a page.

---

## 8 · Ship ritual (no-build, PWA-cached)

1. Edit files.
2. **Bump `const CACHE` in `service-worker.js`** (e.g. `agw-v49`) — this is what forces returning visitors to pull new CSS/JS.
3. Commit + push.
4. Unregister the service worker once (DevTools → Application → Service Workers → Unregister) + hard-reload to confirm.
5. Eyeball the three breakpoints (~400 / 600 / 760px) and the DE/EN toggle.

---

## 9 · Conventions checklist (before you commit)

- [ ] New sizes/spacing/radii come from the `--fs-*` / `--space-*` / `--radius-*` scales.
- [ ] No new colour outside the tokens (or an `oklch` harmonised with them).
- [ ] Small text is `--text-meta`, never `--text-faint`.
- [ ] Clickable cards use `.is-clickable`; labels use `.eyebrow`.
- [ ] New responsive rules use only `420 / 600 / 768`.
- [ ] Container: gutter on the full-width parent, bare centred `1200px` inner.
- [ ] Nav/footer come from `agw_nav.js`; no hand-written chrome.
- [ ] New copy is real translatable DOM (`data-str` preferred) — nothing baked into images.
- [ ] Bumped the SW cache version.
