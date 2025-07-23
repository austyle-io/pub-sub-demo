# Comprehensive Plan: Magic Value Refactoring Tool v2.0

## Executive Summary
This plan outlines a systematic approach to upgrade the magic value refactoring tool with sophisticated AST analysis and pattern matching capabilities to handle all identified edge cases. With Node.js v24+ native TypeScript execution support, all tooling will be written directly in TypeScript without requiring a build step.

## Technology Stack
- **Node.js v24+**: Native TypeScript execution via `--experimental-strip-types` flag
- **TypeScript**: Direct `.ts` file execution without compilation
- **ts-morph**: TypeScript AST manipulation
- **Commander.js**: CLI framework
- **No build tools required**: Direct execution with `node --experimental-strip-types`

## Phase 1: Foundation Architecture (Week 1-2)

### 1.0 Project Setup with Native TypeScript
```bash
# No build configuration needed!
# Create the tool structure:
mkdir -p scripts/magic-value-tool/{core,handlers,analyzers,transformers}

# Create main entry point
cat > scripts/magic-value-tool/index.ts << 'EOF'
#!/usr/bin/env node --experimental-strip-types
import { Command } from 'commander';
import { MagicValueRefactor } from './core/refactor';

const program = new Command();
program
  .name('magic-refactor')
  .description('Context-aware magic value refactoring tool')
  .version('2.0.0');

// ... command setup
program.parse();
EOF

# Make executable
chmod +x scripts/magic-value-tool/index.ts

# Run directly!
./scripts/magic-value-tool/index.ts --help
```

### 1.1 Core AST Analysis Engine
```typescript
interface ASTContext {
  nodeType: ts.SyntaxKind;
  parentChain: ts.Node[];
  scope: ScopeInfo;
  fileContext: FileContext;
  semanticContext: SemanticContext;
}

interface SemanticContext {
  isTypeContext: boolean;
  isJSXContext: boolean;
  isTestContext: boolean;
  isConfigContext: boolean;
  isTemplateContext: boolean;
  isDynamicContext: boolean;
}
```

### 1.2 Context Detection System
- **Type Context Detector**: Identifies when literals are in type definitions
- **JSX Context Detector**: Recognizes JSX attributes and children
- **Test Context Detector**: Identifies test descriptions and assertions
- **Runtime Context Detector**: Detects dynamic value contexts

### 1.3 Pattern Matching Framework
```typescript
interface PatternMatcher {
  pattern: RegExp | PredicateFunction;
  context: ContextRequirement[];
  exclude?: ExclusionRule[];
  transform?: TransformFunction;
  priority: number;
}
```

## Phase 2: Context-Aware Detection (Week 3-4)

### 2.1 TypeScript Type System Handler
```typescript
class TypeContextHandler {
  // Detects and handles:
  - Type literals in unions
  - Type literals in intersections
  - Const assertions
  - Template literal types
  - Conditional types
  - Mapped types
  - Index signatures

  isInTypeContext(node: ts.Node): boolean {
    // Check if node is within:
    // - Type alias declaration
    // - Interface declaration
    // - Type parameter
    // - Type assertion
    // - Generic argument
  }
}
```

### 2.2 JSX/React Handler
```typescript
class JSXContextHandler {
  // Handles:
  - JSX attributes (preserve quotes)
  - JSX text content
  - JSX expressions
  - Props with specific types
  - Event handlers
  - Style objects
  - className strings

  shouldPreserveJSXLiteral(node: ts.JsxAttribute): boolean {
    // Check for:
    // - HTML attributes requiring strings
    // - ARIA attributes
    // - Data attributes
    // - Style properties
  }
}
```

### 2.3 Semantic Analysis Engine
```typescript
class SemanticAnalyzer {
  // Analyzes meaning and intent:
  - Array indices vs magic numbers
  - String method parameters
  - Well-known constants (Math.PI, HTTP codes)
  - Domain-specific values
  - Calculation components

  isSemanticConstant(node: ts.Node, value: any): boolean {
    // Determine if value has semantic meaning
    // in its specific context
  }
}
```

## Phase 3: Smart Detection Rules (Week 5-6)

