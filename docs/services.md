# Core Services

This section describes the primary applications and libraries within the repo.

## apps/client
- A React single-page application that serves as the user interface for document editing.
- Uses Vite for development, React Router (TanStack Start), XState for state management, and TypeScript.

## apps/server
- An Express.js server that exposes REST endpoints for authentication and health checks.
- Integrates ShareDB for real-time operational-transformation (OT) on document data.
- Uses WebSocket for ShareDB communication and MongoDB for persistence.

## packages/shared
- A TypeScript library containing shared schemas (TypeBox), OpenAPI definitions, validation logic, and auth types.
- Ensures end-to-end type safety between client and server.
