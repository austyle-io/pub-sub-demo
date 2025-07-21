#!/bin/bash
# scripts/development/reset-database.sh
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
    echo -e "[DB-RESET] $*"
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

confirm_reset() {
    local env="${NODE_ENV:-development}"

    if [ "$env" = "production" ]; then
        log_error "❌ Cannot reset production database!"
        log_error "Set NODE_ENV to development or test to continue"
        exit 1
    fi

    echo ""
    log_warning "⚠️  This will PERMANENTLY DELETE all data in the database!"
    log_info "Environment: $env"
    log_info "Database URL: ${MONGO_URL:-mongodb://localhost:27017/collab_demo}"
    echo ""

    # Check if running in CI or with force flag
    if [ "${CI:-false}" = "true" ] || [ "${1:-}" = "--force" ]; then
        log_info "Running in CI or with --force flag, proceeding automatically"
        return 0
    fi

    read -p "Are you sure you want to reset the database? (type 'yes' to confirm): " -r
    if [ "$REPLY" != "yes" ]; then
        log_info "Database reset cancelled"
        exit 0
    fi
}

stop_containers() {
    log_info "Stopping database containers..."

    cd "$PROJECT_ROOT"

    if [ -f "docker-compose.yml" ]; then
        # Stop and remove containers with volumes
        if docker-compose ps | grep -q mongo; then
            log_info "Stopping MongoDB container..."
            docker-compose down -v mongo
            log_success "✅ MongoDB container stopped and volumes removed"
        else
            log_info "MongoDB container not running"
        fi
    else
        log_warning "No docker-compose.yml found, skipping container stop"
    fi
}

start_containers() {
    log_info "Starting fresh database containers..."

    cd "$PROJECT_ROOT"

    if [ -f "docker-compose.yml" ]; then
        log_info "Starting MongoDB container..."
        docker-compose up -d mongo

        # Wait for MongoDB to be ready
        log_info "Waiting for MongoDB to be ready..."
        local retries=30
        while [ $retries -gt 0 ]; do
            if docker-compose exec -T mongo mongosh --eval "db.runCommand('ping')" >/dev/null 2>&1; then
                log_success "✅ MongoDB is ready"
                break
            fi
            log_info "Waiting for MongoDB... ($retries retries left)"
            sleep 2
            ((retries--))
        done

        if [ $retries -eq 0 ]; then
            log_error "❌ MongoDB failed to start within timeout"
            return 1
        fi
    else
        log_warning "No docker-compose.yml found, assuming external MongoDB"
    fi
}

reset_database() {
    log_info "Resetting database content..."

    local mongo_url="${MONGO_URL:-mongodb://localhost:27017/collab_demo}"

    # Extract database name from URL
    local db_name
    db_name=$(echo "$mongo_url" | sed 's/.*\///')

    if command -v mongosh >/dev/null 2>&1; then
        log_info "Using mongosh to reset database: $db_name"

        # Drop the database
        if mongosh "$mongo_url" --eval "db.dropDatabase()" --quiet; then
            log_success "✅ Database '$db_name' dropped successfully"
        else
            log_error "❌ Failed to drop database"
            return 1
        fi

        # Verify database was dropped
        local db_count
        db_count=$(mongosh "$mongo_url" --eval "db.stats().collections" --quiet 2>/dev/null || echo "0")
        log_info "Collections remaining: $db_count"

    elif command -v mongo >/dev/null 2>&1; then
        log_info "Using legacy mongo client to reset database: $db_name"

        if mongo "$mongo_url" --eval "db.dropDatabase()" --quiet; then
            log_success "✅ Database '$db_name' dropped successfully"
        else
            log_error "❌ Failed to drop database"
            return 1
        fi

    else
        log_error "❌ No MongoDB client found (mongosh or mongo)"
        log_info "Please install MongoDB client tools or use Docker exec:"
        log_info "  docker-compose exec mongo mongosh"
        return 1
    fi
}

seed_initial_data() {
    log_info "Seeding initial development data..."

    # Create test fixture if it exists
    local seed_script="$PROJECT_ROOT/test/fixtures/seed-dev-data.js"

    if [ -f "$seed_script" ]; then
        log_info "Running seed script: $seed_script"
        if node "$seed_script"; then
            log_success "✅ Development data seeded"
        else
            log_warning "⚠️  Seed script failed (this may be normal)"
        fi
    else
        log_info "No seed script found at: $seed_script"
        log_info "Database reset complete with empty state"
    fi
}

verify_reset() {
    log_info "Verifying database reset..."

    local mongo_url="${MONGO_URL:-mongodb://localhost:27017/collab_demo}"

    if command -v mongosh >/dev/null 2>&1; then
        local collections
        collections=$(mongosh "$mongo_url" --eval "db.getCollectionNames()" --quiet 2>/dev/null || echo "[]")
        log_info "Collections after reset: $collections"

        # Check if database is accessible
        if mongosh "$mongo_url" --eval "db.runCommand('ping')" --quiet >/dev/null 2>&1; then
            log_success "✅ Database is accessible and responsive"
        else
            log_error "❌ Database connection failed"
            return 1
        fi
    else
        log_warning "Cannot verify reset - no MongoDB client available"
    fi
}

print_summary() {
    log_info ""
    log_success "🎉 Database reset completed successfully!"
    log_info ""
    log_info "Next steps:"
    log_info "  1. Start development servers: make dev"
    log_info "  2. Run tests to verify: make test"
    log_info "  3. Create users through the app UI"
    log_info ""
    log_info "Database info:"
    log_info "  URL: ${MONGO_URL:-mongodb://localhost:27017/collab_demo}"
    log_info "  Environment: ${NODE_ENV:-development}"
    log_info ""
}

main() {
    local force_flag="${1:-}"

    log_info "Starting database reset..."
    log_info "Project root: $PROJECT_ROOT"
    log_info "Timestamp: $(date)"

    # Set environment if not set
    export NODE_ENV="${NODE_ENV:-development}"
    export MONGO_URL="${MONGO_URL:-mongodb://localhost:27017/collab_demo}"

    confirm_reset "$force_flag"

    stop_containers || {
        log_error "Failed to stop containers"
        exit 1
    }

    start_containers || {
        log_error "Failed to start containers"
        exit 1
    }

    sleep 3  # Give MongoDB time to fully initialize

    reset_database || {
        log_error "Failed to reset database"
        exit 1
    }

    seed_initial_data

    verify_reset || {
        log_warning "Reset verification failed, but reset may have succeeded"
    }

    print_summary

    log_success "Database reset completed! ✨"
}

main "$@"
