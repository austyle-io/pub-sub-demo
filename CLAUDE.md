# Memory Reference

Comprehensive coding standards (41 rule files)

## Project-Specific Lessons Learned (2025-01-21)

### Testing Philosophy
**User Preference**: 100% user acceptance testing focus
- Code coverage metrics are not a priority
- Focus on ensuring critical path workflows and features are working
- Validate that real user scenarios function correctly end-to-end
- Integration and E2E tests are more valuable than unit test coverage

### ShareDB Real-time Implementation

**WebSocket Authentication Pattern:**
- Pass JWT tokens as query parameters for WebSocket connections: `ws://host?token=${token}`
- Authenticate during the WebSocket upgrade handshake, not after connection
- Reject unauthorized connections with proper HTTP response: `socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')`

**ShareDB OT Operations:**
- Use json0 OT type for document operations
- Operations require both `oi` (object insert) and `od` (object delete) for replacements
- Path notation: `[{ p: ['fieldName'], oi: newValue, od: oldValue }]`
- Always listen for 'op' events to sync remote changes

**Module System Compatibility:**
- Mixed ESM/CommonJS environments require careful package.json configuration
- Use explicit exports field with both "require" and "import" entries
- Remove "type": "module" when supporting CommonJS consumers
- Build before running to ensure dist files exist

**ShareDB Type Guards:**
- ShareDB documents need runtime validation due to lack of TypeScript types
- Check for required methods: `on`, `removeListener`, `submitOp`, `destroy`
- Validate document data structure before use

**ShareDB Document Storage:**
- Initial documents are stored with data in `create.data` field
- Updated documents may have data in `data` field  
- Use `doc.create?.data || doc.data` pattern for compatibility
- Document ID is stored in the `d` field at root level
- Query by `{ d: documentId }` not `{ 'data.id': documentId }`

**ShareDB Backend Connections:**
- Backend connections need user context for authorization middleware
- Create authenticated connections with `backend.connect()` then set `connection.agent.custom`
- Pass userId, email, and role in agent.custom for permission checks
- Use separate method like `createAuthenticatedConnection()` for backend operations

### Development Environment Issues & Solutions (2025-01-21)

**Problems Encountered:**
- vite-tsconfig-paths v5 is ESM-only, incompatible with Vite's CommonJS config loading
- tsx struggles with workspace package resolution in mixed module environments
- Node.js v24 has stricter ESM resolution rules
- bcrypt native bindings cause issues when imported in client bundle
- Environment variables not loading due to import order in server.ts
- ES module imports require .js extension in TypeScript compiled output
- Shared package subpath exports not resolving correctly
- JWT env vars not accessible to shared package utilities

**Solutions Applied:**
- Removed vite-tsconfig-paths from client dependencies
- Separated server-only exports (bcrypt) into `@collab-edit/shared/server` subpath
- Updated server tsconfig moduleResolution to "bundler" for subpath imports
- Fixed dotenv import order - must load before env validation
- Cleaned up client package.json to remove all server-specific dependencies
- Added .env file to server directory for proper env loading
- Created docker-compose.yml for consistent development environment
- Added .js extension to ES module imports in server.ts
- Set JWT_ACCESS_SECRET and JWT_REFRESH_SECRET in process.env from single JWT_SECRET
- Used direct import path for password utilities as temporary workaround

**Authentication Implementation Lessons:**
- JWT utilities in shared package need access to process.env variables
- Server env validation must set process.env values for shared package to access
- Error sanitization can hide real issues during development
- Rate limiting can interfere with auth endpoint tests
- ShareDB authorization requires proper user context on WebSocket connections
- WebSocket auth works via query parameter: `ws://host?token=${token}`
- ShareDB connect middleware must initialize agent.custom object before setting properties

**API Testing Insights:**
- Document list queries must match ShareDB's storage structure
- Transform ShareDB documents carefully - validate each field exists
- Use try-catch in array transformations to handle partial failures
- Log transformation errors for debugging empty API responses
- Test with direct database queries to verify data structure

## Core TypeScript/JavaScript Patterns (16 rules)

**Type Safety Enforcement:**

- **Zero `any` types** - Use `unknown` with proper type guards instead
- **Ban double type assertions** (`as unknown as T`) - Use Zod validation or type guards
- **Runtime validation required** at all data boundaries using Zod schemas
- **Use `satisfies` operator** instead of duck typing for type safety
- **Branded types** for domain identifiers (e.g., `UserId`, `ProjectId`)
- **Type coverage target: >97%**

