# Quick Reference: Cursor + Agent System

## 🚀 Start Working

```bash
make up          # See progress (93.5%)
code .           # Open in Cursor
```

## 📝 During Development

| Task            | Command                           | When                      |
| --------------- | --------------------------------- | ------------------------- |
| Check state     | `cat .agent/current/state.md`     | Before major changes      |
| Update progress | `make up`                         | After completing features |
| Log blocker     | Edit `.agent/current/blockers.md` | Immediately               |
| Run tests       | `pnpm test:safe`                  | Before commits            |
| Lint code       | `pnpm lint:safe`                  | Before commits            |

## 🤝 End Session

```bash
make ho "Completed auth module, fixed tests"  # Generate handoff
make metrics                                   # Update dashboard
```

## 🔧 Agent Tools

- Progress: `.agent/tools/update-progress-simple.py`
- Handoff: `.agent/tools/generate-handoff-simple.py`
- Validate: `.agent/tools/validate-state.py`

## 🔍 Skeptical Analysis Mode

For critical reviews and validation:

1. **Activate**: Select "Skeptical Evidence-Driven Analyst" in Cursor modes
2. **Commands**:

    ```bash
    make validate-state > analysis-start.log
    grep -r "error\|warning" . > issues.log
    pnpm test:coverage
    ```

3. **Evidence Sources**:
    - `.agent/current/metrics.md` - Performance data
    - `.agent/history/handoffs/` - Historical context
    - `coverage/` - Test coverage reports

## 🚫 Never Do This

- ❌ Use npm (always pnpm)
- ❌ console.log (use logger)
- ❌ any types (use unknown)
- ❌ Skip handoffs

## 📁 Key Files

- `.cursorrules` - Main config
- `.cursor/rules/` - All 39+ rules
- `.cursor/prompts/` - AI prompts
- `.agent/current/` - Live state

## 💡 Pro Tips

- Run `make help` for all commands
- Check `.cursor/rules/index.mdc` for rule categories
- Use `make validate-enterprise` for comprehensive checks

## 📊 Current Status

- Overall: 93.5% complete
- Phase: migration-optimization
- Health: Green ✅

## ⚡ Quick Commands

```bash
make up              # Update progress
make ho              # Generate handoff
make t               # Run tests
make l               # Run linter
make quality-check   # Full validation
make validate-state  # Check project state
```

## 🚨 Critical Rules

1. **ALWAYS use pnpm** (never npm)
2. **NO console.log** (use Pino)
3. **NO any types** (use unknown)
4. **NO interfaces** (use type)
5. **NO switch** (use lookup objects)

## 📁 Key Locations

- Rules: `.cursor/rules/` (37 files)
- Agent: `.agent/current/`
- Docs: `docs/04_migration/`
- Feedback: `.agent/feedback/`

## 🆘 Help

- Onboarding: `.cursor/prompts/_ai-onboarding.mdp`
- Integration: `.cursor/agent-integration.md`
- Makefile help: `make help`
