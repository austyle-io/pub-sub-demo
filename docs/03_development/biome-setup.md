# Biome Configuration

## Overview

This project uses [Biome](https://biomejs.dev/) for linting and formatting, configured to use the global Homebrew installation rather than a local dependency.

## Installation

The project is configured to use the global Biome installation:

```bash
# Install globally via Homebrew (recommended)
brew install biome

# Verify installation
biome --version
```

## Configuration

### Project Configuration

- **`biome.json`**: Main configuration file with project-specific rules
- **`.vscode/settings.json`**: VSCode workspace settings pointing to global Biome
- **`.vscode/extensions.json`**: Recommended extensions

### Key Configuration Details

**Formatting Rules:**

- Single quotes for strings
- Trailing commas where applicable
- 2-space indentation
- 80 character line width
- LF line endings

**Linting Rules:**

- Recommended rules enabled
- Strict TypeScript checks
- Import organization
- No explicit `any` types

## Usage

### Command Line

```bash
# Lint entire project
pnpm lint

# Format entire project
pnpm format

# Auto-fix issues
pnpm lint:fix

# Direct Biome commands
biome check .
biome format --write .
```

### VSCode Integration

The project is configured for optimal VSCode integration:

1. **Install the Biome extension**: `biomejs.biome`
2. **Restart VSCode** after initial setup
3. **Format on save** is enabled automatically
4. **Code actions** run on save (organize imports, quick fixes)

### Path Configuration

The global Biome installation is located at:

- **macOS (Homebrew)**: `/opt/homebrew/bin/biome`
- **VSCode setting**: `"biome.lspBin": "/opt/homebrew/bin/biome"`

## Troubleshooting

### Common Issues

**"Biome not found" errors:**

```bash
# Check global installation
which biome
biome --version

# Reinstall if needed
brew reinstall biome
```

**Extension not working:**

1. Ensure the Biome extension is installed in VSCode
2. Restart VSCode
3. Check that `biome.lspBin` points to the correct path
4. Disable conflicting extensions (Prettier, ESLint)

**Configuration not applied:**

1. Verify `biome.json` is in project root
2. Check for conflicting configuration files
3. Restart Biome language server: `Cmd+Shift+P` → "Biome: Restart Language Server"

### Debugging

**Check configuration detection:**

```bash
# Test configuration is loaded
biome check --reporter=json . | head -50
```

**Test formatting:**

```bash
# Test format rules
echo 'const x={"test":"value",};' | biome format --stdin-file-path=test.js
```

## Migration Notes

This project was migrated from local to global Biome installation:

1. **Removed**: Local `@biomejs/biome` dependency
2. **Added**: Global installation path configuration
3. **Updated**: VSCode settings to use global binary
4. **Configured**: Extension recommendations

## Performance Benefits

Using the global installation provides:

- **Faster startup**: No need to install local dependencies
- **Consistent versioning**: Same Biome version across all projects
- **Reduced disk usage**: No duplicate installations
- **Easier updates**: Single `brew upgrade biome` command

## Related Documentation

- [Biome Official Documentation](https://biomejs.dev/)
- [VSCode Extension](https://marketplace.visualstudio.com/items?itemName=biomejs.biome)
- [Project Development Guide](./00_INDEX.md)
