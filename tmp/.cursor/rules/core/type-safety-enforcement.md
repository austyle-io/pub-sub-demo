# Type Safety Enforcement

Comprehensive rules for maintaining type safety across the codebase.

## Rules

- **ELIMINATE all `any` types** - use `unknown` or proper types
- **BAN double type assertions** - use type guards or Zod validation
- **REQUIRE runtime validation** at all data boundaries
- **USE satisfies operator** instead of duck typing
- **APPLY proper type guards** with runtime checks
- **DOCUMENT all type assertions** with clear justification

## Core Principles

### 1. Unknown Over Any

```typescript
// ✅ GOOD - Use unknown for external data
const processApiResponse = (data: unknown): ProcessedData => {
    if (!isValidApiResponse(data)) {
        throw new Error("Invalid API response");
    }
    return transformData(data);
};

// ❌ BAD - Any bypasses all type checking
const processApiResponse = (data: any): ProcessedData => {
    return transformData(data); // No validation!
};
```

### 2. Zod Validation at Boundaries

```typescript
// ✅ GOOD - Zod schema validation
import { z } from "zod";

const ApiResponseSchema = z.object({
    status: z.number(),
    data: z.array(
        z.object({
            id: z.string(),
            name: z.string(),
        }),
    ),
    meta: z.object({
        total: z.number(),
        page: z.number(),
    }),
});

type ApiResponse = z.infer<typeof ApiResponseSchema>;

const validateApiResponse = (data: unknown): ApiResponse | null => {
    const result = ApiResponseSchema.safeParse(data);
    return result.success ? result.data : null;
};

// ❌ BAD - No validation at boundary
const processApiData = (data: any) => {
    return data.data.map((item: any) => item.name); // Unsafe!
};
```

### 3. Type Guards with Runtime Checks

```typescript
// ✅ GOOD - Comprehensive type guard
import { isObject, isString, isNumber, isArray } from "lodash";

const isValidUser = (data: unknown): data is User => {
    return (
        isObject(data) &&
        !isArray(data) &&
        "id" in data &&
        "name" in data &&
        "email" in data &&
        isString((data as any).id) &&
        isString((data as any).name) &&
        isString((data as any).email) &&
        isValidEmail((data as any).email)
    );
};

// ❌ BAD - Minimal type checking
const isUser = (data: any): data is User => {
    return data && data.id && data.name; // Insufficient validation
};
```

### 4. Satisfies Over Duck Typing

```typescript
// ✅ GOOD - Use satisfies operator
const themeConfig = {
    colors: {
        primary: "#007acc",
        secondary: "#6c757d",
    },
    fonts: {
        body: "Inter, sans-serif",
        heading: "Inter, sans-serif",
    },
} satisfies ThemeConfig;

// ❌ BAD - Duck typing assignment
const themeConfig: ThemeConfig = {
    colors: {
        primary: "#007acc",
        secondary: "#6c757d",
    },
    fonts: {
        body: "Inter, sans-serif",
        heading: "Inter, sans-serif",
    },
}; // Loses literal types
```

### 5. Proper Error Handling

```typescript
// ✅ GOOD - Type-safe error handling
const fetchUserData = async (id: string): Promise<User | ApplicationError> => {
    try {
        const response = await fetch(`/api/users/${id}`);

        if (!response.ok) {
            return createError(ERROR_TYPE.NETWORK, `HTTP ${response.status}`, {
                code: `HTTP_${response.status}`,
                context: { userId: id },
            });
        }

        const data = await response.json();
        const validatedUser = validateUser(data);

        if (!validatedUser) {
            return createError(ERROR_TYPE.VALIDATION, "Invalid user data", {
                context: { userId: id, receivedData: data },
            });
        }

        return validatedUser;
    } catch (error) {
        return createError(ERROR_TYPE.UNKNOWN, "Fetch failed", {
            context: { userId: id, originalError: error },
        });
    }
};

// ❌ BAD - Untyped error handling
const fetchUserData = async (id: string): Promise<any> => {
    const response = await fetch(`/api/users/${id}`);
    return response.json(); // No validation, no error handling
};
```

