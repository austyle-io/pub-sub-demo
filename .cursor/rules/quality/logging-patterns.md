# Structured Logging Patterns

## 1. No Console.log in Production Code

**Rule**: Never use `console.log`, `console.error`, or other console methods in production code.

```ts
// ❌ Bad - console statements
function processDocument(doc: Document) {
  console.log('Processing document:', doc.id);
  console.error('Failed to process:', doc.id);
}

// ✅ Good - structured logging
function processDocument(doc: Document) {
  logger.info('Processing document', { documentId: doc.id });
  logger.error('Failed to process document', { documentId: doc.id });
}
```

## 2. Use Structured Logging

**Rule**: Always use structured logging with contextual data.

```ts
import { logger } from '../services/logger';

// ✅ Good - structured logging with context
function authenticateUser(credentials: LoginCredentials) {
  logger.info('User authentication attempt', {
    userId: credentials.email,
    timestamp: new Date().toISOString(),
    userAgent: req.headers['user-agent'],
  });

  try {
    const user = await validateCredentials(credentials);

    logger.info('User authenticated successfully', {
      userId: user.id,
      loginMethod: 'password',
      sessionId: generateSessionId(),
    });

    return user;
  } catch (error) {
    logger.error('Authentication failed', {
      userId: credentials.email,
      error: error.message,
      attemptId: generateAttemptId(),
    });
    throw error;
  }
}
```

## 3. ShareDB Operation Logging

**Rule**: Log ShareDB operations with operation details and user context.

```ts
// ✅ Good - ShareDB operation logging
function applyShareDBOperation(op: ShareDBOperation, userId: string) {
  logger.info('ShareDB operation received', {
    operationType: op.type,
    documentId: op.d,
    userId,
    operationId: generateOperationId(),
    timestamp: new Date().toISOString(),
  });

  try {
    const result = doc.submitOp(op);

    logger.info('ShareDB operation applied successfully', {
      operationType: op.type,
      documentId: op.d,
      userId,
      operationId: op.operationId,
      resultVersion: result.version,
    });

    return result;
  } catch (error) {
    logger.error('ShareDB operation failed', {
      operationType: op.type,
      documentId: op.d,
      userId,
      operationId: op.operationId,
      error: error.message,
      errorStack: error.stack,
    });
    throw error;
  }
}
```

## 4. WebSocket Connection Logging

**Rule**: Log WebSocket events with connection context.

```ts
// ✅ Good - WebSocket connection logging
function handleWebSocketConnection(ws: WebSocket, req: Request) {
  const connectionId = generateConnectionId();
  const clientIP = req.ip;

  logger.info('WebSocket connection established', {
    connectionId,
    clientIP,
    userAgent: req.headers['user-agent'],
    timestamp: new Date().toISOString(),
  });

  ws.on('message', (data) => {
    logger.debug('WebSocket message received', {
      connectionId,
      messageSize: data.length,
      timestamp: new Date().toISOString(),
    });
  });

  ws.on('close', (code, reason) => {
    logger.info('WebSocket connection closed', {
      connectionId,
      closeCode: code,
      closeReason: reason.toString(),
      duration: Date.now() - connectionStart,
    });
  });

  ws.on('error', (error) => {
    logger.error('WebSocket connection error', {
      connectionId,
      error: error.message,
      errorStack: error.stack,
    });
  });
}
```

## 5. API Request/Response Logging

**Rule**: Log HTTP requests and responses with timing and status information.

```ts
// ✅ Good - Express middleware for request logging
function requestLogger(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  const requestId = generateRequestId();

  // Add request ID to response headers
  res.setHeader('X-Request-ID', requestId);

  logger.info('HTTP request received', {
    requestId,
    method: req.method,
    url: req.url,
    userAgent: req.headers['user-agent'],
    clientIP: req.ip,
    userId: req.user?.id,
  });

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;

    logger.info('HTTP request completed', {
      requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      responseSize: res.get('content-length'),
    });
  });

  next();
}
```

## 6. Error Logging Standards

**Rule**: Log errors with full context and stack traces.

```ts
// ✅ Good - comprehensive error logging
function handleError(error: Error, context: ErrorContext) {
  const errorId = generateErrorId();

  logger.error('Application error occurred', {
    errorId,
    errorName: error.name,
    errorMessage: error.message,
    errorStack: error.stack,
    context: {
      userId: context.userId,
      documentId: context.documentId,
      operation: context.operation,
      timestamp: new Date().toISOString(),
    },
    // Add additional context based on error type
    ...(error instanceof ValidationError && {
      validationErrors: error.details
    }),
    ...(error instanceof DatabaseError && {
      query: error.query,
      params: error.params
    }),
  });

  // Also log to external error tracking if configured
  if (process.env.NODE_ENV === 'production') {
    errorTracker.captureException(error, {
      extra: { errorId, context },
    });
  }
}
```

