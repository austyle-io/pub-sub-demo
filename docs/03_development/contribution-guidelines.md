# Contribution Guidelines

## Overview

Welcome to the collaborative document editing project! This guide outlines our development standards, workflows, and best practices to ensure high-quality contributions and smooth collaboration.

## Quick Start for Contributors

### Prerequisites

1. **Development Environment**:
   - Node.js 18+ or 24+ [[memory:3835223]]
   - pnpm 9.15.5+
   - Docker for local development
   - Git with proper configuration

2. **Project Setup**:

   ```bash
   git clone <repository-url>
   cd pub-sub-demo
   make setup        # Complete automated setup
   make dev          # Start development environment
   make test         # Verify everything works
   ```

3. **Development Tools**:
   - VS Code (recommended) with extension pack
   - Biome extension for linting/formatting
   - React Developer Tools
   - MongoDB Compass (optional)

## Code Standards and Best Practices

### TypeScript Standards

Following our comprehensive [[memory:3829289]] TypeScript best practices:

#### Type Safety Requirements

```typescript
// ✅ REQUIRED: Always use runtime type guards for external data
function isUserData(data: unknown): data is UserData {
  return isObject(data) &&
         typeof data.id === 'string' &&
         typeof data.email === 'string' &&
         (isNil(data.role) || typeof data.role === 'string');
}

// ✅ REQUIRED: Use nullish coalescing over logical OR
const userName = user.name ?? 'Unknown User';
const config = options.config ?? getDefaultConfig();

// ✅ REQUIRED: Use optional chaining for safe property access
const profilePicture = user.profile?.avatar?.url;

// ❌ FORBIDDEN: Any type or arbitrary type assertions
const data = response as any;           // Never do this
const result = response as UserData;    // Never do this

// ✅ CORRECT: Use type guards for validation
const data = isUserData(response) ? response : null;
```

#### Component Standards

```typescript
// ✅ REQUIRED: Components under 100 lines, explicit types
type DocumentEditorProps = {
  document: DocumentData;
  onUpdate: (updates: DocumentUpdate[]) => void;
  permissions: DocumentPermissions;
  className?: string;
};

// ✅ REQUIRED: Arrow functions for components
const DocumentEditor = ({
  document,
  onUpdate,
  permissions,
  className
}: DocumentEditorProps) => {
  // Component logic (max 100 lines)

  // ✅ REQUIRED: Use type guards for external data
  const handleExternalUpdate = useCallback((data: unknown) => {
    if (isDocumentUpdate(data)) {
      onUpdate([data]);
    }
  }, [onUpdate]);

  return (
    <div className={className}>
      {/* Component JSX */}
    </div>
  );
};
```

#### Directory Structure

```mermaid
feature/
├── components/     # React components (PascalCase.tsx)
│   ├── FeatureList.tsx
│   └── FeatureEditor.tsx
├── hooks/         # Custom hooks (useHookName.ts)
│   └── useFeatureData.ts
├── utils/         # Pure utilities (kebab-case.ts)
│   └── feature-helpers.ts
├── types/         # Type definitions (kebab-case.ts)
│   └── feature-types.ts
├── services/      # Business logic
│   └── feature.service.ts
└── index.ts       # Public API exports
```

### Code Quality Requirements

#### Linting and Formatting

```bash
# REQUIRED: All code must pass these checks
make quality              # Comprehensive quality check
make lint                 # TypeScript, Shell, Markdown linting
make type-check          # TypeScript compilation
make format              # Code formatting

# Auto-fix common issues
pnpm run lint:fix
pnpm run format
```

#### Testing Requirements

Following our [[memory:3829289]] user acceptance testing approach:

```typescript
// ✅ REQUIRED: Focus on user workflows over unit test coverage
describe('Document Collaboration Workflow', () => {
  it('should allow multiple users to edit simultaneously', async () => {
    // Test real user scenarios
    const user1 = await createTestUser('editor1@example.com');
    const user2 = await createTestUser('editor2@example.com');

    const document = await createDocument(user1);
    await shareDocument(document.id, user2, 'editor');

    // Test collaborative editing
    const edit1 = await user1.editDocument(document.id, { text: 'Hello' });
    const edit2 = await user2.editDocument(document.id, { text: ' World' });

    // Verify operational transformation
    const finalDoc = await getDocument(document.id);
    expect(finalDoc.content).toBe('Hello World');
  });
});
```

