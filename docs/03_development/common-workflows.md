# Common Development Workflows

## Overview

This guide covers common development workflows for the collaborative document editing project, including feature development, debugging, performance optimization, and deployment processes.

## Feature Development Workflow

### 1. Starting a New Feature

```bash
# 1. Create feature branch
git checkout -b feature/your-feature-name

# 2. Set up development environment
make setup
make dev

# 3. Verify everything works
make test
make quality
```

### 2. Development Process

#### Type-Safe Development Pattern

Following our [[memory:3829289]] TypeScript best practices:

```typescript
// 1. Define types first
type FeatureData = {
  id: string;
  name: string;
  config?: FeatureConfig;
};

// 2. Create runtime type guard
function isFeatureData(data: unknown): data is FeatureData {
  return isObject(data) &&
         typeof data.id === 'string' &&
         typeof data.name === 'string' &&
         (isNil(data.config) || isFeatureConfig(data.config));
}

// 3. Use nullish coalescing and optional chaining
const processFeature = (data: unknown): FeatureData => {
  if (!isFeatureData(data)) {
    throw new Error('Invalid feature data');
  }

  return {
    ...data,
    config: data.config ?? getDefaultConfig(),
    name: data.name?.trim() ?? 'Unnamed Feature'
  };
};
```

#### Component Development Pattern

```typescript
// 1. Keep components under 100 lines [[memory:3829289]]
// 2. Use arrow functions
// 3. Explicit types for props

type FeatureComponentProps = {
  feature: FeatureData;
  onUpdate: (feature: FeatureData) => void;
};

const FeatureComponent = ({ feature, onUpdate }: FeatureComponentProps) => {
  // Component logic here (max 100 lines)
};
```

### 3. Testing During Development

```bash
# Run specific test types
make test-integration      # Integration tests
make test-user-workflows   # User workflow tests

# Safe testing with detailed output
make test                  # Full test suite with timeouts

# Monitor test logs
tail -f .logs/test-*.log
```

### 4. Quality Checks

```bash
# Comprehensive quality check
make quality              # lint + type-check + test

# Individual checks
make lint                 # All linting (TS, Shell, Markdown)
make type-check          # TypeScript validation
make format              # Code formatting
```

## Debugging Workflows

### 1. Application Debugging

#### Client-Side Debugging

```bash
# 1. Enable debug logging in browser
localStorage.setItem('debug', 'app:*,sharedb:*');

# 2. Check React DevTools
# - Install React Developer Tools extension
# - Use XState inspector for state machine debugging

# 3. Network debugging
# - Check Network tab for API calls
# - Verify WebSocket connections in Network/WS tab
```

#### Server-Side Debugging

```bash
# 1. Check server logs
tail -f apps/server/logs/app.log

# 2. Debug database state
make db-debug

# 3. Check MongoDB directly
docker exec -it $(docker ps -q -f name=mongo) mongosh
use collab_demo_dev
db.documents.find({}).pretty()
db.users.find({}).pretty()
```

### 2. Database Debugging

```bash
# Reset database with fresh data
make db-reset

# Debug database connections
node scripts/utilities/debug-db.js

# Seed development data
node test/fixtures/seed-dev-data.js
```

### 3. Authentication Debugging

```bash
# Use auth debug helper
node test/helpers/auth-debug.js

# Check JWT tokens
# Use jwt.io to decode tokens
# Verify token expiration and claims
```

### 4. ShareDB/Collaboration Debugging

```bash
# Enable ShareDB debug logging
DEBUG=sharedb:* npm run dev

# Check WebSocket connections
# Browser DevTools → Network → WS tab
# Verify authentication and document subscription
```

## Performance Optimization Workflow

### 1. Performance Monitoring

```bash
# Enable performance logging
NODE_ENV=development DEBUG=perf:* npm run dev

# Monitor bundle size
pnpm run build
npx vite-bundle-analyzer apps/client/dist
```

### 2. Database Performance

```bash
# Monitor MongoDB performance
docker exec -it $(docker ps -q -f name=mongo) mongosh --eval "db.runCommand({profile: 2})"

# Check slow queries
db.system.profile.find().sort({ts: -1}).limit(5).pretty()
```

### 3. Client Performance

```javascript
// Use React Profiler
import { Profiler } from 'react';

const onRenderCallback = (id, phase, actualDuration) => {
  console.log('Render:', { id, phase, actualDuration });
};

// Wrap components for profiling
<Profiler id="DocumentEditor" onRender={onRenderCallback}>
  <DocumentEditor />
</Profiler>
```

