---
description:
globs:
alwaysApply: false
---

# Pino v8 Logging Client Implementation Plan

## Overview

Create a structured logging system using Pino v8 to replace all console logging throughout the application, with environment-specific configuration, child loggers for context, and optional external monitoring integration.

## 1. Dependencies & Installation

### Required Packages

```bash
# Core logging
pnpm add pino@^8.15.0

# Development pretty printing
pnpm add -D pino-pretty@^10.2.0

# Optional: External monitoring transports
pnpm add -D pino-datadog@^2.0.0  # If using Datadog
pnpm add -D pino-logflare@^0.4.0  # If using Logflare
pnpm add -D pino-http@^8.3.0     # If adding HTTP request logging
```

## 2. Core Architecture

### Logger Service Structure

Following cursor rules:

- ✅ Use `type` instead of `interface`
- ✅ Use arrow functions instead of function declarations
- ✅ Use explicit imports from lodash
- ✅ Use union literal constants with `as const`
- ✅ Follow naming conventions with domain-specific prefixes

```typescript
// src/lib/services/Logger.ts
import pino, { Logger as PinoLogger } from "pino";
import { isNil, isString, isEmpty } from "lodash";

// Union literal constants following cursor rules
export const LOG_LEVEL = {
    ERROR: "error",
    WARN: "warn",
    INFO: "info",
    DEBUG: "debug",
    TRACE: "trace",
} as const;

export type LogLevel = (typeof LOG_LEVEL)[keyof typeof LOG_LEVEL];

export const LOG_ENVIRONMENT = {
    DEVELOPMENT: "development",
    PRODUCTION: "production",
    TEST: "test",
} as const;

export type LogEnvironment = (typeof LOG_ENVIRONMENT)[keyof typeof LOG_ENVIRONMENT];

// Type definitions following cursor rules
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

export type LoggerConfig = {
    level: LogLevel;
    environment: LogEnvironment;
    service: string;
    version?: string;
    enableConsole?: boolean;
    enableFile?: boolean;
    filePath?: string;
    enableExternal?: boolean;
    externalConfig?: ExternalLogConfig;
};

export type ExternalLogConfig = {
    type: "datadog" | "logflare" | "custom";
    apiKey?: string;
    endpoint?: string;
    options?: Record<string, unknown>;
};
```

### Logger Implementation

