# Phase 2.6: Runtime Type Safety

**Status**: ✅ Complete
**Completion Date**: 2025-01-21
**Objective**: Implement comprehensive external data validation following TypeScript best practices

## 🎯 **Overview**

This phase implemented comprehensive external data validation following TypeScript runtime safety best practices. The implementation provides bulletproof validation for all external data sources including JWT payloads, API responses, ShareDB contexts, and database results.

## 📋 **Key Deliverables**

### ✅ **Runtime Type Guards Implementation**

- **JWT Payload Validation**: `isJwtPayload()` guard for token decoding security
- **API Response Validation**: `isApiError()` and `isAuthResponse()` guards
- **ShareDB Context Validation**: `isShareDBContext()` for middleware safety
- **Document Data Validation**: `isDocumentData()` for database result safety

### ✅ **Enhanced Type Checking**

- Lodash helpers + bracket notation compliance
- Improved error messages with descriptive validation failures
- Type-safe property access patterns throughout
- **Production Robustness**: Graceful handling of corrupted data and API changes

## 🛡️ **Type Guard Architecture**

### **JWT Payload Validation**

```typescript
import isNil from 'lodash/isNil';
import isString from 'lodash/isString';

export function isJwtPayload(data: unknown): data is JwtPayload {
  if (!isObject(data)) {
    return false;
  }

  const payload = data as Record<string, unknown>;

  // Validate required fields
  return (
    isString(payload['sub']) &&
    isString(payload['email']) &&
    isString(payload['role']) &&
    typeof payload['exp'] === 'number' &&
    typeof payload['iat'] === 'number' &&
    !isNil(payload['sub']) &&
    !isNil(payload['email']) &&
    !isNil(payload['role'])
  );
}

// Usage in AuthContext
const parseTokenPayload = (token: string): JwtPayload | null => {
  try {
    const decoded = jwt.decode(token);
    if (!isJwtPayload(decoded)) {
      logger.error('Invalid JWT payload structure', { payload: decoded });
      return null;
    }
    return decoded;
  } catch (error) {
    logger.error('JWT decode failed', { error });
    return null;
  }
};
```

### **API Response Validation**

```typescript
export function isApiError(data: unknown): data is ApiError {
  if (!isObject(data)) return false;

  const error = data as Record<string, unknown>;
  return isString(error['error']) && !isNil(error['error']);
}

export function isAuthResponse(data: unknown): data is AuthResponse {
  if (!isObject(data)) return false;

  const response = data as Record<string, unknown>;

  return (
    isObject(response['user']) &&
    isString(response['accessToken']) &&
    isString(response['refreshToken']) &&
    !isNil(response['user']) &&
    !isNil(response['accessToken']) &&
    !isNil(response['refreshToken'])
  );
}

// Usage in auth service
export async function login(email: string, password: string): Promise<AuthResponse> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      if (isApiError(data)) {
        throw new Error(data.error);
      }
      throw new Error('Login failed with unknown error');
    }

    if (!isAuthResponse(data)) {
      throw new Error('Invalid auth response structure');
    }

    return data; // TypeScript knows this is AuthResponse
  } catch (error) {
    throw new Error(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
```

### **ShareDB Context Validation**

```typescript
export function isShareDBContext(data: unknown): data is ShareDBContext {
  if (!isObject(data)) return false;

  const context = data as Record<string, unknown>;
  return isObject(context['custom']) && !isNil(context['custom']);
}

export function isAuthenticatedRequest(req: unknown): req is AuthenticatedRequest {
  if (!isObject(req)) return false;

  const request = req as Record<string, unknown>;
  return (
    isObject(request['user']) &&
    isString((request['user'] as any)['id']) &&
    !isNil(request['user'])
  );
}

// Usage in ShareDB middleware
export function shareDBAuthMiddleware(request: any, done: (err?: Error) => void) {
  if (!isAuthenticatedRequest(request)) {
    return done(new Error('Request missing authenticated user context'));
  }

  const userId = request.user.id;
  // Safe to use userId - TypeScript knows it exists and is a string

  done();
}
```

### **Document Data Validation**

```typescript
export function isDocumentData(data: unknown): data is DocumentData {
  if (!isObject(data)) return false;

  const doc = data as Record<string, unknown>;

  // Check for ShareDB create.data structure
  if (isObject(doc['create']) && isObject((doc['create'] as any)['data'])) {
    const createData = (doc['create'] as any)['data'];
    return (
      isString(createData['id']) &&
      isString(createData['title']) &&
      isString(createData['content']) &&
      isObject(createData['acl'])
    );
  }

  // Check for direct data structure
  return (
    isString(doc['id']) &&
    isString(doc['title']) &&
    isString(doc['content']) &&
    isObject(doc['acl'])
  );
}

export function getValidatedDocumentData(rawDoc: unknown): DocumentData | null {
  if (!isDocumentData(rawDoc)) {
    logger.warn('Invalid document data structure', { document: rawDoc });
    return null;
  }

  // Extract data based on ShareDB structure
  const doc = rawDoc as any;
  if (doc.create?.data) {
    return {
      id: doc.create.data.id,
      title: doc.create.data.title,
      content: doc.create.data.content,
      acl: doc.create.data.acl
    };
  }

  return {
    id: doc.id,
    title: doc.title,
    content: doc.content,
    acl: doc.acl
  };
}

// Usage in document routes
app.get('/api/documents', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    const rawDocs = await mongoCollection.find({
      $or: [
        { 'create.data.acl.owner': userId },
        { 'create.data.acl.editors': userId },
        { 'create.data.acl.viewers': userId }
      ]
    }).toArray();

    const validatedDocs = rawDocs
      .map(getValidatedDocumentData)
      .filter((doc): doc is DocumentData => doc !== null);

    res.json({ documents: validatedDocs });
  } catch (error) {
    logger.error('Failed to fetch documents', { error, userId: req.user?.id });
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});
```

