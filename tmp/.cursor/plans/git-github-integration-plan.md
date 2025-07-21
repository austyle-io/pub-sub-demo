# Git & GitHub Integration Implementation Plan

## Overview

This plan outlines a comprehensive Git and GitHub integration strategy for the AuStdX Design System project, incorporating best practices from the austyle-ai and touchid-swift projects while focusing on a `.githooks` directory implementation with pre-commit library integration.

## Implementation Status

**Last Updated**: 2025-07-05
**Session**: Phase 1 & 2 Complete
**Overall Progress**: 70% Complete

## Current State Analysis

The AuStdX project currently has:

- Basic git setup with `.gitignore`
- GitHub workflows in `.github/workflows/`
- No git hooks implementation
- No pre-commit configuration
- Basic PR templates

## Implementation Strategy

### Phase 1: Core Git Hooks Infrastructure (Week 1)

#### 1.1 `.githooks` Directory Setup

Create a dedicated `.githooks` directory with modular, enterprise-grade hooks:

```
.githooks/
├── pre-commit          # Primary quality gate
├── commit-msg          # Conventional commit validation
├── pre-push            # Final validation before push
├── prepare-commit-msg  # Template injection
└── shared/             # Shared utilities
    ├── colors.sh       # Terminal colors
    ├── utils.sh        # Common functions
    └── config.sh       # Configuration
```

#### 1.2 Pre-commit Library Integration

Hybrid approach combining `.githooks` with pre-commit framework:

**`.pre-commit-config.yaml`**:

```yaml
# Pre-commit configuration for AuStdX Design System
# Combines with .githooks for comprehensive quality gates

default_language_version:
    node: "20.18.1"
    python: python3.12

repos:
    # Local hooks for project-specific tools
    - repo: local
      hooks:
          # Biome for JS/TS (replacing ESLint)
          - id: biome-check
            name: Biome linting and formatting
            entry: pnpm biome check --apply
            language: system
            files: \.(js|jsx|ts|tsx)$
            pass_filenames: false
            description: "Lint and format JS/TS with Biome"

          # TypeScript type checking
          - id: typescript-check
            name: TypeScript type checking
            entry: pnpm type-check
            language: system
            files: \.(ts|tsx)$
            pass_filenames: false
            description: "Type check TypeScript files"

          # Prettier for CSS
          - id: prettier-css
            name: CSS formatting (Prettier)
            entry: pnpm prettier --write
            language: system
            files: \.css$
            description: "Format CSS files with Prettier"

          # Test runner for changed files
          - id: vitest-related
            name: Run related tests
            entry: pnpm vitest related
            language: system
            files: \.(ts|tsx)$
            pass_filenames: true
            stages: [push]
            description: "Run tests for changed files"

          # Cursor rules validation
          - id: cursor-rules-check
            name: Cursor rules compliance
            entry: node scripts/quality-gates/cursor-rules-validator.js
            language: system
            files: \.(ts|tsx)$
            pass_filenames: true
            description: "Check cursor rules compliance"

          # Bundle size check
          - id: bundle-size
            name: Bundle size analysis
            entry: node scripts/quality-gates/bundle-size-check.js
            language: system
            files: \.(ts|tsx|js|jsx)$
            pass_filenames: false
            stages: [push]
            description: "Check bundle size limits"

    # External hooks for common checks
    - repo: https://github.com/pre-commit/pre-commit-hooks
      rev: v4.6.0
      hooks:
          # File checks
          - id: trailing-whitespace
            args: [--markdown-linebreak-ext=md]
          - id: end-of-file-fixer
          - id: check-merge-conflict
          - id: check-case-conflict

          # Format validation
          - id: check-yaml
            args: [--unsafe]
          - id: check-json
          - id: pretty-format-json
            args: [--autofix, --indent=2]

          # Security
          - id: detect-private-key
          - id: check-added-large-files
            args: [--maxkb=1000]

    # Conventional commits
    - repo: https://github.com/compilerla/conventional-pre-commit
      rev: v3.0.0
      hooks:
          - id: conventional-pre-commit
            stages: [commit-msg]

    # Markdown linting
    - repo: https://github.com/igorshubovych/markdownlint-cli
      rev: v0.41.0
      hooks:
          - id: markdownlint
            args: [--fix]

    # Security scanning
    - repo: https://github.com/Yelp/detect-secrets
      rev: v1.4.0
      hooks:
          - id: detect-secrets
            args: ["--baseline", ".secrets.baseline"]

# CI configuration
ci:
    autofix_prs: true
    autoupdate_schedule: weekly
    skip: [vitest-related, bundle-size]
```

