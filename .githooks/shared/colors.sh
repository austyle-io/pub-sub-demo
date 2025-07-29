#!/bin/bash
# Color definitions for git hooks output
# Provides consistent terminal colors across all hooks

# Color definitions
export RED='\033[0;31m'
export GREEN='\033[0;32m'
export YELLOW='\033[1;33m'
export BLUE='\033[0;34m'
export MAGENTA='\033[0;35m'
export CYAN='\033[0;36m'
export BOLD='\033[1m'
export NC='\033[0m' # No Color

# Print functions with colors
print_error() {
    echo -e "${RED}✗ $1${NC}" >&2
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_section() {
    echo -e "\n${BOLD}${CYAN}=== $1 ===${NC}"
}

print_subsection() {
    echo -e "\n${BOLD}→ $1${NC}"
}

# Progress indicator
print_progress() {
    echo -e "${CYAN}⏳ $1...${NC}"
}

# Check mark for completed items
print_check() {
    echo -e "  ${GREEN}✓${NC} $1"
}

# Cross mark for failed items
print_cross() {
    echo -e "  ${RED}✗${NC} $1"
}

# Neutral bullet point
print_bullet() {
    echo -e "  ${CYAN}•${NC} $1"
}
