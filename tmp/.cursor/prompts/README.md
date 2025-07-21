# AuStdX Cursor Prompts

AI-powered development workflows tailored for the AuStdX Design System.

## Directory Structure

All prompts are organized in subdirectories by category:

```
.cursor/prompts/
├── analysis/               # Analysis and review prompts
├── architecture/           # System design and architecture
├── chains/                # Multi-step workflows
├── development/           # Development prompts
├── documentation/         # Documentation prompts
├── knowledge-base/        # Knowledge management
├── onboarding/           # Onboarding guides
├── personas/             # AI personas
├── refactoring/          # Code refactoring
├── review/               # Code review
└── testing/              # Testing prompts
```

## Quick Access

- **Full Documentation**: `documentation/_index.mdp`
- **Onboarding Guide**: `onboarding/_ai-onboarding.mdp`
- **Personas**: `personas/` directory
- **Chains**: `chains/` directory with executable workflows

## Most Used

1. **Architecture Review**: `@architect-austdx` (personas/_architect-austdx.mdp)
2. **Code Review**: `@mentor-austdx` (personas/_mentor-austdx.mdp)
3. **Component Creation**: `development/_component-create.mdp`
4. **BDD Testing**: `testing/_bdd-test-create.mdp`
5. **Feature Workflow**: `chains/run.sh feature-development`

## Integration

These prompts work with:
- `.cursor/rules/` - Project coding standards
- `CLAUDE.md` - Project guidance
- `.cursorrules` - Cursor configuration