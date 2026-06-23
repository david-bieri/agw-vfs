# AGW Website — Live Alerts & Program-Change Ticker

**Proposal — ideas, placement options, badge system, and implementation sketch**
Prepared for the *Aktuelles* section (below the countdown clock and the new conference-news thread)

---

## 1. The goal in one sentence

During the **week of the conference** (and especially the day-of), give the chair a fast, low-friction way to broadcast **last-minute program changes** — *"New time / Neue Uhrzeit"*, *"Changed / Änderung"*, *"Cancelled / Entfällt"*, *"Room change / Raumwechsel"* — plus **general important notices** (weather, transport, dinner logistics), each carrying a small colored **badge** tied to a specific event, all bilingual (DE/EN) and editable from a single data array, exactly like `ANNOUNCEMENTS`.

The site is a static HTML/JS site auto-deploying from `david-bieri/agw-vfs`, so every option below is **client-side only** — no backend, no build step — and reuses the existing design tokens (`--accent`, `--gold`, `--green`, the `.badge` family) and the `lang`-based bilingual pattern already used everywhere in `agw_app.js`.

---

## 2. Five placement patterns (with trade-offs)

There are five natural "slots" for this on the page. They are not mutually exclusive — the most robust setup combines **one always-visible bar** (A or B) with **inline badges on the actual program timeline** (E).

| # | Pattern | Where it lives | Visibility | Best for | Risk |
|---|---|---|---|---|---|
| **A** | **Sticky alert bar** | Pinned below the nav, full width | Highest — follows the user on every scroll | Truly urgent, "read this now" alerts | Can feel intrusive if overused; eats vertical space |
| **B** | **Scrolling marquee ticker** | A thin strip directly **below the countdown card** in `#aktuelles` | High when in view | Several rolling notices ("ticker-tape" feel) | Motion can hurt readability / accessibility if not done carefully |
| **C** | **Live alerts list** | A distinct block **above** the existing `#news-list` thread | Medium | Dated, persistent change-log of the day | Looks like more news; less "urgent" |
| **D** | **Floating toast / snackbar** | Bottom-corner popup, auto-dismiss | High, momentary | A single new change pushed once | Disappears; not a record |
| **E** | **Inline event badges** | On each `.tl-item` in the Friday/Saturday **program timeline** | Contextual — right where the event is | Pinpointing *which* talk moved | Only seen if user scrolls to the program |

### Recommended combination

1. **Pattern B (marquee ticker) in the `#aktuelles` section** as the "ticker-tape" the user explicitly asked for — it sits naturally between the countdown card and the conference-news thread, and only appears when there is at least one *active* alert.
2. **Pattern E (inline badges)** on the program timeline so a moved talk is flagged *exactly where people look it up*.
3. Optionally **Pattern A (sticky bar)** reserved for one truly critical, conference-wide message (e.g., *"Friday sessions start 30 min later — Neue Uhrzeit 09:30"*).

All three can be driven by **the same data array**, so the chair edits one place and the message appears in every enabled slot.

---

## 3. A single source of truth: the `ALERTS` array

Add a new array to `agw_data.js` modeled on `ANNOUNCEMENTS`, but with extra fields for **badge type**, **target event**, **severity**, and an **active window** so stale alerts auto-hide.

```js
// agw_data.js  — new, sits next to ANNOUNCEMENTS
const ALERTS = [
  {
    id: 'fri-keynote-time',
    badge: 'time',                 // -> "Neue Uhrzeit / New time"
    severity: 'change',            // controls colour: change | urgent | info | cancel
    event_de: 'Keynote Prof. Schefold',
    event_en: 'Keynote Prof. Schefold',
    text_de: 'beginnt neu um 09:30 statt 09:00 (Raum A).',
    text_en: 'now starts at 09:30 instead of 09:00 (Room A).',
    target: 'fri-0900',            // optional: id of the matching .tl-item (Pattern E)
    from: '2026-06-25T06:00:00+02:00', // show from
    until:'2026-06-26T12:00:00+02:00', // auto-hide after
    pin: true                      // true => also show in sticky bar (Pattern A)
  },
  {
    id: 'sat-room-change',
    badge: 'room', severity: 'change',
    event_de: 'Nachmittagssession', event_en: 'Afternoon session',
    text_de: 'verlegt in den Seminarraum Villa Maderni (EG).',
    text_en: 'moved to Seminar Room, Villa Maderni (ground floor).',
    target: 'sat-1400',
    from: '2026-06-27T06:00:00+02:00', until:'2026-06-27T18:00:00+02:00'
  },
  {
    id: 'weather-monte-generoso',
    badge: 'info', severity: 'info',
    event_de: 'Ausflug Monte Generoso', event_en: 'Monte Generoso excursion',
    text_de: 'findet bei jedem Wetter statt — bitte feste Schuhe.',
    text_en: 'goes ahead in any weather — please wear sturdy shoes.',
    from: '2026-06-26T00:00:00+02:00', until:'2026-06-27T13:00:00+02:00'
  }
];
window.AGW_DATA.ALERTS = ALERTS; // expose like the others
```

**Why these fields**

