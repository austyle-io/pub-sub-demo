#!/usr/bin/env node

const fs = require('node:fs').promises;
const path = require('node:path');
const ts = require('typescript');

/**
 * Comprehensive codebase analyzer for documentation coverage
 */

class CodebaseAnalyzer {
  constructor(rootPath) {
    this.rootPath = rootPath;
    this.inventory = {
      packages: [],
      modules: [],
      publicAPIs: [],
      undocumented: [],
      statistics: {
        totalFiles: 0,
        totalExports: 0,
        documentedExports: 0,
        coveragePercentage: 0,
      },
    };
  }

  async analyze() {
    console.log('🔍 Starting codebase analysis...\n');

    // 1. Discover all packages
    await this.discoverPackages();

    // 2. Analyze each package
    for (const pkg of this.inventory.packages) {
      await this.analyzePackage(pkg);
    }

    // 3. Calculate statistics
    this.calculateStatistics();

    // 4. Generate report
    await this.generateReport();

    return this.inventory;
  }

  async discoverPackages() {
    const workspaces = ['apps/client', 'apps/server', 'packages/shared'];

    for (const workspace of workspaces) {
      const pkgPath = path.join(this.rootPath, workspace);
      const pkgJsonPath = path.join(pkgPath, 'package.json');

      try {
        const pkgJson = JSON.parse(await fs.readFile(pkgJsonPath, 'utf-8'));
        this.inventory.packages.push({
          name: pkgJson.name,
          path: workspace,
          version: pkgJson.version,
          entryPoint: pkgJson.main || pkgJson.module || 'src/index.ts',
          exports: pkgJson.exports || {},
          modules: [],
        });
      } catch (_error) {
        console.warn(`⚠️  Could not read package.json for ${workspace}`);
      }
    }
  }

  async analyzePackage(pkg) {
    console.log(`📦 Analyzing package: ${pkg.name}`);

    const srcPath = path.join(this.rootPath, pkg.path, 'src');
    const files = await this.getTypeScriptFiles(srcPath);

    for (const file of files) {
      const analysis = await this.analyzeFile(file, pkg);
      if (analysis) {
        pkg.modules.push(analysis);
      }
    }
  }

  async getTypeScriptFiles(dir, fileList = []) {
    try {
      const files = await fs.readdir(dir);

      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = await fs.stat(filePath);

        if (stat.isDirectory()) {
          // Skip test directories
          if (!file.includes('test') && !file.startsWith('__')) {
            await this.getTypeScriptFiles(filePath, fileList);
          }
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
          fileList.push(filePath);
        }
      }
    } catch (_error) {
      // Directory might not exist
    }

