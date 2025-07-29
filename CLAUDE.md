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
- Set JWT_ACCESS_SECRET and JWT_REFR

### Key Lessons Learned (2025-01-21):
1. **ShareDB Authorization Architecture**
   - Backend connections need explicit user context
   - Must initialize agent.custom before setting properties
   - Create separate methods for authenticated backend connections

2. **ShareDB Document Structure**
   - Initial create operations store data in `create.data`
   - Document ID is in root `d` field, not nested
   - Queries must match exact storage structure
   - Documents can have data in either `create.data` or `data` field depending on lifecycle

3. **Debugging Approach**
   - Direct MongoDB queries essential for understanding data structure
   - Add logging at each transformation step
   - Test API endpoints in isolation before integration tests
   - Use try-catch in array transformations to handle partial failures

### Authentication Implementation Lessons:
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

### Testing Environment Configuration (2025-01-21):
**Rate Limiting Resolution:**
- Rate limiting middleware must be conditionally applied based on NODE_ENV
- Test environment requires `NODE_ENV=test` to bypass rate limiting
- Created helper scripts for consistent test execution
- Rate limiting was blocking authentication tests with 429 errors

**Document API Fixes:**
- Fixed list documents endpoint to properly query ShareDB structure
- Corrected document transformation to handle both `create.data` and `data` fields
- Added extensive logging for debugging empty API responses
- Fixed permission queries to use correct document ID field (`d` not `_id`)

## Magic Value Refactoring Tool v2.0 (2025-01-23)

### Overview
Created a sophisticated AST-based magic value refactoring tool that properly handles edge cases that the original implementation failed on. The tool uses ts-morph for TypeScript AST analysis and Node.js v24's native TypeScript execution.

### Key Implementation Details

**Native TypeScript Execution:**
- Uses Node.js v24's `--experimental-strip-types` flag
- No build step required - direct `.ts` file execution
- Must use `.ts` extensions in imports (not `.js`)
- ES modules require `"type": "module"` in package.json
- Parameter properties not supported - must expand to regular properties

**Context-Aware Detection System:**
- Analyzes full AST context including parent chain and scope
- Detects semantic context: type definitions, JSX, tests, arrays, etc.
- Preserves values that should remain as literals
- Categorizes values heuristically (HTTP_STATUS, TIMEOUT, COLOR, etc.)

**Edge Case Handlers:**
1. **Type Context**: Preserves all type literals in unions, interfaces, type aliases
2. **JSX Attributes**: Preserves HTML attributes requiring strings (type, name, id)
3. **Test Descriptions**: Never transforms test names in describe/it/test
4. **Array Indices**: Preserves common indices (0-10), transforms unusual ones
5. **Dynamic Contexts**: Reports errors instead of breaking
6. **Empty Values**: Context-aware handling of '' and 0

**Safe Transformation Engine:**
- Generates valid JavaScript identifiers (e.g., `3.1.0` → `V3_1_0`)
- Handles JSX expressions with proper `{CONSTANT}` syntax
- Manages imports intelligently to avoid circular dependencies
- Validates transformations before applying

**Whitelist System:**
- Default rules for common patterns
- Context-sensitive matching
- Customizable per project
- Regex pattern support

**Heuristic Analysis:**
- Categorizes values based on context hints
- Suggests meaningful constant names
- Confidence scoring
- Pattern-based detection

### Tool Architecture
```
scripts/magic-value-tool/
├── core/           # Main refactoring engine
├── analyzers/      # Context and heuristic analysis
├── handlers/       # Edge case handlers
├── transformers/   # Safe transformation logic
├── config/         # Configuration and whitelists
├── utils/          # Identifier generation, logging
└── types/          # TypeScript interfaces
```

### Results & Verification
- Successfully scanned 1,918 magic values across codebase
- Detected 200 edge cases with proper categorization
- Test file: 33/34 values correctly handled (1 dynamic context error as expected)
- All original edge case issues resolved

### Common Issues & Solutions

**Original Tool Problems (All Fixed):**
1. Type literals replaced → Now preserved via type context detection
2. Test names replaced → Now preserved via test context detection
3. Invalid identifiers (`STORAGE_KEY.3`) → Now generates valid names
4. JSX syntax errors → Now handles JSX attributes correctly
5. All array indices transformed → Now context-aware

**Implementation Gotchas:**
- `Node.isTypeParameter()` doesn't exist in ts-morph - use `getKind() === SyntaxKind.TypeParameter`
- Native TypeScript strip doesn't support parameter properties - expand them manually
- Import paths must use `.ts` extension with native TypeScript
- String methods can receive non-string values - always use `String(value)`

### Usage Examples
```bash
# Scan for magic values
node --experimental-strip-types scripts/magic-value-tool/index.ts scan --path .

# Dry run transformation
node --experimental-strip-types scripts/magic-value-tool/index.ts transform --dry-run

# Analyze edge cases
node --experimental-strip-types scripts/magic-value-tool/index.ts analyze-edge-cases
```

### File Organization
- Tool location: `scripts/magic-value-tool/`
- Documentation: `docs/03_development/magic-value-refactoring/`
- Reports: `reports/magic-value-analysis/`
- Upgrade plan: `docs/03_development/magic-value-refactoring-tool-upgrade-plan.md`

## Project File Organization Standards

### Documentation (`/docs/`)
- **Getting Started**: `/docs/01_getting-started/`
- **Architecture**: `/docs/02_architecture/`
- **Development Guides**: `/docs/03_development/`
- **Testing**: `/docs/04_testing/`
- **Deployment**: `/docs/05_deployment/`
- **Session Updates**: `/docs/99_appendix/session-updates/`
- **Tool Evaluations**: Save Biome reports, analysis docs here

### Reports
- **Code Analysis**: `/reports/` (e.g., magic-value analysis)
- **Biome/Tool Reports**: `/docs/` (evaluation reports, compliance)
- **Documentation Reports**: `/docs-site/reports/`

### Configuration Files
- **Root Level**: `biome.json`, `tsconfig.json`, `package.json`
- **App-specific**: In respective app directories

### Tests
- **Integration**: `/test/integration/`
- **E2E**: `/test/e2e/`
- **Tooling Tests**: `/test/tooling/` (linting rule tests)

### Scripts
- **Development**: `/scripts/development/`
- **Quality**: `/scripts/quality/`
- **Tools**: `/scripts/magic-value-tool/`

### Key Rules:
- Never save files in project root unless they're configs
- Reports go in `/docs/` or `/reports/` based on type
- Test files for tooling go in `/test/tooling/`
- Documentation in Markdown goes in `/docs/`

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
