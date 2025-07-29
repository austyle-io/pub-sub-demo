# Import Rules & Standards

## Lodash Usage

### Required Pattern
Always use individual lodash packages instead of the full lodash library:

```typescript
// ✅ CORRECT - Individual packages
import isNil from 'lodash.isnil';
import isObject from 'lodash.isobject';
import isString from 'lodash.isstring';
import isFunction from 'lodash.isfunction';
import isArray from 'lodash.isarray';

// ❌ INCORRECT - Full lodash
import { isNil, isObject, isString } from 'lodash';
import _ from 'lodash';
import isNil from 'lodash/isNil';
```

### Benefits
- **Tree-shaking**: Only includes the specific functions you need
- **Bundle size**: Smaller production bundles
- **Explicit dependencies**: Clear what lodash functions are used
- **Type safety**: Better TypeScript support with individual packages

### Package Installation
Each workspace should include only the individual lodash packages it uses:

```json
{
  "dependencies": {
    "lodash.isnil": "^4.0.0",
    "lodash.isobject": "^3.0.2",
    "lodash.isstring": "^4.0.1",
    "lodash.isfunction": "^3.0.9",
    "lodash.isarray": "^4.0.0"
  },
  "devDependencies": {
    "@types/lodash.isnil": "^4.0.9",
    "@types/lodash.isobject": "^3.0.5",
    "@types/lodash.isstring": "^4.0.4",
    "@types/lodash.isfunction": "^3.0.9",
    "@types/lodash.isarray": "^4.3.0"
  }
}
```

### Common Functions
The most commonly used lodash functions in this project:

- `lodash.isnil` - Check for null/undefined values
- `lodash.isobject` - Type guard for objects
- `lodash.isstring` - Type guard for strings
- `lodash.isfunction` - Type guard for functions
- `lodash.isarray` - Type guard for arrays

### Type Guards Integration
Individual lodash packages work perfectly with our runtime type guard patterns:

```typescript
import isNil from 'lodash.isnil';
import isString from 'lodash.isstring';

export const isValidUserId = (value: unknown): value is string => {
  return !isNil(value) && isString(value) && value.trim().length > 0;
};
```

## General Import Standards

### Ordering
1. Node.js built-ins
2. External packages (alphabetical)
3. Internal packages (workspace packages)
4. Local imports (relative paths)

### Examples
```typescript
// 1. Node.js built-ins
import { readFile } from 'fs/promises';
import path from 'path';

// 2. External packages
import express from 'express';
import isNil from 'lodash.isnil';
import { type Logger } from 'pino';

// 3. Internal packages
import { type Document } from '@collab-edit/shared';
import { createAppLogger } from '@collab-edit/shared/server';

// 4. Local imports
import { validateEnv } from '../config/env-validator';
import type { AuthenticatedRequest } from './websocket-auth';
```
