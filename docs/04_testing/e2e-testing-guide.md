# E2E Testing Guide

## Overview

This guide covers the comprehensive end-to-end (E2E) testing infrastructure implemented in Phase 4 of our DevX enhancements. Our E2E testing setup uses Playwright for browser automation and provides comprehensive testing of the collaborative document editing application.

## Quick Start

### Setup E2E Testing

```bash
# One-time setup
make test-e2e-setup        # Install Playwright and setup environment

# Run E2E tests
make test-e2e-full         # Comprehensive E2E tests with full setup
make test-e2e-basic        # Basic functionality tests
make test-e2e-collaboration # Collaboration-specific tests
```

### Manual Test Execution

```bash
# Direct Playwright commands
pnpm test:e2e              # Run all E2E tests
pnpm test:e2e:ui           # Run with interactive UI
pnpm test:e2e:debug        # Debug mode with browser visible
pnpm test:e2e:report       # View test reports
```

## Testing Infrastructure

### Test Organization

```mermaid
test/
├── e2e/
│   ├── specs/                    # Test specifications
│   │   ├── auth.e2e.ts          # Authentication tests
│   │   ├── collaboration.e2e.ts # Multi-user collaboration
│   │   ├── documents.e2e.ts     # Document management
│   │   └── performance.e2e.ts   # Performance testing
│   ├── fixtures/                # Test data and utilities
│   │   ├── auth/                # Authentication states
│   │   └── e2e-test-data.js     # Comprehensive test fixtures
│   ├── reports/                 # Test reports and artifacts
│   │   ├── html/               # HTML test reports
│   │   ├── results.json        # JSON test results
│   │   └── summary.txt         # Test summary
│   └── setup/                  # Test configuration
│       └── run-e2e-tests.sh   # Comprehensive test runner
```

### Test Data and Fixtures

Our E2E testing uses comprehensive test fixtures defined in `test/fixtures/e2e-test-data.js`:

#### Test Users

- **Alice Cooper** (`alice@example.com`) - Primary test user with document ownership
- **Bob Smith** (`bob@example.com`) - Collaborator with editor permissions
- **Charlie Brown** (`charlie@example.com`) - Additional user for multi-user scenarios
- **Admin User** (`admin@example.com`) - Administrative access testing

*All test users use password: `test123`*

#### Test Documents

1. **Welcome Document** - Demonstrates basic collaboration between Alice and Bob
2. **Team Meeting Notes** - Complex document with multiple collaborators and versioning
3. **Public Knowledge Base** - Tests public sharing and read-only access
4. **Private Draft** - Tests private document access controls

#### Collaboration Scenarios

Pre-defined test scenarios for complex workflows:

- **Simultaneous Editing** - Multiple users editing the same document
- **Permission Testing** - Various access levels and restrictions
- **Public Access** - Anonymous and authenticated public document access

## Test Types and Categories

### Basic Functionality Tests (`@basic`)

```bash
make test-e2e-basic
```

Tests core application functionality:

- User authentication (login/logout)
- Document creation and management
- Basic text editing
- Navigation and UI components
- Form validation and error handling

### Collaboration Tests (`@collaboration`)

```bash
make test-e2e-collaboration
```

Tests real-time collaborative features:

- Multi-user simultaneous editing
- Operational transform conflict resolution
- Real-time sync verification
- User presence indicators
- Document sharing and permissions

### Performance Tests (`@performance`)

```bash
./scripts/testing/run-e2e-tests.sh performance
```

Tests application performance:

- Page load times
- Document rendering performance
- Memory usage monitoring
- Large document handling
- Network optimization

### Accessibility Tests (`@a11y`)

```bash
./scripts/testing/run-e2e-tests.sh accessibility
```

Tests accessibility compliance:

- Screen reader compatibility
- Keyboard navigation
- ARIA labels and roles
- Color contrast compliance
- Focus management

## Test Configuration

### Browser Support

Our E2E tests run across multiple browsers and devices:

