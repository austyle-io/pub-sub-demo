# Map Module Dependency Optimization Review Plan

## Overview

This plan systematically reviews the `@/modules/map` module to identify opportunities to leverage existing third-party libraries or built-in functionality instead of custom implementations.

## Current Third-Party Dependencies

### Core Dependencies

1. **maplibre-gl** - Core mapping library for rendering interactive maps
2. **lodash** - Utility functions (isEmpty, isNil, isArray, isString)
3. **@xstate/store** + **@xstate/store/react** - State management
4. **zod** - Schema validation and runtime type checking
5. **clsx** - CSS class name utility
6. **react** - React framework and hooks
7. **geojson** - GeoJSON type definitions

## Review Areas

### 1. **Utility Functions Analysis**

**Files to Review**: `utils/sync-utils.ts`, `services/PerformanceOptimizer.ts`, `constants/*`

**Focus Areas**:

- [ ] **Deep cloning** - `PerformanceOptimizer.ts` has custom `deepClone()`
  - **Potential**: Use `lodash.cloneDeep` or `structuredClone` (native)
- [ ] **Deep equality comparison** - Custom `deepEqual()` in `PerformanceOptimizer.ts`
  - **Potential**: Use `lodash.isEqual`
- [ ] **Object manipulation** - Custom object spreading and merging
  - **Potential**: Use `lodash.merge`, `lodash.pick`, `lodash.omit`
- [ ] **Array operations** - Custom array filtering and mapping
  - **Potential**: Leverage more lodash array methods

### 2. **Event System Optimization**

**Files to Review**: `services/WidgetRegistry.ts`, `stores/MapStore.tsx`, `constants/events.ts`

**Focus Areas**:

- [ ] **Event broadcasting** - Custom event system in `WidgetRegistry.ts`
  - **Potential**: Use native `EventTarget` API or `eventemitter3`
- [ ] **Event subscription management** - Custom subscription handling
  - **Potential**: Use `rxjs` or native `AbortController` for cleanup
- [ ] **Event payload validation** - Manual payload construction
  - **Potential**: Use `zod` schemas for event validation (already using zod)

### 3. **Performance Optimization Redundancy**

**Files to Review**: `services/PerformanceOptimizer.ts`

**Focus Areas**:

- [ ] **Debouncing/Throttling** - Custom implementations
  - **Potential**: Use `lodash.debounce` and `lodash.throttle`
- [ ] **Memoization** - Custom caching logic
  - **Potential**: Use `lodash.memoize` or React's built-in memoization
- [ ] **Resource cleanup** - Custom resource management
  - **Potential**: Use `AbortController` or React's cleanup patterns

### 4. **State Management Patterns**

**Files to Review**: `stores/MapStore.tsx`, `types/store-types.ts`

**Focus Areas**:

- [ ] **State normalization** - Custom state shape management
  - **Potential**: Use `@reduxjs/toolkit` utilities or `immer`
- [ ] **Event emission** - Custom emit patterns
  - **Potential**: Leverage more XState store features
- [ ] **Subscription management** - Custom subscription logic
  - **Potential**: Use XState's built-in subscription features

### 5. **Error Handling Duplication**

**Files to Review**: `services/ErrorRecovery.ts`, `types/error-types.ts`

**Focus Areas**:

- [ ] **Retry logic** - Custom retry mechanisms
  - **Potential**: Use `p-retry` or `async-retry` libraries
- [ ] **Error classification** - Custom error categorization
  - **Potential**: Use standard Error subclasses or error libraries
- [ ] **Logging** - Custom logging implementation
  - **Potential**: Use `winston`, `pino`, or browser console APIs

### 6. **Type Safety and Validation**

**Files to Review**: `types/*`, `stores/MapStore.tsx`

**Focus Areas**:

- [ ] **Runtime type checking** - Custom type guards
  - **Potential**: Expand use of `zod` for runtime validation
- [ ] **Schema validation** - Partial zod usage
  - **Potential**: Create comprehensive zod schemas for all types
