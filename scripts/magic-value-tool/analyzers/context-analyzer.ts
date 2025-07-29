import { Node, type SourceFile, SyntaxKind } from 'ts-morph';
import type {
  ASTContext,
  FileContext,
  ScopeInfo,
  SemanticContext,
} from '../types/index.ts';

export class ContextAnalyzer {
  analyzeContext(node: Node, sourceFile: SourceFile): ASTContext {
    const parentChain = this.getParentChain(node);
    const scope = this.analyzeScopeInfo(node);
    const fileContext = this.analyzeFileContext(sourceFile);
    const semanticContext = this.analyzeSemanticContext(node, parentChain);

    return {
      node,
      nodeType: node.getKind(),
      parentChain,
      scope,
      fileContext,
      semanticContext,
    };
  }

  private getParentChain(node: Node): Node[] {
    const chain: Node[] = [];
    let current = node.getParent();

    while (current) {
      chain.push(current);
      current = current.getParent();
    }

    return chain;
  }

  private analyzeScopeInfo(node: Node): ScopeInfo {
    const scope: ScopeInfo = {
      blockDepth: 0,
      variableDeclarations: new Map(),
    };

    let current = node;
    while (current) {
      if (
        Node.isFunctionDeclaration(current) ||
        Node.isMethodDeclaration(current)
      ) {
        scope.functionName = current.getName();
      } else if (Node.isClassDeclaration(current)) {
        scope.className = current.getName();
      } else if (Node.isBlock(current)) {
        scope.blockDepth++;
      }

      // Collect variable declarations in scope
      if (Node.isVariableStatement(current)) {
        for (const decl of current.getDeclarations()) {
          const name = decl.getName();
          scope.variableDeclarations.set(name, decl);
        }
      }

      current = current.getParent() as Node;
      if (!current) break;
    }

    return scope;
  }

  private analyzeFileContext(sourceFile: SourceFile): FileContext {
    const filePath = sourceFile.getFilePath();
    const imports = sourceFile.getImportDeclarations().map((imp) => ({
      moduleSpecifier: imp.getModuleSpecifierValue(),
      namedImports: imp.getNamedImports().map((n) => n.getName()),
      defaultImport: imp.getDefaultImport()?.getText(),
    }));

    const isTest = /\.(test|spec)\.(ts|tsx|js|jsx)$/.test(filePath);
    const isConfig =
      /\.(config|conf|rc)\.(ts|tsx|js|jsx|json)$/.test(filePath) ||
      filePath.includes('config/');

    let framework: FileContext['framework'] = 'unknown';
    if (imports.some((i) => i.moduleSpecifier.includes('react'))) {
      framework = 'react';
    } else if (imports.some((i) => i.moduleSpecifier.includes('vue'))) {
      framework = 'vue';
    } else if (!filePath.includes('client') && !filePath.includes('browser')) {
      framework = 'node';
    }

    return {
      filePath,
      sourceFile,
      imports,
      isTest,
      isConfig,
      framework,
    };
  }

  private analyzeSemanticContext(
    node: Node,
    parentChain: Node[],
  ): SemanticContext {
    const context: SemanticContext = {
      isTypeContext: this.isInTypeContext(node, parentChain),
      isJSXContext: this.isInJSXContext(node, parentChain),
      isJSXAttribute: this.isJSXAttribute(node, parentChain),
      isTestContext: this.isInTestContext(node, parentChain),
      isConfigContext: this.isInConfigContext(node, parentChain),
      isTemplateContext: this.isInTemplateContext(node, parentChain),
      isDynamicContext: this.isInDynamicContext(node, parentChain),
      isArrayIndex: this.isArrayIndex(node, parentChain),
      isObjectKey: this.isObjectKey(node, parentChain),
      isEnumValue: this.isEnumValue(node, parentChain),
      isFunctionParameter: this.isFunctionParameter(node, parentChain),
      isReturnValue: this.isReturnValue(node, parentChain),
      isConditional: this.isConditional(node, parentChain),
      isComparison: this.isComparison(node, parentChain),
      isCalculation: this.isCalculation(node, parentChain),
    };

    return context;
  }

  private isInTypeContext(_node: Node, parentChain: Node[]): boolean {
    return parentChain.some(
      (parent) =>
        Node.isTypeAliasDeclaration(parent) ||
        Node.isInterfaceDeclaration(parent) ||
        Node.isTypeLiteral(parent) ||
        Node.isTypeReference(parent) ||
        Node.isUnionTypeNode(parent) ||
        Node.isIntersectionTypeNode(parent) ||
        parent.getKind() === SyntaxKind.TypeParameter ||
        Node.isAsExpression(parent) ||
        Node.isTypeAssertion(parent) ||
        parent.getKind() === SyntaxKind.TypeQuery ||
        parent.getKind() === SyntaxKind.TypeOperator,
    );
  }

