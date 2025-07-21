# BDD Test Fixes Implementation Plan

## Status: Complete ✅

## Overview

This plan addresses the two remaining BDD test failures in the AuStdX project:

1. Location management scenario - assertion failure (expected "New York" but got "Test Location")
2. API mocking functionality - error "Cannot read properties of undefined (reading 'use')"

## Research Findings

### 1. MSW (Mock Service Worker) Best Practices

- MSW intercepts actual HTTP requests at the network level, providing more realistic testing
- Requires proper setup in test environment with server initialization
- Better than traditional mocking as it works with any HTTP client (fetch, axios, etc.)

### 2. BDD Test Data Management Best Practices

- Use a scenario context/world object to share state between steps
- Avoid using global variables or static state
- Clean state between scenarios to prevent test pollution
- Use explicit data management patterns rather than implicit state

## Issue 1: Location Management Assertion Failure

### Problem Analysis

- Test expects "New York" but gets "Test Location"
- Issue is in `test/step-definitions/shared-steps.ts` where location is set
- The step definition sets location to "Test Location" but the assertion expects "New York"

### Solution

Update the test data to match expectations or fix the assertion.

### Implementation Steps

1. Review the feature file to understand the intended behavior
2. Update either the step definition to set "New York" or update the assertion to expect "Test Location"
3. Ensure consistency between test data and assertions

## Issue 2: API Mocking Error

### Problem Analysis

- Error: "Cannot read properties of undefined (reading 'use')"
- Suggests MSW server is not properly initialized when the test tries to use it
- Need to set up MSW server before test execution

### Solution

Implement proper MSW setup for BDD tests.

### Implementation Steps

1. Install MSW if not already installed
2. Create MSW handlers for API endpoints
3. Initialize MSW server in test setup
4. Ensure server is available in world context

## Implementation Plan

### Phase 1: Fix Location Management Test (15 minutes)

- [ ] Review feature file for expected behavior
- [ ] Update step definition or assertion for consistency
- [ ] Test the fix locally

### Phase 2: Implement MSW Setup (30 minutes)

- [ ] Check if MSW is installed, install if needed
- [ ] Create mock handlers for API endpoints
- [ ] Set up MSW server initialization
- [ ] Integrate MSW with BDD world context

### Phase 3: Testing and Validation (15 minutes)

- [ ] Run all BDD tests to ensure fixes work
- [ ] Verify no new failures introduced
- [ ] Clean up any debug code

## Technical Implementation Details

### MSW Setup for BDD Tests

```typescript
// test/mocks/handlers.ts
import { http, HttpResponse } from "msw";

export const handlers = [
    http.get("/api/users/active", () => {
        return HttpResponse.json([{ id: 1, name: "Test User", email: "test@example.com" }]);
    }),
    // Add other handlers as needed
];
```

```typescript
// test/mocks/server.ts
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);
```

```typescript
// test/step-definitions/world.ts
import { server } from "../mocks/server";

export class AuStdXBddWorld {
    // ... existing properties
    mockServer = server;

    // ... existing methods
}
```

### World Context Pattern for Data Sharing

```typescript
// Enhanced world with proper data management
export class AuStdXBddWorld {
    private testData: Map<string, any> = new Map();

    setTestData(key: string, value: any): void {
        this.testData.set(key, value);
    }

    getTestData(key: string): any {
        return this.testData.get(key);
    }

    clearTestData(): void {
        this.testData.clear();
    }
}
```

## Progress Updates

### 2024-12-30 14:45 - Initial Plan Created

- Documented research findings
- Identified root causes of failures
- Created implementation strategy

### 2024-12-30 14:48 - Phase 1 Completed ✅

- Fixed location management test
- Issue was that setLocation was being called twice (once for name, once for coordinates)
- Each call was creating a new location instead of merging properties
- Solution: Modified setLocation to merge properties when location already exists
- Result: Location test now passes (7/8 tests passing)

### 2024-12-30 14:51 - Phase 2 Completed ✅