## Advanced Type Safety Patterns

### Generic Type Safety

```typescript
// ✅ GOOD - Generic type safety with constraints
const createValidator = <T>(schema: z.ZodSchema<T>) => {
    return (data: unknown): data is T => {
        return schema.safeParse(data).success;
    };
};

const isValidUser = createValidator(UserSchema);
const isValidConfig = createValidator(ConfigSchema);

// Usage with full type safety
const processData = <T>(data: unknown, validator: (data: unknown) => data is T): T | null => {
    return validator(data) ? data : null;
};
```

### Branded Types

```typescript
// ✅ GOOD - Branded types for IDs
type UserId = string & { readonly brand: unique symbol };
type ProjectId = string & { readonly brand: unique symbol };

const createUserId = (id: string): UserId => {
    if (!isValidId(id)) {
        throw new Error("Invalid user ID format");
    }
    return id as UserId;
};

const getUserById = (id: UserId): Promise<User> => {
    // Type-safe ID usage
    return fetchUser(id);
};

// ❌ BAD - Plain strings for different ID types
const getUserById = (id: string): Promise<User> => {
    return fetchUser(id); // Could be any string!
};
```

### Conditional Types

```typescript
// ✅ GOOD - Conditional types for API responses
type ApiResult<T> = { success: true; data: T } | { success: false; error: string };

const createApiResult = <T>(data: T | null, error?: string): ApiResult<T> => {
    if (data !== null && !error) {
        return { success: true, data };
    }
    return { success: false, error: error ?? "Unknown error" };
};

// Type-safe usage
const handleApiResult = <T>(result: ApiResult<T>): T | null => {
    if (result.success) {
        return result.data; // TypeScript knows this exists
    }
    console.error(result.error); // TypeScript knows this exists
    return null;
};
```

## Testing Type Safety

```typescript
// ✅ GOOD - Type-safe test utilities
const createMockUser = (overrides: Partial<User> = {}): User => {
    return {
        id: "test-user-id",
        name: "Test User",
        email: "test@example.com",
        role: "user",
        createdAt: "2025-01-01T00:00:00Z",
        ...overrides,
    };
};

// Type-safe mock with validation
const createValidatedMockUser = (overrides: Partial<User> = {}): User => {
    const user = createMockUser(overrides);
    const result = UserSchema.safeParse(user);

    if (!result.success) {
        throw new Error(`Invalid mock user: ${result.error.message}`);
    }

    return result.data;
};
```

## Performance Considerations

```typescript
// ✅ GOOD - Cached type guards
const createCachedValidator = <T>(schema: z.ZodSchema<T>) => {
    const cache = new WeakMap<object, boolean>();

    return (data: unknown): data is T => {
        if (typeof data === "object" && data !== null) {
            if (cache.has(data)) {
                return cache.get(data)!;
            }
        }

        const isValid = schema.safeParse(data).success;

        if (typeof data === "object" && data !== null) {
            cache.set(data, isValid);
        }

        return isValid;
    };
};
```

## Recent Achievements

**✅ Type Coverage**: Maintained 97.89% (62,881/64,232 expressions)
**✅ Double Assertions**: Eliminated all `as unknown as T` patterns
**✅ Global Safety**: Fixed all unsafe navigator/window access
**✅ Duck Typing**: Converted to satisfies operator patterns
**✅ Validation**: Comprehensive Zod schemas at all boundaries

## Migration Guide

1. **Identify `any` types** → Replace with `unknown` + type guards
2. **Find double assertions** → Replace with Zod validation
3. **Locate duck typing** → Convert to `satisfies` operator
4. **Add boundary validation** → Use Zod schemas at API boundaries
5. **Test thoroughly** → Ensure type safety doesn't break functionality

## Reference Files

- `src/lib/config/global-constants.ts` - Type-safe global constants
- `src/lib/utils/global-utils.ts` - Runtime type validation utilities
- `src/types/global.d.ts` - Global type declarations
- `docs/03_development/type-safety-improvements-summary.md` - Complete audit
