# Map Module Comprehensive Testing Plan

## Overview

Systematic plan to test all TypeScript files in the `src/lib/modules/map/` directory, following established patterns from existing tests and cursor rules.

## Testing Architecture

### Framework Stack

- **Vitest**: Test runner and assertions
- **React Testing Library**: Component testing with accessibility focus
- **MSW (Mock Service Worker)**: API mocking
- **MapLibre GL Mocks**: WebGL-free map testing

### Testing Principles

- **Behavior over Implementation**: Test public APIs and user interactions
- **Accessibility First**: Use `getByRole`, `getByLabelText` over `getByTestId`
- **Integration Focus**: Test component interactions and data flow
- **Edge Case Coverage**: Handle error states, loading states, invalid inputs

## File Inventory & Test Status

### ✅ **Already Tested** (3 files)

- `utils/sync-utils.test.ts` ✅ (648 lines)
- `utils/type-guards.test.ts` ✅ (227 lines)
- `services/WidgetRegistry.test.ts` ✅ (412 lines)

### 🔴 **Critical Priority** (4 files)

**Need tests immediately - core functionality**

1. **`components/MapComponent.tsx`** (249 lines)

    - Main React component
    - Map initialization and lifecycle
    - Event handling and interactions

2. **`stores/MapStore.tsx`** (836 lines)

    - Central state management
    - Store provider patterns
    - State synchronization

3. **`services/ErrorRecovery.ts`** (331 lines)

    - Error handling and recovery
    - Graceful degradation
    - User experience during failures

4. **`services/PerformanceOptimizer.ts`** (477 lines)
    - Performance monitoring
    - Optimization strategies
    - Resource management

### 🟡 **Medium Priority** (6 files)

**Important functionality, moderate complexity**

5. **`services/Logger.ts`** (150 lines)

    - Structured logging
    - Log level management
    - Context propagation

6. **`constants/errors.ts`** (106 lines)

    - Error constants and types
    - Error message patterns

7. **`constants/events.ts`** (129 lines)

    - Event type definitions
    - Event payload structures

8. **`constants/defaults.ts`** (42 lines)

    - Default configurations
    - Fallback values

9. **`constants/map-core.ts`** (70 lines)

    - Core map constants
    - MapLibre configurations

10. **`constants/ui.ts`** (48 lines)
    - UI-related constants
    - Theme and styling defaults

### 🟢 **Low Priority** (8 files)

**Simple constants and configurations**

11. **`constants/performance.ts`** (43 lines)
12. **`constants/store.ts`** (22 lines)
13. **`constants/sync.ts`** (19 lines)
14. **`types/core-types.ts`** (61 lines)
15. **`types/source-types.ts`** (154 lines)
16. **`types/layer-types.ts`** (67 lines)
17. **`types/state-types.ts`** (47 lines)
18. **`types/store-types.ts`** (172 lines)
19. **`types/widget-types.ts`** (101 lines)
20. **`types/error-types.ts`** (52 lines)
21. **`types/event-types.ts`** (178 lines)

## Implementation Plan

### Phase 1: Critical Components (Week 1)

Focus on core functionality that affects user experience.

#### 1.1 MapComponent.tsx Test

```typescript
// src/lib/modules/map/components/MapComponent.test.tsx
/**
 * @fileoverview Tests for MapComponent
 *
 * Tests map initialization, lifecycle, event handling, and error states.
 * Uses MapLibre GL mocks to avoid WebGL dependencies.
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MapComponent } from './MapComponent';

describe('MapComponent', () => {
  it('should render map container with accessible landmarks', () => {
    render(<MapComponent />);

    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByLabelText(/map/i)).toBeInTheDocument();
  });

  it('should handle map initialization errors gracefully', async () => {
    // Mock map initialization failure
    vi.mocked(Map).mockImplementationOnce(() => {
      throw new Error('WebGL not supported');
    });

    render(<MapComponent />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/map failed to load/i)).toBeInTheDocument();
    });
  });

  it('should support keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<MapComponent />);

    const mapContainer = screen.getByRole('main');
    await user.tab();
    expect(mapContainer).toHaveFocus();

    // Test arrow key navigation
    await user.keyboard('{ArrowUp}');
    // Verify map pan was called
  });
});
```

#### 1.2 MapStore.tsx Test

```typescript
// src/lib/modules/map/stores/MapStore.test.tsx
/**
 * @fileoverview Tests for MapStore
 *
 * Tests state management, provider patterns, and store synchronization.
 * Focuses on public behavior and integration patterns.
 */

import { renderHook, act } from '@testing-library/react';
import { MapStoreProvider, useMapStore } from './MapStore';

const renderWithProvider = (ui: ReactElement) => {
  return render(
    <MapStoreProvider>
      {ui}
    </MapStoreProvider>
  );
};

describe('MapStore', () => {
  it('should provide store context to consumers', () => {
    const { result } = renderHook(() => useMapStore(), {
      wrapper: MapStoreProvider,
    });

    expect(result.current).toBeDefined();
    expect(typeof result.current.subscribe).toBe('function');
  });

  it('should throw error when used outside provider', () => {
    expect(() => {
      renderHook(() => useMapStore());
    }).toThrow('useMapStore must be used within MapStoreProvider');
  });

  it('should handle state updates correctly', () => {
    const { result } = renderHook(() => useMapStore(), {
      wrapper: MapStoreProvider,
    });

    act(() => {
      result.current.send({
        type: 'SET_CONFIG',
        config: { center: [0, 0], zoom: 10 }
      });
    });

    expect(result.current.getSnapshot().config).toEqual({
      center: [0, 0],
      zoom: 10
    });
  });
});
```

