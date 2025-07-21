#!/bin/bash
# scripts/setup/install-deps.sh
set -euo pipefail

# Declare and assign separately to avoid masking return values (SC2155)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly SCRIPT_DIR

PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
readonly PROJECT_ROOT

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly BLUE='\033[0;34m'
readonly YELLOW='\033[1;33m'
readonly NC='\033[0m'

log() {
    echo -e "[SETUP] $*"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $*"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $*"
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $*"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $*"
}

check_prerequisites() {
    log_info "Checking prerequisites..."

    local missing_deps=()

    # Check Node.js
    if ! command -v node >/dev/null 2>&1; then
        missing_deps+=("Node.js")
    else
        local node_version
        node_version=$(node --version | sed 's/v//')
        local major_version
        major_version=$(echo "$node_version" | cut -d. -f1)
        if [ "$major_version" -lt 18 ]; then
            log_warning "Node.js version $node_version detected. Version 18+ recommended."
        else
            log_success "✅ Node.js $node_version detected"
        fi
    fi

    # Check pnpm
    if ! command -v pnpm >/dev/null 2>&1; then
        log_warning "pnpm not found. Installing..."
        if command -v npm >/dev/null 2>&1; then
            npm install -g pnpm
            log_success "✅ pnpm installed via npm"
        else
            missing_deps+=("pnpm")
        fi
    else
        local pnpm_version
        pnpm_version=$(pnpm --version)
        log_success "✅ pnpm $pnpm_version detected"
    fi

    # Check Docker (optional but recommended)
    if ! command -v docker >/dev/null 2>&1; then
        log_warning "Docker not found (optional for MongoDB)"
    else
        if docker ps >/dev/null 2>&1; then
            log_success "✅ Docker is running"
        else
            log_warning "Docker is installed but not running"
        fi
    fi

    # Check Git
    if ! command -v git >/dev/null 2>&1; then
        missing_deps+=("Git")
    else
        log_success "✅ Git detected"
    fi

    if [ ${#missing_deps[@]} -gt 0 ]; then
        log_error "Missing required dependencies:"
        for dep in "${missing_deps[@]}"; do
            log_error "  - $dep"
        done
        log_error "Please install missing dependencies and try again"
        return 1
    fi

    log_success "All prerequisites satisfied"
    return 0
}

install_dependencies() {
    log_info "Installing project dependencies..."

    cd "$PROJECT_ROOT"

    # Check if pnpm-lock.yaml exists
    if [ -f "pnpm-lock.yaml" ]; then
        log_info "Found pnpm-lock.yaml, running clean install..."
        pnpm install --frozen-lockfile
    else
        log_info "No lockfile found, running fresh install..."
        pnpm install
    fi

    log_success "✅ Dependencies installed successfully"
}

setup_environment() {
    log_info "Setting up development environment..."

    # Create necessary directories
    mkdir -p .logs
    mkdir -p tmp

    # Create .env template if it doesn't exist
    if [ ! -f ".env" ] && [ ! -f ".env.local" ]; then
        log_info "Creating .env template..."
        cat > .env.example << 'EOF'
# Development Environment Variables
JWT_SECRET=your-secret-key-here
MONGO_URL=mongodb://localhost:27017/collab_demo
VITE_API_URL=http://localhost:3001/api

# Optional: Logging Configuration
LOG_LEVEL=debug
NODE_ENV=development
SERVICE_NAME=pub-sub-demo
APP_VERSION=1.0.0
EOF

        if [ ! -f ".env" ]; then
            cp .env.example .env
            log_success "✅ Created .env file from template"
            log_warning "⚠️  Please update .env with your actual values"
        fi
    fi

    log_success "✅ Environment setup complete"
}

verify_installation() {
    log_info "Verifying installation..."

    local checks_passed=0
    local total_checks=0

    # Check if build works
    log_info "Testing build process..."
    ((total_checks++))
    if pnpm build >/dev/null 2>&1; then
        log_success "✅ Build test passed"
        ((checks_passed++))
    else
        log_warning "⚠️  Build test failed (may need environment setup)"
    fi

    # Check if lint works
    log_info "Testing linting..."
    ((total_checks++))
    if pnpm lint >/dev/null 2>&1; then
        log_success "✅ Lint test passed"
        ((checks_passed++))
    else
        log_warning "⚠️  Lint test failed"
    fi

    # Check if type check works
    log_info "Testing type checking..."
    ((total_checks++))
    if pnpm type-check >/dev/null 2>&1; then
        log_success "✅ Type check passed"
        ((checks_passed++))
    else
        log_warning "⚠️  Type check failed"
    fi

    log_info "Verification complete: $checks_passed/$total_checks checks passed"

    if [ $checks_passed -eq $total_checks ]; then
        log_success "🎉 Installation verified successfully!"
    else
        log_warning "⚠️  Some verification checks failed. This may be normal if environment setup is incomplete."
    fi
}

print_next_steps() {
    log_info ""
    log_info "🚀 Setup complete! Next steps:"
    log_info ""
    log_info "1. Review and update environment variables:"
    log_info "   📝 Edit .env file with your configuration"
    log_info ""
    log_info "2. Start MongoDB (required for backend):"
    log_info "   🐳 docker-compose up -d"
    log_info "   📊 Or install MongoDB locally"
    log_info ""
    log_info "3. Start development servers:"
    log_info "   🚀 make dev"
    log_info "   🔗 Frontend: http://localhost:3000"
    log_info "   🔗 Backend: http://localhost:3001"
    log_info ""
    log_info "4. Run tests:"
    log_info "   🧪 make test"
    log_info "   📊 make test-integration"
    log_info ""
    log_info "5. Access documentation:"
    log_info "   📖 make docs"
    log_info "   📚 docs/00_INDEX.md"
    log_info ""
    log_success "Happy coding! 🎉"
}

main() {
    log_info "Starting project setup..."
    log_info "Project root: $PROJECT_ROOT"
    log_info "Timestamp: $(date)"

    check_prerequisites || {
        log_error "Prerequisites check failed"
        exit 1
    }

    install_dependencies || {
        log_error "Dependency installation failed"
        exit 1
    }

    setup_environment || {
        log_error "Environment setup failed"
        exit 1
    }

    verify_installation

    print_next_steps

    log_success "Project setup completed successfully! ✨"
}

main "$@"
