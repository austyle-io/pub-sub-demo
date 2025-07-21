# Cursor Cache Directory Policy

## Overview

All migration, backup, and temporary directories and files **MUST** be saved to the `.cursor/cache/` directory. This policy ensures clean organization, prevents git repository pollution, and maintains a consistent approach to temporary file management.

## Directory Structure

```
.cursor/
├── cache/                    # 🚫 Git ignored - temporary files only
│   ├── migrations/          # Migration-related temporary files
│   ├── backups/            # Backup files and directories
│   ├── temp/               # General temporary files
│   └── scripts/            # Temporary script outputs
├── rules/                   # ✅ Git tracked - coding rules
├── prompts/                 # ✅ Git tracked - AI prompts
└── plans/                   # ✅ Git tracked - project plans
```

## Usage Guidelines

### ✅ REQUIRED: Use .cursor/cache/ for

- **Migration backups**: Pre-migration state snapshots
- **Temporary files**: Build artifacts, intermediate processing files
- **Script outputs**: Log files, temporary data processing
- **Backup directories**: Any backup created during development
- **Test artifacts**: Temporary test data, mock files
- **Development temp files**: Any file with temporary or transient nature

### ❌ FORBIDDEN: Do NOT use .cursor/cache/ for

- **Persistent configuration**: Use appropriate config directories
- **Source code**: Always commit to proper src/ directories
- **Documentation**: Use docs/ or appropriate documentation directories
- **Production artifacts**: Use proper build/dist directories

## Implementation Examples

### Migration Scripts

```bash
# ✅ CORRECT
backup_dir=".cursor/cache/migrations/pre-migration-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$backup_dir"
cp -r old_structure/ "$backup_dir/"

# ❌ WRONG
backup_dir="./backup-$(date +%Y%m%d)"  # Creates git-tracked files
```

### Temporary Processing

```bash
# ✅ CORRECT
temp_file=".cursor/cache/temp/processing-$$.tmp"
process_data > "$temp_file"

# ❌ WRONG
temp_file="./temp-data.tmp"  # Creates git-tracked files
```

### Script Development

```bash
# ✅ CORRECT
log_file=".cursor/cache/scripts/migration-$(date +%Y%m%d).log"
echo "Starting migration..." >> "$log_file"

# ❌ WRONG
log_file="./migration.log"  # Creates git-tracked files
```

## Git Ignore Configuration

The `.cursor/cache/` directory is automatically ignored by git via `.gitignore`:

```gitignore
# Cursor cache directory (migration, backup, temporary files)
.cursor/cache/
```

This ensures that:

- Temporary files never pollute the repository
- Large backup files don't bloat git history
- Migration artifacts remain local-only
- Build outputs stay out of version control

## Directory Creation

The cache directory structure is created automatically when needed:

```bash
# Scripts should create subdirectories as needed
mkdir -p .cursor/cache/migrations
mkdir -p .cursor/cache/backups
mkdir -p .cursor/cache/temp
mkdir -p .cursor/cache/scripts
```

## Cleanup Policy

### Automatic Cleanup

- **Temporary files**: Should be cleaned up by the creating script
- **Migration backups**: Keep for 30 days, then manual cleanup
- **Build artifacts**: Clean with each new build

### Manual Cleanup

```bash
# Clean all cache contents (use with caution)
rm -rf .cursor/cache/*

# Clean specific types
rm -rf .cursor/cache/temp/*
rm -rf .cursor/cache/migrations/older-than-30-days/
```

## Benefits

- **Clean Repository**: No temporary files in git history
- **Organized Structure**: Predictable location for all temporary files
- **Developer Friendly**: Clear guidelines prevent confusion
- **Performance**: Faster git operations without temporary file noise
- **CI/CD Compatible**: Build systems can ignore cache directory

## Enforcement

This policy is enforced through:

1. **Git Hooks**: Pre-commit hooks validate no temporary files in tracked areas
2. **Documentation**: Clear guidelines for all developers
3. **Code Review**: Reviewers check for policy compliance
4. **Automated Scripts**: All provided scripts follow this pattern

## Migration of Existing Files

When implementing this policy:

1. Move existing temporary/backup files to `.cursor/cache/`
2. Update any scripts that create temporary files
3. Clean up old temporary files from git history if needed
4. Update documentation to reference new locations

## Examples in Practice

### Before (Non-Compliant)

```
project-root/
├── backup-20250107/        # ❌ Creates git noise
├── temp-migration.log      # ❌ Temporary file in root
├── old-structure-backup/   # ❌ Backup in root
└── migration-script.tmp    # ❌ Temporary script file
```

### After (Compliant)

```
project-root/
├── .cursor/
│   └── cache/
│       ├── backups/
│       │   └── backup-20250107/     # ✅ Properly ignored
│       ├── temp/
│       │   └── migration-script.tmp # ✅ Temporary files
│       └── scripts/
│           └── migration.log        # ✅ Script outputs
└── [clean repository structure]
```

## Questions & Support

For questions about this policy or implementation:

1. Check this documentation first
2. Review existing scripts for examples
3. Ask in team discussions
4. Update this document with clarifications

---

**Last Updated**: January 5, 2025
**Policy Version**: 1.0
**Status**: Active
