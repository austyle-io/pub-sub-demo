# Getting Started

## Quick Start

Welcome to the Collaborative Document Editing Demo! This guide will help you get up and running quickly.

## Prerequisites

- **Node.js**: Version 18 or higher [[memory:3835223]]
- **pnpm**: Package manager for monorepo dependencies
- **Docker**: For MongoDB database (recommended)
- **Git**: For version control

## Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/your-username/pub-sub-demo.git
   cd pub-sub-demo
   ```

2. **Setup the project**:

   ```bash
   make setup
   ```

3. **Start development**:

   ```bash
   make dev
   ```

4. **Verify installation**:
   - Frontend: <http://localhost:3000>
   - Backend: <http://localhost:3001/health>

## Development Workflow

### Daily Development

```bash
make dev          # Start all services
make test         # Run tests
make quality      # Check code quality
```

### Common Tasks

```bash
make lint         # Run linting
make format       # Format code
make type-check   # TypeScript validation
make db-debug     # Check database state
```

## Project Structure

```mermaid
pub-sub-demo/
├── apps/
│   ├── client/          # React frontend
│   └── server/          # Express backend
├── packages/
│   └── shared/          # Shared types and utilities
├── test/                # Integration tests
├── scripts/             # Automation scripts
└── docs/               # Documentation
```

## Next Steps

- [Architecture Overview](../02_architecture/00_INDEX.md)
- [Development Guidelines](../03_development/00_INDEX.md)
- [Testing Guide](../04_testing/testing-guide.md)

## Troubleshooting

### MongoDB Connection Issues

```bash
make db-reset        # Reset database
docker-compose up -d # Start containers
```

### Port Conflicts

- Client (3000): Check for other React apps
- Server (3001): Check for other Node processes
- MongoDB (27017): Check for other MongoDB instances

### TypeScript Errors

```bash
make type-check      # Check all types
pnpm clean && pnpm install  # Reset dependencies
```

## Environment Variables

Create `.env` files in the root directory:

```bash
# .env (development)
JWT_SECRET=your-secret-key-here
MONGO_URL=mongodb://localhost:27017/collab_demo
VITE_API_URL=http://localhost:3001/api
```

## Support

- [Testing Documentation](../04_testing/testing-guide.md)
- [Docker Setup](../05_deployment/docker-setup.md)
- [Session Updates](../99_appendix/session-updates/2025-01-21.md)