### 3.1 Whitelist System
```typescript
interface WhitelistRule {
  value: string | number;
  contexts: ContextPattern[];
  reason: string;
}

const WHITELIST: WhitelistRule[] = [
  // Array indices
  { value: 0, contexts: ['ArrayAccess', 'SliceStart'], reason: 'Array index' },
  { value: 1, contexts: ['ArrayAccess', 'SliceCount'], reason: 'Array index' },

  // String operations
  { value: 255, contexts: ['StringSubstring'], reason: 'Common string limit' },

  // Time calculations
  { value: 60, contexts: ['TimeCalculation'], reason: 'Seconds in minute' },
  { value: 24, contexts: ['TimeCalculation'], reason: 'Hours in day' },

  // Common divisors/multipliers
  { value: 1000, contexts: ['UnitConversion'], reason: 'MS to seconds' },
  { value: 1024, contexts: ['ByteCalculation'], reason: 'KB conversion' },
];
```

### 3.2 Context-Specific Rules
```typescript
interface ContextRule {
  context: string;
  detector: (node: ts.Node) => boolean;
  validator: (value: any) => boolean;
  extractor?: (node: ts.Node) => ExtractedConstant;
}

const CONTEXT_RULES: ContextRule[] = [
  {
    context: 'HTTPStatusCode',
    detector: (node) => isHTTPStatusContext(node),
    validator: (value) => value >= 100 && value < 600,
    extractor: (node) => ({
      name: `HTTP_${getStatusName(node)}`,
      category: 'HTTP_STATUS'
    })
  },
  {
    context: 'ColorValue',
    detector: (node) => isColorContext(node),
    validator: (value) => isValidColor(value),
    extractor: (node) => ({
      name: getColorConstantName(value),
      category: 'COLORS'
    })
  }
];
```

### 3.3 Heuristic Analysis
```typescript
class HeuristicAnalyzer {
  // Smart detection based on:
  - Variable/property names
  - Function names
  - Comments
  - File patterns
  - Import patterns

  analyzeContext(node: ts.Node): ContextHints {
    const hints = {
      variableName: getVariableName(node),
      propertyName: getPropertyName(node),
      functionName: getEnclosingFunctionName(node),
      comments: getLeadingComments(node),
      fileName: getFileName(node),
      importedFrom: getImportContext(node)
    };

    return interpretHints(hints);
  }
}
```

## Phase 4: Advanced Transformation Engine (Week 7-8)

### 4.1 Safe Transformation System
```typescript
class SafeTransformer {
  transform(node: ts.Node, constant: ExtractedConstant): TransformResult {
    // Validation steps:
    1. Check if transformation is safe
    2. Verify identifier validity
    3. Handle special characters
    4. Preserve necessary quotes
    5. Maintain type compatibility

    if (!isValidIdentifier(constant.name)) {
      constant.name = sanitizeIdentifier(constant.name);
    }

    if (requiresQuotes(node)) {
      return preserveQuotedTransform(node, constant);
    }

    return standardTransform(node, constant);
  }
}
```

### 4.2 Identifier Generation
```typescript
class IdentifierGenerator {
  generateValidName(value: string | number, context: Context): string {
    // Handle:
    - Numbers at start (3.1.0 -> THREE_ONE_ZERO or V3_1_0)
    - Special characters (HTTP/1.1 -> HTTP_1_1)
    - Spaces (Hello World -> HELLO_WORLD)
    - Reserved words (class -> CLASS_NAME)
    - Empty strings -> EMPTY_STRING
    - Unicode -> Transliteration or encoding

    return validIdentifier;
  }
}
```

### 4.3 Import Management
```typescript
class ImportManager {
  // Intelligent import handling:
  - Detect correct import path
  - Avoid circular dependencies
  - Handle module boundaries
  - Merge with existing imports
  - Optimize import statements

  addImport(file: SourceFile, constant: Constant): void {
    const importPath = resolveImportPath(file, constant);
    const existingImport = findExistingImport(file, importPath);

    if (existingImport) {
      updateImport(existingImport, constant);
    } else {
      createImport(file, importPath, constant);
    }
  }
}
```

