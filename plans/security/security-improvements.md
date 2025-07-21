# Security Improvements & Action Items Plan

**Project**: Collaborative Document Editor
**Created**: January 20, 2025
**Status**: Active Implementation Required
**Current Security Rating**: B+ (Good foundation with critical gaps)

## Executive Summary

Following the successful implementation of document management and collaborative editing features, this plan addresses critical security gaps and improvement opportunities identified in the codebase review. The plan is organized by priority levels with specific timelines and effort estimates.

---

## 🔥 CRITICAL PRIORITY - Week 1 (2-3 days effort)

### 1. JWT Secret Separation
**Risk Level**: CRITICAL
**Impact**: Token compromise affects both access and refresh tokens
**Effort**: 4 hours

#### Current State:
```typescript
// INSECURE: Single secret for both token types
JWT_SECRET=same-secret-for-access-and-refresh
```

#### Required Changes:
```typescript
// Environment variables
JWT_ACCESS_SECRET=strong-access-secret-here
JWT_REFRESH_SECRET=different-refresh-secret-here

// Code changes in packages/shared/src/auth/jwt.ts
export const getAccessTokenSecret = (): string => {
  const secret = process.env['JWT_ACCESS_SECRET'];
  if (!secret) throw new Error('JWT_ACCESS_SECRET not configured');
  return secret;
};

export const getRefreshTokenSecret = (): string => {
  const secret = process.env['JWT_REFRESH_SECRET'];
  if (!secret) throw new Error('JWT_REFRESH_SECRET not configured');
  return secret;
};
```

#### Files to Update:
- `packages/shared/src/auth/jwt.ts` - Split getSecret() function
- `apps/server/src/middleware/passport.ts` - Use access token secret
- `apps/server/.env` - Add separate secrets
- Update all JWT verification calls

#### Testing:
- Verify access tokens use access secret
- Verify refresh tokens use refresh secret
- Test token validation with both secrets
- Ensure existing tokens become invalid (expected breaking change)

---

### 2. WebSocket Authentication Security
**Risk Level**: CRITICAL
**Impact**: Tokens exposed in server access logs, referrer headers
**Effort**: 6 hours

#### Current State:
```typescript
// INSECURE: Token in URL query params (LOGGED IN ACCESS LOGS)
const { query } = parse(req.url ?? '', true);
actualToken = query['token'] as string;
```

#### Required Changes:
```typescript
// apps/server/src/middleware/websocket-auth.ts
export const authenticateWebSocket = (req: IncomingMessage): Promise<User | null> => {
  // Method 1: Authorization header (preferred)
  const authHeader = req.headers['authorization'];
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    return verifyTokenAndGetUser(token);
  }

  // Method 2: Secure cookie fallback
  const cookies = parseCookies(req.headers.cookie || '');
  if (cookies['sharedb-token']) {
    return verifyTokenAndGetUser(cookies['sharedb-token']);
  }

  throw new Error('No valid authentication provided');
};
```

#### Client-side Changes:
```typescript
// apps/client/src/hooks/useShareDB.ts
const socket = new ReconnectingWebSocket('ws://localhost:3001', [], {
  headers: {
    'Authorization': `Bearer ${getAccessToken()}`
  }
});
```

#### Files to Update:
- `apps/server/src/middleware/websocket-auth.ts` - Remove query param auth
- `apps/client/src/hooks/useShareDB.ts` - Add Authorization header
- `apps/client/src/services/auth.service.ts` - Add token getter helper

#### Testing:
- Verify WebSocket connections work with Authorization header
- Ensure tokens don't appear in server logs
- Test connection rejection with invalid/missing tokens

---

### 3. Enhanced Input Validation
**Risk Level**: HIGH
**Impact**: Malformed user objects can cause runtime errors
**Effort**: 4 hours

#### Current State:
```typescript
// Shallow validation
isObject(response['user'])
```

#### Required Changes:
```typescript
// packages/shared/src/auth/index.ts
export const isValidUser = (obj: unknown): obj is User => {
  if (!isObject(obj)) return false;

  const user = obj as Record<string, unknown>;
  return (
    isString(user['id']) && user['id'].length > 0 &&
    isString(user['email']) && isValidEmail(user['email']) &&
    isString(user['role']) && ['viewer', 'editor', 'owner', 'admin'].includes(user['role'])
  );
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Enhanced document validation
export const isValidDocumentData = (obj: unknown): obj is Document => {
  if (!isObject(obj)) return false;

  const doc = obj as Record<string, unknown>;
  return (
    isString(doc['id']) && doc['id'].length > 0 &&
    isString(doc['title']) && doc['title'].trim().length > 0 &&
    isString(doc['content']) &&
    isValidACL(doc['acl'])
  );
};
```

