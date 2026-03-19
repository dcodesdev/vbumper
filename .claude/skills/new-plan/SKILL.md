---
name: new-plan
description: "Use this when the user wants to create a new plan, start a new feature, begin a new project, or says 'new plan'. This skill walks through defining a plan collaboratively, writes a SPEC.md and PROGRESS.md into a timestamped plans/ directory, and updates PROMPT.md frontmatter to point to the new plan so the Ralph loop picks it up."
---

# New Plan

## Overview

Create a structured project plan by collaborating with the user to define a plan, then write it to disk and wire it up to PROMPT.md.

## The Process

**1. Understand what the user wants to build:**

- Do NOT ask questions unless the user explicitly asks you to or says they want to discuss/brainstorm first
- Infer scope, constraints, and success criteria from what the user has already told you
- If the user's request is clear enough to act on, go straight to writing the plan
- Only ask for clarification if critical information is truly missing and cannot be reasonably inferred

**2. Write the SPEC.md:**

Create the plan file at `./plans/YYYY-MM-DD-HHMM-<name>/SPEC.md` where:

- `YYYY-MM-DD-HHMM` is the current date and time (e.g. `2026-02-23-1430`)
- `<name>` is a short kebab-case name for the plan (e.g. `auth-system`, `api-refactor`)

The SPEC.md should contain:

```markdown
# <Plan Name>

## Goal

One paragraph describing what we're building and why.

## Phases

### Phase 1: <Name>

- [ ] Task 1
- [ ] Task 2

### Phase 2: <Name>

- [ ] Task 1
- [ ] Task 2

(as many phases as needed — keep them small and focused)

## Constraints

- Any technical constraints, dependencies, or requirements

## Success Criteria

- How do we know this is done?
```

**3. Update PROMPT.md:**

After writing the plan, update the frontmatter in `./PROMPT.md` to point to the new plan:

```yaml
---
plan: plans/YYYY-MM-DD-HHMM-<name>
---
```

The loop will automatically pick up the new plan by watching todo.md for unticked tasks.

**4. Create an empty PROGRESS.md:**

Create an empty `PROGRESS.md` in the same directory as the spec:

```markdown
# Progress

## Completed Phases

(none yet)

## Current Phase

Not started.

## Notes
```

## Key Principles

- **One phase = one iteration** — each phase should be completable in a single Ralph loop run
- **Small and concrete** — tasks should be specific, not vague
- **Ordered by dependency** — earlier phases should not depend on later ones
- **YAGNI** — don't plan features that aren't needed yet
