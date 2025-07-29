# Testing Strategy

This document outlines the testing strategy for the project, which is designed to ensure the application is reliable, maintainable, and bug-free.

## Guiding Principles

- **Test for Confidence**: We write tests to be confident that our code works as expected, not just to achieve a high coverage number.
- **The Testing Trophy**: We aim for a balanced mix of test types, with a focus on integration tests.
- **Automate Everything**: All tests should be automated and run in our CI/CD pipeline.

## Test Types

### Unit Tests

- **Purpose**: To test individual functions or components in isolation.
- **Framework**: Vitest
- **Location**: `__tests__` directories within each package.

### Integration Tests

- **Purpose**: To test how multiple components work together.
- **Framework**: Vitest with React Testing Library
- **Location**: `__tests__` directories within each package.

### End-to-End (E2E) Tests

- **Purpose**: To test the application from the user's perspective, simulating real user flows.
- **Framework**: Playwright
- **Location**: `test/e2e`

## When to Write Which Test

- **Unit Tests**: For pure functions, complex algorithms, and utility functions.
- **Integration Tests**: For components that involve user interaction, state changes, and API calls.
- **E2E Tests**: For critical user paths, such as registration, login, and the core editing experience.

## Running Tests

You can run all tests with a single command:

```bash
pnpm run test
```

To run tests for a specific package, use the `--filter` flag:

```bash
pnpm run test --filter=@collab-edit/client
```
