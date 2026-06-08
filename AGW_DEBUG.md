---
name: agw-debug
description: Disciplined debugging protocol for the AGW website, especially runtime and load-time failures — blank tabs, "module won't load", analytics tabs rendering empty, console SyntaxErrors, "it used to work", or a deployed fix that didn't take effect. Use this BEFORE proposing any fix to a load/runtime failure, whenever David reports something broken on the live site, or whenever a fix "should have worked" but didn't. Invoke it even when the bug looks obvious — the day-long Rezeptionsatlas impasse looked obvious every single round, and the obviousness was the trap.
---

# AGW Debug Skill

A protocol for diagnosing runtime and load-time failures on the AGW site without burning hours in blind trial-and-error.

## Why this exists

The Rezeptionsatlas analytics bug cost ~a full day across several chats and was ultimately fixed by a browser-capable agent, not in-session. The bug itself was a one-line fix. The time was lost to *how* it was debugged: reasoning from a blank-render symptom instead of runtime evidence, iterating on fixes that were never actually deployed, and drifting toward a heavy rebuild when a minimal config change was the answer. This skill encodes the discipline that would have collapsed that day into minutes. See `AGW_DECISIONS.md` → ADR-020 for the decision record.

## When to invoke

Any one of:
- David reports something broken, blank, or not rendering on the live site
- A module/bundle "won't load", or the console shows a `SyntaxError` / `TypeError` at load time
- An analytics tab renders empty while others work
- A fix was deployed but "didn't work" or "looks the same"
- David says "it used to work" — that phrase is itself a trigger
- You are about to propose a fix for a load-time or runtime failure of any kind

This skill is for *runtime/load* failures. A pure logic bug in code you can read (wrong number, off-by-one, bad sort) does not need this ceremony — go fix it.

## The protocol — run in order, do not skip ahead

### 0. State the two invariants out loud

Before any hypothesis, write down:
- **It used to work.**
- **The other tabs/pages still work.**

Any hypothesis that cannot explain *both* facts is discarded on the spot — do not pursue it, do not "just check" it. This single rule kills most of the tempting-but-wrong theories (a fundamental React/esm.sh incompatibility, for instance, fails invariant 2 — the other React tabs render fine).

### 1. Get runtime evidence BEFORE forming a hypothesis

The rendered symptom (a blank tab) is almost never the diagnosis. The diagnosis is in:
- **The Console** — the verbatim error text and the file/line it points at.
- **The Network tab** — which requests *failed*, and critically the **response content-type and body** of the failed ones. A module that 404s and returns an HTML error page, then gets parsed as JS, produces a `SyntaxError` that points at the wrong place entirely. You only see this in the Network tab.

For load failures, the Network tab IS the diagnosis. Get it before theorizing.

How to get it:
- **Preferred:** drive Claude in Chrome to the live page, open DevTools, read Console + Network directly.
- **Otherwise:** ask David for the verbatim console error AND a Network-tab screenshot filtered to failures (red). Explicitly *not* a screenshot of the blank render — that carries no diagnostic signal.

Do not propose a fix until this evidence is in hand. "Let me try X and see" without runtime evidence is how the day was lost.

### 2. Classify the failure, then route

- **Logic/data bug** (code you can read produces wrong output): read the source, fix it. This skill is done.
- **Load/resolution failure** (a module, import, importmap entry, or CDN resource fails to load or resolve): the culprit is almost always a *resolution* problem — a bare specifier resolving to the wrong origin, a CDN sub-resource 404ing, an importmap entry pointing somewhere stale. Inspect the importmap in the relevant HTML and the actual resolved URLs in the Network tab.
- **Environment/runtime-specific failure** (works locally, fails on GitHub Pages; or vice versa): this is the seam where a browser-capable agent beats inference. Route to one early (see step 5).

### 3. Verify the experiment actually ran before interpreting the result

This is the step that was missing most often. A "fix" that wasn't deployed is not a failed fix — it's a test that never ran, and updating beliefs on it sends you backwards.

