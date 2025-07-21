# Map Module - Medium Priority Improvements

## Overview

Important improvements that enhance maintainability, completeness, and type safety. These should be addressed after high-priority issues are resolved.

## 4. Decouple Cross-Module Dependencies 🔗

### Priority: MEDIUM

### Effort: 2-3 days

### Impact: Medium - Improves maintainability and testability

### Current Issues

- [x] ✅ **Fixed**: Cross-module import in PerformanceOptimizer (debounce utility)
- [ ] **Widget system tight coupling**: Direct imports between map and widgets modules

### Tasks

#### Create Shared Utilities Package

- [ ] **Extract common utilities** (`src/utils/` or separate package)

    ```typescript
    // Utilities used across modules:
    - debounce/throttle functions
    - deep equality comparisons
    - generic helper functions
    - shared validation utilities
    ```

#### Implement Dependency Inversion

- [ ] **Abstract widget system interfaces**

    ```typescript
    // Create abstractions in map module
    export type WidgetEventBroadcaster = {
        broadcast(eventType: string, data: unknown, options?: BroadcastOptions): void;
        subscribe(eventType: string, handler: EventHandler): UnsubscribeFn;
    };

    // Widgets implement these types
    export type MapWidget<TConfig = unknown> = {
        config: TConfig;
        eventBroadcaster?: WidgetEventBroadcaster;
        onMount?(): void;
        onUnmount?(): void;
    };
    ```

#### Update Import Patterns

- [ ] **Standardize imports across modules**
  - Use index exports consistently
  - Avoid deep imports into other modules
  - Use dependency injection where needed

### Files to Create

- `src/utils/performance.ts` (debounce, throttle, etc.)
- `src/utils/comparison.ts` (deep equality, etc.)
- `src/utils/index.ts` (shared utilities export)

### Files to Modify

- `src/modules/map/services/PerformanceOptimizer.ts` ✅ Done
- `src/modules/map/services/WidgetRegistry.ts`
- Widget modules that import from map module

---

## 5. Complete Incomplete Implementations 🚧

### Priority: MEDIUM

### Effort: 3-4 days

### Impact: High - Makes features fully functional

### Current Incomplete Implementations

#### Performance Optimizer (`src/modules/map/services/PerformanceOptimizer.ts`)

##### Layer Diffing Algorithm

- [ ] **Complete `diffLayers` method**

    ```typescript
    private diffLayers(oldLayers: MapLayerConfig[], newLayers: MapLayerConfig[]): MapChange[] {
      const changes: MapChange[] = [];
      const oldLayerMap = new Map(oldLayers.map((l, index) => [l.id, { layer: l, index }]));
      const newLayerMap = new Map(newLayers.map((l, index) => [l.id, { layer: l, index }]));

      // Detect additions, updates, and removals
      // Detect reordering
      // Return comprehensive change set
    }
    ```

##### Change Application Logic

- [ ] **Complete `applyChanges` method**

    ```typescript
    private async applyChanges(map: MapLibreMap, changes: MapChange[]): Promise<void> {
      // Sort changes by dependency order
      // Apply source changes first
      // Apply layer changes with proper ordering
      // Handle errors gracefully
    }
    ```

#### Map Sync Utilities (`src/modules/map/utils/sync-utils.ts`)

- [ ] **Add comprehensive source type support**

  - Currently only handles GeoJSON sources fully
  - Add vector, raster, and image source handling
  - Add proper error handling for sync operations

- [ ] **Improve layer synchronization**
  - Add layer property updates (not just replacement)
  - Handle layer dependencies and ordering
  - Add performance optimizations for large layer sets

#### Widget Registry (`src/modules/map/services/WidgetRegistry.ts`)

- [ ] **Add lazy loading implementation**

    ```typescript
    import { isNil } from "lodash";

    async getComponent(type: string): Promise<WidgetComponent | null> {
      const entry = this.registry.get(type);
      if (isNil(entry)) return null;

      if (entry.lazy && !this.loadedComponents.has(type)) {
        // Properly implement lazy loading with error handling
        // Add loading states and fallbacks
        // Cache loaded components efficiently
      }
      // ... rest of implementation
    }
    ```

#### Error Recovery (`src/modules/map/services/ErrorRecovery.ts`)