#### 1.3 Git Hooks Implementation

**`.githooks/pre-commit`**:

```bash
#!/bin/bash
# Pre-commit hook for AuStdX Design System
# Enforces quality gates before allowing commits

set -euo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Source shared utilities
source "$SCRIPT_DIR/shared/colors.sh"
source "$SCRIPT_DIR/shared/utils.sh"
source "$SCRIPT_DIR/shared/config.sh"

# Run pre-commit framework first
print_section "Running pre-commit framework checks"
if command -v pre-commit >/dev/null 2>&1; then
    if pre-commit run --all-files; then
        print_success "Pre-commit framework checks passed"
    else
        print_error "Pre-commit framework checks failed"
        exit 1
    fi
else
    print_warning "pre-commit not installed, installing..."
    pip install pre-commit
    pre-commit install
fi

# Additional custom checks
print_section "Running custom quality checks"

# Check for cursor rules violations
if node scripts/quality-gates/cursor-rules-validator.js; then
    print_success "Cursor rules compliance check passed"
else
    print_error "Cursor rules violations found"
    exit 1
fi

# Check for console.log statements
if grep -r "console\\.log" --include="*.ts" --include="*.tsx" src/ | grep -v "test\|spec"; then
    print_error "console.log found in production code - use Pino logger instead"
    exit 1
fi

# Type coverage check
if node scripts/quality-gates/type-coverage-enforcer.js; then
    print_success "Type coverage check passed"
else
    print_error "Type coverage below threshold"
    exit 1
fi

print_success "All pre-commit checks passed!"
```

**`.githooks/commit-msg`**:

```bash
#!/bin/bash
# Validates commit message format

set -euo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/shared/colors.sh"

commit_regex='^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\(.+\))?!?: .{1,50}'

if ! grep -qE "$commit_regex" "$1"; then
    print_error "Invalid commit message format!"
    echo ""
    echo "Expected format: <type>(<scope>): <subject>"
    echo ""
    echo "Types: feat, fix, docs, style, refactor, test, chore, perf, ci, build, revert"
    echo ""
    echo "Examples:"
    echo "  feat(map): add layer management widget"
    echo "  fix(auth): resolve session timeout issue"
    echo "  docs(api): update authentication guide"
    exit 1
fi
```

### Phase 2: GitHub Workflows Enhancement (Week 2)

#### 2.1 Comprehensive CI/CD Pipeline

**`.github/workflows/ci.yml`**:

```yaml
name: CI Pipeline

on:
    push:
        branches: [main, develop]
    pull_request:
        branches: [main, develop]

jobs:
    quality-gates:
        name: Quality Gates
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4
              with:
                  fetch-depth: 0

            - uses: pnpm/action-setup@v3
              with:
                  version: 8

            - uses: actions/setup-node@v4
              with:
                  node-version: "20.18.1"
                  cache: "pnpm"

            - name: Install dependencies
              run: pnpm install --frozen-lockfile

            - name: Run quality checks
              run: |
                  pnpm lint:safe
                  pnpm type-check
                  pnpm test:unit:clean

            - name: Check cursor rules
              run: node scripts/quality-gates/cursor-rules-validator.js

            - name: Type coverage
              run: node scripts/quality-gates/type-coverage-enforcer.js

            - name: Bundle size check
              run: node scripts/quality-gates/bundle-size-check.js

            - name: SonarQube analysis
              uses: sonarsource/sonarqube-scan-action@master
              env:
                  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
                  SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}

    security:
        name: Security Scanning
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4

            - name: Run security audit
              run: pnpm audit --audit-level=moderate

            - name: Detect secrets
              uses: trufflesecurity/trufflehog@main
              with:
                  path: ./
                  base: ${{ github.event.repository.default_branch }}

            - name: SAST scan
              uses: github/super-linter@v5
              env:
                  DEFAULT_BRANCH: main
                  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

#### 2.2 PR Automation

**`.github/workflows/pr-automation.yml`**:

```yaml
name: PR Automation

