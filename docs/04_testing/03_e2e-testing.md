# End-to-End (E2E) Testing Guide

This guide explains how to write and run end-to-end (E2E) tests for this project.

## Framework

We use **Playwright** for E2E testing. Playwright is a modern and powerful framework that allows us to test our application in real browsers.

## What to Test

E2E tests should focus on critical user flows from start to finish. Good candidates for E2E tests include:

- **User Authentication**: Registration, login, and logout flows.
- **Core Application Functionality**: Creating, editing, and sharing a document.
- **Critical Paths**: Any sequence of user actions that is essential for the application to function correctly.

## Best Practices

- **Test User Flows, Not Implementation Details**: E2E tests should interact with the application as a user would, without relying on the internal implementation of components.
- **Use Locators**: Use user-visible locators like text content, labels, and roles to select elements.
- **Isolate Tests**: Each test file should be independent and not rely on the state of other tests.
- **Handle Asynchronicity**: Use Playwright's auto-waiting capabilities to handle asynchronous operations.

## Example

Here is an example of a Playwright test for the login flow:

```typescript
// test/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test('should allow a user to log in', async ({ page }) => {
  await page.goto('http://localhost:3000/login');

  await page.getByLabel('Email').fill('test@example.com');
  await page.getByLabel('Password').fill('password');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL('http://localhost:3000/dashboard');
});
```

## Running E2E Tests

To run all E2E tests, use the following command:

```bash
pnpm run test:e2e
```

This will run the tests in a headless browser. To see the tests run in a headed browser, use the `--headed` flag:

```bash
pnpm run test:e2e -- --headed
```
