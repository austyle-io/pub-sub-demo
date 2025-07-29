import type {
  EdgeCaseAnalysis,
  MagicValue,
  MagicValueSummary,
  TransformResult,
} from '../types/index.ts';

class Logger {
  private useColors = process.stdout.isTTY;

  private color(text: string, colorCode: string): string {
    if (!this.useColors) return text;
    return `\x1b[${colorCode}m${text}\x1b[0m`;
  }

  private red(text: string): string {
    return this.color(text, '31');
  }

  private green(text: string): string {
    return this.color(text, '32');
  }

  private yellow(text: string): string {
    return this.color(text, '33');
  }

  private blue(text: string): string {
    return this.color(text, '34');
  }

  private cyan(text: string): string {
    return this.color(text, '36');
  }

  private gray(text: string): string {
    return this.color(text, '90');
  }

  private bold(text: string): string {
    return this.color(text, '1');
  }

  error(message: string, error?: unknown): void {
    console.error(this.red(`✗ ${message}`));
    if (error) {
      const errorObj = error as Error;
      console.error(
        this.gray(errorObj.stack ?? errorObj.message ?? String(error)),
      );
    }
  }

  success(message: string): void {
    console.log(this.green(`✓ ${message}`));
  }

  info(message: string): void {
    console.log(this.blue(`ℹ ${message}`));
  }

  warn(message: string): void {
    console.log(this.yellow(`⚠ ${message}`));
  }

  displayResults(results: {
    values: MagicValue[];
    summary: MagicValueSummary;
  }): void {
    const { values, summary } = results;

    console.log(`\n${this.bold('Magic Value Scan Results')}`);
    console.log('='.repeat(50));

    // Summary
    console.log(`\n${this.bold('Summary:')}`);
    console.log(
      `  Total magic values found: ${this.yellow(summary.total.toString())}`,
    );
    console.log(`  String literals: ${summary.byType.string}`);
    console.log(`  Numeric literals: ${summary.byType.number}`);
    console.log(`  Whitelisted: ${summary.whitelisted}`);

    // By category
    if (Object.keys(summary.byCategory).length > 0) {
      console.log(`\n${this.bold('By Category:')}`);
      for (const [category, count] of Object.entries(summary.byCategory)) {
        console.log(`  ${this.cyan(category)}: ${count}`);
      }
    }

    // Top files
    const topFiles = Object.entries(summary.byFile)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 10);

    if (topFiles.length > 0) {
      console.log(`\n${this.bold('Top Files:')}`);
      for (const [file, count] of topFiles) {
        const shortPath = file.replace(`${process.cwd()}/`, '');
        console.log(`  ${this.gray(shortPath)}: ${count}`);
      }
    }