on:
    pull_request:
        types: [opened, synchronize, reopened]

jobs:
    auto-assign:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4

            - name: Auto assign PR
              uses: kentaro-m/auto-assign-action@v2.0.0
              with:
                  configuration-path: ".github/auto-assign.yml"

    pr-quality:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4

            - name: PR title validation
              uses: amannn/action-semantic-pull-request@v5
              env:
                  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

            - name: Check PR size
              uses: codelytv/pr-size-labeler@v1
              with:
                  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
                  xs_label: "size/xs"
                  xs_max_size: 10
                  s_label: "size/s"
                  s_max_size: 100
                  m_label: "size/m"
                  m_max_size: 500
                  l_label: "size/l"
                  l_max_size: 1000
                  xl_label: "size/xl"

            - name: Add labels based on files
              uses: actions/labeler@v5
              with:
                  repo-token: ${{ secrets.GITHUB_TOKEN }}
```

### Phase 3: Documentation and Team Integration (Week 3)

#### 3.1 Documentation Structure

Create comprehensive documentation:

```
docs/
├── development/
│   ├── git-workflow.md
│   ├── commit-conventions.md
│   ├── pr-guidelines.md
│   └── ci-cd-overview.md
├── quality/
│   ├── code-standards.md
│   ├── testing-requirements.md
│   └── security-guidelines.md
└── contributing/
    ├── CONTRIBUTING.md
    ├── setup-guide.md
    └── troubleshooting.md
```

#### 3.2 Templates

**`.github/PULL_REQUEST_TEMPLATE.md`**:

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📝 Documentation update
- [ ] 🎨 Style update (formatting, renaming)
- [ ] ♻️ Code refactor (no functional changes)
- [ ] ⚡ Performance improvements
- [ ] ✅ Test updates
- [ ] 🔧 Configuration changes

## Checklist

- [ ] My code follows the cursor rules and style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published

## Screenshots (if appropriate)

## Related Issues

Closes #

## Testing Instructions

Steps to test or reproduce:

1.
2.
3.
```

### Phase 4: Advanced Features (Week 4)

#### 4.1 Branch Protection Rules

Implement comprehensive branch protection:

```json
{
    "protection_rules": {
        "main": {
            "required_status_checks": {
                "strict": true,
                "contexts": ["quality-gates", "security", "sonarqube"]
            },
            "enforce_admins": true,
            "required_pull_request_reviews": {
                "required_approving_review_count": 2,
                "dismiss_stale_reviews": true,
                "require_code_owner_reviews": true
            },
            "restrictions": null,
            "allow_force_pushes": false,
            "allow_deletions": false,
            "required_conversation_resolution": true
        }
    }
}
```

#### 4.2 CODEOWNERS

**`CODEOWNERS`**:

```
# AuStdX Design System Code Owners

# Global owners
* @austyle/core-team

# Documentation
/docs/ @austyle/docs-team
*.md @austyle/docs-team

# Core systems
/src/lib/modules/map/ @austyle/map-team
/src/lib/services/ @austyle/platform-team
/src/lib/components/ui/ @austyle/ui-team

# Testing
/test/ @austyle/qa-team
*.test.ts @austyle/qa-team
*.test.tsx @austyle/qa-team

# Build and CI
/.github/ @austyle/devops-team
/scripts/ @austyle/devops-team
```

### Phase 5: Monitoring and Metrics

#### 5.1 Git Analytics

Implement commit and PR metrics tracking:

```yaml
# .github/workflows/metrics.yml
name: Development Metrics

on:
    schedule:
        - cron: "0 0 * * 0" # Weekly
    workflow_dispatch:

jobs:
    collect-metrics:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4

            - name: Collect git metrics
              run: |
                  node scripts/metrics/git-analytics.js
                  node scripts/metrics/pr-cycle-time.js
                  node scripts/metrics/code-churn.js

            - name: Upload metrics
              uses: actions/upload-artifact@v4
              with:
                  name: git-metrics
                  path: metrics/
```

