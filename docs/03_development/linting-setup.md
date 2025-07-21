# Linting Setup Guide

This project uses a comprehensive linting setup to ensure code quality across multiple file types.

## Overview

Our linting pipeline includes:

- **TypeScript/JavaScript**: Biome for code linting and formatting
- **Shell Scripts**: Shellcheck for bash/shell script validation
- **Markdown**: markdownlint-cli2 for documentation quality
- **Comprehensive Integration**: All tools integrated into a single lint command
- **Strict Mode**: All warnings are treated as errors for maximum quality enforcement

## Strict Error Mode

This project is configured with **strict error mode** where all linting warnings are treated as errors. This ensures:

- **Zero tolerance for code quality issues**
- **Consistent enforcement across all file types**
- **Early detection of potential problems**
- **No degradation of code quality over time**

### Configured Tools

1. **Shellcheck**: Uses `-S error` flag to treat all warnings as errors
2. **markdownlint**: All markdown issues are treated as blocking errors
3. **Biome**: TypeScript/JavaScript rules are set to "error" level where applicable

## Available Commands

### Package.json Scripts

```bash
# Run comprehensive linting (TypeScript, Shell, Markdown)
pnpm run lint:full

# Run only TypeScript/JavaScript linting
pnpm run lint

# Run only shell script linting
pnpm run lint:shell

# Run only markdown linting
pnpm run lint:markdown

# Format code
pnpm run format
```

### Makefile Targets

```bash
# Run comprehensive linting
make lint

# Run shell script linting
make lint-shell

# Run markdown linting
make lint-markdown

# Run only TypeScript/JavaScript linting
make lint-code

# Format code
make format
```

## Tool Configurations

### Biome (TypeScript/JavaScript)

Configuration: `biome.json`

- Enforces TypeScript best practices
- Consistent code formatting
- Import organization
- Single quotes preference
- Trailing commas
- **All lint rules set to "error" level**

### Shellcheck (Shell Scripts)

Configuration: `.shellcheckrc`

- Validates bash/shell script syntax
- Prevents common shell scripting errors
- Enforces best practices for variable declarations
- Checks for unsafe patterns
- **Strict mode: `-S error` treats all warnings as errors**

**Covered Scripts:**

- All `.sh` files in `scripts/` directory
- DevContainer entry point scripts
- Build and deployment scripts

### markdownlint-cli2 (Markdown)

Configuration: `.markdownlint-cli2.yaml`

- Enforces consistent markdown formatting
- Validates heading structure
- Checks for proper list formatting
- Ensures code blocks have language specifications
- **All markdown issues treated as blocking errors**

**Excluded Files:**

- Auto-generated files (`CHANGELOG.md`)
- Large implementation plans with special formatting
- AI configuration directories (`.gemini/`)

## Integration with Development Workflow

### Pre-commit Checks

The comprehensive linting runs as part of:

- `make quality` - Full quality check pipeline
- CI/CD workflows
- Development scripts

### IDE Integration

#### VS Code

Install recommended extensions:

- **Biome**: For TypeScript/JavaScript linting
- **Shell-format**: For shell script formatting
- **markdownlint**: For markdown validation

#### Configuration

The project includes VS Code settings for:

- Auto-formatting on save
- Inline linting errors
- Consistent code style enforcement

## Common Issues and Solutions

### Shellcheck Warnings

#### SC2155 - Declare and assign separately

```bash
# ❌ Problematic
readonly VAR="$(command)"

# ✅ Correct
VAR="$(command)"
readonly VAR
```

#### SC2086 - Double quote to prevent globbing

```bash
# ❌ Problematic
command $variable

# ✅ Correct
command "$variable"
```

### Markdown Issues

#### MD022 - Headings should be surrounded by blank lines

```markdown
<!-- ❌ Problematic -->
Some text
## Heading
More text

<!-- ✅ Correct -->
Some text

## Heading

More text
```

#### MD040 - Fenced code blocks should have a language

```text
<!-- ❌ Problematic -->
[triple backticks]
code here
[triple backticks]

<!-- ✅ Correct -->
[triple backticks]bash
code here
[triple backticks]
```

### TypeScript Issues

Biome automatically fixes most formatting issues with:

```bash
pnpm run lint:fix
```

## Development Best Practices

### Before Committing

1. Run comprehensive linting:

   ```bash
   make lint
   ```

2. Fix any issues found:

   ```bash
   pnpm run format
   pnpm run lint:fix
   ```

3. Manually address any remaining issues

### Writing New Scripts

1. **Shell Scripts**: Always start with:

   ```bash
   #!/bin/bash
   set -euo pipefail
   ```

2. **Markdown**: Follow the project's heading structure and include language tags for code blocks

3. **TypeScript**: Follow the established patterns and use the shared logger for console output

## Monitoring and Maintenance

### Regular Tasks

- **Weekly**: Review markdown linting results for documentation quality
- **Monthly**: Update linting tool versions
- **As needed**: Adjust configuration for new patterns

### Tool Updates

```bash
# Update markdownlint
pnpm update markdownlint-cli2

# Update Biome (if needed)
pnpm update @biomejs/biome

# Shellcheck updates via system package manager
brew upgrade shellcheck  # macOS
apt update && apt upgrade shellcheck  # Ubuntu
```

## Continuous Integration

The linting pipeline integrates with CI/CD:

- **Quality Gate**: All linting must pass before merging
- **Automated Fixes**: Some issues are auto-fixed where safe
- **Reporting**: Detailed linting reports in CI logs

This comprehensive linting setup ensures consistent code quality across all file types in the project while providing developers with immediate feedback during development.
