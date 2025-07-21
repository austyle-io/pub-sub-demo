# Comprehensive Troubleshooting Guide

## Overview

This guide provides systematic solutions to common issues encountered during development of the collaborative document editing application.

## Quick Diagnosis Commands

```bash
# System health check
make organize          # Check project organization
make quality           # Run all quality checks
make db-debug         # Check database connectivity
make logs             # View recent application logs

# Service status
docker ps             # Check running containers
lsof -i :3000,:3001,:27017  # Check port usage
```

## Development Environment Issues

### Node.js and Package Management

#### Issue: `pnpm command not found`

**Symptoms:**

- `bash: pnpm: command not found`
- Build scripts failing

**Solutions:**

```bash
# Option 1: Install pnpm globally
npm install -g pnpm@latest

# Option 2: Use corepack (Node.js 16.13+)
corepack enable
corepack prepare pnpm@latest --activate

# Option 3: Use npm instead (fallback)
npm install
npm run dev
```

**Verification:**

```bash
pnpm --version  # Should show 9.15.5+
which pnpm      # Should show installation path
```

#### Issue: Node.js version incompatibility

**Symptoms:**

- TypeScript compilation errors
- Build failures
- Package installation issues

**Solutions:**

```bash
# Check current version
node --version  # Should be 18+ or 24+ [[memory:3835223]]

# Install correct version using nvm
nvm install 24
nvm use 24
nvm alias default 24

# Or using fnm
fnm install 24
fnm use 24
fnm default 24
```

#### Issue: Dependency conflicts

**Symptoms:**

- `ERR_PNPM_PEER_DEP_ISSUES`
- Module resolution errors
- Build type errors

**Solutions:**

```bash
# Clean slate approach
make clean
rm -rf node_modules pnpm-lock.yaml
rm -rf apps/*/node_modules apps/*/pnpm-lock.yaml
rm -rf packages/*/node_modules packages/*/pnpm-lock.yaml

# Reinstall with proper peer deps
pnpm install --shamefully-hoist
make setup
```

### MongoDB and Database Issues

#### Issue: MongoDB connection failures

**Symptoms:**

- `MongoNetworkError: connection refused`
- `ECONNRESET` errors
- Tests timing out

**Diagnosis:**

```bash
# Check if MongoDB is running
docker ps | grep mongo
mongosh --host localhost:27017 --eval "db.runCommand('ping')"

# Check Docker daemon
docker info
```

**Solutions:**

```bash
# Start MongoDB with Docker
docker-compose up -d mongo

# Alternative: Start all services
make dev

# Reset database if corrupted
make db-reset

# Manual MongoDB start (if Docker issues)
brew services start mongodb-community
# or
systemctl start mongod
```

#### Issue: Database permission errors

**Symptoms:**

- `MongoError: not authorized`
- Authentication failures
- Permission denied errors

**Solutions:**

```bash
# Check environment variables
echo $MONGO_URL
echo $DATABASE_URL

# Use default development URL
export MONGO_URL="mongodb://localhost:27017/collab_demo_dev"

# Reset MongoDB with no auth (development)
docker-compose down
docker volume rm pub-sub-demo_mongodb_data
docker-compose up -d mongo
```

#### Issue: Database schema/migration issues

**Symptoms:**

- Document query failures
- Missing collections
- Invalid document structures

**Solutions:**

```bash
# Debug database state
make db-debug

# Reset and seed fresh data
make db-reset
node test/fixtures/seed-dev-data.js

# Check document structure
docker exec -it $(docker ps -q -f name=mongo) mongosh
use collab_demo_dev
db.documents.findOne()
db.users.findOne()
```

### Port and Service Conflicts

#### Issue: Port already in use

**Symptoms:**

- `EADDRINUSE: address already in use :::3000`
- `Port 3001 is already in use`

**Diagnosis:**

```bash
# Find processes using ports
lsof -i :3000  # Frontend
lsof -i :3001  # Backend
lsof -i :27017 # MongoDB
netstat -tulpn | grep :3000
```

**Solutions:**

```bash
# Kill specific processes
kill -9 $(lsof -ti:3000)
kill -9 $(lsof -ti:3001)

# Kill all Node processes (nuclear option)
pkill -f node

# Change default ports (environment override)
export VITE_PORT=3002
export PORT=3003
make dev
```

#### Issue: Docker port conflicts

**Symptoms:**

- `port is already allocated`
- Container start failures

**Solutions:**

```bash
# Stop conflicting containers
docker stop $(docker ps -q)

# Clean up Docker resources
docker system prune -f
docker volume prune -f

# Reset Docker Compose
docker-compose down --volumes
docker-compose up -d
```

## TypeScript and Build Issues

### Compilation Errors

#### Issue: Type errors in external modules

**Symptoms:**

- `Cannot find module 'sharedb'`
- `any` type errors
- Missing type declarations

**Solutions:**