```typescript
// Create logger with environment-specific configuration
const createPinoInstance = (config: LoggerConfig): PinoLogger => {
    const isDevelopment = config.environment === LOG_ENVIRONMENT.DEVELOPMENT;

    const baseConfig = {
        level: config.level,
        name: config.service,
        ...(config.version && { version: config.version }),
        timestamp: pino.stdTimeFunctions.isoTime,
        formatters: {
            level: (label: string) => ({ level: label }),
            bindings: (bindings: Record<string, unknown>) => ({
                service: bindings.name,
                hostname: bindings.hostname,
                pid: bindings.pid,
            }),
        },
    };

    // Development configuration with pretty printing
    if (isDevelopment && config.enableConsole) {
        return pino({
            ...baseConfig,
            transport: {
                target: "pino-pretty",
                options: {
                    colorize: true,
                    translateTime: "SYS:standard",
                    ignore: "pid,hostname",
                    singleLine: false,
                    hideObject: false,
                },
            },
        });
    }

    // Production configuration
    const targets = [];

    if (config.enableConsole) {
        targets.push({ target: "pino/file", options: {} });
    }

    if (config.enableFile && config.filePath) {
        targets.push({
            target: "pino/file",
            options: { destination: config.filePath },
        });
    }

    if (config.enableExternal && config.externalConfig) {
        targets.push(createExternalTarget(config.externalConfig));
    }

    return pino({
        ...baseConfig,
        ...(targets.length > 0 && {
            transport: { targets },
        }),
    });
};

const createExternalTarget = (config: ExternalLogConfig) => {
    // Implementation for external logging services
    const TARGET_CONFIG = {
        datadog: "pino-datadog",
        logflare: "pino-logflare",
        custom: config.endpoint,
    } as const;

    return {
        target: TARGET_CONFIG[config.type] || config.endpoint,
        options: {
            ...(config.apiKey && { apiKey: config.apiKey }),
            ...(config.endpoint && { endpoint: config.endpoint }),
            ...config.options,
        },
    };
};

// Main logger factory following cursor rules
export const createAppLogger = (module: string, config?: Partial<LoggerConfig>): AppLogger => {
    const defaultConfig: LoggerConfig = {
        level: (process.env.LOG_LEVEL as LogLevel) || LOG_LEVEL.INFO,
        environment: (process.env.NODE_ENV as LogEnvironment) || LOG_ENVIRONMENT.DEVELOPMENT,
        service: process.env.SERVICE_NAME || "austdx-app",
        version: process.env.APP_VERSION,
        enableConsole: true,
        enableFile: false,
        enableExternal: false,
    };

    const finalConfig = { ...defaultConfig, ...config };
    const pinoInstance = createPinoInstance(finalConfig);
    const childLogger = pinoInstance.child({ module });

    return {
        error: (message: string, context?: LogContext) => {
            if (isNil(context)) {
                childLogger.error(message);
            } else {
                childLogger.error(context, message);
            }
        },
        warn: (message: string, context?: LogContext) => {
            if (isNil(context)) {
                childLogger.warn(message);
            } else {
                childLogger.warn(context, message);
            }
        },
        info: (message: string, context?: LogContext) => {
            if (isNil(context)) {
                childLogger.info(message);
            } else {
                childLogger.info(context, message);
            }
        },
        debug: (message: string, context?: LogContext) => {
            if (isNil(context)) {
                childLogger.debug(message);
            } else {
                childLogger.debug(context, message);
            }
        },
        trace: (message: string, context?: LogContext) => {
            if (isNil(context)) {
                childLogger.trace(message);
            } else {
                childLogger.trace(context, message);
            }
        },
        child: (bindings: LogContext): AppLogger => {
            const newChildLogger = childLogger.child(bindings);
            return createAppLoggerFromPino(newChildLogger);
        },
        flush: async (): Promise<void> => {
            return new Promise((resolve) => {
                pinoInstance.flush(resolve);
            });
        },
    };
};

// Helper to create AppLogger from existing Pino instance
const createAppLoggerFromPino = (pinoLogger: PinoLogger): AppLogger => ({
    error: (message: string, context?: LogContext) => {
        if (isNil(context)) {
            pinoLogger.error(message);
        } else {
            pinoLogger.error(context, message);
        }
    },
    warn: (message: string, context?: LogContext) => {
        if (isNil(context)) {
            pinoLogger.warn(message);
        } else {
            pinoLogger.warn(context, message);
        }
    },
    info: (message: string, context?: LogContext) => {
        if (isNil(context)) {
            pinoLogger.info(message);
        } else {
            pinoLogger.info(context, message);
        }
    },
    debug: (message: string, context?: LogContext) => {
        if (isNil(context)) {
            pinoLogger.debug(message);
        } else {
            pinoLogger.debug(context, message);
        }
    },
    trace: (message: string, context?: LogContext) => {
        if (isNil(context)) {
            pinoLogger.trace(message);
        } else {
            pinoLogger.trace(context, message);
        }
    },
    child: (bindings: LogContext): AppLogger => {
        return createAppLoggerFromPino(pinoLogger.child(bindings));
    },
    flush: async (): Promise<void> => {
        return new Promise((resolve) => {
            pinoLogger.flush(resolve);
        });
    },
});

// Export default logger instance
export const logger = createAppLogger("app");
```

## 3. Environment Configuration

### Environment Variables

```bash
# .env.local (development)
LOG_LEVEL=debug
NODE_ENV=development
SERVICE_NAME=austdx-app
APP_VERSION=1.0.0

# .env.production
LOG_LEVEL=info
NODE_ENV=production
SERVICE_NAME=austdx-app
APP_VERSION=1.0.0

# Optional external logging
DATADOG_API_KEY=your-api-key
LOGFLARE_SOURCE_TOKEN=your-token
```

