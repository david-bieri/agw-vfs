# AGW Session Notes

**Last session:** 2026-06-05 (long multi-phase session with compaction mid-flight)
**Topic:** Multi-project handover-protocol installation (AGW + Jane + SPIA) → UI/UX batch deploy prep & execution → diagnosed and fixed Analysen-tab "two-React-instances" bug → analytics feature backlog queued for Phase 2
**Working version at session end:** v8 (architecture unchanged) · SW cache **v4-analytics-fix pending** (v3-ui-batch partially shipped earlier in session)
**Conference T-minus:** 20 days

---

## 1. Just deployed this session

Confirmed by David during the session:

- *(UI/UX batch — v5 btn-de/btn-en null-guard restore)* ✓ — "Ok this worked" referring to the Logistik map rendering in EN mode after the prior regression. This was bundled inside the larger UI/UX deploy command.

Bundled in the same v3-ui-batch deploy command but **push completeness uncertain**:
- SVG icon system (14 `.ico-*` mask utilities, replacing emoji)
- A11y batch (`:focus-visible`, `prefers-reduced-motion`, 44px touch targets, `.tl-time` contrast)
- Orphan-brace fix (hamburger leaking + VfS subtitle hidden on desktop)
- `data-i18n`-destroys-map-links fix (4 programme entries + Welcome dinner card)
- Invalid `\U0001F4C5` JS escape replaced with SVG icons
- Copyright update: analytics.html + guide.html `© 2025 · bieri@vt.edu` → `© 2026 · David Bieri`

The reason for "uncertain": David's screenshot after the deploy showed the empty Analysen tab AND the old `© 2025 · bieri@vt.edu` footer — meaning either the analytics.html change wasn't in that push, or the SW didn't update. The 2026 copyright fix is re-applied in the v4 bundle, so it'll land cleanly with the v4 push.

Cross-project handover-protocol scaffolding (pre-compaction phase of session) — produced and deployed to project knowledge / instruction fields, not all to git yet:
- **AGW**: `AGW_HANDOVER.md` (this protocol), original `AGW_SESSION_NOTES.md`
- **Jane**: `JANE_PROJECT_INSTRUCTION.txt`, `HANDOVER.md`, `SESSION_NOTES.md`, patched `CLAUDE.md`
- **SPIA**: `SPIA_PROJECT_INSTRUCTION.txt`, `SPIA_CLAUDE.md`, `SPIA_HANDOVER.md`, `SPIA_SESSION_NOTES.md`, patched `SPIA_Project_Memory.md`
- **Cross-cutting**: `MEMORY_PROTOCOL.md` (generalizable meta-document)

## 2. Pending deploy

**v4-analytics-fix — produced this session, NOT yet confirmed pushed.** This is the critical Analysen-tab fix; without it the middle analytics tab stays blank.

```powershell
cd C:\Users\bieri\Documents\GitHub\agw-vfs
git checkout main

Remove-Item cli.txt, first.txt, ui-ux.txt -ErrorAction SilentlyContinue
Add-Content .gitignore "`n# Claude Code local tooling`n.claude/"

git add `
  service-worker.js `
  agw_styles.css `
  index.html analytics.html archive.html committee.html guide.html `
  agw_strings.js agw_app.js agw_nav.js `
  dist/agw_analysis.js dist/agw_gaze_map.js dist/agw_pmi.js `
  .gitignore

