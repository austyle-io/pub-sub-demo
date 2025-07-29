# Unit Testing Guide

This guide provides instructions and best practices for writing unit tests in this project.

## Framework

We use **Vitest** for unit testing. Vitest is a fast and modern test runner with a Jest-compatible API.

## What to Test

Unit tests should focus on testing individual functions or components in isolation. Good candidates for unit tests include:

- **Utility Functions**: Functions that perform a specific task (e.g., data transformation, validation).
- **Complex Logic**: Any code with complex conditional logic or algorithms.
- **Pure Components**: React components that are pure functions of their props.

## Best Practices

- **Keep it Small**: Each test should focus on a single piece of functionality.
- **No Side Effects**: Unit tests should not have any side effects (e.g., making API calls, accessing the database).
- **Use Mocks**: Use Vitest's mocking capabilities to isolate the code you are testing from its dependencies.
- **Clear Assertions**: Use clear and descriptive assertions to make your tests easy to understand.

## Example

Here is an example of a unit test for a simple utility function:

```typescript
// src/utils/sum.ts
export const sum = (a: number, b: number): number => a + b;

// src/utils/__tests__/sum.test.ts
import { describe, it, expect } from 'vitest';
import { sum } from '../sum';

describe('sum', () => {
  it('should return the sum of two numbers', () => {
    expect(sum(1, 2)).toBe(3);
  });
});
```

## Running Unit Tests

To run all unit tests, use the following command:

```bash
pnpm run test
```
