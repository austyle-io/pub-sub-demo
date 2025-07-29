# Running GitHub Actions Locally

This document explains how to run GitHub Actions workflows locally using Act and our custom CI simulation script.

## Overview

We have two GitHub Actions workflows:
- **CI Workflow** (`.github/workflows/ci.yml`) - Runs tests, linting, type checking, and security audits
- **Documentation Workflow** (`.github/workflows/documentation.yml`) - Checks documentation coverage and generates API docs

## Methods

### Method 1: Local CI Simulation Script (Recommended)

We provide a custom script that simulates the CI workflow locally without requiring Docker or external dependencies.

```bash
# Run the complete CI simulation
make ci

# Or run the script directly
./scripts/testing/run-ci-locally.sh
```

**What it does:**
1. Sets up CI environment variables
2. Installs dependencies with frozen lockfile
3. Builds all packages
4. Runs Biome linting
5. Runs TypeScript type checking
6. Runs all tests (64 tests across 3 packages)
7. Runs security audit (continues on errors)

**Advantages:**
- ✅ Fast execution (no Docker overhead)
- ✅ Uses your local environment
- ✅ No authentication issues
- ✅ Easy to debug and modify

### Method 2: Act (GitHub Actions Runner)

Act allows you to run GitHub Actions workflows locally using Docker containers.

#### Prerequisites

```bash
# Install Act (if not already installed)
brew install act
```

#### Configuration Files

We've provided configuration files for Act:

- `.secrets` - Local secrets for testing (gitignored)
- `.env.act` - Environment variables for Act (gitignored)

#### Usage

```bash
# List available workflows
act --list

# Run the test job from CI workflow
act -j test --container-architecture linux/amd64 --secret-file .secrets --env-file .env.act

# Run the security job
act -j security --container-architecture linux/amd64 --secret-file .secrets --env-file .env.act

# Run documentation check
act -j check-documentation --container-architecture linux/amd64 --secret-file .secrets --env-file .env.act
```

**Note:** Act may encounter authentication issues when trying to download GitHub Actions. Use the `--pull=false` flag to use cached actions.

#### Common Act Issues

1. **Authentication Errors**: Act tries to clone GitHub actions but hits auth issues
   - Solution: Use `--pull=false` or run the local simulation script instead

2. **Container Architecture**: Apple M-series chips need architecture specification
   - Solution: Always use `--container-architecture linux/amd64`

3. **Docker Requirements**: Act requires Docker to be running
   - Solution: Ensure Docker is installed and running, or use the simulation script

## Environment Variables

The following environment variables are set during CI simulation:

```bash
CI=true
NODE_ENV=test
NODE_OPTIONS=--max-old-space-size=4096
VITE_CJS_IGNORE_WARNING=true
JWT_ACCESS_SECRET=test-access-secret-key-for-local-ci-environment
JWT_REFRESH_SECRET=test-refresh-secret-key-for-local-ci-environment
```

## Comparison with GitHub Actions

| Step | Local Simulation | GitHub Actions | Status |
|------|-----------------|----------------|--------|
| Environment Setup | ✅ Node 24.x, pnpm 9.15.0 | ✅ Node 24.x, pnpm 9.15.0 | ✅ Match |
| Dependency Install | ✅ `pnpm install --frozen-lockfile` | ✅ `pnpm install --frozen-lockfile` | ✅ Match |
| Build Packages | ✅ `pnpm run build` | ✅ `pnpm run build` | ✅ Match |
| Biome Check | ✅ `pnpm lint` | ✅ `pnpm lint` | ✅ Match |
| Type Check | ✅ `pnpm run type-check` | ✅ `pnpm run type-check` | ✅ Match |
| Tests | ✅ `pnpm run test` | ✅ `pnpm run test` | ✅ Match |
| Security Audit | ✅ `pnpm audit --audit-level=high` | ✅ `pnpm audit --audit-level=high` | ✅ Match |
| Coverage Upload | ❌ Skipped locally | ✅ Uploads to Codecov | ⚠️ Local only |

## Debugging Failed CI

When a job fails in GitHub Actions:

1. **Run locally first**: Use `make ci` to reproduce the issue locally
2. **Check specific step**: Each step in the simulation script corresponds to GitHub Actions
3. **Environment differences**: Ensure local environment matches CI (Node version, dependencies)
4. **Secrets**: Verify that required secrets are available in both environments

## Integration with Development Workflow

```bash
# Before pushing changes
make ci

# Alternative: Run individual steps
make quality  # Runs linting, type-check, and tests
make build    # Just build packages
make test     # Just run tests
```

This ensures your changes will pass CI before pushing to GitHub.
