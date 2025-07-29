# Monorepo Structure

This project uses a monorepo structure, managed by pnpm workspaces and Turborepo. This approach allows us to manage multiple packages and applications in a single repository.

## Core Technologies

- **pnpm Workspaces**: For managing dependencies and linking local packages.
- **Turborepo**: For high-performance builds and task running.

## Directory Structure

```
/
├── apps/
│   ├── client/       # The React frontend application
│   └── server/       # The Express backend server
├── packages/
│   └── shared/       # Shared code (types, schemas, etc.)
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

### `apps`

This directory contains the applications that make up the project. Each subdirectory is a standalone application.

- **`client`**: The React frontend.
- **`server`**: The Express backend.

### `packages`

This directory contains shared code that can be used by any of the applications.

- **`shared`**: Contains shared TypeScript types, TypeBox schemas, and validation logic.

## Key Files

- **`pnpm-workspace.yaml`**: Defines the pnpm workspace, telling pnpm where to find the packages and applications.
- **`turbo.json`**: The configuration file for Turborepo, where we define the task pipeline.

## Benefits of the Monorepo

- **Code Sharing**: Easily share code between the frontend and backend.
- **Atomic Commits**: Make changes to multiple packages in a single commit.
- **Simplified Dependency Management**: Manage all dependencies in a single `pnpm-lock.yaml` file.
- **Faster Builds**: Turborepo caches build outputs, so you only rebuild what has changed.
