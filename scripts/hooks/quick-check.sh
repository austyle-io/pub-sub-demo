#!/bin/bash
# Gemini Code Pre-Compact Quick Check
# Performs a quick quality check before conversation compaction

set -euo pipefail

# Color codes
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

cd "$(dirname "$0")/../.." || exit 1

echo -e "${BLUE}[Pre-Compact Check]${NC} Running quick quality scan..."

# Quick check for syntax errors only
ISSUES=0

# Check for TypeScript syntax errors (faster than full type check)
if ! pnpm exec tsc --noEmit --skipLibCheck --incremental false --tsBuildInfoFile null 2>/dev/null; then
    ((ISSUES++))
fi

# Check for Biome errors (not warnings)
if ! pnpm biome check --formatter-enabled=false --max-diagnostics=0 2>/dev/null; then
    ((ISSUES++))
fi

if [ $ISSUES -gt 0 ]; then
    echo -e "${YELLOW}Warning:${NC} Found $ISSUES potential issues. Consider running full quality checks."
fi

# Always allow compaction but provide information
cat <<EOF
{
  "status": "success",
  "message": "Pre-compact check complete",
  "issues": $ISSUES
}
EOF

exit 0
