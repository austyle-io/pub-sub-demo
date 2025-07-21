#!/bin/bash
# scripts/testing/run-integration-tests.sh
set -euo pipefail

# Declare and assign separately to avoid masking return values (SC2155)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly SCRIPT_DIR

PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
readonly PROJECT_ROOT

LOG_FILE="${PROJECT_ROOT}/.logs/integration-tests-$(date +%s).log"
readonly LOG_FILE

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly BLUE='\033[0;34m'
readonly YELLOW='\033[1;33m'
readonly NC='\033[0m'

log() {
    echo -e "[INTEGRATION] $*" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $*" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $*" | tee -a "$LOG_FILE"
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $*" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $*" | tee -a "$LOG_FILE"
}

cleanup() {
    local exit_code=$?

    log_info "Cleaning up test environment..."

    # Clean test database if mongosh is available
    if command -v mongosh >/dev/null 2>&1; then
        mongosh "$MONGO_URL" --eval "db.dropDatabase()" --quiet 2>/dev/null || {
            log_warning "Could not clean test database"
        }
    fi

    if [ $exit_code -ne 0 ]; then
        log_error "Integration tests failed with exit code: $exit_code"
        log_info "Full log available at: $LOG_FILE"
    else
        log_success "All integration tests completed successfully"
        # Keep log file for review even on success
    fi

    exit $exit_code
}

trap cleanup EXIT

setup_test_environment() {
    log_info "Setting up integration test environment..."

    # Ensure log directory exists
    mkdir -p "${PROJECT_ROOT}/.logs"

    # Set test environment variables
    export NODE_ENV=test
    export MONGO_URL="${MONGO_URL:-mongodb://localhost:27017/collab_demo_test}"
    export JWT_SECRET="${JWT_SECRET:-test-secret-key-integration}"

    log_info "Environment variables:"
    log_info "  NODE_ENV: $NODE_ENV"
    log_info "  MONGO_URL: $MONGO_URL"
    log_info "  JWT_SECRET: [REDACTED]"

    # Ensure MongoDB is running
    if ! docker ps | grep -q mongo; then
        log_warning "MongoDB container not found, starting..."
        if command -v docker-compose >/dev/null 2>&1; then
            docker-compose up -d mongo || {
                log_error "Failed to start MongoDB container"
                return 1
            }
            log_info "Waiting for MongoDB to be ready..."
            sleep 10
        else
            log_error "Docker Compose not available and MongoDB not running"
            return 1
        fi
    fi

    # Test MongoDB connection
    if command -v mongosh >/dev/null 2>&1; then
        if mongosh "$MONGO_URL" --eval "db.runCommand('ping')" --quiet >/dev/null 2>&1; then
            log_success "MongoDB connection verified"
        else
            log_error "MongoDB connection failed"
            return 1
        fi
    else
        log_warning "mongosh not available, skipping connection test"
    fi

    log_success "Test environment setup complete"
}

run_integration_test() {
    local test_file="$1"
    local test_name
    test_name="$(basename "$test_file" .test.js)"

    log_info "Running integration test: $test_name"
    log_info "File: $test_file"

    # Check if test file exists
    if [ ! -f "$test_file" ]; then
        log_error "Test file not found: $test_file"
        return 1
    fi

    # Run the test with timeout
    local start_time
    start_time=$(date +%s)

    if timeout 120s node "$test_file" 2>&1 | tee -a "$LOG_FILE"; then
        local end_time
        end_time=$(date +%s)
        local duration=$((end_time - start_time))
        log_success "✅ $test_name completed in ${duration}s"
        return 0
    else
        local exit_code=$?
        local end_time
        end_time=$(date +%s)
        local duration=$((end_time - start_time))

        if [ $exit_code -eq 124 ]; then
            log_error "❌ $test_name timed out after ${duration}s"
        else
            log_error "❌ $test_name failed in ${duration}s (exit code: $exit_code)"
        fi
        return $exit_code
    fi
}

run_integration_tests() {
    log_info "Starting integration test suite..."

    local tests_run=0
    local tests_passed=0
    local tests_failed=0
    local failed_tests=()

    # Define integration tests in order of dependency
    local integration_tests=(
        "test/integration/server.test.js"
        "test/integration/rate-limit.test.js"
        "test/integration/user-workflows.test.js"
    )

    # Run each test
    for test_file in "${integration_tests[@]}"; do
        if [ -f "$test_file" ]; then
            ((tests_run++))

            if run_integration_test "$test_file"; then
                ((tests_passed++))
            else
                ((tests_failed++))
                failed_tests+=("$(basename "$test_file" .test.js)")
            fi

            # Brief pause between tests
            sleep 2
        else
            log_warning "Test file not found: $test_file"
        fi
    done

    # Print summary
    log_info ""
    log_info "=== Integration Test Summary ==="
    log_info "Tests run: $tests_run"
    log_success "Tests passed: $tests_passed"

    if [ $tests_failed -gt 0 ]; then
        log_error "Tests failed: $tests_failed"
        log_error "Failed tests:"
        for failed_test in "${failed_tests[@]}"; do
            log_error "  - $failed_test"
        done
    else
        log_info "Tests failed: $tests_failed"
    fi

    log_info "Full log: $LOG_FILE"
    log_info "==============================="

    return $tests_failed
}

main() {
    cd "$PROJECT_ROOT"

    log_info "Starting integration test runner..."
    log_info "Project root: $PROJECT_ROOT"
    log_info "Log file: $LOG_FILE"
    log_info "Timestamp: $(date)"

    setup_test_environment || {
        log_error "Test environment setup failed"
        exit 1
    }

    run_integration_tests || {
        log_error "Integration tests failed"
        exit 1
    }

    log_success "All integration tests completed successfully!"
}

main "$@"
