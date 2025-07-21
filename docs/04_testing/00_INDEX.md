# Testing Documentation

## Overview

Comprehensive testing documentation for the collaborative document editing project, covering all testing strategies and workflows.

## Testing Strategy

The project follows a **user acceptance testing** approach over code coverage metrics [[memory:3829289]], focusing on:

- **Critical path workflows** that must work end-to-end
- **Integration tests** over unit tests
- **Real user scenarios** validation
- **Multi-user collaboration** testing

## Test Organization

```
test/
├── integration/           # API and service integration tests
│   ├── user-workflows.test.js    # Complete user workflows
│   ├── server.test.js            # Server functionality
│   └── rate-limit.test.js        # Rate limiting tests
├── e2e/                  # End-to-end browser tests (planned)
├── helpers/              # Test utilities and helpers
│   └── auth-debug.js     # Authentication debugging
└── fixtures/             # Test data and mocks
```

## Testing Commands

### Quick Commands

```bash
make test                 # Run all tests safely
make test-integration     # Run integration tests
make test-user-workflows  # Run user workflow tests
make test-no-rate-limit   # Run without rate limiting
```

### Environment-specific

```bash
NODE_ENV=test make test   # Explicit test environment
NODE_ENV=test node test/integration/user-workflows.test.js
```

## Test Documentation

- [Testing Guide](testing-guide.md) - Comprehensive testing documentation
- [Manual Test Results](manual-test-results.md) - Manual testing outcomes
- [Test Helpers](../99_appendix/test-helpers.md) - Common testing utilities

## Current Test Status

### ✅ Working Tests

- User registration and authentication
- JWT token management
- Document creation via ShareDB
- Real-time collaborative editing
- Permission management
- WebSocket authentication

### 🔧 Test Environment

- **MongoDB**: Docker container for consistent testing
- **Rate Limiting**: Disabled in test environment
- **Environment**: Isolated test database
- **Authentication**: Mock users and tokens

## Test Scripts Location

All test scripts are now organized in `scripts/testing/`:

- `run-tests-no-rate-limit.sh` - Bypass rate limiting for tests
- `test-safe.sh` - Safe test execution with timeouts (planned)
- `run-integration-tests.sh` - Integration test runner (planned)

## Testing Best Practices

### Test Data Management

- Use isolated test database: `collab_demo_test`
- Clean database between test runs
- Use consistent test user accounts
- Generate deterministic test documents

### Environment Setup

```bash
# Essential test environment variables
export NODE_ENV=test
export MONGO_URL="mongodb://localhost:27017/collab_demo_test"
export JWT_SECRET="test-secret-key"
```

### Error Handling

- **Rate Limiting**: Use `NODE_ENV=test` to disable
- **Timeouts**: Set appropriate timeouts for async operations
- **Cleanup**: Always clean up test data and connections
- **Logging**: Use minimal logging in test environment

## Integration Test Coverage

### Authentication Flow

- [x] User registration with unique emails
- [x] User login with JWT token generation
- [x] Token refresh mechanism
- [x] Protected route access

### Document Management

- [x] Document creation with ShareDB
- [x] Document retrieval with permissions
- [x] Document listing with ACL filtering
- [x] Permission updates (owner, editor, viewer)

### Real-time Collaboration

- [x] WebSocket connection with JWT auth
- [x] ShareDB authorization middleware
- [x] Multi-user document editing
- [x] Operational transformation

### Known Issues & Solutions

1. **Rate Limiting**:
   - **Solution**: Use `scripts/testing/run-tests-no-rate-limit.sh`
   - **Environment**: Set `NODE_ENV=test`

2. **MongoDB Connection**:
   - **Solution**: Ensure Docker container is running
   - **Command**: `docker-compose up -d mongo`

3. **ShareDB WebSocket Warnings**:
   - **Status**: Non-critical "Invalid or unknown message" warnings
   - **Impact**: Functionality still works correctly

## Future Enhancements

### Planned Test Types

- [ ] **E2E Tests**: Browser-based multi-user collaboration
- [ ] **Performance Tests**: Load testing for real-time features
- [ ] **Security Tests**: Authentication and authorization edge cases
- [ ] **Visual Tests**: UI component regression testing

### Test Infrastructure Improvements

- [ ] **Test Runner**: Enhanced safe script execution
- [ ] **Test Reports**: Coverage and result reporting
- [ ] **CI Integration**: Automated testing in GitHub Actions
- [ ] **Test Data**: Comprehensive fixture management

## Troubleshooting

### Common Issues

**Tests Timing Out**:

```bash
# Increase timeout or run specific test
NODE_ENV=test timeout 120s node test/integration/user-workflows.test.js
```

**Database Connection Errors**:

```bash
# Check MongoDB container
docker ps | grep mongo
make db-reset  # Reset if needed
```

**Rate Limiting Errors**:

```bash
# Use the no-rate-limit script
./scripts/testing/run-tests-no-rate-limit.sh
```

## Next Steps

1. **Enhance Test Organization**: Complete migration to organized structure
2. **Implement E2E Tests**: Browser-based testing with Playwright
3. **Test Documentation**: Expand testing guides and examples
4. **CI Integration**: Automated testing in GitHub Actions
