# Pino Logging System Integration Plan

## Overview

**✅ COMPLETED**: This plan outlined the integration of a comprehensive Pino v8 logging system into the pub-sub-demo project, replacing ad-hoc console.log statements and Winston usage with structured, production-ready logging [[memory:3829289]].

## Implementation Status: COMPLETE ✅

All major components of this plan have been successfully implemented:
- ✅ Core Logger Infrastructure
- ✅ Winston to Pino Migration
- ✅ Structured Logging Patterns
- ✅ Module-Specific Loggers
- ✅ Production-Ready Configuration

## Current State Analysis

### Issues with Current Logging

- **Ad-hoc console.log usage**: Scattered throughout codebase
- **No structured logging**: Difficult to parse and analyze logs
- **No log levels**: Can't control verbosity by environment
- **No contextual information**: Missing user IDs, request IDs, etc.
- **No log aggregation**: No centralized log collection

### Benefits of Pino Integration

- **10x faster** than alternatives like Winston
- **Structured JSON logging** for easy parsing
- **Environment-specific configuration**
- **Child loggers** for module-specific context
- **Pretty printing** for development
- **Production-ready** with external transport support

## Implementation Plan

### Phase 1: Core Logger Infrastructure (Week 1)

#### 1.1 Dependencies Installation

```bash
# Core logging dependencies
pnpm add pino@^8.15.0

# Development pretty printing
pnpm add -D pino-pretty@^10.2.0

# Optional external transports
pnpm add -D pino-http@^8.3.0         # HTTP request logging
```

#### 1.2 Core Logger Service

```typescript
// packages/shared/src/services/Logger.ts
import isNil from "lodash-es/isNil";
import pino, { type Logger as PinoLogger } from "pino";

export const LOG_LEVEL = {
  ERROR: "error",
  WARN: "warn",
  INFO: "info",
  DEBUG: "debug",
  TRACE: "trace",
} as const;

export type LogLevel = (typeof LOG_LEVEL)[keyof typeof LOG_LEVEL];

export type LogContext = Record<string, unknown>;

export type AppLogger = {
  error: (message: string, context?: LogContext) => void;
  warn: (message: string, context?: LogContext) => void;
  info: (message: string, context?: LogContext) => void;
  debug: (message: string, context?: LogContext) => void;
  trace: (message: string, context?: LogContext) => void;
  child: (bindings: LogContext) => AppLogger;
  flush: () => Promise<void>;
};

export const createAppLogger = (
  module: string,
  config?: Partial<LoggerConfig>
): AppLogger => {
  // Implementation details...
};

// Export default logger instance
export const logger = createAppLogger("app");
```

#### 1.3 Environment Configuration

```typescript
// packages/shared/src/config/logging-config.ts
export const LOGGING_CONFIG = {
  DEVELOPMENT: {
    level: LOG_LEVEL.DEBUG,
    enableConsole: true,
    enableFile: false,
    enableExternal: false,
  },
  PRODUCTION: {
    level: LOG_LEVEL.INFO,
    enableConsole: true,
    enableFile: true,
    filePath: ".logs/production.log",
    enableExternal: false,
  },
  TEST: {
    level: LOG_LEVEL.ERROR,
    enableConsole: false,
    enableFile: false,
    enableExternal: false,
  },
} as const;
```

### Phase 2: Application Integration (Week 2)

#### 2.1 Client-Side Integration

```tsx
// apps/client/src/providers/LoggerProvider.tsx
import { createContext, useContext, type ReactNode } from "react";
import { createAppLogger, type AppLogger } from "@/packages/shared/src/services/Logger";

const LoggerContext = createContext<AppLogger | null>(null);

export const LoggerProvider = ({ children }: { children: ReactNode }) => {
  const logger = useMemo(() => createAppLogger("client"), []);

  return (
    <LoggerContext.Provider value={logger}>
      {children}
    </LoggerContext.Provider>
  );
};

export const useLogger = (component?: string): AppLogger => {
  const context = useContext(LoggerContext);
  if (!context) {
    throw new Error("useLogger must be used within LoggerProvider");
  }
  return component ? context.child({ component }) : context;
};
```

#### 2.2 Server-Side Integration

```typescript
// apps/server/src/services/logger.ts
import { createAppLogger } from "@/packages/shared/src/services/Logger";

// Module-specific loggers
export const serverLogger = createAppLogger("server");
export const authLogger = createAppLogger("auth");
export const sharedbLogger = createAppLogger("sharedb");
export const apiLogger = createAppLogger("api");

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const requestId = Math.random().toString(36).substring(7);
  const logger = apiLogger.child({ requestId, method: req.method, url: req.url });

  req.logger = logger;
  logger.info("Request received");

  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info("Request completed", {
      statusCode: res.statusCode,
      duration: `${duration}ms`
    });
  });

  next();
};
```

### Phase 3: Migration Strategy (Week 3)