```bash
# Check TypeScript configuration
make type-check

# Clear TypeScript cache
rm -rf apps/*/tsconfig.tsbuildinfo
rm -rf packages/*/tsconfig.tsbuildinfo
rm -rf .turbo

# Verify type declarations exist
ls apps/server/src/types/
ls packages/shared/src/
```

**Type Guard Implementation:**

Following [[memory:3820036]] type guard patterns:

```typescript
// Fix: Replace unsafe type assertions
// ❌ Problematic
const data = response as UserData;

// ✅ Correct with type guard
function isUserData(data: unknown): data is UserData {
  return isObject(data) &&
         typeof data.id === 'string' &&
         typeof data.email === 'string';
}

const data = isUserData(response) ? response : null;
```

#### Issue: Bracket notation errors

**Symptoms:**

- `Element implicitly has an 'any' type`
- `No index signature with a parameter of type 'string'`

**Solutions:**

Following [[memory:3829289]] type safety practices:

```typescript
// ❌ Problematic bracket notation
const value = obj[key];

// ✅ Correct with type guard
function hasProperty<T extends Record<string, unknown>>(
  obj: T,
  key: string
): key is keyof T {
  return key in obj;
}

const value = hasProperty(obj, key) ? obj[key] : undefined;
```

### Build and Bundling Issues

#### Issue: Vite build failures

**Symptoms:**

- Build process hanging
- Memory errors during build
- Missing dependencies in build

**Solutions:**

```bash
# Clear build cache
make clean
rm -rf apps/client/dist apps/server/dist

# Increase memory for build
NODE_OPTIONS="--max-old-space-size=4096" make build

# Debug build process
DEBUG=vite:* pnpm run build

# Check for circular dependencies
pnpm run build --verbose
```

#### Issue: Import/export errors

**Symptoms:**

- `Module not found`
- Circular dependency warnings
- Tree-shaking issues

**Solutions:**

```typescript
// Fix circular dependencies
// 1. Check dependency graph
npx madge --circular --extensions ts,tsx apps/client/src

// 2. Use index files for cleaner imports
// Instead of: import { util } from '../../../utils/helper'
// Use: import { util } from '@/utils'

// 3. Lazy loading for heavy dependencies
const HeavyComponent = lazy(() => import('./HeavyComponent'));
```

## Authentication and Security Issues

### JWT Token Issues

#### Issue: Token expiration errors

**Symptoms:**

- `TokenExpiredError`
- Frequent logouts
- Authentication loops

**Diagnosis:**

```bash
# Check token configuration
echo $JWT_ACCESS_SECRET
echo $JWT_REFRESH_SECRET

# Debug token timing
node test/helpers/auth-debug.js
```

**Solutions:**

```bash
# Generate new secrets
./scripts/setup-env.sh

# Check token expiry settings
grep -r "expiresIn" packages/shared/src/auth/

# Clear stored tokens
localStorage.clear()  # In browser console
```

#### Issue: Cookie authentication failures

**Symptoms:**

- Refresh token not sent
- CORS cookie issues
- HttpOnly cookie not accessible

**Solutions:**

```typescript
// Verify cookie settings
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true  // Required for cookies
}));

// Client-side: Ensure credentials
fetch('/api/auth/refresh', {
  credentials: 'include'  // Required for cookies
});
```

### Permission and Access Control

#### Issue: Document permission failures

**Symptoms:**

- `Unauthorized` errors
- Users can't edit documents
- Permission check failures

**Diagnosis:**

```bash
# Debug permissions
node -e "
const { checkDocumentPermission } = require('./apps/server/src/utils/permissions');
// Test permission logic
"

# Check document ACLs in database
make db-debug
```

**Solutions:**

```bash
# Reset permissions for development
node test/fixtures/seed-dev-data.js

# Check permission middleware
grep -r "checkDocumentPermission" apps/server/src/
```

## Real-time Collaboration Issues

### ShareDB and WebSocket Issues

#### Issue: WebSocket connection failures

**Symptoms:**

- `WebSocket connection failed`
- Documents not syncing
- Collaboration not working

**Diagnosis:**

```bash
# Check WebSocket in browser
# Open DevTools → Network → WS tab
# Look for failed WebSocket connections

# Check server WebSocket handling
DEBUG=sharedb:* npm run dev
```

**Solutions:**

```typescript
// Client-side WebSocket debugging
localStorage.setItem('debug', 'sharedb:*');

// Check WebSocket URL configuration
const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';

// Verify authentication on WebSocket
connection.on('error', (err) => {
  console.error('ShareDB connection error:', err);
});
```

#### Issue: Operational Transform conflicts

**Symptoms:**

- Text corruption
- Undo/redo issues
- Document state inconsistency

**Solutions:**

```bash
# Reset document state
make db-reset

# Check ShareDB operations
DEBUG=sharedb:ops npm run dev

# Verify document schema
node -e "
const schema = require('./packages/shared/src/schemas/document');
console.log(schema);
"
```

