#!/bin/bash
# scripts/testing/run-e2e-tests.sh
set -euo pipefail

# Declare and assign separately to avoid masking return values (SC2155)
SCRIPT_NAME="$(basename "$0")"
readonly SCRIPT_NAME
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
readonly PROJECT_ROOT
LOG_FILE="${PROJECT_ROOT}/.logs/e2e-tests-$(date +%s).log"
readonly LOG_FILE
readonly TIMEOUT=300 # 5 minutes for E2E tests

# Colors
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
    log_info "Cleaning up E2E test environment..."

    # Stop development servers if they were started by this script
    if [ "${STARTED_SERVERS:-false}" = "true" ]; then
        log_info "Stopping development servers..."
        pkill -f "make dev" 2>/dev/null || true
        docker-compose down 2>/dev/null || true
    fi

    if [ $exit_code -ne 0 ]; then
        log_error "E2E tests failed with exit code: $exit_code"
        log_info "Full log available at: $LOG_FILE"

        # Show recent browser/test logs
        if [ -d "test/e2e/reports" ]; then
            log_info "Recent test artifacts:"
            find test/e2e/reports -name "*.log" -o -name "*.json" | head -5
        fi
    else
        # Clean up log file on success
        rm -f "$LOG_FILE"
    fi

    exit $exit_code
}

trap cleanup EXIT

setup_e2e_environment() {
    log_info "Setting up E2E test environment..."

    # Ensure log directory exists
    mkdir -p "${PROJECT_ROOT}/.logs"
    mkdir -p "${PROJECT_ROOT}/test/e2e/reports"
    mkdir -p "${PROJECT_ROOT}/test/e2e/fixtures/auth"

    # Set E2E test environment variables
    export NODE_ENV=test
    export MONGO_URL="${MONGO_URL:-mongodb://localhost:27017/collab_demo_e2e}"
    export JWT_ACCESS_SECRET="test-access-secret-for-e2e-testing-only"
    export JWT_REFRESH_SECRET="test-refresh-secret-for-e2e-testing-only"
    export E2E_BASE_URL="http://localhost:3000"

    log_success "E2E environment variables set"
}

check_prerequisites() {
    log_info "Checking E2E testing prerequisites..."

    # Check if Playwright is installed
    if ! command -v npx >/dev/null 2>&1; then
        log_error "npx not found. Please install Node.js and npm."
        return 1
    fi

    # Check if pnpm is available
    if ! command -v pnpm >/dev/null 2>&1; then
        log_error "pnpm not found. Please install pnpm globally."
        return 1
    fi

    # Check if Docker is running
    if ! docker info >/dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker."
        return 1
    fi

    # Check if MongoDB container is available
    if ! docker ps | grep -q mongo; then
        log_warning "MongoDB container not found, will start it..."
        docker-compose up -d mongo || {
            log_error "Failed to start MongoDB container"
            return 1
        }
        sleep 5
    fi

    log_success "Prerequisites check completed"
}

install_playwright_browsers() {
    log_info "Installing Playwright browsers..."

    # Install Playwright browsers if not already installed
    if ! pnpm playwright install --help >/dev/null 2>&1; then
        log_info "Installing Playwright..."
        pnpm add -D @playwright/test@latest
    fi

    # Install browsers
    pnpm playwright install chromium firefox webkit || {
        log_error "Failed to install Playwright browsers"
        return 1
    }

    log_success "Playwright browsers installed"
}

setup_test_database() {
    log_info "Setting up E2E test database..."

    # Setup database with test fixtures
    node -e "
    const { setupE2EDatabase } = require('./test/fixtures/e2e-test-data.js');
    setupE2EDatabase('${MONGO_URL}')
        .then(() => console.log('✅ E2E database setup completed'))
        .catch(err => {
            console.error('❌ E2E database setup failed:', err);
            process.exit(1);
        });
    " || {
        log_error "Failed to setup E2E test database"
        return 1
    }

    log_success "E2E test database setup completed"
}

start_development_servers() {
    log_info "Starting development servers for E2E testing..."

    # Check if servers are already running
    if curl -s "http://localhost:3000" >/dev/null 2>&1 && curl -s "http://localhost:3001/health" >/dev/null 2>&1; then
        log_info "Development servers already running"
        return 0
    fi

    # Start development servers in background
    log_info "Starting development servers..."
    nohup make dev > "${PROJECT_ROOT}/.logs/dev-server.log" 2>&1 &
    export STARTED_SERVERS=true

    # Wait for servers to be ready
    local max_attempts=30
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if curl -s "http://localhost:3000" >/dev/null 2>&1 && curl -s "http://localhost:3001/health" >/dev/null 2>&1; then
            log_success "Development servers are ready"
            return 0
        fi

        log_info "Waiting for servers to start... (attempt $attempt/$max_attempts)"
        sleep 2
        ((attempt++))
    done

    log_error "Development servers failed to start after $max_attempts attempts"
    return 1
}

