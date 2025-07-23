# Documentation Enhancement Guide

## Quick Start

To enhance documentation across the codebase:

```bash
# 1. Analyze current documentation coverage
pnpm run docs:analyze

# 2. View coverage report
pnpm run docs:report

# 3. Run all enhancement phases automatically
pnpm run docs:enhance

# 4. Or run individual phases
pnpm run docs:phase1  # Core utilities
pnpm run docs:phase2  # React components
pnpm run docs:phase3  # Services & API

# 5. Check documentation quality
pnpm run docs:check

# 6. Generate and view documentation
pnpm run docs:generate
pnpm run docs:dev
```

## Documentation Coverage Requirements

Each public API must document:

### Required ✅
- **Purpose**: Brief description
- **Parameters**: All params with types
- **Returns**: Return type and description
- **Since**: Version added
- **Examples**: At least one

### Recommended 📝
- **Throws**: Exceptions and conditions
- **See**: Related references
- **Performance**: O(n) complexity
- **Security**: Validation notes
- **Side Effects**: State changes

### Advanced 🚀
- **Preconditions**: Required state
- **Postconditions**: Guaranteed state
- **Deprecation**: Migration path
- **Author**: Original creator
- **Fire/Listen**: Event handling

## Documentation Templates

See `docs-site/templates/documentation-templates.ts` for comprehensive examples.

### Quick Function Template

```typescript
/**
 * Processes user input and returns formatted result.
 *
 * @param {string} input - Raw user input to process
 * @param {ProcessOptions} options - Processing configuration
 * @returns {ProcessResult} Formatted result with metadata
 *
 * @example
 * ```typescript
 * const result = processInput('Hello', { uppercase: true });
 * console.log(result.value); // 'HELLO'
 * ```
 *
 * @since 1.0.0
 * @see {@link formatOutput} - For output formatting
 */
```

### Quick Component Template

```tsx
/**
 * Displays user profile information with avatar.
 *
 * @param {UserProfileProps} props - Component properties
 * @param {User} props.user - User data to display
 * @param {Function} [props.onEdit] - Edit callback
 * @returns {React.ReactElement} Rendered profile
 *
 * @example
 * ```tsx
 * <UserProfile
 *   user={currentUser}
 *   onEdit={() => navigate('/profile/edit')}
 * />
 * ```
 *
 * @since 1.0.0
 */
```

## Workflow Phases

### Phase 1: Core Utilities 🔧
**Target**: `packages/shared/src/**`
- Type guards and validators
- Authentication utilities
- Core schemas and types
- Error handling
- Logging utilities

### Phase 2: React Components ⚛️
**Target**: `apps/client/src/components/**` & `hooks/**`
- UI components
- Custom hooks
- Context providers
- State machines

### Phase 3: Backend Services 🖥️
**Target**: `apps/server/src/**`
- API routes
- Service classes
- Middleware
- Database utilities

## Quality Standards

### Documentation must be:
1. **Accurate**: Matches actual implementation
2. **Complete**: Covers all parameters/returns
3. **Clear**: Avoids jargon, explains terms
4. **Consistent**: Follows project style
5. **Compilable**: Examples must be valid TypeScript

### Red Flags 🚩
- Generic descriptions like "Handles the request"
- Missing parameter descriptions
- Examples with `...` placeholders
- No `@since` tags
- Broken `@see` references

## Integration with Development

### Pre-commit Hook
```bash
# Add to .git/hooks/pre-commit
pnpm run docs:check || {
  echo "Documentation check failed"
  exit 1
}
```

### PR Workflow
1. Make code changes
2. Run `pnpm run docs:analyze`
3. Add/update documentation
4. Run `pnpm run docs:check`
5. Commit with confidence

### CI/CD Integration
- Automated checks on every PR
- Coverage report in PR comments
- Fails if coverage < 80%
- Auto-generates docs on merge to main

## Common Issues & Solutions

### Issue: "Missing @since tag"
Add version from package.json:
```typescript
/**
 * @since 1.0.0
 */
```

### Issue: "Example has syntax error"
Ensure examples are complete:
```typescript
// ❌ Bad
const result = myFunction(...);

// ✅ Good
const result = myFunction('input', { option: true });
```

### Issue: "Undocumented parameter"
Document all parameters:
```typescript
/**
 * @param {string} name - User's full name
 * @param {UserOptions} [options] - Optional configuration
 */
```

## Progress Tracking

### Documentation Checklist
- [ ] ✅ Phase 1: Core utilities documented
- [ ] ✅ Phase 2: React components documented
- [ ] ✅ Phase 3: Backend services documented
- [ ] ✅ Coverage > 80%
- [ ] ✅ All examples compile
- [ ] ✅ No broken references
- [ ] ✅ Deprecated items have migration paths

### Monitoring Progress
```bash
# Check current coverage
pnpm run docs:report

# See undocumented items
cat docs-site/documentation-coverage-report.json | \
  jq '.undocumented[] | {module, name, kind}'

# Track progress over time
git log --oneline --grep="docs:" | head -10
```

## Resources

- [TSDoc Specification](https://tsdoc.org/)
- [TypeDoc Documentation](https://typedoc.org/)
- [Documentation Templates](./templates/documentation-templates.ts)
- [Review Checklist](./DOCUMENTATION_REVIEW_CHECKLIST.md)

---

Remember: **Documentation is code**. It deserves the same attention to quality, review, and maintenance as the implementation itself.
