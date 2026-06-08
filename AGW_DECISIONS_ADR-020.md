<!-- Append this block to AGW_DECISIONS.md, after ADR-019. -->

## ADR-020 — Runtime/load-failure debugging discipline: evidence-first, verify-the-deploy, minimal-fix-first

**Status:** Accepted (2026-06-08)
**Related:** Amends the recorded "definitive fix" in ADR-018 (see Consequences); reinforces ADR-016 (render guards).

### Context

The Rezeptionsatlas / analytics React-loading bug consumed roughly a full day across several chats (with compaction mid-flight) and was ultimately resolved not in-session but by handing the page to a browser-capable agent (Manus AI). The post-mortem identified that the time sunk was not caused by the bug's difficulty — the fix is a single importmap line — but by *how it was debugged*:

1. **Blind diagnosis.** The failure was a 404 on a transitively-imported CDN module (`react/jsx-runtime` from esm.sh, whose root-relative internal imports resolved against the GitHub Pages origin), whose HTML error body was then parsed as JS → `SyntaxError`. That failure mode is trivially visible in a browser Network + Console tab and nearly impossible to pin down by reasoning from screenshots of a blank render. Debugging proceeded from the rendered symptom, not the runtime evidence.
2. **Corrupted feedback loop.** Several "fixes" shipped HTML/CSS/SW but not the compiled `dist/*.js` bundles. Failed verifications were therefore misattributed to "wrong hypothesis" when the true cause was "the experiment never ran." Belief updates went the wrong direction.
3. **Wrong-shape fix.** The working solution was to vendor the `jsx-runtime` shim locally (`"react/jsx-runtime": "./vendor/react-jsx-runtime.mjs"`). The in-session plan instead drifted toward rebuilding all three bundles with React inlined and *deleting* `vendor/` — heavier, slower, and discarding the artifact that turned out to be the fix.
4. **Hypothesis discipline lapsed under fragmentation.** The standing rule (discard any hypothesis that cannot explain BOTH "the site used to work" AND "the other tabs still work") was not applied ruthlessly, partly because the ruled-out space was reconstructed from notes each session rather than held in one context.

### Decision

For any runtime or load-time failure (blank render, module won't load, console error, "it used to work," a fix that didn't take effect), the following sequence is mandatory **before proposing a fix**:

1. **State the two invariants in writing.** "It used to work" + "the other tabs/pages still work." Any hypothesis that cannot explain both is discarded immediately.
2. **Get runtime evidence first.** The actual Console error and the Network tab (failing requests + their response content-type/body) must be in hand before any hypothesis is formed. For load failures, the Network tab is the entire diagnosis. Drive Claude in Chrome against the live page, or have David paste the verbatim console error + a Network-tab screenshot filtered to failures — never a screenshot of the rendered (blank) result alone.
3. **Verify the experiment ran before interpreting it.** Fingerprint the live deployed artifact (e.g. SHA of the on-server `dist/*.js`) against what was built. If they don't match, the deploy was incomplete and the result is void — do not update beliefs on it. Any deploy touching analytics behavior MUST include `dist/agw_gaze_map.js`, `dist/agw_analysis.js`, `dist/agw_pmi.js` (per the 2026-06-05 deploy-artifact lesson).
4. **Prefer the minimal dependency-severing fix.** A one-line importmap repoint beats a three-bundle WSL rebuild. Reach for architectural cleanliness only after the bug is dead.
5. **Reach for a browser-capable agent early** when the bug is environment/runtime-specific rather than logic-specific. That capability gap is precisely what resolved this bug; treat it as a routing decision, not a last resort.

The operational protocol lives in `AGW_DEBUG.md` (skill).

### Consequences

- **ADR-018 correction.** The actual production fix is local vendoring of `react/jsx-runtime` (`./vendor/react-jsx-runtime.mjs`), with `react`/`react-dom` still external via esm.sh and recharts still `?external=react,react-dom`. The previously recorded "definitive fix = rebuild with React bundled in, remove `vendor/`" is **wrong** and superseded: `vendor/` is load-bearing and must be kept. ADR-018's externalization principle stands; only the jsx-runtime delivery mechanism is amended.
- Debugging gains an explicit evidence gate, which front-loads a small cost (get the Network tab) to avoid multi-hour blind iteration.
- Deploy verification by artifact hash becomes routine for analytics changes.
