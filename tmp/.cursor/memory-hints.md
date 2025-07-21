# Project Context for AI Memory

## Critical Information

- Migration Status: 93.5% complete (check with `make up`)
- Package Manager: pnpm ONLY (never npm)
- Logging: Pino only (no console.log)
- Progress Tracking: Use `.agent/` system
- Documentation: 15+ pages in `docs/04_migration/`

## Workflow Requirements

- Start sessions with `make up`
- End sessions with `make ho "notes"`
- Update blockers immediately
- Check feedback in `.agent/feedback/`

## Key Deviations (from `.agent/history/deviations/`)

- Timeline: 4 weeks → 4 hours
- Dependencies: PyYAML → JSON
- Scripts: Full → Partial implementation
- Adoption: Mandatory → Optional

## Current Focus

- Phase: migration-optimization
- Blockers: Check `.agent/current/blockers.md`
- Next: Team adoption and training

## Command Shortcuts

- `make up` → Update progress
- `make ho` → Generate handoff
- `make t` → Run tests
- `make l` → Run linter

## File Locations

- Progress: `.agent/current/progress.json`
- State: `.agent/current/state.md`
- Blockers: `.agent/current/blockers.md`
- Rules: `.cursor/rules/` (37 files)

## Testing

- Unit: Vitest (`pnpm test:unit`)
- BDD: QuickPickle (`pnpm test:bdd`)
- E2E: Playwright (`pnpm test:e2e`)
- Safe: Use `:safe` variants

## Remember

1. Agent system tracks everything
2. Handoffs are mandatory
3. Progress is at 93.5%
4. Use Make commands first
5. Python tools as fallback
