# Factory Pattern Implementation Plan for Map Module Tests

## Summary

Convert remaining test files in the map module to use centralized factory functions instead of inline test data, `as const` patterns, or duplicate factory functions. This will improve type safety, maintainability, and consistency across all test files.

## Current State Analysis

### ✅ **Already Implemented**

- `layer.factory.ts` - Layer configuration factories
- `map-config.factory.ts` - Map configuration factories
- `source.factory.ts` - Source configuration factories
- `index.ts` - Barrel export for existing factories

### 🚨 **Need to Centralize** (High Priority)

#### Files with Inline Factory Functions

1. **`type-guards.test.ts`** - 9 inline mock factories that should be centralized
2. **`MapStore.test.tsx`** - 6 inline mock factories that should be centralized
3. **`ErrorRecovery.test.ts`** - 2 inline factories that should be centralized
4. **`PerformanceOptimizer.test.ts`** - 4 inline factories that should be centralized
5. **`WidgetRegistry.test.ts`** - 3 inline mock factories that should be centralized

#### Missing Factory Types

- **Error Factories** - `MapError` objects for different error scenarios
- **Widget Factories** - `MapWidgetConfig` and widget-related objects
- **Store/Instance Factories** - Mock MapLibre instances, store instances
- **View State Factories** - `MapViewState` objects
- **Event Factories** - `MapEventPayload`, `WidgetEventPayload` objects
- **Utility Factories** - Debounced functions, performance resources, etc.

### ⚠️ **Medium Priority**

#### Files with `as const` Patterns

1. **`MapComponent.stories.tsx`** - 2 instances of `as const` that could use factories
2. **`type-guards.test.ts`** - 1 instance of `as const` pattern
3. **`MapComponent.test.tsx`** - 2 instances of GeoJSON `as const` patterns

## Implementation Plan

### **Phase 1: Create Missing Factory Files** (2-3 hours)

#### 1.1 Create Error Factories

**File**: `src/lib/modules/map/__tests__/factories/error.factory.ts`

**Functions to implement**:

- `createMapError(overrides?: Partial<MapError>): MapError`
- `createNetworkError(message?: string, sourceId?: string): MapError`
- `createDataError(message?: string, layerId?: string): MapError`
- `createRenderError(message?: string): MapError`
- `createWidgetError(message?: string, widgetId?: string): MapError`
- `createErrorArray(count?: number): MapError[]`

#### 1.2 Create Widget Factories

**File**: `src/lib/modules/map/__tests__/factories/widget.factory.ts`

**Functions to implement**:

- `createWidget(overrides?: Partial<MapWidgetConfig>): MapWidgetConfig`
- `createLayerManagementWidget(overrides?: Partial<MapWidgetConfig>): MapWidgetConfig`
- `createNavigationWidget(overrides?: Partial<MapWidgetConfig>): MapWidgetConfig`
- `createWidgetArray(count?: number): MapWidgetConfig[]`
- `createWidgetEventPayload(overrides?: Partial<WidgetEventPayload>): WidgetEventPayload`

#### 1.3 Create Instance/Store Factories

**File**: `src/lib/modules/map/__tests__/factories/instance.factory.ts`

**Functions to implement**:

- `createMockMapInstance(): MapInstance`
- `createMockStore(overrides?: Partial<StoreConfig>): MockStore`
- `createGeoJSONSourceInstance(): GeoJSONSource`

#### 1.4 Create State Factories

**File**: `src/lib/modules/map/__tests__/factories/state.factory.ts`

**Functions to implement**:

- `createMapViewState(overrides?: Partial<MapViewState>): MapViewState`
- `createMapInteractionState(overrides?: Partial<MapInteractionState>): MapInteractionState`
- `createMapStoreState(overrides?: Partial<MapStoreContextType>): MapStoreContextType`

#### 1.5 Create Event Factories

**File**: `src/lib/modules/map/__tests__/factories/event.factory.ts`

**Functions to implement**:

- `createMapEventPayload(overrides?: Partial<MapEventPayload>): MapEventPayload`
- `createWidgetEventPayload(overrides?: Partial<WidgetEventPayload>): WidgetEventPayload`

#### 1.6 Create Utility Factories

**File**: `src/lib/modules/map/__tests__/factories/utility.factory.ts`

**Functions to implement**:

- `createMockDebouncedFunction<T>(): T & DebounceHelpers`
- `createMockResource(): MockResource`
- `createTestId(value: string): Id`

### **Phase 2: Update Factory Index** (30 minutes)