- **`badge`** — picks the label *and* its colour from a small lookup table (next section). This is the *"New time" / "Neue Uhrzeit"* / *"Änderung"* mechanism the user asked for.
- **`event_de/en`** — the **bold subject** ("which talk?"); badge attaches to it.
- **`from` / `until`** — the **active window**. The renderer hides anything outside it, so the chair can pre-load all known changes the night before and they appear/disappear automatically. This is what makes it safe to leave the array populated.
- **`target`** — optional `id` of the corresponding `.tl-item` so the *same* alert can also stamp an inline badge on the program (Pattern E).
- **`pin`** — opt-in flag to also surface the alert in the high-visibility sticky bar (Pattern A).

---

## 4. The badge taxonomy (bilingual, reusing existing tokens)

A single lookup maps `badge` → label (DE/EN) → CSS class. All colours already exist in `agw_styles.css`, so nothing new needs designing.

```js
const ALERT_BADGES = {
  time:   { de:'Neue Uhrzeit', en:'New time',     cls:'badge-blue'  },
  change: { de:'Änderung',     en:'Changed',      cls:'badge-gold'  },
  room:   { de:'Raumwechsel',  en:'Room change',  cls:'badge-blue'  },
  cancel: { de:'Entfällt',     en:'Cancelled',    cls:'badge-cancel'},
  new:    { de:'Neu',          en:'New',          cls:'badge-green' },
  info:   { de:'Hinweis',      en:'Notice',       cls:'badge-gold'  },
  speaker:{ de:'Neuer Vortragender', en:'New speaker', cls:'badge-blue' }
};
```

| Badge key | DE | EN | Colour | Existing class |
|---|---|---|---|---|
| `time` | Neue Uhrzeit | New time | blue | `.badge-blue` ✓ |
| `change` | Änderung | Changed | gold | `.badge-gold` ✓ |
| `room` | Raumwechsel | Room change | blue | `.badge-blue` ✓ |
| `cancel` | Entfällt | Cancelled | red | **add `.badge-cancel`** |
| `new` | Neu | New | green | `.badge-green` ✓ |
| `info` | Hinweis | Notice | gold | `.badge-gold` ✓ |
| `speaker` | Neuer Vortragender | New speaker | blue | `.badge-blue` ✓ |

The only new style needed is a red "cancelled" badge, consistent with the red dot (`#C0392B`) already used on the logistics map:

```css
/* agw_styles.css — one new badge variant */
.badge-cancel{ background:#FBEAE8; color:#C0392B; }
```

---

## 5. Pattern B — the ticker-tape marquee (the headline request)

A thin strip slotted between `#countdown-card` and `#news-list`. It only renders if there are active alerts; otherwise it stays `display:none`, exactly like the countdown card's `:empty` rule.

**HTML (one line in `index.html`, inside `#aktuelles`):**

```html
<div id="countdown-card"></div>
<div id="alert-ticker"></div>      <!-- NEW -->
<div id="news-list"></div>
```

**CSS:**

```css
#alert-ticker{ display:none; overflow:hidden; white-space:nowrap;
  background:var(--navy-dark); border-radius:8px; margin:18px 0 6px;
  padding:9px 0; position:relative; }
#alert-ticker.has-alerts{ display:block; }
#alert-ticker .ticker-track{ display:inline-block; padding-left:100%;
  animation:ticker-scroll 28s linear infinite; }
#alert-ticker:hover .ticker-track{ animation-play-state:paused; }  /* hover to read */
.ticker-item{ display:inline-flex; align-items:center; gap:8px;
  margin:0 28px; font-size:13px; color:#fff; }
.ticker-item .badge{ vertical-align:middle; }
@keyframes ticker-scroll{ from{transform:translateX(0)} to{transform:translateX(-100%)} }
/* Accessibility: respect reduced-motion — fall back to a static, wrapping list */
@media (prefers-reduced-motion:reduce){
  #alert-ticker .ticker-track{ animation:none; padding-left:0; white-space:normal; }
  .ticker-item{ display:flex; margin:4px 12px; }
}
```

**JS (drop into `agw_app.js`, called from the same place as `renderAnnouncements()`):**

```js
function activeAlerts(){
  var now = new Date();
  return (window.AGW_DATA.ALERTS||[]).filter(function(a){
    return (!a.from  || now >= new Date(a.from)) &&
           (!a.until || now <  new Date(a.until));
  });
}

function renderAlertTicker(){
  var el = document.getElementById('alert-ticker'); if(!el) return;
  var items = activeAlerts();
  if(!items.length){ el.className=''; el.innerHTML=''; return; }
  var isDE = lang==='de';
  var html = items.map(function(a){
    var b = ALERT_BADGES[a.badge] || ALERT_BADGES.info;
    return '<span class="ticker-item">'
      + '<span class="badge '+b.cls+'">'+(isDE?b.de:b.en)+'</span>'
      + '<strong>'+(isDE?a.event_de:a.event_en)+'</strong> '
      + (isDE?a.text_de:a.text_en) + '</span>';
  }).join('');
  // duplicate the track so the loop is seamless
  el.innerHTML = '<div class="ticker-track">'+html+html+'</div>';
  el.className = 'has-alerts';
}
```

