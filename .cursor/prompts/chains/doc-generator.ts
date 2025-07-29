#!/usr/bin/env node --experimental-strip-types

/**
 * Autonomous Documentation Generator
 *
 * Uses AST analysis to automatically generate JSDoc comments for TypeScript files.
 * Can be used standalone or integrated with the agent runner.
 *
 * @module chains/doc-generator
 * @since 1.0.0
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { parse } from '@typescript-eslint/parser';
import { AST_NODE_TYPES } from '@typescript-eslint/types';
import type { TSESTree } from '@typescript-eslint/types';

/**
 * Documentation context for generating appropriate comments.
 * @since 1.0.0
 */
interface DocContext {
  fileName: string;
  moduleName: string;
  isTest: boolean;
  isComponent: boolean;
  isHook: boolean;
  isUtility: boolean;
}

/**
 * Generate JSDoc for a function or method.
 * @since 1.0.0
 */
function generateFunctionDoc(
  node:
    | TSESTree.FunctionDeclaration
    | TSESTree.MethodDefinition
    | TSESTree.ArrowFunctionExpression,
  context: DocContext,
): string {
  const lines: string[] = ['/**'];

  // Add description based on function name and context
  const name =
    ('id' in node && node.id?.name) ||
    ('key' in node && node.key?.type === 'Identifier' && node.key.name) ||
    'Unknown';

  if (context.isTest && name.startsWith('test')) {
    lines.push(
      ` * Tests ${name
        .replace(/^test/, '')
        .replace(/([A-Z])/g, ' $1')
        .toLowerCase()
        .trim()}.`,
    );
  } else if (context.isHook && name.startsWith('use')) {
    lines.push(
      ` * React hook for ${name
        .replace(/^use/, '')
        .replace(/([A-Z])/g, ' $1')
        .toLowerCase()
        .trim()}.`,
    );
  } else if (name.startsWith('handle')) {
    lines.push(
      ` * Handles ${name
        .replace(/^handle/, '')
        .replace(/([A-Z])/g, ' $1')
        .toLowerCase()
        .trim()} events.`,
    );
  } else if (name.startsWith('get')) {
    lines.push(
      ` * Retrieves ${name
        .replace(/^get/, '')
        .replace(/([A-Z])/g, ' $1')
        .toLowerCase()
        .trim()}.`,
    );
  } else if (name.startsWith('set')) {
    lines.push(
      ` * Sets ${name
        .replace(/^set/, '')
        .replace(/([A-Z])/g, ' $1')
        .toLowerCase()
        .trim()}.`,
    );
  } else if (name.startsWith('is') || name.startsWith('has')) {
    lines.push(
      ` * Checks if ${name
        .replace(/^(is|has)/, '')
        .replace(/([A-Z])/g, ' $1')
        .toLowerCase()
        .trim()}.`,
    );
  } else {
    lines.push(` * ${name.replace(/([A-Z])/g, ' $1').trim()}.`);
  }

  lines.push(' * ');

  // Add parameters
  const params = node.params || [];
  if (params.length > 0) {
    params.forEach((param) => {
      if (param.type === 'Identifier') {
        lines.push(` * @param ${param.name} - TODO: Add description`);
      } else if (param.type === 'ObjectPattern') {
        lines.push(` * @param options - Configuration options`);
      }
    });
  }

  // Add return type
  if (node.type !== 'MethodDefinition' || node.kind !== 'constructor') {
    const returnType = 'returnType' in node && node.returnType;
    if (returnType) {
      lines.push(` * @returns TODO: Add description`);
    } else if (!name.startsWith('set') && !name.includes('void')) {
      lines.push(` * @returns TODO: Add description`);
    }
  }

  // Add common tags
  if (node.async) {
    lines.push(` * @async`);
  }

  lines.push(` * @since 1.0.0`);

  // Add example for public APIs
  if (!context.isTest && !name.startsWith('_')) {
    lines.push(' * ');
    lines.push(' * @example');
    lines.push(' * ```typescript');
    lines.push(` * // TODO: Add usage example`);
    lines.push(' * ```');
  }

  lines.push(' */');

  return lines.join('\n');
}

