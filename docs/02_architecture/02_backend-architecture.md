# Backend Architecture

This document provides a detailed description of the backend architecture, including its structure, key dependencies, and core functionalities.

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Real-time**: ShareDB
- **Database**: MongoDB
- **Authentication**: Passport.js with JWTs

## Project Structure

The backend code is located in the `apps/server` directory of the monorepo. The structure is as follows:

```
apps/server/
├── src/
│   ├── config/         # Environment variables and configuration
│   ├── middleware/     # Express middleware
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Utility functions
│   └── server.ts       # Main application entry point
├── package.json
└── tsconfig.json
```

## Core Components

### Express Server (`server.ts`)

The main entry point of the application, responsible for:
- Initializing the Express app.
- Applying middleware (CORS, body parser, etc.).
- Mounting API routes.
- Starting the HTTP and WebSocket servers.

### Real-time Service (ShareDB)

ShareDB is at the heart of the real-time collaboration features. It is responsible for:
- **Operational Transformation (OT)**: Resolving conflicts between concurrent edits.
- **Document Syncing**: Broadcasting changes to all connected clients.
- **Persistence**: Storing document snapshots and operations in MongoDB.

### Authentication

- **Strategy**: We use Passport.js with a JWT strategy for authentication.
- **Tokens**: When a user logs in, they receive an access token and a refresh token.
- **WebSocket Authentication**: The WebSocket connection is authenticated by passing the access token as a query parameter during the initial handshake.

### API Routes (`src/routes`)

The RESTful API is organized into routes for different resources:
- **`auth.ts`**: User registration, login, and token refreshing.
- **`documents.ts`**: Creating, listing, and managing documents.
- **`users.ts`**: User profile management.

## Database

The MongoDB database stores the following collections:

- **`users`**: User profiles and credentials.
- **`documents`**: The current snapshot of each document.
- **`ops`**: A log of all operations applied to the documents (for OT).

## Next Steps

- **[Frontend Architecture](./03_frontend-architecture.md)**: Learn about the frontend architecture.
- **[Database Schema](./04_database-schema.md)**: See the detailed database schema.
