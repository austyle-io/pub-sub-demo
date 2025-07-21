#!/bin/bash
set -euo pipefail

# Declare and assign separately to avoid masking return values (SC2155)
SCRIPT_NAME="$(basename "$0")"
readonly SCRIPT_NAME

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
readonly PROJECT_ROOT

log() {
    echo "[VALIDATION] $*"
}

check_console_usage() {
    log "Checking for remaining console statements..."

    local console_count=0

    # Check production code (exclude test files)
    while IFS= read -r file; do
        if grep -q "console\.\(log\|error\|warn\|info\|debug\)" "$file"; then
            echo "❌ Console statement found in: $file"
            grep -n "console\.\(log\|error\|warn\|info\|debug\)" "$file"
            ((console_count++))
        fi
    done < <(find apps packages -name "*.ts" -o -name "*.tsx" -o -name "*.js" | grep -v "__tests__" | grep -v "test")

    if [ $console_count -eq 0 ]; then
        log "✅ No console statements found in production code"
        return 0
    else
        log "❌ Found $console_count files with console statements"
        return 1
    fi
}

check_logger_imports() {
    log "Checking for proper logger imports..."

    # Check that files using logging import the logger
    local missing_imports=0

    while IFS= read -r file; do
        if grep -q "\.info\|\.error\|\.warn\|\.debug" "$file" && ! grep -q "import.*Logger\|from.*logger" "$file"; then
            echo "❌ Missing logger import in: $file"
            ((missing_imports++))
        fi
    done < <(find apps packages -name "*.ts" -o -name "*.tsx" | grep -v "__tests__")

    if [ $missing_imports -eq 0 ]; then
        log "✅ All files have proper logger imports"
        return 0
    else
        log "❌ Found $missing_imports files missing logger imports"
        return 1
    fi
}

main() {
    cd "$PROJECT_ROOT"

    log "Starting logging validation..."

    local errors=0

    check_console_usage || ((errors++))
    check_logger_imports || ((errors++))

    if [ $errors -eq 0 ]; then
        log "✅ All logging validation checks passed"
    else
        log "❌ Logging validation failed with $errors errors"
        exit 1
    fi
}

main "$@"