#### Files to Update:
- `packages/shared/src/auth/index.ts` - Add comprehensive user validation
- `packages/shared/src/schemas/document.ts` - Enhanced document validation
- `apps/server/src/utils/type-guards.ts` - Update validation calls
- All API response handling code

#### Testing:
- Test with malformed user objects
- Verify proper error messages for invalid data
- Test edge cases (empty strings, special characters, etc.)

---

## 🟡 HIGH PRIORITY - Week 2 (3-4 days effort)

### 4. Security Headers & Middleware
**Risk Level**: HIGH
**Impact**: Vulnerable to CSRF, clickjacking, brute force attacks
**Effort**: 6 hours

#### Implementation:
```typescript
// apps/server/src/server.ts
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-eval'"], // For dev only
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws://localhost:3001"], // WebSocket
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per windowMs
  message: 'Too many authentication attempts',
  skipSuccessfulRequests: true,
});

app.use('/api/', generalLimiter);
app.use('/api/auth/', authLimiter);

// Request size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
```

#### Package Dependencies:
```json
{
  "helmet": "^7.1.0",
  "express-rate-limit": "^7.1.5"
}
```

#### Files to Update:
- `apps/server/package.json` - Add security dependencies
- `apps/server/src/server.ts` - Implement security middleware
- `apps/client/vite.config.ts` - Update CSP for development

---

### 5. Authorization Audit Logging
**Risk Level**: HIGH
**Impact**: No visibility into access control failures
**Effort**: 5 hours

#### Implementation:
```typescript
// apps/server/src/utils/audit-logger.ts
import winston from 'winston';

const auditLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/audit.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ],
});

export interface AuditEvent {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  result: 'allowed' | 'denied';
  reason?: string;
  metadata?: Record<string, unknown>;
}

export const logAuditEvent = (event: AuditEvent): void => {
  auditLogger.info('AUDIT_EVENT', event);
};

// apps/server/src/utils/permissions.ts
export const checkDocumentPermission = async (
  userId: string,
  docId: string,
  permission: 'read' | 'write' | 'delete'
): Promise<{ allowed: boolean; reason?: string }> => {
  const doc = await getDocument(docId);

  if (!doc) {
    logAuditEvent({
      userId,
      action: permission,
      resource: 'document',
      resourceId: docId,
      result: 'denied',
      reason: 'Document not found'
    });
    return { allowed: false, reason: 'Document not found' };
  }

  const hasPermission = evaluatePermission(userId, doc, permission);

  logAuditEvent({
    userId,
    action: permission,
    resource: 'document',
    resourceId: docId,
    result: hasPermission ? 'allowed' : 'denied',
    reason: hasPermission ? undefined : 'Insufficient permissions'
  });

  return { allowed: hasPermission };
};
```

#### Files to Update:
- `apps/server/src/utils/audit-logger.ts` - New audit logging system
- `apps/server/src/utils/permissions.ts` - Add logging to all permission checks
- `apps/server/src/middleware/websocket-auth.ts` - Log WebSocket auth events
- `apps/server/package.json` - Add winston dependency

---

### 6. Error Message Sanitization
**Risk Level**: MEDIUM-HIGH
**Impact**: Information disclosure about backend internals
**Effort**: 3 hours

#### Implementation:
```typescript
// packages/shared/src/utils/error-sanitizer.ts
const SAFE_ERROR_MESSAGES = {
  'Invalid credentials': 'Invalid credentials',
  'Account locked': 'Account temporarily locked',
  'Token expired': 'Session expired',
  'Invalid token': 'Authentication failed',
  'Insufficient permissions': 'Access denied',
  'Document not found': 'Document not found',
  'Network error': 'Connection error'
} as const;

type SafeErrorKey = keyof typeof SAFE_ERROR_MESSAGES;

export const sanitizeError = (error: string): string => {
  // Check if it's a known safe error
  if (error in SAFE_ERROR_MESSAGES) {
    return SAFE_ERROR_MESSAGES[error as SafeErrorKey];
  }

  // Default safe message for unknown errors
  return 'An error occurred. Please try again.';
};

export const sanitizeApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return sanitizeError(error.message);
  }

  if (typeof error === 'string') {
    return sanitizeError(error);
  }

  return 'An unexpected error occurred.';
};
```

#### Files to Update:
- `packages/shared/src/utils/error-sanitizer.ts` - New error sanitization
- `apps/client/src/services/auth.service.ts` - Apply error sanitization
- `apps/server/src/routes/auth.routes.ts` - Sanitize server errors
- All error handling throughout the application

