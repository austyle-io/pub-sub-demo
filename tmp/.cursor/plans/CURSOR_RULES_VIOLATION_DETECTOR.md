# Cursor Rules Violation Detection & Fix System

## 🚨 CRITICAL: Run this checklist after EVERY code change

### Automated Detection Commands

Run these grep searches to find violations automatically:

#### 1. **BANNED: Switch Statements** (enum-object-pattern.md)

```bash
# Search for switch statements (ZERO TOLERANCE)
grep -r "switch\s*(" --include="*.ts" --include="*.tsx" src/
grep -r "case\s*['\"]" --include="*.ts" --include="*.tsx" src/
```

#### 2. **BANNED: Interface Declarations** (type-system.md)

```bash
# Search for interface keyword (should use type)
grep -r "interface\s\+[A-Z]" --include="*.ts" --include="*.tsx" src/
grep -r "export\s\+interface" --include="*.ts" --include="*.tsx" src/
```

#### 3. **BANNED: I* and *Interface Naming** (type-system.md)

```bash
# Search for I* naming patterns
grep -r "\bI[A-Z][a-zA-Z]*\b" --include="*.ts" --include="*.tsx" src/
# Search for *Interface suffixes
grep -r "[A-Z][a-zA-Z]*Interface\b" --include="*.ts" --include="*.tsx" src/
```

#### 4. **BANNED: Function Declarations** (function-style.md)

```bash
# Search for function declarations (should use arrow functions)
grep -r "function\s\+[a-zA-Z]" --include="*.ts" --include="*.tsx" src/
grep -r "export\s\+function" --include="*.ts" --include="*.tsx" src/
```

#### 5. **BANNED: React.FC Usage** (component-patterns.md)

```bash
# Search for React.FC annotation
grep -r "React\.FC" --include="*.tsx" src/
grep -r ": FC<" --include="*.tsx" src/
```

#### 6. **BANNED: Any Types** (type-system.md)

```bash
# Search for any types (should use unknown)
grep -r ":\s*any\b" --include="*.ts" --include="*.tsx" src/
grep -r "<any>" --include="*.ts" --include="*.tsx" src/
```

#### 7. **VIOLATION: Implicit Null Checks** (explicit-vs-implicit.md)

```bash
# Search for implicit checks that should use isNil()
grep -r "if\s*(\s*![a-zA-Z]" --include="*.ts" --include="*.tsx" src/
grep -r "&&\s*![a-zA-Z]" --include="*.ts" --include="*.tsx" src/
grep -r "!.*\.length" --include="*.ts" --include="*.tsx" src/
```

#### 8. **VIOLATION: Manual Type Checks** (explicit-vs-implicit.md)

```bash
# Search for manual type checks (should use lodash)
grep -r "typeof.*===.*string" --include="*.ts" --include="*.tsx" src/
grep -r "typeof.*===.*object" --include="*.ts" --include="*.tsx" src/
grep -r "Array\.isArray" --include="*.ts" --include="*.tsx" src/
```

#### 9. **VIOLATION: Mock Data in Production** (no-mock-data.md)

```bash
# Search for mock data in production components
grep -r "mock[A-Z]" --include="*.ts" --include="*.tsx" src/
grep -r "Mock[A-Z]" --include="*.ts" --include="*.tsx" src/
grep -r "MOCK_" --include="*.ts" --include="*.tsx" src/
```

#### 10. **VIOLATION: Default Imports** (imports.md)

```bash
# Search for incorrect React default imports
grep -r "import React from" --include="*.tsx" src/
# Search for lodash default imports
grep -r "import _ from" --include="*.ts" --include="*.tsx" src/
```

#### 11. **VIOLATION: Wrong File Extensions** (naming-conventions.md)

```bash
# Find component files without .tsx extension
find src/ -name "*.ts" -exec grep -l "export.*=.*(" {} \; | grep -v ".test.ts" | grep -v ".spec.ts"
```

#### 12. **VIOLATION: Ternary for Simple Conditionals** (react-specific.md)

```bash
# Search for ternary operators that should use logical AND
grep -r "?\s*<.*>\s*:\s*null" --include="*.tsx" src/
grep -r "?\s*<.*>\s*:\s*undefined" --include="*.tsx" src/
```

### Manual Review Checklist

#### Type System Violations

- [ ] No `interface` declarations - all should be `type`
- [ ] No `I*` or `*Interface` naming patterns
- [ ] No `any` types - use `unknown` instead
- [ ] No `React.FC` annotations on components
- [ ] All union literals use `as const` pattern

#### Function & Component Violations

