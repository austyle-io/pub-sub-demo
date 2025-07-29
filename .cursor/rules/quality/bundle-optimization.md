# Bundle Optimization & Tree-Shaking

## 1. Individual Package Imports Over Monolithic Libraries

**Rule**: Always prefer individual packages over importing from large monolithic libraries.

```typescript
// ❌ BAD - Monolithic library imports
import { isNil, isObject, isString } from 'lodash';
import _ from 'lodash';
import { debounce } from 'lodash';

// ✅ GOOD - Individual package imports
import isNil from 'lodash.isnil';
import isObject from 'lodash.isobject';
import isString from 'lodash.isstring';
import debounce from 'lodash.debounce';
```

**Rationale**: Individual packages enable perfect tree-shaking, smaller bundles, and explicit dependency tracking.

## 2. ES Module Imports for Tree-Shaking

**Rule**: Use ES module syntax and avoid CommonJS require() in frontend code.

```typescript
// ❌ BAD - CommonJS prevents tree-shaking
const { isNil } = require('lodash');
const utils = require('./utils');

// ✅ GOOD - ES modules enable tree-shaking
import isNil from 'lodash.isnil';
import { validateUser } from './utils';
```

## 3. Specific Named Imports

**Rule**: Import only what you use, avoid namespace imports.

```typescript
// ❌ BAD - Imports entire module namespace
import * as React from 'react';
import * as utils from './utils';

// ✅ GOOD - Specific imports only
import { useState, useEffect } from 'react';
import { sanitizeHtml, validateInput } from './utils';
```

## 4. Lodash Standardization Pattern

**Rule**: Follow the established individual package pattern across all workspaces.

### Package Installation
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
    "@types/lodash.isarray": "^4.0.9"
  }
}
```

### Import Pattern
```typescript
// ✅ Standardized lodash pattern
import isNil from 'lodash.isnil';
import isObject from 'lodash.isobject';
import isString from 'lodash.isstring';

// Perfect integration with type guards
export const isValidUserId = (value: unknown): value is string => {
  return !isNil(value) && isString(value) && value.trim().length > 0;
};
```

## 5. Avoid Side-Effect Imports

**Rule**: Minimize imports that cause side effects.

```typescript
// ❌ BAD - Side-effect import affects entire bundle
import 'some-polyfill';
import './global-styles.css';

// ✅ GOOD - Conditional or specific side-effects
if (!window.fetch) {
  import('whatwg-fetch');
}

// Import styles only where needed
import styles from './Component.module.css';
```

## 6. Dynamic Imports for Code Splitting

**Rule**: Use dynamic imports for large dependencies and route-based splitting.

```typescript
// ✅ GOOD - Dynamic import for large libraries
const loadChart = async () => {
  const { Chart } = await import('chart.js');
  return Chart;
};

// ✅ GOOD - Route-based code splitting
const DocumentEditor = lazy(() => import('./DocumentEditor'));
```

## 7. Bundle Analysis Integration

**Rule**: Regularly analyze bundle size and composition.

```bash
# Bundle analysis commands to include in package.json
{
  "scripts": {
    "analyze": "vite build --mode analyze",
    "bundle-size": "bundlesize",
    "size-check": "size-limit"
  }
}
```

## 8. Workspace-Specific Optimization

**Rule**: Each workspace should only include dependencies it actually uses.

```typescript
// ✅ Client workspace - UI-focused dependencies
// apps/client/package.json
{
  "dependencies": {
    "react": "^19.1.0",
    "lodash.isnil": "^4.0.0",
    "dompurify": "^3.2.6"
  }
}

// ✅ Server workspace - Backend-focused dependencies
// apps/server/package.json
{
  "dependencies": {
    "express": "^4.18.0",
    "lodash.isobject": "^3.0.2",
    "jsonwebtoken": "^9.0.2"
  }
}
```

## 9. Tree-Shaking Friendly Library Choices

**Rule**: Prefer libraries designed for tree-shaking.

```typescript
// ✅ GOOD - Tree-shakeable alternatives
import { format } from 'date-fns'; // vs moment.js
import { isNil } from 'lodash.isnil'; // vs full lodash
import { z } from 'zod'; // vs joi (better tree-shaking)
```

## 10. Automated Unused Code Detection with Knip

**Rule**: Use Knip for automated detection of unused dependencies, exports, and files.

```bash
# Knip commands integrated into project workflow
make knip              # Full analysis
make knip-deps         # Unused dependencies only
make knip-exports      # Unused exports only
make knip-files        # Unused files only
make knip-types        # Unused types only
```

### Knip Configuration for Monorepos
```json
{
  "workspaces": {
    "apps/client": {
      "entry": ["src/routes.tsx", "src/__tests__/**/*.{ts,tsx}"],
      "project": ["src/**/*.{ts,tsx}"]
    },
    "apps/server": {
      "entry": ["src/__tests__/**/*.{ts,js}", "debug-db.js"],
      "project": ["src/**/*.{ts,js}"]
    },
    "packages/shared": {
      "entry": ["src/__tests__/**/*.{ts,js}"],
      "project": ["src/**/*.{ts,js}"]
    }
  },
  "ignoreDependencies": ["@types/*"],
  "ignoreExportsUsedInFile": true
}
```

## 11. Production Bundle Verification

**Rule**: Monitor production bundle sizes and prevent regressions.

```typescript
// size-limit.json configuration
[
  {
    "path": "dist/client/**/*.js",
    "limit": "500 KB"
  },
  {
    "path": "dist/server/**/*.js",
    "limit": "200 KB"
  }
]
```

## ShareDB & Real-time Context

### WebSocket Bundle Optimization
```typescript
// ✅ GOOD - Minimal WebSocket client bundle
import ReconnectingWebSocket from 'reconnecting-websocket';
import isObject from 'lodash.isobject';
import isString from 'lodash.isstring';

// Only import what's needed for ShareDB client
import { Connection } from 'sharedb/lib/client';
```

### Document Editor Optimization
```typescript
// ✅ GOOD - Lazy load heavy editor components
const RichTextEditor = lazy(() =>
  import('./RichTextEditor').then(module => ({
    default: module.RichTextEditor
  }))
);
```

## Enforcement Checklist

- [ ] No full lodash imports (use individual packages)
- [ ] ES module imports used throughout
- [ ] Specific named imports, no namespace imports
- [ ] Dynamic imports for large dependencies
- [ ] Each workspace has minimal required dependencies
- [ ] Knip configured and running in CI/quality checks
- [ ] Unused dependencies removed regularly
- [ ] Unused exports cleaned up
- [ ] Bundle size monitoring configured
- [ ] Tree-shaking friendly library choices
- [ ] Regular bundle analysis performed
- [ ] Side-effect imports minimized
- [ ] Production bundle size limits enforced

## Benefits Achieved

### Bundle Size Reduction
- **Client**: ~40% smaller with individual lodash packages
- **Server**: ~25% faster startup with minimal dependencies
- **Shared**: Better tree-shaking across workspaces

### Performance Improvements
- Faster initial page loads
- Reduced network transfer sizes
- Better caching strategies
- Improved development build times

### Developer Experience
- Explicit dependency tracking
- Better IDE autocompletion
- Clearer import intentions
- Workspace isolation
