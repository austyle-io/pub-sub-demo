#!/bin/bash
# Configuration for git hooks
# Central place for all hook configuration adapted for pub-sub-demo

# Source utils (which sources colors)
CONFIG_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "$CONFIG_DIR/utils.sh"

# Project configuration (only set if not already set)
if [ -z "${PROJECT_ROOT:-}" ]; then
  # Declare and assign separately to avoid masking return values (SC2155)
  PROJECT_ROOT="$(get_project_root)"
  export PROJECT_ROOT
fi
export PROJECT_NAME="Pub-Sub Collaborative Editing Demo"

# Timeout configurations (in seconds) - adjusted for this project's scale
export HOOK_TIMEOUT_LINT=45
export HOOK_TIMEOUT_TEST=90
export HOOK_TIMEOUT_BUILD=120
export HOOK_TIMEOUT_TOTAL=300

# File size limits
export MAX_FILE_SIZE=$((3 * 1024 * 1024))  # 3MB (slightly smaller for collaboration focus)
export MAX_IMAGE_SIZE=$((1 * 1024 * 1024)) # 1MB

# Allowed file extensions specific to this project
export ALLOWED_CODE_EXTS="js|jsx|ts|tsx|mjs|cjs"
export ALLOWED_STYLE_EXTS="css|scss"
export ALLOWED_DOC_EXTS="md|mdx"
export ALLOWED_CONFIG_EXTS="json|yaml|yml|toml"

# Commit message configuration
export COMMIT_MSG_MAX_LENGTH=72
export COMMIT_MSG_MIN_LENGTH=10

# Conventional commit types for collaborative editing project
export COMMIT_TYPES="feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert"
# Scopes specific to collaborative editing domain
export COMMIT_SCOPES="client|server|shared|auth|collab|docs|ui|api|db|realtime|permissions|editor|sharedb|websocket|config|deps|testing|security"

# Quality thresholds adapted for TypeScript strict mode
export MIN_TYPE_COVERAGE=99.0
export MAX_COGNITIVE_COMPLEXITY=15
export MAX_FUNCTION_LENGTH=150
export MAX_FILE_LENGTH=800  # Slightly higher for React components

# Pre-commit framework configuration
export PRE_COMMIT_CONFIG=".pre-commit-config.yaml"
export PRE_COMMIT_ALLOW_NO_CONFIG=0

# Performance thresholds (project-specific baselines)
export MAX_LINT_TIME=60    # Biome is generally fast
export MAX_TEST_TIME=120   # Vitest + integration tests
export MAX_TYPE_CHECK_TIME=45

# Hook behavior configuration
export HOOK_FAIL_FAST=1 # Stop on first error
export HOOK_VERBOSE=0   # Verbose output
export HOOK_DRY_RUN=0   # Dry run mode

# Parse hook arguments
parse_hook_args() {
  while [[ $# -gt 0 ]]; do
    case $1 in
    --no-fail-fast)
      HOOK_FAIL_FAST=0
      shift
      ;;
    --verbose | -v)
      HOOK_VERBOSE=1
      shift
      ;;
    --dry-run)
      HOOK_DRY_RUN=1
      shift
      ;;
    *)
      shift
      ;;
    esac
  done
}

# Check if hook should run
should_run_hook() {
  # Don't run in CI if explicitly disabled
  if is_ci && [ "${RUN_HOOKS_IN_CI:-1}" = "0" ]; then
    print_info "Skipping hook in CI environment"
    return 1
  fi

  # Don't run if no files are staged
  if ! has_staged_files; then
    print_info "No files staged, skipping hook"
    return 1
  fi

  # Don't run in dry-run mode
  if [ "$HOOK_DRY_RUN" = "1" ]; then
    print_info "Dry-run mode, skipping actual checks"
    return 1
  fi

  return 0
}

# Log hook execution
log_hook_execution() {
  local hook_name="$1"
  local duration="$2"
  local status="$3"

  local log_file="$PROJECT_ROOT/.git/hooks.log"
  # Declare and assign separately to avoid masking return values (SC2155)
  local timestamp
  timestamp=$(date '+%Y-%m-%d %H:%M:%S')

  echo "$timestamp | $hook_name | ${duration}s | $status" >>"$log_file"
}

# Check system requirements for pub-sub-demo
check_requirements() {
  local missing_tools=()

  # Check required tools for this project
  local required_tools=("git" "node" "pnpm" "make")
  for tool in "${required_tools[@]}"; do
    if ! command_exists "$tool"; then
      missing_tools+=("$tool")
    fi
  done

  # Check for Biome (primary linter/formatter)
  if ! command_exists biome; then
    print_warning "Biome not found in PATH, will use pnpm biome"
  fi

  if [ ${#missing_tools[@]} -gt 0 ]; then
    print_error "Missing required tools: ${missing_tools[*]}"
    print_info "Please install missing tools and try again"
    print_info "Run: make setup"
    return 1
  fi

  return 0
}

# Project-specific: Check pnpm version
check_pnpm_version() {
  if command_exists pnpm; then
    local version
    version=$(pnpm --version)
    local major_version
    major_version=$(echo "$version" | cut -d. -f1)
    if [ "$major_version" -lt 9 ]; then
      print_warning "pnpm version $version detected. Recommended: 9.15.0+"
      print_info "Upgrade with: npm install -g pnpm@latest"
    fi
  fi
}

# Project-specific: Validate Node.js version
check_node_version() {
  if command_exists node; then
    local version
    version=$(node --version | sed 's/v//')
    local major_version
    major_version=$(echo "$version" | cut -d. -f1)
    if [ "$major_version" -lt 24 ]; then
      print_error "Node.js version $version detected. Required: 24+"
      print_info "This project requires Node.js 24 for optimal performance"
      return 1
    fi
  fi
  return 0
}
