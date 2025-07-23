import { join, relative } from 'node:path';
import { glob } from 'glob';
import { Node, Project, type SourceFile } from 'ts-morph';
import { ContextAnalyzer } from '../analyzers/context-analyzer.ts';
import { HeuristicAnalyzer } from '../analyzers/heuristic-analyzer.ts';
import { WhitelistMatcher } from '../config/whitelist.ts';
import { EdgeCaseHandlerManager } from '../handlers/edge-case-handlers.ts';
import { SafeTransformer } from '../transformers/safe-transformer.ts';
import type {
  EdgeCaseAnalysis,
  MagicValue,
  MagicValueSummary,
  RefactoringConfig,
  TransformResult,
} from '../types/index.ts';
import { IdentifierGenerator } from '../utils/identifier-generator.ts';

export interface ScanOptions {
  path: string;
  includePatterns: string[];
  excludePatterns: string[];
  detectOnly: boolean;
  contextAware: boolean;
}

export interface TransformOptions {
  path: string;
  group?: string;
  file?: string;
  dryRun: boolean;
  interactive: boolean;
  safeMode: boolean;
}

export class MagicValueRefactor {
  private project: Project;
  private contextAnalyzer: ContextAnalyzer;
  private heuristicAnalyzer: HeuristicAnalyzer;
  private whitelistMatcher: WhitelistMatcher;
  private transformer: SafeTransformer;
  private edgeCaseHandler: EdgeCaseHandlerManager;
  private identifierGenerator: IdentifierGenerator;
  private config: RefactoringConfig;

  constructor(config: RefactoringConfig) {
    this.config = config;
    this.project = new Project({
      tsConfigFilePath: join(process.cwd(), 'tsconfig.json'),
      skipAddingFilesFromTsConfig: true,
    });

    this.contextAnalyzer = new ContextAnalyzer();
    this.heuristicAnalyzer = new HeuristicAnalyzer();
    this.whitelistMatcher = new WhitelistMatcher(config.customWhitelist);
    this.transformer = new SafeTransformer();
    this.edgeCaseHandler = new EdgeCaseHandlerManager();
    this.identifierGenerator = new IdentifierGenerator();
  }

  async scan(
    options: ScanOptions,
  ): Promise<{ values: MagicValue[]; summary: MagicValueSummary }> {
    const files = await this.getFiles(
      options.path,
      options.includePatterns,
      options.excludePatterns,
    );
    const magicValues: MagicValue[] = [];

    for (const file of files) {
      const sourceFile = this.project.addSourceFileAtPath(file);
      const fileValues = this.scanFile(sourceFile, options);
      magicValues.push(...fileValues);
    }

    const summary = this.generateSummary(magicValues);
    return { values: magicValues, summary };
  }

  private scanFile(sourceFile: SourceFile, options: ScanOptions): MagicValue[] {
    const values: MagicValue[] = [];

    sourceFile.forEachDescendant((node) => {
      if (this.isMagicValue(node)) {
        const context = this.contextAnalyzer.analyzeContext(node, sourceFile);

        // Check whitelist
        const whitelistResult = this.whitelistMatcher.isWhitelisted(
          this.getNodeValue(node),
          context.semanticContext as unknown as Record<string, boolean>,
        );

        if (!whitelistResult.whitelisted || !options.contextAware) {
          // Check edge cases
          const edgeCaseResult = this.edgeCaseHandler.handle(node, context);

          if (!edgeCaseResult.skipTransformation || !options.contextAware) {
            // Analyze with heuristics
            const heuristicResult = this.heuristicAnalyzer.analyzeCategory(
              this.getNodeValue(node),
              context,
            );

            const value: MagicValue = {
              value: this.getNodeValue(node),
              type: Node.isStringLiteral(node) ? 'string' : 'number',
              context,
              location: this.getLocation(node),
              category: heuristicResult.category,
              suggestedName:
                heuristicResult.suggestedName ||
                this.identifierGenerator.generateValidName(
                  this.getNodeValue(node),
                  heuristicResult.category,
                ),
              confidence: heuristicResult.confidence,
              whitelisted: whitelistResult.whitelisted,
              reason: whitelistResult.reason || edgeCaseResult.reason,
            };

            values.push(value);
          }
        }
      }
    });

    return values;
  }

