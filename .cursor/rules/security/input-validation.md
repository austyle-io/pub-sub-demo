# Input Validation & Sanitization

## 1. Always Validate External Input

**Rule**: Never trust external input. Always validate and sanitize.

```ts
// ❌ Bad - direct use of user input
function updateDocument(content: string) {
  document.innerHTML = content; // XSS vulnerability
}

// ✅ Good - validated and sanitized input
function updateDocument(content: unknown) {
  if (!isString(content)) {
    throw new ValidationError('Content must be a string');
  }

  const sanitizedContent = sanitizeHtml(content);
  document.innerHTML = sanitizedContent;
}
```

## 2. ShareDB Operation Validation

**Rule**: Validate all ShareDB operations before applying.

```ts
// ❌ Bad - trusting ShareDB operations
function applyOperation(op: any) {
  return doc.submitOp(op); // Dangerous
}

// ✅ Good - validated ShareDB operations
function applyOperation(op: unknown) {
  if (!isValidShareDBOperation(op)) {
    throw new ValidationError('Invalid ShareDB operation');
  }

  // Additional business logic validation
  if (!canUserPerformOperation(currentUser, op)) {
    throw new UnauthorizedError('User cannot perform this operation');
  }

  return doc.submitOp(op);
}

// Type guard for ShareDB operations
function isValidShareDBOperation(op: unknown): op is ShareDBOperation {
  return (
    isObject(op) &&
    'ops' in op &&
    Array.isArray(op.ops) &&
    op.ops.every(isValidOp)
  );
}
```

## 3. WebSocket Message Validation

**Rule**: Validate all WebSocket messages before processing.

```ts
// ❌ Bad - processing raw WebSocket data
ws.on('message', (data) => {
  const message = JSON.parse(data.toString());
  handleMessage(message); // Dangerous
});

// ✅ Good - validated WebSocket messages
ws.on('message', (data) => {
  try {
    const parsed = JSON.parse(data.toString());

    if (!isWebSocketMessage(parsed)) {
      logger.warn('Invalid WebSocket message received', { data: parsed });
      return;
    }

    handleMessage(parsed);
  } catch (error) {
    logger.error('Failed to parse WebSocket message', { error, data });
  }
});

// Type guard for WebSocket messages
function isWebSocketMessage(data: unknown): data is WebSocketMessage {
  return (
    isObject(data) &&
    'type' in data &&
    typeof data.type === 'string' &&
    'payload' in data
  );
}
```

## 4. API Request Validation

**Rule**: Use validation schemas for all API endpoints.

```ts
import { z } from 'zod';

// ✅ Good - Zod schema validation
const CreateDocumentSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().max(1000000), // 1MB limit
  isPublic: z.boolean().optional().default(false),
});

type CreateDocumentRequest = z.infer<typeof CreateDocumentSchema>;

// Express route with validation
app.post('/api/documents', async (req, res) => {
  try {
    const validatedData = CreateDocumentSchema.parse(req.body);
    const document = await createDocument(validatedData);
    res.json(document);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
    }
    throw error;
  }
});
```

## 5. SQL Injection Prevention

**Rule**: Use parameterized queries and avoid string concatenation.

```ts
// ❌ Bad - SQL injection vulnerability
function getUser(userId: string) {
  const query = `SELECT * FROM users WHERE id = '${userId}'`;
  return db.query(query); // Dangerous
}

// ✅ Good - parameterized query
function getUser(userId: string) {
  if (!isValidUUID(userId)) {
    throw new ValidationError('Invalid user ID format');
  }

  const query = 'SELECT * FROM users WHERE id = $1';
  return db.query(query, [userId]);
}
```

## 6. File Upload Validation

**Rule**: Validate file types, sizes, and contents.

```ts
// ✅ Good - comprehensive file validation
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'text/plain'] as const;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function validateUploadedFile(file: Express.Multer.File): void {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    throw new ValidationError('File too large');
  }

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype as any)) {
    throw new ValidationError('Invalid file type');
  }

  // Validate file extension
  const extension = path.extname(file.originalname).toLowerCase();
  const validExtensions = ['.jpg', '.jpeg', '.png', '.txt'];
  if (!validExtensions.includes(extension)) {
    throw new ValidationError('Invalid file extension');
  }

  // Additional content validation for images
  if (file.mimetype.startsWith('image/')) {
    validateImageContent(file.buffer);
  }
}
```

## 7. HTML Sanitization

**Rule**: Sanitize HTML content to prevent XSS attacks.

```ts
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// ✅ Good - HTML sanitization
function sanitizeHtml(html: string): string {
  const window = new JSDOM('').window;
  const purify = DOMPurify(window);

  return purify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['class'],
    FORBID_SCRIPT: true,
  });
}

// Document editor context
function updateDocumentContent(content: unknown) {
  if (!isString(content)) {
    throw new ValidationError('Content must be a string');
  }

  const sanitizedContent = sanitizeHtml(content);
  return sanitizedContent;
}
```

## 8. Rate Limiting Validation

**Rule**: Implement rate limiting for sensitive operations.

```ts
import rateLimit from 'express-rate-limit';

// ✅ Good - rate limiting for document operations
const documentOperationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 operations per window
  message: 'Too many document operations, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/documents', documentOperationLimiter);
```

## 9. JWT Token Validation

**Rule**: Always validate JWT tokens thoroughly.

```ts
import jwt from 'jsonwebtoken';

// ✅ Good - comprehensive JWT validation
function validateJWT(token: string): DecodedToken {
  if (!token) {
    throw new UnauthorizedError('No token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;

    // Additional validation
    if (!decoded.userId || !decoded.exp) {
      throw new UnauthorizedError('Invalid token structure');
    }

    // Check if token is expired (additional check)
    if (Date.now() >= decoded.exp * 1000) {
      throw new UnauthorizedError('Token expired');
    }

    return decoded;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Invalid token');
    }
    throw error;
  }
}
```

## 10. Environment Variable Validation

**Rule**: Validate environment variables at startup.

```ts
import { z } from 'zod';

// ✅ Good - environment validation schema
const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.coerce.number().int().min(1).max(65535),
  JWT_SECRET: z.string().min(32),
  DATABASE_URL: z.string().url().optional(),
  CORS_ORIGIN: z.string().url(),
});

// Validate at startup
const env = EnvSchema.parse(process.env);

export { env };
```

## Enforcement Checklist

- [ ] All external input validated with type guards
- [ ] ShareDB operations validated before application
- [ ] WebSocket messages validated before processing
- [ ] API requests use Zod schemas
- [ ] Database queries use parameterization
- [ ] File uploads validate type, size, and content
- [ ] HTML content sanitized for XSS prevention
- [ ] Rate limiting implemented for sensitive operations
- [ ] JWT tokens validated thoroughly
- [ ] Environment variables validated at startup
