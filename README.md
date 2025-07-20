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
- pnpm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

### Development

Start the development servers:
```bash
pnpm run dev
```

This will start:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

### Testing

Run tests across all packages:
```bash
pnpm run test
```

## Project Structure

```
.
├── apps/
│   ├── client/      # React frontend application
│   └── server/      # Express backend server
├── packages/
│   └── shared/      # Shared TypeScript types and schemas
├── turbo.json       # Turborepo configuration
└── package.json     # Root workspace configuration
```

## Development Workflow

This project follows a monorepo structure with shared types between frontend and backend, ensuring end-to-end type safety. All changes are validated through CI checks including linting, type checking, and tests.