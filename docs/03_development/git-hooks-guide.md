# Git Hooks Framework Guide

## Overview

This project includes a comprehensive Git hooks framework that enforces code quality, security, and conventional commit standards. The framework is adapted from best practices and tailored specifically for the pub-sub collaborative editing demo.

## Features

### 🛡️ Security-First Design
- **Secret Detection**: Prevents accidental commit of API keys, passwords, and credentials
- **Large File Prevention**: Blocks files over 3MB to maintain repository performance
- **Environment File Protection**: Prevents `.env` files from being committed
- **Private Key Detection**: Blocks SSH/SSL private keys

### 🎯 Project-Specific Validation
- **Console.log Detection**: Enforces Pino logging usage over console.log
- **TypeScript Patterns**: Validates against `any` types and `interface` usage
- **Lodash Import Patterns**: Ensures tree-shaking friendly imports
- **ShareDB Integration Checks**: Validates collaborative editing components

### 📝 Conventional Commits
- **Commit Message Validation**: Enforces conventional commit format
- **Domain-Specific Scopes**: Includes collaborative editing scopes (collab, sharedb, etc.)
- **Breaking Change Detection**: Identifies breaking changes with proper warnings

### ⚡ Performance Optimized
- **Parallel Execution**: Runs checks in parallel where possible
- **Intelligent File Filtering**: Only processes relevant files
- **Timeout Protection**: Prevents hooks from hanging
- **Incremental Testing**: Runs only tests related to changed files

## Installation

### Quick Install

```bash
# Install hooks framework
make hooks-install

# Or with dependencies
make hooks-setup
```

### Manual Installation

```bash
# Install hooks only
./.githooks/install.sh

# Install with pre-commit framework
pip3 install pre-commit detect-secrets
./.githooks/install.sh
```

## Hook Types

### Pre-commit Hook

Runs before each commit to enforce quality gates:

**Phase 1: Security Validation**
- Secret detection via pre-commit framework (if available)
- Built-in security checks (private keys, large files)

**Phase 2: Development Tools**
- Biome formatting and linting for JS/TS files
- TypeScript type checking via `make type-check`
- CSS formatting with Biome
- Markdown linting via `pnpm run lint:markdown`
- Shell script validation via `pnpm run lint:shell`
- JSON/YAML validation

**Phase 3: Project-Specific Checks**
- Console.log detection in production code
- TypeScript pattern validation (no `any`, no `interface`)
- Lodash import pattern enforcement
- Environment file protection
- Related test execution

### Commit Message Hook

Validates commit messages for conventional commit compliance:

- **Format Validation**: `type(scope): description`
- **Length Limits**: 10-72 characters for first line
- **Type Validation**: Standard types plus project-specific
- **Scope Validation**: Collaborative editing specific scopes
- **Breaking Change Detection**: Handles `!` syntax
- **WIP Detection**: Warns about work-in-progress commits

### Pre-push Hook

Comprehensive validation before pushing:

- **Commit Message Batch Validation**: Validates all commits being pushed
- **Full Test Suite**: Runs complete test suite via `make test`
- **Type Checking**: Comprehensive TypeScript validation
- **Quality Gates**: Full linting and quality checks via `make quality`
- **Build Verification**: Ensures everything compiles via `pnpm build`
- **Security Audit**: Checks for vulnerabilities via `pnpm audit`
- **ShareDB Specific**: Validates collaborative editing components
- **WebSocket Security**: Checks authentication in WebSocket connections

## Configuration

### Environment Variables

```bash
# Bypass all hooks (not recommended)
export GIT_HOOK_BYPASS=true

# Continue on failures instead of stopping
export HOOK_FAIL_FAST=0

# Enable verbose output
export HOOK_VERBOSE=1

# Dry run mode (test without executing)
export HOOK_DRY_RUN=1

# Skip hooks in CI
export RUN_HOOKS_IN_CI=0
```