## Phase 5: Edge Case Handlers (Week 9-10)

### 5.1 Type Union Handler
```typescript
class TypeUnionHandler implements EdgeCaseHandler {
  canHandle(node: ts.Node): boolean {
    return ts.isUnionTypeNode(node.parent);
  }

  handle(node: ts.Node, value: any): HandlerResult {
    // For type unions, we need to:
    1. Keep the literal in the type definition
    2. Create a constant for runtime use
    3. Add type assertion if needed

    return {
      skipTransformation: true,
      additionalConstants: [{
        name: generateName(value),
        value: value,
        type: 'literal'
      }]
    };
  }
}
```

### 5.2 JSX Attribute Handler
```typescript
class JSXAttributeHandler implements EdgeCaseHandler {
  handle(node: ts.JsxAttribute, value: string): HandlerResult {
    const attrName = node.name.getText();

    // Special handling for:
    if (HTML_ATTRIBUTES.includes(attrName)) {
      return { skipTransformation: true };
    }

    if (REQUIRES_STRING_LITERAL.includes(attrName)) {
      return {
        transform: `{${constantName}}`, // Add braces
        addImport: true
      };
    }

    return standardTransform(node, value);
  }
}
```

### 5.3 Dynamic Context Handler
```typescript
class DynamicContextHandler implements EdgeCaseHandler {
  // Handles runtime-determined values:
  - Template literals with variables
  - Computed property names
  - Dynamic imports
  - Conditional values

  handle(node: ts.Node): HandlerResult {
    if (hasDynamicComponents(node)) {
      // Extract static parts only
      const staticParts = extractStaticParts(node);
      return {
        partialTransform: true,
        constants: staticParts.map(p => ({
          name: generateName(p.value),
          value: p.value
        }))
      };
    }
  }
}
```

## Phase 6: Testing Framework (Week 11-12)

### 6.0 Native TypeScript Test Setup
```typescript
// scripts/magic-value-tool/test/run-tests.ts
#!/usr/bin/env node --experimental-strip-types

import { describe, it, expect } from '@jest/globals';
import { spawn } from 'child_process';

// Direct TypeScript test execution
async function runTypeScriptTests() {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [
      '--experimental-strip-types',
      '--test',
      'scripts/magic-value-tool/**/*.test.ts'
    ]);

    child.on('exit', (code) => {
      if (code === 0) resolve(true);
      else reject(new Error(`Tests failed with code ${code}`));
    });
  });
}

// Or use Node.js native test runner
import test from 'node:test';
import assert from 'node:assert';

test('Edge case: Type union detection', async (t) => {
  const result = await analyzeTypeUnion(`type Status = 'active' | 'inactive'`);
  assert.strictEqual(result.shouldTransform, false);
});
```

### 6.1 Edge Case Test Suite
```typescript
interface EdgeCaseTest {
  name: string;
  input: string;
  expected: string;
  context: string[];
  shouldTransform: boolean;
}

const EDGE_CASE_TESTS: EdgeCaseTest[] = [
  {
    name: 'Type union literal',
    input: `type Status = 'active' | 'inactive';`,
    expected: `type Status = 'active' | 'inactive';`, // No change
    context: ['TypeContext'],
    shouldTransform: false
  },
  {
    name: 'JSX attribute',
    input: `<button type="submit">`,
    expected: `<button type="submit">`, // Preserved
    context: ['JSXContext'],
    shouldTransform: false
  },
  {
    name: 'Array index',
    input: `array[0]`,
    expected: `array[0]`, // Not transformed
    context: ['ArrayAccess'],
    shouldTransform: false
  }
];
```

### 6.2 Regression Test System
```typescript
class RegressionTestRunner {
  // Automated testing for:
  - Each edge case category
  - Real-world code samples
  - Performance benchmarks
  - Error handling
  - Rollback capabilities

  async runTests(): Promise<TestResults> {
    const results = await Promise.all([
      testTypeContexts(),
      testJSXContexts(),
      testNumericContexts(),
      testStringContexts(),
      testDynamicContexts()
    ]);

    return aggregateResults(results);
  }
}
```

## Phase 7: Configuration System (Week 13)