- Fixed API mocking functionality test
- Issue was that MSW server wasn't accessible in the mockApiResponse functions
- The test-utils.tsx was importing server from general test setup, not BDD-specific setup
- Solution: Updated mockApiResponse to use getServer() functions from both setups
- Added proper type assertions for MSW server object
- Result: All BDD tests now pass (8/8)

## Success Criteria

- [x] All BDD tests pass (8/8)
- [x] Location management test shows correct location
- [x] API mocking works without errors
- [x] No regression in previously passing tests
- [x] Clean, maintainable test code following best practices

## Final Summary

Successfully fixed all BDD test failures:

1. **Location Management**: Fixed by updating setLocation method to merge properties instead of replacing the entire location object when called multiple times.
2. **API Mocking**: Fixed by ensuring the correct MSW server instance is used in BDD tests, accommodating for the different setup environments.

The test suite now passes completely with all 8 tests passing. The fixes maintain backward compatibility and follow best practices for BDD testing with proper state management between steps.

## Risk Mitigation

- Keep changes minimal and focused
- Test each fix independently
- Maintain backward compatibility
- Document any significant changes

## Next Steps

1. Begin with Phase 1 (Location Management Fix)
2. Proceed to Phase 2 (MSW Implementation)
3. Complete Phase 3 (Testing and Validation)
4. Update this document with progress

## Summary

All BDD test failures have been successfully resolved:

- **8 out of 8** BDD tests now passing
- **Root causes** identified and documented
- **Comprehensive documentation** created for future development
- **Cursor rules** updated with BDD testing patterns

## Documentation Updates

### 1. Updated QuickPickle BDD Integration Documentation

- **File**: `docs/quickpickle-bdd-integration.md`
- **Added**: Comprehensive "Lessons Learned and Common Pitfalls" section
- **Key Points**:
  - World parameter passing patterns
  - State management in BDD tests
  - MSW integration requirements
  - Configuration pitfalls and solutions

### 2. Created BDD Testing Patterns Rule

- **File**: `.cursor/rules/quality/bdd-testing-patterns.mdc`
- **Content**: Comprehensive BDD testing rules following cursor patterns
- **Highlights**:
  - Critical world parameter passing pattern (first param, not `this`)
  - Type-safe world context implementation
  - State merging patterns
  - Common pitfalls and anti-patterns

### 3. Created BDD Troubleshooting Guide

- **File**: `docs/testing/bdd-troubleshooting-guide.md`
- **Purpose**: Quick reference for common BDD issues
- **Includes**:
  - 6 common issues with solutions
  - Debugging techniques
  - Best practices
  - Setup checklist

### 4. Updated Testing Documentation

- **File**: `docs/testing/testing-lessons-learned.md`
- **Added**: 3 new lessons learned (#9, #10, #11) about BDD integration
- **File**: `docs/testing/README.md`
- **Added**: Reference to BDD troubleshooting guide and 100% BDD test success metric

### 5. Updated Cursor Rules Index

- **Files**: `.cursor/rules/index.mdc` and `.cursor/rules/README.mdc`
- **Added**: BDD testing patterns to quality rules section
- **Updated**: Total rule count from 32 to 33
- **Added**: BDD testing example in key patterns section

## Key Takeaways

1. **Framework Differences Matter**: QuickPickle's parameter passing differs from traditional Cucumber
2. **State Management is Critical**: Multiple steps updating same entity require merge logic
3. **Test Infrastructure Must Be Flexible**: Support multiple test contexts (regular + BDD)
4. **Documentation Prevents Future Issues**: Clear examples and anti-patterns save debugging time

## Next Steps

- Monitor BDD tests in CI/CD pipeline
- Apply patterns to new BDD scenarios
- Consider creating shared BDD step definitions library
- Update team on new patterns and documentation

## Goal: Resolve all outstanding BDD test failures in the AuStdX Design System repository

- The `AuStdXBddWorld` class should be the single source of truth for test state
- `BDD_MODE` in `vitest.bdd.config.ts` must be set for AuStdX tests to run
- All new BDD tests for the AuStdX project must follow these patterns.
