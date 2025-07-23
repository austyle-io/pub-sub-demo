# Collaborative Document Editing Demo - Comprehensive Memory Reference

## Project Overview

A real-time collaborative document editing application using:
- **Frontend**: React + TanStack Router + XState state management
- **Backend**: Node.js + Express + ShareDB (Operational Transformation)
- **Database**: MongoDB for document persistence
- **Architecture**: TypeScript monorepo with Turborepo
- **Real-time**: WebSocket connections with JWT authentication

## Key Architecture Patterns

### 1. ShareDB Real-time Implementation

**WebSocket Authentication**:
- Modern approach: Use secure cookies via `cookieManager` (apps/client/src/utils/cookie-manager.ts:181)
- Server validates tokens during WebSocket upgrade handshake (apps/server/src/middleware/websocket-auth.ts:19)
- Reject unauthorized connections with HTTP 401 response

**ShareDB Document Operations**:
- Use json0 OT type for document operations
- Operations require both `oi` (object insert) and `od` (object delete) for replacements
- Path notation: `[{ p: ['fieldName'], oi: newValue, od: oldValue }]`
- Always listen for 'op' events to sync remote changes (apps/client/src/components/DocumentEditor.tsx:117)

**ShareDB Document Storage Structure**:
- Documents stored in MongoDB collection `o_documents`
- Document ID field: `d` (not `_id`)
- Data location: `doc.create?.data || doc.data` pattern for compatibility
- ACL permissions stored within document data

### 2. Authentication & Security

**JWT Token Management**:
- Separate access (15m) and refresh (7d) tokens
- Environment validation ensures proper JWT configuration (apps/server/src/types/env.ts:35)
- Tokens signed with issuer and audience claims for security
- Shared package provides JWT utilities (packages/shared/src/auth/jwt.ts)

**Permission System**:
- Document-level ACL with owner, editors, viewers arrays
- Permission checks in ShareDB middleware (apps/server/src/services/sharedb.service.ts:95)
- Direct MongoDB queries for permission validation (apps/server/src/utils/permissions.ts:7)
- Admin role bypasses all permission checks

**Security Features**:
- Comprehensive Helmet configuration for security headers (apps/server/src/server.ts:27)
- Rate limiting with environment-aware configuration
- Input sanitization middleware
- CORS with credential support
- Secure cookie handling with Cookie Store API fallback

### 3. Module System & Build Configuration

**Mixed ESM/CommonJS Compatibility**:
- Server uses TypeScript with moduleResolution: "bundler"
- Shared package exports both client and server-specific code
- Server-only exports (bcrypt) in separate subpath `@collab-edit/shared/server`
- Build before running to ensure dist files exist

**Environment Variables**:
- Must load dotenv before env validation (apps/server/src/server.ts:1)
- JWT secrets accessible to shared package after validation
- Different configurations for development/production/test

### 4. Testing Philosophy

**User Acceptance Testing Focus** (per user preference):
- 100% focus on critical user workflows
- Integration and E2E tests prioritized over unit tests
- No emphasis on code coverage metrics
- Test real user scenarios end-to-end (test/integration/user-workflows.test.js)

**Test Environment Configuration**:
- `NODE_ENV=test` bypasses rate limiting
- Separate test scripts for different scenarios
- Direct MongoDB verification in tests

### 5. Development Workflow

**Makefile-driven Development**:
- `make dev` - Start development with Docker
- `make test` - Run all tests safely
- `make quality` - Run lint, type-check, test, knip
- `make knip` - Detect unused code/dependencies

**Code Quality Tools**:
- Biome for linting and formatting (biome.json)
- TypeScript with strict type checking
- Knip for unused code detection
- Structured logging with Pino

## Critical Implementation Details

### ShareDB Backend Connections
When creating backend connections for server operations:
```typescript
const connection = shareDBService.createAuthenticatedConnection(
  userId,
  email,
  role
);
```
This ensures proper user context for authorization middleware.

### Document Query Patterns
Always query by the correct field:
```javascript
// Correct
const doc = await collection.findOne({ d: docId });

// Incorrect
const doc = await collection.findOne({ _id: docId });
```

### WebSocket Cookie Authentication
Use the secure cookie manager instead of query parameters:
```typescript
await cookieManager.setWebSocketToken(accessToken);
const socket = new ReconnectingWebSocketLib('ws://localhost:3001');
```

### Environment Variable Loading Order
Critical for server startup:
1. Import dotenv/config first
2. Validate environment variables
3. Set process.env values for shared package access

## Project Structure

```
pub-sub-demo/
├── apps/
│   ├── client/          # React frontend
│   └── server/          # Express backend
├── packages/
│   └── shared/          # Shared types and utilities
├── test/               # Organized test structure
├── scripts/            # Automation scripts
├── docs/               # Comprehensive documentation
└── plans/              # Implementation plans
```

## Recent Lessons Learned (2025-01-21)

1. **ShareDB Authorization**: Backend connections need explicit user context initialization
2. **Document Structure**: Data can be in either `create.data` or `data` field
3. **Module Resolution**: Use "bundler" resolution for proper subpath imports
4. **Cookie Security**: Modern Cookie Store API with secure fallback implementation
5. **Testing Strategy**: Focus on user workflows over coverage metrics

## Key Files Reference

- Server entry: `apps/server/src/server.ts`
- ShareDB service: `apps/server/src/services/sharedb.service.ts`
- Client ShareDB hook: `apps/client/src/hooks/useShareDB.ts`
- Document routes: `apps/server/src/routes/doc.routes.ts`
- Auth service: `apps/server/src/services/auth.service.ts`
- Permission utils: `apps/server/src/utils/permissions.ts`
- Environment validation: `apps/server/src/types/env.ts`

## Development Tips

1. Always check CLAUDE.md for project-specific guidelines
2. Use structured logging for debugging
3. Test WebSocket connections with proper authentication
4. Verify MongoDB document structure when debugging
5. Follow TypeScript patterns from .cursor/rules/