git status
git commit -m "feat(ui): SVG icons + a11y batch + analytics React fix + 5 bug fixes
[full message body in chat history]"
git push
```

Rationale: the importmap fix in `analytics.html` (recharts must externalize react,react-dom) resolves the `TypeError: Cannot read properties of null (reading 'useRef')` in `ResponsiveContainer.js:45:22`. SW cache `v3-ui-batch` → `v4-analytics-fix` forces clients past the cached old `analytics.html`. All other files in the deploy set are either the same as v3-ui-batch (re-shipping in case earlier push was incomplete) or unchanged.

13 files in `/mnt/user-data/outputs/` ready to push. SHAs in chat history for verification.

## 3. Decisions made this session

To be promoted to ADRs in `AGW_DECISIONS.md`:

- **ADR-016 (carry-over, still informal):** Render-function guard pattern — every `render*()`/`init*()` and EVERY DOM access in shared init paths must early-return if its target is missing. From the v5 regression that broke Logistik-map in EN mode.
- **ADR-017 (carry-over, still informal):** Data files must be self-contained — top-level references to constants declared in later-loaded files abort the data file silently under script load order.
- **ADR-018 (new, this session):** *esm.sh CDN modules that depend on React MUST be loaded with `?external=react,react-dom` when the page provides its own React via importmap.* Otherwise the module bundles its own React, creating two instances with separate hook dispatchers; the second instance has `currentDispatcher === null` because no React tree is rendering on it, causing `useRef`/etc. to throw. The recharts case in `analytics.html` was the manifestation. Pattern applies to any future React-based analytics bundle.

Operational decision (not ADR-worthy):

- **Phase split for analytics feature requests.** Bug fix (importmap) shipped alone first; the 4 categories of feature improvements (mouseover content, centering, font/zoom, legibility) deferred to a focused Phase 2 turn. Rationale: 3 large JSX files (87 + 92 + 268 KB), feature changes risk regressing Reception Atlas (currently the only working analytics tab); verification cadence cleaner with one-thing-at-a-time deploys; Phase 2 requires WSL rebuild loop that's heavier than HTML-only changes.

## 4. Latent issues surfaced

**Phase 2 analytics feature backlog** (waiting on Phase 1 deploy confirmation + answers to 2 design questions):

| # | Where | What |
|---|---|---|
| 1a | Reception Atlas, all 3 tabs | Mouseover includes birth–death years (data has `b`/`d` fields ready) |
| 1b | Reception Atlas → "Nach Episode" | Mouseover lists actual figures instead of stating count |
| 1c | Reception Atlas → "Karte" | Center artifact (currently bunched left) |
| 2a | Themenanalyse, all 6 tabs | Center artifacts |
| 2b | Themenanalyse → "F" tab | **Renders incorrectly — investigate first** |
| 3 | All 3 bundles | Font-size / zoom capability |
| 4 | All 3 bundles | Legibility — lighten gray (`#6a7090` → ~`#9aa0c0`), bump base font 11–12px → 13–14px |

**Tooling latent:**
- **JSX sources are ephemeral in Claude environment.** They exist only at `/tmp/agw-tweak-tree/src-jsx/` from the worktree zip David uploaded earlier this session. Gitignored at David's end. **Phase 2 cannot start until David re-uploads the worktree zip** (or commits `src-jsx/` to a side branch, which would be cleaner long-term).
- **`AGW_CLAUDE.md` PWA cache reference will drift again.** At start of this session it said `agw-2026-v2-multipage`; reality is now v4-analytics-fix. Worth a check at next session start.

**Prior-session carry-over still unresolved:**
- Cross-page Ctrl+K search still per-page only
- Per-page SW offline fallback returns `index.html` unconditionally
- PWA on mobile untested

## 5. Open questions for David

### 🔴 Persistent (carry forward across sessions until resolved)

- **v3-ui-batch deploy completeness** — was the entire UI/UX deploy command actually run, or only the file(s) touching the map fix? Copyright 2026 may not have landed on the live site. Smoke-test by inspecting `https://david-bieri.github.io/agw-vfs/analytics.html` footer.
- **v4-analytics-fix deploy status** — has the push been run since the response with the deploy command?
- **AGW_en.json → Rainer Klump** for EN editorial review. Still the blocker for EN going live publicly. Carried since prior session.
- **Mobile menu deploy status** — verified working at any point this week?

### Session-specific (Phase 2 prerequisites)