Because `renderAlertTicker()` reads `lang`, it just needs to be re-invoked by the existing language-toggle handler (same place that re-runs `renderAnnouncements()`), and refreshed on the same `setInterval` cadence as the countdown so the active window stays current.

---

## 6. Pattern A — sticky urgent bar (for `pin:true` alerts)

For the rare conference-wide "must read", render the highest-severity pinned alert as a slim bar under the nav:

```html
<div id="alert-bar"></div>   <!-- right after the closing </nav> -->
```

```css
#alert-bar{ display:none; position:sticky; top:56px; z-index:150;
  background:#FBEAE8; border-bottom:1px solid #E3B7B1; color:#7A1F16;
  font-size:13.5px; text-align:center; padding:8px 16px; }
#alert-bar.urgent{ display:block; }
#alert-bar .badge{ margin-right:8px; }
#alert-bar .alert-close{ position:absolute; right:12px; top:6px; cursor:pointer;
  background:none; border:none; font-size:16px; color:inherit; }
```

The renderer picks `activeAlerts().filter(a => a.pin)`, shows the first, and a close button can set a `sessionStorage` flag so it does not reappear after the user dismisses it that session.

---

## 7. Pattern E — inline badges on the program timeline

The program timeline already renders `.tl-item` rows (Friday `#day-fr`, Saturday `#day-sa`), and `addSessionIcalBtns()` already walks them. The same hook can stamp a badge whenever an alert's `target` matches a row id:

```js
function applyTimelineAlerts(){
  var isDE = lang==='de';
  activeAlerts().forEach(function(a){
    if(!a.target) return;
    var row = document.getElementById(a.target); if(!row) return;
    var b = ALERT_BADGES[a.badge] || ALERT_BADGES.info;
    var t = row.querySelector('.tl-title'); if(!t || t.querySelector('.alert-badge')) return;
    var span = document.createElement('span');
    span.className = 'badge '+b.cls+' alert-badge';
    span.style.cssText = 'margin-left:8px;font-size:10px;vertical-align:middle;';
    span.textContent = isDE ? b.de : b.en;
    t.appendChild(span);
    row.classList.add('tl-item','memorial'); // reuse the gold "highlight" treatment
  });
}
```

This requires giving the relevant timeline rows stable `id`s (e.g. `id="fri-0900"`) — a small one-time edit to `index.html`. The payoff: a moved talk is flagged **exactly where attendees look up the schedule**, not just in the news area.

---

## 8. Day-of workflow for the chair

The whole point is that updates take **seconds** during the conference week:

1. Open `agw_data.js`, add or edit one object in `ALERTS` (copy a template, change `badge`, `event_*`, `text_*`, and the `until` time).
2. `git commit && git push` → GitHub Pages redeploys in ~1 minute.
3. The ticker appears automatically; it **vanishes on its own** once `until` passes — no need to remember to delete it.

For a true *"post from your phone"* experience without editing JS, two no-backend upgrades are possible later:
- **Pinned-text source:** host a tiny `alerts.json` in the repo and `fetch()` it (still editable from the GitHub mobile app, separates content from code).
- **Issue-driven:** a GitHub Action that turns a labelled Issue into `alerts.json`. Heavier; only worth it if multiple organizers post.

---

## 9. Accessibility & polish checklist

- **`prefers-reduced-motion`** — ticker falls back to a static, wrapping list (handled in the CSS above). Marquees that ignore this are an accessibility failure.
- **Hover/focus to pause** so people can actually read scrolling text.
- **`role="status"` / `aria-live="polite"`** on `#alert-ticker` and `#alert-bar` so screen readers announce new alerts.
- **Contrast** — the red `.badge-cancel` and the navy ticker background both meet WCAG AA with the chosen text colours.
- **Empty state** — every renderer hides its container when there are no active alerts, so the page is unchanged outside the conference window.
- **Bilingual parity** — every alert must have both `_de` and `_en`; the badge labels are centralized so a typo is fixed once.

---

## 10. Suggested rollout (smallest viable first)

| Step | Effort | Deliverable |
|---|---|---|
| 1 | ~1 hr | `ALERTS` + `ALERT_BADGES` in `agw_data.js`; `.badge-cancel` in CSS; **Pattern B ticker** wired into `#aktuelles` |
| 2 | ~30 min | Re-run `renderAlertTicker()` on language toggle + the 30 s countdown interval; add `aria-live` |
| 3 | ~1 hr | **Pattern E** inline badges (add stable `id`s to timeline rows) |
| 4 | optional | **Pattern A** sticky pinned bar with dismiss |
| 5 | optional | Move alerts to `alerts.json` for phone-only editing |

Starting with **Step 1–2** delivers exactly the requested ticker-tape with *"Neue Uhrzeit / New time"*-style badges, fully bilingual, auto-expiring, and consistent with the site's existing look — and it can be extended toward the program timeline and a sticky bar without rework.

I would recommend documenting the final mechanism with a short "How to post a live alert" section in `AGW_MAINTENANCE.md`, mirroring the existing "How to Update News / Announcements" entry.
