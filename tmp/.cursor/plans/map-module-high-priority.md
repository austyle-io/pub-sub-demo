# Map Module - High Priority Improvements

## Overview

Critical issues that must be addressed before production deployment. These affect system stability, memory usage, and debugging capabilities.

## 1. Add Comprehensive Testing 🧪

### Priority: CRITICAL

### Effort: 3-5 days

### Impact: High - Prevents production bugs and enables confident refactoring

### Tasks

#### Unit Tests

- [ ] **Error Recovery Logic** (`src/modules/map/services/ErrorRecovery.ts`)

  - Test retry strategies (exponential, linear, immediate)
  - Test race condition handling in `scheduleRetry`
  - Test timeout cleanup in error resolution
  - Test error categorization and severity handling
  - Mock MapStore interactions

- [ ] **Performance Optimizer** (`src/modules/map/services/PerformanceOptimizer.ts`)

  - Test debounce/throttle implementations
  - Test deep equality comparisons
  - Test resource cleanup in MapResourceManager
  - Test memory leak prevention

- [ ] **Widget Registry** (`src/modules/map/services/WidgetRegistry.ts`)
  - Test event broadcasting and subscription
  - Test widget lifecycle management
  - Test event cleanup on widget unmount
  - Test error handling in event handlers

#### Integration Tests

- [ ] **Map Store Integration** (`src/modules/map/stores/MapStore.tsx`)

  - Test event flow from trigger to emission
  - Test state consistency during concurrent updates
  - Test error propagation through the store
  - Test cleanup on provider unmount

- [ ] **Widget Communication**
  - Test inter-widget event broadcasting
  - Test event targeting and filtering
  - Test event cleanup when widgets are removed
  - Test error isolation between widgets

#### Setup Tasks

- [ ] Configure Jest/Vitest with React Testing Library for the map module
- [ ] Create test utilities and mocks for MapLibre GL JS using React Testing Library
- [ ] Set up coverage reporting (target: >80%)
- [ ] Add test commands to package.json
- [ ] Install and configure React Testing Library and jest-environment-jsdom

### Files to Create

```
src/modules/map/__tests__/
├── services/
│   ├── ErrorRecovery.test.ts
│   ├── PerformanceOptimizer.test.ts
│   └── WidgetRegistry.test.ts
├── stores/
│   └── MapStore.test.tsx
├── components/
│   └── MapComponent.test.tsx
├── utils/
│   └── sync-utils.test.ts
└── __mocks__/
    ├── maplibre-gl.ts
    └── test-utils.tsx (React Testing Library utilities)
```

### Testing Implementation Examples

#### React Testing Library Patterns

```typescript
// src/modules/map/__tests__/components/MapComponent.test.tsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MapComponent } from '../../components/MapComponent';
import { MapStoreProvider } from '../../stores/MapStore';

// Mock MapLibre GL JS
jest.mock('maplibre-gl', () => ({
  Map: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    off: jest.fn(),
    remove: jest.fn(),
    getCenter: jest.fn(),
    setCenter: jest.fn(),
  })),
}));

describe('MapComponent', () => {
  const renderWithProvider = (ui: ReactElement) => {
    return render(
      <MapStoreProvider>
        {ui}
      </MapStoreProvider>
    );
  };

  it('should render map container', () => {
    renderWithProvider(<MapComponent />);
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
  });

  it('should handle map load events', async () => {
    const onMapLoad = jest.fn();
    renderWithProvider(<MapComponent onMapLoad={onMapLoad} />);

    await waitFor(() => {
      expect(onMapLoad).toHaveBeenCalledTimes(1);
    });
  });
});
```

#### Widget Integration Testing

```typescript
// src/modules/map/__tests__/stores/MapStore.test.tsx
import { render, act } from '@testing-library/react';
import { useMapStore, MapStoreProvider } from '../../stores/MapStore';

const TestComponent = () => {
  const { state, actions } = useMapStore();
  return (
    <div>
      <span data-testid="widget-count">{state.widgets.length}</span>
      <button
        data-testid="add-widget"
        onClick={() => actions.addWidget({ id: 'test', type: 'test' })}
      >
        Add Widget
      </button>
    </div>
  );
};

describe('MapStore Widget Management', () => {
  it('should add widgets to store', () => {
    const { getByTestId } = render(
      <MapStoreProvider>
        <TestComponent />
      </MapStoreProvider>
    );

    expect(getByTestId('widget-count')).toHaveTextContent('0');

    act(() => {
      fireEvent.click(getByTestId('add-widget'));
    });

    expect(getByTestId('widget-count')).toHaveTextContent('1');
  });
});
```

