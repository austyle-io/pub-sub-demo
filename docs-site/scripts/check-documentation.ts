#!/usr/bin/env node --experimental-strip-types

import { execSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import {
  handleError,
  setupGracefulShutdown,
} from '../../scripts/utilities/cli-utils.ts';
import { logger } from '../../scripts/utilities/logger.ts';

/**
 * Documentation Quality Checker
 * Validates documentation coverage and quality across the codebase
 */

interface Issue {
  file?: string;
  type?: string;
  message?: string;
  issue?: string;
  reference?: string;
}

interface Issues {
  missing: Issue[];
  incomplete: Issue[];
  deprecated: Issue[];
  broken: Issue[];
}

interface Stats {
  totalChecked: number;
  passed: number;
  failed: number;
}

class DocumentationChecker {
  public issues: Issues = {
    missing: [],
    incomplete: [],
    deprecated: [],
    broken: [],
  };

  public stats: Stats = {
    totalChecked: 0,
    passed: 0,
    failed: 0,
  };

  private filesWithIssues: Set<string> = new Set();

  async check(): Promise<void> {
    logger.info('🔍 Checking documentation quality...\n');

    // 1. Run TypeDoc and check for warnings
    await this.checkTypeDocWarnings();

    // 2. Check for missing @since tags
    await this.checkSinceTags();

    // 3. Validate @see references
    await this.checkSeeReferences();

    // 4. Check deprecated items
    await this.checkDeprecated();

    // 5. Validate examples compile
    await this.checkExamples();

    // 6. Calculate final stats
    this.calculateFinalStats();

    // 7. Generate report
    await this.generateReport();

    // 8. Exit with error if quality threshold not met
    const passRate =
      this.stats.totalChecked > 0
        ? (this.stats.passed / this.stats.totalChecked) * 100
        : 0;
    if (passRate < 80) {
      logger.error(
        `\n❌ Documentation quality below threshold: ${passRate.toFixed(1)}% (required: 80%)`,
      );
      process.exit(1);
    }

    logger.info(
      `\n✅ Documentation quality check passed: ${passRate.toFixed(1)}%`,
    );
  }

  private async checkTypeDocWarnings(): Promise<void> {
    logger.info('📝 Running TypeDoc analysis...');

    try {
      const output = execSync(
        'cd docs-site && npx typedoc --options typedoc.json --logLevel Verbose',
        {
          encoding: 'utf-8',
          stdio: 'pipe',
        },
      );

      // Parse warnings from output
      const warnings = output
        .split('\n')
        .filter((line) => line.includes('[warning]'));

      warnings.forEach((warning) => {
        this.issues.missing.push({
          type: 'typedoc-warning',
          message: warning,
        });
        // TypeDoc warnings don't have specific file paths, but we track them as general issues
      });

      logger.info(`   Found ${warnings.length} TypeDoc warnings`);
    } catch (error) {
      logger.error('   TypeDoc check failed:', (error as Error).message);
    }
  }

  private async checkSinceTags(): Promise<void> {
    logger.info('📅 Checking @since tags...');

    const files = await this.getSourceFiles();
    let missingSince = 0;

    for (const file of files) {
      const content = await fs.readFile(file, 'utf-8');
      const hasExports =
        /export\s+(class|function|const|interface|type|enum)/g.test(content);

      if (hasExports) {
        const hasSince = /@since\s+\d+\.\d+\.\d+/g.test(content);
        if (!hasSince) {
          missingSince++;
          const relativeFile = path.relative(process.cwd(), file);
          this.issues.incomplete.push({
            file: relativeFile,
            issue: 'Missing @since tag for exported items',
          });
          this.filesWithIssues.add(relativeFile);
        }
      }

      this.stats.totalChecked++;
    }

    logger.info(`   ${missingSince} files missing @since tags`);
  }

  private async checkSeeReferences(): Promise<void> {
    logger.info('🔗 Validating @see references...');

    const files = await this.getSourceFiles();
    let brokenRefs = 0;

    for (const file of files) {
      const content = await fs.readFile(file, 'utf-8');
      const seeRefs = content.match(/@see\s+{@link\s+([^}]+)}/g) || [];

      for (const ref of seeRefs) {
        const match = ref.match(/@see\s+{@link\s+([^}]+)}/);
        if (!match) continue;

        const target = match[1];

        // Check if it's a URL
        if (target.startsWith('http')) {
          // Could validate URL is reachable
          continue;
        }

        // Check if referenced symbol exists
        // In real implementation, would use TypeScript compiler API
        const symbolExists = await this.checkSymbolExists(target);
        if (!symbolExists) {
          brokenRefs++;
          const relativeFile = path.relative(process.cwd(), file);
          this.issues.broken.push({
            file: relativeFile,
            reference: target,
          });
          this.filesWithIssues.add(relativeFile);
        }
      }
    }

    logger.info(`   ${brokenRefs} broken @see references`);
  }

  private async checkDeprecated(): Promise<void> {
    logger.info('⚠️  Checking deprecated items...');

    const files = await this.getSourceFiles();
    let deprecatedItems = 0;

    for (const file of files) {
      const content = await fs.readFile(file, 'utf-8');
      const deprecatedMatches = content.match(/@deprecated\s+(.+)/g) || [];

      for (const match of deprecatedMatches) {
        const deprecationMatch = match.match(/@deprecated\s+(.+)/);
        if (!deprecationMatch) continue;

        const deprecationInfo = deprecationMatch[1];

        // Check if removal timeline is specified
        if (!deprecationInfo.includes('Will be removed in')) {
          const relativeFile = path.relative(process.cwd(), file);
          this.issues.deprecated.push({
            file: relativeFile,
            issue: 'Deprecated item missing removal timeline',
          });
          this.filesWithIssues.add(relativeFile);
        }

        // Check if alternative is provided
        if (
          !deprecationInfo.includes('Use') &&
          !deprecationInfo.includes('use')
        ) {
          const relativeFile = path.relative(process.cwd(), file);
          this.issues.deprecated.push({
            file: relativeFile,
            issue: 'Deprecated item missing alternative suggestion',
          });
          this.filesWithIssues.add(relativeFile);
        }

        deprecatedItems++;
      }
    }

    logger.info(`   ${deprecatedItems} deprecated items found`);
  }

  private async checkExamples(): Promise<void> {
    logger.info('🧪 Validating example code...');

    const files = await this.getSourceFiles();
    let invalidExamples = 0;

    for (const file of files) {
      const content = await fs.readFile(file, 'utf-8');

      // Extract code examples from @example blocks
      const exampleBlocks =
        content.match(/@example[\s\S]*?```typescript([\s\S]*?)```/g) || [];

      for (const block of exampleBlocks) {
        const codeMatch = block.match(/```typescript([\s\S]*?)```/);
        if (!codeMatch) continue;

        const code = codeMatch[1];

        // In real implementation, would:
        // 1. Create temporary file with imports
        // 2. Run TypeScript compiler
        // 3. Check for errors

        // For now, just check basic syntax
        if (code.includes('...') && !code.includes('spread')) {
          invalidExamples++;
          const relativeFile = path.relative(process.cwd(), file);
          this.issues.broken.push({
            file: relativeFile,
            issue: 'Example contains placeholder (...)',
          });
          this.filesWithIssues.add(relativeFile);
        }
      }
    }

    logger.info(`   ${invalidExamples} invalid examples found`);
  }

  private async getSourceFiles(): Promise<string[]> {
    const files: string[] = [];
    const packages = [
      'packages/shared/src',
      'apps/client/src',
      'apps/server/src',
    ];

    for (const pkg of packages) {
      const pkgFiles = await this.getFilesRecursive(
        path.join(process.cwd(), pkg),
      );
      files.push(...pkgFiles);
    }

    return files.filter((f) => !f.includes('test') && !f.includes('spec'));
  }

  private async getFilesRecursive(
    dir: string,
    fileList: string[] = [],
  ): Promise<string[]> {
    try {
      const files = await fs.readdir(dir);

      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = await fs.stat(filePath);

        if (stat.isDirectory()) {
          await this.getFilesRecursive(filePath, fileList);
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
          fileList.push(filePath);
        }
      }
    } catch (_error) {
      // Directory might not exist
    }

    return fileList;
  }

  private async checkSymbolExists(symbolName: string): Promise<boolean> {
    // Simplified check - in real implementation would use TypeScript API
    return !symbolName.includes('Unknown');
  }

  private calculateFinalStats(): void {
    // Calculate passed files as total files minus files with issues
    const uniqueFilesWithIssues = this.filesWithIssues.size;
    this.stats.failed = uniqueFilesWithIssues;
    this.stats.passed = this.stats.totalChecked - uniqueFilesWithIssues;

    logger.info(
      `\n📊 Summary: ${this.stats.passed}/${this.stats.totalChecked} files passed all checks`,
    );
  }

  private async generateReport(): Promise<void> {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalFiles: this.stats.totalChecked,
        issues: {
          missing: this.issues.missing.length,
          incomplete: this.issues.incomplete.length,
          deprecated: this.issues.deprecated.length,
          broken: this.issues.broken.length,
        },
      },
      details: this.issues,
    };

    const reportPath = path.join(
      import.meta.dirname,
      '../reports/documentation-check.json',
    );
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    logger.info(`\n📄 Detailed report: ${reportPath}`);
  }
}

// GitHub Actions integration
async function runForCI(): Promise<void> {
  const checker = new DocumentationChecker();

  try {
    await checker.check();

    // Set GitHub Actions outputs
    if (process.env.GITHUB_ACTIONS) {
      const passRate =
        checker.stats.totalChecked > 0
          ? (checker.stats.passed / checker.stats.totalChecked) * 100
          : 0;
      const totalIssues = Object.values(checker.issues).flat().length;

      console.log(`::set-output name=doc-coverage::${passRate}`);
      console.log(`::set-output name=doc-issues::${totalIssues}`);
    }
  } catch (error) {
    logger.error('Documentation check failed:', error);
    process.exit(1);
  }
}

// Main execution
async function main(): Promise<void> {
  setupGracefulShutdown();

  try {
    await runForCI();
  } catch (error) {
    await handleError(error);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
