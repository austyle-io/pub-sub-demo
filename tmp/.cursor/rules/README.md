# Cursor Rules Index

This directory contains modular coding rules organized by category. Reference specific rule files in prompts as needed.

## 📚 **Quick Reference**

### Core TypeScript/JavaScript Patterns (13 rules)

- `@rules/core/union-literals.md` - Union literal constants with `as const`
- `@rules/core/function-style.md` - Arrow functions and function patterns
- `@rules/core/logical-operators.md` - Nullish coalescing and optional chaining
- `@rules/core/null-vs-undefined.md` - Null vs undefined usage patterns
- `@rules/core/explicit-vs-implicit.md` - Explicit vs implicit coding patterns
- `@rules/core/duck-typing-prevention.md` - Ban duck typing, prefer satisfies operator
- `@rules/core/ban-double-type-assertions.md` - Ban double type assertions (`as unknown as`)
- `@rules/core/imports.md` - Import/export patterns and lodash usage
- `@rules/core/typescript-patterns.md` - Core TypeScript coding patterns
- `@rules/core/type-system.md` - Type system preferences
- `@rules/core/code-structure.md` - Object patterns and code organization
- `@rules/core/code-formatting.md` - Code formatting and layout rules
- `@rules/core/generic-utils.md` - Type-safe generic utility functions

### React Patterns (3 rules)

- `@rules/react/component-patterns.md` - Component structure and prop patterns
- `@rules/react/react-specific.md` - React-specific coding patterns
- `@rules/react/styling.md` - CSS and Tailwind patterns

### Architecture & Organization (6 rules)

- `@rules/architecture/file-organization.md` - File size limits and organization
- `@rules/architecture/directory-structure.md` - Directory structure patterns
- `@rules/architecture/component-extraction.md` - Component extraction rules
- `@rules/architecture/utility-organization.md` - Utility function organization
- `@rules/architecture/store-patterns.md` - State management patterns
- `@rules/architecture/migration-patterns.md` - Refactoring and migration rules

### Advanced Patterns (3 rules)

- `@rules/advanced/enum-object-pattern.md` - Enum-object with lookup helpers
- `@rules/advanced/classnames-prop-pattern.md` - Standardized className props
- `@rules/advanced/zod-type-guard-pattern.md` - Zod validation patterns

### Code Quality (10 rules)

- `@rules/quality/error-handling.md` - Error handling patterns
- `@rules/quality/performance.md` - Performance considerations
- `@rules/quality/naming-conventions.md` - Naming standards
- `@rules/quality/documentation.md` - Documentation and comments
- `@rules/quality/no-mock-data.md` - Avoid mock data in production code
- `@rules/quality/code-review-checklist.md` - Code review checklist
- `@rules/quality/bdd-testing-patterns.md` - BDD testing with QuickPickle patterns
- `@rules/quality/error-suppression-justification.md` - Error suppression justification
- `@rules/quality/sonarqube-compliance.md` - SonarQube compliance patterns
- `@rules/quality/safe-testing-linting.md` - Safe testing and linting practices

### Domain-Specific (1 rule)

- `@rules/domain/map-widget-patterns.md` - Map and Widget module naming patterns

### Pattern Rules (1 rule)

- `@rules/patterns/factory-pattern.md` - Factory pattern for test data

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

### Include Individual Rules

```
@rules/core/union-literals.md @rules/react/component-patterns.md
```

### Common Combinations

```
# Frontend Development
@rules/core/ @rules/react/ @rules/quality/

# Architecture Review
@rules/architecture/ @rules/quality/code-review-checklist.md

# Code Quality Focus
@rules/quality/ @rules/core/type-system.md
```

## 📋 **Category Overview**

| Category         | Rules  | Focus                                  |
| ---------------- | ------ | -------------------------------------- |
| **Core**         | 13     | TypeScript/JavaScript fundamentals     |
| **React**        | 3      | React component architecture           |
| **Architecture** | 6      | File organization and structure        |
| **Advanced**     | 3      | Complex patterns and specialized rules |
| **Quality**      | 10     | Code quality and maintainability       |
| **Domain**       | 1      | Domain-specific naming patterns        |
| **Patterns**     | 1      | Reusable coding patterns               |
| **Total**        | **37** | **Complete coverage**                  |

## 🔧 **Key Patterns Enforced**

### Union Literals with Constants

```typescript
export const STATUS = { PENDING: "pending", COMPLETE: "complete" } as const;
export type Status = (typeof STATUS)[keyof typeof STATUS];
```

### Component Architecture

```typescript
type ComponentProps = { title: string; onClick?: () => void; };
export const Component = ({ title, onClick }: ComponentProps) => {
  const handleClick = () => onClick?.();
  return <button onClick={handleClick}>{title}</button>;
};
```

### Generic Type-Safe Utilities

```typescript
const groupBy = <T, K extends keyof T>(array: T[], key: K): Record<string, T[]> => {
    return array.reduce(
        (groups, item) => {
            const groupKey = String(item[key]);
            groups[groupKey] = groups[groupKey] || [];
            groups[groupKey].push(item);
            return groups;
        },
        {} as Record<string, T[]>,
    );
};
```

### Error Boundaries with Context

```typescript
const CustomErrorBoundary = ({ children, ...props }: CustomErrorBoundaryProps) => {
  return (
    <ReactErrorBoundary
      fallbackRender={({ ...fallbackProps }) => {
        const resetErrorBoundaryProps = { ...fallbackProps, ...props };
        return <ResetErrorBoundary {...resetErrorBoundaryProps} />;
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
};
```

### Context Provider Patterns

```typescript
const StoreContext = createContext<Store | null>(null);
export const StoreProvider = ({ children }) => (
  <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
);
export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
```

## 🚀 **Benefits**

- **Modular**: Include only relevant rules for specific tasks
- **Organized**: Logical categorization and easy navigation
- **Maintainable**: Update individual rules without affecting others
- **Comprehensive**: Complete coverage of coding standards
- **Battle-Tested**: Derived from successful real-world implementations
- **Consistent**: Enforces architectural patterns across entire codebase

## 🎓 **Implementation History**

These rules were derived from successful reorganization of:

- **Layer Management Widget**: Refactored from 5 monolithic files (2,786 lines) to 16 focused modules
- **Map System Architecture**: Established patterns for file organization and component extraction
- **State Management**: Developed context provider patterns and store organization
- **Type Safety**: Created union literal patterns and Zod validation approaches
- **Code Quality**: Developed error handling, testing, and compliance patterns

## 📈 **Success Metrics**

- **File Size Compliance**: Target sizes met across all categories
- **Single Responsibility**: Each file has one clear purpose
- **Maintainability**: Changes isolated to specific domains
- **Developer Experience**: Faster navigation and comprehension
- **Type Safety**: Runtime and compile-time validation patterns
- **Code Quality**: Comprehensive coverage of quality concerns

Use these rules to maintain the high code quality and organizational standards established through proven architectural decisions.
