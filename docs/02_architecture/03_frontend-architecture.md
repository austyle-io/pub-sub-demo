# Frontend Architecture

This document provides a detailed overview of the frontend architecture, including the technology stack, project structure, and key components.

## Technology Stack

- **Framework**: React
- **Language**: TypeScript
- **Router**: TanStack Router
- **State Management**: XState
- **Styling**: Tailwind CSS
- **Editor**: Tiptap (planned for Phase 9)

## Project Structure

The frontend code is located in the `apps/client` directory of the monorepo. The structure is as follows:

```
apps/client/
├── src/
│   ├── components/     # Reusable UI components
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Top-level page components
│   ├── services/       # API service calls
│   ├── state/          # XState machines
│   ├── utils/          # Utility functions
│   └── main.tsx        # Application entry point
├── package.json
└── tsconfig.json
```

## Core Components

### React Components

- **Component-Based**: The UI is built as a hierarchy of reusable React components.
- **Functional Components**: We exclusively use functional components with hooks.
- **Styling**: Tailwind CSS is used for utility-first styling.

### Routing (TanStack Router)

- **Type-Safe**: TanStack Router provides a fully type-safe routing solution.
- **File-Based Routing**: Routes are defined by the file structure in the `src/pages` directory.

### State Management (XState)

- **Finite State Machines**: We use XState to manage complex application state, especially for asynchronous operations like authentication and data fetching.
- **Predictable State**: State machines make application logic more predictable and easier to debug.

### Real-time Collaboration (`useShareDB` hook)

- **Custom Hook**: A custom hook, `useShareDB`, encapsulates the logic for connecting to the ShareDB backend.
- **WebSocket Connection**: This hook manages the WebSocket connection, authentication, and document subscriptions.
- **Real-time Updates**: It provides the editor component with the real-time document content and sends local changes to the backend.

## Next Steps

- **[System Architecture Overview](./01_system-overview.md)**: Go back to the high-level overview.
- **[Development Workflow](../03_development/02_development-workflow.md)**: Learn how to contribute to the frontend.
