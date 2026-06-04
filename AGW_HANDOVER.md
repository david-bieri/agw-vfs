---
name: agw-handover
description: Produce or consume a session handover for the AGW website project. Use whenever David says "handover", "wrap up", "prep for next session", "switching chats", "compaction prep", "end of session", or at any version milestone (e.g. v7 → v8). MANDATORY at session start in a new chat — read AGW_SESSION_NOTES.md BEFORE doing anything else, before asking what the user wants. The handover captures volatile in-flight state (files awaiting deploy, latent bugs surfaced, open questions) that has not yet been promoted to AGW_PROGRESS.md or AGW_DECISIONS.md.
---

# AGW Handover Skill

A protocol for clean continuity across Claude sessions within the AGW project.

## Why this exists

The AGW project moves fast and across many sub-systems (multi-page site, analytics bundles, AGW microsite, service worker, translation registry, conference content). Each session typically ends with files in `/mnt/user-data/outputs/` that have been *produced* but not yet *deployed*, and with conventions discovered that haven't yet been written down. Without an explicit handover, the next chat either re-discovers the state painfully or asks the user to re-explain. This protocol prevents that.

## Where this fits in the file family

| File | Purpose | Update cadence |
|---|---|---|
| `AGW_README.md` | What the project is, where things live | Rarely |
| `AGW_CLAUDE.md` | Session entry-point context, non-negotiables | Rarely |
| `AGW_PROGRESS.md` | Version milestone log + checklists | Per version (v7, v8, …) |
| `AGW_DECISIONS.md` | ADRs (architectural decisions) | Per decision |
| **`AGW_SESSION_NOTES.md`** | **In-flight state** | **Every session** |

The first four are slow-moving and authoritative for past, deployed reality. `AGW_SESSION_NOTES.md` is fast-moving and authoritative for the *present*, undeployed reality.

## When to invoke

### At session END — write `AGW_SESSION_NOTES.md`

Triggers (any one):
- David says "handover", "wrap up", "let's stop here", "switching chats", "prep next session"
- Substantive work was done and files are in `/mnt/user-data/outputs/` awaiting deploy
- Version milestone reached (also update `AGW_PROGRESS.md`)
- Several ADR-worthy decisions accumulated (also update `AGW_DECISIONS.md`)
- Context window getting full (>60% used) and another sub-task is starting

### At session START — read `AGW_SESSION_NOTES.md`

Triggers (any one):
- A new chat opens that touches the AGW project
- David refers to something "we did" or "we decided" with no current-conversation context
- David asks about deployment status or open items

Always read `AGW_SESSION_NOTES.md` BEFORE writing any code or asking what the user needs. If the file is missing, check `git log --oneline -20` for what was last shipped and ask David where he wants to pick up.

## The handover document — six sections

Use this exact structure in `AGW_SESSION_NOTES.md`:

```markdown
# AGW Session Notes

**Last session:** YYYY-MM-DD
**Topic:** one-line summary of what this session was about
**Working version at session end:** vN
**Conference T-minus:** N days

---

## 1. Just deployed this session

Commits David confirmed pushing during the session. Format:
- `<short-hash>` `<commit msg>` — what it covered in one sentence

Use ✓ for confirmed-pushed, ? for "I gave the commit instructions but didn't see confirmation".

## 2. Pending deploy

Files in `/mnt/user-data/outputs/` that are ready to push but haven't been confirmed deployed. Format:

```powershell
git add <files>
git commit -m "<msg>"
git push
```

Plus a one-line rationale for each grouped commit.

## 3. Decisions made this session

New ADRs added to `AGW_DECISIONS.md`, with their short identifier and one-line summary. If decisions were made but not yet promoted to ADRs, list them here under "to be promoted".

## 4. Latent issues surfaced

Bugs, gaps, or smells noticed during the session that we did NOT fix (or only partially fixed). File path and line number when known. The point is to make the next session aware so they don't get rediscovered.

## 5. Open questions for David

Items waiting on David's input — content confirmations, design choices, scope decisions.

## 6. Suggested next session

Concrete starting point. Examples:
- "Test multi-page deploy on iOS, then move to Phase 2 i18n extraction"
- "Wait for Klump's review of AGW_en.json before re-engaging"
- "Update AGW_PROGRESS.md to v9 once these pending items are confirmed deployed"
```

## Writing rules

- **Be specific about paths.** Always full path. `/mnt/user-data/outputs/agw_app.js` not "the app file".
- **Be honest about uncertainty.** Use `?` markers where you're not sure if something was actually deployed.
- **Record patterns discovered, not just code changes.** If a session uncovered that "every render function needs an early-return guard," that's a pattern worth capturing in section 3 or 4.
- **Don't duplicate AGW_PROGRESS.md.** Once a milestone is in AGW_PROGRESS.md, it leaves AGW_SESSION_NOTES.md.
- **Don't duplicate AGW_DECISIONS.md.** Once an ADR is logged, the session notes just reference its identifier.
- **Brevity is a feature.** Session notes should fit in 1-2 screens. If they grow longer, things should be migrating to the slow-moving files.

## Promotion rules (what moves where)

- A *pending deploy* (section 2) becomes a *deployed item* (section 1) the next session, then eventually folds into AGW_PROGRESS.md at the next version bump.
- An *open question* (section 5) either gets answered and becomes a decision (promotes to ADR) or becomes a pending deploy.
- A *latent issue* (section 4) either gets fixed (becomes a deployed item) or escalates to a pre-conference blocker (gets logged in AGW_PROGRESS.md's "Blocked / Waiting" table).

## Anti-patterns

Don't write a handover that:
- Lists everything that was discussed (use git log for that — handover is for what *matters going forward*)
- Restates decisions already in AGW_DECISIONS.md
- Restates milestones already in AGW_PROGRESS.md
- Is missing pending-deploy commit messages (these are the most-used part of the handover)
- Buries blockers in narrative prose instead of putting them in section 5

## Worked example

See `AGW_SESSION_NOTES.md` in the same directory — generated at the end of the 2026-06-04 session that created this skill. Topics covered in that session: multi-page architecture deploy, mobile menu restoration, render guards, countdown card, sister societies redesign with Œconomia. Use it as a concrete template; the structure transfers, the content does not.

## Adapting this to other projects

The same pattern applies to David's other projects (SPIA white paper, Jane MURP bot) — the file family is consistent (`{prefix}_README` / `{prefix}_CLAUDE` / `{prefix}_PROGRESS` / `{prefix}_DECISIONS` / `{prefix}_SESSION_NOTES`). Mirror this skill as `SPIA_HANDOVER.md` or `JANE_HANDOVER.md` when needed, adjusting only the file family prefix and project-specific deploy ritual.
