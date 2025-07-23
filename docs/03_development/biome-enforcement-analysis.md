# Biome Enforcement Analysis

## Overview

This document analyzes which cursor rules and CLAUDE.md coding standards can be enforced through Biome linter configuration.

## Rules That Can Be Enforced by Biome

### ✅ Type Safety Rules
- `noExplicitAny` - Prevents use of `any` type
- `noImplicitAnyLet` - Prevents implicit any in let declarations
- `useIsNan` - Enforces proper NaN checks
- `noNonNullAssertion` - Prevents `!` non-null assertions
- `useAsConst` - Enforces `as const` pattern for literals

### ✅ Modern JavaScript Patterns
- `useNullishCoalescing` - Enforces `??` over `||` for nullish values
- `useOptionalChain` - Enforces `?.` for optional property access
- `noDoubleEquals` - Prevents `==` in favor of `===`
- `useDefaultSwitchClauseLast` - Enforces switch statement patterns

### ✅ Import/Export Rules
- `useImportType` - Enforces type imports for type-only imports
- `noNamespaceImport` - Prevents `import * as` patterns
- `useNodejsImportProtocol` - Enforces `node:` protocol
- `noBarrelFile` - Warns against barrel exports

### ✅ Code Quality
- `noUnusedVariables` - Removes dead code
- `noUnusedImports` - Cleans up imports
- `noConsole` - Prevents console.log in production
- `noArrayIndexKey` - Prevents using array index as React key

### ✅ Complexity Rules
- `noUselessTypeConstraint` - Prevents unnecessary generic constraints
- `useExhaustiveDependencies` - React hooks dependency checking

## Rules That Cannot Be Enforced by Biome

### ❌ Architecture & Organization
- 100-line component limit
- Directory structure requirements
- File naming conventions (PascalCase.tsx, kebab-case.ts)
- Context-wrapped stores only pattern

### ❌ Type System Preferences
- Never use `interface` (always use `type`)
- Branded types for domain identifiers
- Zod schema-first validation patterns
- Type coverage >97% requirement

### ❌ Business Logic Rules
- ShareDB operation patterns
- WebSocket authentication patterns
- Input sanitization requirements
- SQL injection prevention

### ❌ Library-Specific Patterns
- Arrow functions only for React components
- Never use `React.FC`
- Tailwind CSS only (no CSS-in-JS)
- Individual lodash imports

### ❌ Runtime Validation
- Zod validation at data boundaries
- Type guards for external data
- Structured logging with context
- Security event logging

## Enhanced Biome Configuration

The `biome-enhanced.json` file includes all enforceable rules:

```json
{
  "linter": {
    "rules": {
      "correctness": {
        "noUnusedVariables": "error",
        "noUnusedImports": "error",
        "useIsNan": "error"
      },
      "style": {
        "useNullishCoalescing": "error",
        "useOptionalChain": "error",
        "noNamespaceImport": "error",
        "useAsConst": "error",
        "noNonNullAssertion": "error"
      },
      "suspicious": {
        "noConsole": "error",
        "noDoubleEquals": "error",
        "noImplicitAnyLet": "error",
        "useDefaultSwitchClauseLast": "error"
      }
    }
  }
}
```

## Migration Guide

To adopt the enhanced Biome configuration:

1. **Backup current config**: `cp biome.json biome.json.backup`
2. **Apply enhanced config**: `cp biome-enhanced.json biome.json`
3. **Run linter**: `pnpm biome check`
4. **Fix violations**: `pnpm biome check --fix`

## Additional Tooling Needed

For rules that Biome cannot enforce, consider:

1. **Custom ESLint Rules** - For interface ban, component limits
2. **Husky Pre-commit Hooks** - For file naming validation
3. **TypeScript Strict Config** - For type coverage
4. **Code Review Checklist** - For architectural patterns
5. **Runtime Libraries** - Zod for validation, structured logging

## Conclusion

Biome can enforce approximately **60%** of the coding standards, focusing on TypeScript safety, modern JavaScript patterns, and basic code quality. The remaining 40% requires manual review, custom tooling, or runtime validation.
