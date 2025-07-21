# Runtime Environment Detection

Rules for detecting and handling different runtime environments safely.

## Rules

- **ALWAYS check runtime environment** before accessing platform-specific APIs
- **USE early returns** for environment-specific code paths
- **PROVIDE fallbacks** for server-side rendering scenarios
- **NEVER assume browser APIs exist** without runtime checks
- **CACHE environment detection** to avoid repeated checks

## Core Patterns

### Environment Detection

```typescript
// ✅ GOOD - Proper environment detection
import { isClientSide, isServerSide, isWebWorker } from "@/lib/utils/global-utils";

const initializeFeature = () => {
    if (isClientSide()) {
        // Browser-specific code
        setupEventListeners();
        initializeLocalStorage();
    } else if (isServerSide()) {
        // Server-specific code
        setupServerFeatures();
    } else if (isWebWorker()) {
        // Worker-specific code
        setupWorkerFeatures();
    }
};

// ❌ BAD - No environment detection
const initializeFeature = () => {
    window.addEventListener("load", handler); // SSR crash!
    localStorage.setItem("key", "value"); // SSR crash!
};
```

### Early Return Pattern

```typescript
// ✅ GOOD - Early return for environment safety
const setupClientOnlyFeature = () => {
    if (!isClientSide()) {
        return; // Safe early return
    }

    // Browser-only code here
    const element = document.getElementById("app");
    element?.addEventListener("click", handleClick);
};

// ❌ BAD - Nested conditions
const setupClientOnlyFeature = () => {
    if (isClientSide()) {
        // Deep nesting makes code harder to read
        const element = document.getElementById("app");
        if (element) {
            element.addEventListener("click", handleClick);
        }
    }
};
```

### Conditional API Access

```typescript
// ✅ GOOD - Safe API access with fallbacks
const getDeviceInfo = () => {
    const defaultInfo = {
        userAgent: "Unknown",
        language: "en",
        platform: "unknown",
    };

    if (!isClientSide()) {
        return defaultInfo;
    }

    return {
        userAgent: navigator.userAgent ?? defaultInfo.userAgent,
        language: navigator.language ?? defaultInfo.language,
        platform: navigator.platform ?? defaultInfo.platform,
    };
};

// ❌ BAD - Direct API access
const getDeviceInfo = () => {
    return {
        userAgent: navigator.userAgent, // SSR crash!
        language: navigator.language, // SSR crash!
        platform: navigator.platform, // SSR crash!
    };
};
```

### React Component Safety

```typescript
// ✅ GOOD - Safe React component with environment checks
import { useEffect, useState } from "react";
import { isClientSide } from "@/lib/utils/global-utils";

const ClientOnlyComponent = () => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !isClientSide()) {
        return <div>Loading...</div>; // SSR-safe fallback
    }

    // Browser-only JSX here
    return (
        <div>
            <h1>Client-only content</h1>
            <button onClick={() => window.print()}>Print</button>
        </div>
    );
};

// ❌ BAD - No hydration safety
const UnsafeComponent = () => {
    return (
        <div>
            <h1>Content</h1>
            <button onClick={() => window.print()}>Print</button> {/* SSR crash! */}
        </div>
    );
};
```

### Storage Access Patterns

```typescript
// ✅ GOOD - Safe storage access
const getStoredValue = (key: string): string | null => {
    if (!isClientSide()) {
        return null; // No storage on server
    }

    try {
        return localStorage.getItem(key);
    } catch (error) {
        console.warn("Storage access failed:", error);
        return null;
    }
};

const setStoredValue = (key: string, value: string): boolean => {
    if (!isClientSide()) {
        return false; // Cannot store on server
    }

    try {
        localStorage.setItem(key, value);
        return true;
    } catch (error) {
        console.warn("Storage write failed:", error);
        return false;
    }
};

// ❌ BAD - Direct storage access
const getStoredValue = (key: string): string | null => {
    return localStorage.getItem(key); // SSR crash!
};
```