---

## 2. Fix Memory Management 🔧

### Priority: CRITICAL

### Effort: 1-2 days

### Impact: High - Prevents memory leaks and improves performance

### Tasks

#### Error Recovery Service

- [x] ✅ **Fixed race conditions in retry logic**
- [ ] **Add proper cleanup methods**

    ```typescript
    // Add to ErrorRecoveryManager
    public dispose(): void {
      // Clear all retry timeouts
      for (const timeoutId of this.retryQueue.values()) {
        clearTimeout(timeoutId);
      }
      this.retryQueue.clear();
      this.errorHistory.clear();
    }
    ```

#### Performance Optimizer Services

- [ ] **Add cleanup to singleton instances**

    ```typescript
    // Add to each service class
    public dispose(): void {
      // Clear all handlers and resources
    }
    ```

#### Map Component

- [x] ✅ **Fixed event listener cleanup**
- [ ] **Add map instance cleanup**

    ```typescript
    // Add cleanup on unmount
    import { useEffect } from "react";
    import { isNil } from "lodash";

    useEffect(() => {
        return () => {
            if (!isNil(mapInstance)) {
                mapInstance.remove();
            }
        };
    }, []);
    ```

#### Widget Registry

- [ ] **Add subscription cleanup tracking**

    ```typescript
    // Track all subscriptions for cleanup
    private activeSubscriptions = new Set<() => void>();

    public dispose(): void {
      this.activeSubscriptions.forEach(cleanup => cleanup());
      this.activeSubscriptions.clear();
    }
    ```

### Files to Modify

- `src/modules/map/services/ErrorRecovery.ts`
- `src/modules/map/services/PerformanceOptimizer.ts`
- `src/modules/map/services/WidgetRegistry.ts`
- `src/modules/map/components/MapComponent.tsx`

---

## 3. Replace Console Logging 📊

### Priority: HIGH

### Effort: 1-2 days

### Impact: Medium - Improves debugging and production monitoring

### Tasks

#### Create Logging Service with Pino v8

- [ ] **Install and configure Pino v8** (`pnpm add pino@^8.0.0 pino-pretty@^10.0.0`)

- [ ] **Implement Pino-based logger** (`src/modules/map/services/Logger.ts`)

    ```typescript
    import pino from "pino";

    // Create logger instance with development-friendly configuration
    const logger = pino({
        level: process.env.LOG_LEVEL || "info",
        ...(process.env.NODE_ENV === "development" && {
            transport: {
                target: "pino-pretty",
                options: {
                    colorize: true,
                    translateTime: "SYS:standard",
                    ignore: "pid,hostname",
                },
            },
        }),
    });

    export type MapLogger = {
        error(message: string, context?: Record<string, unknown>): void;
        warn(message: string, context?: Record<string, unknown>): void;
        info(message: string, context?: Record<string, unknown>): void;
        debug(message: string, context?: Record<string, unknown>): void;
        child(bindings: Record<string, unknown>): MapLogger;
    };

    export const createMapLogger = (module: string): MapLogger => {
        const childLogger = logger.child({ module });

        return {
            error: (message: string, context?: Record<string, unknown>) => {
                childLogger.error(context, message);
            },
            warn: (message: string, context?: Record<string, unknown>) => {
                childLogger.warn(context, message);
            },
            info: (message: string, context?: Record<string, unknown>) => {
                childLogger.info(context, message);
            },
            debug: (message: string, context?: Record<string, unknown>) => {
                childLogger.debug(context, message);
            },
            child: (bindings: Record<string, unknown>): MapLogger => {
                return createMapLogger(`${module}:${bindings.component || "unknown"}`);
            },
        };
    };

    // Export default logger for the map module
    export const mapLogger = createMapLogger("map");
    ```

