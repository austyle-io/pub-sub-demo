# Custom GritQL Rules

## Overview

These custom GritQL rules enforce cursor-specific coding standards that aren't covered by Biome's built-in rules. All rules are functional in Biome v2.1.2+.

## Implemented Rules

### 1. no-react-fc.grit
Prevents usage of React.FC, FC, and FunctionComponent type annotations.

**Detects:**
- `React.FC` and `React.FunctionComponent`
- Direct `FC` and `FunctionComponent` usage
- Imports of FC/FunctionComponent from React

**Example violations:**
```typescript
// ❌ Bad
const MyComponent: React.FC = () => { };
const MyComponent: FC<Props> = () => { };
import { FC, FunctionComponent } from 'react';

// ✅ Good
type MyComponentProps = { name: string };
const MyComponent = ({ name }: MyComponentProps) => { };
```

### 2. no-react-namespace.grit
Enforces named imports instead of React namespace usage.

**Detects:**
- `React.useState()`, `React.useEffect()`, etc.
- `React.Fragment`, `React.StrictMode` in JSX
- All React hooks and utilities via namespace

**Example violations:**
```typescript
// ❌ Bad
const [state, setState] = React.useState(0);
React.useEffect(() => {}, []);
<React.Fragment>content</React.Fragment>

// ✅ Good
import { useState, useEffect, Fragment } from 'react';
const [state, setState] = useState(0);
useEffect(() => {}, []);
<Fragment>content</Fragment>
```

### 3. no-interface.grit
Enforces using `type` instead of `interface`.

**Example violations:**
```typescript
// ❌ Bad
interface User {
  name: string;
}

// ✅ Good
type User = {
  name: string;
};
```

### 4. no-switch-statements.grit
Prevents switch statements in favor of lookup objects.

**Example violations:**
```typescript
// ❌ Bad
switch (status) {
  case 'success': return 'green';
  case 'error': return 'red';
}

// ✅ Good
const STATUS_COLORS = {
  success: 'green',
  error: 'red',
} as const;
return STATUS_COLORS[status];
```

### 5. boolean-naming.grit
Enforces boolean naming conventions with proper prefixes.

**Example violations:**
```typescript
// ❌ Bad
const active = true;
const enabled: boolean = false;

// ✅ Good
const isActive = true;
const isEnabled: boolean = false;
const hasPermission = true;
const canEdit = false;
const shouldUpdate = true;
```

### 6. no-type-assertion.grit
Prevents double type assertions.

**Example violations:**
```typescript
// ❌ Bad
const value = data as unknown as string;
const item = response as any as User;

// ✅ Good
// Use proper type guards or Zod validation
if (isString(data)) {
  const value = data;
}
```

### 7. component-size-limit.grit
Warns about components that are too large.

**Triggers when:**
- Arrow function components exceed ~100 lines
- Regular function components exceed ~100 lines

### 8. require-type-guards.grit
Ensures `unknown` types are properly validated.

**Example violations:**
```typescript
// ❌ Bad
function process(data: unknown) {
  return data.toString();
}

// ✅ Good
function process(data: unknown) {
  if (typeof data === 'string') {
    return data.toString();
  }
  throw new Error('Invalid data type');
}
```

## Configuration

All rules are enabled in `biome.json`:

```json
{
  "plugins": [
    "./.biome/rules/no-react-fc.grit",
    "./.biome/rules/no-react-namespace.grit",
    "./.biome/rules/no-interface.grit",
    "./.biome/rules/no-switch-statements.grit",
    "./.biome/rules/boolean-naming.grit",
    "./.biome/rules/no-type-assertion.grit",
    "./.biome/rules/component-size-limit.grit",
    "./.biome/rules/require-type-guards.grit"
  ]
}
```

## Notes

- Rules report errors during `biome check` and `biome lint`
- Span highlighting may show "invalid span" warnings but rules still function
- Custom rules cannot be auto-fixed (limitation of current GritQL implementation)