    return fileList;
  }

  async analyzeFile(filePath, _pkg) {
    const content = await fs.readFile(filePath, 'utf-8');
    const sourceFile = ts.createSourceFile(
      filePath,
      content,
      ts.ScriptTarget.Latest,
      true,
    );

    const module = {
      path: path.relative(this.rootPath, filePath),
      exports: [],
      documentation: {
        hasFileComment: false,
        coverageScore: 0,
      },
    };

    // Check for file-level comment
    if (sourceFile.statements.length > 0) {
      const firstStatement = sourceFile.statements[0];
      const leadingComments = ts.getLeadingCommentRanges(
        content,
        firstStatement.pos,
      );
      module.documentation.hasFileComment = !!(
        leadingComments && leadingComments.length > 0
      );
    }

    // Analyze exports
    this.analyzeExports(sourceFile, content, module);

    // Calculate documentation coverage
    const documented = module.exports.filter((e) => e.documented).length;
    module.documentation.coverageScore =
      module.exports.length > 0
        ? (documented / module.exports.length) * 100
        : 100;

    this.inventory.statistics.totalFiles++;

    return module;
  }

  analyzeExports(sourceFile, content, module) {
    const visit = (node) => {
      // Check for export declarations
      if (ts.isExportDeclaration(node) || ts.isExportAssignment(node)) {
        return;
      }

      // Check if node has export modifier
      const hasExportModifier = node.modifiers?.some(
        (m) => m.kind === ts.SyntaxKind.ExportKeyword,
      );

      if (hasExportModifier) {
        const exportInfo = this.extractExportInfo(node, content, sourceFile);
        if (exportInfo) {
          module.exports.push(exportInfo);
          this.inventory.publicAPIs.push({
            ...exportInfo,
            module: module.path,
          });

          if (!exportInfo.documented) {
            this.inventory.undocumented.push({
              ...exportInfo,
              module: module.path,
            });
          }
        }
      }

      ts.forEachChild(node, visit);
    };

    ts.forEachChild(sourceFile, visit);
  }

  extractExportInfo(node, content, sourceFile) {
    let name = '';
    let kind = '';
    let documented = false;
    const docQuality = {
      hasDescription: false,
      hasParams: false,
      hasReturns: false,
      hasExample: false,
      hasSince: false,
      hasDeprecated: false,
    };

    // Determine export type and name
    if (ts.isFunctionDeclaration(node)) {
      name = node.name?.text || 'anonymous';
      kind = 'function';
    } else if (ts.isClassDeclaration(node)) {
      name = node.name?.text || 'anonymous';
      kind = 'class';
    } else if (ts.isInterfaceDeclaration(node)) {
      name = node.name.text;
      kind = 'interface';
    } else if (ts.isTypeAliasDeclaration(node)) {
      name = node.name.text;
      kind = 'type';
    } else if (ts.isVariableStatement(node)) {
      const declaration = node.declarationList.declarations[0];
      name = declaration.name.text;
      kind = 'variable';
    } else if (ts.isEnumDeclaration(node)) {
      name = node.name.text;
      kind = 'enum';
    }

    // Check for JSDoc comments
    const leadingComments = ts.getLeadingCommentRanges(content, node.pos);
    if (leadingComments && leadingComments.length > 0) {
      for (const comment of leadingComments) {
        const commentText = content.substring(comment.pos, comment.end);
        if (commentText.startsWith('/**')) {
          documented = true;

          // Analyze documentation quality
          docQuality.hasDescription = /\*\s+[A-Z]/.test(commentText);
          docQuality.hasParams = /@param/.test(commentText);
          docQuality.hasReturns = /@returns?/.test(commentText);
          docQuality.hasExample = /@example/.test(commentText);
          docQuality.hasSince = /@since/.test(commentText);
          docQuality.hasDeprecated = /@deprecated/.test(commentText);
        }
      }
    }

    if (name) {
      this.inventory.statistics.totalExports++;
      if (documented) {
        this.inventory.statistics.documentedExports++;
      }

      return {
        name,
        kind,
        documented,
        docQuality,
        line: sourceFile.getLineAndCharacterOfPosition(node.pos).line + 1,
      };
    }

    return null;
  }

  calculateStatistics() {
    const stats = this.inventory.statistics;
    stats.coveragePercentage =
      stats.totalExports > 0
        ? (stats.documentedExports / stats.totalExports) * 100
        : 0;
  }

  async generateReport() {
    const reportPath = path.join(
      this.rootPath,
      'docs-site/documentation-coverage-report.json',
    );
    await fs.writeFile(reportPath, JSON.stringify(this.inventory, null, 2));

    // Generate markdown summary
    const summaryPath = path.join(
      this.rootPath,
      'docs-site/documentation-coverage-summary.md',
    );
    const summary = this.generateMarkdownSummary();
    await fs.writeFile(summaryPath, summary);

    console.log(`\n✅ Analysis complete!`);
    console.log(
      `📊 Coverage: ${this.inventory.statistics.coveragePercentage.toFixed(1)}%`,
    );
    console.log(`📄 Detailed report: ${reportPath}`);
    console.log(`📝 Summary: ${summaryPath}`);
  }

  generateMarkdownSummary() {
    const stats = this.inventory.statistics;
    const undocByKind = this.inventory.undocumented.reduce((acc, item) => {
      acc[item.kind] = (acc[item.kind] || 0) + 1;
      return acc;
    }, {});

    return `# Documentation Coverage Report

Generated: ${new Date().toISOString()}

## Overall Statistics

- **Total Files**: ${stats.totalFiles}
- **Total Exports**: ${stats.totalExports}
- **Documented Exports**: ${stats.documentedExports}
- **Coverage**: ${stats.coveragePercentage.toFixed(1)}%

## Undocumented Items by Type

${Object.entries(undocByKind)
  .map(([kind, count]) => `- **${kind}**: ${count}`)
  .join('\n')}

## Priority Items (Most Used, Least Documented)

${this.inventory.undocumented
  .slice(0, 20)
  .map((item) => `- \`${item.module}\` - **${item.name}** (${item.kind})`)
  .join('\n')}

## Package Breakdown

${this.inventory.packages
  .map((pkg) => {
    const pkgExports = this.inventory.publicAPIs.filter((api) =>
      api.module.includes(pkg.path),
    ).length;
    const pkgDocumented = this.inventory.publicAPIs.filter(
      (api) => api.module.includes(pkg.path) && api.documented,
    ).length;
    const coverage = pkgExports > 0 ? (pkgDocumented / pkgExports) * 100 : 0;

    return `### ${pkg.name}
- Exports: ${pkgExports}
- Documented: ${pkgDocumented}
- Coverage: ${coverage.toFixed(1)}%`;
  })
  .join('\n\n')}
`;
  }
}

// Run analyzer
async function main() {
  const rootPath = path.join(__dirname, '../..');
  const analyzer = new CodebaseAnalyzer(rootPath);
  await analyzer.analyze();
}

main().catch(console.error);
