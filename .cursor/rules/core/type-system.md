# Type System Preferences

## 1. Prefer `type` Over `interface`

**Rule**: Always use `type` declarations instead of `interface` declarations.

```ts
// ❌ Bad - interface declaration
interface User {
  id: string;
  name: string;
  email: string;
}

interface DocumentMetadata {
  title: string;
  createdAt: Date;
  lastModified: Date;
}

// ✅ Good - type declaration
type User = {
  id: string;
  name: string;
  email: string;
};

type DocumentMetadata = {
  title: string;
  createdAt: Date;
  lastModified: Date;
};
```

**Rationale**: `type` declarations are more flexible, support union types, and provide consistent syntax across the codebase.

## 2. Use `unknown` Instead of `any`

**Rule**: Never use `any`. Use `unknown` and narrow with type guards.

```ts
// ❌ Bad - any disables type checking
function processWebSocketMessage(data: any) {
  return data.type; // No type safety
}

// ✅ Good - unknown requires type narrowing
function processWebSocketMessage(data: unknown) {
  if (!isWebSocketMessage(data)) {
    throw new Error('Invalid WebSocket message');
  }
  return data.type; // Type-safe after guard
}
```

### ShareDB Context

```ts
// ❌ Bad - bypassing type safety for ShareDB operations
function applyOperation(op: any) {
  return op.ops[0].p; // Dangerous
}

// ✅ Good - type-safe ShareDB operation handling
function applyOperation(op: unknown) {
  if (!isShareDBOperation(op)) {
    throw new Error('Invalid ShareDB operation');
  }
  return op.ops[0]?.p; // Safe access
}
```

## 3. Use `satisfies` Instead of Type Assertions

**Rule**: Prefer `satisfies` over `as` for type validation.

```ts
// ❌ Bad - unsafe type assertion
const config = {
  host: 'localhost',
  port: 8080,
  ssl: false
} as ServerConfig;

// ✅ Good - structural validation with satisfies
const config = {
  host: 'localhost',
  port: 8080,
  ssl: false
} satisfies ServerConfig;
```

### WebSocket Configuration

```ts
// ✅ Good - ensures WebSocket config matches expected shape
const wsConfig = {
  url: 'ws://localhost:8080',
  reconnectInterval: 1000,
  maxRetries: 5
} satisfies WebSocketConfig;
```

## 4. Avoid Double Type Assertions

**Rule**: Never use `as unknown as Type` patterns.

```ts
// ❌ Bad - dangerous double assertion
const user = data as unknown as User;

// ✅ Good - proper type guard
if (!isUser(data)) {
  throw new Error('Invalid user data');
}
const user = data; // Now properly typed
```

## 5. Proper Union Type Handling

**Rule**: Use discriminated unions for type safety.

```ts
// ✅ Good - discriminated union for document states
type DocumentState =
  | { status: 'loading' }
  | { status: 'ready'; document: Document }
  | { status: 'error'; error: string };

// ✅ Type-safe handling
function handleDocumentState(state: DocumentState) {
  switch (state.status) {
    case 'loading':
      // state.document would be a type error
      return 'Loading...';
    case 'ready':
      return state.document.title; // Type-safe access
    case 'error':
      return `Error: ${state.error}`;
  }
}
```

### ShareDB Operation Types

```ts
// ✅ Good - discriminated union for ShareDB operations
type ShareDBOperation =
  | { type: 'create'; doc: unknown }
  | { type: 'delete'; id: string }
  | { type: 'update'; id: string; ops: unknown[] };

function processOperation(operation: ShareDBOperation) {
  switch (operation.type) {
    case 'create':
      return handleCreate(operation.doc);
    case 'delete':
      return handleDelete(operation.id);
    case 'update':
      return handleUpdate(operation.id, operation.ops);
  }
}
```

## 6. Generic Constraints

**Rule**: Use proper generic constraints for type safety.

```ts
// ❌ Bad - overly permissive generic
function updateDocument<T>(doc: T, updates: any): T {
  return { ...doc, ...updates };
}

// ✅ Good - constrained generic with proper typing
function updateDocument<T extends Record<string, unknown>>(
  doc: T,
  updates: Partial<T>
): T {
  return { ...doc, ...updates };
}
```

### ShareDB Document Updates

```ts
// ✅ Good - type-safe document update
function updateShareDBDoc<T extends Record<string, unknown>>(
  doc: { data: T },
  path: (keyof T)[],
  value: unknown
): void {
  if (!isValidPath(path, doc.data)) {
    throw new Error('Invalid update path');
  }
  doc.submitOp([{ p: path, oi: value }]);
}
```

## 7. Utility Types

**Rule**: Leverage TypeScript utility types for maintainability.

```ts
// ✅ Good - using utility types
type UserUpdate = Partial<Pick<User, 'name' | 'email'>>;
type DocumentSummary = Omit<Document, 'content'>;
type CreateUserRequest = Omit<User, 'id' | 'createdAt'>;
```

### Real-time Collaboration Types

```ts
// ✅ Good - utility types for collaboration features
type UserPresence = Pick<User, 'id' | 'name'> & {
  cursor?: { line: number; column: number };
  selection?: { start: number; end: number };
};

type CollaborationState = {
  activeUsers: UserPresence[];
  document: DocumentSummary;
  lastSync: Date;
};
```

## 8. Strict Function Signatures

**Rule**: Define precise function signatures with proper return types.

```ts
// ❌ Bad - imprecise signatures
function connectWebSocket(url: any): any;

// ✅ Good - precise signatures
function connectWebSocket(url: string): Promise<WebSocket>;
function authenticateUser(credentials: LoginCredentials): Promise<AuthResult>;
```

## 9. Avoid Ambient Declarations

**Rule**: Don't create `.d.ts` files. Use explicit types.

```ts
// ❌ Bad - ambient declaration in .d.ts file
declare module 'some-library' {
  export function doSomething(): any;
}

// ✅ Good - explicit typing in regular .ts file
type SomeLibraryFunction = () => unknown;

// Use module augmentation only when absolutely necessary
```

## Enforcement Checklist

- [ ] No `interface` declarations (use `type`)
- [ ] No `any` types (use `unknown` + type guards)
- [ ] No `as` type assertions (use `satisfies`)
- [ ] No double type assertions (`as unknown as`)
- [ ] Discriminated unions for complex state
- [ ] Generic constraints where appropriate
- [ ] Utility types for derived types
- [ ] Precise function signatures
- [ ] No `.d.ts` files unless absolutely necessary
