# TypeScript Best Practices & Type Safety Rules

## 1. Nullish Coalescing Over Logical OR

**Rule**: Always use `??` instead of `||` for default values.

```ts
// ❌ Bad - overrides falsy values like 0, false, ''
const count = userInput || 10;
const enabled = settings.feature || true;

// ✅ Good - only overrides null/undefined
const count = userInput ?? 10;
const enabled = settings.feature ?? true;
```

**Rationale**: `??` preserves legitimate falsy values (0, false, '') while only falling back on actual absence (null/undefined).

## 2. Optional Chaining Over Manual Guards

**Rule**: Use `?.` instead of manual null/undefined checks.

```ts
// ❌ Bad - verbose and error-prone
if (user && user.profile && user.profile.settings) {
  const theme = user.profile.settings.theme;
}
const name = obj && obj.user && obj.user.name;

// ✅ Good - concise and safe
const theme = user?.profile?.settings?.theme;
const name = obj?.user?.name;
```

**Rationale**: Optional chaining is more concise, less error-prone, and handles intermediate nulls gracefully.

## 3. Lodash Type Guards for Clarity

**Rule**: Use Lodash helpers for type checking and nil detection.

```ts
// ❌ Bad - manual type checking
if (value !== null && value !== undefined) { }
if (typeof obj === 'object' && obj !== null) { }
if (typeof fn === 'function') { }

// ✅ Good - clear intent with Lodash
import { isNil, isObject, isFunction } from 'lodash';

if (!isNil(value)) { }
if (isObject(obj)) { }
if (isFunction(fn)) { }
```

**Rationale**: Lodash helpers are more readable, handle edge cases better, and express intent clearly.

## 4. Strict Typing - No Loose Constructs

### 4.1 Prefer `type` over `interface`

```ts
// ❌ Bad
interface User {
  id: string;
  name: string;
}

// ✅ Good
type User = {
  id: string;
  name: string;
};
```

### 4.2 Avoid `any` - use `unknown`

```ts
// ❌ Bad
function process(data: any) {
  return data.someProperty;
}

// ✅ Good
function process(data: unknown) {
  if (isUser(data)) {
    return data.name; // type-safe after guard
  }
  throw new Error('Invalid data');
}
```

### 4.3 Use `satisfies` instead of `as`

```ts
// ❌ Bad - unsafe casting
const config = {
  host: 'localhost',
  port: 8080,
} as ServerConfig;

// ✅ Good - structural validation
const config = {
  host: 'localhost',
  port: 8080,
} satisfies ServerConfig;
```

## 5. Runtime Type Guards for External Data

**Rule**: Always validate external/unknown data with type guards.

```ts
// Type guard pattern
function isUser(obj: unknown): obj is User {
  return (
    isObject(obj) &&
    'id' in obj && typeof (obj as any).id === 'string' &&
    'name' in obj && typeof (obj as any).name === 'string'
  );
}

// Usage with external data
const response = await fetch('/api/user');
const data = await response.json();

if (!isUser(data)) {
  throw new Error('Invalid user data from API');
}
// data is now typed as User
console.log(data.name); // type-safe
```

### 5.1 Discriminated Union Guards

```ts
type Result =
  | { status: 'success'; data: string }
  | { status: 'error'; message: string };

function isSuccessResult(result: unknown): result is { status: 'success'; data: string } {
  return (
    isObject(result) &&
    'status' in result &&
    result.status === 'success' &&
    'data' in result &&
    typeof (result as any).data === 'string'
  );
}
```

### 5.2 Array Type Guards

```ts
function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
}

function isUserArray(value: unknown): value is User[] {
  return Array.isArray(value) && value.every(isUser);
}
```

## 6. Common Patterns to Avoid

### 6.1 Unsafe Object Access

```ts
// ❌ Bad - no validation
const user = JSON.parse(userJson);
console.log(user.name); // runtime error if user.name doesn't exist

// ✅ Good - validated access
const parsed = JSON.parse(userJson);
if (!isUser(parsed)) {
  throw new Error('Invalid user JSON');
}
console.log(parsed.name); // type-safe
```

### 6.2 Unsafe API Responses

```ts
// ❌ Bad - assuming response shape
async function getUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  return response.json(); // dangerous assumption
}

// ✅ Good - validated response
async function getUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  const data = await response.json();

  if (!isUser(data)) {
    throw new Error('Invalid user data from API');
  }

  return data; // type-safe User
}
```

## 7. Edge Case Handling

### 7.1 Preserve Legitimate Falsy Values

```ts
// ❌ Bad - loses valid 0 values
const count = input || 1; // 0 becomes 1

// ✅ Good - preserves 0
const count = input ?? 1; // only null/undefined becomes 1
```

### 7.2 Safe Property Access

```ts
// ❌ Bad - can throw if obj is null
const value = obj.prop?.nested;

// ✅ Good - fully safe chain
const value = obj?.prop?.nested;
```

## 8. Import Patterns

**Rule**: Use specific imports for tree-shaking and clarity.

```ts
// ❌ Bad - imports entire library
import _ from 'lodash';
if (_.isNil(value)) { }

// ✅ Good - specific imports
import { isNil, isObject, isString } from 'lodash';
if (isNil(value)) { }
```

## 9. Error Handling with Type Guards

```ts
// ✅ Good pattern for error boundaries
function handleApiError(error: unknown): string {
  if (isObject(error) && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unknown error occurred';
}
```

## 10. Memory and Performance Considerations

**Rule**: Type guards should be efficient and reusable.

```ts
// ✅ Good - memoize expensive guards if needed
const isComplexObject = memoize((obj: unknown): obj is ComplexType => {
  // expensive validation logic
  return isObject(obj) && /* ... complex checks ... */;
});
```

## Enforcement Checklist

When reviewing code, verify:

- [ ] No usage of `||` for defaults (use `??`)
- [ ] No manual null checks (use `?.`)
- [ ] External data has type guards
- [ ] No `any` types (use `unknown` + guards)
- [ ] No unsafe `as` casts (use `satisfies`)
- [ ] Lodash helpers used for type checking
- [ ] Array elements validated in array guards
- [ ] Error handling uses type guards
- [ ] Imports are specific, not wildcard
