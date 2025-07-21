#!/bin/bash
set -euo pipefail

# Declare and assign separately to avoid masking return values (SC2155)
SCRIPT_NAME="$(basename "$0")"
readonly SCRIPT_NAME

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
readonly PROJECT_ROOT

log() {
    echo "[MIGRATION] $*"
}

find_console_statements() {
    local directory="$1"

    log "Scanning $directory for console statements..."

    # Find all console.log/error/warn statements
    grep -r -n --include="*.ts" --include="*.tsx" --include="*.js" \
         "console\.\(log\|error\|warn\|info\|debug\)" "$directory" || true
}

main() {
    cd "$PROJECT_ROOT"

    log "Starting console.log migration scan..."

    echo "=== Server Files ==="
    find_console_statements "apps/server/src"

    echo "=== Client Files ==="
    find_console_statements "apps/client/src"

    echo "=== Shared Files ==="
    find_console_statements "packages/shared/src"

    echo "=== Test Files ==="
    find_console_statements "test"

    log "Migration scan completed"
    log "Next: Replace console statements with structured logging"
}

main "$@"
