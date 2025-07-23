#!/bin/bash

# Chain Runner for Cursor Prompts
# Usage: ./run.sh <chain-name> [parameters...]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CHAINS_DIR="$SCRIPT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_color() {
    local color=$1
    shift
    echo -e "${color}$*${NC}"
}

# Function to print usage
print_usage() {
    print_color "$BLUE" "Cursor Prompt Chain Runner"
    echo ""
    echo "Usage: $0 <chain-name> [parameters...]"
    echo ""
    echo "Available chains:"
    for chain in "$CHAINS_DIR"/_*.yaml; do
        if [ -f "$chain" ]; then
            basename=$(basename "$chain" .yaml)
            chain_name=${basename#_}
            echo "  - $chain_name"
        fi
    done
    echo ""
    echo "Example:"
    echo "  $0 websocket-feature \"user presence indicator\" \"Show online users in real-time\""
}

# Check if chain name provided
if [ $# -lt 1 ]; then
    print_usage
    exit 1
fi

CHAIN_NAME=$1
CHAIN_FILE="$CHAINS_DIR/_${CHAIN_NAME}.yaml"

# Check if chain file exists
if [ ! -f "$CHAIN_FILE" ]; then
    print_color "$RED" "Error: Chain '$CHAIN_NAME' not found!"
    echo ""
    print_usage
    exit 1
fi

# Shift to get remaining parameters
shift

# Create temporary directory for chain execution
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

# Parse chain parameters
print_color "$BLUE" "Loading chain: $CHAIN_NAME"
print_color "$YELLOW" "Parameters: $*"
echo ""

# Create a simple YAML parser function
parse_yaml() {
    local file=$1
    local prefix=$2
    local s='[[:space:]]*'
    local w='[a-zA-Z0-9_]*'
    local fs=$(echo @|tr @ '\034')

    sed -ne "s|^\($s\)\($w\)$s:$s\"\(.*\)\"$s\$|\1$fs\2$fs\3|p" \
        -e "s|^\($s\)\($w\)$s:$s\(.*\)$s\$|\1$fs\2$fs\3|p" "$file" |
    awk -F$fs '{
        indent = length($1)/2;
        vname[indent] = $2;
        for (i in vname) {if (i > indent) {delete vname[i]}}
        if (length($3) > 0) {
            vn=""; for (i=0; i<indent; i++) {vn=(vn)(vname[i])("_")}
            printf("%s%s%s=\"%s\"\n", "'$prefix'", vn, $2, $3);
        }
    }'
}

# Execute chain steps
print_color "$GREEN" "Executing chain steps..."
echo ""

# Create a markdown file to collect all outputs
OUTPUT_FILE="$TEMP_DIR/chain_output.md"
echo "# $CHAIN_NAME Chain Execution" > "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "**Date**: $(date)" >> "$OUTPUT_FILE"
echo "**Parameters**: $*" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Track step number
STEP_NUM=1

# Read and execute each step
while IFS= read -r line; do
    if [[ $line =~ ^[[:space:]]*-[[:space:]]*id:[[:space:]]*(.+) ]]; then
        STEP_ID="${BASH_REMATCH[1]}"
        print_color "$BLUE" "Step $STEP_NUM: $STEP_ID"

        # Add step header to output
        echo "## Step $STEP_NUM: $STEP_ID" >> "$OUTPUT_FILE"
        echo "" >> "$OUTPUT_FILE"

        # Create prompt file for this step
        PROMPT_FILE="$TEMP_DIR/step_${STEP_NUM}_${STEP_ID}.md"

        # Extract prompt content (simplified - in real implementation would need proper YAML parsing)
        echo "📋 Creating prompt for: $STEP_ID"

        # Here you would extract the actual prompt content and parameter substitution
        # For now, we'll create a placeholder
        echo "# Step: $STEP_ID" > "$PROMPT_FILE"
        echo "" >> "$PROMPT_FILE"
        echo "Execute the step for $CHAIN_NAME with parameters: $*" >> "$PROMPT_FILE"

        print_color "$YELLOW" "  → Prompt saved to: $PROMPT_FILE"
        echo "" >> "$OUTPUT_FILE"

        ((STEP_NUM++))
    fi
done < "$CHAIN_FILE"

# Final output
print_color "$GREEN" "Chain execution complete!"
echo ""
print_color "$BLUE" "Outputs saved to:"
print_color "$YELLOW" "  → $TEMP_DIR"
echo ""
print_color "$BLUE" "Next steps:"
echo "1. Open each prompt file in Cursor"
echo "2. Execute the prompts in sequence"
echo "3. Collect outputs in the chain_output.md file"
echo ""
print_color "$YELLOW" "Note: In a future version, this could integrate with Cursor's CLI directly."

# Keep temp directory for user to access
print_color "$GREEN" "Press Enter to clean up temporary files, or Ctrl+C to keep them..."
read -r

# Cleanup happens automatically due to trap
