#!/bin/bash
# Common utility functions for git hooks
# Provides reusable functions across all hooks

# Source colors from shared directory
UTILS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "$UTILS_DIR/colors.sh"

# Get project root directory
get_project_root() {
  git rev-parse --show-toplevel
}

# Check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Get list of staged files
get_staged_files() {
  git diff --cached --name-only --diff-filter=ACM
}

# Get list of staged files with specific extensions
get_staged_files_with_ext() {
  local extensions="$1"
  git diff --cached --name-only --diff-filter=ACM | grep -E "\.(${extensions})$" || true
}

# Check if any files are staged
has_staged_files() {
  [ -n "$(git diff --cached --name-only --diff-filter=ACM)" ]
}

# Run a command with timeout
run_with_timeout() {
  local timeout="$1"
  shift
  local command="$*"

  if command_exists timeout; then
    timeout "$timeout" bash -c "$command"
  else
    # Fallback for systems without timeout command
    bash -c "$command" &
    local pid=$!

    local count=0
    while kill -0 $pid 2>/dev/null && [ $count -lt "$timeout" ]; do
      sleep 1
      ((count++))
    done

    if kill -0 $pid 2>/dev/null; then
      kill -9 $pid
      return 124 # timeout exit code
    fi

    wait $pid
  fi
}

# Check if running in CI environment
is_ci() {
  [ -n "${CI:-}" ] || [ -n "${CONTINUOUS_INTEGRATION:-}" ] || [ -n "${GITHUB_ACTIONS:-}" ]
}

# Skip hook if bypass is allowed
check_bypass() {
  if [ "${GIT_HOOK_BYPASS:-}" = "true" ]; then
    print_warning "Git hook bypassed via GIT_HOOK_BYPASS=true"
    exit 0
  fi

  if [ "${HUSKY_SKIP_HOOKS:-}" = "1" ]; then
    print_warning "Git hook bypassed via HUSKY_SKIP_HOOKS=1"
    exit 0
  fi
}

# Timer functions
timer_start() {
  HOOK_START_TIME=$(date +%s)
}

timer_end() {
  # Declare and assign separately to avoid masking return values (SC2155)
  local end_time
  end_time=$(date +%s)
  local duration=$((end_time - HOOK_START_TIME))
  echo "$duration"
}

# Check if file contains pattern
file_contains() {
  local file="$1"
  local pattern="$2"
  grep -q "$pattern" "$file" 2>/dev/null
}

# Stash unstaged changes
stash_unstaged() {
  # Only stash if there are unstaged changes
  if ! git diff --quiet; then
    print_info "Stashing unstaged changes..."
    git stash push -q --keep-index -m "pre-commit hook stash"
    echo "1" # Return 1 to indicate stash was created
  else
    echo "0" # Return 0 to indicate no stash
  fi
}

# Pop stashed changes
pop_stash() {
  local stashed="$1"
  if [ "$stashed" = "1" ]; then
    print_info "Restoring unstaged changes..."
    git stash pop -q
  fi
}

# Get changed files between commits
get_changed_files() {
  local base="${1:-HEAD~1}"
  local head="${2:-HEAD}"
  git diff --name-only "$base" "$head"
}

# Check if we're in a merge
is_merge() {
  [ -f "$(get_project_root)/.git/MERGE_HEAD" ]
}

# Check if we're in a rebase
is_rebase() {
  [ -d "$(get_project_root)/.git/rebase-merge" ] || [ -d "$(get_project_root)/.git/rebase-apply" ]
}

# Format file size
format_size() {
  local size="$1"
  if [ "$size" -lt 1024 ]; then
    echo "${size}B"
  elif [ "$size" -lt 1048576 ]; then
    echo "$((size / 1024))KB"
  else
    echo "$((size / 1048576))MB"
  fi
}

# Check file size
check_file_size() {
  local file="$1"
  local max_size="${2:-1048576}" # Default 1MB

  if [ -f "$file" ]; then
    # Declare and assign separately to avoid masking return values (SC2155)
    local size
    size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo 0)
    if [ "$size" -gt "$max_size" ]; then
      return 1
    fi
  fi
  return 0
}

# Project-specific utility: Check for console.log in production code
check_console_logs() {
  local files="$1"
  if [ -n "$files" ]; then
    # Exclude test files, stories, and development utilities
    local console_logs
    console_logs=$(echo "$files" | xargs grep -l "console\\.log" 2>/dev/null | grep -v -E "(test|spec|__tests__|stories|\\.story\\.|development|debug)" || true)
    if [ -n "$console_logs" ]; then
      print_cross "console.log found in production code:"
      echo "$console_logs" | while read -r file; do
        print_bullet "$file"
      done
      print_info "Use Pino logger instead of console.log"
      return 1
    fi
  fi
  return 0
}

# Project-specific utility: Check TypeScript patterns
check_typescript_patterns() {
  local files="$1"
  local violations=""
  local has_violations=0

  if [ -n "$files" ]; then
    # Check for 'any' type usage (should use 'unknown' instead)
    local any_usage
    any_usage=$(echo "$files" | xargs grep -l ": any\|<any>\|any\[\]" 2>/dev/null || true)
    if [ -n "$any_usage" ]; then
      violations="$violations\n• 'any' type found (use 'unknown' instead):"
      # Use a safer approach to avoid subshell variable modification
      while IFS= read -r file; do
        [ -n "$file" ] && violations="$violations\n  - $file"
      done <<< "$any_usage"
      has_violations=1
    fi

    # Check for interface usage (should use type instead)
    local interface_usage
    interface_usage=$(echo "$files" | xargs grep -l "^interface " 2>/dev/null || true)
    if [ -n "$interface_usage" ]; then
      violations="$violations\n• 'interface' found (use 'type' instead):"
      # Use a safer approach to avoid subshell variable modification
      while IFS= read -r file; do
        [ -n "$file" ] && violations="$violations\n  - $file"
      done <<< "$interface_usage"
      has_violations=1
    fi

    if [ "$has_violations" = "1" ]; then
      print_cross "TypeScript pattern violations found:"
      echo -e "$violations"
      return 1
    fi
  fi
  return 0
}
