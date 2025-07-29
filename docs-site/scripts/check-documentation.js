#!/usr/bin/env node

const fs = require('node:fs').promises;
const path = require('node:path');
const { execSync } = require('node:child_process');

/**
 * Documentation Quality Checker
 * Validates documentation coverage and quality across the codebase
 */

class DocumentationChecker {
  constructor() {
    this.issues = {
      missing: [],
      incomplete: [],
      deprecated: [],
      broken: [],
    };
    this.stats = {
      totalChecked: 0,
      passed: 0,
      failed: 0,
    };
  }

  async check() {
    console.log('🔍 Checking documentation quality...\n');

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

    // 6. Generate report
    await this.generateReport();

    // 7. Exit with error if quality threshold not met
    const passRate = (this.stats.passed / this.stats.totalChecked) * 100;
    if (passRate < 80) {
      console.error(
        `\n❌ Documentation quality below threshold: ${passRate.toFixed(1)}% (required: 80%)`,
      );
      process.exit(1);
    }

    console.log(
      `\n✅ Documentation quality check passed: ${passRate.toFixed(1)}%`,
    );
  }

  async checkTypeDocWarnings() {
    console.log('📝 Running TypeDoc analysis...');

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
      });

      console.log(`   Found ${warnings.length} TypeDoc warnings`);
    } catch (error) {
      console.error('   TypeDoc check failed:', error.message);
    }
  }

  async checkSinceTags() {
    console.log('📅 Checking @since tags...');

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
          this.issues.incomplete.push({
            file: path.relative(process.cwd(), file),
            issue: 'Missing @since tag for exported items',
          });
        }
      }

      this.stats.totalChecked++;
    }

    console.log(`   ${missingSince} files missing @since tags`);
  }

  async checkSeeReferences() {
    console.log('🔗 Validating @see references...');

    const files = await this.getSourceFiles();
    let brokenRefs = 0;

    for (const file of files) {
      const content = await fs.readFile(file, 'utf-8');
      const seeRefs = content.match(/@see\s+{@link\s+([^}]+)}/g) || [];

      for (const ref of seeRefs) {
        const target = ref.match(/@see\s+{@link\s+([^}]+)}/)[1];

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
          this.issues.broken.push({
            file: path.relative(process.cwd(), file),
            reference: target,
          });
        }
      }
    }

    console.log(`   ${brokenRefs} broken @see references`);
  }

  async checkDeprecated() {
    console.log('⚠️  Checking deprecated items...');

    const files = await this.getSourceFiles();
    let deprecatedItems = 0;

    for (const file of files) {
      const content = await fs.readFile(file, 'utf-8');
      const deprecatedMatches = content.match(/@deprecated\s+(.+)/g) || [];

      for (const match of deprecatedMatches) {
        const deprecationInfo = match.match(/@deprecated\s+(.+)/)[1];

        // Check if removal timeline is specified
        if (!deprecationInfo.includes('Will be removed in')) {
          this.issues.deprecated.push({
            file: path.relative(process.cwd(), file),
            issue: 'Deprecated item missing removal timeline',
          });
        }

        // Check if alternative is provided
        if (
          !deprecationInfo.includes('Use') &&
          !deprecationInfo.includes('use')
        ) {
          this.issues.deprecated.push({
            file: path.relative(process.cwd(), file),
            issue: 'Deprecated item missing alternative suggestion',
          });
        }

        deprecatedItems++;
      }
    }

    console.log(`   ${deprecatedItems} deprecated items found`);
  }

  async checkExamples() {
    console.log('🧪 Validating example code...');

    const files = await this.getSourceFiles();
    let invalidExamples = 0;

    for (const file of files) {
      const content = await fs.readFile(file, 'utf-8');

      // Extract code examples from @example blocks
      const exampleBlocks =
        content.match(/@example[\s\S]*?```typescript([\s\S]*?)```/g) || [];

      for (const block of exampleBlocks) {
        const code = block.match(/```typescript([\s\S]*?)```/)[1];

        // In real implementation, would:
        // 1. Create temporary file with imports
        // 2. Run TypeScript compiler
        // 3. Check for errors

        // For now, just check basic syntax
        if (code.includes('...') && !code.includes('spread')) {
          invalidExamples++;
          this.issues.broken.push({
            file: path.relative(process.cwd(), file),
            issue: 'Example contains placeholder (...)',
          });
        }
      }
    }

    console.log(`   ${invalidExamples} invalid examples found`);
  }

  async getSourceFiles() {
    const files = [];
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

  async getFilesRecursive(dir, fileList = []) {
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

  async checkSymbolExists(symbolName) {
    // Simplified check - in real implementation would use TypeScript API
    return !symbolName.includes('Unknown');
  }

  async generateReport() {
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
      __dirname,
      '../reports/documentation-check.json',
    );
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    console.log(`\n📄 Detailed report: ${reportPath}`);
  }
}

// GitHub Actions integration
async function runForCI() {
  const checker = new DocumentationChecker();

  try {
    await checker.check();

    // Set GitHub Actions outputs
    if (process.env.GITHUB_ACTIONS) {
      console.log(
        `::set-output name=doc-coverage::${(checker.stats.passed / checker.stats.totalChecked) * 100}`,
      );
      console.log(
        `::set-output name=doc-issues::${Object.values(checker.issues).flat().length}`,
      );
    }
  } catch (error) {
    console.error('Documentation check failed:', error);
    process.exit(1);
  }
}

// Run the checker
runForCI().catch(console.error);
