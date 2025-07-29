# Claude Code Configuration

This directory contains configuration and hooks for Claude Code to ensure code quality during agentic workflows.

## Quality Check Hook

The quality check hook (`hooks/quality-check.sh`) runs automatically when Claude Code finishes a workflow. It ensures:

1. **Biome Linting** - No linting violations
2. **Biome Formatting** - Proper code formatting
3. **TypeScript Type Checking** - No type errors in client, server, or shared packages
4. **TODO Detection** - Warns about unresolved TODOs
5. **Console.log Detection** - Warns about console statements in production code

### Hook Behavior

- **Success**: Workflow completes normally
- **Warnings**: Displayed but don't block workflow
- **Errors**: Block workflow completion (exit code 2)

### Running Manually

```bash
./.claude/hooks/quality-check.sh
```

## Pre-Compact Hook

The pre-compact hook (`hooks/pre-compact-check.sh`) runs before conversation compaction and performs quick syntax checks.

## Configuration

The `settings.local.json` file configures:

1. **Stop Hook**: Runs quality checks when workflow ends
2. **PreToolUse Hook**: Notifies when code modifications are detected
3. **Permissions**: Allows running test commands

## Customization

To add more checks:

1. Edit the appropriate hook script
2. Add your check following the existing pattern
3. Update EXIT_CODE if check should block
4. Add to ERRORS array for summary

## Disabling Hooks

To temporarily disable hooks:

```bash
# Rename settings file
mv .claude/settings.local.json .claude/settings.local.json.disabled

# Or comment out specific hooks in settings.local.json
```

## Security Note

These hooks execute shell commands. Only use trusted scripts and review any changes carefully.