- [ ] **Add analytics integration**

    ```typescript
    private async sendToAnalytics(logMessage: ErrorLogMessage): Promise<void> {
      // Implement analytics service integration
      // Add configurable analytics providers
      // Handle analytics failures gracefully
    }
    ```

### Implementation Plan

1. **Week 1**: Complete performance optimizer implementations
2. **Week 2**: Enhance sync utilities and widget registry
3. **Week 3**: Add analytics integration and testing

---

## 6. Improve Type Safety 🛡️

### Priority: MEDIUM

### Effort: 2-3 days

### Impact: Medium - Prevents runtime errors and improves DX

### Current Type Safety Issues

#### Branded Types Not Enforced

- [ ] **Create type guards and validators**

    ```typescript
    // src/modules/map/utils/type-guards.ts
    import { isString, isEmpty } from "lodash";

    export const createId = (value: string): Id => {
        // Add validation logic
        if (!isString(value) || isEmpty(value.trim())) {
            throw new Error("Invalid ID: must be a non-empty string");
        }
        return value as Id;
    };

    export const isValidId = (value: unknown): value is Id => {
        return isString(value) && !isEmpty(value.trim());
    };
    ```

#### Runtime Type Validation

- [ ] **Add schema validation for configs**

    ```typescript
    // Use zod or similar for runtime validation
    import { z } from "zod";

    export const MapConfigSchema = z.object({
        sources: z.array(MapSourceConfigSchema),
        layers: z.array(MapLayerConfigSchema),
        widgets: z.array(MapWidgetConfigSchema).optional(),
        // ... rest of schema
    });

    export const validateMapConfig = (config: unknown): MapConfig => {
        return MapConfigSchema.parse(config);
    };
    ```

#### Event Payload Type Safety

- [ ] **Strengthen event type system**

    ```typescript
    // Create discriminated unions for event payloads
    export type MapEventPayload =
        | { type: "featureClick"; layerId: Id; feature: Feature /* ... */ }
        | { type: "viewChange"; view: MapViewState /* ... */ }
        | { type: "error"; error: MapError /* ... */ };
    ```

#### Generic Type Constraints

- [ ] **Add proper generic constraints**

    ```typescript
    // Constrain widget config types
    export type WidgetComponent<TConfig extends Record<string, unknown> = Record<string, unknown>> = {
        config: TConfig;
        // ...
    };
    ```

### Files to Create

- `src/modules/map/utils/type-guards.ts`
- `src/modules/map/utils/validation.ts`
- `src/modules/map/schemas/` (config schemas)

### Files to Modify

- All type definition files in `src/modules/map/types/`
- Components using untyped configurations
- Event handling code with loose typing

---

## Success Criteria

### Dependencies

- [ ] No cross-module imports outside of defined interfaces
- [ ] Shared utilities properly extracted and documented
- [ ] Dependency injection working for widget system
- [ ] Module boundaries clearly defined and enforced

### Completeness

- [ ] All placeholder implementations completed and tested
- [ ] Performance optimizer fully functional with benchmarks
- [ ] Sync utilities handle all source/layer types
- [ ] Widget lazy loading working with proper error handling
- [ ] Analytics integration configurable and tested

### Type Safety

- [ ] Branded types enforced with validation functions
- [ ] Runtime type validation for critical paths
- [ ] Event system fully type-safe with discriminated unions
- [ ] Generic constraints properly applied
- [ ] Zero `any` types in production code paths

## Risk Assessment

### Medium Risk

- **Dependencies**: Large refactor may break existing integrations
- **Completeness**: Complex algorithms may introduce new bugs
- **Type Safety**: Strict typing may reveal existing type issues

### Mitigation

- Implement changes behind feature flags where possible
- Add comprehensive tests before making breaking changes
- Use gradual typing migration approach
- Maintain backward compatibility during transition

## Dependencies

- High-priority tasks completed first
- Schema validation library (zod recommended)
- Testing infrastructure in place
- Proper build tooling for type checking

## Timeline

- **Week 1**: Dependency decoupling and shared utilities
- **Week 2**: Complete placeholder implementations
- **Week 3**: Type safety improvements and validation
- **Week 4**: Integration testing and documentation updates
