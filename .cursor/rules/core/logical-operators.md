# Logical Operators - Nullish Coalescing & Optional Chaining

## 1. Nullish Coalescing Over Logical OR

**Rule**: Always use `??` instead of `||` for default values.

```ts
// ❌ Bad - overrides falsy values like 0, false, ''
const port = config.port || 3000;
const enabled = settings.feature || true;
const docTitle = document.title || 'Untitled';

// ✅ Good - only overrides null/undefined
const port = config.port ?? 3000;
const enabled = settings.feature ?? true;
const docTitle = document.title ?? 'Untitled';
```

**ShareDB Context**: This is especially important with document properties that may legitimately be falsy.

```ts
// ❌ Bad - loses valid document data
const fontSize = doc.data.fontSize || 14; // 0 becomes 14
const lineHeight = doc.data.lineHeight || 1.5; // 0 becomes 1.5

// ✅ Good - preserves valid zero values
const fontSize = doc.data.fontSize ?? 14;
const lineHeight = doc.data.lineHeight ?? 1.5;
```

## 2. Optional Chaining Over Manual Guards

**Rule**: Use `?.` instead of manual null/undefined checks.

```ts
// ❌ Bad - verbose and error-prone
if (user && user.profile && user.profile.settings) {
  const theme = user.profile.settings.theme;
}

// ✅ Good - concise and safe
const theme = user?.profile?.settings?.theme;
```

**WebSocket Context**: Essential for handling potentially incomplete message data.

```ts
// ❌ Bad - manual checks for nested message properties
if (message &&
    message.payload &&
    message.payload.document &&
    message.payload.document.metadata) {
  const lastModified = message.payload.document.metadata.lastModified;
}

// ✅ Good - safe navigation
const lastModified = message?.payload?.document?.metadata?.lastModified;
```

## 3. Array and Method Chaining

**Rule**: Use optional chaining with arrays and method calls.

```ts
// ❌ Bad - manual array safety checks
const firstDoc = documents && documents.length > 0 ? documents[0] : null;
const title = firstDoc && firstDoc.getTitle ? firstDoc.getTitle() : 'Unknown';

// ✅ Good - optional chaining with arrays and methods
const firstDoc = documents?.[0];
const title = firstDoc?.getTitle?.() ?? 'Unknown';
```

**ShareDB Operation Context**:

```ts
// ❌ Bad - manual operation safety
if (op && op.ops && op.ops.length > 0 && op.ops[0].p) {
  const path = op.ops[0].p;
}

// ✅ Good - safe operation access
const path = op?.ops?.[0]?.p;
```

## 4. Combining Both Patterns

**Rule**: Use `?.` and `??` together for robust default handling.

```ts
// ✅ Excellent - combines safe navigation with nullish coalescing
const userTheme = user?.preferences?.theme ?? 'light';
const docPermissions = document?.metadata?.permissions ?? ['read'];
const wsRetryCount = connection?.config?.retries ?? 3;
```

## 5. Edge Cases and Best Practices

### Function Calls

```ts
// ❌ Bad - unsafe function invocation
if (callback && typeof callback === 'function') {
  callback(data);
}

// ✅ Good - optional chaining with function calls
callback?.(data);
```

### ShareDB Document Events

```ts
// ✅ Safe event listener attachment
doc?.on?.('op', handleOperation);
doc?.on?.('error', handleError);

// ✅ Safe event cleanup
doc?.removeListener?.('op', handleOperation);
```

### WebSocket Message Handling

```ts
// ✅ Safe message processing
const messageType = message?.type ?? 'unknown';
const payload = message?.payload ?? {};
const timestamp = message?.metadata?.timestamp ?? Date.now();
```

## 6. Common Anti-Patterns

### Mixing `||` and `??`

```ts
// ❌ Inconsistent - confusing intent
const config = {
  host: process.env.HOST || 'localhost',     // uses ||
  port: process.env.PORT ?? 3000,           // uses ??
  debug: process.env.DEBUG || false         // uses ||
};

// ✅ Consistent - clear intent
const config = {
  host: process.env.HOST ?? 'localhost',
  port: process.env.PORT ?? 3000,
  debug: process.env.DEBUG ?? false
};
```

### Unnecessary Optional Chaining

```ts
// ❌ Unnecessary - req is guaranteed to exist in Express middleware
const userId = req?.user?.id;

// ✅ Appropriate - req.user might not exist
const userId = req.user?.id;
```

## 7. Performance Considerations

Optional chaining and nullish coalescing have minimal performance overhead and improve code safety significantly.

```ts
// ✅ Efficient and safe
const result = expensive?.calculation?.() ?? getCachedResult();
```

## Enforcement Checklist

- [ ] No usage of `||` for default values (use `??`)
- [ ] No manual null/undefined checks before property access (use `?.`)
- [ ] Optional chaining used for array access when array might not exist
- [ ] Function calls use optional chaining when function might not exist
- [ ] Consistent use of nullish coalescing throughout codebase
