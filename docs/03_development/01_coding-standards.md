# Coding Standards

This document outlines the coding standards and best practices for this project. Adhering to these standards is crucial for maintaining code quality, consistency, and readability.

## General Principles

- **Clarity over cleverness**: Write code that is easy to understand.
- **Consistency**: Follow the established patterns and conventions of the codebase.
- **Single Responsibility Principle**: Each module, class, or function should have a single, well-defined responsibility.

## TypeScript

- **Strict Mode**: Always use strict mode.
- **`type` over `interface`**: Use `type` for defining all types.
- **No `any`**: The `any` type is forbidden. Use `unknown` and perform type checking.
- **Explicit Return Types**: All functions should have explicit return types.

## React

- **Functional Components**: Use functional components with hooks.
- **Component Naming**: Use PascalCase for component names.
- **Hook Naming**: Custom hooks should be prefixed with `use` (e.g., `useShareDB`).

## Formatting and Linting

- **Biome**: We use Biome for formatting and linting. All code must be formatted by Biome before committing.
- **Configuration**: The Biome configuration is defined in `biome.json`.
- **Pre-commit Hook**: A pre-commit hook is set up to automatically format and lint your code.

## Naming Conventions

- **Variables and Functions**: Use camelCase (e.g., `myVariable`, `myFunction`).
- **Types and Enums**: Use PascalCase (e.g., `MyType`, `MyEnum`).
- **Constants**: Use `UPPER_SNAKE_CASE` (e.g., `MY_CONSTANT`).

## Comments

- **JSDoc**: Use JSDoc for documenting functions, components, and types.
- **Clarity**: Write comments to explain *why* something is done, not *what* is being done.