- [ ] **Configure different log levels for environments** (development: debug, production: warn)
- [ ] **Add structured context with Pino child loggers** for different components
- [ ] **Set up optional transport to external monitoring** (e.g., Datadog, LogRocket)

#### Replace Console Usage

Current console usage locations:

- `src/modules/map/services/PerformanceOptimizer.ts:165,181`
- `src/modules/map/services/WidgetRegistry.ts:55,133`
- `src/modules/map/stores/MapStore.tsx:642,684,756,805`
- `src/modules/map/services/ErrorRecovery.ts:219`

#### Implementation Plan

- [ ] Install Pino v8 and pino-pretty dependencies
- [ ] Create Pino-based logger implementation
- [ ] Add logger to MapProvider context
- [ ] Replace all console.\* calls with structured Pino logger calls
- [ ] Configure environment-specific log levels
- [ ] Set up optional transport for external monitoring

#### Usage Examples

```typescript
// In MapStore.tsx - Replace console.error with structured logging
import { mapLogger } from "../services/Logger";

// Before: console.error("Failed to sync state", error);
// After:
const logger = mapLogger.child({ component: "MapStore" });
logger.error("Failed to sync state", {
    error: error.message,
    stack: error.stack,
    userId: state.userId,
    mapId: state.config.id,
});

// In WidgetRegistry.ts - Contextual logging
const logger = mapLogger.child({ component: "WidgetRegistry" });
logger.info("Widget registered successfully", {
    widgetType: entry.type,
    widgetId: entry.id,
    lazy: entry.lazy,
});

// In ErrorRecovery.ts - Error tracking with context
const logger = mapLogger.child({ component: "ErrorRecovery" });
logger.warn("Retrying operation", {
    errorId: error.id,
    retryCount: error.retryCount,
    strategy: error.retryStrategy,
    nextRetryIn: delay,
});
```

### Files to Create

- `src/modules/map/services/Logger.ts`
- `src/modules/map/services/index.ts` (update exports)

### Package Dependencies to Add

```json
{
    "dependencies": {
        "pino": "^8.15.0"
    },
    "devDependencies": {
        "@testing-library/react": "^13.4.0",
        "@testing-library/jest-dom": "^5.16.5",
        "@testing-library/user-event": "^14.4.3",
        "jest-environment-jsdom": "^29.6.0",
        "pino-pretty": "^10.2.0"
    }
}
```

### Files to Modify

- All files listed above with console usage
- `src/modules/map/stores/MapStore.tsx` (add logger to context)

---

## Success Criteria

### Testing

- [ ] > 80% code coverage across all map module files using Jest and React Testing Library
- [ ] All critical error handling paths tested with proper mocking
- [ ] Integration tests passing for widget communication using React Testing Library utilities
- [ ] Performance benchmarks established
- [ ] MapLibre GL JS properly mocked for component testing

### Memory Management

- [ ] No memory leaks detected in browser dev tools
- [ ] All event listeners properly cleaned up
- [ ] All timeouts and intervals properly cleared
- [ ] Resource cleanup methods implemented and tested

### Logging

- [ ] All console statements replaced with Pino v8 structured logging
- [ ] Log levels configurable via environment variables (LOG_LEVEL)
- [ ] Error context properly captured and formatted using Pino child loggers
- [ ] Development-friendly logging with pino-pretty
- [ ] Optional external logging integration working (Datadog, LogRocket, etc.)
- [ ] Structured context includes component, module, and relevant metadata

## Risk Assessment

### High Risk

- **Testing**: Large codebase with complex interactions - may uncover additional issues
- **Memory Management**: Changes to cleanup logic could introduce new bugs

### Medium Risk

- **Logging**: Widespread changes across many files - coordination needed

### Mitigation

- Implement changes incrementally with thorough testing
- Use feature flags for new logging system
- Monitor memory usage during testing phases

## Dependencies

- Testing framework setup (Jest/Vitest + React Testing Library)
- Pino v8 and pino-pretty packages for logging
- CI/CD pipeline updates for test execution
- Optional external logging service configuration (Datadog, LogRocket, etc.)

## Timeline

- **Week 1**: Testing setup and critical memory management fixes
- **Week 2**: Complete testing suite and logging implementation
- **Week 3**: Integration testing and performance validation