### Performance Issues

#### Issue: Slow document loading

**Symptoms:**

- Long load times
- Timeout errors
- Memory leaks

**Diagnosis:**

```bash
# Monitor performance
DEBUG=perf:* npm run dev

# Check database query performance
docker exec -it $(docker ps -q -f name=mongo) mongosh
use collab_demo_dev
db.runCommand({profile: 2})  # Enable profiling
db.system.profile.find().sort({ts: -1}).limit(5)
```

**Solutions:**

```javascript
// Optimize React rendering
import { memo, useMemo, useCallback } from 'react';

const DocumentEditor = memo(({ document, onUpdate }) => {
  const memoizedContent = useMemo(() =>
    processContent(document.content), [document.content]
  );

  const handleUpdate = useCallback((update) => {
    onUpdate(update);
  }, [onUpdate]);

  return <Editor content={memoizedContent} onChange={handleUpdate} />;
});
```

## DevX Tooling Issues

### Makefile and Script Issues

#### Issue: Makefile commands not working

**Symptoms:**

- `make: command not found`
- Script execution failures
- Permission denied errors

**Solutions:**

```bash
# Check make installation
which make
make --version

# Fix script permissions
chmod +x scripts/**/*.sh

# Use direct script execution
./scripts/testing/test-safe.sh
./scripts/quality/lint-safe.sh
```

#### Issue: Script timeout or hanging

**Symptoms:**

- Scripts never complete
- Timeout errors
- Process hanging

**Solutions:**

```bash
# Check script logs
tail -f .logs/test-*.log
tail -f .logs/lint-*.log

# Use shorter timeouts for debugging
TIMEOUT=30 make test

# Run individual components
node test/integration/user-workflows.test.js
```

### Linting and Formatting Issues

#### Issue: Biome/linting failures

**Symptoms:**

- Lint errors blocking builds
- Formatting inconsistencies
- Tool conflicts

**Solutions:**

```bash
# Check Biome installation
which biome
biome --version

# Reset Biome configuration
rm -rf .biome-cache
biome check --fix .

# Use fallback linting
npx @biomejs/biome check .
```

#### Issue: Markdown linting errors

**Symptoms:**

- MD040, MD022 errors
- Documentation build failures

**Solutions:**

```bash
# Fix markdown issues automatically
make lint-markdown --fix

# Check specific files
npx markdownlint-cli2 docs/**/*.md

# Ignore specific rules temporarily
<!-- markdownlint-disable MD040 -->
```

## Emergency Recovery Procedures

### Complete Environment Reset

When multiple issues occur simultaneously:

```bash
# 1. Stop all services
docker-compose down --volumes
kill -9 $(pnpm list | grep node)

# 2. Clean all artifacts
make clean
rm -rf node_modules pnpm-lock.yaml
rm -rf .logs .turbo

# 3. Reset environment
pnpm install
make setup

# 4. Verify installation
make quality
make test
```

### Database Recovery

For corrupted or inconsistent database state:

```bash
# 1. Backup current state (if needed)
make db-debug > backup-$(date +%s).json

# 2. Complete reset
docker-compose down
docker volume rm pub-sub-demo_mongodb_data
docker-compose up -d mongo

# 3. Reseed data
node test/fixtures/seed-dev-data.js

# 4. Verify
make db-debug
```

### Container Recovery

When Docker containers are problematic:

```bash
# 1. Stop everything
docker stop $(docker ps -aq)

# 2. Clean up
docker system prune -af
docker volume prune -f

# 3. Rebuild
docker-compose build --no-cache
docker-compose up -d

# 4. Verify
make dev
```

## Getting Help

### Internal Resources

1. **Documentation**: Check related docs in `docs/` directory
2. **Logs**: Always check `.logs/` for detailed error information
3. **Scripts**: Use `make help` to see all available commands
4. **Database**: Use `make db-debug` for database state information

### External Resources

1. **ShareDB**: [ShareDB Documentation](https://github.com/share/sharedb)
2. **MongoDB**: [MongoDB Troubleshooting](https://docs.mongodb.com/manual/administration/troubleshooting/)
3. **TypeScript**: [TypeScript Handbook](https://www.typescriptlang.org/docs/)
4. **Docker**: [Docker Documentation](https://docs.docker.com/)

### Diagnostic Information to Collect

When reporting issues, include:

```bash
# System information
uname -a
node --version
pnpm --version
docker --version

# Project state
make organize
make quality 2>&1 | head -20

# Recent logs
ls -la .logs/
tail -50 .logs/latest.log

# Process information
ps aux | grep node
docker ps -a
lsof -i :3000,:3001,:27017
```

This comprehensive guide should help resolve most development issues. For issues not covered here, check the specific component documentation or create a detailed issue report with the diagnostic information above.
