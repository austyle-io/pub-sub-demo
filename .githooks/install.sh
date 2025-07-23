#!/bin/bash
# Git hooks installation script for Pub-Sub Collaborative Editing Demo
# Sets up the git hooks framework with proper permissions and configuration

set -euo pipefail

# Declare and assign separately to avoid masking return values (SC2155)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly SCRIPT_DIR
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
readonly PROJECT_ROOT
GIT_HOOKS_DIR="$(cd "$PROJECT_ROOT/.git/hooks" && pwd)"
readonly GIT_HOOKS_DIR

# Source shared utilities
# shellcheck disable=SC1091
source "$SCRIPT_DIR/shared/colors.sh"
# shellcheck disable=SC1091
source "$SCRIPT_DIR/shared/config.sh"

print_section "Git Hooks Installation"
print_info "Installing Git hooks for $PROJECT_NAME..."

# Check if we're in a git repository
if [ ! -d "$PROJECT_ROOT/.git" ]; then
    print_error "Not in a git repository"
    exit 1
fi

# Create backup directory for existing hooks
BACKUP_DIR="$GIT_HOOKS_DIR/backup-$(date +%Y%m%d_%H%M%S)"
if [ -d "$GIT_HOOKS_DIR" ]; then
    print_info "Creating backup of existing hooks..."
    mkdir -p "$BACKUP_DIR"

    # Backup existing hooks that aren't samples
    for hook in "$GIT_HOOKS_DIR"/*; do
        if [ -f "$hook" ] && [[ ! "$hook" =~ \.sample$ ]]; then
            cp "$hook" "$BACKUP_DIR/"
            print_check "Backed up $(basename "$hook")"
        fi
    done
fi

# Install hooks by creating symlinks
print_subsection "Installing hooks"

HOOKS=("pre-commit" "commit-msg" "pre-push")
for hook in "${HOOKS[@]}"; do
    if [ -f "$SCRIPT_DIR/$hook" ]; then
        # Remove existing hook if it exists
        if [ -f "$GIT_HOOKS_DIR/$hook" ]; then
            rm "$GIT_HOOKS_DIR/$hook"
        fi

        # Create symlink to our hook
        ln -s "$SCRIPT_DIR/$hook" "$GIT_HOOKS_DIR/$hook"
        chmod +x "$GIT_HOOKS_DIR/$hook"
        print_check "Installed $hook hook"
    else
        print_warning "Hook file $hook not found"
    fi
done

# Set up pre-commit framework (optional)
print_subsection "Pre-commit framework setup"
if command -v pre-commit >/dev/null 2>&1; then
    print_info "pre-commit detected, installing hooks..."
    if pre-commit install 2>/dev/null; then
        print_check "Pre-commit framework installed"
    else
        print_warning "Pre-commit installation failed, continuing without it"
    fi
else
    print_info "pre-commit not found. To install:"
    print_info "  pip3 install pre-commit"
    print_info "  Then run: pre-commit install"
fi

# Initialize secrets baseline if it doesn't exist
if [ ! -f "$PROJECT_ROOT/.secrets.baseline" ]; then
    print_info "Initializing secrets baseline..."
    if command -v detect-secrets >/dev/null 2>&1; then
        detect-secrets scan --baseline "$PROJECT_ROOT/.secrets.baseline" 2>/dev/null || true
        print_check "Secrets baseline initialized"
    else
        print_info "detect-secrets not found. Install with: pip3 install detect-secrets"
    fi
fi

# Test hook installation
print_subsection "Testing installation"
if [ -x "$GIT_HOOKS_DIR/pre-commit" ]; then
    print_check "Pre-commit hook is executable"
else
    print_cross "Pre-commit hook installation failed"
    exit 1
fi

if [ -x "$GIT_HOOKS_DIR/commit-msg" ]; then
    print_check "Commit-msg hook is executable"
else
    print_cross "Commit-msg hook installation failed"
    exit 1
fi

if [ -x "$GIT_HOOKS_DIR/pre-push" ]; then
    print_check "Pre-push hook is executable"
else
    print_cross "Pre-push hook installation failed"
    exit 1
fi

print_success "Git hooks installation completed successfully!"
echo ""
print_info "Hooks installed:"
print_bullet "pre-commit: Quality gates, security checks, and formatting"
print_bullet "commit-msg: Conventional commit message validation"
print_bullet "pre-push: Comprehensive testing and validation"
echo ""
print_info "To bypass hooks (not recommended): git commit --no-verify"
print_info "To configure hooks: edit files in .githooks/shared/config.sh"
echo ""
print_info "Environment variables for customization:"
print_bullet "GIT_HOOK_BYPASS=true - Bypass all hooks"
print_bullet "HOOK_FAIL_FAST=0 - Continue on failures"
print_bullet "HOOK_VERBOSE=1 - Verbose output"