- [ ] **Type derivation** - Manual type construction
  - **Potential**: Use zod's `z.infer` for type derivation

### 7. **MapLibre GL Integration**

**Files to Review**: `components/MapComponent.tsx`, `utils/sync-utils.ts`

**Focus Areas**:

- [ ] **Map event handling** - Custom event binding
  - **Potential**: Use MapLibre's built-in event system more effectively
- [ ] **Layer/Source management** - Custom sync logic
  - **Potential**: Use MapLibre's style diffing capabilities
- [ ] **Performance optimization** - Custom map operations
  - **Potential**: Use MapLibre's built-in performance features

## Implementation Plan

### Phase 1: Quick Wins (Week 1)

1. **Replace custom utility functions**

    ```typescript
    // Before: Custom deepClone
    private deepClone<T>(obj: T): T {
      return JSON.parse(JSON.stringify(obj));
    }

    // After: Use lodash or native
    import { cloneDeep } from 'lodash';
    // or use native structuredClone where supported
    ```

2. **Replace debounce/throttle implementations**

    ```typescript
    // Before: Custom debounce
    const debounce = <T extends (...args: unknown[]) => void>(func: T, delay: number): T => { ... }

    // After: Use lodash
    import { debounce } from 'lodash';
    ```

### Phase 2: Event System Optimization (Week 2)

1. **Evaluate event system replacement**

    - Compare custom event broadcasting vs native EventTarget
    - Assess performance implications
    - Create migration plan if beneficial

2. **Enhance zod usage**
    - Create comprehensive schemas for all event payloads
    - Use zod for runtime validation throughout the system

### Phase 3: State Management Review (Week 3)

1. **Optimize XState store usage**

    - Review if we're using XState store to its full potential
    - Identify custom patterns that XState already handles

2. **Error handling consolidation**
    - Evaluate dedicated error handling libraries
    - Standardize error patterns across the module

### Phase 4: Integration and Testing (Week 4)

1. **Bundle size analysis**

    - Measure impact of dependency changes
    - Ensure we're not adding unnecessary weight

2. **Performance benchmarking**
    - Compare performance before/after optimizations
    - Ensure no regressions in map rendering or interaction

## Specific Optimization Recommendations

### Replace Custom Utilities with Lodash

```typescript
// Current custom implementations that can be replaced:

// 1. Deep equality in PerformanceOptimizer.ts
// Before:
private deepEqual(obj1: Record<string, unknown>, obj2: Record<string, unknown>): boolean {
  // 30+ lines of custom implementation
}

// After:
import { isEqual } from 'lodash';
// Use isEqual(obj1, obj2) directly

// 2. Deep cloning in PerformanceOptimizer.ts
// Before:
private deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// After:
import { cloneDeep } from 'lodash';
// Use cloneDeep(obj) directly

// 3. Debouncing in PerformanceOptimizer.ts
// Before: 15+ lines of custom debounce implementation
// After:
import { debounce } from 'lodash';
```

### Enhance Zod Usage

```typescript
// Create comprehensive schemas for better type safety

// Event payload schemas
export const WidgetEventPayloadSchema = z.object({
    widgetId: z.string(),
    widgetType: z.string(),
    eventType: z.string(),
    data: z.record(z.unknown()),
    timestamp: z.string(),
    source: z.string(),
    target: z.union([z.string(), z.array(z.string())]).optional(),
    bubbles: z.boolean().optional(),
    metadata: z.record(z.unknown()).optional(),
});

// Map config schemas
export const MapConfigSchema = z.object({
    sources: z.array(MapSourceConfigSchema),
    layers: z.array(MapLayerConfigSchema),
    widgets: z.array(MapWidgetConfigSchema).optional(),
    styleUrl: z.string().optional(),
    // ... rest of config
});

// Use for runtime validation
export const validateWidgetEvent = (payload: unknown): WidgetEventPayload => {
    return WidgetEventPayloadSchema.parse(payload);
};
```