## 7. Performance Logging

**Rule**: Log performance metrics for critical operations.

```ts
// ✅ Good - performance logging utility
function withPerformanceLogging<T>(
  operation: string,
  fn: () => Promise<T>,
  context?: Record<string, unknown>
): Promise<T> {
  const startTime = performance.now();
  const operationId = generateOperationId();

  logger.info('Performance operation started', {
    operation,
    operationId,
    context,
    startTime: new Date().toISOString(),
  });

  return fn()
    .then((result) => {
      const duration = performance.now() - startTime;

      logger.info('Performance operation completed', {
        operation,
        operationId,
        duration: Math.round(duration),
        status: 'success',
        context,
      });

      return result;
    })
    .catch((error) => {
      const duration = performance.now() - startTime;

      logger.error('Performance operation failed', {
        operation,
        operationId,
        duration: Math.round(duration),
        status: 'error',
        error: error.message,
        context,
      });

      throw error;
    });
}

// Usage example
const document = await withPerformanceLogging(
  'document-retrieval',
  () => getDocument(documentId),
  { documentId, userId }
);
```

## 8. Security Event Logging

**Rule**: Log security-related events for auditing.

```ts
// ✅ Good - security event logging
function logSecurityEvent(
  eventType: SecurityEventType,
  userId: string,
  details: Record<string, unknown>
) {
  logger.warn('Security event detected', {
    eventType,
    userId,
    timestamp: new Date().toISOString(),
    severity: getSecurityEventSeverity(eventType),
    details,
    sessionId: getCurrentSessionId(),
    clientIP: getCurrentClientIP(),
  });

  // Also send to security monitoring system
  if (isHighSeverityEvent(eventType)) {
    securityMonitor.alert({
      type: eventType,
      userId,
      details,
      timestamp: new Date(),
    });
  }
}

// Usage examples
logSecurityEvent('FAILED_LOGIN_ATTEMPT', userId, {
  attemptCount: 3,
  lastAttemptTime: new Date(),
});

logSecurityEvent('SUSPICIOUS_DOCUMENT_ACCESS', userId, {
  documentId,
  accessPattern: 'bulk_download',
});
```

## 9. Log Levels and Filtering

**Rule**: Use appropriate log levels for different types of information.

```ts
// ✅ Good - appropriate log levels
class DocumentService {
  async createDocument(data: CreateDocumentRequest, userId: string) {
    // DEBUG: Development debugging information
    logger.debug('Document creation request received', {
      requestData: data,
      userId
    });

    // INFO: Normal application flow
    logger.info('Creating new document', {
      userId,
      documentType: data.type
    });

    try {
      const document = await this.repository.create(data);

      // INFO: Successful operation
      logger.info('Document created successfully', {
        documentId: document.id,
        userId,
        documentType: data.type,
      });

      return document;
    } catch (error) {
      // ERROR: Operation failure
      logger.error('Failed to create document', {
        error: error.message,
        userId,
        requestData: data,
      });

      throw error;
    }
  }
}
```

## 10. Log Sanitization

**Rule**: Sanitize sensitive data in logs.

```ts
// ✅ Good - log sanitization
function sanitizeLogData(data: Record<string, unknown>): Record<string, unknown> {
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey'];
  const sanitized = { ...data };

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }

  // Redact email domains for privacy
  if (typeof sanitized.email === 'string') {
    sanitized.email = sanitized.email.replace(/@.+/, '@[DOMAIN]');
  }

  return sanitized;
}

// Usage in logger wrapper
function logWithSanitization(level: LogLevel, message: string, data?: Record<string, unknown>) {
  const sanitizedData = data ? sanitizeLogData(data) : undefined;
  logger[level](message, sanitizedData);
}
```

## Enforcement Checklist

- [ ] No `console.log` statements in production code
- [ ] All logging uses structured format with context
- [ ] ShareDB operations logged with operation details
- [ ] WebSocket events logged with connection context
- [ ] HTTP requests/responses logged with timing
- [ ] Errors logged with full context and stack traces
- [ ] Performance metrics logged for critical operations
- [ ] Security events logged for auditing
- [ ] Appropriate log levels used (DEBUG, INFO, WARN, ERROR)
- [ ] Sensitive data sanitized in logs
