#!/usr/bin/env node --experimental-strip-types

/**
 * Simple Documentation Generator
 *
 * A regex-based JSDoc generator that adds documentation to TypeScript files
 * without requiring AST parsing. Designed for quick documentation addition.
 *
 * @module chains/simple-doc-generator
 * @since 1.0.0
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname } from 'node:path';

/**
 * Pattern matches for different code constructs.
 * @since 1.0.0
 */
const patterns = {
  // Export function/const with arrow function
  exportFunction:
    /^export\s+(const|function)\s+(\w+)\s*(?::\s*[^=]+)?\s*=\s*(?:async\s+)?\(/gm,
  // Export regular function
  exportRegularFunction: /^export\s+(?:async\s+)?function\s+(\w+)\s*\(/gm,
  // Export class
  exportClass: /^export\s+(?:abstract\s+)?class\s+(\w+)/gm,
  // Export interface or type
  exportType: /^export\s+(?:interface|type)\s+(\w+)/gm,
  // Export const (non-function)
  exportConst: /^export\s+const\s+(\w+)\s*(?::\s*[^=]+)?\s*=\s*(?!.*=>\s*)/gm,
  // React component (function that returns JSX)
  reactComponent:
    /^export\s+(?:const|function)\s+([A-Z]\w+).*?(?::\s*(?:React\.)?(?:FC|FunctionComponent|VFC)|=>.*?JSX\.Element)/gm,
  // React hook
  reactHook: /^export\s+(?:const|function)\s+(use[A-Z]\w+)/gm,
  // Already has JSDoc
  hasJSDoc: /\/\*\*[\s\S]*?\*\/\s*$/,
};

/**
 * Generate appropriate JSDoc based on the construct name and type.
 *
 * @param name - Name of the construct
 * @param type - Type of construct (function, class, type, etc.)
 * @param filePath - Path to the file for context
 * @returns Generated JSDoc comment
 * @since 1.0.0
 */
function generateJSDoc(name: string, type: string, filePath: string): string {
  const fileName = basename(filePath);
  const isTest = fileName.includes('.test.') || fileName.includes('.spec.');
  const isHook = name.startsWith('use');
  const isComponent = /^[A-Z]/.test(name) && fileName.endsWith('.tsx');

  const lines: string[] = ['/**'];

  // Generate description based on name and type
  switch (type) {
    case 'component':
      lines.push(
        ` * React component for ${name
          .replace(/([A-Z])/g, ' $1')
          .trim()
          .toLowerCase()}.`,
      );
      break;
    case 'hook':
      lines.push(
        ` * React hook for ${name
          .replace(/^use/, '')
          .replace(/([A-Z])/g, ' $1')
          .trim()
          .toLowerCase()}.`,
      );
      break;
    case 'class':
      if (name.includes('Service')) {
        lines.push(
          ` * Service for ${name
            .replace('Service', '')
            .replace(/([A-Z])/g, ' $1')
            .trim()
            .toLowerCase()} operations.`,
        );
      } else if (name.includes('Error')) {
        lines.push(
          ` * Error class for ${name
            .replace('Error', '')
            .replace(/([A-Z])/g, ' $1')
            .trim()
            .toLowerCase()} errors.`,
        );
      } else {
        lines.push(` * ${name.replace(/([A-Z])/g, ' $1').trim()} class.`);
      }
      break;
    case 'type':
    case 'interface':
      if (name.endsWith('Props')) {
        lines.push(` * Props for the ${name.replace('Props', '')} component.`);
      } else if (name.endsWith('Options')) {
        lines.push(
          ` * Options for ${name
            .replace('Options', '')
            .replace(/([A-Z])/g, ' $1')
            .trim()
            .toLowerCase()}.`,
        );
      } else if (name.endsWith('Config')) {
        lines.push(
          ` * Configuration for ${name
            .replace('Config', '')
            .replace(/([A-Z])/g, ' $1')
            .trim()
            .toLowerCase()}.`,
        );
      } else {
        lines.push(
          ` * Type definition for ${name
            .replace(/([A-Z])/g, ' $1')
            .trim()
            .toLowerCase()}.`,
        );
      }
      break;
    case 'const':
      if (name === name.toUpperCase()) {
        lines.push(` * ${name.replace(/_/g, ' ').toLowerCase()} constant.`);
      } else {
        lines.push(` * ${name.replace(/([A-Z])/g, ' $1').trim()}.`);
      }
      break;
    default:
      // Function
      if (name.startsWith('handle')) {
        lines.push(
          ` * Handles ${name
            .replace(/^handle/, '')
            .replace(/([A-Z])/g, ' $1')
            .trim()
            .toLowerCase()} events.`,
        );
      } else if (name.startsWith('get')) {
        lines.push(
          ` * Gets ${name
            .replace(/^get/, '')
            .replace(/([A-Z])/g, ' $1')
            .trim()
            .toLowerCase()}.`,
        );
      } else if (name.startsWith('set')) {
        lines.push(
          ` * Sets ${name
            .replace(/^set/, '')
            .replace(/([A-Z])/g, ' $1')
            .trim()
            .toLowerCase()}.`,
        );
      } else if (name.startsWith('is') || name.startsWith('has')) {
        lines.push(
          ` * Checks if ${name
            .replace(/^(is|has)/, '')
            .replace(/([A-Z])/g, ' $1')
            .trim()
            .toLowerCase()}.`,
        );
      } else if (name.startsWith('validate')) {
        lines.push(
          ` * Validates ${name
            .replace(/^validate/, '')
            .replace(/([A-Z])/g, ' $1')
            .trim()
            .toLowerCase()}.`,
        );
      } else if (name.startsWith('create')) {
        lines.push(
          ` * Creates ${name
            .replace(/^create/, '')
            .replace(/([A-Z])/g, ' $1')
            .trim()
            .toLowerCase()}.`,
        );
      } else {
        lines.push(` * ${name.replace(/([A-Z])/g, ' $1').trim()}.`);
      }
  }

  // Add @since tag
  lines.push(' * @since 1.0.0');

  // Close JSDoc
  lines.push(' */');

  return lines.join('\n');
}

/**
 * Process a file and add JSDoc comments where missing.
 *
 * @param filePath - Path to the TypeScript file
 * @returns Object containing processing results
 * @since 1.0.0
 */
export function processFile(filePath: string): {
  processed: boolean;
  added: number;
  error?: string;
  backup?: string;
} {
  if (!existsSync(filePath)) {
    return { processed: false, added: 0, error: 'File not found' };
  }

  const content = readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let modified = false;
  let addedCount = 0;

  // Process line by line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Skip if previous line already has JSDoc
    if (i > 0 && lines[i - 1].trim().endsWith('*/')) {
      continue;
    }

    // Check for React components
    if (patterns.reactComponent.test(trimmedLine)) {
      const match = trimmedLine.match(/(?:const|function)\s+([A-Z]\w+)/);
      if (match) {
        const indent = line.match(/^(\s*)/)?.[1] || '';
        const jsdoc = generateJSDoc(match[1], 'component', filePath);
        lines.splice(i, 0, ...jsdoc.split('\n').map((l) => indent + l));
        i += jsdoc.split('\n').length;
        modified = true;
        addedCount++;
      }
    }
    // Check for React hooks
    else if (patterns.reactHook.test(trimmedLine)) {
      const match = trimmedLine.match(/(?:const|function)\s+(use[A-Z]\w+)/);
      if (match) {
        const indent = line.match(/^(\s*)/)?.[1] || '';
        const jsdoc = generateJSDoc(match[1], 'hook', filePath);
        lines.splice(i, 0, ...jsdoc.split('\n').map((l) => indent + l));
        i += jsdoc.split('\n').length;
        modified = true;
        addedCount++;
      }
    }
    // Check for exported functions
    else if (
      trimmedLine.match(/^export\s+(async\s+)?function\s+\w+/) ||
      trimmedLine.match(
        /^export\s+const\s+\w+\s*(?::\s*[^=]+)?\s*=\s*(?:async\s+)?\(/,
      )
    ) {
      const match = trimmedLine.match(/(?:function|const)\s+(\w+)/);
      if (match) {
        const indent = line.match(/^(\s*)/)?.[1] || '';
        const jsdoc = generateJSDoc(match[1], 'function', filePath);
        lines.splice(i, 0, ...jsdoc.split('\n').map((l) => indent + l));
        i += jsdoc.split('\n').length;
        modified = true;
        addedCount++;
      }
    }
    // Check for exported classes
    else if (trimmedLine.match(/^export\s+(?:abstract\s+)?class\s+\w+/)) {
      const match = trimmedLine.match(/class\s+(\w+)/);
      if (match) {
        const indent = line.match(/^(\s*)/)?.[1] || '';
        const jsdoc = generateJSDoc(match[1], 'class', filePath);
        lines.splice(i, 0, ...jsdoc.split('\n').map((l) => indent + l));
        i += jsdoc.split('\n').length;
        modified = true;
        addedCount++;
      }
    }
    // Check for exported types/interfaces
    else if (trimmedLine.match(/^export\s+(?:type|interface)\s+\w+/)) {
      const match = trimmedLine.match(/(?:type|interface)\s+(\w+)/);
      if (match) {
        const indent = line.match(/^(\s*)/)?.[1] || '';
        const jsdoc = generateJSDoc(match[1], 'type', filePath);
        lines.splice(i, 0, ...jsdoc.split('\n').map((l) => indent + l));
        i += jsdoc.split('\n').length;
        modified = true;
        addedCount++;
      }
    }
    // Check for exported constants (non-functions)
    else if (
      trimmedLine.match(/^export\s+const\s+\w+\s*(?::\s*[^=]+)?\s*=\s*[^(]/)
    ) {
      const match = trimmedLine.match(/const\s+(\w+)/);
      if (match && !trimmedLine.includes('=>')) {
        const indent = line.match(/^(\s*)/)?.[1] || '';
        const jsdoc = generateJSDoc(match[1], 'const', filePath);
        lines.splice(i, 0, ...jsdoc.split('\n').map((l) => indent + l));
        i += jsdoc.split('\n').length;
        modified = true;
        addedCount++;
      }
    }
  }

  if (modified) {
    // Create backup
    const backupPath = `${filePath}.backup`;
    writeFileSync(backupPath, content);

    // Write modified content
    writeFileSync(filePath, lines.join('\n'));

    return { processed: true, added: addedCount, backup: backupPath };
  }

  return { processed: true, added: 0 };
}

/**
 * Process multiple files in a directory.
 *
 * @param files - Array of file paths
 * @returns Summary of processing results
 * @since 1.0.0
 */
export function processFiles(files: string[]): {
  total: number;
  processed: number;
  totalAdded: number;
  errors: string[];
} {
  const results = {
    total: files.length,
    processed: 0,
    totalAdded: 0,
    errors: [] as string[],
  };

  for (const file of files) {
    console.log(`Processing ${file}...`);
    const result = processFile(file);

    if (result.error) {
      results.errors.push(`${file}: ${result.error}`);
    } else if (result.processed) {
      results.processed++;
      results.totalAdded += result.added;

      if (result.added > 0) {
        console.log(`  ✅ Added ${result.added} JSDoc comments`);
      } else {
        console.log(`  ✓ Already documented`);
      }
    }
  }

  return results;
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: simple-doc-generator.ts <file-path> [file-path...]');
    console.log('');
    console.log('Examples:');
    console.log('  simple-doc-generator.ts src/utils/logger.ts');
    console.log('  simple-doc-generator.ts src/**/*.ts');
    process.exit(1);
  }

  // Process files
  const results = processFiles(args);

  console.log('\n📊 Summary:');
  console.log(`  Total files: ${results.total}`);
  console.log(`  Processed: ${results.processed}`);
  console.log(`  JSDoc added: ${results.totalAdded}`);

  if (results.errors.length > 0) {
    console.log(`  Errors: ${results.errors.length}`);
    results.errors.forEach((err) => console.log(`    - ${err}`));
  }
}