/**
 * Generate JSDoc for a class.
 * @since 1.0.0
 */
function generateClassDoc(
  node: TSESTree.ClassDeclaration,
  context: DocContext,
): string {
  const lines: string[] = ['/**'];

  const className = node.id?.name || 'UnknownClass';

  if (context.isComponent) {
    lines.push(
      ` * React component for ${className
        .replace(/([A-Z])/g, ' $1')
        .toLowerCase()
        .trim()}.`,
    );
  } else if (className.includes('Service')) {
    lines.push(
      ` * Service class for ${className
        .replace('Service', '')
        .replace(/([A-Z])/g, ' $1')
        .toLowerCase()
        .trim()} operations.`,
    );
  } else if (className.includes('Error')) {
    lines.push(
      ` * Custom error class for ${className
        .replace('Error', '')
        .replace(/([A-Z])/g, ' $1')
        .toLowerCase()
        .trim()} errors.`,
    );
  } else {
    lines.push(` * ${className.replace(/([A-Z])/g, ' $1').trim()} class.`);
  }

  lines.push(' * ');
  lines.push(' * TODO: Add detailed description');
  lines.push(' * ');
  lines.push(' * @since 1.0.0');

  // Add example
  lines.push(' * ');
  lines.push(' * @example');
  lines.push(' * ```typescript');
  lines.push(` * const instance = new ${className}();`);
  lines.push(' * // TODO: Add usage example');
  lines.push(' * ```');

  lines.push(' */');

  return lines.join('\n');
}

/**
 * Generate JSDoc for a type alias or interface.
 * @since 1.0.0
 */
function generateTypeDoc(
  node: TSESTree.TSTypeAliasDeclaration | TSESTree.TSInterfaceDeclaration,
  context: DocContext,
): string {
  const lines: string[] = ['/**'];

  const typeName = node.id.name;

  if (typeName.endsWith('Props')) {
    lines.push(` * Props for ${typeName.replace('Props', '')} component.`);
  } else if (typeName.endsWith('Options')) {
    lines.push(
      ` * Configuration options for ${typeName.replace('Options', '')}.`,
    );
  } else if (typeName.endsWith('Config')) {
    lines.push(` * Configuration for ${typeName.replace('Config', '')}.`);
  } else if (typeName.startsWith('I')) {
    lines.push(
      ` * Interface for ${typeName
        .substring(1)
        .replace(/([A-Z])/g, ' $1')
        .toLowerCase()
        .trim()}.`,
    );
  } else {
    lines.push(
      ` * Type definition for ${typeName
        .replace(/([A-Z])/g, ' $1')
        .toLowerCase()
        .trim()}.`,
    );
  }

  lines.push(' * ');
  lines.push(' * @since 1.0.0');

  lines.push(' */');

  return lines.join('\n');
}

/**
 * Generate JSDoc for exported constants.
 * @since 1.0.0
 */
function generateConstantDoc(
  node: TSESTree.VariableDeclarator,
  context: DocContext,
): string {
  const lines: string[] = ['/**'];

  const name = node.id.type === 'Identifier' ? node.id.name : 'Unknown';

  if (name === name.toUpperCase()) {
    lines.push(` * ${name.replace(/_/g, ' ').toLowerCase()} constant.`);
  } else if (name.startsWith('default')) {
    lines.push(
      ` * Default ${name
        .replace('default', '')
        .replace(/([A-Z])/g, ' $1')
        .toLowerCase()
        .trim()}.`,
    );
  } else {
    lines.push(` * ${name.replace(/([A-Z])/g, ' $1').trim()}.`);
  }

  lines.push(' * @since 1.0.0');
  lines.push(' */');

  return lines.join('\n');
}

/**
 * Process a TypeScript file and add JSDoc comments.
 * @since 1.0.0
 */
