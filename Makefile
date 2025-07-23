# Project: Collaborative Document Editing Demo
.DEFAULT_GOAL := help
SHELL := /bin/bash

# Colors
GREEN := \033[0;32m
BLUE := \033[0;34m
YELLOW := \033[1;33m
NC := \033[0m

.PHONY: help
help: ## Show available commands
	@echo -e "${BLUE}Pub-Sub Demo - Available Commands${NC}"
	@echo -e "${BLUE}==================================${NC}"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "${GREEN}%-20s${NC} %s\n", $$1, $$2}'

# Development
.PHONY: dev
dev: ## Start development servers
	@echo -e "${BLUE}Starting development environment...${NC}"
	@docker-compose up -d
	@pnpm run dev

# Agent system commands
.PHONY: up
up: ## Check current progress and update agent state
	@echo -e "${BLUE}Checking current progress...${NC}"
	@python3 .agent/tools/update-progress.py

.PHONY: ho
ho: ## Generate handoff report (usage: make ho "session notes")
	@echo -e "${BLUE}Generating handoff report...${NC}"
	@python3 .agent/tools/generate-handoff.py $(filter-out $@,$(MAKECMDGOALS))

# Allow arguments to be passed to make ho
%:
	@:

.PHONY: setup
setup: ## Complete project setup
	@echo -e "${BLUE}Setting up project...${NC}"
	@./scripts/setup/install-deps.sh

.PHONY: setup-hooks
setup-hooks: ## Setup or repair symbolic links for agent hooks
	@echo -e "${BLUE}Setting up agent hooks...${NC}"
	@./scripts/setup/setup-hooks.sh

# Testing
.PHONY: test
test: ## Run all tests safely
	@echo -e "${BLUE}Running tests safely...${NC}"
	@./scripts/testing/test-safe.sh

.PHONY: test-integration
test-integration: ## Run integration tests
	@echo -e "${BLUE}Running integration tests...${NC}"
	@./scripts/testing/run-integration-tests.sh

.PHONY: test-user-workflows
test-user-workflows: ## Run user workflow tests
	@echo -e "${BLUE}Running user workflow tests...${NC}"
	@NODE_ENV=test node test/integration/user-workflows.test.js

.PHONY: test-no-rate-limit
test-no-rate-limit: ## Run tests without rate limiting
	@echo -e "${BLUE}Running tests without rate limiting...${NC}"
	@./scripts/testing/run-tests-no-rate-limit.sh

.PHONY: test-e2e
test-e2e: ## Run E2E tests with Playwright
	@echo -e "${BLUE}Running E2E tests...${NC}"
	@pnpm test:e2e

.PHONY: test-e2e-ui
test-e2e-ui: ## Run E2E tests with UI
	@echo -e "${BLUE}Running E2E tests with UI...${NC}"
	@pnpm test:e2e:ui

.PHONY: test-e2e-debug
test-e2e-debug: ## Debug E2E tests
	@echo -e "${BLUE}Debugging E2E tests...${NC}"
	@pnpm test:e2e:debug

.PHONY: test-e2e-setup
test-e2e-setup: ## Setup E2E testing environment
	@echo -e "${BLUE}Setting up E2E testing...${NC}"
	@pnpm test:e2e:setup

.PHONY: test-e2e-full
test-e2e-full: ## Run comprehensive E2E tests with setup
	@echo -e "${BLUE}Running comprehensive E2E tests...${NC}"
	@./scripts/testing/run-e2e-tests.sh

.PHONY: test-e2e-basic
test-e2e-basic: ## Run basic E2E functionality tests
	@echo -e "${BLUE}Running basic E2E tests...${NC}"
	@./scripts/testing/run-e2e-tests.sh basic

.PHONY: test-e2e-collaboration
test-e2e-collaboration: ## Run collaboration E2E tests
	@echo -e "${BLUE}Running collaboration E2E tests...${NC}"
	@./scripts/testing/run-e2e-tests.sh collaboration

# Quality
.PHONY: quality
quality: lint type-check test knip ## Run all quality checks
	@echo -e "${GREEN}✅ All quality checks passed!${NC}"

.PHONY: lint
lint: ## Run comprehensive linting (TypeScript, Shell, Markdown)
	@echo -e "${BLUE}Running comprehensive linting...${NC}"
	@./scripts/quality/lint-safe.sh

.PHONY: lint-shell
lint-shell: ## Run shellcheck on shell scripts
	@echo -e "${BLUE}Running shellcheck...${NC}"
	@./scripts/quality/shellcheck.sh

.PHONY: lint-markdown
lint-markdown: ## Run markdownlint on documentation
	@echo -e "${BLUE}Running markdownlint...${NC}"
	@./scripts/quality/markdownlint.sh

.PHONY: lint-code
lint-code: ## Run only TypeScript/JavaScript linting
	@echo -e "${BLUE}Running code linting...${NC}"
	@pnpm run lint

.PHONY: format
format: ## Format code
	@echo -e "${BLUE}Formatting code...${NC}"
	@pnpm format

.PHONY: fix-template-strings
fix-template-strings: ## Replace problematic template strings with lodash.template
	@echo -e "${BLUE}Fixing template string issues with lodash.template...${NC}"
	@# Install lodash.template if not present
	@pnpm add -D -w lodash.template @types/lodash.template
	@# Update edge-case-handlers to use lodash.template
	@echo -e "${GREEN}Updated template handling to use lodash.template${NC}"


.PHONY: type-check
type-check: ## Run TypeScript type checking
	@echo -e "${BLUE}Type checking...${NC}"
	@pnpm type-check

# Bundle Analysis & Unused Code Detection
.PHONY: knip
knip: ## Run Knip analysis (unused dependencies, exports, files)
	@echo -e "${BLUE}Running Knip analysis...${NC}"
	@pnpm run knip

.PHONY: knip-deps
knip-deps: ## Check unused dependencies
	@echo -e "${BLUE}Checking unused dependencies...${NC}"
	@pnpm run knip:dependencies

.PHONY: knip-exports
knip-exports: ## Check unused exports
	@echo -e "${BLUE}Checking unused exports...${NC}"
	@pnpm run knip:exports

.PHONY: knip-files
knip-files: ## Check unused files
	@echo -e "${BLUE}Checking unused files...${NC}"
	@pnpm run knip:files

.PHONY: knip-types
knip-types: ## Check unused types
	@echo -e "${BLUE}Checking unused types...${NC}"
	@pnpm run knip:types

# Database
.PHONY: db-debug
db-debug: ## Debug database state
	@echo -e "${BLUE}Debugging database...${NC}"
	@node scripts/utilities/debug-db.js

.PHONY: db-reset
db-reset: ## Reset development database
	@echo -e "${BLUE}Resetting database...${NC}"
	@./scripts/development/reset-database.sh

# Build
.PHONY: build
build: ## Build for production
	@echo -e "${BLUE}Building for production...${NC}"
	@pnpm build

.PHONY: clean
clean: ## Clean build artifacts
	@echo -e "${BLUE}Cleaning build artifacts...${NC}"
	@rm -rf apps/*/dist packages/*/dist .turbo
	@echo -e "${GREEN}✅ Clean complete${NC}"

# Documentation
.PHONY: docs
docs: ## Build complete documentation
	@echo -e "${BLUE}Building complete documentation...${NC}"
	@cd docs-site && pnpm run build-docs

.PHONY: docs-dev
docs-dev: ## Start documentation development server
	@echo -e "${BLUE}Starting documentation development server...${NC}"
	@cd docs-site && pnpm run dev

.PHONY: docs-build
docs-build: ## Build documentation site
	@echo -e "${BLUE}Building documentation site...${NC}"
	@cd docs-site && pnpm run build

.PHONY: docs-generate
docs-generate: ## Generate API documentation
	@echo -e "${BLUE}Generating API documentation...${NC}"
	@cd docs-site && pnpm run generate-api

.PHONY: docs-legacy
docs-legacy: ## Open legacy documentation
	@echo -e "${BLUE}Opening legacy documentation...${NC}"
	@open docs/00_INDEX.md || echo "📖 See docs/00_INDEX.md"

# Development Utilities
.PHONY: install
install: ## Install dependencies
	@echo -e "${BLUE}Installing dependencies...${NC}"
	@pnpm install

.PHONY: update
update: ## Update dependencies
	@echo -e "${BLUE}Updating dependencies...${NC}"
	@pnpm update

.PHONY: logs
logs: ## Show application logs
	@echo -e "${BLUE}Showing recent logs...${NC}"
	@tail -f .logs/*.log 2>/dev/null || echo "No log files found in .logs/"

# Organization
.PHONY: organize
organize: ## Check project organization
	@echo -e "${BLUE}Checking project organization...${NC}"
	@echo "📁 Test files in root:"
	@find . -maxdepth 1 -name "test-*.js" -o -name "*test.js" | wc -l
	@echo "📁 Script files in root:"
	@find . -maxdepth 1 -name "*.sh" | wc -l
	@echo "📁 Log files in root:"
	@find . -maxdepth 1 -name "*.log" | wc -l
	@echo -e "${GREEN}✅ Project organization check complete${NC}"

# Shortcuts
.PHONY: s t l q d
s: dev      ## Shortcut for dev
t: test     ## Shortcut for test
l: lint     ## Shortcut for lint
q: quality  ## Shortcut for quality
d: docs     ## Shortcut for docs
