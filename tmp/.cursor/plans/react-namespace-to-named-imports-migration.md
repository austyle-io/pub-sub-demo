# React Namespace to Named Imports Migration Plan

## Overview

This plan outlines the systematic migration from React namespace imports (`React.*`) to named imports throughout the codebase. The migration affects 48 files with approximately 300+ occurrences.

## Current State Analysis

### Import Patterns Found

1. **Type-only namespace imports**: `import type * as React from "react"`
2. **Full namespace imports**: `import * as React from "react"`
3. **Mixed imports**: Some files already use partial named imports

### Most Common React.* Usages

- `React.ComponentProps` (240 occurrences)
- `React.useContext` (7 occurrences)
- `React.useCallback` (6 occurrences)
- `React.createContext` (6 occurrences)
- `React.CSSProperties` (5 occurrences)

## Migration Strategy

### Phase 1: Preparation

1. Create a comprehensive list of all React exports that need to be imported
2. Identify any potential naming conflicts with existing imports
3. Ensure all tests pass before starting migration

### Phase 2: Automated Migration (Priority Order)

#### High Priority - UI Components Directory

These files have the most occurrences and follow consistent patterns:

- `src/lib/components/ui/sidebar.tsx` (36 occurrences)
- `src/lib/components/ui/menubar.tsx` (16 occurrences)
- `src/lib/components/ui/carousel.tsx` (16 occurrences)
- `src/lib/components/ui/dropdown-menu.tsx` (15 occurrences)
- `src/lib/components/ui/context-menu.tsx` (15 occurrences)
- All other files in `src/lib/components/ui/`

#### Medium Priority - Other Components

- `src/lib/components/MainNavigation.tsx`
- `src/lib/components/error-boundary/*.tsx`
- `src/lib/providers/*.tsx`
- `src/lib/modules/map/components/*.tsx`

#### Low Priority - Test Files

- `test/step-definitions/diagnostic-steps.ts`
- `test/step-definitions/types.ts`

### Phase 3: Migration Patterns

#### Pattern 1: Simple Hook Usage

```typescript
// Before
import type * as React from "react"
const [state, setState] = React.useState()

// After
import { useState } from "react"
const [state, setState] = useState()
```

#### Pattern 2: Type Imports

```typescript
// Before
import type * as React from "react"
type Props = React.ComponentProps<"div">

// After
import type { ComponentProps } from "react"
type Props = ComponentProps<"div">
```

#### Pattern 3: Complex Types

```typescript
// Before
import type * as React from "react"
const Component = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>()

// After
import { forwardRef, type ElementRef, type ComponentPropsWithoutRef } from "react"
const Component = forwardRef<
  ElementRef<"div">,
  ComponentPropsWithoutRef<"div">
>()
```

#### Pattern 4: Event Types

```typescript
// Before
import type * as React from "react"
const handleClick = (e: React.MouseEvent) => {}

// After
import type { MouseEvent } from "react"
const handleClick = (e: MouseEvent) => {}
```

## Implementation Steps

### Step 1: Create Migration Script

Create an automated script to handle the bulk of the migration:

1. Parse AST to identify React.* usage
2. Build list of required named imports
3. Replace React.* with direct usage
4. Update import statements

### Step 2: Manual Review Items

Items that need manual attention:

- Files using `forwardRef` pattern
- Complex type combinations
- Any custom React type extensions

### Step 3: Testing Strategy

1. Run full test suite after each file migration
2. Verify TypeScript compilation
3. Check for any runtime errors
4. Validate Storybook stories still work

### Step 4: Linting and Formatting

1. Run `pnpm lint:fix` after migration
2. Run `pnpm format:fix` to ensure consistent formatting
3. Run `pnpm type-check` to verify no type errors

## Validation Checklist

- [ ] All `React.*` occurrences replaced with named imports
- [ ] No duplicate imports in any file
- [ ] All tests passing
- [ ] TypeScript compilation successful
- [ ] ESLint rules satisfied
- [ ] No runtime errors in development
- [ ] Storybook stories rendering correctly

## Rollback Plan

If issues arise:

1. Git reset to pre-migration commit
2. Address specific issues identified
3. Re-attempt migration with fixes

## Success Criteria

- Zero `React.*` usage in the codebase
- All files use named imports from 'react'
- No increase in bundle size
- No runtime performance impact
- Maintains 100% TypeScript compliance

## Notes

- The `import type` syntax should be preserved for type-only imports to maintain optimal bundle size
- Consider adding an ESLint rule to prevent future `React.*` usage
- Document the new pattern in CLAUDE.md for consistency