## Git Workflow

### Branch Naming

```bash
# Feature branches
feature/user-authentication
feature/document-permissions
feature/real-time-sync

# Bug fixes
fix/websocket-connection
fix/type-safety-errors

# DevX improvements
devx/enhance-testing-framework
devx/improve-documentation

# Hotfixes
hotfix/security-vulnerability
hotfix/data-corruption
```

### Commit Message Standards

Follow conventional commits for clear history:

```bash
# Feature commits
feat: add real-time collaborative editing
feat(auth): implement JWT refresh token rotation
feat(ui): add document sharing modal

# Bug fixes
fix: resolve ShareDB operational transform conflicts
fix(types): add runtime type guards for external API data
fix(db): handle MongoDB connection timeouts

# Documentation
docs: update contribution guidelines
docs(api): add endpoint documentation
docs(setup): improve development environment guide

# DevX improvements
devx: enhance safe script execution framework
devx(testing): add comprehensive integration test suite
devx(quality): implement strict TypeScript checking

# Examples
git commit -m "feat(collaboration): add multi-user document editing

- Implement ShareDB operational transformation
- Add WebSocket authentication middleware
- Create real-time sync monitoring
- Add user presence indicators

Resolves #123"
```

### Pull Request Process

#### 1. Pre-submission Checklist

```bash
# REQUIRED: All must pass before submitting PR
make quality              # All quality checks
make test                 # Full test suite
make organize            # Project organization check

# Optional but recommended
make db-reset && make test  # Clean database test
make build               # Production build test
```

#### 2. PR Description Template

```markdown
## Description

Brief description of changes and motivation.

## Type of Change

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] DevX improvement

## Testing

- [ ] Unit tests pass (`make test`)
- [ ] Integration tests pass (`make test-integration`)
- [ ] User workflow tests pass (`make test-user-workflows`)
- [ ] Manual testing completed (describe scenarios)

## Quality Checklist

- [ ] Code follows TypeScript best practices (type guards, nullish coalescing)
- [ ] Components are under 100 lines
- [ ] All external data validated with runtime type guards
- [ ] Linting passes (`make lint`)
- [ ] Type checking passes (`make type-check`)
- [ ] Documentation updated

## Database Changes

- [ ] No database changes
- [ ] Schema changes documented
- [ ] Migration scripts provided
- [ ] Backward compatibility maintained

## Security Considerations

- [ ] No security implications
- [ ] Security review completed
- [ ] No sensitive data exposed
- [ ] Authentication/authorization tested

## Screenshots/Recordings

(If applicable, add screenshots or recordings of the changes)

## Related Issues

Closes #issue_number
```

#### 3. Review Process

**Reviewer Checklist:**

1. **Code Quality**:
   - [ ] Follows TypeScript best practices [[memory:3829289]]
   - [ ] Uses type guards for external data [[memory:3820036]]
   - [ ] Components under 100 lines
   - [ ] Proper error handling

2. **Testing**:
   - [ ] Focuses on user workflows
   - [ ] Covers critical paths
   - [ ] Integration tests for API changes
   - [ ] Manual testing scenarios documented

3. **Security**:
   - [ ] No hardcoded secrets
   - [ ] Input validation present
   - [ ] Authentication/authorization correct
   - [ ] No sensitive data exposure

4. **Performance**:
   - [ ] No obvious performance issues
   - [ ] Database queries optimized
   - [ ] React rendering optimized (memoization, callbacks)

## Development Workflow

### Daily Development Process

```bash
# 1. Start development session
git checkout main
git pull origin main
git checkout -b feature/your-feature

# 2. Set up development environment
make dev                  # Start all services

# 3. Development cycle
# - Write code following standards
# - Test frequently: make test
# - Check quality: make quality

# 4. Before committing
make quality              # Final quality check
git add .
git commit -m "feat: descriptive commit message"

# 5. Push and create PR
git push origin feature/your-feature
# Create PR via GitHub UI
```