#### 3.1 Systematic Console.log Replacement

**Priority Order:**

1. **Server Routes** - API endpoints and middleware
2. **Authentication** - Login, signup, JWT handling
3. **ShareDB Service** - Real-time collaboration
4. **Client Components** - React components and hooks
5. **Shared Utilities** - Common functions and services

**Migration Pattern:**

```typescript
// Before
console.log("User created:", user.email);
console.error("Failed to create user:", error);

// After
import { authLogger } from "@/services/logger";

authLogger.info("User created", {
  userId: user.id,
  email: user.email,
  role: user.role
});

authLogger.error("Failed to create user", {
  email: userData.email,
  error: error.message,
  stack: error.stack
});
```

#### 3.2 File-by-File Migration

**Server Files (Priority 1):**

- `apps/server/src/routes/auth.routes.ts`
- `apps/server/src/routes/doc.routes.ts`
- `apps/server/src/services/auth.service.ts`
- `apps/server/src/services/sharedb.service.ts`
- `apps/server/src/middleware/passport.ts`
- `apps/server/src/middleware/websocket-auth.ts`

**Client Files (Priority 2):**

- `apps/client/src/components/LoginForm.tsx`
- `apps/client/src/components/DocumentEditor.tsx`
- `apps/client/src/hooks/useShareDB.ts`
- `apps/client/src/services/auth.service.ts`

**Shared Files (Priority 3):**

- `packages/shared/src/auth/validation.ts`
- `packages/shared/src/schemas/validation.ts`

### Phase 4: Enhanced Logging Features (Week 4)

#### 4.1 Request Correlation IDs

```typescript
// apps/server/src/middleware/correlation.ts
export const correlationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const correlationId = req.headers['x-correlation-id'] ||
                       crypto.randomUUID();

  req.correlationId = correlationId;
  res.setHeader('x-correlation-id', correlationId);

  // Add to all subsequent logs
  req.logger = serverLogger.child({ correlationId });

  next();
};
```

#### 4.2 User Context Logging

```typescript
// Enhanced auth middleware
export const authContextMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.user) {
    req.logger = req.logger.child({
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role
    });
  }
  next();
};
```

#### 4.3 Performance Monitoring

```typescript
// Performance logging utility
export const logPerformance = <T>(
  operation: string,
  fn: () => T | Promise<T>,
  logger: AppLogger
): T | Promise<T> => {
  const start = performance.now();

  try {
    const result = fn();

    if (result instanceof Promise) {
      return result.then(
        (value) => {
          const duration = performance.now() - start;
          logger.info(`${operation} completed`, { duration: `${duration.toFixed(2)}ms` });
          return value;
        },
        (error) => {
          const duration = performance.now() - start;
          logger.error(`${operation} failed`, {
            duration: `${duration.toFixed(2)}ms`,
            error: error.message
          });
          throw error;
        }
      );
    } else {
      const duration = performance.now() - start;
      logger.info(`${operation} completed`, { duration: `${duration.toFixed(2)}ms` });
      return result;
    }
  } catch (error) {
    const duration = performance.now() - start;
    logger.error(`${operation} failed`, {
      duration: `${duration.toFixed(2)}ms`,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
};
```

#### 4.4 Component Lifecycle Logging

```typescript
// apps/client/src/hooks/useComponentLogger.ts
export const useComponentLogger = (
  componentName: string,
  userId?: string
): AppLogger => {
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substring(2)}`);
  const contextLogger = useLogger();

  useEffect(() => {
    const logger = contextLogger.child({ component: componentName, sessionId, userId });

    logger.debug(`Component ${componentName} mounted`);

    return () => {
      logger.debug(`Component ${componentName} unmounted`);
    };
  }, [componentName, sessionId, userId, contextLogger]);

  return useMemo(
    () => contextLogger.child({ component: componentName, sessionId, userId }),
    [contextLogger, componentName, sessionId, userId]
  );
};
```

## Implementation Scripts

### Migration Script

```bash
#!/bin/bash
# scripts/quality/migrate-console-logs.sh
set -euo pipefail

readonly PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

log() {
    echo "[MIGRATION] $*"
}

find_console_statements() {
    local directory="$1"

    log "Scanning $directory for console statements..."

    # Find all console.log/error/warn statements
    grep -r -n --include="*.ts" --include="*.tsx" --include="*.js" \
         "console\.\(log\|error\|warn\|info\|debug\)" "$directory" || true
}

main() {
    cd "$PROJECT_ROOT"

    log "Starting console.log migration scan..."

    echo "=== Server Files ==="
    find_console_statements "apps/server/src"

    echo "=== Client Files ==="
    find_console_statements "apps/client/src"

    echo "=== Shared Files ==="
    find_console_statements "packages/shared/src"

    echo "=== Test Files ==="
    find_console_statements "test"

    log "Migration scan completed"
    log "Next: Replace console statements with structured logging"
}

