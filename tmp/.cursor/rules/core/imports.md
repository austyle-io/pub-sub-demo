# Import/Export Patterns and Package Management

Rules for import/export patterns, package management, and external tool usage.

## Rules

- **ALWAYS use pnpm, NEVER npm** for package management
- **Use `pnpm dlx` instead of `npx`** for running packages
- Import organization: external dependencies first, then internal modules
- Use named exports over default exports when possible
- Group imports by source (external, internal utilities, components)

## Package Management

### Core Commands

```bash
# ✅ CORRECT - Use pnpm
pnpm install                    # Install dependencies
pnpm add <package>             # Add package
pnpm remove <package>          # Remove package
pnpm dlx <package>             # Run package (replaces npx)

# ❌ WRONG - Don't use npm or npx
npm install                    # Use pnpm install
npm install <package>          # Use pnpm add
npx <package>                  # Use pnpm dlx
```

### Common Package Execution Examples

```bash
# ✅ CORRECT - Use pnpm dlx
pnpm dlx shadcn@latest add button
pnpm dlx type-coverage --strict --at-least 99
pnpm dlx madge --circular src
pnpm dlx @arethetypeswrong/cli --pack .
pnpm dlx jscodeshift -t transform.js src/

# ❌ WRONG - Don't use npx
npx shadcn@latest add button
npx type-coverage --strict
npx madge --circular src
```

## Import Organization

### Correct Import Order

```typescript
// ✅ GOOD - Organized imports
// 1. External dependencies
import React, { useState, useEffect } from "react";
import { Router, Routes, Route } from "react-router-dom";
import { isEmpty, isNil } from "lodash-es";

// 2. Internal utilities and config
import { createApiClient } from "@/lib/utils/api-utils";
import { GLOBAL_KEYS } from "@/lib/config/global-constants";

// 3. Internal components
import { Button } from "@/lib/components/ui/button";
import { UserProfile } from "@/lib/components/UserProfile";

// 4. Types (grouped separately)
import type { User, ApiResponse } from "@/lib/types/user-types";
import type { ComponentProps } from "./types";
```

### Export Patterns

```typescript
// ✅ GOOD - Named exports (preferred)
export const UserProfile = ({ user }: UserProfileProps) => {
    // Component implementation
};

export const validateUserInput = (input: string): boolean => {
    // Validation logic
};

// Export types separately
export type { UserProfileProps, ValidationResult };

// ❌ LESS PREFERRED - Default exports
export default UserProfile; // Use sparingly
```

### Import/Export Grouping

```typescript
// utils/index.ts - Barrel exports
export { validateUserInput, formatUserName } from "./user-utils";
export { createApiClient, handleApiError } from "./api-utils";
export { debounce, throttle } from "./performance-utils";

// types/index.ts - Type-only exports
export type { User, UserRole, UserPreferences } from "./user-types";
export type { ApiResponse, ApiError } from "./api-types";
export type { ComponentProps, EventHandler } from "./component-types";
```

## Lodash Import Patterns

```typescript
// ✅ GOOD - Named imports for tree shaking
import { isEmpty, isNil, groupBy, sortBy } from "lodash-es";

// ✅ ACCEPTABLE - Individual imports
import isEmpty from "lodash-es/isEmpty";
import isNil from "lodash-es/isNil";

// ❌ BAD - Full lodash import
import _ from "lodash"; // Bundles entire library
import * as _ from "lodash-es"; // Prevents tree shaking
```

## Dynamic Imports

```typescript
// ✅ GOOD - Lazy loading with proper typing
const HeavyComponent = lazy(() => import("./HeavyComponent"));

// ✅ GOOD - Dynamic utility imports
const loadUtility = async () => {
    const { heavyFunction } = await import("./heavy-utils");
    return heavyFunction;
};

// ✅ GOOD - Conditional imports
const loadDevelopmentTools = async () => {
    if (process.env.NODE_ENV === "development") {
        const { devTools } = await import("./dev-tools");
        return devTools;
    }
    return null;
};
```

## Path Aliases

```typescript
// ✅ GOOD - Use configured path aliases
import { Button } from "@/lib/components/ui/button";
import { createUser } from "@/lib/services/user-service";
import { UserType } from "@/lib/types/user-types";

// ❌ BAD - Relative paths for distant modules
import { Button } from "../../../components/ui/button";
import { createUser } from "../../../../services/user-service";
```

## Anti-Patterns

```typescript
// ❌ BAD - Mixed import styles
import React from "react";
import { useState } from "react"; // Inconsistent with above

// ❌ BAD - Unorganized imports
import { Button } from "@/components/Button";
import { isEmpty } from "lodash-es";
import { useState } from "react";
import { User } from "@/types/user";

// ❌ BAD - Side effect imports without comment
import "./styles.css"; // Add comment explaining why

// ✅ GOOD - Side effect imports with explanation
import "./polyfills"; // Required for IE11 support
import "./global-styles.css"; // Global CSS reset and variables
```

## Package Manager Migration

### Migrating from npm to pnpm

```bash
# 1. Remove npm artifacts
rm package-lock.json
rm -rf node_modules

# 2. Install with pnpm
pnpm install

# 3. Update scripts (if any use npm directly)
# package.json - Replace npm with pnpm in scripts
```

### Update Documentation

When migrating existing documentation:

```markdown
<!-- ❌ OLD - npm examples -->

npm install
npm run dev
npx storybook@latest init

<!-- ✅ NEW - pnpm examples -->

pnpm install
pnpm dev
pnpm dlx storybook@latest init
```

## Benefits

- **Consistency**: Uniform package management across the project
- **Performance**: pnpm is faster and uses less disk space
- **Tree Shaking**: Proper imports enable better bundling optimization
- **Maintainability**: Organized imports are easier to understand and refactor
- **Type Safety**: Proper type imports and exports enhance TypeScript checking
- **Tool Compatibility**: `pnpm dlx` provides same functionality as `npx`

## Related Rules

- Follow safe testing patterns: Use `pnpm test:safe` instead of `pnpm test`
- Follow safe linting patterns: Use `pnpm lint:safe` instead of `pnpm lint`
- See `.cursor/rules/quality/safe-testing-linting.mdc` for detailed guidance
