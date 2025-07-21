# Phase 2.5: Security & Authentication

**Status**: ✅ Complete
**Completion Date**: 2025-01-20
**Objective**: Implement comprehensive JWT authentication and role-based access control

## 🎯 **Overview**

This phase implemented comprehensive JWT authentication and role-based access control throughout the application. The security implementation includes both backend authentication infrastructure and frontend auth state management, providing a complete foundation for secure collaborative editing.

## 📋 **Key Deliverables**

### ✅ **Authentication Infrastructure**

- **JWT Token System**: Access tokens (15-min expiry) + refresh tokens (7-day expiry)
- **User Management**: Schema with email/password/role + bcrypt hashing (10 rounds)
- **Role-Based System**: viewer, editor, owner, admin with hierarchical permissions

### ✅ **Backend Security**

- **Express Auth Routes**: Signup, login, and refresh token endpoints
- **Passport-JWT Integration**: Middleware for protecting REST endpoints
- **WebSocket Authentication**: Custom middleware for ShareDB connections
- **Document ACL System**: Owner, editors[], viewers[] with permission utilities

### ✅ **Frontend Security**

- **XState v5 Auth Machine**: States for auth lifecycle management
- **Auth Context**: React hooks for session management
- **Login/Signup Forms**: Complete authentication UI components
- **Token Management**: Automatic refresh with session storage

### ✅ **Testing & CI**

- JWT token generation/verification tests
- Password hashing and validation tests
- Auth middleware integration tests
- GitHub Actions CI workflow

## 🔐 **Security Architecture**

### **JWT Token Structure**

```typescript
// Access Token (15 minutes)
interface AccessTokenPayload {
  sub: string;        // user ID
  email: string;      // user email
  role: UserRole;     // user role
  type: 'access';     // token type
  iat: number;        // issued at
  exp: number;        // expires at
  iss: string;        // issuer
  aud: string;        // audience
}

// Refresh Token (7 days)
interface RefreshTokenPayload {
  sub: string;        // user ID
  type: 'refresh';    // token type
  iat: number;        // issued at
  exp: number;        // expires at
  iss: string;        // issuer
  aud: string;        // audience
}
```

### **User Schema with RBAC**

```typescript
export const UserSchema = Type.Object({
  id: Type.String(),
  email: Type.String({ format: 'email' }),
  password: Type.String({ minLength: 8 }), // bcrypt hashed
  role: Type.Union([
    Type.Literal('viewer'),
    Type.Literal('editor'),
    Type.Literal('owner'),
    Type.Literal('admin')
  ]),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' })
});
```

### **Document ACL System**

```typescript
export const DocumentACLSchema = Type.Object({
  owner: Type.String(),                    // User ID of document owner
  editors: Type.Array(Type.String()),     // User IDs with edit access
  viewers: Type.Array(Type.String())      // User IDs with read access
});

// Permission checking utilities
export function hasDocumentPermission(
  userId: string,
  document: Document,
  permission: 'read' | 'write' | 'admin'
): boolean {
  const { acl } = document;

  if (acl.owner === userId) return true;

  if (permission === 'admin') return false;

  if (permission === 'write') {
    return acl.editors.includes(userId);
  }

  if (permission === 'read') {
    return acl.editors.includes(userId) || acl.viewers.includes(userId);
  }

  return false;
}
```

## 🔧 **Backend Implementation**

### **Express Auth Routes**

```typescript
// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const validation = validateCreateUserRequest(req.body);
  if (!validation.success) {
    return res.status(400).json({
      error: 'Validation failed',
      details: validation.errors
    });
  }

  try {
    const user = await AuthService.createUser(validation.data);
    const tokens = await AuthService.generateTokens(user);

    res.status(201).json({
      user: { id: user.id, email: user.email, role: user.role },
      ...tokens
    });
  } catch (error) {
    authLogger.error('Signup failed', {
      email: req.body?.email,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    const errorMessage = sanitizeApiError(error);
    res.status(500).json({ error: errorMessage });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  // Similar implementation with credential validation
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  // Refresh token validation and new token generation
});
```

### **Passport JWT Strategy**

```typescript
const jwtStrategy = new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: getSecret(),
  issuer: JWT_ISSUER,
  audience: JWT_AUDIENCE
}, async (payload: JwtPayload, done) => {
  try {
    if (payload.type !== 'access') {
      return done(null, false, { message: 'Invalid token type' });
    }

    const user = await AuthService.findUserById(payload.sub);
    if (!user) {
      return done(null, false, { message: 'User not found' });
    }

    return done(null, user);
  } catch (error) {
    return done(error, false);
  }
});
```

### **WebSocket Authentication**

```typescript
export const authenticateWebSocket = (
  request: http.IncomingMessage,
  socket: any,
  head: Buffer,
  callback: (err: Error | null, success?: boolean) => void
) => {
  try {
    const { query } = parse(request.url ?? '', true);
    const token = query['token'] as string;

    if (!token) {
      return callback(new Error('Authentication token required'));
    }

    const payload = jwt.verify(token, getSecret(), {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE
    }) as JwtPayload;

    if (payload.type !== 'access') {
      return callback(new Error('Invalid token type for WebSocket'));
    }

    // Attach user context to request
    (request as any).user = { id: payload.sub, email: payload.email, role: payload.role };
    callback(null, true);

  } catch (error) {
    callback(new Error('Invalid or expired token'));
  }
};
```

## 🎨 **Frontend Implementation**

### **XState Auth Machine**