## 🔧 **Implementation Patterns**

### **Bracket Notation for Environment Variables**

```typescript
// ✅ Correct - TypeScript index signature compliance
const jwtSecret = process.env['JWT_SECRET'];
const mongoUrl = process.env['MONGO_URL'];
const nodeEnv = process.env['NODE_ENV'];

// ❌ Incorrect - Can cause TypeScript errors
const jwtSecret = process.env.JWT_SECRET;
```

### **Lodash Type Helpers**

```typescript
import isNil from 'lodash/isNil';
import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import isFunction from 'lodash/isFunction';

// Replace manual null checks
if (!isNil(value) && isString(value)) {
  // TypeScript knows value is string
  console.log(value.toUpperCase());
}

// Replace typeof checks
if (isObject(response) && !isNil(response)) {
  // TypeScript knows response is object
  const keys = Object.keys(response);
}
```

### **Error Handling with Type Guards**

```typescript
export function handleApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (isObject(error) && isString((error as any)['message'])) {
    return (error as any)['message'];
  }

  return 'An unknown error occurred';
}

// Usage
try {
  await riskyOperation();
} catch (error) {
  const message = handleApiError(error);
  logger.error('Operation failed', { message });
}
```

## ✅ **Testing & Validation**

### **Type Guard Tests**

```typescript
describe('Runtime Type Guards', () => {
  describe('isJwtPayload', () => {
    test('validates correct JWT payload', () => {
      const validPayload = {
        sub: 'user123',
        email: 'test@example.com',
        role: 'editor',
        exp: Date.now() / 1000 + 3600,
        iat: Date.now() / 1000
      };

      expect(isJwtPayload(validPayload)).toBe(true);
    });

    test('rejects invalid JWT payload', () => {
      const invalidPayloads = [
        null,
        undefined,
        'string',
        { sub: null }, // missing required fields
        { sub: 'user', email: null }, // null values
        { sub: 123, email: 'test@example.com' } // wrong types
      ];

      invalidPayloads.forEach(payload => {
        expect(isJwtPayload(payload)).toBe(false);
      });
    });
  });

  describe('isAuthResponse', () => {
    test('validates complete auth response', () => {
      const validResponse = {
        user: { id: 'user123', email: 'test@example.com' },
        accessToken: 'jwt.access.token',
        refreshToken: 'jwt.refresh.token'
      };

      expect(isAuthResponse(validResponse)).toBe(true);
    });

    test('rejects incomplete auth response', () => {
      const incompleteResponse = {
        user: { id: 'user123' },
        accessToken: 'jwt.access.token'
        // missing refreshToken
      };

      expect(isAuthResponse(incompleteResponse)).toBe(false);
    });
  });
});
```

### **Integration Testing**

```typescript
describe('Type-Safe API Integration', () => {
  test('login handles malformed API response gracefully', async () => {
    // Mock server returning malformed response
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ invalid: 'response' })
    });

    await expect(authService.login('test@example.com', 'password'))
      .rejects.toThrow('Invalid auth response structure');
  });

  test('document fetching handles corrupted database data', async () => {
    const corruptedDocs = [
      { create: { data: { id: 'doc1', title: 'Valid' } } }, // missing content
      { invalidStructure: true }, // completely wrong
      null, // null value
      { create: { data: { id: 'doc2', title: 'Valid', content: 'Content', acl: {} } } } // valid
    ];

    const validatedDocs = corruptedDocs
      .map(getValidatedDocumentData)
      .filter((doc): doc is DocumentData => doc !== null);

    expect(validatedDocs).toHaveLength(1);
    expect(validatedDocs[0].id).toBe('doc2');
  });
});
```

## 📈 **Security Benefits**

### **Bulletproof External Data Handling**

- **JSON.parse Safety**: All parsed JSON validated before use
- **API Response Safety**: Malformed responses handled gracefully
- **Database Result Safety**: Corrupted data doesn't crash application
- **WebSocket Message Safety**: Invalid messages filtered out

### **Fail-Fast Error Detection**

- **Invalid Data Caught Immediately**: No silent failures or undefined behavior
- **Clear Error Messages**: Descriptive validation failures for debugging
- **Logging Integration**: All validation failures logged for monitoring
- **Type-Safe Operations**: TypeScript knows exact shape after validation

### **Production Robustness**

- **Graceful Degradation**: Application continues despite data corruption
- **Real-World Data Handling**: Prepared for API changes and database migrations
- **Security Hardening**: Prevents injection and manipulation attacks
- **Monitoring Ready**: Validation failures tracked for operational insights

## 🔄 **Next Phase Dependencies**

This phase provides the foundation for:

- **Phase 3**: Backend API can safely handle external data
- **Phase 4**: Frontend can trust API responses and user input
- **Phase 5**: Testing can validate type safety throughout
- **Future Phases**: Enhanced security features build on this foundation

## 📚 **References**

- [TypeScript Handbook - Type Guards](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [Lodash Documentation](https://lodash.com/docs/)
- [JSON Schema Validation Best Practices](https://json-schema.org/understanding-json-schema/)

---

**✅ Phase 2.6 Complete** - Comprehensive runtime type safety ensures production reliability