    // Sample values
    const sampleValues = values.slice(0, 10);
    if (sampleValues.length > 0) {
      console.log(`\n${this.bold('Sample Values:')}`);
      for (const value of sampleValues) {
        const loc = `${value.location.file}:${value.location.line}:${value.location.column}`;
        const shortLoc = loc.replace(`${process.cwd()}/`, '');

        console.log(`\n  ${this.gray(shortLoc)}`);
        console.log(`  Value: ${this.yellow(JSON.stringify(value.value))}`);

        if (value.category) {
          console.log(`  Category: ${this.cyan(value.category)}`);
        }

        if (value.suggestedName) {
          console.log(`  Suggested: ${this.green(value.suggestedName)}`);
        }

        if (value.reason) {
          console.log(`  Reason: ${this.gray(value.reason)}`);
        }

        console.log(`  Context: ${this.gray(value.location.lineText)}`);
      }

      if (values.length > 10) {
        console.log(`\n  ... and ${values.length - 10} more values`);
      }
    }
  }

  displayTransformResults(results: TransformResult[]): void {
    console.log(`\n${this.bold('Transformation Results')}`);
    console.log('='.repeat(50));

    let totalTransformed = 0;
    let totalErrors = 0;
    let totalSkipped = 0;

    for (const result of results) {
      if (
        result.transformations.length === 0 &&
        result.errors.length === 0 &&
        result.skipped.length === 0
      ) {
        continue;
      }

      const shortPath = result.file.replace(`${process.cwd()}/`, '');
      console.log(`\n${this.bold(shortPath)}`);

      if (result.transformations.length > 0) {
        console.log(
          this.green(`  ✓ ${result.transformations.length} transformations`),
        );
        totalTransformed += result.transformations.length;

        // Show first few transformations
        for (const transform of result.transformations.slice(0, 3)) {
          console.log(
            `    ${this.gray(transform.original)} → ${this.green(transform.replacement)}`,
          );
        }

        if (result.transformations.length > 3) {
          console.log(`    ... and ${result.transformations.length - 3} more`);
        }
      }

      if (result.errors.length > 0) {
        console.log(this.red(`  ✗ ${result.errors.length} errors`));
        totalErrors += result.errors.length;

        for (const error of result.errors.slice(0, 3)) {
          console.log(`    ${this.red(error.message)}`);
        }
      }

      if (result.skipped.length > 0) {
        console.log(this.yellow(`  ⚠ ${result.skipped.length} skipped`));
        totalSkipped += result.skipped.length;

        for (const skip of result.skipped.slice(0, 3)) {
          console.log(
            `    ${this.gray(JSON.stringify(skip.value))}: ${skip.reason}`,
          );
        }
      }
    }

    console.log(`\n${this.bold('Total:')}`);
    console.log(`  Transformed: ${this.green(totalTransformed.toString())}`);
    console.log(`  Errors: ${this.red(totalErrors.toString())}`);
    console.log(`  Skipped: ${this.yellow(totalSkipped.toString())}`);
  }

  displayEdgeCaseAnalysis(analysis: EdgeCaseAnalysis): void {
    console.log(`\n${this.bold('Edge Case Analysis')}`);
    console.log('='.repeat(50));

    console.log(`\n${this.bold('Summary:')}`);
    console.log(
      `  Total edge cases: ${this.yellow(analysis.summary.total.toString())}`,
    );

    // By type
    console.log(`\n${this.bold('By Type:')}`);
    for (const [type, count] of Object.entries(analysis.summary.byType)) {
      console.log(`  ${this.cyan(type)}: ${count}`);
    }

    // By severity
    console.log(`\n${this.bold('By Severity:')}`);
    for (const [severity, count] of Object.entries(
      analysis.summary.bySeverity,
    )) {
      const coloredSeverity =
        severity === 'high'
          ? this.red(severity)
          : severity === 'medium'
            ? this.yellow(severity)
            : this.gray(severity);
      console.log(`  ${coloredSeverity}: ${count}`);
    }

    // Recommendations
    if (analysis.summary.recommendations.length > 0) {
      console.log(`\n${this.bold('Recommendations:')}`);
      for (const rec of analysis.summary.recommendations) {
        console.log(`  • ${rec}`);
      }
    }

    // Examples
    const allCases = [
      ...analysis.typeContexts,
      ...analysis.jsxContexts,
      ...analysis.testContexts,
      ...analysis.dynamicContexts,
    ].slice(0, 5);

    if (allCases.length > 0) {
      console.log(`\n${this.bold('Examples:')}`);
      for (const edgeCase of allCases) {
        console.log(`\n  ${this.cyan(edgeCase.type)}: ${edgeCase.description}`);
        console.log(`  Severity: ${this.yellow(edgeCase.severity)}`);

        if (edgeCase.examples.length > 0) {
          const example = edgeCase.examples[0];
          if (example) {
            const shortPath = example.file.replace(`${process.cwd()}/`, '');
            console.log(
              `  Location: ${this.gray(`${shortPath}:${example.line}`)}`,
            );
            console.log(`  Issue: ${this.gray(example.issue)}`);
            console.log(
              `  Code: ${this.gray(`${example.code.slice(0, 60)}...`)}`,
            );
          }
        }

        console.log(`  Recommendation: ${this.green(edgeCase.recommendation)}`);
      }
    }
  }
}

export const logger = new Logger();
