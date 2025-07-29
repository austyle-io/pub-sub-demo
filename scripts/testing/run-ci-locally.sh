#!/bin/bash
# scripts/testing/run-ci-locally.sh
# Simulate GitHub Actions CI workflow locally

set -euo pipefail

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly BLUE='\033[0;34m'
readonly YELLOW='\033[1;33m'
readonly NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $*"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $*"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $*"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $*"
}

# Set CI environment variables
export CI=true
export NODE_ENV=test
export NODE_OPTIONS="--max-old-space-size=4096"
export VITE_CJS_IGNORE_WARNING=true

# Set JWT secrets for testing
export JWT_ACCESS_SECRET="test-access-secret-key-for-local-ci-environment" # pragma: allowlist secret
export JWT_REFRESH_SECRET="test-refresh-secret-key-for-local-ci-environment" # pragma: allowlist secret

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}    Local CI Workflow Simulation${NC}"
echo -e "${BLUE}========================================${NC}"
echo

# Step 1: Debug environment
log_info "Step 1: Debug environment"
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "PNPM version: $(pnpm --version)"
echo "NODE_ENV: $NODE_ENV"
echo "CI: $CI"
echo

# Step 2: Install dependencies
log_info "Step 2: Install dependencies"
if pnpm install --frozen-lockfile; then
    log_success "Dependencies installed successfully"
else
    log_error "Failed to install dependencies"
    exit 1
fi
echo

# Step 3: Build packages
log_info "Step 3: Build packages"
if pnpm run build; then
    log_success "Packages built successfully"
else
    log_error "Failed to build packages"
    exit 1
fi
echo

# Step 4: Run Biome check
log_info "Step 4: Run Biome check"
if pnpm lint; then
    log_success "Biome check passed"
else
    log_error "Biome check failed"
    exit 1
fi
echo

# Step 5: Run type check
log_info "Step 5: Run type check"
if pnpm run type-check; then
    log_success "Type check passed"
else
    log_error "Type check failed"
    exit 1
fi
echo

# Step 6: Run tests
log_info "Step 6: Run tests"
if pnpm run test; then
    log_success "Tests passed"
else
    log_error "Tests failed"
    exit 1
fi
echo

# Step 7: Security audit (optional, continue on error)
log_info "Step 7: Security audit"
if pnpm audit --audit-level=high; then
    log_success "Security audit passed"
else
    log_warning "Security audit found issues (continuing)"
fi
echo

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}    All CI checks passed! ✅${NC}"
echo -e "${GREEN}========================================${NC}"
