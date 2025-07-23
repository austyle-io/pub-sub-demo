#!/bin/bash

# Documentation Enhancement Workflow Script
# Orchestrates the complete documentation improvement process

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
ROOT_DIR="$SCRIPT_DIR/../.."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📚 Documentation Enhancement Workflow${NC}"
echo "======================================"

# Function to run a phase
run_phase() {
    local phase=$1
    local description=$2
    local script=$3
    
    echo -e "\n${YELLOW}Starting ${phase}: ${description}${NC}"
    
    if [ -f "$SCRIPT_DIR/$script" ]; then
        node "$SCRIPT_DIR/$script"
        echo -e "${GREEN}✅ ${phase} completed${NC}"
    else
        echo -e "${RED}❌ Script not found: $script${NC}"
        exit 1
    fi
}

# Function to check prerequisites
check_prerequisites() {
    echo -e "\n${BLUE}Checking prerequisites...${NC}"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js is required${NC}"
        exit 1
    fi
    
    # Check TypeScript
    if ! command -v tsc &> /dev/null; then
        echo -e "${YELLOW}⚠️  TypeScript not found globally, using local version${NC}"
    fi
    
    # Check if dependencies are installed
    if [ ! -d "$ROOT_DIR/node_modules" ]; then
        echo -e "${YELLOW}Installing dependencies...${NC}"
        cd "$ROOT_DIR" && pnpm install
    fi
    
    echo -e "${GREEN}✅ Prerequisites satisfied${NC}"
}

# Main workflow
main() {
    local command=${1:-"help"}
    
    case $command in
        "analyze")
            check_prerequisites
            run_phase "Analysis" "Codebase inventory and coverage analysis" "analyze-codebase.js"
            ;;
            
        "phase1")
            check_prerequisites
            run_phase "Phase 1" "Core utilities and low-level helpers" "implement-phase1-docs.js"
            ;;
            
        "phase2")
            check_prerequisites
            run_phase "Phase 2" "React components and hooks" "implement-phase2-docs.js"
            ;;
            
        "phase3")
            check_prerequisites
            run_phase "Phase 3" "Higher-level features and API" "implement-phase3-docs.js"
            ;;
            
        "check")
            check_prerequisites
            run_phase "Quality Check" "Documentation validation" "check-documentation.js"
            ;;
            
        "generate")
            echo -e "\n${BLUE}Generating API documentation...${NC}"
            cd "$ROOT_DIR" && pnpm run docs:generate
            echo -e "${GREEN}✅ API documentation generated${NC}"
            ;;
            
        "build")
            echo -e "\n${BLUE}Building documentation site...${NC}"
            cd "$ROOT_DIR" && pnpm run docs:build
            echo -e "${GREEN}✅ Documentation site built${NC}"
            ;;
            
        "serve")
            echo -e "\n${BLUE}Starting documentation server...${NC}"
            cd "$ROOT_DIR" && pnpm run docs:dev
            ;;
            
        "all")
            check_prerequisites
            
            # Run all phases in sequence
            run_phase "Analysis" "Codebase inventory and coverage analysis" "analyze-codebase.js"
            
            echo -e "\n${YELLOW}Current documentation coverage:${NC}"
            coverage=$(node -p "JSON.parse(require('fs').readFileSync('$SCRIPT_DIR/../documentation-coverage-report.json', 'utf8')).statistics.coveragePercentage")
            echo -e "Coverage: ${coverage}%"
            
            if (( $(echo "$coverage < 80" | bc -l) )); then
                echo -e "\n${YELLOW}Running documentation enhancement phases...${NC}"
                run_phase "Phase 1" "Core utilities and low-level helpers" "implement-phase1-docs.js"
                run_phase "Phase 2" "React components and hooks" "implement-phase2-docs.js"
                run_phase "Phase 3" "Higher-level features and API" "implement-phase3-docs.js"
            fi
            
            # Generate and build
            echo -e "\n${BLUE}Generating API documentation...${NC}"
            cd "$ROOT_DIR" && pnpm run docs:generate
            
            echo -e "\n${BLUE}Building documentation site...${NC}"
            cd "$ROOT_DIR" && pnpm run docs:build
            
            # Final check
            run_phase "Quality Check" "Documentation validation" "check-documentation.js"
            
            echo -e "\n${GREEN}🎉 Documentation enhancement complete!${NC}"
            ;;
            
        "report")
            if [ -f "$SCRIPT_DIR/../documentation-coverage-report.json" ]; then
                echo -e "\n${BLUE}Documentation Coverage Report${NC}"
                echo "============================="
                node -p "
                    const report = JSON.parse(require('fs').readFileSync('$SCRIPT_DIR/../documentation-coverage-report.json', 'utf8'));
                    console.log('Total Files:', report.statistics.totalFiles);
                    console.log('Total Exports:', report.statistics.totalExports);
                    console.log('Documented:', report.statistics.documentedExports);
                    console.log('Coverage:', report.statistics.coveragePercentage.toFixed(1) + '%');
                    console.log('\\nTop Undocumented Items:');
                    report.undocumented.slice(0, 10).forEach(item => {
                        console.log('  -', item.module + ':', item.name, '(' + item.kind + ')');
                    });
                "
            else
                echo -e "${RED}❌ No coverage report found. Run 'analyze' first.${NC}"
            fi
            ;;
            
        "help"|*)
            echo -e "\nUsage: $0 [command]"
            echo ""
            echo "Commands:"
            echo "  analyze   - Analyze codebase and generate coverage report"
            echo "  phase1    - Document core utilities and types"
            echo "  phase2    - Document React components and hooks"
            echo "  phase3    - Document services and API"
            echo "  check     - Validate documentation quality"
            echo "  generate  - Generate API documentation with TypeDoc"
            echo "  build     - Build the documentation site"
            echo "  serve     - Start documentation dev server"
            echo "  all       - Run complete documentation workflow"
            echo "  report    - Show current coverage report"
            echo "  help      - Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 analyze          # Start with analysis"
            echo "  $0 phase1           # Run phase 1 documentation"
            echo "  $0 all              # Run everything"
            ;;
    esac
}

# Run the main function
main "$@"