- [ ] No function declarations - use arrow functions
- [ ] Components use arrow function syntax
- [ ] Props explicitly typed with dedicated type definitions
- [ ] Event handlers: props use `on*`, internal use `handle*`

#### Import/Export Violations

- [ ] React uses named imports (`import { useState }`)
- [ ] Lodash uses named imports (`import { isNil }`)
- [ ] No default exports for components/utilities
- [ ] Imports organized: external first, then internal

#### Logic Pattern Violations

- [ ] No switch statements - use enum-object lookup pattern
- [ ] Use `isNil()` for null/undefined checks, not `!value`
- [ ] Use `isEmpty()` for array/object checks, not `.length === 0`
- [ ] Use lodash type checkers (`isString`) not manual checks
- [ ] Use logical AND (`&&`) for simple conditionals, not ternary

#### File Organization Violations

- [ ] Components use PascalCase.tsx
- [ ] Hooks use camelCase.ts
- [ ] Other files use kebab-case.ts
- [ ] No files exceed size limits (components: 100 lines, utils: 200 lines)
- [ ] Utilities organized by domain, not technical type

#### Data Pattern Violations

- [ ] No mock data in production components
- [ ] Mock data only in demo components, tests, and stories
- [ ] Use `undefined` for optionality, `null` for explicit empty values
- [ ] Proper loading states instead of mock data

### Quick Fix Scripts

#### Convert Interface to Type

```bash
# Find and replace interface declarations
sed -i 's/interface \([A-Z][a-zA-Z]*\)/type \1 =/g' src/**/*.ts src/**/*.tsx
```

#### Convert Function Declarations to Arrow Functions

```bash
# Manual conversion required - too complex for regex
# Use IDE refactoring tools
```

#### Fix Implicit Null Checks

```bash
# Replace common patterns (manual review required)
# !value -> isNil(value)
# !array.length -> isEmpty(array)
```

## 🔄 Recursive Fix Process

1. **Run all automated detection commands**
2. **Fix violations found**
3. **Run commands again until zero violations**
4. **Perform manual review checklist**
5. **Re-run automated commands to verify**
6. **Run TypeScript compiler check**
7. **Repeat until clean**

## 📋 Code Review Integration

### Before Merging Any PR

```bash
# Run complete violation check
./scripts/check-cursor-violations.sh
```

### After Any Code Change

```bash
# Quick violation check on changed files
git diff --name-only | grep -E '\.(ts|tsx)$' | xargs -I {} sh -c 'echo "Checking {}" && grep -H "switch\|interface\|React\.FC" {}'
```

## 🎯 Integration with Development Workflow

### Pre-commit Hook

```bash
#!/bin/sh
# Add to .git/hooks/pre-commit
echo "🔍 Checking Cursor Rules violations..."
./scripts/check-cursor-violations.sh
if [ $? -ne 0 ]; then
  echo "❌ Cursor Rules violations found. Fix before committing."
  exit 1
fi
```

### VS Code Integration

Add to .vscode/settings.json:

```json
{
    "search.useRegex": true,
    "search.defaultIncludePattern": "*.ts,*.tsx",
    "search.quickOpen.includeSymbols": false
}
```

## 📝 Documentation for Future Self

### Most Critical Violations to Watch

1. **Switch statements** - Absolutely banned, use enum-object pattern
2. **Interface declarations** - Always use `type` instead
3. **Implicit null checks** - Always use `isNil()` explicitly
4. **Manual type checking** - Always use lodash utilities
5. **Mock data in production** - Only in demo/test components

### Common Patterns to Remember

```typescript
// ✅ CORRECT enum-object pattern
const STATUS = { PENDING: "pending", COMPLETE: "complete" } as const;
type Status = (typeof STATUS)[keyof typeof STATUS];
const STATUS_HANDLERS: Record<Status, () => void> = {
  [STATUS.PENDING]: handlePending,
  [STATUS.COMPLETE]: handleComplete,
};

// ✅ CORRECT explicit null checking
if (isNil(value)) return;
if (isEmpty(array)) return;
if (isString(input) && !isEmpty(input.trim())) {
  // process
}

// ✅ CORRECT component pattern
type ComponentProps = { title: string; onClick?: () => void; };
export const Component = ({ title, onClick }: ComponentProps) => {
  const handleClick = () => onClick?.();
  return <button onClick={handleClick}>{title}</button>;
};
```

### Fastest Violation Detection

```bash
# One-liner to catch most violations
grep -r "switch\|interface [A-Z]\|React\.FC\|: any\b\|typeof.*===" --include="*.ts" --include="*.tsx" src/
```
