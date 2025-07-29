# Collaborative Document Editing Demo

A real-time collaborative document editing application built with modern web technologies.

## Tech Stack

- **Frontend**: React with TanStack Start (routing) and XState (state management)
- **Backend**: Node.js with Express and ShareDB (Operational Transformation)
- **Database**: MongoDB for document persistence
- **Architecture**: TypeScript monorepo managed with Turborepo
- **Package Manager**: pnpm

## Features

- Real-time collaborative text editing
- Multiple users can edit the same document simultaneously
- Automatic conflict resolution using Operational Transformation
- Document persistence with MongoDB
- Type-safe API with TypeBox schemas

## Getting Started

### Prerequisites

- Node.js (v18 or v20)
- MongoDB (running locally)
- pnpm v9.15.5+ (install with `npm i -g pnpm`)

### Local Development Setup

#### Environment Configuration

- ✅ `.gitignore` comprehensively covers sensitive patterns (`.env`, secrets, credentials)
- ✅ TypeScript monorepo with strict type safety
- ✅ Turborepo for optimized build management

#### Installation

1. Clone the repository:

   ```bash
   git clone <repo-url>
   cd pub-sub-demo
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables:

   ```bash
   # Create .env files for each app (already in .gitignore)
   cp apps/client/.env.example apps/client/.env.local
   cp apps/server/.env.example apps/server/.env.local
   ```

4. Start MongoDB:

   ```bash
   # Using brew:
   brew services start mongodb-community

   # Or with Docker:
   docker run -d -p 27017:27017 --name mongo mongo:latest
   ```

#### Security Notes

- Never commit API keys or database credentials
- Use `.env.local` files for local development (in .gitignore)
- Review MongoDB connection strings for security
- Gemini CLI configuration follows secure practices (no secrets in config files)

### Development

#### Quick Commands (New!)

The project now includes a comprehensive Makefile for improved developer experience:

```bash
make help         # Show all available commands
make dev          # Start development environment
make test         # Run all tests safely
make quality      # Run quality checks (lint + type-check + test)
make setup        # Complete project setup
make docs         # Open documentation
```

#### Traditional Commands

Start the development servers:

```bash
make dev  # Recommended - includes Docker setup
# or
pnpm run dev
```

This will start:

- Frontend: <http://localhost:3000>
- Backend: <http://localhost:3001>

### Testing

The project follows a **user acceptance testing** approach [[memory:3829289]], focusing on critical workflows over code coverage:

```bash
make test                    # Run all tests safely
make test-integration        # Run integration tests
make test-user-workflows     # Run user workflow tests
make test-no-rate-limit      # Run tests without rate limiting
```

#### Test Organization

Tests are now organized in a structured directory:

```bash
test/
├── integration/             # API integration tests
├── e2e/                    # End-to-end tests (planned)
├── helpers/                # Test utilities
└── fixtures/               # Test data
```

## Project Structure

The project now follows DevX best practices with organized directories:

```bash
pub-sub-demo/
├── docs/                    # 📚 Comprehensive documentation
│   ├── 00_INDEX.md         # Main navigation hub
│   ├── 01_getting-started/ # Setup and onboarding
│   ├── 04_testing/         # Testing guides
│   └── 99_appendix/        # Reference materials
├── scripts/                 # 🛠️ Automation scripts
│   ├── testing/            # Test automation
│   ├── quality/            # Code quality checks
│   └── utilities/          # General utilities
├── test/                    # 🧪 Organized test structure
│   ├── integration/        # API integration tests
│   ├── helpers/            # Test utilities
│   └── fixtures/           # Test data
├── apps/
│   ├── client/             # React frontend application
│   └── server/             # Express backend server
├── packages/
│   └── shared/             # Shared TypeScript types and schemas
├── plans/                  # 📋 Implementation plans
├── Makefile                # Unified task automation
└── turbo.json              # Turborepo configuration
```

### Documentation

Comprehensive documentation is available with easy navigation:

- **📖 [Main Documentation](docs/00_INDEX.md)** - Central hub with quick navigation
- **🚀 [Getting Started](docs/01_getting-started/00_INDEX.md)** - Complete setup guide
- **🧪 [Testing Guide](docs/04_testing/00_INDEX.md)** - Testing strategies and tools
- **📋 [Implementation Plans](plans/)** - DevX and feature roadmaps

## Development Workflow

This project follows a monorepo structure with shared types between frontend and backend, ensuring end-to-end type safety. All changes are validated through CI checks including linting, type checking, and tests.

### Recent Improvements

#### ✨ DevX Enhancements (January 2025)

- 🧹 **Clean Organization**: No more scattered test/script files in root directory
- 🎯 **Unified Commands**: Single `make` interface for all development tasks
- 📚 **Structured Documentation**: Easy navigation with INDEX files
- 🔧 **Safe Scripts**: Timeout protection and error handling
- 🧪 **Organized Testing**: Clear separation of integration/e2e/helpers

See [Reorganization Summary](docs/99_appendix/reorganization-summary.md) for complete details.

## AI Integration

This project includes configuration for Google's Gemini AI CLI. For complete setup instructions, security best practices, and usage examples, see:

**📖 [Gemini CLI Documentation](docs/99_appendix/gemini-cli.md)**

Key features:

- Secure credential management with 1Password CLI
- Environment-specific configuration
- IAM roles and permissions setup
- Security best practices enforcement
