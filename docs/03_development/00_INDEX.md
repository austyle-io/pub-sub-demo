# Development Documentation

## Overview

Development workflows, tools, and best practices for the collaborative document editing project. This section covers the enhanced DevX tools implemented in Phase 2.

## Quick Commands

All development tasks are unified through the Makefile interface:

```bash
make help         # Show all available commands
make dev          # Start development environment
make setup        # Complete project setup
make test         # Run all tests safely
make quality      # Run quality checks
make db-reset     # Reset development database
```

## Safe Script Framework ✨

**Phase 2 Enhancement**: All development scripts now include timeout protection, colored output, detailed logging, and error recovery.

### Key Features

- **⏰ Timeout Protection**: Scripts automatically timeout to prevent hanging
- **📊 Detailed Logging**: Structured logging with timestamps and log levels
- **🎨 Colored Output**: Easy-to-read console output with status indicators
- **🔄 Error Recovery**: Helpful suggestions when scripts fail
- **📋 Progress Tracking**: Clear indication of what's happening
- **🛡️ ShellCheck Compliant**: All scripts follow SC2155 best practices for error handling

### Available Scripts

#### Testing Scripts

- **`scripts/testing/test-safe.sh`**: Safe test execution with environment setup
- **`scripts/testing/run-integration-tests.sh`**: Integration test automation
- **`scripts/testing/run-tests-no-rate-limit.sh`**: Bypass rate limiting for tests

#### Quality Scripts

- **`scripts/quality/lint-safe.sh`**: Safe linting with timeout protection

#### Setup Scripts

- **`scripts/setup/install-deps.sh`**: Complete project setup automation

#### Development Scripts

- **`scripts/development/reset-database.sh`**: Safe database reset with confirmation

## Development Workflow

### Daily Development

1. **Start Development**:

   ```bash
   make dev          # Starts MongoDB + development servers
   ```

2. **Run Tests**:

   ```bash
   make test         # Safe test execution
   make test-integration  # Integration tests only
   ```

3. **Check Quality**:

   ```bash
   make quality      # Lint + type-check + test
   make lint         # Safe linting only
   ```

### Project Setup

For new developers or fresh environment:

```bash
make setup        # Complete automated setup
```

This runs the comprehensive setup script that:

- ✅ Checks prerequisites (Node.js 18+, pnpm, Docker)
- ✅ Installs dependencies
- ✅ Creates environment files
- ✅ Verifies installation
- ✅ Provides next steps

### Database Management

```bash
make db-reset     # Reset database with confirmation
make db-debug     # Debug database state
```

The database reset script includes:

- **Safety checks**: Prevents production database reset
- **Confirmation prompt**: Requires explicit confirmation
- **Complete cleanup**: Stops containers, removes volumes
- **Fresh start**: Recreates containers and seeds sample data
- **Verification**: Confirms reset was successful

## Testing Infrastructure

### Test Organization

```mermaid
test/
├── integration/        # API and service integration tests
├── e2e/               # End-to-end browser tests (planned)
├── helpers/           # Test utilities and debugging tools
└── fixtures/          # Test data and seeding scripts
```

### Test Execution

- **Safe Execution**: All tests run with timeout protection
- **Environment Setup**: Automatic MongoDB container management
- **Isolated Testing**: Uses separate test database
- **Detailed Logging**: Comprehensive test output with timing

### Sample Data

The `test/fixtures/seed-dev-data.js` script provides:

- **Sample Users**: `demo@example.com`, `editor@example.com`, `viewer@example.com`
- **Sample Documents**: Pre-configured collaborative documents
- **Default Password**: `demo123` for all sample users
- **Role Testing**: Admin, editor, and viewer roles

## Error Handling & Troubleshooting

### Common Issues

**Script Timeouts**:

- Scripts automatically timeout to prevent hanging
- Logs show exact timeout duration and suggestions
- Use directory-specific commands for large codebases

**MongoDB Connection**:

- Scripts automatically start Docker containers
- Wait for MongoDB to be ready before proceeding
- Verify connection before running operations

**Permission Errors**:

- All scripts include execute permissions
- Clear error messages with troubleshooting steps
- Fallback options when tools are unavailable

### Log Files

All scripts generate detailed logs in `.logs/` directory:

- **Timestamp-based naming**: Easy to find recent logs
- **Structured output**: Consistent format across scripts
- **Error preservation**: Failed operations keep logs for debugging
- **Success cleanup**: Successful operations clean up logs

## Best Practices

### Script Development

- Use the safe script framework patterns
- Include timeout protection for long-running operations
- Provide helpful error messages and suggestions
- Test scripts in different environments

### Environment Management

- Use consistent environment variables
- Provide sensible defaults
- Validate prerequisites before execution
- Document all required tools and versions

### Database Operations

- Always use the test database for testing
- Include confirmation prompts for destructive operations
- Provide sample data for development
- Verify operations completed successfully

## Next Steps

### Phase 3 (Planned)

- Pino logging system integration
- Console.log migration
- Enhanced error handling
- Performance monitoring

### Phase 4 (Planned)

- CI/CD enhancements
- Quality automation
- Advanced documentation features
- Maintenance scripts

## Related Documentation

- [Documentation System Implementation](documentation-system-implementation.md) - Comprehensive plan for Nextra + TypeDoc migration
- [Magic Value Refactoring Tool](magic-value-refactoring/magic-value-refactoring-tool-upgrade-plan.md) - Advanced AST-based refactoring tool
- [Edge Case Analysis Report](magic-value-refactoring/edge-case-analysis-report.md) - Comprehensive edge case handling verification
- [Testing Guide](../04_testing/00_INDEX.md) - Comprehensive testing documentation
- [Getting Started](../01_getting-started/00_INDEX.md) - Setup and onboarding
- [Implementation Plans](../../plans/) - Future development roadmaps