Update `src/lib/modules/map/__tests__/factories/index.ts` to export all new factories:

```typescript
export * from "./layer.factory";
export * from "./map-config.factory";
export * from "./source.factory";
export * from "./error.factory";
export * from "./widget.factory";
export * from "./instance.factory";
export * from "./state.factory";
export * from "./event.factory";
export * from "./utility.factory";
```

### **Phase 3: Convert Test Files** (4-5 hours)

#### 3.1 High Priority Files

**`type-guards.test.ts`** (1.5 hours)

- Replace 9 inline factories with centralized ones
- Remove duplicate `createMockGeoJSONSource`, `createMockVectorSource`, etc.
- Update all usages to import from factories

**`MapStore.test.tsx`** (1 hour)

- Replace 6 inline factories with centralized ones
- Remove `createMockMapInstance`, `createMockError`, etc.
- Update provider test utilities

**`ErrorRecovery.test.ts`** (45 minutes)

- Replace `createTestError` and `createMockStore` with centralized factories
- Update all 30+ usages of inline factories

**`PerformanceOptimizer.test.ts`** (45 minutes)

- Replace `createTestSource`, `createTestLayer`, `createTestConfig`, `createMockResource`
- Update 20+ usages throughout the file

**`WidgetRegistry.test.ts`** (30 minutes)

- Replace `createMockLogger`, `createMockMapStore`, `createTestEntry`
- Update widget-related test patterns

#### 3.2 Medium Priority Files

**`MapComponent.stories.tsx`** (30 minutes)

- Convert `as const` patterns to factory usage where appropriate
- Update story configurations to use factories

**`MapComponent.test.tsx`** (30 minutes)

- Convert GeoJSON `as const` patterns to factory functions
- Replace any remaining inline test data

### **Phase 4: Verification & Testing** (1 hour)

#### 4.1 Type Safety Verification

- Run `pnpm type-check` to ensure no TypeScript errors
- Verify all imports resolve correctly
- Check that branded types are properly handled

#### 4.2 Test Execution Verification

- Run `pnpm test:map:clean` to verify all tests still pass
- Check that test performance hasn't degraded
- Verify factory functions work in all scenarios

#### 4.3 Code Quality Verification

- Run `pnpm lint:map` to check for any linting issues
- Verify consistent naming patterns across factories
- Check that all factory functions follow the established patterns

## Success Criteria

### ✅ **Completion Checklist**

- [ ] All inline factory functions moved to centralized factories
- [ ] All `as const` test data patterns converted to factories
- [ ] No duplicate factory functions across test files
- [ ] All factories follow the established pattern with `overrides` parameter
- [ ] Branded types (like `Id`) are cast once in factories, not at usage sites
- [ ] All test files import from `factories/index.ts`
- [ ] All tests pass without modification to test logic
- [ ] TypeScript compilation succeeds with no errors
- [ ] Consistent naming patterns across all factories

### 📊 **Metrics**

**Before Implementation**:

- 23 inline factory functions across 5 test files
- 3 centralized factory files
- 5 files with `as const` patterns

**After Implementation**:

- 0 inline factory functions
- 8+ centralized factory files
- 0 `as const` patterns in test data
- 40+ factory functions available for reuse

## Risk Assessment

### **Low Risk**

- Factory functions are straightforward conversions
- Existing factories provide proven patterns
- Changes are isolated to test files

### **Medium Risk**

- Large number of usages to update (100+ function calls)
- Need to ensure all branded type casting is correct
- Test performance could be affected if factories are inefficient

### **Mitigation Strategies**

- Convert one test file at a time to minimize breakage
- Run tests after each file conversion to catch issues early
- Use TypeScript compiler to catch import/type errors
- Create factories with optimal performance (avoid expensive operations)

## Timeline

**Total Estimated Time**: 8-10 hours

- **Day 1 (4-5 hours)**: Phase 1 & 2 - Create all factory files and update index
- **Day 2 (3-4 hours)**: Phase 3 - Convert test files one by one
- **Day 3 (1 hour)**: Phase 4 - Verification, testing, and cleanup

## Next Steps

1. **Start with Phase 1.1** - Create error factories first (most commonly used)
2. **Test incrementally** - Verify each factory file works before moving to next
3. **Convert highest impact files first** - Start with `type-guards.test.ts` and `MapStore.test.tsx`
4. **Monitor performance** - Ensure test execution time doesn't increase significantly

This implementation will provide a consistent, type-safe foundation for all map module testing and eliminate the anti-patterns identified in the factory pattern rules.