### Testing During Development

```bash
# Run tests frequently during development
make test                 # Full test suite with timeouts
make test-integration     # API integration tests
make test-user-workflows  # User workflow validation

# Debug specific tests
NODE_ENV=test node test/integration/specific-test.js

# Monitor test logs
tail -f .logs/test-*.log
```

### Database Development

```bash
# Reset database for clean testing
make db-reset

# Debug database state
make db-debug

# Seed development data
node test/fixtures/seed-dev-data.js

# Check database directly
docker exec -it $(docker ps -q -f name=mongo) mongosh
```

## Feature Development Guidelines

### New Feature Process

1. **Planning Phase**:
   - Create GitHub issue with feature description
   - Discuss architecture in issue comments
   - Break down into manageable tasks
   - Consider security and performance implications

2. **Implementation Phase**:
   - Create feature branch
   - Implement with TDD approach (test-first for critical paths)
   - Follow TypeScript best practices
   - Add comprehensive documentation

3. **Testing Phase**:
   - User workflow tests for main features
   - Integration tests for API endpoints
   - Manual testing scenarios
   - Performance testing if applicable

4. **Documentation Phase**:
   - Update relevant documentation
   - Add API documentation
   - Update troubleshooting guide if needed
   - Record demo video for complex features

### API Development Standards

```typescript
// ✅ REQUIRED: Type-safe API endpoints
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';

// Define schemas first
const CreateDocumentSchema = Type.Object({
  title: Type.String({ minLength: 1, maxLength: 200 }),
  content: Type.Optional(Type.String()),
  permissions: Type.Optional(PermissionsSchema)
});

// Use runtime validation
app.withTypeProvider<TypeBoxTypeProvider>().post('/api/documents', {
  schema: {
    body: CreateDocumentSchema,
    response: {
      201: DocumentResponseSchema,
      400: ErrorResponseSchema
    }
  }
}, async (request, reply) => {
  // Type-safe handler with validated input
  const { title, content, permissions } = request.body;

  // Add proper error handling
  try {
    const document = await createDocument({
      title,
      content: content ?? '',
      permissions: permissions ?? getDefaultPermissions(),
      createdBy: request.user.id
    });

    return reply.code(201).send(document);
  } catch (error) {
    if (isValidationError(error)) {
      return reply.code(400).send({ error: sanitizeError(error) });
    }
    throw error; // Let global error handler manage
  }
});
```

## Security Guidelines

### Authentication and Authorization

```typescript
// ✅ REQUIRED: Always validate permissions
const checkDocumentAccess = async (
  userId: string,
  documentId: string,
  requiredPermission: 'read' | 'write' | 'delete'
) => {
  const permission = await checkDocumentPermission(
    userId,
    documentId,
    requiredPermission
  );

  if (!permission.allowed) {
    throw new UnauthorizedError('Insufficient permissions');
  }

  return permission;
};

// ✅ REQUIRED: Validate all inputs
function validateDocumentTitle(title: unknown): string {
  if (!isString(title)) {
    throw new ValidationError('Title must be a string');
  }

  if (title.length === 0 || title.length > 200) {
    throw new ValidationError('Title must be 1-200 characters');
  }

  // Sanitize for XSS protection
  return sanitizeText(title);
}
```

### Data Protection

```typescript
// ✅ REQUIRED: Sanitize sensitive data
const sanitizeUserForClient = (user: UserData): PublicUserData => {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    // Never send: passwordHash, refreshTokens, etc.
  };
};

// ✅ REQUIRED: Use environment variables for secrets
const config = {
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET!,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET!,
  mongoUrl: process.env.MONGO_URL!,
  // Never hardcode secrets
};
```

## Performance Guidelines

### Client-Side Performance