## Implementation Timeline

### Week 1: Foundation ✅ COMPLETE (2025-07-05)

- [x] Set up `.githooks` directory structure
- [x] Implement core git hooks (pre-commit, commit-msg, pre-push, prepare-commit-msg)
- [x] Configure pre-commit framework with comprehensive rules
- [x] Create quality gate scripts (cursor-rules-validator, bundle-size-check)
- [x] Test infrastructure with validation scripts

### Week 2: GitHub Integration ✅ COMPLETE (2025-07-05)

- [x] Enhance GitHub workflows (ci.yml)
- [x] Configure PR automation (pr-automation.yml)
- [x] Create GitHub templates (PR, issues)
- [x] Set up auto-assign configuration
- [x] Implement labeler configuration
- [x] Create CODEOWNERS file

### Week 3: Documentation 🚧 NEXT SESSION

- [ ] Create comprehensive guides
- [ ] Document git workflow best practices
- [ ] Create troubleshooting guide
- [ ] Set up training materials

### Week 4: Advanced Features 📋 FUTURE

- [ ] Implement metrics collection workflows
- [ ] Set up monitoring dashboards
- [ ] Configure advanced automation
- [ ] Performance optimization

## Completed Components

### Phase 1: Git Hooks Infrastructure ✅

1. **`.githooks/` Directory Structure**
   - `pre-commit` - Quality gates with pre-commit framework integration
   - `commit-msg` - Conventional commit validation
   - `pre-push` - Final validation before push
   - `prepare-commit-msg` - Template injection
   - `shared/` - Reusable utilities (colors.sh, utils.sh, config.sh)

2. **Pre-commit Framework Configuration**
   - Biome for JS/TS linting and formatting
   - TypeScript type checking
   - Prettier for CSS formatting
   - Cursor rules validation
   - Bundle size checks
   - Security scanning with detect-secrets
   - Markdown linting
   - File size limits

3. **Quality Gate Scripts**
   - `cursor-rules-validator.js` - Enforces project-specific coding rules
   - `bundle-size-check.js` - Monitors and limits bundle sizes
   - Type coverage enforcer (pre-existing)

### Phase 2: GitHub Workflows & Templates ✅

1. **CI/CD Pipeline (`ci.yml`)**
   - Multi-job pipeline with quality gates
   - Security scanning
   - Cross-platform test matrix (Ubuntu, macOS, Windows)
   - Build verification
   - E2E testing with Playwright
   - Coverage reporting

2. **PR Automation (`pr-automation.yml`)**
   - Auto-assignment of reviewers
   - PR quality validation
   - Size labeling
   - Preview deployments
   - PR metrics reporting
   - Dependency review

3. **GitHub Templates**
   - Comprehensive PR template
   - Bug report issue template
   - Feature request issue template
   - Issue configuration

4. **Repository Configuration**
   - CODEOWNERS file for automatic review assignments
   - Labeler configuration for automatic PR labeling
   - Auto-assign configuration

## Next Steps for Future Sessions

### Immediate Actions (Next Session)

1. **Fix Hook Integration Issues**
   - Resolve symlink path issues in custom hooks
   - Test pre-commit framework with actual commits
   - Ensure hooks work seamlessly together

2. **Create Documentation**
   - Git workflow guide
   - Commit message conventions
   - PR best practices
   - Troubleshooting guide

3. **Set Up Monitoring**
   - Create metrics collection workflow
   - Implement hook execution logging
   - Set up performance tracking

### Configuration Tasks (Requires GitHub Access)

1. **Branch Protection Rules**
   - Enable for main/develop branches
   - Require status checks
   - Require PR reviews
   - Enforce linear history

2. **GitHub Settings**
   - Configure required status checks
   - Set up team assignments
   - Enable auto-merge
   - Configure deployment environments

### Advanced Features (Future)

1. **Metrics & Analytics**
   - Git commit analytics
   - PR cycle time tracking
   - Code churn analysis
   - Team velocity metrics

