---
description: Rules for using the agent system effectively
globs: "**/*"
---

# Agent System Workflow Rules

## Required Workflow

1. **Session Start Protocol**

    ```bash
    make up        # Check progress
    make validate-state  # Ensure clean state
    ```

2. **Progress Updates**

    - Run `make up` after completing any migration component
    - Update `.agent/current/state.md` with significant changes
    - Log blockers immediately in `.agent/current/blockers.md`

3. **Handoff Requirements**
    - Always generate handoff at session end: `make ho "summary"`
    - Include: completed items, blockers, next steps
    - Reference previous handoffs for context

## File Updates

### When to Update State

- After major architectural decisions
- When migration phase changes
- On significant blocker resolution

### When to Update Blockers

- Immediately upon discovery
- When blockers are resolved (move to resolved section)
- Include workarounds and contacts

## Integration with Development

```typescript
// When making changes, consider:
// 1. Does this affect migration progress? → Update progress
// 2. Is this a blocker for others? → Update blockers
// 3. Will the next person need context? → Generate handoff

// Example in code comments:
// TODO: Update .agent/current/progress.json after completing this module
// BLOCKER: See .agent/current/blockers.md - Python 3 requirement
```

## Metrics and Reporting

- Daily: Run `make metrics` to update dashboard
- Weekly: Review `.agent/feedback/` for team input
- Sprint end: Comprehensive handoff with `make ho`

## Anti-Patterns

❌ **Working without checking state first**

```bash
# Bad: Jumping straight into code
code src/

# Good: Check state first
make up
cat .agent/current/blockers.md
code src/
```

❌ **Forgetting handoffs**

```bash
# Bad: Closing terminal without handoff
exit

# Good: Generate handoff first
make ho "Completed user module tests"
exit
```

❌ **Delayed blocker reporting**

```typescript
// Bad: Commenting in code only
// TODO: This is broken due to dependency issue

// Good: Log in blockers file immediately
// BLOCKER: See .agent/current/blockers.md - lodash version conflict
```

## Benefits

- **Context Preservation**: No knowledge lost between sessions
- **Team Awareness**: Everyone knows current state
- **Progress Visibility**: 93.5% completion tracking
- **Blocker Management**: Issues tracked and resolved
- **Metrics Driven**: Data-based decisions