```typescript
// ✅ REQUIRED: Optimize React components
import { memo, useMemo, useCallback } from 'react';

const DocumentList = memo(({ documents, onSelect }: DocumentListProps) => {
  // Memoize expensive computations
  const sortedDocuments = useMemo(() =>
    documents.sort((a, b) => b.updatedAt - a.updatedAt),
    [documents]
  );

  // Stable callback references
  const handleSelect = useCallback((id: string) => {
    onSelect(id);
  }, [onSelect]);

  return (
    <div>
      {sortedDocuments.map(doc => (
        <DocumentItem
          key={doc.id}
          document={doc}
          onSelect={handleSelect}
        />
      ))}
    </div>
  );
});
```

### Database Performance

```typescript
// ✅ REQUIRED: Optimize database queries
const getDocumentsForUser = async (userId: string, limit = 20) => {
  // Use indexes and limit results
  const documents = await db.collection('documents')
    .find({
      $or: [
        { createdBy: userId },
        { 'permissions.users': { $elemMatch: { userId } } }
      ]
    })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .toArray();

  return documents;
};

// ✅ REQUIRED: Add database indexes
await db.collection('documents').createIndex({ createdBy: 1, updatedAt: -1 });
await db.collection('documents').createIndex({ 'permissions.users.userId': 1 });
```

## Documentation Standards

### Code Documentation

```typescript
/**
 * Checks if a user has the required permission for a document.
 *
 * @param userId - The ID of the user requesting access
 * @param documentId - The ID of the document to check
 * @param permission - The required permission level
 * @returns Promise resolving to permission check result
 *
 * @example
 * ```typescript
 * const canEdit = await checkDocumentPermission(
 *   'user123',
 *   'doc456',
 *   'write'
 * );
 *
 * if (canEdit.allowed) {
 *   // Proceed with edit operation
 * }
 * ```
 */
export async function checkDocumentPermission(
  userId: string,
  documentId: string,
  permission: PermissionLevel
): Promise<PermissionCheckResult> {
  // Implementation
}
```

### README Updates

When adding new features, update relevant README sections:

- Installation requirements
- New environment variables
- New make commands
- New API endpoints
- Configuration changes

## Common Pitfalls and Solutions

### TypeScript Issues

```typescript
// ❌ COMMON MISTAKE: Using any or type assertions
const data = (response as any).data;

// ✅ CORRECT: Use type guards
function isApiResponse(data: unknown): data is ApiResponse {
  return isObject(data) && 'data' in data;
}

const response = await fetch('/api/data');
const json = await response.json();
if (isApiResponse(json)) {
  const data = json.data; // Type-safe access
}
```

### Performance Issues

```typescript
// ❌ COMMON MISTAKE: Creating objects in render
const ComponentWithIssue = ({ items }) => {
  return (
    <div>
      {items.map(item => (
        <Item
          key={item.id}
          data={item}
          config={{ theme: 'dark' }} // New object every render!
        />
      ))}
    </div>
  );
};

// ✅ CORRECT: Stable references
const ComponentOptimized = ({ items }) => {
  const config = useMemo(() => ({ theme: 'dark' }), []);

  return (
    <div>
      {items.map(item => (
        <Item
          key={item.id}
          data={item}
          config={config} // Stable reference
        />
      ))}
    </div>
  );
};
```

## Getting Help

### Internal Resources

1. **Documentation**: Comprehensive guides in `docs/` directory
2. **Troubleshooting**: [Troubleshooting Guide](troubleshooting-guide.md)
3. **Examples**: Check existing components and tests for patterns
4. **Make Commands**: `make help` for all available commands

### Communication

1. **Issues**: Create detailed GitHub issues for bugs/features
2. **Discussions**: Use GitHub Discussions for questions
3. **Code Review**: Engage actively in PR reviews
4. **Documentation**: Improve docs when you find gaps

### Code Review Process

**For Contributors:**

- Respond to feedback promptly
- Ask questions if feedback is unclear
- Test suggested changes thoroughly
- Update documentation as needed

**For Reviewers:**

- Provide constructive, specific feedback
- Explain reasoning for suggested changes
- Test changes locally when possible
- Approve when all standards are met

This contribution guide ensures high-quality, secure, and maintainable code. Thank you for contributing to our collaborative editing platform!
