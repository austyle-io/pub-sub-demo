import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { RefactoringConfig } from '../types/index.ts';

const DEFAULT_CONFIG: RefactoringConfig = {
  // Context detection
  enableTypeContextDetection: true,
  enableHeuristicAnalysis: true,
  enableDynamicContextHandling: true,

  // Whitelisting
  customWhitelist: [],
  useDefaultWhitelist: true,

  // Transformation
  safeMode: true,
  preserveJSXAttributes: true,
  preserveTestDescriptions: true,
  preserveTypeUnions: true,

  // Naming
  namingConvention: 'SCREAMING_SNAKE',
  prefixNumbers: true,

  // Organization
  constantsPath: './constants.ts',
  useHierarchicalStructure: true,
  groupByCategory: true,

  // Safety
  requireConfirmation: false,
  maxTransformationsPerFile: 100,
  backupBeforeTransform: false,
};

export async function loadConfig(): Promise<RefactoringConfig> {
  const configPaths = [
    join(process.cwd(), '.magic-refactor.json'),
    join(process.cwd(), '.magic-refactor.config.json'),
    join(process.cwd(), 'magic-refactor.config.json'),
  ];

  for (const configPath of configPaths) {
    try {
      const content = await readFile(configPath, 'utf-8');
      const userConfig = JSON.parse(content);
      return { ...DEFAULT_CONFIG, ...userConfig };
    } catch (_error) {
      // Config file doesn't exist or is invalid, continue to next
    }
  }

  // No config file found, use defaults
  return DEFAULT_CONFIG;
}

export function createDefaultConfig(): RefactoringConfig {
  return { ...DEFAULT_CONFIG };
}