### Feature Detection

```typescript
// ✅ GOOD - Progressive feature detection
const hasFeatureSupport = (feature: string): boolean => {
    if (!isClientSide()) {
        return false; // Conservative fallback
    }

    switch (feature) {
        case "localStorage":
            return typeof Storage !== "undefined" && "localStorage" in window;
        case "geolocation":
            return "geolocation" in navigator;
        case "webgl":
            return Boolean(document.createElement("canvas").getContext("webgl"));
        default:
            return false;
    }
};

// ❌ BAD - Direct feature access
const hasLocalStorage = (): boolean => {
    return typeof localStorage !== "undefined"; // SSR crash!
};
```

## Testing Patterns

```typescript
// ✅ GOOD - Mock environment detection in tests
import { vi } from "vitest";
import * as globalUtils from "@/lib/utils/global-utils";

describe("Environment-dependent feature", () => {
    it("should handle client-side environment", () => {
        vi.mocked(globalUtils.isClientSide).mockReturnValue(true);

        const result = initializeClientFeature();
        expect(result).toBeDefined();
    });

    it("should handle server-side environment", () => {
        vi.mocked(globalUtils.isClientSide).mockReturnValue(false);

        const result = initializeClientFeature();
        expect(result).toBeUndefined(); // Safe fallback
    });
});
```

## Performance Considerations

```typescript
// ✅ GOOD - Cache environment detection
let clientSideCache: boolean | undefined;

const isClientSideCached = (): boolean => {
    if (clientSideCache === undefined) {
        clientSideCache = typeof window !== "undefined" && typeof document !== "undefined";
    }
    return clientSideCache;
};

// ❌ BAD - Repeated detection
const expensiveEnvironmentCheck = () => {
    // Checking environment in every call is wasteful
    if (typeof window !== "undefined") {
        // Do something
    }
    if (typeof window !== "undefined") {
        // Same check again
    }
};
```

## Error Boundaries

```typescript
// ✅ GOOD - Environment-aware error boundaries
const EnvironmentErrorBoundary = ({ children }: { children: ReactNode }) => {
    const [hasError, setHasError] = useState(false);

    if (hasError) {
        const errorMessage = isClientSide()
            ? "Client-side error occurred"
            : "Server-side error occurred";

        return <div>Error: {errorMessage}</div>;
    }

    return children;
};
```

## Anti-Patterns

```typescript
// ❌ BANNED - Unsafe global access
if (window.innerWidth > 768) {
    /* code */
} // SSR crash!

// ❌ BANNED - No fallback handling
const userAgent = navigator.userAgent; // SSR crash!

// ❌ BANNED - Assumption-based code
document.addEventListener("DOMContentLoaded", handler); // SSR crash!

// ❌ BANNED - Mixed environment code
const mixedFunction = () => {
    const serverData = process.env.SECRET; // Browser doesn't have process
    const clientData = window.location.href; // Server doesn't have window
};
```

## Benefits

- **SSR Compatibility**: Code works in all environments
- **Error Prevention**: Eliminates runtime crashes
- **Performance**: Cached environment detection
- **Testing**: Mockable environment conditions
- **Maintainability**: Clear environment boundaries
- **Progressive Enhancement**: Graceful degradation patterns

## Migration Checklist

When adding environment detection:

- [ ] Identify all browser API usage
- [ ] Add `isClientSide()` checks before browser APIs
- [ ] Provide server-side fallbacks
- [ ] Test both client and server environments
- [ ] Add error boundaries for environment-specific failures
- [ ] Cache environment detection for performance

## Reference

- `src/lib/utils/global-utils.ts` - Environment detection utilities
- `docs/03_development/global-types-best-practices.md` - Comprehensive guide
- `src/lib/components/ClientOnly.tsx` - Example client-only component
