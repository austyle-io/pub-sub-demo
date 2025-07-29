#!/bin/bash
# Gemini Code Quality Check Hook
# Ensures no linting, formatting, or type-check violations before exiting workflow

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Track overall status
EXIT_CODE=0
ERRORS=()

# Function to log with timestamp
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

# Function to log errors
log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ✗ $1${NC}"
    ERRORS+=("$1")
}

# Function to log success
log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✓ $1${NC}"
}

# Function to log warning
log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠ $1${NC}"
}

# Change to project root
cd "$(dirname "$0")/../.." || exit 1

log "Starting quality checks for Gemini workflow..."

# 1. Run Biome linting check (including scripts directory)
log "Running Biome linting (including ./scripts)..."
BIOME_LINT_OUTPUT=$(pnpm biome check --formatter-enabled=false . ./scripts 2>&1)
if echo "$BIOME_LINT_OUTPUT" | grep -q "Checked [0-9]* files? in [0-9]*.*ms. No fixes applied."; then
    log_success "Biome linting passed"
else
    if echo "$BIOME_LINT_OUTPUT" | grep -q "Found [0-9]* error"; then
        log_error "Biome linting failed"
        EXIT_CODE=1
    else
        log_warning "Biome found issues but they may be auto-fixable"
    fi
fi

# 2. Run Biome formatting check (including scripts directory)
log "Running Biome formatting check (including ./scripts)..."
FORMATTER_OUTPUT=$(pnpm biome check --formatter-enabled=true --linter-enabled=false . ./scripts 2>&1)
if echo "$FORMATTER_OUTPUT" | grep -q "Checked [0-9]* files? in [0-9]*.*ms. No fixes applied."; then
    log_success "Biome formatting check passed"
else
    if echo "$FORMATTER_OUTPUT" | grep -q "Found [0-9]* error"; then
        log_error "Biome formatting check failed"
        EXIT_CODE=1
    else
        log_warning "Some files need formatting"
    fi
fi

# 3. Run TypeScript type checking
log "Running TypeScript type checking..."

# Check client
log "  Checking client types..."
if pnpm exec tsc -p apps/client/tsconfig.json --noEmit 2>&1; then
    log_success "Client type check passed"
else
    log_error "Client type check failed"
    EXIT_CODE=1
fi

# Check server
log "  Checking server types..."
if pnpm exec tsc -p apps/server/tsconfig.json --noEmit 2>&1; then
    log_success "Server type check passed"
else
    log_error "Server type check failed"
    EXIT_CODE=1
fi

# Check shared package
log "  Checking shared package types..."
if pnpm exec tsc -p packages/shared/tsconfig.json --noEmit 2>&1; then
    log_success "Shared package type check passed"
else
    log_error "Shared package type check failed"
    EXIT_CODE=1
fi

# Check scripts directory
log "  Checking scripts directory types..."
if pnpm exec tsc -p scripts/tsconfig.json --noEmit 2>&1; then
    log_success "Scripts type check passed"
else
    log_error "Scripts type check failed"
    EXIT_CODE=1
fi

# 4. Check for TODO items in code
log "Checking for unresolved TODOs..."
TODO_COUNT=$(grep -r "TODO\|FIXME\|HACK\|XXX" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.next . 2>/dev/null | wc -l || echo "0")
if [ "$TODO_COUNT" -gt 0 ]; then
    log_warning "Found $TODO_COUNT TODO/FIXME/HACK comments in code"
fi

# 5. Check for console.log statements (production code shouldn't have them)
log "Checking for console.log statements..."
# Check main code (excluding scripts)
MAIN_CONSOLE_COUNT=$(grep -r "console\.log" --include="*.ts" --include="*.tsx" --exclude="*.test.*" --exclude="*.spec.*" --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=scripts --exclude-dir=test . 2>/dev/null | wc -l || echo "0")
# Check scripts separately (allowing in debug/development scripts but not in tools)
SCRIPT_CONSOLE_COUNT=$(grep -r "console\.log" --include="*.ts" --include="*.tsx" --exclude="*.test.*" --exclude="*.spec.*" --exclude-dir=node_modules scripts/magic-value-tool 2>/dev/null | wc -l || echo "0")
CONSOLE_COUNT=$((MAIN_CONSOLE_COUNT + SCRIPT_CONSOLE_COUNT))
if [ "$CONSOLE_COUNT" -gt 0 ]; then
    log_warning "Found $CONSOLE_COUNT console.log statements in production code (main: $MAIN_CONSOLE_COUNT, scripts: $SCRIPT_CONSOLE_COUNT)"
fi

# Generate summary
echo ""
log "Quality Check Summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $EXIT_CODE -eq 0 ]; then
    log_success "All quality checks passed! ✨"

    # Output JSON for Gemini
    cat <<EOF
{
  "status": "success",
  "message": "All quality checks passed",
  "details": {
    "linting": "passed",
    "formatting": "passed",
    "typeCheck": "passed",
    "todoCount": $TODO_COUNT,
    "consoleLogCount": $CONSOLE_COUNT
  }
}
EOF
else
    log_error "Quality checks failed!"
    echo ""
    echo "Errors found:"
    for error in "${ERRORS[@]}"; do
        echo "  • $error"
    done
    echo ""
    log_warning "Please fix these issues before committing."

    # Output JSON for Gemini with blocking error
    cat <<EOF
{
  "status": "error",
  "message": "Quality checks failed - ${#ERRORS[@]} issues found",
  "errors": [$(printf '"%s",' "${ERRORS[@]}" | sed 's/,$//')],
  "details": {
    "todoCount": $TODO_COUNT,
    "consoleLogCount": $CONSOLE_COUNT
  }
}
EOF

    # Exit code 2 blocks the workflow in Gemini
    exit 2
fi

exit $EXIT_CODE
