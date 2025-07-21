## Project Context & Coding Standards

This document outlines the critical coding standards, patterns, and architectural rules for this project. Adherence to these guidelines is mandatory to ensure code quality, maintainability, and consistency.

### Core Principles

- **pnpm is mandatory**: Never use `npm` or `yarn`. Use `pnpm dlx` instead of `npx`.
- **Type Safety is Paramount**: `any` is forbidden. Use `unknown` with type guards. Zod is used for runtime validation at all data boundaries.
- **`type` over `interface`**: Always use `type` for defining object shapes.
- **`satisfies` over Duck Typing**: Use the `satisfies` operator to ensure type compatibility without losing literal type information. Avoid duck typing.
- **Lodash-First**: Use `lodash-es` for utility functions over manual implementations for consistency and reliability.
- **Constants for Literals**: Use `as const` on objects to create union literals and runtime constants.
- **Arrow Functions**: Prefer arrow functions for components and general use. Use function declarations only when `this` context is needed.
- **Error Handling**: Use `react-error-boundary` and provide detailed, typed errors.

---

### Package Management & Imports

- **Package Manager**: Use `pnpm` exclusively.
- **Execution**: Use `pnpm dlx` for running packages (e.g., `pnpm dlx shadcn@latest add button`).
- **Import Order**: 
    1. External dependencies (e.g., `react`, `lodash-es`)
    2. Internal utilities and config (e.g., `@/lib/utils`, `@/lib/config`)
    3. Internal components
    4. Type imports (`import type ...`)
- **Exports**: Prefer named exports. Use barrel exports (`index.ts`) to create clean public APIs for modules.
- **Lodash**: Import specific functions from `lodash-es` for tree-shaking (e.g., `import { isEmpty } from 'lodash-es'`).

---

### TypeScript & Type Safety

- **`type` vs `interface`**: Always use `type`. No `I*` or `*Interface` prefixes.
- **`any` vs `unknown`**: `any` is forbidden in production code. Use `unknown` for data from external sources and narrow with type guards.
- **Type Guards**: Use Zod for complex validation (`z.infer` to derive types). For simpler checks, use `lodash` type checkers (`isString`, `isObject`, etc.).
- **`satisfies` Operator**: Use `satisfies` to check object conformity to a type without losing literal type information. This is preferred over type assertions (`as Type`).
- **Double Assertions**: `as unknown as Type` is strictly forbidden. Use a proper type guard.
- **Error Suppressions**: All `@ts-expect-error` or `eslint-disable` comments must have a clear justification.
- **Global Types**: Never access `window` or `document` directly. Use the provided global utilities (`isClientSide`, `getGlobalVariable`) to ensure SSR compatibility.

---

### Coding Patterns

- **Function Style**: Use arrow functions. Use implicit returns for single-line functions and explicit returns for multi-line functions.
- **Logical Operators**: Use nullish coalescing (`??`) for default values. `||` is for boolean logic only. Use optional chaining (`?.`) for safe access to potentially null/undefined properties.
- **`null` vs `undefined`**: Use `undefined` for optionality (e.g., optional props). Use `null` for explicitly empty values (e.g., clearing a selection in state). Use `isNil()` from lodash to check for both.
- **Object & Array Literals**: Use trailing commas in multi-line literals. Use property shorthand (`{ name }` instead of `{ name: name }`).
- **Constants**: Use `SCREAMING_SNAKE_CASE` for constants. For union literals, use an object with `as const` (e.g., `export const STATUS = { PENDING: 'pending' } as const;`).
- **Destructuring**: Prefer destructuring for accessing object properties.
- **Template Literals**: Use template literals for string construction over concatenation.
- **Async/Await**: Prefer `async/await` over `.then()` chains.

---

### React & Component Patterns

- **Component Definition**: Use arrow functions. Do not use `React.FC`.
- **Props**: Define props with a `type` alias. Use descriptive names and provide sensible defaults. Use `{...props}` spreading only for wrapper components.
- **Event Handlers**: Props for event handlers should be prefixed with `on` (e.g., `onClick`). Internal handler functions should be prefixed with `handle` (e.g., `handleClick`).
- **Conditional Rendering**: Use logical AND (`&&`) for simple conditional rendering. Use ternaries for if-else logic.
- **Styling**: Use Tailwind CSS with a utility-first approach. Avoid component-level styles (e.g., styled-components).
- **Component Size**: Keep components small (50-150 lines). Extract complex logic into custom hooks and complex JSX into sub-components.
- **Composition**: Prefer composition over inheritance.

---

### Quality & Maintenance

- **Testing**: 
    - Use `pnpm test:safe` to run tests with a timeout.
    - Use factory functions (e.g., `createUser()`) in `__tests__/factories/` to generate type-safe test data. Do not use `as const` for test data objects.
    - For BDD tests with QuickPickle, the `world` object is the first parameter to step definitions, not `this`.
- **Error Handling**:
    - Use `react-error-boundary` for component-level error boundaries.
    - Use typed errors and provide meaningful, user-friendly error messages.
    - Log complete error details for debugging.
- **Documentation**: 
    - Use JSDoc for documenting functions, components, and types.
    - Include `@fileoverview` for file-level documentation.
    - Focus on *why* not *what*. Explain complex logic.
- **Performance**:
    - Use `memo` for expensive components.
    - Use `lazy` for code-splitting and lazy loading large components.
    - Use virtualization for large lists.
- **SonarQube Compliance**:
    - Extract magic strings and numbers into named constants.
    - Mark never-reassigned class members as `readonly`.
    - Justify `NOSONAR` comments clearly.

---

### Domain-Specific Patterns (Map & Widget)

- **Map Types**: Use `Map*` prefix (e.g., `MapConfig`, `MapState`).
- **Widget Types**: Use `Widget*` prefix (e.g., `WidgetConfig`, `WidgetEvent`).
- **Layer Types**: Use `Layer*` prefix (e.g., `LayerConfig`, `LayerEvent`).
- **Component Naming**: Use specific names (e.g., `LayerManagementWidget`) instead of generic ones (`CustomWidget`).