**Desktop Browsers:**

- Chrome/Chromium (primary)
- Firefox
- Safari/WebKit

**Mobile Devices:**

- Chrome on Android (Pixel 7)
- Safari on iOS (iPhone 14)

### Environment Configuration

Tests automatically configure the environment:

```bash
# Environment variables set by test runner
NODE_ENV=test
MONGO_URL=mongodb://localhost:27017/collab_demo_e2e
JWT_ACCESS_SECRET=test-access-secret-for-e2e-testing-only
JWT_REFRESH_SECRET=test-refresh-secret-for-e2e-testing-only
E2E_BASE_URL=http://localhost:3000
```

## Advanced Testing Features

### Automated Environment Setup

The E2E test runner automatically:

1. **Database Setup** - Creates isolated test database with fixtures
2. **Server Management** - Starts/stops development servers as needed
3. **Browser Installation** - Installs required browser versions
4. **Authentication** - Pre-configures user authentication states
5. **Cleanup** - Cleans up resources after test completion

### Test Reporting

Comprehensive reporting includes:

- **HTML Reports** - Interactive test results with screenshots/videos
- **JSON Results** - Machine-readable test data for CI integration
- **Summary Reports** - Human-readable test summaries
- **Artifacts** - Screenshots and videos of test failures
- **Performance Metrics** - Timing and performance data

### CI/CD Integration

Tests are configured for continuous integration:

```bash
# CI-specific configuration
CI=true ./scripts/testing/run-e2e-tests.sh

# Features for CI:
# - Automatic retry on failure (2 retries)
# - JUnit XML output for test reporting
# - Parallel test execution disabled for stability
# - No interactive reports
```

## Writing E2E Tests

### Test Structure

Follow this pattern for new E2E tests:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup for each test
    await page.goto('/');
  });

  test('should perform basic action @basic', async ({ page }) => {
    // Test implementation
    await page.click('[data-testid="action-button"]');
    await expect(page.locator('[data-testid="result"]')).toBeVisible();
  });

  test('should handle collaboration @collaboration', async ({
    page,
    context
  }) => {
    // Multi-user collaboration test
    const secondPage = await context.newPage();
    // Test real-time collaboration
  });
});
```

### Best Practices

#### Test Data Management

```typescript
// Use test fixtures for consistent data
import { getTestUser, getTestDocument } from '../fixtures/e2e-test-data.js';

const alice = getTestUser('alice@example.com');
const welcomeDoc = getTestDocument('Welcome Document');
```

#### Page Object Pattern

```typescript
// Create reusable page objects
class DocumentEditorPage {
  constructor(page) {
    this.page = page;
    this.titleInput = page.locator('[data-testid="document-title"]');
    this.contentArea = page.locator('[data-testid="editor-content"]');
    this.saveButton = page.locator('[data-testid="save-document"]');
  }

  async editTitle(title) {
    await this.titleInput.fill(title);
  }

  async editContent(content) {
    await this.contentArea.fill(content);
  }

  async save() {
    await this.saveButton.click();
  }
}
```

#### Waiting Strategies

```typescript
// Wait for network requests
await page.waitForResponse('/api/documents');

// Wait for real-time updates
await page.waitForFunction(() =>
  document.querySelector('[data-testid="sync-indicator"]')?.textContent === 'Synced'
);

// Wait for collaborative changes
await expect(page.locator('[data-testid="document-content"]'))
  .toContainText('Updated by collaborator');
```

## Troubleshooting E2E Tests

### Common Issues

#### Test Timeouts

```bash
# Increase timeout for slow operations
TIMEOUT=600 make test-e2e-basic

# Run with debug for detailed output
./scripts/testing/run-e2e-tests.sh --debug basic
```

#### Browser Installation Issues

```bash
# Reinstall browsers
pnpm playwright install --force

# Check browser installation
pnpm playwright install --dry-run
```

#### Database Connection Issues

```bash
# Reset E2E database
make db-reset
node test/fixtures/e2e-test-data.js