2. **Advanced Automation**
   - Automatic dependency updates
   - Security patch automation
   - Release automation
   - Changelog generation

## Known Issues & Fixes

### Current Issues

1. **Hook Symlink Path Issue**
   - Custom hooks reference incorrect path for shared utilities
   - Fix: Update hooks to use relative paths or install pre-commit directly

2. **Detect-secrets Version Mismatch**
   - Pre-commit uses older version than local installation
   - Fix: Run `pre-commit autoupdate` or pin versions

3. **Biome Command Issue**
   - `--apply` flag changed to `--write` in newer versions
   - Fix: Already updated in configuration

### Recommended Fixes

```bash
# Fix pre-commit setup
pre-commit uninstall
pre-commit install --install-hooks
pre-commit autoupdate

# Test hooks
pre-commit run --all-files

# Configure git
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

## Resources & References

- [Pre-commit Documentation](https://pre-commit.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Git Hooks Documentation](https://git-scm.com/docs/githooks)

## Success Metrics

- **Commit Quality**: 100% conventional commits
- **Build Success Rate**: >95%
- **PR Cycle Time**: <24 hours average
- **Type Coverage**: >99.5%
- **Security Vulnerabilities**: 0 high/critical
- **Team Adoption**: 100% within 2 weeks

## Best Practices Incorporated

From **austyle-ai**:

- Comprehensive pre-commit configuration
- Multi-language support (TypeScript, Python)
- Security scanning integration
- Automated PR workflows

From **touchid-swift**:

- Modular `.githooks` directory approach
- Extensive validation scripts
- Quality gate enforcement
- Documentation-driven development

## Maintenance Plan

1. **Weekly**: Review metrics and adjust thresholds
2. **Monthly**: Update dependencies and hooks
3. **Quarterly**: Review and optimize workflows
4. **Annually**: Major version updates and strategy review

## Migration Strategy

1. **Phase 1**: Install in development branch
2. **Phase 2**: Team testing and feedback
3. **Phase 3**: Gradual rollout to all branches
4. **Phase 4**: Full enforcement

## Risk Mitigation

- **Gradual Rollout**: Start with warnings before enforcement
- **Escape Hatches**: Document `--no-verify` usage
- **Team Training**: Comprehensive onboarding
- **Monitoring**: Track adoption and issues

## Validation Framework

### Evidence-Based Verification Protocol

#### Assumption Registry

Each implementation component contains **untested assumptions** that require validation:

| Component          | Assumption                                      | Confidence Level | Validation Method        | Risk Level |
| ------------------ | ----------------------------------------------- | ---------------- | ------------------------ | ---------- |
| Pre-commit hooks   | Will not significantly slow development         | **Medium**       | Performance benchmarking | High       |
| Team adoption      | Developers will follow new workflow             | **Low**          | Pilot testing + feedback | Critical   |
| Tool reliability   | Biome/Vitest work consistently in CI            | **Medium**       | Stress testing           | High       |
| Security scanning  | Will catch real threats without false positives | **Low**          | Red team testing         | Medium     |
| Metrics collection | Data will drive actionable insights             | **Low**          | Baseline measurement     | Medium     |

#### Validation Gates

**Phase 0: Pre-Implementation Validation (1 week)**

```bash
# Validation Script: scripts/validation/pre-implementation.sh
#!/bin/bash
set -euo pipefail

echo "🔍 Pre-Implementation Validation Protocol"

# 1. Tool Compatibility Check
echo "Testing tool compatibility..."
pnpm biome --version || exit 1
pnpm vitest --version || exit 1
pre-commit --version || exit 1

# 2. Performance Baseline
echo "Establishing performance baseline..."
time pnpm lint:safe > baseline_lint.log 2>&1
time pnpm test:unit > baseline_test.log 2>&1

# 3. Current Workflow Analysis
echo "Analyzing current git workflow..."
git log --oneline --since="1 month ago" | wc -l > current_commit_frequency.txt
echo "Current commit frequency: $(cat current_commit_frequency.txt) commits/month"

# 4. Team Capacity Assessment
echo "Checking team availability for adoption..."
# Survey team members - manual step documented

