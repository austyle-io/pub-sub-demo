#!/bin/bash
# scripts/quality/lint-safe.sh
set -euo pipefail

readonly TIMEOUT=60

# Declare and assign separately to avoid masking return values (SC2155)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly SCRIPT_DIR

PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
readonly PROJECT_ROOT

LOG_FILE="${PROJECT_ROOT}/.logs/lint-safe-$(date +%s).log"
readonly LOG_FILE

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly BLUE='\033[0;34m'
readonly YELLOW='\033[1;33m'
readonly NC='\033[0m'

log() {
    echo -e "[LINT] $*" | tee -a "$LOG_FILE"
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
        log_error "Linting failed with exit code: $exit_code"
        log_info "Full log available at: $LOG_FILE"

        # Provide helpful suggestions
        echo ""
        log_info "💡 Troubleshooting suggestions:"
        log_info "  - Try running: pnpm lint --fix"
        log_info "  - Check specific file: pnpm lint src/specific-file.ts"
        log_info "  - Review biome configuration: biome.json"
        log_info "  - Run format first: pnpm format"
    else
        log_success "Linting completed successfully"
        # Clean up log file on success
        rm -f "$LOG_FILE"
    fi
    exit $exit_code
}

trap cleanup EXIT

run_lint_check() {
    local target_dir="${1:-.}"
    local timeout="${2:-$TIMEOUT}"

    log_info "Running linting on: $target_dir"
    log_info "Timeout: ${timeout}s"

    # Ensure log directory exists
    mkdir -p "${PROJECT_ROOT}/.logs"

    # Check if biome is available (preferred)
    if command -v pnpm >/dev/null 2>&1 && pnpm list --depth=0 2>/dev/null | grep -q "@biomejs/biome"; then
        log_info "Using Biome for linting..."

        if timeout "${timeout}s" pnpm biome check "$target_dir" 2>&1 | tee -a "$LOG_FILE"; then
            log_success "✅ Biome linting passed"
            return 0
        else
            local exit_code=$?
            if [ $exit_code -eq 124 ]; then
                log_error "❌ Biome linting timed out after ${timeout}s on $target_dir"
                log_info "💡 Try running on smaller directory: pnpm biome check src/"
            else
                log_error "❌ Biome linting failed (exit code: $exit_code)"
            fi
            return $exit_code
        fi

    # Fallback to package.json lint script
    elif [ -f "package.json" ] && grep -q '"lint"' package.json; then
        log_info "Using package.json lint script..."

        if timeout "${timeout}s" pnpm lint 2>&1 | tee -a "$LOG_FILE"; then
            log_success "✅ Package lint script passed"
            return 0
        else
            local exit_code=$?
            if [ $exit_code -eq 124 ]; then
                log_error "❌ Lint script timed out after ${timeout}s"
            else
                log_error "❌ Lint script failed (exit code: $exit_code)"
            fi
            return $exit_code
        fi

    else
        log_warning "No linting configuration found"
        log_info "Available options:"
        log_info "  - Install Biome: pnpm add -D @biomejs/biome"
        log_info "  - Add lint script to package.json"
        return 1
    fi
}

run_format_check() {
    log_info "Checking code formatting..."

    # Check if biome is available
    if command -v pnpm >/dev/null 2>&1 && pnpm list --depth=0 2>/dev/null | grep -q "@biomejs/biome"; then
        if timeout 30s pnpm biome check --formatter-enabled=true --linter-enabled=false . 2>&1 | tee -a "$LOG_FILE"; then
            log_success "✅ Code formatting is correct"
            return 0
        else
            log_warning "⚠️  Code formatting issues found"
            log_info "💡 Run 'pnpm format' to fix formatting"
            return 1
        fi
    else
        log_info "Biome not available, skipping format check"
        return 0
    fi
}

