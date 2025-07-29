import { Node, type SourceFile } from 'ts-morph';
import type {
  ASTContext,
  Transformation,
  TransformError,
} from '../types/index.ts';

export class SafeTransformer {
  transform(
    node: Node,
    constantName: string,
    importPath: string,
    context: ASTContext,
  ): {
    success: boolean;
    transformation?: Transformation;
    error?: TransformError;
  } {
    // Validate transformation safety
    const validation = this.validateTransformation(node, constantName, context);
    if (!validation.valid) {
      return {
        success: false,
        error: {
          message: validation.reason,
          location: this.getLocation(node),
          value: node.getText(),
          reason: validation.reason,
        },
      };
    }

    // Determine transformation strategy based on context
    const strategy = this.getTransformationStrategy(context);

    try {
      const transformation = this.applyTransformation(
        node,
        constantName,
        importPath,
        strategy,
      );
      return { success: true, transformation };
    } catch (error) {
      return {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : 'Unknown transformation error',
          location: this.getLocation(node),
          value: node.getText(),
          reason: 'Transformation failed',
        },
      };
    }
  }

  private validateTransformation(
    node: Node,
    constantName: string,
    context: ASTContext,
  ): { valid: boolean; reason: string } {
    // Check if we're in a type context
    if (context.semanticContext.isTypeContext) {
      return { valid: false, reason: 'Cannot transform type literals' };
    }

    // Check if we're in a test description
    if (context.semanticContext.isTestContext) {
      return { valid: false, reason: 'Cannot transform test descriptions' };
    }

    // Check if constant name is valid
    if (!this.isValidIdentifier(constantName)) {
      return { valid: false, reason: `Invalid constant name: ${constantName}` };
    }

    // Check if we're in a JSX attribute that requires a string literal
    if (context.semanticContext.isJSXAttribute) {
      const parent = node.getParent();
      if (parent && Node.isJsxAttribute(parent)) {
        const attrName = parent.getNameNode().getText();
        if (this.requiresStringLiteral(attrName)) {
          return {
            valid: false,
            reason: `JSX attribute '${attrName}' requires string literal`,
          };
        }
      }
    }

    // Check if we're in a dynamic context
    if (context.semanticContext.isDynamicContext) {
      return { valid: false, reason: 'Cannot transform in dynamic context' };
    }

    // Check if it's an array index
    if (context.semanticContext.isArrayIndex && Node.isNumericLiteral(node)) {
      const value = Number(node.getText());
      if (value >= 0 && value <= 10 && Number.isInteger(value)) {
        return { valid: false, reason: 'Common array index' };
      }
    }

    return { valid: true, reason: '' };
  }

  private getTransformationStrategy(
    context: ASTContext,
  ): TransformationStrategy {
    // JSX attributes need special handling
    if (context.semanticContext.isJSXAttribute) {
      return 'jsx-attribute';
    }

    // Object properties might need quotes
    if (context.semanticContext.isObjectKey) {
      return 'object-key';
    }

    // Template literals need expression syntax
    if (context.semanticContext.isTemplateContext) {
      return 'template-expression';
    }

    // Default strategy
    return 'standard';
  }

  private applyTransformation(
    node: Node,
    constantName: string,
    importPath: string,
    strategy: TransformationStrategy,
  ): Transformation {
    const original = node.getText();
    let replacement: string;

    switch (strategy) {
      case 'jsx-attribute':
        // In JSX attributes, we need to use curly braces
        replacement = `{${constantName}}`;
        break;

      case 'object-key': {
        // For object keys, check if quotes are needed
        const parent = node.getParent();
        if (parent && Node.isPropertyAssignment(parent)) {
          const keyNode = parent.getNameNode();
          if (keyNode === node && Node.isStringLiteral(keyNode)) {
            // Keep quotes if the original had them
            replacement = constantName;
          } else {
            replacement = constantName;
          }
        } else {
          replacement = constantName;
        }
        break;
      }

      case 'template-expression':
        // In template literals, use ${} syntax
        replacement = `\${${constantName}}`;
        break;
      default:
        replacement = constantName;
        break;
    }

    // Handle import addition
    this.ensureImport(node.getSourceFile(), constantName, importPath);

    return {
      original,
      replacement,
      constantName,
      importPath,
      location: this.getLocation(node),
    };
  }

  private ensureImport(
    sourceFile: SourceFile,
    constantName: string,
    importPath: string,
  ): void {
    // Extract the category from the constant name (e.g., HTTP_STATUS from HTTP_STATUS_OK)
    const parts = constantName.split('_');
    const category = parts.length > 1 ? (parts[0] ?? 'constants') : 'constants';

    // Check if import already exists
    const existingImport = sourceFile.getImportDeclaration(importPath);

    if (existingImport) {
      // Add to existing import
      const namedImports = existingImport.getNamedImports();
      const hasCategory = namedImports.some(
        (imp) => imp.getName() === category,
      );

      if (!hasCategory) {
        existingImport.addNamedImport(category);
      }
    } else {
      // Create new import
      sourceFile.addImportDeclaration({
        moduleSpecifier: importPath,
        namedImports: [category],
      });
    }
  }

  private isValidIdentifier(name: string): boolean {
    // Check if it's a valid JavaScript identifier
    if (!name || name.length === 0) return false;

    // Must start with letter, underscore, or dollar sign
    if (!/^[a-zA-Z_$]/.test(name)) return false;

    // Rest can be letters, digits, underscores, or dollar signs
    if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name)) return false;

    // Check it's not a reserved word
    const reserved = [
      'break',
      'case',
      'catch',
      'class',
      'const',
      'continue',
      'debugger',
      'default',
      'delete',
      'do',
      'else',
      'export',
      'extends',
      'finally',
      'for',
      'function',
      'if',
      'import',
      'in',
      'instanceof',
      'new',
      'return',
      'super',
      'switch',
      'this',
      'throw',
      'try',
      'typeof',
      'var',
      'void',
      'while',
      'with',
      'yield',
    ];

    return !reserved.includes(name.toLowerCase());
  }

  private requiresStringLiteral(attributeName: string): boolean {
    // HTML attributes that must be string literals
    const stringOnlyAttributes = [
      'type',
      'name',
      'id',
      'className',
      'href',
      'src',
      'alt',
      'placeholder',
      'value',
      'title',
      'role',
      'aria-label',
      'data-testid',
      'htmlFor',
      'method',
      'action',
      'target',
    ];

    return stringOnlyAttributes.includes(attributeName);
  }

  private getLocation(node: Node): import('../types').LocationInfo {
    const sourceFile = node.getSourceFile();
    const start = node.getStart();
    const { line, column } = sourceFile.getLineAndColumnAtPos(start);

    return {
      file: sourceFile.getFilePath(),
      line,
      column,
      lineText: sourceFile.getFullText().split('\n')[line - 1]?.trim() ?? '',
    };
  }
}

type TransformationStrategy =
  | 'standard'
  | 'jsx-attribute'
  | 'object-key'
  | 'template-expression';