---

## 🟢 MEDIUM PRIORITY - Week 3 (2-3 days effort)

### 7. Token Storage Security Enhancement
**Risk Level**: MEDIUM
**Impact**: XSS attacks can steal tokens from sessionStorage
**Effort**: 6 hours

#### Current Analysis:
```typescript
// CURRENT: Plain text tokens in sessionStorage
sessionStorage.setItem('accessToken', authResponse.accessToken);
// Risk: XSS attacks can access sessionStorage
```

#### Option 1: HTTP-Only Cookies for Refresh Tokens
```typescript
// Server-side: Set HTTP-only refresh token cookie
app.post('/api/auth/login', async (req, res) => {
  const { accessToken, refreshToken } = await authenticateUser(credentials);

  // HTTP-only cookie for refresh token
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  // Return only access token to client
  res.json({ accessToken, user });
});

// Client-side: Memory-only access token storage
class TokenManager {
  private accessToken: string | null = null;

  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  clearTokens(): void {
    this.accessToken = null;
    // Refresh token cleared via server endpoint
  }
}
```

#### Option 2: Client-Side Encryption
```typescript
// apps/client/src/utils/secure-storage.ts
import CryptoJS from 'crypto-js';

class SecureStorage {
  private static getKey(): string {
    // Derive key from session-specific data
    const sessionData = `${navigator.userAgent}-${window.location.origin}`;
    return CryptoJS.SHA256(sessionData).toString();
  }

  static setItem(key: string, value: string): void {
    const encryptionKey = this.getKey();
    const encrypted = CryptoJS.AES.encrypt(value, encryptionKey).toString();
    sessionStorage.setItem(key, encrypted);
  }

  static getItem(key: string): string | null {
    const encrypted = sessionStorage.getItem(key);
    if (!encrypted) return null;

    try {
      const encryptionKey = this.getKey();
      const decrypted = CryptoJS.AES.decrypt(encrypted, encryptionKey);
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch {
      return null;
    }
  }
}
```

#### Recommendation: Implement Option 1 (HTTP-Only Cookies)
- More secure against XSS
- Standard practice for refresh tokens
- Simpler implementation

---

### 8. Environment Variable Validation
**Risk Level**: MEDIUM
**Impact**: Silent failures with missing configuration
**Effort**: 2 hours

#### Implementation:
```typescript
// apps/server/src/config/env-validator.ts
interface RequiredEnvVars {
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  MONGO_URL: string;
  NODE_ENV: 'development' | 'production' | 'test';
  PORT?: string;
}

export const validateEnvironment = (): RequiredEnvVars => {
  const requiredVars = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'MONGO_URL'];
  const missing = requiredVars.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(var_ => console.error(`  - ${var_}`));
    process.exit(1);
  }

  // Validate JWT secrets are different
  if (process.env.JWT_ACCESS_SECRET === process.env.JWT_REFRESH_SECRET) {
    console.error('❌ JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different');
    process.exit(1);
  }

  // Validate secret strength
  const minSecretLength = 32;
  if (process.env.JWT_ACCESS_SECRET!.length < minSecretLength) {
    console.error(`❌ JWT_ACCESS_SECRET must be at least ${minSecretLength} characters`);
    process.exit(1);
  }

  console.log('✅ Environment validation passed');

  return {
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET!,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
    MONGO_URL: process.env.MONGO_URL!,
    NODE_ENV: (process.env.NODE_ENV as any) || 'development',
    PORT: process.env.PORT,
  };
};

// apps/server/src/server.ts
import { validateEnvironment } from './config/env-validator';

// Validate environment at startup
const config = validateEnvironment();
```

---

## 📋 ADDITIONAL RECOMMENDATIONS

### 9. Frontend Security Enhancements
**Priority**: Medium
**Effort**: 4 hours

#### Component Security:
```typescript
// apps/client/src/components/ErrorBoundary.tsx
import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service (sanitized)
    console.error('Error boundary caught:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div>
          <h2>Something went wrong</h2>
          <p>Please refresh the page and try again.</p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

#### Input Sanitization:
```typescript
// apps/client/src/utils/input-sanitizer.ts
import DOMPurify from 'dompurify';

export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: []
  });
};

export const sanitizeFileName = (filename: string): string => {
  // Remove potentially dangerous characters
  return filename.replace(/[^a-zA-Z0-9.-]/g, '_').substring(0, 255);
};
```

### 10. Document Permissions Frontend
**Priority**: High
**Effort**: 5 hours

#### Permission Checking:
```typescript
// apps/client/src/hooks/useDocumentPermissions.ts
import { useAuth } from '../contexts/AuthContext';