run_shellcheck() {
    log_info "Running shellcheck on shell scripts..."

    # Find shell scripts
    local shell_files=()
    while IFS= read -r -d '' file; do
        shell_files+=("$file")
    done < <(find . -name "*.sh" -not -path "./node_modules/*" -not -path "./.git/*" -print0)

    if [ ${#shell_files[@]} -eq 0 ]; then
        log_info "No shell scripts found to check"
        return 0
    fi

    log_info "Found ${#shell_files[@]} shell script(s) to check"

    # Check if shellcheck is available
    if ! command -v shellcheck >/dev/null 2>&1; then
        log_warning "Shellcheck not available, skipping shell script checks"
        log_info "Install with: brew install shellcheck (macOS) or apt install shellcheck (Ubuntu)"
        return 0
    fi

    # Run shellcheck (treat warnings as errors)
    local failed_files=()
    for file in "${shell_files[@]}"; do
        if ! shellcheck -S error "$file" 2>&1 | tee -a "$LOG_FILE"; then
            failed_files+=("$file")
        fi
    done

    if [ ${#failed_files[@]} -eq 0 ]; then
        log_success "✅ All shell scripts passed shellcheck"
        return 0
    else
        log_error "❌ ${#failed_files[@]} shell script(s) failed shellcheck:"
        printf '  %s\n' "${failed_files[@]}" | tee -a "$LOG_FILE"
        return 1
    fi
}

run_markdownlint() {
    log_info "Running markdownlint on documentation files..."

    # Check if markdownlint-cli2 is available
    local markdownlint_cmd=""
    if command -v markdownlint-cli2 >/dev/null 2>&1; then
        markdownlint_cmd="markdownlint-cli2"
    elif command -v pnpm >/dev/null 2>&1 && pnpm list --depth=0 2>/dev/null | grep -q "markdownlint-cli2"; then
        markdownlint_cmd="pnpm exec markdownlint-cli2"
    else
        log_warning "markdownlint-cli2 not available, skipping markdown checks"
        log_info "Install with: pnpm add -D markdownlint-cli2"
        return 0
    fi

    # Count markdown files
    local md_count
    md_count=$(find . -name "*.md" -not -path "./node_modules/*" -not -path "./.git/*" | wc -l)

    if [ "$md_count" -eq 0 ]; then
        log_info "No markdown files found to check"
        return 0
    fi

    log_info "Found $md_count markdown file(s) to check"

    # Run markdownlint (all issues treated as errors)
    # Use configuration file to ensure proper exclusions
    if timeout 30s bash -c "${markdownlint_cmd} --config .markdownlint-cli2.yaml" 2>&1 | tee -a "$LOG_FILE"; then
        log_success "✅ All markdown files passed markdownlint"
        return 0
    else
        local exit_code=$?
        if [ $exit_code -eq 124 ]; then
            log_error "❌ Markdownlint timed out after 30s"
        else
            log_error "❌ Some markdown files failed markdownlint checks"
        fi
        return $exit_code
    fi
}

main() {
    cd "$PROJECT_ROOT"

    log_info "Starting safe linting process..."
    log_info "Project root: $PROJECT_ROOT"
    log_info "Log file: $LOG_FILE"
    log_info "Timestamp: $(date)"

    local errors=0

    # Check specific directories to avoid timeouts
    local target_dirs=("src" "apps" "packages" "test" "scripts")
    local available_dirs=()

    # Find available directories
    for dir in "${target_dirs[@]}"; do
        if [ -d "$dir" ]; then
            available_dirs+=("$dir")
        fi
    done

    if [ ${#available_dirs[@]} -eq 0 ]; then
        log_warning "No standard directories found, linting entire project"
        available_dirs=(".")
    fi

    # Run linting on each directory
    for dir in "${available_dirs[@]}"; do
        log_info ""
        log_info "=== Linting directory: $dir ==="

        if ! run_lint_check "$dir" $TIMEOUT; then
            ((errors++))
            log_error "Linting failed for: $dir"
        fi
    done

    # Run format check
    log_info ""
    log_info "=== Format Check ==="
    if ! run_format_check; then
        ((errors++))
        log_error "Format check failed"
    fi

    # Run shellcheck
    log_info ""
    log_info "=== Shell Script Check ==="
    if ! run_shellcheck; then
        ((errors++))
        log_error "Shellcheck failed"
    fi

    # Run markdownlint
    log_info ""
    log_info "=== Markdown Documentation Check ==="
    if ! run_markdownlint; then
        ((errors++))
        log_error "Markdownlint failed"
    fi

    # Summary
    log_info ""
    log_info "=== Linting Summary ==="
    if [ $errors -eq 0 ]; then
        log_success "All linting checks passed! ✨"
    else
        log_error "Linting completed with $errors error(s)"
        exit 1
    fi
}

main "$@"