  async transform(options: TransformOptions): Promise<TransformResult[]> {
    const results: TransformResult[] = [];

    // Get files to transform
    if (options.file) {
      // If specific file is provided, we'll handle it during scan
    }

    // First, scan to find values to transform
    const scanResults = await this.scan({
      path: options.path,
      includePatterns: ['**/*.ts', '**/*.tsx'],
      excludePatterns: ['**/node_modules/**', '**/dist/**'],
      detectOnly: false,
      contextAware: true,
    });

    // Filter by group if specified
    let valuesToTransform = scanResults.values;
    if (options.group) {
      valuesToTransform = valuesToTransform.filter(
        (v) => v.category === options.group,
      );
    }

    // Group values by file
    const valuesByFile = new Map<string, MagicValue[]>();
    for (const value of valuesToTransform) {
      const file = value.location.file;
      if (!valuesByFile.has(file)) {
        valuesByFile.set(file, []);
      }
      valuesByFile.get(file)?.push(value);
    }

    // Transform each file
    for (const [file, values] of valuesByFile) {
      if (options.file && file !== options.file) continue;

      const result = await this.transformFile(file, values, options);
      results.push(result);
    }

    return results;
  }

  private async transformFile(
    filePath: string,
    values: MagicValue[],
    options: TransformOptions,
  ): Promise<TransformResult> {
    const sourceFile =
      this.project.getSourceFile(filePath) ||
      this.project.addSourceFileAtPath(filePath);

    const result: TransformResult = {
      file: filePath,
      transformations: [],
      errors: [],
      skipped: [],
    };

    // Sort values by position (reverse order to avoid position shifts)
    values.sort((a, b) => b.location.column - a.location.column);
    values.sort((a, b) => b.location.line - a.location.line);

    for (const value of values) {
      // Skip if whitelisted or edge case
      if (value.whitelisted && this.config.useDefaultWhitelist) {
        result.skipped.push({
          value: value.value,
          location: value.location,
          reason: value.reason || 'Whitelisted',
        });
        continue;
      }

      // Check safety settings
      if (options.safeMode) {
        // Additional safety checks
        const edgeCaseResult = this.edgeCaseHandler.handle(
          value.context.node,
          value.context,
        );

        if (edgeCaseResult.skipTransformation) {
          result.skipped.push({
            value: value.value,
            location: value.location,
            reason: edgeCaseResult.reason || 'Safety check failed',
          });
          continue;
        }
      }

      // Generate import path
      const importPath = this.getImportPath(filePath);

      // Transform
      const transformResult = this.transformer.transform(
        value.context.node,
        value.suggestedName ?? 'UNNAMED_CONSTANT',
        importPath,
        value.context,
      );

      if (transformResult.success && transformResult.transformation) {
        result.transformations.push(transformResult.transformation);

        // Apply transformation if not dry run
        if (!options.dryRun) {
          const node = value.context.node;
          node.replaceWithText(transformResult.transformation.replacement);
        }
      } else if (transformResult.error) {
        result.errors.push(transformResult.error);
      }
    }

    // Save file if not dry run
    if (!options.dryRun && result.transformations.length > 0) {
      await sourceFile.save();
    }

    return result;
  }

  async analyzeEdgeCases(options: { path: string }): Promise<EdgeCaseAnalysis> {
    const files = await this.getFiles(
      options.path,
      ['**/*.ts', '**/*.tsx'],
      ['**/node_modules/**', '**/dist/**'],
    );
    const analysis: EdgeCaseAnalysis = {
      typeContexts: [],
      jsxContexts: [],
      testContexts: [],
      dynamicContexts: [],
      numericContexts: [],
      stringContexts: [],
      summary: {
        total: 0,
        byType: {},
        bySeverity: {},
        recommendations: [],
      },
    };

    // Analyze each file for edge cases
    for (const file of files) {
      const sourceFile = this.project.addSourceFileAtPath(file);
      this.analyzeFileForEdgeCases(sourceFile, analysis);
    }

    // Generate summary
    this.generateEdgeCaseSummary(analysis);

    return analysis;
  }

  private analyzeFileForEdgeCases(
    sourceFile: SourceFile,
    analysis: EdgeCaseAnalysis,
  ): void {
    sourceFile.forEachDescendant((node) => {
      if (this.isMagicValue(node)) {
        const context = this.contextAnalyzer.analyzeContext(node, sourceFile);

        // Check different edge case categories
        if (context.semanticContext.isTypeContext) {
          analysis.typeContexts.push({
            type: 'Type Union Literal',
            description: 'Literal value in type definition',
            examples: [
              {
                code: node.getParent()?.getText() || node.getText(),
                file: sourceFile.getFilePath(),
                line: node.getStartLineNumber(),
                issue: 'Cannot be replaced with constant',
              },
            ],
            severity: 'high',
            recommendation:
              'Keep as literal, create runtime constant separately',
          });
        }

        if (context.semanticContext.isJSXAttribute) {
          const parent = node.getParent();
          if (parent && Node.isJsxAttribute(parent)) {
            const attrName = parent.getNameNode().getText();
            analysis.jsxContexts.push({
              type: 'JSX Attribute',
              description: `JSX attribute '${attrName}'`,
              examples: [
                {
                  code: parent.getText(),
                  file: sourceFile.getFilePath(),
                  line: node.getStartLineNumber(),
                  issue: 'May require string literal',
                },
              ],
              severity: 'medium',
              recommendation: 'Check if attribute accepts JSX expression',
            });
          }
        }

        // Add more edge case detection...
      }
    });
  }

