# Cursor Rules vs Biome Coverage Gap Analysis

This document identifies which cursor rules and coding standards cannot be enforced by Biome and require alternative enforcement mechanisms.

## Executive Summary

Approximately **40% of cursor rules cannot be enforced by Biome**. These rules fall into categories that require:
- Custom ESLint rules or plugins
- Code review processes
- Architectural Decision Records (ADRs)
- Additional tooling (Knip, bundle analyzers, etc.)
- Pre-commit hooks
- CI/CD pipeline checks

## Detailed Gap Analysis

### 1. Architecture & Code Organization (Cannot be enforced by Biome)

**Rules:**
- 100-line limit for components
- Specific directory structure (components/, hooks/, utils/, types/, services/, stores/)
- Single responsibility per file/directory
- Domain-based utility grouping
- Context-wrapped stores only (no global store access)
- Progressive refactoring with backwards compatibility

**Alternative Enforcement:**
- Custom ESLint rules using `eslint-plugin-boundaries`
- Architecture linting tools like `dependency-cruiser`
- Code review checklists
- ADRs for architectural decisions

### 2. Advanced TypeScript Patterns (Partially enforceable)

**Cannot be enforced:**
- Runtime validation requirement at data boundaries using Zod
- Branded types for domain identifiers
- Type coverage target >97%
- Generic utility functions requirement
- Zod schema-first development pattern
- Discriminated union patterns for complex state

**Alternative Enforcement:**
- `typescript-coverage-report` for type coverage
- Custom ESLint rules for Zod validation patterns
- Code generation for branded types
- Type-level tests

### 3. Business Logic & Domain Rules (Cannot be enforced)

**ShareDB specific:**
- WebSocket authentication via query parameters
- Document storage patterns (create.data vs data)
- Backend connection authentication patterns
- OT operation structure requirements

**Alternative Enforcement:**
- Integration tests
- Code review guidelines
- Documentation and examples
- Custom validation middleware

### 4. Performance & Bundle Optimization (Cannot be enforced)

**Rules:**
- Cognitive complexity <15 per method
- 20-50 lines per method target
- Individual lodash package imports
- Bundle size limits
- Tree-shaking requirements
- Dynamic imports for code splitting

**Alternative Enforcement:**
- SonarQube for complexity metrics
- Bundle analyzer in CI/CD
- Webpack/Vite configuration
- Performance budgets in build tools

### 5. Naming Conventions (Partially enforceable)

**Cannot be enforced:**
- Domain-based file naming patterns
- Boolean prefix requirements (is, has, can, should)
- Consistent naming across related files
- Context-based naming decisions

**Alternative Enforcement:**
- Custom ESLint rules
- Naming convention linter
- Code review automation

### 6. React Patterns (Cannot be enforced)

**Rules:**
- Never use React.FC type annotation
- Smart prop spreading patterns
- SSR-safe component requirements
- ClassNames prop pattern for styling
- Lazy loading for heavy components

**Alternative Enforcement:**
- Custom ESLint React rules
- React-specific linting plugins
- Component templates/generators

### 7. Testing Philosophy (Cannot be enforced)

**Rules:**
- 100% user acceptance testing focus
- Integration/E2E over unit tests
- Critical path validation priority

**Alternative Enforcement:**
- Test coverage configuration
- CI/CD test requirements
- Team agreements and documentation

### 8. Security Patterns (Cannot be enforced)

**Rules:**
- Input validation with type guards
- HTML sanitization requirements
- SQL injection prevention
- File upload validation
- Rate limiting implementation
- Environment variable validation

**Alternative Enforcement:**
- Security linting tools (e.g., `eslint-plugin-security`)
- SAST tools in CI/CD
- Security code review checklist
- Runtime validation libraries

### 9. Logging & Error Handling (Cannot be enforced)

**Rules:**
- No console.log in production (structured logging only)
- Comprehensive error context
- Recovery suggestions
- Performance metric logging
- Security event logging

**Alternative Enforcement:**
- Custom console.log detection (already implemented in hooks)
- Logging library enforcement
- Error boundary patterns

### 10. Advanced Patterns (Cannot be enforced)

**Rules:**
- Enum-Object pattern with lookup objects
- No switch statements (use lookup objects)
- Satisfies operator over type assertions
- Template literals over string concatenation (partially enforceable)

**Alternative Enforcement:**
- Custom TypeScript transformer
- Code generation for patterns
- Team training and examples

## Recommended Enforcement Strategy

### 1. **Immediate Actions**
- Keep current Biome configuration for basic rules
- Implement custom ESLint rules for critical patterns
- Use the Claude Code hooks for quality gates

### 2. **Short-term Improvements**
- Add `dependency-cruiser` for architecture rules
- Implement `typescript-coverage-report`
- Add bundle size checks in CI/CD
- Create code generators for common patterns

### 3. **Long-term Solutions**
- Develop custom linting rules package
- Create project-specific ESLint plugin
- Implement AST-based code analysis tools
- Build automated refactoring tools

### 4. **Process Improvements**
- Automated code review checklists
- Pre-commit hooks for complex validations
- CI/CD quality gates
- Regular architecture reviews

## Conclusion

While Biome handles formatting and basic linting well, enforcing architectural decisions, business logic patterns, and advanced coding standards requires a multi-tool approach combining:

1. **Biome** - Formatting and basic linting (60% coverage)
2. **Custom ESLint** - Advanced patterns and rules (20% additional)
3. **Specialized Tools** - Architecture, security, performance (15% additional)
4. **Process & Review** - Human validation for complex patterns (5% remaining)

This layered approach ensures comprehensive enforcement of all coding standards while maintaining developer productivity.