  private isInJSXContext(_node: Node, parentChain: Node[]): boolean {
    return parentChain.some(
      (parent) =>
        Node.isJsxElement(parent) ||
        Node.isJsxSelfClosingElement(parent) ||
        Node.isJsxFragment(parent),
    );
  }

  private isJSXAttribute(_node: Node, parentChain: Node[]): boolean {
    const parent = parentChain[0];
    return !!(parent && Node.isJsxAttribute(parent));
  }

  private isInTestContext(node: Node, parentChain: Node[]): boolean {
    // Check for test/describe/it calls
    for (const parent of parentChain) {
      if (Node.isCallExpression(parent)) {
        const expression = parent.getExpression();
        const text = expression.getText();
        if (['describe', 'it', 'test', 'expect'].includes(text)) {
          // Check if this is the first argument (test description)
          const args = parent.getArguments();
          if (args.length > 0 && args[0] === node) {
            return true;
          }
        }
      }
    }
    return false;
  }

  private isInConfigContext(_node: Node, parentChain: Node[]): boolean {
    // Check for common config patterns
    return parentChain.some((parent) => {
      if (Node.isPropertyAssignment(parent)) {
        const name = parent.getName();
        return /^(config|settings|options|env|process\.env)/.test(name);
      }
      return false;
    });
  }

  private isInTemplateContext(_node: Node, parentChain: Node[]): boolean {
    return parentChain.some(
      (parent) =>
        Node.isTemplateExpression(parent) ||
        Node.isTaggedTemplateExpression(parent),
    );
  }

  private isInDynamicContext(_node: Node, parentChain: Node[]): boolean {
    return parentChain.some(
      (parent) =>
        Node.isComputedPropertyName(parent) ||
        Node.isElementAccessExpression(parent) ||
        (Node.isCallExpression(parent) &&
          parent.getExpression().getText() === 'eval'),
    );
  }

  private isArrayIndex(node: Node, parentChain: Node[]): boolean {
    const parent = parentChain[0];
    return !!(
      parent &&
      Node.isElementAccessExpression(parent) &&
      parent.getArgumentExpression() === node
    );
  }

  private isObjectKey(node: Node, parentChain: Node[]): boolean {
    const parent = parentChain[0];
    return !!(
      parent &&
      ((Node.isPropertyAssignment(parent) && parent.getNameNode() === node) ||
        (Node.isPropertyAccessExpression(parent) &&
          parent.getNameNode() === node))
    );
  }

  private isEnumValue(_node: Node, parentChain: Node[]): boolean {
    return parentChain.some((parent) => Node.isEnumDeclaration(parent));
  }

  private isFunctionParameter(node: Node, parentChain: Node[]): boolean {
    for (let i = 0; i < parentChain.length - 1; i++) {
      const parent = parentChain[i];

      if (
        Node.isCallExpression(parent) &&
        parent.getArguments().some((arg) => arg === node)
      ) {
        return true;
      }
    }
    return false;
  }

  private isReturnValue(_node: Node, parentChain: Node[]): boolean {
    const parent = parentChain[0];
    return !!(parent && Node.isReturnStatement(parent));
  }

  private isConditional(_node: Node, parentChain: Node[]): boolean {
    return parentChain.some(
      (parent) =>
        Node.isIfStatement(parent) ||
        Node.isConditionalExpression(parent) ||
        Node.isSwitchStatement(parent),
    );
  }

  private isComparison(_node: Node, parentChain: Node[]): boolean {
    const parent = parentChain[0];
    return !!(
      parent &&
      Node.isBinaryExpression(parent) &&
      [
        SyntaxKind.EqualsEqualsToken,
        SyntaxKind.EqualsEqualsEqualsToken,
        SyntaxKind.ExclamationEqualsToken,
        SyntaxKind.ExclamationEqualsEqualsToken,
        SyntaxKind.GreaterThanToken,
        SyntaxKind.GreaterThanEqualsToken,
        SyntaxKind.LessThanToken,
        SyntaxKind.LessThanEqualsToken,
      ].includes(parent.getOperatorToken().getKind())
    );
  }

  private isCalculation(_node: Node, parentChain: Node[]): boolean {
    const parent = parentChain[0];
    return !!(
      parent &&
      Node.isBinaryExpression(parent) &&
      [
        SyntaxKind.PlusToken,
        SyntaxKind.MinusToken,
        SyntaxKind.AsteriskToken,
        SyntaxKind.SlashToken,
        SyntaxKind.PercentToken,
      ].includes(parent.getOperatorToken().getKind())
    );
  }
}
