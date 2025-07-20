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

## Gemini CLI

### Configuration

The Gemini CLI configuration is stored in the `.gemini/.env` file. This file contains environment-specific settings for interacting with Google's Gemini API.

### Required API Setup

1. **Google Cloud Project**: You need an active Google Cloud project with the Gemini API enabled
2. **API Key**: Generate an API key from the Google Cloud Console for authentication
3. **Service Account** (optional): For production use, create a service account with appropriate permissions

### IAM Role Requirements

The following IAM roles are required for full functionality:
- `roles/aiplatform.user` - For making API calls to Gemini
- `roles/aiplatform.viewer` - For reading model information
- Additional project-specific roles may be required based on your use case

### Security Considerations

⚠️ **IMPORTANT**: Never place secrets, API keys, or sensitive credentials directly in the `.gemini/` directory. This violates security best practices.

Instead:
- Use environment variables loaded from secure sources
- Leverage secret management tools like 1Password CLI
- Store sensitive values in `.env.local` (which should be in `.gitignore`)
- Use git-secrets to scan for accidental credential commits

### Example .gemini/.env Structure

```bash
# .gemini/.env - Configuration file (no secrets here!)
GEMINI_PROJECT_ID=your-project-id
GEMINI_REGION=us-central1
GEMINI_MODEL=gemini-pro

# API keys should be loaded from environment variables
# Example: GEMINI_API_KEY=$GEMINI_API_KEY_FROM_ENV
```

### Usage

Ensure your environment variables are properly set before using the Gemini CLI:
```bash
# Load API key from secure storage (e.g., 1Password)
export GEMINI_API_KEY=$(op read "op://Personal/Gemini API/credential")

# Run Gemini CLI commands
gemini chat "Your prompt here"
```
