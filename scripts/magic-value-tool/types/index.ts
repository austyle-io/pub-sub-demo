import type { Node, SourceFile, ts } from 'ts-morph';

export interface ASTContext {
  node: Node;
  nodeType: ts.SyntaxKind;
  parentChain: Node[];
  scope: ScopeInfo;
  fileContext: FileContext;
  semanticContext: SemanticContext;
}

export interface ScopeInfo {
  functionName?: string;
  className?: string;
  blockDepth: number;
  variableDeclarations: Map<string, Node>;
}

export interface FileContext {
  filePath: string;
  sourceFile: SourceFile;
  imports: ImportInfo[];
  isTest: boolean;
  isConfig: boolean;
  framework?: 'react' | 'vue' | 'node' | 'unknown';
}

export interface ImportInfo {
  moduleSpecifier: string;
  namedImports: string[];
  defaultImport?: string;
}

export interface SemanticContext {
  isTypeContext: boolean;
  isJSXContext: boolean;
  isJSXAttribute: boolean;
  isTestContext: boolean;
  isConfigContext: boolean;
  isTemplateContext: boolean;
  isDynamicContext: boolean;
  isArrayIndex: boolean;
  isObjectKey: boolean;
  isEnumValue: boolean;
  isFunctionParameter: boolean;
  isReturnValue: boolean;
  isConditional: boolean;
  isComparison: boolean;
  isCalculation: boolean;
}

export interface MagicValue {
  value: string | number;
  type: 'string' | 'number';
  context: ASTContext;
  location: LocationInfo;
  category?: string;
  suggestedName?: string;
  confidence: number;
  whitelisted: boolean;
  reason?: string;
}

export interface LocationInfo {
  file: string;
  line: number;
  column: number;
  lineText: string;
}

export interface TransformResult {
  file: string;
  transformations: Transformation[];
  errors: TransformError[];
  skipped: SkippedValue[];
}

export interface Transformation {
  original: string;
  replacement: string;
  constantName: string;
  importPath: string;
  location: LocationInfo;
}

export interface TransformError {
  message: string;
  location: LocationInfo;
  value: string | number;
  reason: string;
}

export interface SkippedValue {
  value: string | number;
  location: LocationInfo;
  reason: string;
}

export interface EdgeCaseAnalysis {
  typeContexts: EdgeCase[];
  jsxContexts: EdgeCase[];
  testContexts: EdgeCase[];
  dynamicContexts: EdgeCase[];
  numericContexts: EdgeCase[];
  stringContexts: EdgeCase[];
  summary: EdgeCaseSummary;
}

export interface EdgeCase {
  type: string;
  description: string;
  examples: EdgeCaseExample[];
  severity: 'high' | 'medium' | 'low';
  recommendation: string;
}

export interface EdgeCaseExample {
  code: string;
  file: string;
  line: number;
  issue: string;
}

export interface EdgeCaseSummary {
  total: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
  recommendations: string[];
}

export interface RefactoringConfig {
  // Context detection
  enableTypeContextDetection: boolean;
  enableHeuristicAnalysis: boolean;
  enableDynamicContextHandling: boolean;

  // Whitelisting
  customWhitelist: WhitelistRule[];
  useDefaultWhitelist: boolean;

  // Transformation
  safeMode: boolean;
  preserveJSXAttributes: boolean;
  preserveTestDescriptions: boolean;
  preserveTypeUnions: boolean;

  // Naming
  namingConvention: 'SCREAMING_SNAKE' | 'UPPER_SNAKE' | 'CONSTANT_CASE';
  prefixNumbers: boolean;

  // Organization
  constantsPath: string;
  useHierarchicalStructure: boolean;
  groupByCategory: boolean;

  // Safety
  requireConfirmation: boolean;
  maxTransformationsPerFile: number;
  backupBeforeTransform: boolean;
}

export interface WhitelistRule {
  value: string | number | RegExp;
  contexts?: string[];
  reason: string;
  pattern?: 'exact' | 'regex' | 'range';
}

export interface CategoryPattern {
  name: string;
  pattern: RegExp | ((value: unknown, context: ASTContext) => boolean);
  priority: number;
  namingTemplate?: string;
}

export interface MagicValueSummary {
  total: number;
  byCategory: Record<string, number>;
  byFile: Record<string, number>;
  byType: {
    string: number;
    number: number;
  };
  whitelisted: number;
}