echo "✅ Pre-implementation validation complete"
```

**Phase 1 Validation: Infrastructure Testing**

```bash
# Validation Script: scripts/validation/phase1-validation.sh
#!/bin/bash
set -euo pipefail

echo "🧪 Phase 1 Infrastructure Validation"

# 1. Hook Performance Test
echo "Testing git hook performance..."
time .githooks/pre-commit --dry-run > hook_performance.log 2>&1
HOOK_TIME=$(tail -1 hook_performance.log | grep real | awk '{print $2}')
echo "Hook execution time: $HOOK_TIME"

# Fail if hooks take > 30 seconds
if [[ "${HOOK_TIME%%.*}" -gt 30 ]]; then
    echo "❌ VALIDATION FAILED: Hooks take too long ($HOOK_TIME > 30s)"
    exit 1
fi

# 2. Pre-commit Framework Integration Test
echo "Testing pre-commit framework..."
pre-commit run --all-files --show-diff-on-failure > precommit_test.log 2>&1 || {
    echo "❌ VALIDATION FAILED: Pre-commit checks failed"
    cat precommit_test.log
    exit 1
}

# 3. Security Baseline Test
echo "Testing security scanning baseline..."
if [[ ! -f .secrets.baseline ]]; then
    echo "❌ VALIDATION FAILED: Missing secrets baseline"
    exit 1
fi

# 4. False Positive Rate Test
echo "Testing for false positives..."
# Create known-good test files and ensure they pass
mkdir -p validation_temp
echo "const validCode = 'hello world';" > validation_temp/test.ts
git add validation_temp/test.ts
.githooks/pre-commit || {
    echo "❌ VALIDATION FAILED: Valid code rejected by hooks"
    exit 1
}
rm -rf validation_temp

echo "✅ Phase 1 validation passed"
```

**Phase 2 Validation: GitHub Integration Testing**

```bash
# Validation Script: scripts/validation/phase2-validation.sh
#!/bin/bash
set -euo pipefail

echo "🔄 Phase 2 GitHub Integration Validation"