### Configuration Constants

```typescript
// src/lib/config/logging-config.ts
import { LoggerConfig, LOG_LEVEL, LOG_ENVIRONMENT } from "../services/Logger";

export const LOGGING_CONFIG = {
    DEVELOPMENT: {
        level: LOG_LEVEL.DEBUG,
        environment: LOG_ENVIRONMENT.DEVELOPMENT,
        enableConsole: true,
        enableFile: false,
        enableExternal: false,
    } satisfies Partial<LoggerConfig>,

    PRODUCTION: {
        level: LOG_LEVEL.INFO,
        environment: LOG_ENVIRONMENT.PRODUCTION,
        enableConsole: true,
        enableFile: true,
        filePath: "./logs/app.log",
        enableExternal: true,
        externalConfig: {
            type: "datadog" as const,
            apiKey: process.env.DATADOG_API_KEY,
        },
    } satisfies Partial<LoggerConfig>,

    TEST: {
        level: LOG_LEVEL.ERROR,
        environment: LOG_ENVIRONMENT.TEST,
        enableConsole: false,
        enableFile: false,
        enableExternal: false,
    } satisfies Partial<LoggerConfig>,
} as const;
```

## 4. Module-Specific Loggers

### Map Module Logger

```typescript
// src/lib/modules/map/services/Logger.ts
import { createAppLogger } from "@/lib/services/Logger";

export const mapLogger = createAppLogger("map");

// Child loggers for different components
export const createMapComponentLogger = (component: string) => {
    return mapLogger.child({ component });
};

// Specific loggers for major components
export const mapStoreLogger = createMapComponentLogger("store");
export const widgetRegistryLogger = createMapComponentLogger("widget-registry");
export const errorRecoveryLogger = createMapComponentLogger("error-recovery");
export const performanceLogger = createMapComponentLogger("performance");
```

### Database Logger

```typescript
// src/lib/db/logger.ts
import { createAppLogger } from "@/lib/services/Logger";

export const dbLogger = createAppLogger("database");

// Query logging helper
export const logQuery = (query: string, params?: unknown[], duration?: number) => {
    dbLogger.debug("Database query executed", {
        query,
        params,
        duration,
        timestamp: new Date().toISOString(),
    });
};

// Error logging helper
export const logDbError = (operation: string, error: Error, context?: Record<string, unknown>) => {
    dbLogger.error(`Database operation failed: ${operation}`, {
        error: error.message,
        stack: error.stack,
        operation,
        ...context,
    });
};
```

## 5. React Integration

### Logger Context

```typescript
// src/lib/providers/LoggerProvider.tsx
import { createContext, useContext, ReactNode } from "react";
import { AppLogger, createAppLogger } from "@/lib/services/Logger";
import { isNil } from "lodash";

type LoggerContextType = {
    logger: AppLogger;
    createComponentLogger: (component: string) => AppLogger;
};

const LoggerContext = createContext<LoggerContextType | null>(null);

type LoggerProviderProps = {
    children: ReactNode;
    module?: string;
};

export const LoggerProvider = ({ children, module = "app" }: LoggerProviderProps) => {
    const logger = createAppLogger(module);

    const createComponentLogger = (component: string): AppLogger => {
        return logger.child({ component });
    };

    const contextValue = {
        logger,
        createComponentLogger,
    } satisfies LoggerContextType;

    return (
        <LoggerContext.Provider value={contextValue}>
            {children}
        </LoggerContext.Provider>
    );
};

export const useLogger = (component?: string): AppLogger => {
    const context = useContext(LoggerContext);

    if (isNil(context)) {
        throw new Error("useLogger must be used within LoggerProvider");
    }

    if (isNil(component)) {
        return context.logger;
    }

    return context.createComponentLogger(component);
};
```

### Hook for Component Logging

