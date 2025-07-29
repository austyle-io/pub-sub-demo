# TypeScript Scripts Guide

This guide explains how to write and use TypeScript scripts in the pub-sub-demo project using Node.js v24's native TypeScript execution capabilities.

## Overview

Node.js v24 introduces native TypeScript execution, eliminating the need for build steps during development. All project scripts have been converted to TypeScript for better type safety and developer experience.

## Writing TypeScript Scripts

### Basic Script Structure

```typescript
#!/usr/bin/env node --experimental-strip-types

import { logger } from '../utilities/logger.ts';
import { handleError, setupGracefulShutdown } from '../utilities/cli-utils.ts';

async function main(): Promise<void> {
  setupGracefulShutdown();
  
  try {
    logger.info('Starting script...');
    // Your script logic here
  } catch (error) {
    await handleError(error);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
```

### Key Requirements

1. **Shebang**: Use `#!/usr/bin/env node --experimental-strip-types`
2. **Imports**: Always include `.ts` extension in imports
3. **Module System**: Use ES modules (not CommonJS)
4. **Type Safety**: Leverage TypeScript's type system

### Shared Utilities

The project provides common utilities for scripts:

#### Logger (`scripts/utilities/logger.ts`)
```typescript
import { logger } from './utilities/logger.ts';

logger.info('Information message');
logger.warn('Warning message');
logger.error('Error message');
logger.debug('Debug message'); // Only shown with LOG_LEVEL=debug
```

#### CLI Utilities (`scripts/utilities/cli-utils.ts`)
```typescript
import { 
  createCommand, 
  parseOptions, 
  handleError, 
  setupGracefulShutdown 
} from './utilities/cli-utils.ts';

// Create a CLI command
const program = createCommand('my-script', 'Description of my script')
  .option('-f, --force', 'Force operation')
  .action(async (options) => {
    // Handle command
  });
```

### Creating a New Script

1. Create the TypeScript file:
```bash
touch scripts/category/my-script.ts
chmod +x scripts/category/my-script.ts
```

2. Use the template:
```typescript
#!/usr/bin/env node --experimental-strip-types

import { z } from 'zod';
import { Command } from 'commander';
import { logger } from '../utilities/logger.ts';
import { handleError, setupGracefulShutdown, createCommand, parseOptions } from '../utilities/cli-utils.ts';

// Define configuration schema
const ConfigSchema = z.object({
  verbose: z.boolean().default(false),
  dryRun: z.boolean().default(false),
});

type Config = z.infer<typeof ConfigSchema>;

class MyScript {
  constructor(private config: Config) {}

  async run(): Promise<void> {
    logger.info('Running script...');
    // Implementation
  }
}

async function main(): Promise<void> {
  setupGracefulShutdown();

  const program = createCommand('my-script', 'Description')
    .option('-v, --verbose', 'Enable verbose logging')
    .option('--dry-run', 'Preview changes without applying')
    .action(async (options) => {
      try {
        const config = parseOptions(ConfigSchema, options);
        const script = new MyScript(config);
        await script.run();
      } catch (error) {
        await handleError(error);
      }
    });

  program.parse();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
```

3. Add to package.json:
```json
{
  "scripts": {
    "my-script": "node --experimental-strip-types scripts/category/my-script.ts"
  }
}
```

## Available Scripts

### Development
- `pnpm db:reset` - Reset database to clean state
- `pnpm db:debug` - Debug database contents
- `pnpm env:setup` - Set up environment variables

### Quality
- `pnpm lint:full` - Comprehensive linting with safety checks
- `pnpm lint:shell` - Check shell scripts (if any remain)
- `pnpm lint:markdown` - Check markdown documentation

### Testing
- `pnpm test:integration` - Run integration tests
- `pnpm test:no-rate-limit` - Run tests without rate limiting
- `pnpm ci:local` - Run CI checks locally

### Documentation
- `pnpm docs:check` - Check documentation quality
- `pnpm docs:analyze` - Analyze codebase documentation

### Agent Tools
- `pnpm handoff` - Generate handoff report

## Script Categories

Scripts are organized by category:

- `scripts/development/` - Development utilities
- `scripts/quality/` - Code quality and linting
- `scripts/testing/` - Test runners and utilities
- `scripts/utilities/` - General utilities
- `scripts/setup/` - Setup and installation
- `.agent/tools/` - Agent-specific tools

## TypeScript Configuration

Scripts use a shared TypeScript configuration at `scripts/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "nodenext",
    "moduleResolution": "bundler",
    "noEmit": true,
    "allowImportingTsExtensions": true,
    "erasableSyntaxOnly": true,
    "verbatimModuleSyntax": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "types": ["node"]
  }
}
```

## Limitations

### Cannot Use (without --experimental-transform-types)

1. **Enums** - Use const objects instead:
```typescript
// ❌ Don't use
enum Status { PENDING, COMPLETE }

// ✅ Use instead
export const STATUS = {
  PENDING: 'pending',
  COMPLETE: 'complete',
} as const;
export type Status = typeof STATUS[keyof typeof STATUS];
```

2. **Parameter Properties** - Use regular properties:
```typescript
// ❌ Don't use
class Config {
  constructor(public readonly path: string) {}
}

// ✅ Use instead
class Config {
  readonly path: string;
  constructor(path: string) {
    this.path = path;
  }
}
```

## CI/CD Integration

GitHub Actions automatically:
1. Validates TypeScript syntax
2. Type-checks all scripts
3. Runs linting on TypeScript files
4. Executes scripts with Node.js v24

## Best Practices

1. **Type Everything**: Avoid `any` types
2. **Use Zod**: Validate external input with Zod schemas
3. **Handle Errors**: Always use try-catch and proper error handling
4. **Log Appropriately**: Use the logger utility for consistent output
5. **Test Scripts**: Write tests for complex script logic
6. **Document Usage**: Add help text and examples to CLI commands

## Troubleshooting

### Import Errors
- Always include `.ts` extension in imports
- Use `import.meta` instead of `__dirname`
- Ensure `"type": "module"` in package.json

### Type Errors
- Run `pnpm type-check` to validate
- Check that you're not using non-erasable syntax
- Ensure all dependencies have type definitions

### Execution Issues
- Verify Node.js version is 24 or higher
- Check file permissions (`chmod +x`)
- Ensure shebang is correct

## Migration from Shell/Python/JS

When converting existing scripts:

1. **Shell Scripts**: Replace command execution with `execAsync`
2. **Python Scripts**: Use JavaScript equivalents (fs, path, etc.)
3. **JavaScript**: Add types and update imports

Example migration patterns are available in the git history for reference.