- Fingerprint the **live, deployed** artifact against what was built. For analytics: `curl -s https://raw.githubusercontent.com/david-bieri/agw-vfs/main/dist/<bundle>.js | sha256sum` (raw.githubusercontent is reachable from the container; the `*.github.io` Pages origin is not) and compare to the built file's hash.
- If they don't match, STOP. The deploy was incomplete. Re-deploy correctly, then re-test. Do not form new hypotheses on a void result.
- Any deploy that changes analytics behavior MUST include all three bundles: `dist/agw_gaze_map.js`, `dist/agw_analysis.js`, `dist/agw_pmi.js`. Shipping only HTML/CSS/SW silently no-ops the actual code change.
- Remember the service worker: a precached-asset change requires a cache-version bump and a one-time SW unregister, or clients serve stale files. A "fix that didn't take effect" is frequently just a stale SW cache, not a wrong fix.

### 4. Prefer the smallest change that severs the broken dependency

Rank candidate fixes by blast radius, smallest first:
- Repoint one importmap entry → vendor a single shim file locally → patch one source line → rebuild one bundle → rebuild all bundles / re-architecture.

The Rezeptionsatlas fix was the *first* item on that list (`"react/jsx-runtime": "./vendor/react-jsx-runtime.mjs"`). The in-session plan was near the *last* (rebuild all three bundles, delete `vendor/`). Cleanliness is a separate task from killing the bug; do it after, not instead.

### 5. Route to a browser-capable agent early for environment-specific bugs

When the failure is clearly about the runtime environment rather than the code's logic, an agent that can load the live page and read DevTools will out-diagnose pure reasoning every time. That capability difference is exactly what resolved this bug. Treat "hand it to a browser agent" as a deliberate routing decision made early, not an admission of defeat made late. Division of labor: reasoning and code edits here; live runtime forensics in the browser.

### 6. Keep one debug log so compaction can't erase the ruled-out space

Maintain a single running list in the session: each hypothesis, and the *specific evidence* that confirmed or killed it. This survives compaction and prevents the next session (or the next segment of this one) from re-litigating theories already eliminated. Promote the eventual root cause to `AGW_SESSION_NOTES.md` § "Latent issues" or a new ADR.

## Worked example — the Rezeptionsatlas / jsx-runtime bug

- **Symptom:** Rezeptionsatlas tab blank; other analytics tabs fine; site previously worked.
- **Invariants (step 0):** "used to work" + "other React tabs work" → discard any theory of a blanket React/esm.sh incompatibility.
- **Evidence (step 1):** Console shows a `SyntaxError`. Network tab shows `react/jsx-runtime` fetched from esm.sh returning a 404 whose body is HTML — that HTML is what the SyntaxError is choking on. *This is invisible from the blank render; only the Network tab shows it.*
- **Classify (step 2):** load/resolution failure — esm.sh's `jsx-runtime` has root-relative internal imports resolving against the GitHub Pages origin, not esm.sh.
- **Minimal fix (step 4):** repoint one importmap entry to a local shim: `"react/jsx-runtime": "./vendor/react-jsx-runtime.mjs"`. No rebuild. `vendor/` is load-bearing — keep it.
- **What went wrong originally:** evidence step skipped (worked from screenshots of the blank tab); several fixes shipped without the `dist/` bundles so results were void (step 3 violated); and the fix drifted to a full rebuild + deleting `vendor/` (step 4 inverted).

## Anti-patterns

- Proposing a fix before seeing the Console + Network tab.
- Interpreting a failed deploy as a failed hypothesis without checking the artifact hash.
- Treating a blank-render screenshot as diagnostic evidence.
- Reaching for a rebuild/re-architecture when a config repoint would do.
- Re-deriving the ruled-out hypothesis space from scratch after compaction instead of keeping a debug log.
- Grinding on inference for an environment-specific bug instead of routing to a browser agent.

## Adapting to other projects

The same protocol transfers to Jane and SPIA — only the deploy-verification specifics change (the raw-host URL, which artifacts are authoritative, the SW/cache ritual). Mirror as `JANE_DEBUG.md` / `SPIA_DEBUG.md`, keeping steps 0–6 intact and swapping the project-specific artifact and deploy details.
