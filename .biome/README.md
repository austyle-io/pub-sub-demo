# Custom Linting Rules

This directory contains custom linting rules that extend Biome's capabilities to enforce our cursor rules and coding standards.

## Current Setup

### Biome (Primary Linter)
- Handles 60% of our coding standards
- Fast, built-in rules for TypeScript/JavaScript
- Formatting and basic linting

### Custom ESLint Rules (Supplementary)
- Handles the remaining 40% that Biome cannot enforce
- Located in `.eslintrc.custom.json`
- Custom plugin in `.eslint/cursor-rules-plugin.js`

## Custom Rules Implemented

### 1. TypeScript Patterns
- **No React.FC**: Enforces explicit prop types
- **No interfaces**: Always use type declarations
- **No switch statements**: Prefer lookup objects
- **Branded types**: For domain identifiers
- **Enum-object pattern**: Use const objects with `as const`

### 2. Naming Conventions
- **Boolean naming**: Must start with `is`, `has`, `can`, or `should`
- **File naming**: Domain-based naming patterns

### 3. Code Quality
- **Component size limit**: Max 100 lines per component
- **Cognitive complexity**: Max 15 per method
- **No console.log**: Use structured logging

### 4. Type Safety
- **Zod validation**: Required for external data
- **Type guards**: Required with `unknown`
- **No double type assertions**: Ban `as unknown as T`

## GritQL Rules (Future)

The `rules/` directory contains GritQL rules for Biome v2.0+:
- `no-react-fc.grit`
- `no-interface.grit`
- `no-switch-statements.grit`
- `boolean-naming.grit`
- `no-type-assertion.grit`
- `component-size-limit.grit`
- `require-type-guards.grit`

These will be activated when the project upgrades to Biome v2.0.

## Running the Linters

```bash
# Run Biome only
pnpm lint

# Run custom ESLint rules only
pnpm lint:custom

# Run both Biome and custom rules
pnpm lint:all

# Fix auto-fixable issues
pnpm lint:fix
```

## Adding New Custom Rules

1. **For simple patterns**: Add to `.eslintrc.custom.json`
2. **For complex logic**: Add to `.eslint/cursor-rules-plugin.js`
3. **For future Biome v2**: Create a `.grit` file in `rules/`

## Migration Plan

When Biome v2.0 becomes stable:
1. Upgrade Biome: `pnpm add -D @biomejs/biome@^2.0.0`
2. Enable GritQL plugins in `biome.json`
3. Test and migrate ESLint rules to GritQL
4. Eventually phase out custom ESLint setup