export const useDocumentPermissions = (docId: string) => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<{
    canRead: boolean;
    canWrite: boolean;
    canDelete: boolean;
  }>({ canRead: false, canWrite: false, canDelete: false });

  useEffect(() => {
    const checkPermissions = async () => {
      if (!user) return;

      try {
        const response = await authFetch(`/api/documents/${docId}/permissions`);
        const perms = await response.json();
        setPermissions(perms);
      } catch (error) {
        console.error('Failed to check permissions:', error);
      }
    };

    checkPermissions();
  }, [docId, user]);

  return permissions;
};
```

---

## 📊 IMPLEMENTATION TIMELINE

| Week | Priority | Focus Areas | Effort | Success Criteria |
|------|----------|-------------|---------|------------------|
| **Week 1** | 🔥 Critical | JWT secrets, WebSocket auth, input validation | 14 hours | All critical security gaps closed |
| **Week 2** | 🟡 High | Security headers, audit logging, error sanitization | 14 hours | Comprehensive security middleware in place |
| **Week 3** | 🟢 Medium | Token storage, environment validation, frontend security | 12 hours | Production-ready security posture |

### Total Effort: ~40 hours (1 sprint)

---

## 🧪 TESTING STRATEGY

### Security Testing Checklist:
- [ ] **JWT Token Security**: Verify separate secrets, proper validation
- [ ] **WebSocket Authentication**: Test with various auth scenarios
- [ ] **Input Validation**: Fuzz testing with malformed inputs
- [ ] **Rate Limiting**: Verify protection against brute force
- [ ] **Error Handling**: Ensure no sensitive data leakage
- [ ] **Audit Logging**: Verify comprehensive event tracking
- [ ] **Environment Validation**: Test startup with missing/invalid config

### Automated Security Tests:
```typescript
// apps/server/src/__tests__/security.test.ts
describe('Security Tests', () => {
  test('should reject malformed JWT tokens', async () => {
    const malformedToken = 'invalid.token.here';
    const response = await request(app)
      .get('/api/protected')
      .set('Authorization', `Bearer ${malformedToken}`)
      .expect(401);
  });

  test('should enforce rate limiting', async () => {
    // Make multiple rapid requests
    const promises = Array(10).fill(0).map(() =>
      request(app).post('/api/auth/login').send({})
    );

    const responses = await Promise.all(promises);
    const rateLimited = responses.filter(r => r.status === 429);
    expect(rateLimited.length).toBeGreaterThan(0);
  });
});
```

---

## 🎯 SUCCESS METRICS

### Security Posture Goals:
1. **Zero Critical Vulnerabilities**: All OWASP Top 10 risks addressed
2. **Comprehensive Audit Trail**: 100% of authorization events logged
3. **Input Validation Coverage**: All external data sources validated
4. **Token Security**: No tokens in logs or URLs
5. **Error Security**: No sensitive information disclosure

### Performance Targets:
- **Authentication latency**: < 200ms
- **WebSocket connection time**: < 500ms
- **Document load time**: < 1s
- **Audit log overhead**: < 5% performance impact

---

## 🚀 DEPLOYMENT CONSIDERATIONS

### Environment Setup:
```bash
# Production environment variables
JWT_ACCESS_SECRET="$(openssl rand -base64 32)"
JWT_REFRESH_SECRET="$(openssl rand -base64 32)"
MONGO_URL="mongodb://prod-cluster/collab-edit"
NODE_ENV="production"
LOG_LEVEL="info"
RATE_LIMIT_WINDOW_MS="900000"  # 15 minutes
RATE_LIMIT_MAX="100"
AUTH_RATE_LIMIT_MAX="5"
```

### Monitoring Setup:
- **Security Events**: Real-time alerts for failed auth attempts
- **Performance Metrics**: Monitor auth latency and WebSocket connections
- **Error Tracking**: Sanitized error logging with correlation IDs
- **Audit Compliance**: Structured logs for security audit requirements

---

## 📞 SUPPORT & MAINTENANCE

### Documentation Updates Needed:
- [ ] Update README with security configuration
- [ ] Document environment variable requirements
- [ ] Create security incident response playbook
- [ ] Add monitoring and alerting guide

### Regular Security Reviews:
- **Weekly**: Review audit logs for anomalies
- **Monthly**: Security dependency updates
- **Quarterly**: Penetration testing and vulnerability assessment
- **Annually**: Full security architecture review

---

**Next Steps**: Begin with Critical Priority items (Week 1) and establish a security-first development workflow going forward.