#### 1.3 ErrorRecovery.ts Test

```typescript
// src/lib/modules/map/services/ErrorRecovery.test.ts
/**
 * @fileoverview Tests for ErrorRecovery service
 *
 * Tests error handling, recovery strategies, and graceful degradation.
 */

import { ErrorRecovery } from "./ErrorRecovery";
import { mapLogger } from "./Logger";

vi.mock("./Logger");

describe("ErrorRecovery", () => {
    let errorRecovery: ErrorRecovery;

    beforeEach(() => {
        errorRecovery = new ErrorRecovery();
        vi.clearAllMocks();
    });

    it("should handle network errors with retry strategy", async () => {
        const networkError = new Error("Network failed");

        const result = await errorRecovery.handleError(networkError, {
            strategy: "retry",
            maxRetries: 3,
        });

        expect(result.recovered).toBe(true);
        expect(result.retryCount).toBeGreaterThan(0);
    });

    it("should fallback to offline mode for persistent failures", async () => {
        const persistentError = new Error("Service unavailable");

        const result = await errorRecovery.handleError(persistentError, {
            strategy: "fallback",
            fallbackMode: "offline",
        });

        expect(result.fallbackActive).toBe(true);
        expect(mapLogger.warn).toHaveBeenCalledWith(expect.stringContaining("fallback mode"));
    });
});
```

### Phase 2: Services & Constants (Week 2)

#### 2.1 Service Tests

- **Logger.ts**: Test structured logging, context propagation
- **PerformanceOptimizer.ts**: Test monitoring, optimization triggers

#### 2.2 Constants Tests

- **errors.ts**: Test error constant definitions and lookup patterns
- **events.ts**: Test event type validation and payload structures
- **defaults.ts**: Test default value consistency

### Phase 3: Types & Low Priority (Week 3)

#### 3.1 Type Validation Tests

Focus on runtime type checking and Zod schema validation:

```typescript
// Example: types/core-types.test.ts
import { describe, expect, it } from "vitest";
import { MapConfigSchema } from "./core-types";

describe("core-types", () => {
    it("should validate MapConfig schema correctly", () => {
        const validConfig = {
            center: [0, 0],
            zoom: 10,
            sources: [],
            layers: [],
        };

        const result = MapConfigSchema.safeParse(validConfig);
        expect(result.success).toBe(true);
    });

    it("should reject invalid MapConfig", () => {
        const invalidConfig = {
            center: "invalid", // Should be [number, number]
            zoom: -1, // Should be positive
        };

        const result = MapConfigSchema.safeParse(invalidConfig);
        expect(result.success).toBe(false);
    });
});
```

## Test Infrastructure

### Custom Render Utilities

```typescript
// test/utils/map-test-utils.tsx
import { render } from '@testing-library/react';
import { MapStoreProvider } from '@/lib/modules/map/stores/MapStore';
import { LoggerProvider } from '@/lib/providers/LoggerProvider';

export const renderWithProviders = (ui: ReactElement) => {
  return render(
    <LoggerProvider module="test">
      <MapStoreProvider>
        {ui}
      </MapStoreProvider>
    </LoggerProvider>
  );
};
```

### MapLibre GL Mock Extensions

```typescript
// test/mocks/maplibre-extended.ts
export const createMockMap = () => ({
    ...vi.mocked(Map).mockImplementation(),
    // Additional map-specific mocks
    getStyle: vi.fn(() => ({ sources: {}, layers: [] })),
    setStyle: vi.fn(),
    addSource: vi.fn(),
    removeSource: vi.fn(),
    addLayer: vi.fn(),
    removeLayer: vi.fn(),
});
```

## Coverage Targets

### Critical Components: 90%+ Coverage

- MapComponent.tsx
- MapStore.tsx
- ErrorRecovery.ts

### Services: 85%+ Coverage

- All service files
- Core utilities

### Constants & Types: 80%+ Coverage

- Focus on runtime validation
- Edge case handling

### Overall Target: 80%+ Coverage

## Testing Conventions

### File Naming

- Component tests: `ComponentName.test.tsx`
- Service tests: `ServiceName.test.ts`
- Utility tests: `utility-name.test.ts`

### Test Organization

```typescript
describe("ComponentName", () => {
    describe("Initialization", () => {
        // Setup and mounting tests
    });

    describe("User Interactions", () => {
        // Event handling and user actions
    });

    describe("Error States", () => {
        // Error handling and edge cases
    });

    describe("Accessibility", () => {
        // ARIA, keyboard navigation, screen readers
    });
});
```

### Mock Strategy

- **Services**: Mock external dependencies, test public behavior
- **Components**: Mock heavy dependencies (MapLibre), test user interactions
- **Stores**: Test state transitions and context patterns

## Success Metrics

- [ ] All TypeScript files have corresponding test files
- [ ] Critical components achieve 90%+ coverage
- [ ] All tests pass in CI/CD pipeline
- [ ] Tests follow accessibility best practices
- [ ] Error states and edge cases are covered
- [ ] Integration between components is tested

## Timeline

- **Week 1**: Critical priority files (4 files)
- **Week 2**: Medium priority files (6 files)
- **Week 3**: Low priority files (11 files)
- **Week 4**: Coverage optimization and edge cases

Total: **21 new test files** to achieve complete coverage of the map module.