### 7.1 User Configuration
```typescript
interface RefactoringConfig {
  // Customizable rules
  excludePatterns?: string[];
  includePatterns?: string[];
  customWhitelist?: WhitelistRule[];
  customCategories?: CategoryDefinition[];
  transformOptions?: TransformOptions;

  // Feature flags
  enableTypeContextDetection: boolean;
  enableHeuristicAnalysis: boolean;
  enableDynamicContextHandling: boolean;

  // Safety settings
  requireConfirmation?: boolean;
  maxTransformationsPerFile?: number;
  backupBeforeTransform?: boolean;
}
```

### 7.2 Project-Specific Rules
```typescript
interface ProjectRules {
  // Allow projects to define:
  - Domain-specific constants
  - Naming conventions
  - Special handling rules
  - Integration patterns

  rules: Rule[];
  namingConvention: NamingConvention;
  constantsStructure: ConstantsStructure;
}
```

## Phase 8: Integration & Deployment (Week 14)

### 8.1 CLI Enhancement
```bash
# Direct TypeScript execution
node --experimental-strip-types scripts/refactor-magic-values.ts --detect-only

# Or with shebang in the script:
#!/usr/bin/env node --experimental-strip-types

# New CLI options
--detect-only          # Only detect, don't transform
--context-aware        # Enable context detection
--safe-mode           # Conservative transformation
--interactive         # Confirm each transformation
--rollback           # Undo last transformation
--analyze-edge-cases # Report on edge cases found
```

### 8.1.1 Package.json Scripts
```json
{
  "scripts": {
    "refactor:scan": "node --experimental-strip-types scripts/scan-magic-values.ts",
    "refactor:group": "node --experimental-strip-types scripts/group-constants.ts",
    "refactor:transform": "node --experimental-strip-types scripts/refactor-magic-values.ts",
    "refactor:analyze": "node --experimental-strip-types scripts/analyze-edge-cases.ts"
  }
}
```

### 8.2 IDE Integration
- VS Code extension for real-time detection
- IntelliJ plugin for Java/Kotlin
- Language server protocol support
- Quick fixes and code actions
- Preview transformations

### 8.3 CI/CD Integration
```yaml
# GitHub Action
- name: Check Magic Values
  uses: magic-value-refactor/action@v2
  with:
    mode: detect
    fail-on-new: true
    context-aware: true
    report-path: magic-values-report.html
```

## Phase 9: Performance Optimization (Week 15)

### 9.1 Caching System
```typescript
class CacheManager {
  // Cache:
  - AST parsing results
  - Context detection results
  - Import resolution
  - Transformation history

  private cache = new Map<string, CacheEntry>();

  async getCachedOrCompute<T>(
    key: string,
    compute: () => Promise<T>
  ): Promise<T> {
    if (this.cache.has(key)) {
      return this.cache.get(key).value;
    }

    const value = await compute();
    this.cache.set(key, { value, timestamp: Date.now() });
    return value;
  }
}
```

### 9.2 Parallel Processing
```typescript
class ParallelProcessor {
  async processFiles(files: string[]): Promise<Results> {
    // Use worker threads for:
    - AST parsing
    - Pattern matching
    - Context detection

    const workers = createWorkerPool(cpus().length);
    const chunks = chunkFiles(files, workers.length);

    const results = await Promise.all(
      chunks.map((chunk, i) =>
        workers[i].process(chunk)
      )
    );

    return mergeResults(results);
  }
}
```

## Phase 10: Documentation & Training (Week 16)

### 10.1 Comprehensive Documentation
- Edge case catalog with examples
- Best practices guide
- Configuration reference
- API documentation
- Migration guides

### 10.2 Interactive Tutorial
```typescript
class InteractiveTutorial {
  // Guided walkthrough:
  - Basic magic value detection
  - Context awareness
  - Edge case handling
  - Custom configuration
  - Advanced features

  async runTutorial(): Promise<void> {
    await showIntroduction();
    await demonstrateBasicDetection();
    await explainContextAwareness();
    await practiceEdgeCases();
    await configureForProject();
  }
}
```

## Native TypeScript Implementation Examples