# Check MongoDB connection
docker ps | grep mongo
docker logs $(docker ps -q -f name=mongo)
```

#### Development Server Issues

```bash
# Manual server startup
make dev

# Check server health
curl http://localhost:3000
curl http://localhost:3001/health

# View server logs
tail -f .logs/dev-server.log
```

### Debugging Tests

#### Interactive Debugging

```bash
# Run tests with visible browser
./scripts/testing/run-e2e-tests.sh --headed basic

# Interactive debugging mode
pnpm test:e2e:debug

# Setup environment only for manual testing
./scripts/testing/run-e2e-tests.sh --setup-only
```

#### Test Artifacts

When tests fail, check these locations for debugging information:

```bash
# Screenshots and videos
ls -la test/e2e/results/test-results/

# HTML test report
open test/e2e/reports/html/index.html

# JSON results for detailed analysis
cat test/e2e/reports/results.json | jq '.suites[0].specs'

# Test logs
tail -f .logs/e2e-tests-*.log
```

## Performance Monitoring

### Metrics Collected

E2E tests automatically collect performance metrics:

- **Page Load Times** - Initial page rendering
- **API Response Times** - Backend request performance
- **Memory Usage** - Browser memory consumption
- **Network Activity** - Request/response analysis
- **Rendering Performance** - Paint and layout timing

### Performance Assertions

```typescript
// Assert page load performance
test('should load quickly @performance', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('/documents');
  const loadTime = Date.now() - startTime;

  expect(loadTime).toBeLessThan(3000); // 3 second max load time
});

// Monitor API performance
test('should have fast API responses @performance', async ({ page }) => {
  const [response] = await Promise.all([
    page.waitForResponse('/api/documents'),
    page.click('[data-testid="refresh-documents"]')
  ]);

  expect(response.status()).toBe(200);
  // Response time should be under 500ms
});
```

## Integration with Development Workflow

### Pre-commit Testing

```bash
# Quick E2E validation before commits
make test-e2e-basic

# Full validation for important changes
make test-e2e-full
```

### Feature Development

```bash
# Setup E2E environment for feature development
./scripts/testing/run-e2e-tests.sh --setup-only --no-cleanup

# Run specific tests during development
pnpm playwright test --grep="document creation"

# Interactive test development
pnpm test:e2e:ui
```

### Release Testing

```bash
# Comprehensive pre-release testing
make test-e2e-full

# Cross-browser validation
pnpm playwright test --project=chromium-desktop
pnpm playwright test --project=firefox-desktop
pnpm playwright test --project=webkit-desktop
```

## Continuous Integration

### GitHub Actions Integration

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests
on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '24'

      - name: Install dependencies
        run: pnpm install

      - name: Run E2E tests
        run: |
          CI=true ./scripts/testing/run-e2e-tests.sh

      - name: Upload test artifacts
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: e2e-test-results
          path: test/e2e/reports/
```

### Test Result Integration

- **JUnit XML** - For CI test reporting integration
- **GitHub Checks** - Automated PR status updates
- **Slack Notifications** - Test failure alerts
- **Performance Tracking** - Historical performance data

## Future Enhancements

### Planned Improvements

1. **Visual Regression Testing** - Screenshot comparison for UI changes
2. **Load Testing** - Multi-user concurrent testing
3. **Mobile Testing** - Enhanced mobile device testing
4. **API Testing** - Dedicated API endpoint testing
5. **Accessibility Automation** - Expanded a11y test coverage

### Contributing to E2E Tests

When adding new features:

1. **Add Test Data** - Update `test/fixtures/e2e-test-data.js`
2. **Create Test Specs** - Add tests in `test/e2e/specs/`
3. **Update Documentation** - Document new test scenarios
4. **Run Full Suite** - Verify all tests pass with changes

This comprehensive E2E testing infrastructure ensures our collaborative editing application works reliably across all supported browsers and devices, providing confidence in our releases and catching issues before they reach users.