**Function & Code Style:**

- **Always prefer arrow functions** except when `this` access is needed
- **Explicit types required** for all function parameters and returns
- **Use template literals** over string concatenation
- **Use `async/await`** over `.then()` chains
- **Object property shorthand** and trailing commas required
- **Use intermediate variables** for complex operations (3+ transformations)

**Type System:**

- **NEVER use `interface`** - Always use `type` declarations
- **No naming patterns** like `IMyObject` or `MyObjectInterface`
- **Union literals with `as const`** pattern for enums
- **Lodash utilities** for all type checks (`isString`, `isObject`, etc.)
- **Generic utility functions** for type-safe operations

### Architecture & Organization (6 rules)

**Directory Structure:**

```mermaid
feature/
├── components/     # React components (PascalCase.tsx)
├── hooks/         # Custom hooks (useHookName.ts)
├── utils/         # Pure utilities (domain-utils.ts)
├── types/         # Type definitions (domain-types.ts)
├── services/      # Business logic
├── stores/        # State management (context-wrapped only)
└── index.ts       # Public API
```

**Key Rules:**

- **100-line limit** for components (extract when larger)
- **Single responsibility** per file/directory
- **Context-wrapped stores only** - No global store access
- **Domain-based utility grouping** (avoid generic names)
- **Progressive refactoring** with backwards compatibility

### Quality Standards (11 rules)

**Error Handling:**

- Use `react-error-boundary` with typed errors
- Always log complete error details
- Provide recovery suggestions

**Naming Conventions:**

- **PascalCase**: React components, types
- **camelCase**: Functions, variables, hooks
- **SCREAMING_SNAKE_CASE**: Constants
- **kebab-case**: Non-component files
- Boolean prefixes: `is`, `has`, `can`, `should`

**Code Quality:**

- **Cognitive complexity <15** per method
- **20-50 lines** per method target
- **JSDoc comments** for complex logic (focus on "why")
- **SonarQube compliance** required
- **SSR-safe components** with runtime checks

### React-Specific Patterns (3 rules)

**Component Patterns:**

- **Arrow functions only** for components
- **Never use `React.FC`** type annotation
- **Explicit prop types** with dedicated type definitions
- **Logical AND (`&&`)** for conditional rendering
- **Smart prop spreading** for wrapper components

**Styling:**

- **Tailwind CSS only** - No CSS-in-JS
- **Utility-first approach** with conditional classes
- **Template literals** for dynamic classes

### Advanced Patterns (3 rules)

**Enum-Object Pattern:**

```typescript
export const STATUS = {
    PENDING: "pending",
    COMPLETE: "complete"
} as const;
export type Status = (typeof STATUS)[keyof typeof STATUS];

// Use lookup objects instead of switch statements
const STATUS_COLORS: Record<Status, string> = {
    [STATUS.PENDING]: "yellow",
    [STATUS.COMPLETE]: "green",
};
```

**ClassNames Prop Pattern:**

```typescript
type Props = {
    classNames?: {
        containerClassName?: ClassValue;
        labelClassName?: ClassValue;
        inputClassName?: ClassValue;
    };
};
```

**Zod Type Guard Pattern:**

```typescript
// Schema first
export const UserSchema = z.object({
    id: z.string(),
    email: z.string().email(),
});

// Type derived
export type User = z.infer<typeof UserSchema>;

// Type guard
export const isUser = (x: unknown): x is User =>
    UserSchema.safeParse(x).success;
```

### Special Patterns

**Skeptical Analysis:**

- All claims require evidence with confidence levels
- Document validation methods
- Use qualifiers: Certain (>95%), Likely (70-95%), Possible (40-70%), Uncertain (<40%)

**Key Anti-Patterns to Avoid:**

- ❌ Switch statements → ✅ Lookup objects
- ❌ Duck typing → ✅ `satisfies` operator
- ❌ `any` types → ✅ `unknown` with guards
- ❌ Interfaces → ✅ Type declarations
- ❌ CSS-in-JS → ✅ Tailwind utilities
- ❌ Global stores → ✅ Context providers

### Benefits

- **Type Safety**: Compile-time and runtime validation
- **Maintainability**: Clear patterns and organization
- **Performance**: O(1) lookups, optimized bundles
- **Developer Experience**: Predictable, discoverable patterns
- **Quality**: SonarQube compliant, <15 cognitive complexity

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.