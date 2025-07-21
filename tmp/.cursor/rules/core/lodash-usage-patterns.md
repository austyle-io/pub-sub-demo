# Lodash Usage Patterns

**CRITICAL**: Always use lodash utilities over manual implementations for consistency, reliability, and maintainability.

## Rules

- **ALWAYS prefer lodash** over manual implementations when available
- **USE lodash-es** for better tree-shaking and smaller bundles
- **IMPORT specific functions** via named imports for optimal performance
- **APPLY consistent patterns** across the entire codebase
- **LEVERAGE lodash type checkers** for runtime validation
- **AVOID default imports** that prevent tree-shaking

## Core Philosophy: Lodash-First Approach

**Use lodash as much as possible while maintaining performance:**

1. **Handles edge cases**: null prototypes, Sets, Maps, TypedArrays, sparse arrays
2. **Consistent behavior**: Same API across different data types
3. **Better readability**: Intent is immediately clear
4. **Battle-tested**: Used by millions of developers, thoroughly tested
5. **Minimal overhead**: Tree-shaking keeps bundle impact under 2KB
6. **Type safety preserved**: Use lodash when it doesn't compromise TypeScript inference

_Reference: [DhiWise Guide](https://www.dhiwise.com/post/an-essential-guide-to-using-lodash-in-react-applications) and [Tree-shaking Best Practices](https://dev.to/pffigueiredo/making-lodash-tree-shakable-3h27)_

## Required Import Patterns

### ✅ GOOD - Named Imports for Tree-Shaking

```typescript
// Individual function imports (best for tree-shaking)
import { isNil, isEmpty, isString, isObject, isArray } from "lodash-es";
import { cloneDeep, merge, pick, omit, get, set } from "lodash-es";
import { groupBy, sortBy, uniq, compact, findIndex } from "lodash-es";

// Namespace import for multiple functions
import * as _ from "lodash-es";

const result = _.isEmpty(data) && _.isString(value);
```

### ❌ BAD - Default Imports (Prevent Tree-Shaking)

```typescript
// Default import brings entire library
import _ from "lodash"; // BAD - CommonJS, no tree-shaking
import lodash from "lodash-es"; // BAD - entire library imported
```

## Core Usage Patterns

### Null/Undefined Checks

```typescript
import { isNil, isEmpty } from "lodash-es";

// ✅ EXPLICIT - Use isNil() for clarity and edge case handling
if (isNil(state.map)) return;
if (isNil(mapRef.current)) return;
if (isEmpty(changes)) return;

// ❌ IMPLICIT - Ambiguous intention
if (!state.map) return; // BAD - unclear if checking null, undefined, or falsy
if (changes.length === 0) return; // BAD - only works for arrays
```

### Type Checking

```typescript
import { isString, isNumber, isArray, isObject, isFunction, isBoolean, has } from "lodash-es";

// ✅ EXPLICIT - Use lodash type checkers for consistency
const processValue = (value: unknown) => {
    if (isString(value)) return value.trim();
    if (isNumber(value)) return value.toString();
    if (isArray(value)) return value.join(",");
    if (isObject(value) && has(value, "toString")) return value.toString();
};

// ❌ IMPLICIT - Manual type checking (error-prone)
const processValue = (value: unknown) => {
    if (typeof value === "string") return value.trim(); // BAD - use isString()
    if (Array.isArray(value)) return value.join(","); // BAD - use isArray()
};
```

### Object Manipulation

```typescript
import { cloneDeep, merge, pick, omit, get, set } from "lodash-es";

// ✅ GOOD - Use lodash for reliable object operations
const updateUser = (user: User, updates: Partial<User>) => {
    return merge(cloneDeep(user), updates);
};

const safeUserData = (user: User) => {
    return omit(user, ["password", "ssn", "creditCard"]);
};

const userSummary = (user: User) => {
    return pick(user, ["id", "name", "email", "role"]);
};

// Safe nested property access
const userName = get(user, "profile.name", "Unknown");
const hasPreferences = has(user, "settings.preferences");

// ❌ BAD - Manual object manipulation (error-prone)
const updateUser = (user: User, updates: Partial<User>) => {
    return { ...user, ...updates }; // BAD - shallow copy only
};
```

### Collection Operations

```typescript
import { groupBy, sortBy, uniq, compact, findIndex, partition } from "lodash-es";

// ✅ GOOD - Use lodash for robust collection handling
const organizeUsers = (users: User[]) => {
    const uniqueUsers = uniq(users); // Handles object equality properly
    const activeUsers = compact(users.filter((u) => (u.isActive ? u : null)));
    const usersByRole = groupBy(activeUsers, "role");
    const sortedByName = sortBy(activeUsers, "name");

    return { usersByRole, sortedByName };
};

// Advanced collection operations
const [activeUsers, inactiveUsers] = partition(users, "isActive");
const userIndex = findIndex(users, { email: "admin@example.com" });

// ❌ BAD - Manual collection operations
const organizeUsers = (users: User[]) => {
    // BAD - manual unique filtering (doesn't handle object equality)
    const uniqueUsers = users.filter((user, index, arr) => arr.findIndex((u) => u.id === user.id) === index);
};
```

### String Manipulation

```typescript
import { camelCase, kebabCase, startCase, upperFirst, lowerCase } from "lodash-es";

// ✅ GOOD - Use lodash for consistent string transformations
const formatPropertyName = (rawName: string) => camelCase(rawName);
const formatDisplayName = (name: string) => startCase(name);
const formatCssClass = (className: string) => kebabCase(className);

// ❌ BAD - Manual string manipulation
const formatPropertyName = (rawName: string) => {
    // Complex manual camelCase implementation - use lodash instead
    return rawName
        .split("-")
        .map((word, i) => (i === 0 ? word.toLowerCase() : upperFirst(word.toLowerCase())))
        .join("");
};
```

### Performance-Critical Operations

```typescript
import { debounce, throttle, memoize } from "lodash-es";

// ✅ GOOD - Use lodash for performance optimizations
const debouncedSearch = debounce((query: string) => {
    performSearch(query);
}, 300);

const throttledScroll = throttle((event: Event) => {
    handleScroll(event);
}, 100);

const memoizedCalculation = memoize((data: ComplexData) => {
    return expensiveCalculation(data);
});
```

## React Integration Patterns

```typescript
import { isEqual, cloneDeep } from "lodash-es";
import { useMemo, useCallback } from "react";

// ✅ GOOD - Lodash with React hooks
const UserComponent = ({ users }: { users: User[] }) => {
    const sortedUsers = useMemo(() =>
        sortBy(users, ['role', 'name']), [users]
    );

    const handleUserUpdate = useCallback((userId: string, updates: Partial<User>) => {
        setUsers(prev => prev.map(user =>
            user.id === userId ? merge(cloneDeep(user), updates) : user
        ));
    }, []);

    // Deep equality comparison for complex props
    const memoizedComponent = useMemo(() => (
        <ComplexComponent data={complexData} />
    ), [complexData]); // Uses React's shallow comparison

    return (
        <div>
            {sortedUsers.map(user => (
                <UserCard
                    key={user.id}
                    user={user}
                    onUpdate={handleUserUpdate}
                />
            ))}
        </div>
    );
};
```

## Bundle Optimization

### ESLint Configuration

```javascript
// .eslintrc.js - Prevent default imports that bloat bundles
module.exports = {
    rules: {
        "no-restricted-syntax": [
            "error",
            {
                message: "Do not import default from lodash-es. Use named imports or namespace import (* as) instead.",
                selector: 'ImportDeclaration[source.value="lodash-es"] ImportDefaultSpecifier',
            },
            {
                message: "Use lodash-es instead of lodash for better tree-shaking.",
                selector: 'ImportDeclaration[source.value="lodash"]',
            },
        ],
    },
};
```

### Package.json Configuration

```json
{
    "dependencies": {
        "lodash-es": "^4.17.21"
    },
    "devDependencies": {
        "@types/lodash-es": "^4.17.12"
    }
}
```

## When NOT to Use Lodash

### Simple Native Equivalents

```typescript
// ✅ GOOD - Use native when it's simpler and equally clear
const simpleMap = array.map((item) => item.name);
const simpleFilter = array.filter((item) => item.active);
const simpleFind = array.find((item) => item.id === targetId);

// ❌ OVERKILL - Don't use lodash for trivial operations
import { map, filter, find } from "lodash-es";
const overengineered = map(array, "name"); // Native .map() is clearer here
```

### Performance-Critical Loops

```typescript
// ✅ GOOD - Native for performance-critical tight loops
for (let i = 0; i < largeArray.length; i++) {
    // High-performance iteration
    processItem(largeArray[i]);
}

// ✅ GOOD - Lodash for complex operations
const processedData = chain(largeArray)
    .groupBy("category")
    .mapValues((group) => sumBy(group, "value"))
    .value();
```

## Migration Guidelines

### From Manual to Lodash

1. **Identify manual implementations** that have lodash equivalents
2. **Replace type checking** with lodash type checkers (`isString`, `isObject`, etc.)
3. **Convert object operations** to use `get`, `set`, `pick`, `omit`, `merge`
4. **Update collection handling** with `groupBy`, `sortBy`, `uniq`, `compact`
5. **Test thoroughly** to ensure behavior remains consistent

### Example Migration

```typescript
// ❌ BEFORE - Manual implementation
const processUsers = (users: any[]) => {
    const validUsers = users.filter(
        (user) => user && typeof user === "object" && typeof user.name === "string" && typeof user.email === "string",
    );

    const grouped = {};
    validUsers.forEach((user) => {
        if (!grouped[user.role]) {
            grouped[user.role] = [];
        }
        grouped[user.role].push({
            id: user.id,
            name: user.name,
            email: user.email,
        });
    });

    return grouped;
};

// ✅ AFTER - Lodash-first approach
import { filter, groupBy, pick, isObject, isString, has } from "lodash-es";

const isValidUser = (user: unknown): user is User => {
    return (
        isObject(user) &&
        has(user, "name") &&
        has(user, "email") &&
        isString((user as any).name) &&
        isString((user as any).email)
    );
};

const processUsers = (users: unknown[]): Record<string, Partial<User>[]> => {
    const validUsers = filter(users, isValidUser);
    return groupBy(
        validUsers.map((user) => pick(user, ["id", "name", "email"])),
        "role",
    );
};
```

## Benefits

- **Consistency**: Uniform behavior across different data types and edge cases
- **Reliability**: Battle-tested functions handle edge cases you might miss
- **Readability**: Intent is immediately clear with descriptive function names
- **Performance**: Tree-shaking with lodash-es keeps bundle size minimal
- **Type Safety**: Works seamlessly with TypeScript inference
- **Maintainability**: Less custom code to debug and maintain
- **Team Velocity**: Developers don't need to reimplement common operations

_Based on insights from [modern lodash usage](https://dev.to/pffigueiredo/making-lodash-tree-shakable-3h27) and [React integration patterns](https://www.dhiwise.com/post/an-essential-guide-to-using-lodash-in-react-applications)_

## Reference Files

- `.cursor/rules/core/explicit-vs-implicit.mdc` - Detailed explicit vs implicit patterns
- `src/lib/utils/` - Existing lodash utility implementations
- Package.json dependencies and ESLint configuration