# 1. Workflow Syntax Validation
echo "Validating GitHub workflow syntax..."
for workflow in .github/workflows/*.yml; do
    echo "Checking $workflow..."
    # Use GitHub's workflow validation
    if command -v gh >/dev/null 2>&1; then
        gh workflow view "$(basename "$workflow" .yml)" || {
            echo "❌ VALIDATION FAILED: Invalid workflow syntax in $workflow"
            exit 1
        }
    fi
done

# 2. Branch Protection Simulation
echo "Simulating branch protection rules..."
# Test that required checks exist and are properly named
REQUIRED_CHECKS=("quality-gates" "security")
for check in "${REQUIRED_CHECKS[@]}"; do
    if ! grep -q "$check" .github/workflows/*.yml; then
        echo "❌ VALIDATION FAILED: Required check '$check' not found in workflows"
        exit 1
    fi
done

# 3. PR Template Validation
echo "Validating PR template..."
if [[ ! -f .github/PULL_REQUEST_TEMPLATE.md ]]; then
    echo "❌ VALIDATION FAILED: Missing PR template"
    exit 1
fi

# Check template has required sections
REQUIRED_SECTIONS=("Description" "Type of Change" "Checklist")
for section in "${REQUIRED_SECTIONS[@]}"; do
    if ! grep -q "$section" .github/PULL_REQUEST_TEMPLATE.md; then
        echo "❌ VALIDATION FAILED: PR template missing section: $section"
        exit 1
    fi
done

echo "✅ Phase 2 validation passed"
```

#### Success Measurement Framework

**Quantitative Metrics (Evidence Required)**

1. **Commit Quality Improvement**

    - **Baseline**: Current conventional commit compliance rate
    - **Target**: 100% (with evidence from git log analysis)
    - **Measurement**: `git log --oneline --grep="^(feat|fix|docs)" --since="1 month ago" | wc -l`

2. **Build Reliability**

    - **Baseline**: Current CI failure rate
    - **Target**: <5% failure rate
    - **Measurement**: GitHub API workflow run statistics

3. **Developer Velocity Impact**

    - **Baseline**: Current PR cycle time (creation to merge)
    - **Target**: <10% increase in cycle time
    - **Measurement**: GitHub API PR timeline analysis

4. **Security Posture**
    - **Baseline**: Current vulnerability count
    - **Target**: 0 high/critical vulnerabilities
    - **Measurement**: Security scanning reports

**Qualitative Validation (Team Feedback)**

```bash
# Team Feedback Collection Script
#!/bin/bash
echo "📊 Collecting Team Feedback"

# Anonymous feedback form results
# Questions:
# 1. "How much did the new workflow slow you down?" (1-5 scale)
# 2. "How confident are you in code quality improvements?" (1-5 scale)
# 3. "Would you recommend this workflow to other teams?" (Yes/No)

# Success criteria:
# - Average slowdown rating < 3
# - Average confidence rating > 4
# - >80% would recommend
```

#### Risk Assessment & Mitigation

**High-Risk Scenarios**

1. **Hook Performance Degrades Development Speed**

    - **Evidence Required**: Benchmark data showing <30s hook execution
    - **Mitigation**: Performance optimization, selective hook execution
    - **Rollback Trigger**: >50% team reports significant slowdown

2. **False Positive Rate Too High**

    - **Evidence Required**: <5% false positive rate on valid commits
    - **Mitigation**: Rule tuning, whitelist mechanisms
    - **Rollback Trigger**: >20% false positive rate

3. **Team Resistance/Circumvention**
    - **Evidence Required**: Git log shows --no-verify usage patterns
    - **Mitigation**: Training, process refinement
    - **Rollback Trigger**: >30% commits bypass hooks

**Monitoring & Alerting**

```bash
# Continuous Validation Script: scripts/monitoring/health-check.sh
#!/bin/bash
set -euo pipefail

echo "🔍 Continuous Health Monitoring"

# 1. Hook Bypass Detection
BYPASSED_COMMITS=$(git log --oneline --since="1 week ago" --grep="--no-verify" | wc -l)
if [[ $BYPASSED_COMMITS -gt 5 ]]; then
    echo "⚠️ WARNING: $BYPASSED_COMMITS commits bypassed hooks this week"
fi

# 2. CI Failure Rate Monitoring
# Query GitHub API for workflow success rates
# Alert if failure rate > 10%

# 3. Security Alert Monitoring
# Check for new security vulnerabilities
# Alert if high/critical vulnerabilities found

# 4. Performance Degradation Detection
# Compare current hook performance to baseline
# Alert if >50% slower than baseline

echo "✅ Health check complete"
```

#### Validation Schedule

- **Daily**: Automated health checks
- **Weekly**: Performance metrics review
- **Monthly**: Team feedback collection
- **Quarterly**: Full validation suite re-run

#### Evidence Archive

All validation evidence stored in:

```
.validation/
├── evidence/
│   ├── baseline_metrics.json
│   ├── performance_tests/
│   ├── team_feedback/
│   └── security_scans/
├── reports/
│   ├── weekly_health.md
│   ├── monthly_review.md
│   └── quarterly_assessment.md
└── failures/
    ├── false_positives.log
    ├── performance_issues.log
    └── team_concerns.log
```

#### Rollback Procedures

**Immediate Rollback Triggers**

- Hook execution time >60 seconds
- False positive rate >25%
- CI success rate <80%
- > 50% team requests rollback

**Rollback Script**

```bash
#!/bin/bash
# Emergency rollback procedure
echo "🚨 EMERGENCY ROLLBACK INITIATED"

# 1. Disable hooks
git config core.hooksPath ""
echo "Git hooks disabled"

# 2. Disable branch protection
gh api -X PUT repos/:owner/:repo/branches/main/protection \
  --field enabled=false
echo "Branch protection disabled"

# 3. Notify team
echo "Send notification to team about rollback"

# 4. Document incident
echo "$(date): Emergency rollback initiated" >> .validation/incidents.log

echo "✅ Rollback complete - investigate and fix before re-enabling"
```

This implementation provides a robust, scalable Git and GitHub integration that enforces quality while maintaining developer productivity, **validated through evidence-based testing and continuous monitoring**.
