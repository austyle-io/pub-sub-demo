# Documentation Review Checklist

Use this checklist when reviewing documentation changes in pull requests.

## PR Size Guidelines

- **Small PR**: 1-5 files, single module/component
- **Medium PR**: 6-15 files, related functionality
- **Large PR**: 16+ files (should be split)

## Documentation Completeness Checklist

### ✅ Required Elements

- [ ] **Description**: Clear, concise explanation of purpose
- [ ] **Parameters**: All parameters documented with types and descriptions
- [ ] **Returns**: Return type and description (if applicable)
- [ ] **Examples**: At least one working example
- [ ] **Since**: Version when added (use package.json version)

### 📝 Recommended Elements

- [ ] **Throws**: All exceptions documented with conditions
- [ ] **See**: Links to related items
- [ ] **Performance**: Complexity and optimization notes
- [ ] **Security**: Input validation and security considerations
- [ ] **Side Effects**: State mutations, I/O operations

### 🎯 Quality Checks

- [ ] **Grammar**: Proper spelling and grammar
- [ ] **Clarity**: Avoids jargon, explains technical terms
- [ ] **Consistency**: Follows project style guide
- [ ] **Accuracy**: Information is correct and up-to-date
- [ ] **Examples Compile**: Code examples are valid TypeScript

## Style Guidelines

### Description Format

```typescript
/**
 * Brief one-line description ending with period.
 * 
 * @description
 * Detailed multi-paragraph explanation. The first paragraph should
 * expand on the brief description. Subsequent paragraphs can provide
 * more context, implementation details, or usage guidelines.
 */
```

### Parameter Documentation

```typescript
/**
 * @param {string} name - Description starting with lowercase
 * @param {Options} options - Configuration object
 * @param {boolean} [options.cache=true] - Optional with default
 * @param {number} options.timeout - Required nested property
 */
```

### Example Format

```typescript
/**
 * @example
 * ```typescript
 * // Single-line example
 * const result = myFunction('input');
 * 
 * // Multi-line example with context
 * const config = { cache: false };
 * const result = await myFunction('input', config);
 * console.log(result);
 * ```
 */
```

## Review Comments Templates

### 🟢 Approval Comments

```
LGTM! Documentation is comprehensive and follows our standards.

Particularly appreciate:
- Clear examples
- Security considerations
- Performance notes
```

### 🟡 Minor Issues

```
Documentation looks good overall. A few minor suggestions:

1. Add `@since` tag for version tracking
2. Include error handling in the example
3. Link to related `XyzService` in `@see` tag
```

### 🔴 Needs Changes

```
Thanks for adding documentation! Please address these items:

**Required:**
- Missing `@param` for `options.timeout` parameter
- Example code has syntax error on line 3
- Return type description is unclear

**Recommended:**
- Add `@throws` for the ValidationError case
- Include performance implications of large datasets
```

## Automated Checks

Before approving, ensure CI passes:

- [ ] TypeDoc generates without warnings
- [ ] Documentation coverage ≥ 80%
- [ ] No broken `@see` references
- [ ] Examples compile successfully

## Phase-Specific Guidelines

### Phase 1: Core Utilities
- Focus on type safety documentation
- Include validation rules
- Document error conditions thoroughly

### Phase 2: React Components
- Include accessibility notes
- Document prop validation
- Add Storybook links if available

### Phase 3: API/Services
- Document request/response formats
- Include authentication requirements
- Note rate limiting and quotas

## Escalation Path

1. **Minor issues**: Comment and approve
2. **Major issues**: Request changes
3. **Unclear requirements**: Tag technical lead
4. **Architecture questions**: Schedule design review

## Documentation Debt Tracking

If documentation can't be completed in current PR:

1. Create GitHub issue with `documentation` label
2. Add `TODO(#issue-number):` comment in code
3. Link issue in PR description
4. Set milestone for completion

---

Remember: Good documentation is an investment in our team's future productivity!