run_e2e_tests() {
    log_info "Running E2E tests..."

    local test_mode="${1:-all}"
    local test_project="${2:-chromium-desktop}"

    case "$test_mode" in
        "basic")
            log_info "Running basic E2E tests..."
            pnpm playwright test --project="$test_project" --grep="@basic" || return 1
            ;;
        "collaboration")
            log_info "Running collaboration E2E tests..."
            pnpm playwright test --project="collaboration-chrome" --grep="@collaboration" || return 1
            ;;
        "performance")
            log_info "Running performance E2E tests..."
            pnpm playwright test --project="performance" --grep="@performance" || return 1
            ;;
        "accessibility")
            log_info "Running accessibility E2E tests..."
            pnpm playwright test --project="accessibility" --grep="@a11y" || return 1
            ;;
        "all")
            log_info "Running all E2E tests..."
            pnpm playwright test || return 1
            ;;
        *)
            log_error "Unknown test mode: $test_mode"
            log_info "Available modes: basic, collaboration, performance, accessibility, all"
            return 1
            ;;
    esac

    log_success "E2E tests completed successfully"
}

generate_test_report() {
    log_info "Generating E2E test report..."

    # Generate HTML report
    if [ -f "test/e2e/reports/results.json" ]; then
        pnpm playwright show-report test/e2e/reports/html || {
            log_warning "Failed to generate HTML report"
        }
    fi

    # Create summary report
    local summary_file="${PROJECT_ROOT}/test/e2e/reports/summary.txt"
    {
        echo "E2E Test Run Summary"
        echo "==================="
        echo "Date: $(date)"
        echo "Duration: ${SECONDS} seconds"
        echo ""
        echo "Environment:"
        echo "- Node.js: $(node --version)"
        echo "- MongoDB: ${MONGO_URL}"
        echo "- Base URL: ${E2E_BASE_URL}"
        echo ""
        echo "Test Artifacts:"
        echo "- HTML Report: test/e2e/reports/html/index.html"
        echo "- JSON Results: test/e2e/reports/results.json"
        echo "- Screenshots: test/e2e/results/test-results/"
        echo "- Videos: test/e2e/results/test-results/"
        echo ""
    } > "$summary_file"

    log_success "E2E test report generated: $summary_file"
}

show_help() {
    cat << EOF
Usage: $SCRIPT_NAME [OPTIONS] [TEST_MODE] [PROJECT]

Run end-to-end tests for the collaborative editing application.

TEST_MODE:
    basic          Run basic functionality tests
    collaboration  Run collaboration-specific tests
    performance    Run performance tests
    accessibility  Run accessibility tests
    all           Run all tests (default)

PROJECT:
    chromium-desktop    Desktop Chrome (default)
    firefox-desktop     Desktop Firefox
    webkit-desktop      Desktop Safari
    mobile-chrome       Mobile Chrome
    mobile-safari       Mobile Safari

OPTIONS:
    -h, --help     Show this help message
    --setup-only   Only setup environment, don't run tests
    --no-cleanup   Don't cleanup after tests
    --debug        Run with debug output
    --headed       Run tests in headed mode (visible browser)

Examples:
    $SCRIPT_NAME                                    # Run all tests
    $SCRIPT_NAME basic chromium-desktop            # Run basic tests in Chrome
    $SCRIPT_NAME collaboration                     # Run collaboration tests
    $SCRIPT_NAME --setup-only                      # Setup environment only
    $SCRIPT_NAME --debug basic                     # Run basic tests with debug

Environment Variables:
    MONGO_URL      MongoDB connection URL
    E2E_BASE_URL   Base URL for the application
    TIMEOUT        Test timeout in seconds (default: 300)
    CI             Set to 'true' for CI environment
EOF
}

main() {
    local test_mode="all"
    local test_project="chromium-desktop"
    local setup_only=false
    local no_cleanup=false
    local debug_mode=false
    local headed_mode=false

    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            --setup-only)
                setup_only=true
                shift
                ;;
            --no-cleanup)
                no_cleanup=true
                shift
                ;;
            --debug)
                debug_mode=true
                export DEBUG="*"
                shift
                ;;
            --headed)
                headed_mode=true
                export PLAYWRIGHT_HEADLESS=false
                shift
                ;;
            basic|collaboration|performance|accessibility|all)
                test_mode="$1"
                shift
                ;;
            chromium-desktop|firefox-desktop|webkit-desktop|mobile-chrome|mobile-safari)
                test_project="$1"
                shift
                ;;
            *)
                log_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done

    cd "$PROJECT_ROOT"

    log_info "Starting E2E test execution..."
    log_info "Mode: $test_mode"
    log_info "Project: $test_project"
    log_info "Setup only: $setup_only"
    log_info "Debug mode: $debug_mode"
    log_info "Headed mode: $headed_mode"

    # Setup phase
    setup_e2e_environment || exit 1
    check_prerequisites || exit 1
    install_playwright_browsers || exit 1
    setup_test_database || exit 1
    start_development_servers || exit 1

    if [ "$setup_only" = "true" ]; then
        log_success "E2E environment setup completed. Servers are running."
        log_info "You can now run tests manually with: pnpm playwright test"
        exit 0
    fi

    # Test execution phase
    run_e2e_tests "$test_mode" "$test_project" || exit 1

    # Reporting phase
    generate_test_report

    log_success "E2E test execution completed successfully!"

    if [ "$no_cleanup" = "true" ]; then
        log_info "Skipping cleanup. Servers will continue running."
        export STARTED_SERVERS=false
    fi
}

main "$@"
