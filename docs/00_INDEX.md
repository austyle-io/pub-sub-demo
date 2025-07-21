# Documentation Index

## Quick Navigation

- [Getting Started](01_getting-started/00_INDEX.md) - Setup and onboarding
- [Architecture](02_architecture/00_INDEX.md) - System design and patterns
- [Development](03_development/00_INDEX.md) - Development workflows
- [Testing](04_testing/00_INDEX.md) - Testing strategies and guides
- [Deployment](05_deployment/00_INDEX.md) - Deployment and hosting
- [Appendix](99_appendix/00_INDEX.md) - Reference materials

## Project Overview

Collaborative document editing application built with:

- **Frontend**: React + TanStack Start + XState
- **Backend**: Node.js + Express + ShareDB
- **Database**: MongoDB
- **Real-time**: WebSocket with Operational Transformation

## Quick Commands

```bash
make dev          # Start development
make test         # Run all tests
make quality      # Quality checks
make setup        # Complete setup
```

## Current Status

- ✅ Core functionality complete
- ✅ Authentication system working
- ✅ Real-time collaboration functional
- 🔄 DevX improvements in progress

## Architecture Highlights

### Real-time Collaboration

- **ShareDB** for Operational Transformation
- **WebSocket** authentication with JWT
- **MongoDB** persistence layer

### Authentication & Security

- JWT tokens with refresh mechanism
- Role-based access control (owner, editor, viewer)
- Password hashing with bcrypt
- Document-level permissions

### Developer Experience

- **TypeScript** end-to-end type safety
- **Turborepo** monorepo structure
- **Biome** for linting and formatting
- **Safe scripts** with timeout protection

## Getting Started

1. **Prerequisites**: Node.js 18+, pnpm, Docker (for MongoDB)
2. **Setup**: `make setup`
3. **Development**: `make dev`
4. **Testing**: `make test`

## Recent Updates

- [Session Update 2025-01-21](99_appendix/session-updates/2025-01-21.md) - Latest fixes and improvements
- [Testing Guide](04_testing/testing-guide.md) - Comprehensive testing documentation
- [Docker Setup](05_deployment/docker-setup.md) - Container configuration

## Contributing

- Follow TypeScript best practices [[memory:3829289]]
- Use structured logging (Pino integration planned)
- Write tests for new features
- Update documentation as needed

## Links

- [Implementation Plan](../implementation-plan.md) - Complete development roadmap
- [Plans Directory](../plans/) - Specific implementation plans
- [CLAUDE.md](../CLAUDE.md) - AI integration guidelines
- [Gemini CLI Documentation](99_appendix/gemini-cli.md) - Google AI CLI setup and usage
