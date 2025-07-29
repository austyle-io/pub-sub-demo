#!/bin/bash
# Git hooks uninstallation script for Pub-Sub Collaborative Editing Demo
# Removes the git hooks framework and restores backups if available

set -euo pipefail

# Declare and assign separately to avoid masking return values (SC2155)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly SCRIPT_DIR
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
readonly PROJECT_ROOT
GIT_HOOKS_DIR="$PROJECT_ROOT/.git/hooks"
readonly GIT_HOOKS_DIR

# Source shared utilities
# shellcheck disable=SC1091
source "$SCRIPT_DIR/shared/colors.sh"

print_section "Git Hooks Uninstallation"
print_info "Removing Git hooks framework..."

# Check if we're in a git repository
if [ ! -d "$PROJECT_ROOT/.git" ]; then
    print_error "Not in a git repository"
    exit 1
fi

# Remove installed hooks
print_subsection "Removing hooks"

HOOKS=("pre-commit" "commit-msg" "pre-push")
for hook in "${HOOKS[@]}"; do
    if [ -L "$GIT_HOOKS_DIR/$hook" ]; then
        rm "$GIT_HOOKS_DIR/$hook"
        print_check "Removed $hook hook"
    elif [ -f "$GIT_HOOKS_DIR/$hook" ]; then
        print_warning "$hook exists but is not a symlink (manual installation?)"
        print_info "Manually remove: $GIT_HOOKS_DIR/$hook"
    fi
done

# Find and offer to restore backups
print_subsection "Backup restoration"
# Use mapfile to avoid SC2207 warning
mapfile -t BACKUP_DIRS < <(find "$GIT_HOOKS_DIR" -type d -name "backup-*" 2>/dev/null | sort -r)

if [ ${#BACKUP_DIRS[@]} -gt 0 ]; then
    print_info "Found backup directories:"
    for i in "${!BACKUP_DIRS[@]}"; do
        echo "  $((i+1)). $(basename "${BACKUP_DIRS[$i]}")"
    done
    echo ""

    read -p "Restore from backup? (y/N): " -r
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Use the most recent backup (first in sorted list)
        BACKUP_DIR="${BACKUP_DIRS[0]}"
        print_info "Restoring from $(basename "$BACKUP_DIR")..."

        for backup_file in "$BACKUP_DIR"/*; do
            if [ -f "$backup_file" ]; then
                hook_name=$(basename "$backup_file")
                cp "$backup_file" "$GIT_HOOKS_DIR/$hook_name"
                chmod +x "$GIT_HOOKS_DIR/$hook_name"
                print_check "Restored $hook_name"
            fi
        done
    fi
else
    print_info "No backups found"
fi

# Uninstall pre-commit framework hooks
print_subsection "Pre-commit framework cleanup"
if command -v pre-commit >/dev/null 2>&1; then
    if pre-commit uninstall 2>/dev/null; then
        print_check "Pre-commit framework uninstalled"
    else
        print_info "Pre-commit framework was not installed"
    fi
else
    print_info "Pre-commit not available"
fi

print_success "Git hooks framework uninstalled successfully!"
echo ""
print_info "Manual cleanup (optional):"
print_bullet "Remove backup directories: rm -rf $GIT_HOOKS_DIR/backup-*"
print_bullet "Remove hook logs: rm -f $PROJECT_ROOT/.git/hooks.log"
print_bullet "Remove secrets baseline: rm -f $PROJECT_ROOT/.secrets.baseline"
