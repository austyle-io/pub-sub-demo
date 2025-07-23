#!/bin/bash
# Setup or repair symbolic links for agent hooks

set -euo pipefail

# Color codes
BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m'

# Change to project root
cd "$(dirname "$0")/../.." || exit 1

echo -e "${BLUE}Setting up symbolic links for agent hooks...${NC}"

# Define hook directories and scripts
GEMINI_HOOKS_DIR=".gemini/hooks"
CLAUDE_HOOKS_DIR=".claude/hooks"
SHARED_HOOKS_DIR="scripts/hooks"

QUALITY_CHECK_SCRIPT="quality-check.sh"
QUICK_CHECK_SCRIPT="quick-check.sh"

# Create hook directories if they don't exist
mkdir -p "$GEMINI_HOOKS_DIR"
mkdir -p "$CLAUDE_HOOKS_DIR"

# Create/update symbolic links for Gemini
echo "Linking Gemini hooks..."
ln -sf "../../$SHARED_HOOKS_DIR/$QUALITY_CHECK_SCRIPT" "$GEMINI_HOOKS_DIR/pre-exit-check.sh"
ln -sf "../../$SHARED_HOOKS_DIR/$QUICK_CHECK_SCRIPT" "$GEMINI_HOOKS_DIR/pre-compact-check.sh"

# Create/update symbolic links for Claude
echo "Linking Claude hooks..."
ln -sf "../../$SHARED_HOOKS_DIR/$QUALITY_CHECK_SCRIPT" "$CLAUDE_HOOKS_DIR/quality-check.sh"
ln -sf "../../$SHARED_HOOKS_DIR/$QUICK_CHECK_SCRIPT" "$CLAUDE_HOOKS_DIR/pre-compact-check.sh"

echo -e "${GREEN}✓ Hook setup complete.${NC}"
