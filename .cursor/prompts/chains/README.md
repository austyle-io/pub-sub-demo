# Cursor Prompt Chains

A TypeScript implementation of the chain runner for executing Cursor prompts in sequence.

## Overview

The chain runner allows you to define sequences of prompts in YAML files and execute them with parameter substitution. This is useful for complex multi-step operations that require a series of prompts to be executed in order.

## Usage

```bash
# Run a chain
./run.ts <chain-name> [parameters...]

# Example
./run.ts websocket-feature "user presence" "Show online users in real-time"

# List available chains
./run.ts
```

## Chain Definition Format

Chains are defined in YAML files with the `_` prefix (e.g., `_example-chain.yaml`):

```yaml
name: Example Chain
description: A test chain for validating script functionality
parameters:
  - name: param1
    description: First parameter
  - name: param2
    description: Second parameter

steps:
  - id: step-one
    prompt: |
      This is step one with parameters:
      - Parameter 1: {{param1}}
      - Parameter 2: {{param2}}

  - id: step-two
    prompt: |
      This is step two of the example chain.
      Testing chain execution.
```

## Implementation

The TypeScript implementation provides:

- **Type Safety**: Full TypeScript types for chain definitions
- **Parameter Substitution**: Replace `{{param}}` placeholders with provided values
- **Output Generation**: Creates markdown files for each step
- **Testing**: Comprehensive test suite using Vitest
- **Cross-platform**: Works on all platforms that support Node.js

## Files

- `run.ts` - Main chain runner implementation
- `__tests__/run.test.ts` - Comprehensive test suite
- `test-run.ts` - Simple test runner for quick testing
- `_example-chain.yaml` - Example chain definition
- `_websocket-feature.yaml` - WebSocket feature implementation chain

## Development

```bash
# Run tests
node --experimental-strip-types test-run.ts

# Run with Vitest (if configured)
pnpm test

# Make executable
chmod +x run.ts
```

## Migration from Shell Script

This TypeScript implementation replaces the original `run.sh` shell script with:

1. **Better Error Handling**: Proper exception handling and error messages
2. **Type Safety**: TypeScript interfaces for chain definitions
3. **Testing**: Comprehensive test coverage
4. **Maintainability**: Easier to extend and modify
5. **Cross-platform**: No bash dependencies

The functionality remains the same, but the implementation is more robust and maintainable.