## Deployment Workflow

### 1. Pre-deployment Checklist

```bash
# 1. Full quality check
make quality

# 2. Test in production-like environment
NODE_ENV=production make test

# 3. Build and verify
make build
make clean && make build  # Clean build

# 4. Security check
npm audit
pnpm audit
```

### 2. Environment Setup

```bash
# 1. Production environment files
cp apps/client/.env.example apps/client/.env.production
cp apps/server/.env.example apps/server/.env.production

# 2. Set production variables
# - DATABASE_URL (production MongoDB)
# - JWT_ACCESS_SECRET (strong secret)
# - JWT_REFRESH_SECRET (different strong secret)
# - NODE_ENV=production
```

### 3. Docker Deployment

```bash
# 1. Build production images
docker-compose -f docker-compose.prod.yml build

# 2. Test production containers
docker-compose -f docker-compose.prod.yml up -d
make test-integration

# 3. Deploy
docker-compose -f docker-compose.prod.yml up -d
```

## Maintenance Workflows

### 1. Dependency Updates

```bash
# 1. Check for updates
pnpm outdated

# 2. Update dependencies
pnpm update

# 3. Test after updates
make clean
make setup
make quality
```

### 2. Security Maintenance

```bash
# 1. Security audit
npm audit
pnpm audit

# 2. Check for vulnerabilities
npx audit-ci --config audit-ci.json

# 3. Update security patches
pnpm audit --fix
```

### 3. Log Rotation

```bash
# Clean old logs (automated in scripts)
find .logs -name "*.log" -mtime +7 -delete

# Archive important logs
tar -czf logs-$(date +%Y%m%d).tar.gz .logs/
```

## Troubleshooting Quick Reference

### Common Issues

| Issue | Quick Fix | Detailed Guide |
|-------|-----------|----------------|
| MongoDB connection | `make db-reset` | [Database Guide](#database-debugging) |
| TypeScript errors | `make type-check` | [Type Safety Guide](../99_appendix/typescript-troubleshooting.md) |
| Test failures | `make test-no-rate-limit` | [Testing Guide](../04_testing/testing-guide.md) |
| Build failures | `make clean && make build` | [Build Troubleshooting](#build-issues) |
| Port conflicts | `lsof -ti:3000,3001 \| xargs kill` | [Port Guide](#port-conflicts) |

### Build Issues

```bash
# Clear all caches
make clean
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules

# Reinstall
pnpm install

# Rebuild
make build
```

### Port Conflicts

```bash
# Find processes using ports
lsof -i :3000
lsof -i :3001
lsof -i :27017

# Kill processes
kill -9 $(lsof -ti:3000)
kill -9 $(lsof -ti:3001)
```

## Advanced Workflows

### 1. Multi-User Testing

```bash
# 1. Set up multiple test users
node test/fixtures/seed-dev-data.js

# 2. Open multiple browser sessions
# - Use different browsers or incognito windows
# - Login as different test users
# - Test collaborative editing

# 3. Monitor real-time sync
# - Watch network requests
# - Check ShareDB operations in browser console
```

### 2. Load Testing

```bash
# 1. Install load testing tools
npm install -g artillery

# 2. Create load test config
# test/load/artillery.yml

# 3. Run load tests
artillery run test/load/artillery.yml
```

### 3. Integration with External Services

```bash
# 1. Mock external services for testing
# Use MSW (Mock Service Worker) for API mocking

# 2. Test external integrations
# Set up test accounts for third-party services
# Use environment-specific configurations
```

## Best Practices Summary

### Development

- Use type guards for all external data [[memory:3820036]]
- Replace `||` with `??` for nullish coalescing [[memory:3829289]]
- Keep components under 100 lines
- Use `make` commands for all operations

### Testing

- Focus on user workflows over code coverage [[memory:3829289]]
- Use safe script execution with timeouts
- Test multi-user scenarios regularly
- Maintain comprehensive test fixtures

### Quality

- Run `make quality` before commits
- Use strict TypeScript settings
- Follow shellcheck compliance for scripts
- Maintain comprehensive documentation

### Security

- Never commit secrets or API keys
- Use environment-specific configuration
- Regularly audit dependencies
- Monitor for security vulnerabilities

## Related Documentation

- [Testing Guide](../04_testing/testing-guide.md)
- [Troubleshooting Guide](troubleshooting-guide.md)
- [Contribution Guidelines](contribution-guidelines.md)
- [Architecture Overview](../02_architecture/00_INDEX.md)