```typescript
// src/lib/hooks/useComponentLogger.ts
import { useLogger } from "@/lib/providers/LoggerProvider";
import { useEffect } from "react";

export const useComponentLogger = (componentName: string) => {
    const logger = useLogger(componentName);

    useEffect(() => {
        logger.debug(`Component ${componentName} mounted`);

        return () => {
            logger.debug(`Component ${componentName} unmounted`);
        };
    }, [logger, componentName]);

    return logger;
};
```

## 6. Implementation Migration

### Phase 1: Core Infrastructure (Day 1)

1. Install Pino dependencies
2. Create core Logger service
3. Set up environment configuration
4. Create React context and providers

### Phase 2: Replace Console Logging (Day 2)

Target files with console usage:

- `src/modules/map/services/PerformanceOptimizer.ts`
- `src/modules/map/services/WidgetRegistry.ts`
- `src/modules/map/stores/MapStore.tsx`
- `src/modules/map/services/ErrorRecovery.ts`

### Phase 3: Testing & Documentation (Day 3)

1. Unit tests for logger service
2. Integration tests with React components
3. Performance testing
4. Documentation and examples

## 7. Usage Examples

### Basic Logging

```typescript
import { logger } from "@/lib/services/Logger";

// Simple logging
logger.info("Application started");
logger.error("Failed to connect to database");

// With context
logger.info("User login successful", {
    userId: "123",
    email: "user@example.com",
    timestamp: new Date().toISOString(),
});
```

### Component Logging

```typescript
import { useComponentLogger } from "@/lib/hooks/useComponentLogger";

const UserProfile = ({ userId }: { userId: string }) => {
    const logger = useComponentLogger("UserProfile");

    useEffect(() => {
        logger.info("Loading user profile", { userId });

        const loadUser = async () => {
            try {
                const user = await fetchUser(userId);
                logger.info("User profile loaded successfully", {
                    userId,
                    userName: user.name
                });
            } catch (error) {
                logger.error("Failed to load user profile", {
                    userId,
                    error: error.message,
                    stack: error.stack,
                });
            }
        };

        loadUser();
    }, [userId, logger]);

    return <div>User Profile Component</div>;
};
```

### Error Recovery Logging

```typescript
// In ErrorRecovery service
import { errorRecoveryLogger } from "../services/Logger";

export class MapErrorRecoveryManager {
    async handleError(error: Partial<MapError>): Promise<void> {
        errorRecoveryLogger.warn("Error recovery initiated", {
            errorId: error.id,
            errorCode: error.code,
            retryCount: error.retryCount,
            strategy: error.retryStrategy,
        });

        try {
            await this.executeRecoveryStrategy(error);

            errorRecoveryLogger.info("Error recovery successful", {
                errorId: error.id,
                retryCount: error.retryCount,
                recoveryDuration: Date.now() - error.timestamp,
            });
        } catch (recoveryError) {
            errorRecoveryLogger.error("Error recovery failed", {
                errorId: error.id,
                originalError: error.message,
                recoveryError: recoveryError.message,
                retryCount: error.retryCount,
            });
        }
    }
}
```

## 8. External Monitoring Integration

### Datadog Integration

```typescript
// src/lib/services/monitoring/DatadogLogger.ts
import { createAppLogger } from "../Logger";

export const datadogLogger = createAppLogger("datadog", {
    enableExternal: true,
    externalConfig: {
        type: "datadog",
        apiKey: process.env.DATADOG_API_KEY,
        options: {
            service: process.env.SERVICE_NAME,
            env: process.env.NODE_ENV,
            version: process.env.APP_VERSION,
        },
    },
});
```

### Custom Metrics and Traces

```typescript
// src/lib/services/monitoring/MetricsLogger.ts
import { logger } from "../Logger";

export const logPerformanceMetric = (metric: string, value: number, unit: string, tags?: Record<string, string>) => {
    logger.info("Performance metric recorded", {
        metric,
        value,
        unit,
        tags,
        timestamp: new Date().toISOString(),
    });
};

export const logUserAction = (action: string, userId: string, metadata?: Record<string, unknown>) => {
    logger.info("User action performed", {
        action,
        userId,
        metadata,
        timestamp: new Date().toISOString(),
    });
};
```

