# Global Types Safety

Rules for safe global variable access and cross-platform compatibility.

## Rules

- **NEVER access `window`, `navigator`, `document` directly** - use our global utilities
- **ALWAYS use runtime environment detection** before accessing platform-specific APIs
- **USE centralized global constants** from `src/lib/config/global-constants.ts`
- **APPLY proper type guards** for global variable access
- **ENSURE SSR compatibility** with runtime checks

## Required Patterns

### Safe Global Access

```typescript
// ✅ GOOD - Use our global utilities
import { isClientSide, getGlobalVariable } from "@/lib/utils/global-utils";
import { GLOBAL_KEYS } from "@/lib/config/global-constants";

const getUserAgent = (): string => {
    if (!isClientSide()) {
        return "Unknown (Server)";
    }

    return getGlobalVariable(GLOBAL_KEYS.NAVIGATOR_USER_AGENT) ?? "Unknown";
};

// ❌ BAD - Direct global access
const getUserAgent = (): string => {
    return navigator.userAgent; // Crashes in SSR!
};
```

### Runtime Environment Detection

```typescript
// ✅ GOOD - Safe environment detection
import { isClientSide, isServerSide } from "@/lib/utils/global-utils";

const initializeClientFeature = () => {
    if (!isClientSide()) {
        return; // Early return for SSR
    }

    // Safe to use browser APIs here
    const element = document.getElementById("app");
    element?.focus();
};

// ❌ BAD - No runtime checks
const initializeClientFeature = () => {
    const element = document.getElementById("app"); // SSR crash!
    element.focus();
};
```

### Global Variable Types

```typescript
// ✅ GOOD - Type-safe global access with our utilities
import { getGlobalVariable, setGlobalVariable } from "@/lib/utils/global-utils";
import { GLOBAL_KEYS } from "@/lib/config/global-constants";

const getAppConfig = (): AppConfig | null => {
    const config = getGlobalVariable<AppConfig>(GLOBAL_KEYS.APP_CONFIG);
    return config ?? null;
};

const setAppConfig = (config: AppConfig): void => {
    setGlobalVariable(GLOBAL_KEYS.APP_CONFIG, config);
};

// ❌ BAD - Direct global access without types
const getAppConfig = (): any => {
    return (window as any).APP_CONFIG; // Unsafe!
};
```

### Cross-Platform Compatibility

```typescript
// ✅ GOOD - Cross-platform global access
import { isClientSide, isServerSide, isWebWorker, getGlobalVariable } from "@/lib/utils/global-utils";

const getEnvironmentInfo = () => {
    const info = {
        platform: "unknown",
        userAgent: "Unknown",
        language: "en",
    };

    if (isClientSide()) {
        info.platform = "browser";
        info.userAgent = getGlobalVariable("navigator.userAgent") ?? "Unknown";
        info.language = getGlobalVariable("navigator.language") ?? "en";
    } else if (isServerSide()) {
        info.platform = "server";
        info.userAgent = "Node.js";
    } else if (isWebWorker()) {
        info.platform = "worker";
    }

    return info;
};
```

## Forbidden Patterns

```typescript
// ❌ BANNED - Direct global access
const checkFeatureSupport = () => {
    return window.localStorage !== undefined; // SSR crash!
};

// ❌ BANNED - Unsafe type casting
const getConfig = () => {
    return (window as any).CONFIG; // No type safety!
};

// ❌ BANNED - No environment checks
const initializeApp = () => {
    document.addEventListener("DOMContentLoaded", handler); // SSR crash!
};

// ❌ BANNED - Hardcoded global keys
const saveUserData = (data: User) => {
    (window as any).CURRENT_USER = data; // Not centralized!
};
```

## Global Constants Usage

```typescript
// ✅ GOOD - Use centralized constants
import { GLOBAL_KEYS } from "@/lib/config/global-constants";

const appKeys = {
    currentUser: GLOBAL_KEYS.CURRENT_USER,
    theme: GLOBAL_KEYS.APP_THEME,
    config: GLOBAL_KEYS.APP_CONFIG,
};

// ❌ BAD - String literals scattered throughout code
const saveUser = (user: User) => {
    setGlobalVariable("currentUser", user); // Should use GLOBAL_KEYS.CURRENT_USER
};
```

## Testing Patterns

```typescript
// ✅ GOOD - Mock global utilities in tests
import { vi } from "vitest";
import * as globalUtils from "@/lib/utils/global-utils";

vi.mock("@/lib/utils/global-utils", () => ({
    isClientSide: vi.fn(() => true),
    getGlobalVariable: vi.fn(),
    setGlobalVariable: vi.fn(),
}));

// Test with controlled environment
it("should handle client-side features", () => {
    vi.mocked(globalUtils.isClientSide).mockReturnValue(true);
    vi.mocked(globalUtils.getGlobalVariable).mockReturnValue("test-value");

    const result = getFeatureData();
    expect(result).toBe("test-value");
});
```

## Benefits

- **SSR Compatibility**: Prevents server-side crashes
- **Type Safety**: Proper typing for all global access
- **Cross-Platform**: Works in browser, Node.js, and Web Workers
- **Maintainability**: Centralized global variable management
- **Testing**: Easy to mock and test global dependencies
- **Performance**: Efficient runtime detection with caching

## Migration Guide

When migrating existing code:

1. **Replace direct `window` access** with `getGlobalVariable()`
2. **Add runtime environment checks** using `isClientSide()`
3. **Use centralized constants** from `GLOBAL_KEYS`
4. **Add proper type annotations** for global variables
5. **Test SSR compatibility** with both client and server environments

## Reference Files

- `src/lib/config/global-constants.ts` - Centralized global variable keys
- `src/lib/utils/global-utils.ts` - Safe global access utilities
- `src/types/global.d.ts` - Global type declarations
- `docs/03_development/global-types-best-practices.md` - Comprehensive guide