  private generateEdgeCaseSummary(analysis: EdgeCaseAnalysis): void {
    // Count totals
    const allCases = [
      ...analysis.typeContexts,
      ...analysis.jsxContexts,
      ...analysis.testContexts,
      ...analysis.dynamicContexts,
      ...analysis.numericContexts,
      ...analysis.stringContexts,
    ];

    analysis.summary.total = allCases.length;

    // Count by type
    analysis.summary.byType = {
      type: analysis.typeContexts.length,
      jsx: analysis.jsxContexts.length,
      test: analysis.testContexts.length,
      dynamic: analysis.dynamicContexts.length,
      numeric: analysis.numericContexts.length,
      string: analysis.stringContexts.length,
    };

    // Count by severity
    for (const edgeCase of allCases) {
      analysis.summary.bySeverity[edgeCase.severity] =
        (analysis.summary.bySeverity[edgeCase.severity] || 0) + 1;
    }

    // Generate recommendations
    if (analysis.typeContexts.length > 0) {
      analysis.summary.recommendations.push(
        'Create runtime constants alongside type literals for shared values',
      );
    }
    if (analysis.jsxContexts.length > 0) {
      analysis.summary.recommendations.push(
        'Review JSX attributes to determine which can use constants',
      );
    }
  }

  private isMagicValue(node: Node): boolean {
    // Check for string literals
    if (Node.isStringLiteral(node)) {
      const value = node.getText().slice(1, -1); // Remove quotes

      // Skip empty strings or single characters (often separators)
      if (value.length <= 1) return false;

      // Skip if it's a module specifier
      const parent = node.getParent();
      if (
        parent &&
        (Node.isImportDeclaration(parent) || Node.isExportDeclaration(parent))
      ) {
        return false;
      }

      return true;
    }

    // Check for numeric literals
    if (Node.isNumericLiteral(node)) {
      const value = Number(node.getText());

      // Skip 0 and 1 in most contexts (too common)
      if (value === 0 || value === 1) {
        const parent = node.getParent();
        // But include them in specific contexts
        if (parent && Node.isPropertyAssignment(parent)) {
          const name = parent.getName();
          if (
            name.toLowerCase().includes('timeout') ||
            name.toLowerCase().includes('delay') ||
            name.toLowerCase().includes('limit')
          ) {
            return true;
          }
        }
        return false;
      }

      return true;
    }

    return false;
  }

  private getNodeValue(node: Node): string | number {
    if (Node.isStringLiteral(node)) {
      return node.getText().slice(1, -1); // Remove quotes
    }
    if (Node.isNumericLiteral(node)) {
      return Number(node.getText());
    }
    return node.getText();
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

  private async getFiles(
    path: string,
    include: string[],
    exclude: string[],
  ): Promise<string[]> {
    const patterns = include.map((pattern) => join(path, pattern));
    const files = await glob(patterns, {
      ignore: exclude.map((pattern) => join(path, pattern)),
      absolute: true,
    });
    return files;
  }

  private getImportPath(filePath: string): string {
    // Determine the appropriate constants file to import from
    const relativePath = relative(process.cwd(), filePath);

    if (relativePath.startsWith('apps/client')) {
      return '@/constants';
    } else if (relativePath.startsWith('apps/server')) {
      return '@/constants';
    } else if (relativePath.startsWith('packages/shared')) {
      return '../constants';
    } else {
      return './constants';
    }
  }

  private generateSummary(values: MagicValue[]): MagicValueSummary {
    const byCategory = values.reduce(
      (acc, value) => {
        const cat = value.category || 'UNCATEGORIZED';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const byFile = values.reduce(
      (acc, value) => {
        acc[value.location.file] = (acc[value.location.file] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      total: values.length,
      byCategory,
      byFile,
      byType: {
        string: values.filter((v) => v.type === 'string').length,
        number: values.filter((v) => v.type === 'number').length,
      },
      whitelisted: values.filter((v) => v.whitelisted).length,
    };
  }
}
