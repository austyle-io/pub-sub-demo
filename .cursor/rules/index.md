# Cursor Rules Index

This directory contains comprehensive coding standards and best practices for the project.

## Core Rules

### [TypeScript Safety](./typescript-safety.md) 🔒

Comprehensive TypeScript type safety rules covering:

- Nullish coalescing (`??`) over logical OR (`||`)
- Optional chaining (`?.`) over manual guards
- Lodash type helpers for clarity
- Runtime type guards for external data
- Strict typing patterns (`type` over `interface`, `unknown` over `any`)
- Safe casting with `satisfies` instead of `as`

## Quick Reference

### Essential TypeScript Patterns

```ts
// ✅ Safe defaults - preserves 0, false, ''
const count = userInput ?? 10;

// ✅ Safe navigation - handles intermediate nulls
const theme = user?.profile?.settings?.theme;

// ✅ Type-safe external data
const data = await response.json();
if (!isUser(data)) throw new Error('Invalid user data');
console.log(data.name); // type-safe after guard

// ✅ Clear type checking
import { isNil, isObject } from 'lodash';
if (!isNil(value) && isObject(config)) { /* ... */ }
```

### Code Review Checklist

- [ ] **Nullish coalescing**: No `||` for defaults (use `??`)
- [ ] **Optional chaining**: No manual null checks (use `?.`)
- [ ] **Type guards**: External data validated with `isType()` functions
- [ ] **Strict types**: No `any` (use `unknown` + guards), no unsafe `as` casts
- [ ] **Lodash helpers**: Use `isNil()`, `isObject()`, etc. for clarity
- [ ] **Specific imports**: No wildcard imports, prefer tree-shakable imports

## Integration

These rules are designed to work with:

- **TypeScript 5.7+**
- **Lodash** for type checking utilities
- **Biome** for linting and formatting
- **Runtime type validation** for API boundaries

## Benefits

Following these rules provides:

- 🛡️ **Type Safety**: Fewer runtime errors through compile-time checks
- 🎯 **Intent Clarity**: Code expresses exactly what it means
- ⚡ **Performance**: Tree-shaking and efficient runtime checks
- 🔍 **Maintainability**: Consistent patterns across the codebase
- 🚀 **Developer Experience**: Better IntelliSense and error messages

For detailed examples and rationale, see individual rule files.