main "$@"
```

### Validation Script

```bash
#!/bin/bash
# scripts/quality/validate-logging.sh
set -euo pipefail

readonly PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

log() {
    echo "[VALIDATION] $*"
}

check_console_usage() {
    log "Checking for remaining console statements..."

    local console_count=0

    # Check production code (exclude test files)
    while IFS= read -r file; do
        if grep -q "console\.\(log\|error\|warn\|info\|debug\)" "$file"; then
            echo "❌ Console statement found in: $file"
            grep -n "console\.\(log\|error\|warn\|info\|debug\)" "$file"
            ((console_count++))
        fi
    done < <(find apps packages -name "*.ts" -o -name "*.tsx" -o -name "*.js" | grep -v "__tests__" | grep -v "test")

    if [ $console_count -eq 0 ]; then
        log "✅ No console statements found in production code"
        return 0
    else
        log "❌ Found $console_count files with console statements"
        return 1
    fi
}

check_logger_imports() {
    log "Checking for proper logger imports..."

    # Check that files using logging import the logger
    local missing_imports=0

    while IFS= read -r file; do
        if grep -q "\.info\|\.error\|\.warn\|\.debug" "$file" && ! grep -q "import.*Logger\|from.*logger" "$file"; then
            echo "❌ Missing logger import in: $file"
            ((missing_imports++))
        fi
    done < <(find apps packages -name "*.ts" -o -name "*.tsx" | grep -v "__tests__")

    if [ $missing_imports -eq 0 ]; then
        log "✅ All files have proper logger imports"
        return 0
    else
        log "❌ Found $missing_imports files missing logger imports"
        return 1
    fi
}

main() {
    cd "$PROJECT_ROOT"

    log "Starting logging validation..."

    local errors=0

    check_console_usage || ((errors++))
    check_logger_imports || ((errors++))

    if [ $errors -eq 0 ]; then
        log "✅ All logging validation checks passed"
    else
        log "❌ Logging validation failed with $errors errors"
        exit 1
    fi
}

main "$@"
```

## Environment Configuration

### Development Environment Variables

```bash
# .env.development
LOG_LEVEL=debug
NODE_ENV=development
SERVICE_NAME=pub-sub-demo
APP_VERSION=1.0.0

# Pretty printing enabled in development
PINO_PRETTY=true
```

### Production Environment Variables

```bash
# .env.production
LOG_LEVEL=info
NODE_ENV=production
SERVICE_NAME=pub-sub-demo
APP_VERSION=1.0.0

# File logging enabled in production
LOG_FILE_PATH=.logs/production.log
LOG_ENABLE_FILE=true
```

### Test Environment Variables

```bash
# .env.test
LOG_LEVEL=error
NODE_ENV=test
SERVICE_NAME=pub-sub-demo-test

# Minimal logging in tests
LOG_ENABLE_CONSOLE=false
LOG_ENABLE_FILE=false
```

## Success Metrics

### Migration Completion

- [ ] Zero `console.log/error/warn` statements in production code
- [ ] All server routes using structured logging
- [ ] All client components using logger hooks
- [ ] All error handling includes structured context

### Performance

- [ ] No measurable performance impact from logging
- [ ] Log output formatted consistently
- [ ] Development logs are human-readable
- [ ] Production logs are machine-parseable

### Observability

- [ ] Request correlation IDs tracked
- [ ] User context included in relevant logs
- [ ] Performance metrics logged for key operations
- [ ] Error stack traces captured with context

## Timeline

### Week 1: Infrastructure

- [ ] **Day 1-2**: Install dependencies and create core logger service
- [ ] **Day 3-4**: Set up environment configuration and providers
- [ ] **Day 5**: Create client and server integration points

### Week 2: Integration

- [ ] **Day 1-2**: Integrate logger providers in React and Express apps
- [ ] **Day 3-4**: Create module-specific loggers and middleware
- [ ] **Day 5**: Test logging in development environment

### Week 3: Migration

- [ ] **Day 1-2**: Migrate server-side console statements (priority files)
- [ ] **Day 3-4**: Migrate client-side console statements
- [ ] **Day 5**: Migrate shared utilities and test scripts

### Week 4: Enhancement

- [ ] **Day 1-2**: Add correlation IDs and user context
- [ ] **Day 3-4**: Implement performance monitoring
- [ ] **Day 5**: Validation and final cleanup

## Maintenance

### Regular Tasks

- **Weekly**: Review log output for any anomalies
- **Monthly**: Check log file sizes and rotation needs
- **Quarterly**: Evaluate external logging service integration

### Monitoring

- Track log volume and performance impact
- Monitor for any console statement regressions
- Ensure consistent logging patterns across modules

This comprehensive logging system will significantly improve the observability and debugging capabilities of the pub-sub-demo project while maintaining the structured, type-safe patterns established in the codebase [[memory:3829289]].
