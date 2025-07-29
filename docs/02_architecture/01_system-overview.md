# System Architecture Overview

This document provides a high-level overview of the system architecture. It is intended to give developers a comprehensive understanding of the major components and how they interact.

## Core Components

The application is composed of three main components:

- **Frontend**: A single-page application (SPA) built with React.
- **Backend**: A Node.js server built with Express.
- **Database**: A MongoDB database for data persistence.

## Architecture Diagram

```mermaid
graph TD
    subgraph "User's Browser"
        A[React Client]
    end

    subgraph "Cloud Infrastructure"
        B[Load Balancer]
        C[Frontend Server (Nginx)]
        D[Backend Server (Node.js)]
        E[Database (MongoDB)]
        F[Real-time Service (ShareDB)]
    end

    A -- HTTPS --> B
    B -- Serves Static Files --> C
    B -- API Requests --> D
    D -- Database Queries --> E
    D -- Real-time Operations --> F
    F -- WebSocket --> A
```

## Component Breakdown

### Frontend

- **Framework**: React with TypeScript.
- **Routing**: TanStack Router for client-side routing.
- **State Management**: XState for managing complex application state.
- **Real-time**: A custom hook (`useShareDB`) connects to the ShareDB backend via WebSockets.

### Backend

- **Framework**: Express.js with TypeScript.
- **Authentication**: JWT-based authentication with access and refresh tokens.
- **Real-time**: ShareDB is used to manage operational transformation (OT) for real-time collaboration.
- **API**: A RESTful API for user management, document management, and other non-real-time operations.

### Database

- **Type**: MongoDB, a NoSQL document database.
- **Schema**: Schemas are defined using TypeBox and validated with Ajv.
- **Adapter**: The ShareDB MongoDB adapter is used to persist document snapshots and operations.

## Data Flow

1.  **Initial Load**: The user's browser loads the React application from the Nginx server.
2.  **Authentication**: The user authenticates with the backend, receiving a JWT.
3.  **Document Access**: When a user opens a document, the frontend establishes a WebSocket connection to the ShareDB service, authenticating with the JWT.
4.  **Real-time Editing**: As the user types, the editor generates operations (ops) that are sent to ShareDB. ShareDB transforms these ops, applies them to the document, and broadcasts them to all other connected clients.

## Next Steps

- **[Backend Architecture](./02_backend-architecture.md)**: A deeper dive into the backend design.
- **[Frontend Architecture](./03_frontend-architecture.md)**: A more detailed look at the frontend architecture.