### Customization

Edit `.githooks/shared/config.sh` to customize:

- Timeout values
- File size limits
- Commit message rules
- Quality thresholds
- Project-specific scopes

## Usage

### Normal Development

The hooks run automatically:

```bash
git add .
git commit -m "feat(editor): add collaborative cursor tracking"
git push origin feature-branch
```

### Bypassing Hooks

```bash
# Bypass pre-commit and commit-msg (not recommended)
git commit --no-verify -m "wip: temporary commit"

# Bypass pre-push (not recommended)
git push --no-verify
```

### Testing Hooks

```bash
# Test hooks without committing
make hooks-test

# Test specific hook
HOOK_DRY_RUN=1 ./.githooks/pre-commit --verbose
```

## Troubleshooting

### Common Issues

#### Hook Execution Failed

```bash
# Check hook permissions
ls -la .git/hooks/

# Reinstall hooks
make hooks-install
```

#### Pre-commit Framework Issues

```bash
# Reinstall pre-commit
pip3 install --upgrade pre-commit
pre-commit install
```

#### Secret Detection False Positives

```bash
# Update secrets baseline
detect-secrets scan --baseline .secrets.baseline

# Or regenerate
rm .secrets.baseline
./.githooks/install.sh
```

#### Performance Issues

```bash
# Check hook logs
tail -f .git/hooks.log

# Increase timeouts in config.sh
vim .githooks/shared/config.sh
```

### Getting Help

```bash
# View hook configuration
cat .githooks/shared/config.sh

# Check installed hooks
ls -la .git/hooks/

# View hook logs
cat .git/hooks.log
```

## Integration with Development Workflow

### VS Code Integration

The hooks integrate seamlessly with VS Code:

- **Format on Save**: Biome handles formatting automatically
- **Type Checking**: Issues show in Problems panel
- **Terminal Output**: Hook results visible in integrated terminal

### Make Commands

```bash
# Quality workflow
make quality    # Comprehensive quality check
make lint       # Linting only
make test       # Testing only
make format     # Formatting only

# Hook management
make hooks-install     # Install hooks
make hooks-uninstall   # Remove hooks
make hooks-test        # Test hooks
make hooks-setup       # Install with dependencies
```

### CI/CD Integration

The hooks complement CI/CD workflows:

- Hooks catch issues early (locally)
- CI runs same checks for consistency
- Pre-push hook mimics CI environment
- Faster feedback loop for developers

## Best Practices

### Commit Message Examples

```bash
# Feature commits
git commit -m "feat(editor): add real-time cursor synchronization"
git commit -m "feat(sharedb): implement document version conflict resolution"

# Bug fixes
git commit -m "fix(collab): resolve race condition in operation ordering"
git commit -m "fix(websocket): handle connection drops gracefully"

# Documentation
git commit -m "docs(api): update ShareDB integration guide"

# Performance
git commit -m "perf(realtime): optimize operation transformation batching"

# Breaking changes
git commit -m "feat(auth)!: change JWT token structure for better security"
```

### Development Workflow

1. **Make Changes**: Edit code with VS Code auto-formatting
2. **Test Locally**: Run `make test` before committing
3. **Stage Files**: `git add` relevant files
4. **Commit**: Hooks automatically run quality checks
5. **Push**: Pre-push hook runs comprehensive validation

### Resolving Hook Failures

1. **Read the Output**: Hooks provide detailed error messages
2. **Fix Issues**: Use suggested commands (`make format`, `make lint`)
3. **Retest**: Run `make hooks-test` to verify fixes
4. **Commit Again**: Hooks will re-run automatically

## Uninstallation

```bash
# Remove hooks and restore backups
make hooks-uninstall

# Or manually
./.githooks/uninstall.sh
```

This will:
- Remove installed hooks
- Offer to restore previous hooks from backup
- Clean up pre-commit framework integration
- Provide instructions for manual cleanup