### Consider Additional Libraries

```typescript
// Error handling improvements
// Install: pnpm add p-retry
import pRetry from "p-retry";

// Replace custom retry logic with:
await pRetry(() => retryOperation(error, store), {
    retries: error.maxRetries,
    factor: 2,
    minTimeout: 1000,
    maxTimeout: 30000,
});

// Event management improvements
// Install: pnpm add eventemitter3
import { EventEmitter } from "eventemitter3";

// Replace custom event broadcasting with standardized EventEmitter
class WidgetEventBroadcaster extends EventEmitter {
    broadcast(eventType: string, data: unknown) {
        this.emit(eventType, data);
    }

    subscribe(eventType: string, handler: Function) {
        this.on(eventType, handler);
        return () => this.off(eventType, handler);
    }
}
```

## Potential New Dependencies

### High-Impact Additions

- **p-retry** or **async-retry** - Professional retry handling
- **eventemitter3** - Standardized event system
- **immer** - Immutable state updates (if XState isn't sufficient)

### Medium-Impact Additions

- **react-error-boundary** - Professional error boundary handling
- **abort-controller** polyfill - Better cleanup patterns

### Low-Impact Additions

- **fast-deep-equal** - Faster deep equality (if lodash.isEqual isn't sufficient)
- **rxjs** - Advanced reactive patterns (likely overkill)

## Success Metrics

### Code Quality

- [ ] Reduced lines of custom utility code by 40%+
- [ ] Increased test coverage through better library support
- [ ] Improved type safety with expanded zod usage

### Performance

- [ ] Bundle size impact < 10KB increase
- [ ] No regression in map rendering performance
- [ ] Improved memory usage through better cleanup patterns

### Maintainability

- [ ] Reduced custom code maintenance burden
- [ ] Better documentation through standard library usage
- [ ] Improved developer experience with familiar patterns

## Risk Assessment

### Low Risk

- Replacing utility functions (deep clone, debounce, etc.)
- Expanding zod schema usage
- Using more lodash methods

### Medium Risk

- Changing event system architecture
- Modifying state management patterns
- Altering error handling approach

### High Risk

- Major MapLibre integration changes
- Core component restructuring
- Breaking API changes

## Bundle Size Analysis

### Current Dependencies Size Impact

```
maplibre-gl: ~500KB (essential)
lodash: ~70KB (partially used - consider lodash for tree shaking)
@xstate/store: ~20KB (well utilized)
clsx: ~2KB (lightweight)
zod: ~12KB (underutilized - opportunity for expansion)
```

### Proposed Additions Impact

```
p-retry: ~2KB (high value for size)
eventemitter3: ~7KB (standard event handling)
react-error-boundary: ~3KB (production error handling)
Total new: ~12KB (acceptable increase)
```

### Optimization Opportunities

```
Switch to lodash: -20KB (tree shaking)
Remove custom utilities: -5KB (code reduction)
Better zod usage: +3KB (comprehensive validation)
Net impact: -10KB total reduction
```

## Implementation Timeline

### Week 1: Utility Replacement

- Replace deep clone, deep equality, debounce/throttle
- Switch to lodash for better tree shaking
- Measure bundle size impact

### Week 2: Event System Enhancement

- Evaluate EventEmitter3 vs custom system
- Expand zod schema usage for events
- Create migration plan

### Week 3: Error Handling Optimization

- Integrate p-retry for retry logic
- Add react-error-boundary for widget errors
- Standardize error patterns

### Week 4: Integration & Testing

- Performance benchmarking
- Bundle size optimization
- Documentation updates

## Deliverables

1. **Analysis Report** - Detailed findings for each review area
2. **Migration Plan** - Step-by-step implementation guide
3. **Updated Dependencies** - Package.json changes with justification
4. **Performance Report** - Before/after metrics
5. **Documentation Updates** - Revised README and inline docs

This plan ensures we systematically identify and eliminate unnecessary custom code while maintaining the module's functionality and performance characteristics.
