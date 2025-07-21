#!/bin/bash

# AuStdX Cursor Prompts Chain Runner
# Usage: ./run-chain.sh <chain-name> [options]

set -e

CHAIN_NAME=$1
CHAIN_DIR="$(dirname "$0")"
PROJECT_ROOT="$(cd "$CHAIN_DIR/../../.." && pwd)"
OUTPUT_DIR="$PROJECT_ROOT/.cursor/prompts/chains/output/$(date +%Y%m%d-%H%M%S)-$CHAIN_NAME"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Help function
show_help() {
    echo "AuStdX Cursor Prompts Chain Runner"
    echo ""
    echo "Usage: $0 <chain-name> [options]"
    echo ""
    echo "Available chains:"
    ls -1 "$CHAIN_DIR"/*.yaml | xargs -n 1 basename | sed 's/\.yaml$//'
    echo ""
    echo "Options:"
    echo "  --feature-name=<name>         Feature name for development chain"
    echo "  --description=<description>   Feature description"
    echo "  --requirements=<requirements> Feature requirements"
    echo "  --dry-run                    Show what would be executed"
    echo "  --help                       Show this help message"
    echo ""
    echo "Example:"
    echo "  $0 austdx-feature-development --feature-name=\"user-dashboard\" --description=\"Dashboard for users\" --requirements=\"Show user stats\""
}

# Parse arguments
DRY_RUN=false
FEATURE_NAME=""
DESCRIPTION=""
REQUIREMENTS=""

for arg in "$@"; do
    case $arg in
        --help)
            show_help
            exit 0
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --feature-name=*)
            FEATURE_NAME="${arg#*=}"
            shift
            ;;
        --description=*)
            DESCRIPTION="${arg#*=}"
            shift
            ;;
        --requirements=*)
            REQUIREMENTS="${arg#*=}"
            shift
            ;;
    esac
done

# Validate chain exists
if [ -z "$CHAIN_NAME" ]; then
    echo -e "${RED}Error: No chain name provided${NC}"
    show_help
    exit 1
fi

CHAIN_FILE="$CHAIN_DIR/$CHAIN_NAME.yaml"
if [ ! -f "$CHAIN_FILE" ]; then
    echo -e "${RED}Error: Chain '$CHAIN_NAME' not found${NC}"
    echo ""
    show_help
    exit 1
fi

# Create output directory
if [ "$DRY_RUN" = false ]; then
    mkdir -p "$OUTPUT_DIR"
fi

# Display chain info
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Running Chain: ${GREEN}$CHAIN_NAME${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Chain File:${NC} $CHAIN_FILE"
echo -e "${YELLOW}Output Directory:${NC} $OUTPUT_DIR"
echo ""

# For feature development chain, collect inputs
if [ "$CHAIN_NAME" = "austdx-feature-development" ]; then
    if [ -z "$FEATURE_NAME" ]; then
        echo -e "${YELLOW}Enter feature name:${NC} "
        read -r FEATURE_NAME
    fi
    
    if [ -z "$DESCRIPTION" ]; then
        echo -e "${YELLOW}Enter feature description:${NC} "
        read -r DESCRIPTION
    fi
    
    if [ -z "$REQUIREMENTS" ]; then
        echo -e "${YELLOW}Enter feature requirements (press Ctrl+D when done):${NC}"
        REQUIREMENTS=$(cat)
    fi
    
    echo ""
    echo -e "${GREEN}Feature Configuration:${NC}"
    echo "  Name: $FEATURE_NAME"
    echo "  Description: $DESCRIPTION"
    echo "  Requirements: $(echo "$REQUIREMENTS" | head -1)..."
    echo ""
fi

# Simulate chain execution
if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}DRY RUN MODE - No actual execution${NC}"
    echo ""
fi

echo -e "${BLUE}Chain Steps:${NC}"
echo "1. Requirements Analysis (@austdx-architect)"
echo "2. Architecture Design (@austdx-architect)"
echo "3. Component Implementation"
echo "4. Server Function Implementation"
echo "5. Testing (Unit, BDD, Integration)"
echo "6. Quality Validation"
echo "7. Documentation"
echo "8. Final Review (@austdx-mentor)"
echo ""

if [ "$DRY_RUN" = false ]; then
    # Create a context file for the chain
    cat > "$OUTPUT_DIR/context.json" <<EOF
{
  "chain": "$CHAIN_NAME",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "inputs": {
    "feature_name": "$FEATURE_NAME",
    "feature_description": "$DESCRIPTION",
    "requirements": "$REQUIREMENTS"
  },
  "output_dir": "$OUTPUT_DIR"
}
EOF

    echo -e "${GREEN}✓ Context saved to $OUTPUT_DIR/context.json${NC}"
    echo ""
    
    # Create placeholder for manual execution
    cat > "$OUTPUT_DIR/README.md" <<EOF
# Chain Execution: $CHAIN_NAME

## Started At
$(date)

## Configuration
- Feature Name: $FEATURE_NAME
- Description: $DESCRIPTION
- Requirements: See context.json

## Steps to Execute

### 1. Requirements Analysis
Use @austdx-architect persona to analyze requirements.
Save output to: requirements-analysis.md

### 2. Architecture Design
Use @austdx-architect persona to design architecture.
Save output to: architecture-design.md

### 3. Implementation
Follow the prompts to implement components and server functions.

### 4. Testing
Create unit tests, BDD tests, and integration tests in parallel.

### 5. Quality Validation
Run the quality checks specified in the chain.

### 6. Documentation
Create comprehensive documentation.

### 7. Final Review
Use @austdx-mentor persona for final review.

## Notes
Add execution notes here as you work through the chain.
EOF

    echo -e "${GREEN}✓ Execution guide created${NC}"
    echo ""
    echo -e "${BLUE}Next Steps:${NC}"
    echo "1. Open $OUTPUT_DIR/README.md"
    echo "2. Use the specified personas and prompts for each step"
    echo "3. Save outputs to the designated files"
    echo "4. Run quality checks after implementation"
    echo ""
    echo -e "${GREEN}Chain execution context ready!${NC}"
else
    echo -e "${YELLOW}Dry run complete. Use without --dry-run to execute.${NC}"
fi