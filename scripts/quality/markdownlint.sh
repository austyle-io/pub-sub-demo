#!/bin/bash
set -euo pipefail

# Declare and assign separately to avoid masking return values (SC2155)
SCRIPT_NAME="$(basename "$0")"
readonly SCRIPT_NAME

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
readonly PROJECT_ROOT

log() {
    echo "[MARKDOWNLINT] $*"
}

main() {
    cd "$PROJECT_ROOT"

    log "Running markdownlint on documentation files..."

    # Use pnpm exec to run markdownlint-cli2 (we know it's installed)
    local markdownlint_cmd="pnpm exec markdownlint-cli2"

    # Verify it's working
    if ! command -v pnpm >/dev/null 2>&1; then
        log "❌ pnpm not available. Cannot run markdownlint-cli2"
        return 1
    fi

    # Count markdown files
    local md_count
    md_count=$(find . -name "*.md" -not -path "./node_modules/*" -not -path "./.git/*" | wc -l)

    if [ "$md_count" -eq 0 ]; then
        log "No markdown files found to check"
        return 0
    fi

    log "Found $md_count markdown file(s) to check"

    # Run markdownlint (all issues treated as errors)
    # Use double quotes for cross-platform compatibility and exclude node_modules
    if $markdownlint_cmd "**/*.md" "#node_modules" "#.git" "#apps/*/node_modules"; then
        log "🎉 All markdown files passed markdownlint!"
        return 0
    else
        log "❌ Some markdown files failed markdownlint checks"
        return 1
    fi
}

main "$@"