1. **Font-zoom UX choice:** simple S/M/L 3-step toggle (~30 lines per bundle) vs continuous zoom (real feature, more code)?
2. **Tab F debugging:** screenshot of what "F" currently renders (or doesn't) in BOTH DE and EN, to scope the failure mode before I edit the 268 KB `agw_pmi_viz.jsx`.
3. **Worktree re-upload:** at the start of the next session, re-upload `agw-vfs-worktree.zip` (or whatever contains `src-jsx/`) so Phase 2 can start.

## 6. Suggested next session

In order of priority:

1. **Smoke-test the v4 deploy first.** Hard-reload (Ctrl+Shift+R) on `/analytics.html` and confirm: (a) all 3 tabs render content, (b) console clean of `useRef` errors, (c) footer shows "© 2026 · David Bieri". If any of these is wrong, fix before doing anything else.
2. **Confirm the prior batch items** — copyright 2026 visible on guide.html, SVG icons rendering, hamburger menu working, Logistik map intact in EN mode. If anything missing, the v3-ui-batch push was incomplete and needs a re-push.
3. **Phase 2 (analytics features)** — only if (1) and (2) clean. Sequence:
   - David answers the 2 design questions (zoom UX + Tab F screenshot)
   - David re-uploads the `src-jsx/` worktree
   - I edit the 3 JSX files in one focused turn
   - David rebuilds via `wsl bash -c "cd /mnt/c/Users/bieri/Documents/GitHub/agw-vfs && bash build_analytics.sh"`
   - Deploy new `dist/*.js` files
4. **Promote candidate ADRs** — ADR-016, ADR-017, ADR-018 (all listed in §3) into `AGW_DECISIONS.md`.
5. **Bump `AGW_PROGRESS.md` → v9** once v3-ui-batch + v4-analytics-fix are confirmed live. Also refresh `AGW_CLAUDE.md` "Current Version" line + cache version reference.
6. **Klump / `AGW_en.json`** — still the EN-toggle public-launch blocker.

If smoke-test reveals issues, the most likely culprits are: (a) cached old assets despite SW bump — unregister SW + hard-reload, (b) recharts still loading wrong react variant — Network tab should show `recharts@2?external=react,react-dom` returning 200, (c) prior batch never fully pushed — `git ls-tree HEAD -- analytics.html guide.html` against the SHAs from chat to verify.

---

## Side-channel: cross-project work in this session

Produced as part of the same session, deployed to respective project knowledge stores but not all to git:

- **Jane** (separate Claude.ai project, unprefixed): `JANE_PROJECT_INSTRUCTION.txt`, `HANDOVER.md` (branch-aware 7-section), `SESSION_NOTES.md` (bootstrap from PROGRESS state), patched `CLAUDE.md` (ADR count 24→26, Sprint 2b added, cross-cutting protocols section). Repo: spia-murp-advisor, live at spia-murp-advisor.vercel.app. **Persistent items carried**: GEOG 5314 duplicate, NR 5884 duplicate, Kelly Crist cert split — all department-email pending.

- **SPIA** (separate Claude.ai project, SPIA_ prefix): `SPIA_PROJECT_INSTRUCTION.txt`, `SPIA_CLAUDE.md` (115-line entry-point), `SPIA_HANDOVER.md` (workflow-aware 7-section), `SPIA_SESSION_NOTES.md` (v5/v7 reconciliation handover — v7 is canonical, 4912 lines, 21 figures, TfH fully integrated), patched `SPIA_Project_Memory.md` (CHANGELOG backfilled with v7 entry, CURRENT STATE → v7, TfH items closed). **Blocker for next SPIA session**: `spia_refs.bib` missing from project knowledge — must upload at session start.

- **MEMORY_PROTOCOL.md** — 378-line generalizable meta-document for the file family pattern.

All these files are in `/mnt/user-data/outputs/` from earlier in the session. Jane and SPIA SESSION_NOTES.md files are valid as-is for the next time David switches to those projects.

---

*Generated via the AGW_HANDOVER.md protocol at the end of the 2026-06-05 session.*
