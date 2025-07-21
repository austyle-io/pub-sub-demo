# Memory Reference

Comprehensive coding standards (41 rule files)

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