```typescript
import { createMachine, assign } from 'xstate';

interface AuthContext {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  error: string | null;
}

type AuthEvent =
  | { type: 'LOGIN'; email: string; password: string }
  | { type: 'SIGNUP'; email: string; password: string }
  | { type: 'LOGOUT' }
  | { type: 'REFRESH_TOKEN' };

export const authMachine = createMachine<AuthContext, AuthEvent>({
  id: 'auth',
  initial: 'checkingAuth',
  context: {
    user: null,
    accessToken: null,
    refreshToken: null,
    error: null
  },
  states: {
    checkingAuth: {
      invoke: {
        src: 'checkStoredAuth',
        onDone: [
          { target: 'authenticated', cond: 'hasValidAuth' },
          { target: 'unauthenticated' }
        ],
        onError: { target: 'unauthenticated' }
      }
    },
    unauthenticated: {
      on: {
        LOGIN: { target: 'loggingIn' },
        SIGNUP: { target: 'signingUp' }
      }
    },
    loggingIn: {
      invoke: {
        src: 'loginUser',
        onDone: {
          target: 'authenticated',
          actions: 'setAuthData'
        },
        onError: {
          target: 'unauthenticated',
          actions: 'setError'
        }
      }
    },
    authenticated: {
      on: {
        LOGOUT: {
          target: 'unauthenticated',
          actions: 'clearAuth'
        },
        REFRESH_TOKEN: { target: 'refreshingToken' }
      }
    },
    refreshingToken: {
      invoke: {
        src: 'refreshAuthToken',
        onDone: {
          target: 'authenticated',
          actions: 'updateTokens'
        },
        onError: {
          target: 'unauthenticated',
          actions: 'clearAuth'
        }
      }
    }
  }
});
```

### **Auth Context & Hooks**

```typescript
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, send] = useMachine(authMachine, {
    services: {
      checkStoredAuth: async () => {
        const tokens = getStoredTokens();
        if (tokens.accessToken && isTokenValid(tokens.accessToken)) {
          return tokens;
        }
        throw new Error('No valid stored auth');
      },
      loginUser: async (context, event) => {
        if (event.type !== 'LOGIN') throw new Error('Invalid event');
        return await authService.login(event.email, event.password);
      }
    },
    actions: {
      setAuthData: assign((context, event) => {
        if (event.type !== 'xstate.done.invoke.loginUser') return {};
        const { user, accessToken, refreshToken } = event.data;
        storeTokens({ accessToken, refreshToken });
        return { user, accessToken, refreshToken, error: null };
      })
    }
  });

  return (
    <AuthContext.Provider value={{ state, send }}>
      {children}
    </AuthContext.Provider>
  );
};
```

## ✅ **Testing & Validation**

### **Backend Tests**

```typescript
describe('Auth Routes', () => {
  test('POST /api/auth/signup creates user and returns tokens', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'SecurePassword123'
    };

    const response = await request(app)
      .post('/api/auth/signup')
      .send(userData)
      .expect(201);

    expect(response.body).toHaveProperty('user');
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
    expect(response.body.user.email).toBe(userData.email);
  });

  test('JWT tokens are valid and contain correct payload', async () => {
    const user = await createTestUser();
    const tokens = await AuthService.generateTokens(user);

    const accessPayload = jwt.verify(tokens.accessToken, getSecret()) as JwtPayload;
    expect(accessPayload.sub).toBe(user.id);
    expect(accessPayload.type).toBe('access');
    expect(accessPayload.exp).toBeGreaterThan(Date.now() / 1000);
  });
});
```

### **Frontend Tests**

```typescript
describe('Auth Machine', () => {
  test('transitions from unauthenticated to authenticated on successful login', async () => {
    const authService = interpret(authMachine);
    authService.start();

    authService.send({ type: 'LOGIN', email: 'test@example.com', password: 'password' });

    // Wait for login to complete
    await waitFor(() => {
      expect(authService.state.matches('authenticated')).toBe(true);
    });

    expect(authService.state.context.user).toBeDefined();
    expect(authService.state.context.accessToken).toBeDefined();
  });
});
```

## 📈 **Security Benefits**

### **Authentication Security**

- **Short-Lived Access Tokens**: 15-minute expiry limits exposure
- **Secure Refresh Flow**: 7-day refresh tokens for convenience
- **Proper JWT Validation**: Issuer, audience, and expiry checks
- **Password Security**: bcrypt with 10 rounds for strong hashing

### **Authorization Security**

- **Role-Based Access**: Hierarchical permission system
- **Document-Level ACL**: Fine-grained access control per document
- **WebSocket Security**: Authenticated real-time connections
- **Middleware Protection**: All API endpoints require valid tokens

### **Frontend Security**

- **Secure Token Storage**: Session storage (clears on browser close)
- **Automatic Refresh**: Seamless token renewal before expiry
- **State Management**: XState ensures predictable auth flows
- **Error Handling**: Graceful degradation on auth failures

## 🔄 **Next Phase Dependencies**

This phase enables:

- **Phase 3**: Backend API endpoints can use auth middleware
- **Phase 4**: Frontend can implement protected routes and auth UI
- **Phase 5**: Security testing and audit capabilities
- **Future Phases**: Advanced security features and social auth

## 📚 **References**

- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Passport.js Documentation](http://www.passportjs.org/)
- [XState Documentation](https://xstate.js.org/)
- [bcrypt Security Considerations](https://github.com/kelektiv/node.bcrypt.js)

---

**✅ Phase 2.5 Complete** - Comprehensive authentication and authorization system implemented
