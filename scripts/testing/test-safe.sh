#!/bin/bash
# scripts/testing/test-safe.sh
set -euo pipefail

readonly TIMEOUT=120

# Declare and assign separately to avoid masking return values (SC2155)
SCRIPT_NAME="$(basename "$0")"
readonly SCRIPT_NAME

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
readonly PROJECT_ROOT

LOG_FILE="${PROJECT_ROOT}/.logs/test-safe-$(date +%s).log"
readonly LOG_FILE

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly BLUE='\033[0;34m'
readonly YELLOW='\033[1;33m'
readonly NC='\033[0m' # No Color

log() {
    echo -e "[$(date +'%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
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
    if [ $exit_code -ne 0 ]; then
        log_error "Script failed with exit code: $exit_code"
        log_info "Full log available at: $LOG_FILE"
    else
        # Clean up log file on success
        rm -f "$LOG_FILE"
    fi
    exit $exit_code
}

trap cleanup EXIT

run_with_timeout() {
    local cmd="$1"
    local timeout="${2:-$TIMEOUT}"
    local description="${3:-Command}"

    log_info "Running: $description"
    log_info "Command: $cmd"
    log_info "Timeout: ${timeout}s"

    if timeout "${timeout}s" bash -c "$cmd"; then
        log_success "$description completed successfully"
        return 0
    else
        local exit_code=$?
        if [ $exit_code -eq 124 ]; then
            log_error "$description timed out after ${timeout}s"
        else
            log_error "$description failed with exit code: $exit_code"
        fi
        return $exit_code
    fi
}

setup_test_environment() {
    log_info "Setting up test environment..."

    # Ensure log directory exists
    mkdir -p "${PROJECT_ROOT}/.logs"

    # Set test environment variables
    export NODE_ENV=test
    export MONGO_URL="${MONGO_URL:-mongodb://localhost:27017/collab_demo_test}"

    # Check if MongoDB is running
    if ! docker ps | grep -q mongo; then
        log_warning "MongoDB container not found, starting..."
        if command -v docker-compose >/dev/null 2>&1; then
            docker-compose up -d mongo || {
                log_error "Failed to start MongoDB container"
                return 1
            }
            sleep 5
        else
            log_error "Docker Compose not available and MongoDB not running"
            return 1
        fi
    fi

    log_success "Test environment setup complete"
}

run_tests() {
    log_info "Starting safe test execution..."

    local tests_run=0
    local tests_passed=0
    local tests_failed=0

    # Run unit tests if available
    if [ -f "package.json" ] && grep -q '"test"' package.json; then
        log_info "Running unit tests..."
        if run_with_timeout "pnpm test" 60 "Unit tests"; then
            ((tests_passed++))
        else
            ((tests_failed++))
        fi
        ((tests_run++))
    fi

    # Check if server is available for integration tests
    log_info "Checking server availability for integration tests..."
    local server_available=false
    if curl -s --max-time 2 "http://localhost:3001/health" >/dev/null 2>&1; then
        server_available=true
        log_info "Server detected on localhost:3001"
    else
        log_warning "Server not running on localhost:3001"
        log_warning "Skipping integration tests (require live server)"
        log_info "💡 To run integration tests: Start server with 'make dev' in another terminal"
    fi

    # Run integration tests only if server is available
    if [ "$server_available" = true ]; then
        local integration_tests=(
            "test/integration/user-workflows.test.js"
            "test/integration/server.test.js"
            "test/integration/rate-limit.test.js"
        )

        log_info "Running integration tests against live server..."
        for test_file in "${integration_tests[@]}"; do
            if [ -f "$test_file" ]; then
                local test_name
                test_name=$(basename "$test_file" .test.js)
                log_info "Running integration test: $test_name"

                if run_with_timeout "node $test_file" 60 "Integration test: $test_name"; then
                    ((tests_passed++))
                else
                    ((tests_failed++))
                fi
                ((tests_run++))
            else
                log_warning "Test file not found: $test_file"
            fi
        done
    fi

    # Summary
    log_info "Test Summary:"
    log_info "  Tests run: $tests_run"
    log_success "  Tests passed: $tests_passed"
    if [ $tests_failed -gt 0 ]; then
        log_error "  Tests failed: $tests_failed"
    else
        log_info "  Tests failed: $tests_failed"
    fi

    if [ $tests_failed -eq 0 ] && [ $tests_run -gt 0 ]; then
        log_success "All tests passed!"
        return 0
    else
        log_error "Some tests failed or no tests were run"
        return 1
    fi
}

main() {
    cd "$PROJECT_ROOT"

    log_info "Starting $SCRIPT_NAME..."
    log_info "Project root: $PROJECT_ROOT"
    log_info "Log file: $LOG_FILE"

    setup_test_environment || {
        log_error "Test environment setup failed"
        exit 1
    }

    run_tests || {
        log_error "Test execution failed"
        exit 1
    }

    log_success "$SCRIPT_NAME completed successfully"
}

main "$@"