export function processFile(filePath: string): {
  original: string;
  modified: string;
  added: number;
} {
  const content = readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  // Parse the file
  const ast = parse(content, {
    loc: true,
    range: true,
    tokens: true,
    comment: true,
    errorOnUnknownASTType: false,
    ecmaVersion: 'latest',
    sourceType: 'module',
  });

  // Determine context
  const context: DocContext = {
    fileName: filePath,
    moduleName: filePath.replace(/^.*\//, '').replace(/\.(ts|tsx)$/, ''),
    isTest: filePath.includes('.test.') || filePath.includes('.spec.'),
    isComponent: filePath.endsWith('.tsx') && !filePath.includes('.test.'),
    isHook: filePath.includes('/hooks/') || filePath.includes('use'),
    isUtility: filePath.includes('/utils/') || filePath.includes('/utilities/'),
  };

  const additions: { line: number; doc: string }[] = [];

  // Walk the AST
  function visit(node: any) {
    if (!node || !node.type) return;

    // Check if node already has JSDoc
    const startLine = node.loc?.start.line || 0;
    const hasJSDoc =
      startLine > 1 && lines[startLine - 2].trim().startsWith('*/');

    if (!hasJSDoc) {
      switch (node.type) {
        case AST_NODE_TYPES.FunctionDeclaration:
          if (node.id) {
            additions.push({
              line: startLine,
              doc: generateFunctionDoc(node, context),
            });
          }
          break;

        case AST_NODE_TYPES.ClassDeclaration:
          if (node.id) {
            additions.push({
              line: startLine,
              doc: generateClassDoc(node, context),
            });
          }
          break;

        case AST_NODE_TYPES.TSTypeAliasDeclaration:
        case AST_NODE_TYPES.TSInterfaceDeclaration:
          additions.push({
            line: startLine,
            doc: generateTypeDoc(node, context),
          });
          break;

        case AST_NODE_TYPES.VariableDeclaration:
          if (node.declarations?.[0] && node.kind === 'const') {
            const decl = node.declarations[0];
            if (
              decl.id.type === 'Identifier' &&
              /^[A-Z_]+$/.test(decl.id.name)
            ) {
              additions.push({
                line: startLine,
                doc: generateConstantDoc(decl, context),
              });
            }
          }
          break;

        case AST_NODE_TYPES.ExportNamedDeclaration:
          if (node.declaration) {
            visit(node.declaration);
          }
          break;
      }
    }

    // Visit children
    for (const key in node) {
      const value = node[key];
      if (Array.isArray(value)) {
        value.forEach(visit);
      } else if (typeof value === 'object' && value !== null) {
        visit(value);
      }
    }
  }

  visit(ast);

  // Apply additions in reverse order to maintain line numbers
  additions.sort((a, b) => b.line - a.line);

  const modifiedLines = [...lines];
  additions.forEach(({ line, doc }) => {
    const indent = lines[line - 1].match(/^(\s*)/)?.[1] || '';
    const docLines = doc.split('\n').map((l) => indent + l);
    modifiedLines.splice(line - 1, 0, ...docLines);
  });

  return {
    original: content,
    modified: modifiedLines.join('\n'),
    added: additions.length,
  };
}

/**
 * Main CLI interface for the documentation generator.
 * @since 1.0.0
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const filePath = process.argv[2];

  if (!filePath) {
    console.log('Usage: doc-generator.ts <file-path>');
    console.log('');
    console.log('Example: doc-generator.ts src/utils/logger.ts');
    process.exit(1);
  }

  try {
    const result = processFile(filePath);

    if (result.added === 0) {
      console.log('✅ File already has complete documentation');
    } else {
      // Create backup
      writeFileSync(`${filePath}.backup`, result.original);

      // Write modified file
      writeFileSync(filePath, result.modified);

      console.log(`✅ Added ${result.added} JSDoc comments to ${filePath}`);
      console.log(`📄 Backup saved to ${filePath}.backup`);
    }
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}