### Direct Execution Pattern
```typescript
// scripts/magic-value-tool/analyze.ts
#!/usr/bin/env node --experimental-strip-types

import { Project } from 'ts-morph';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Direct TypeScript execution - no compilation needed!
async function main() {
  const project = new Project({
    tsConfigFilePath: resolve(process.cwd(), 'tsconfig.json'),
  });

  // Add source files
  project.addSourceFilesAtPaths('**/*.ts');

  // Process files directly
  for (const sourceFile of project.getSourceFiles()) {
    console.log(`Analyzing: ${sourceFile.getFilePath()}`);
    // ... analysis logic
  }
}

// Execute immediately
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
```

### Development Workflow
```json
{
  "scripts": {
    "dev": "node --experimental-strip-types --watch scripts/magic-value-tool/index.ts",
    "test": "node --experimental-strip-types --test scripts/**/*.test.ts",
    "debug": "node --experimental-strip-types --inspect scripts/magic-value-tool/index.ts"
  }
}
```

### VS Code Launch Configuration
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Magic Value Tool",
      "runtimeArgs": ["--experimental-strip-types"],
      "program": "${workspaceFolder}/scripts/magic-value-tool/index.ts",
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

## Implementation Priority Matrix

| Feature | Impact | Complexity | Priority |
|---------|--------|------------|----------|
| Type Context Detection | High | High | P0 |
| JSX Handling | High | Medium | P0 |
| Array Index Detection | High | Low | P0 |
| Identifier Sanitization | High | Medium | P0 |
| Dynamic Context | Medium | High | P1 |
| Heuristic Analysis | Medium | High | P1 |
| Test Context | Medium | Medium | P1 |
| Performance Cache | Low | Medium | P2 |
| IDE Integration | Low | High | P2 |

## Success Metrics

1. **Accuracy**: >95% correct transformations
2. **Safety**: Zero broken builds
3. **Coverage**: Handle 100% of identified edge cases
4. **Performance**: <5s for 1000 file analysis
5. **Adoption**: Used by >80% of team members

## Risk Mitigation

1. **Backward Compatibility**: Maintain v1 API
2. **Rollback Capability**: Git-based undo system
3. **Gradual Rollout**: Feature flags for new capabilities
4. **Extensive Testing**: 10,000+ test cases
5. **User Feedback Loop**: Beta program with key users

## Native TypeScript Advantages

### Benefits of Direct TypeScript Execution
1. **Zero Build Time**: No compilation step needed
2. **Instant Feedback**: Changes take effect immediately
3. **Simplified Toolchain**: No webpack, tsc, or babel configuration
4. **Native Debugging**: Direct source map support
5. **Type Safety**: TypeScript types still checked by IDE
6. **Modern Syntax**: Full ES2024+ support

### Performance Considerations
```bash
# Benchmark native TypeScript vs compiled
time node --experimental-strip-types scripts/analyze.ts  # ~100ms startup
time node dist/analyze.js                                # ~50ms startup

# For large projects, consider:
# 1. Use --experimental-strip-types for development
# 2. Compile for production if startup time matters
```

### Migration Path for Existing Tools
```typescript
// package.json
{
  "scripts": {
    // Old way
    "old:scan": "npx tsx scripts/scan-magic-values.ts",

    // New way - native TypeScript
    "scan": "node --experimental-strip-types scripts/scan-magic-values.ts",

    // Compatibility wrapper
    "scan:compat": "node scripts/run-with-typescript.js scan-magic-values.ts"
  }
}

// scripts/run-with-typescript.js
const { spawn } = require('child_process');
const script = process.argv[2];

spawn('node', ['--experimental-strip-types', `scripts/${script}`], {
  stdio: 'inherit'
}).on('exit', process.exit);
```

## Conclusion

This comprehensive plan transforms the magic value refactoring tool from a basic string replacement utility into a sophisticated, context-aware code transformation system. By leveraging Node.js v24's native TypeScript execution, we eliminate build complexity while maintaining full type safety and modern JavaScript features. The implementation uses advanced AST analysis, pattern matching, and edge case handling to achieve near-perfect accuracy while maintaining code safety and developer productivity.
