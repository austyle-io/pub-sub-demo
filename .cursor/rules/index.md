# Cursor Rules Index

This directory contains comprehensive coding standards and best practices for the pub-sub-demo project.

## 📚 **Quick Reference**

### Core TypeScript/JavaScript Patterns

- `@rules/core/union-literals.md` - Union literal constants with `as const`
- `@rules/core/logical-operators.md` - Nullish coalescing and optional chaining
- `@rules/core/type-system.md` - Type system preferences (`type` over `interface`)
- `@rules/core/imports.md` - Import/export patterns and lodash usage
- `@rules/typescript-safety.md` - Comprehensive TypeScript safety rules

### React Patterns

- `@rules/react/component-patterns.md` - Component structure and prop patterns
- `@rules/react/hooks-patterns.md` - Custom hooks and state management

### Architecture & Organization

- `@rules/architecture/file-organization.md` - File size limits and organization
- `@rules/architecture/monorepo-patterns.md` - Workspace and package structure

### Code Quality

- `@rules/quality/bundle-optimization.md` - Tree-shaking and bundle size optimization
- `@rules/quality/error-handling.md` - Error handling patterns
- `@rules/quality/testing-patterns.md` - Testing standards and patterns
- `@rules/quality/logging-patterns.md` - Structured logging requirements

### Security

- `@rules/security/input-validation.md` - Input sanitization and validation
- `@rules/security/auth-patterns.md` - Authentication and authorization

## 🎯 **Usage Patterns**

### Include All Rules

```
@rules/index.md - Follow all established coding patterns
```

### Include Specific Categories

```
@rules/core/ @rules/react/
@rules/architecture/ @rules/quality/
```

### Common Combinations

```
# Frontend Development
@rules/core/ @rules/react/ @rules/quality/

# Backend Development
@rules/core/ @rules/security/ @rules/quality/

# Performance & Bundle Optimization
@rules/core/imports.md @rules/quality/bundle-optimization.md

# Full Stack Review
@rules/typescript-safety.md @rules/security/ @rules/quality/bundle-optimization.md
```

## 📋 **Core Rules Summary**

| Category         | Rules  | Focus                                  |
| ---------------- | ------ | -------------------------------------- |
| **Core**         | 4      | TypeScript/JavaScript fundamentals     |
| **React**        | 2      | React component architecture           |
| **Architecture** | 2      | File organization and structure        |
| **Quality**      | 4      | Code quality and maintainability       |
| **Security**     | 2      | Authentication and input validation    |
| **Legacy**       | 1      | Existing TypeScript safety rules       |
| **Total**        | **15** | **Complete coverage**                  |

## 🔧 **Key Patterns Enforced**

### TypeScript Safety

```typescript
// ✅ Nullish coalescing - preserves falsy values
const count = userInput ?? 10;

// ✅ Optional chaining - safe navigation
const theme = user?.profile?.settings?.theme;

// ✅ Runtime type guards for external data
if (!isUser(data)) throw new Error('Invalid user data');
console.log(data.name); // type-safe after guard
```

### Bundle Optimization

```typescript
// ✅ Individual package imports for tree-shaking
import isNil from 'lodash.isnil';
import isObject from 'lodash.isobject';
import isString from 'lodash.isstring';

// ✅ Dynamic imports for code splitting
const Editor = lazy(() => import('./DocumentEditor'));

// ✅ Workspace-specific dependencies only
// Each package.json contains only what's needed
```

### Collaborative Editing Context

```typescript
// ✅ ShareDB document handling
const doc = connection.get('documents', docId);
if (!isShareDBDoc(doc)) throw new Error('Invalid document');

// ✅ WebSocket message validation
if (!isWebSocketMessage(message)) {
  logger.warn('Invalid WebSocket message received');
  return;
}
```

### Security Patterns

```typescript
// ✅ Input sanitization
const sanitizedInput = sanitizeHtml(userInput);

// ✅ JWT validation
if (!isValidJWT(token)) {
  throw new UnauthorizedError('Invalid token');
}
```

## 🚀 **Project Context**

These rules are tailored for:

- **Real-time collaborative editing** with ShareDB
- **React + TypeScript** frontend development
- **Node.js + TypeScript** backend services
- **WebSocket-based** real-time communication
- **JWT authentication** and security
- **Monorepo structure** with pnpm workspaces

## 🎓 **Integration**

- **TypeScript 5.7+** with strict mode
- **Biome** for linting and formatting
- **Lodash** for type checking utilities
- **Vitest** for unit testing
- **Playwright** for E2E testing
- **Pino** for structured logging (planned)

## 📈 **Benefits**

- 🛡️ **Type Safety**: Runtime errors prevented through compile-time checks
- 🎯 **Security**: Input validation and authentication patterns
- ⚡ **Performance**: Optimized patterns for real-time collaboration
- 🔍 **Maintainability**: Consistent code organization across packages
- 🚀 **Developer Experience**: Clear patterns and better tooling
- 🤝 **Collaboration**: Shared standards across frontend/backend

For detailed examples and rationale, see individual rule files.
