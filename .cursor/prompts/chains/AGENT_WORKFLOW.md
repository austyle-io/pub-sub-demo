# Agent-Based Documentation Workflows

This document explains how the chain runner can be adapted for autonomous documentation generation and other agent-based workflows.

## Overview

The original chain runner (`run.ts`) is designed for human-in-the-loop workflows with Cursor. However, we've created agent-friendly versions that can:

1. **Execute autonomously** without human intervention
2. **Generate documentation** using AST analysis
3. **Validate and test** generated content
4. **Report progress** and results

## Components

### 1. Agent Runner (`agent-runner.ts`)

An autonomous version of the chain runner that executes actions instead of generating prompts:

```typescript
// Execute an agent chain
const runner = new AgentRunner('documentation', {
  target_dir: 'src',
  output_format: 'jsdoc'
});

await runner.execute('_agent-documentation.yaml');
```

**Key Features:**
- Executes actions like `analyze`, `generate`, `modify`, `validate`
- Manages dependencies between steps
- Generates execution reports
- Handles file operations and command execution

### 2. Documentation Generator (`doc-generator.ts`)

AST-based tool for automatically generating JSDoc comments:

```typescript
// Process a single file
const result = processFile('src/utils/logger.ts');
console.log(`Added ${result.added} JSDoc comments`);
```

**Features:**
- Analyzes TypeScript AST
- Generates context-aware JSDoc comments
- Handles functions, classes, types, and constants
- Creates backups before modifying files

### 3. Agent Chain Format (`_agent-documentation.yaml`)

Agent chains define workflows with executable actions:

```yaml
steps:
  - id: analyze_coverage
    description: Analyze current documentation coverage
    actions:
      - type: execute
        command: pnpm run docs:check
        outputs:
          - coverage-report.json
      - type: analyze
        target: docs-site/reports/documentation-check.json
```

## Use Cases

### 1. Automated Documentation Generation

```bash
# Run the documentation workflow
./agent-runner.ts agent-documentation target_dir=packages/shared/src

# Or use the direct generator
./doc-generator.ts src/services/auth.service.ts
```

### 2. Code Quality Checks

Create chains for:
- Linting and formatting
- Type checking
- Test coverage analysis
- Security scanning

### 3. Refactoring Workflows

- Extract magic values to constants
- Add error handling
- Implement logging
- Add TypeScript types

### 4. Testing Workflows

- Generate test stubs
- Run test suites
- Validate coverage
- Create test reports

## Integration with AI Agents

The agent runner can be integrated with AI systems by:

1. **Input**: AI reads the chain definition and current codebase state
2. **Planning**: AI determines which actions to execute
3. **Execution**: Agent runner performs the actions
4. **Validation**: AI reviews the results and adjusts
5. **Iteration**: Process repeats until goals are met

### Example AI Integration

```typescript
// AI agent pseudocode
async function documentCodebase() {
  // 1. Analyze current state
  const coverage = await analyzeCoverage();
  
  // 2. Identify files needing documentation
  const files = coverage.incomplete.map(f => f.file);
  
  // 3. Generate documentation for each file
  for (const file of files) {
    const result = processFile(file);
    
    // 4. Validate the generated docs
    if (await validateJSDoc(file)) {
      console.log(`✅ Documented ${file}`);
    } else {
      // 5. Adjust and retry
      await refineDocumentation(file);
    }
  }
  
  // 6. Generate final report
  await generateReport();
}
```

## Benefits Over Manual Chains

1. **Automation**: No manual prompt execution required
2. **Consistency**: Same process every time
3. **Scalability**: Can process entire codebases
4. **Validation**: Built-in quality checks
5. **Reporting**: Detailed execution logs

## Creating Custom Agent Chains

To create a new agent chain:

1. Define the workflow in YAML:
```yaml
name: my-workflow
steps:
  - id: step1
    actions:
      - type: analyze
        target: "src/**/*.ts"
```

2. Implement custom actions if needed:
```typescript
case 'custom-action': {
  // Your custom logic here
  break;
}
```

3. Run the chain:
```bash
./agent-runner.ts my-workflow param1=value1
```

## Limitations and Considerations

1. **AST Analysis**: The doc generator uses simple heuristics - may need refinement
2. **Context**: Agents have limited understanding of business logic
3. **Quality**: Generated docs need human review for accuracy
4. **Safety**: Always create backups before modifying files

## Future Enhancements

1. **ML-based documentation**: Use language models for better descriptions
2. **Cross-file analysis**: Understand relationships between modules
3. **Incremental updates**: Only regenerate changed sections
4. **IDE integration**: Direct integration with VS Code/Cursor
5. **Distributed execution**: Run chains across multiple machines

## Conclusion

While the original chain runner is designed for Cursor-specific workflows, these agent-based tools demonstrate how the concept can be extended for autonomous documentation and development workflows. The key is converting human-readable prompts into machine-executable actions while maintaining the flexibility and composability of the chain system.