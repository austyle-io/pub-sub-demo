#!/bin/bash
set -euo pipefail

# Declare and assign separately to avoid masking return values (SC2155)
SCRIPT_NAME="$(basename "$0")"
readonly SCRIPT_NAME

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
readonly PROJECT_ROOT

log() {
    echo "[SHELLCHECK] $*"
}

main() {
    cd "$PROJECT_ROOT"

    log "Running shellcheck on shell scripts..."

    # Find all shell scripts
    local shell_files=()
    while IFS= read -r -d '' file; do
        shell_files+=("$file")
    done < <(find . -name "*.sh" -not -path "./node_modules/*" -not -path "./.git/*" -print0)

    if [ ${#shell_files[@]} -eq 0 ]; then
        log "No shell scripts found to check"
        return 0
    fi

    log "Found ${#shell_files[@]} shell script(s) to check:"
    printf '  %s\n' "${shell_files[@]}"

    # Run shellcheck with configuration (treat warnings as errors)
    local exit_code=0
    for file in "${shell_files[@]}"; do
        log "Checking: $file"
        if ! shellcheck -S error "$file"; then
            log "❌ Shellcheck failed for: $file"
            exit_code=1
        else
            log "✅ Shellcheck passed for: $file"
        fi
    done

    if [ $exit_code -eq 0 ]; then
        log "🎉 All shell scripts passed shellcheck!"
    else
        log "❌ Some shell scripts failed shellcheck checks"
    fi

    return $exit_code
}

main "$@"