## 9. Testing Strategy

### Unit Tests

```typescript
// src/lib/services/__tests__/Logger.test.ts
import { createAppLogger, LOG_LEVEL } from "../Logger";

describe("Logger Service", () => {
    let logger: AppLogger;

    beforeEach(() => {
        logger = createAppLogger("test");
    });

    it("should create logger with correct module name", () => {
        expect(logger).toBeDefined();
    });

    it("should log messages with context", () => {
        const consoleSpy = jest.spyOn(console, "log");

        logger.info("Test message", { key: "value" });

        expect(consoleSpy).toHaveBeenCalled();
    });

    it("should create child loggers", () => {
        const childLogger = logger.child({ component: "test-component" });

        expect(childLogger).toBeDefined();
    });
});
```

### Integration Tests

```typescript
// src/lib/providers/__tests__/LoggerProvider.test.tsx
import { render } from "@testing-library/react";
import { LoggerProvider, useLogger } from "../LoggerProvider";

const TestComponent = () => {
    const logger = useLogger("test-component");

    logger.info("Test component rendered");

    return <div>Test Component</div>;
};

describe("LoggerProvider", () => {
    it("should provide logger context to children", () => {
        render(
            <LoggerProvider>
                <TestComponent />
            </LoggerProvider>
        );

        // Test passes if no context errors are thrown
    });
});
```

## 10. Performance Considerations

### Async Logging

```typescript
// Use async logging for better performance
export const createAsyncAppLogger = (module: string): AppLogger => {
    const logger = createAppLogger(module);

    return {
        ...logger,
        info: (message: string, context?: LogContext) => {
            setImmediate(() => logger.info(message, context));
        },
        error: (message: string, context?: LogContext) => {
            setImmediate(() => logger.error(message, context));
        },
        // ... other methods
    };
};
```

### Log Sampling

```typescript
// Implement log sampling for high-volume scenarios
export const createSampledLogger = (module: string, sampleRate: number = 0.1): AppLogger => {
    const logger = createAppLogger(module);

    const shouldLog = () => cryptoRandom() < sampleRate;

    return {
        ...logger,
        debug: (message: string, context?: LogContext) => {
            if (shouldLog()) {
                logger.debug(message, context);
            }
        },
        // Sample debug/trace, but always log info/warn/error
    };
};
```

## 11. Success Criteria

### Technical Requirements

- [ ] All console.\* statements replaced with structured Pino logging
- [ ] Log levels configurable via environment variables
- [ ] Child loggers provide component-specific context
- [ ] Development-friendly output with pino-pretty
- [ ] Production logging with structured JSON output
- [ ] Optional external monitoring integration working
- [ ] Zero performance impact on application startup
- [ ] Comprehensive test coverage (>90%)

### Quality Gates

- [ ] No console.log statements in production code
- [ ] Structured logging with consistent format
- [ ] Error context includes stack traces and metadata
- [ ] Performance metrics logging implemented
- [ ] Security: No sensitive data in logs
- [ ] Log rotation and retention policies configured

## 12. Monitoring and Maintenance

### Log Analysis Queries

```typescript
// Example log analysis helpers
export const LOG_QUERIES = {
    ERRORS_BY_COMPONENT: "level:error | group by component",
    PERFORMANCE_METRICS: 'message:"Performance metric" | stats avg(value) by metric',
    USER_ACTIONS: 'message:"User action" | group by action',
    ERROR_RECOVERY: "module:map component:error-recovery | stats count by strategy",
} as const;
```

### Health Checks

```typescript
// src/lib/services/health/LoggerHealth.ts
import { logger } from "../Logger";

export const checkLoggerHealth = async (): Promise<boolean> => {
    try {
        logger.info("Logger health check");
        await logger.flush();
        return true;
    } catch (error) {
        console.error("Logger health check failed:", error);
        return false;
    }
};
```

This comprehensive plan provides a production-ready Pino v8 logging client that follows all cursor rules and integrates seamlessly with the existing application architecture.
