# Magic Value Refactoring Tool v2.0

A context-aware tool for detecting and refactoring magic values (hardcoded strings and numbers) in TypeScript/React projects.

## Features

- **Context-Aware Detection**: Understands TypeScript, JSX, and common patterns
- **Smart Categorization**: Automatically categorizes values (HTTP_STATUS, TIMEOUT, COLOR, etc.)
- **Edge Case Handling**: Preserves type literals, test descriptions, and JSX attributes
- **Safe Transformation**: Generates valid JavaScript identifiers
- **Native TypeScript**: Runs directly with Node.js v24+ `--experimental-strip-types`

## Installation

```bash
cd scripts/magic-value-tool
npm install
```

## Usage

### Scan for Magic Values

```bash
# Scan entire project
node --experimental-strip-types scripts/magic-value-tool/index.ts scan

# Scan specific directory
node --experimental-strip-types scripts/magic-value-tool/index.ts scan --path src

# Output as JSON
node --experimental-strip-types scripts/magic-value-tool/index.ts scan --json > report.json
```

### Transform Magic Values

```bash
# Dry run (preview changes)
node --experimental-strip-types scripts/magic-value-tool/index.ts transform --dry-run

# Transform specific file
node --experimental-strip-types scripts/magic-value-tool/index.ts transform --file src/app.ts

# Transform by category
node --experimental-strip-types scripts/magic-value-tool/index.ts transform --group HTTP_STATUS

# Safe mode (extra validation)
node --experimental-strip-types scripts/magic-value-tool/index.ts transform --safe-mode
```

### Analyze Edge Cases

```bash
node --experimental-strip-types scripts/magic-value-tool/index.ts analyze-edge-cases
```

## Configuration

Create a `.magic-refactor.json` file in your project root:

```json
{
  "enableTypeContextDetection": true,
  "enableHeuristicAnalysis": true,
  "preserveJSXAttributes": true,
  "preserveTestDescriptions": true,
  "customWhitelist": [
    {
      "value": "custom-value",
      "reason": "Project-specific constant"
    }
  ],
  "namingConvention": "SCREAMING_SNAKE",
  "constantsPath": "./src/constants.ts"
}
```

## Edge Cases Handled

### ✅ Preserved (Not Transformed)

- Type literals in TypeScript type definitions
- Test descriptions in `describe()`, `it()`, `test()`
- JSX attributes requiring string literals (type, name, id, etc.)
- Common array indices (0-10)
- Empty string and zero in initialization contexts

### ✅ Intelligently Transformed

- HTTP status codes → `HTTP_OK`, `HTTP_NOT_FOUND`
- Colors → `COLOR_PRIMARY`, `COLOR_RED`
- Dimensions → `PADDING_20PX`, `WIDTH_100PX`
- API endpoints → `API_USERS`, `API_PRODUCTS`
- Timeouts → `TIMEOUT_REQUEST`, `DELAY_RETRY`

### ✅ Special Handling

- JSX expressions: `padding: '20px'` → `padding: {PADDING_20PX}`
- Invalid identifiers: `3.1.0` → `V3_1_0`
- Dynamic contexts: Reports error instead of transforming

## Examples

### Before
```typescript
// HTTP status
if (response.status === 200) {
  console.log('Success');
}

// Timeout
setTimeout(() => {
  retry();
}, 5000);

// JSX
<div style={{ padding: '20px', color: '#333' }}>
  <button type="submit">Submit</button>
</div>
```

### After
```typescript
import { HTTP_STATUS, TIMEOUT, DIMENSION, COLOR } from './constants';

// HTTP status
if (response.status === HTTP_STATUS.OK) {
  console.log('Success');
}

// Timeout
setTimeout(() => {
  retry();
}, TIMEOUT.RETRY);

// JSX
<div style={{ padding: {DIMENSION.PADDING_20PX}, color: {COLOR.DARK_GRAY} }}>
  <button type="submit">Submit</button>
</div>
```

## Architecture

```
magic-value-tool/
├── core/           # Main refactoring engine
├── analyzers/      # Context and heuristic analysis
├── handlers/       # Edge case handlers
├── transformers/   # Safe transformation logic
├── config/         # Configuration and whitelists
├── utils/          # Utilities and helpers
└── types/          # TypeScript type definitions
```

## Development

```bash
# Run with file watching
node --experimental-strip-types --watch scripts/magic-value-tool/index.ts

# Debug
node --experimental-strip-types --inspect scripts/magic-value-tool/index.ts
```

## Reports

- Scan results are saved to `reports/magic-value-analysis/`
- Edge case analysis is documented in `docs/03_development/magic-value-refactoring/`

## License

Part of the pub-sub-demo project.
