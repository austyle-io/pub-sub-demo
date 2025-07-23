import template from 'lodash.template';
import { Node, SyntaxKind } from 'ts-morph';
import type { ASTContext } from '../types/index.ts';

export type EdgeCaseHandler = {
  canHandle(node: Node, context: ASTContext): boolean;
  handle(node: Node, context: ASTContext): HandlerResult;
};

export type HandlerResult = {
  skipTransformation: boolean;
  reason?: string;
  suggestedConstants?: Array<{
    name: string;
    value: string | number;
    category: string;
  }>;
  specialTransform?: {
    type: 'jsx-expression' | 'template-literal' | 'type-assertion';
    template: string;
  };
};

export class TypeUnionHandler implements EdgeCaseHandler {
  canHandle(_node: Node, context: ASTContext): boolean {
    return (
      context.semanticContext.isTypeContext &&
      context.parentChain.some((p) => p.getKind() === SyntaxKind.UnionType)
    );
  }

  handle(node: Node, _context: ASTContext): HandlerResult {
    // For type unions, we should not transform the literal
    // but we can suggest creating a constant for runtime use
    const value = node.getText().replace(/['"]/g, '');

    return {
      skipTransformation: true,
      reason: 'Type union literals must remain as literals',
      suggestedConstants: [
        {
          name: this.generateConstantName(value),
          value: value,
          category: 'TYPES',
        },
      ],
    };
  }

  private generateConstantName(value: string): string {
    return `TYPE_${value.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`;
  }
}

export class JSXAttributeHandler implements EdgeCaseHandler {
  private readonly htmlStringAttributes = new Set([
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
    'rel',
    'download',
    'lang',
    'dir',
    'autoComplete',
  ]);

  canHandle(_node: Node, context: ASTContext): boolean {
    return context.semanticContext.isJSXAttribute;
  }

  handle(node: Node, _context: ASTContext): HandlerResult {
    const parent = node.getParent();
    if (!parent || !Node.isJsxAttribute(parent)) {
      return { skipTransformation: false };
    }

    const attrName = parent.getNameNode().getText();

    // Check if this attribute requires a string literal
    if (this.htmlStringAttributes.has(attrName)) {
      // Special handling for 'type' attribute values
      if (attrName === 'type') {
        const value = node.getText().replace(/['"]/g, '');
        if (
          [
            'button',
            'submit',
            'reset',
            'checkbox',
            'radio',
            'text',
            'password',
            'email',
          ].includes(value)
        ) {
          return {
            skipTransformation: true,
            reason: `HTML ${attrName} attribute standard value`,
          };
        }
      }

      return {
        skipTransformation: true,
        reason: `${attrName} attribute requires string literal`,
      };
    }

    // For other attributes, use JSX expression syntax
    return {
      skipTransformation: false,
      specialTransform: {
        type: 'jsx-expression',
        template: '{CONSTANT_NAME}',
      },
    };
  }
}

export class TestDescriptionHandler implements EdgeCaseHandler {
  canHandle(_node: Node, context: ASTContext): boolean {
    return context.semanticContext.isTestContext;
  }

  handle(_node: Node, _context: ASTContext): HandlerResult {
    // Never transform test descriptions
    return {
      skipTransformation: true,
      reason: 'Test descriptions should remain as literals for clarity',
    };
  }
}

export class ArrayIndexHandler implements EdgeCaseHandler {
  canHandle(node: Node, context: ASTContext): boolean {
    return context.semanticContext.isArrayIndex && Node.isNumericLiteral(node);
  }

  handle(node: Node, _context: ASTContext): HandlerResult {
    const value = Number(node.getText());

    // Common array indices should not be transformed
    if (Number.isInteger(value) && value >= -1 && value <= 10) {
      return {
        skipTransformation: true,
        reason: 'Common array index',
      };
    }

    // Large or unusual indices might be worth transforming
    return { skipTransformation: false };
  }
}

export class DynamicContextHandler implements EdgeCaseHandler {
  canHandle(_node: Node, context: ASTContext): boolean {
    return context.semanticContext.isDynamicContext;
  }

  handle(_node: Node, context: ASTContext): HandlerResult {
    // Check if we're in a computed property
    const parent = context.parentChain[0];
    if (parent && Node.isComputedPropertyName(parent)) {
      return {
        skipTransformation: true,
        reason: 'Computed property names require dynamic values',
      };
    }

    // Check if we're in a template literal
    if (context.semanticContext.isTemplateContext) {
      // Use lodash.template to create a template function
      const templateFn = template('${CONSTANT_NAME}');
      return {
        skipTransformation: false,
        specialTransform: {
          type: 'template-literal',
          // Using lodash.template to handle template pattern
          template: templateFn.source || '${CONSTANT_NAME}',
        },
      };
    }

    return {
      skipTransformation: true,
      reason: 'Dynamic context requires runtime values',
    };
  }
}

export class ObjectKeyHandler implements EdgeCaseHandler {
  canHandle(_node: Node, context: ASTContext): boolean {
    return context.semanticContext.isObjectKey;
  }

  handle(node: Node, _context: ASTContext): HandlerResult {
    const parent = node.getParent();

    // If it's a property assignment with quotes, check if quotes are required
    if (
      parent &&
      Node.isPropertyAssignment(parent) &&
      Node.isStringLiteral(node)
    ) {
      const key = node.getText().replace(/['"]/g, '');

      // Check if the key would be valid without quotes
      if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)) {
        return {
          skipTransformation: true,
          reason: 'Object key requires quotes due to special characters',
        };
      }
    }

    return { skipTransformation: false };
  }
}

export class NumericCalculationHandler implements EdgeCaseHandler {
  private readonly commonMultipliers = new Set([
    1,
    2,
    10,
    60,
    100,
    1000,
    1024, // Common multipliers
    24,
    7,
    30,
    365, // Time units
    8,
    16,
    32,
    64,
    128,
    256,
    512, // Binary values
  ]);

  canHandle(node: Node, context: ASTContext): boolean {
    return context.semanticContext.isCalculation && Node.isNumericLiteral(node);
  }

  handle(node: Node, context: ASTContext): HandlerResult {
    const value = Number(node.getText());

    // Check if this is a common multiplier/divisor
    if (this.commonMultipliers.has(value)) {
      const parent = context.parentChain[0];
      if (parent && Node.isBinaryExpression(parent)) {
        const operator = parent.getOperatorToken().getText();

        // These are often used in calculations and might be clearer as literals
        if (operator === '*' || operator === '/') {
          // But we could suggest a constant if the context is clear
          const contextHint = this.getCalculationContext(context);
          if (contextHint) {
            return {
              skipTransformation: false,
              suggestedConstants: [
                {
                  name: contextHint.name,
                  value: value,
                  category: contextHint.category,
                },
              ],
            };
          }

          return {
            skipTransformation: true,
            reason: `Common ${operator === '*' ? 'multiplier' : 'divisor'} in calculation`,
          };
        }
      }
    }

    return { skipTransformation: false };
  }

  private getCalculationContext(
    context: ASTContext,
  ): { name: string; category: string } | null {
    // Look for hints in variable names or comments
    const hints = context.scope.functionName || '';

    if (hints.includes('byte') || hints.includes('size')) {
      return { name: 'BYTES_PER_KB', category: 'UNITS' };
    }
    if (
      hints.includes('time') ||
      hints.includes('second') ||
      hints.includes('minute')
    ) {
      return { name: 'MS_PER_SECOND', category: 'TIME' };
    }

    return null;
  }
}

export class EmptyValueHandler implements EdgeCaseHandler {
  canHandle(node: Node, _context: ASTContext): boolean {
    if (Node.isStringLiteral(node)) {
      const value = node.getText().slice(1, -1); // Remove quotes
      return value === '';
    }
    if (Node.isNumericLiteral(node)) {
      return node.getText() === '0';
    }
    return false;
  }

  handle(node: Node, context: ASTContext): HandlerResult {
    // Empty strings and zero often have semantic meaning
    // Check the context to determine if transformation makes sense

    if (Node.isStringLiteral(node)) {
      // Empty string in initialization or default value
      if (this.isInitialization(context) || this.isDefaultValue(context)) {
        return {
          skipTransformation: true,
          reason: 'Empty string initialization',
        };
      }

      // Empty string in comparison might be worth a constant
      if (context.semanticContext.isComparison) {
        return {
          skipTransformation: false,
          suggestedConstants: [
            {
              name: 'EMPTY_STRING',
              value: '',
              category: 'COMMON',
            },
          ],
        };
      }
    }

    if (Node.isNumericLiteral(node) && node.getText() === '0') {
      // Zero in array index or initialization
      if (
        context.semanticContext.isArrayIndex ||
        this.isInitialization(context)
      ) {
        return {
          skipTransformation: true,
          reason: 'Zero initialization or index',
        };
      }
    }

    return { skipTransformation: false };
  }

  private isInitialization(context: ASTContext): boolean {
    const parent = context.parentChain[0];
    return !!(
      parent &&
      (Node.isVariableDeclaration(parent) ||
        Node.isPropertyDeclaration(parent) ||
        Node.isPropertyAssignment(parent))
    );
  }

  private isDefaultValue(context: ASTContext): boolean {
    const parent = context.parentChain[0];
    return !!(
      parent &&
      (Node.isParameterDeclaration(parent) ||
        (Node.isBinaryExpression(parent) &&
          parent.getOperatorToken().getText() === '||'))
    );
  }
}

// Main edge case handler that combines all handlers
export class EdgeCaseHandlerManager {
  private handlers: EdgeCaseHandler[] = [
    new TypeUnionHandler(),
    new JSXAttributeHandler(),
    new TestDescriptionHandler(),
    new ArrayIndexHandler(),
    new DynamicContextHandler(),
    new ObjectKeyHandler(),
    new NumericCalculationHandler(),
    new EmptyValueHandler(),
  ];

  handle(node: Node, context: ASTContext): HandlerResult {
    // Find the first handler that can handle this case
    for (const handler of this.handlers) {
      if (handler.canHandle(node, context)) {
        return handler.handle(node, context);
      }
    }

    // No special handling needed
    return { skipTransformation: false };
  }

  addHandler(handler: EdgeCaseHandler): void {
    this.handlers.push(handler);
  }
}
