export class IdentifierGenerator {
  generateValidName(value: string | number, category?: string): string {
    let name = String(value);

    // Handle special cases
    if (name === '') return 'EMPTY_STRING';
    if (name === ' ') return 'SPACE';
    if (name === '\n') return 'NEWLINE';
    if (name === '\t') return 'TAB';
    if (name === '\r') return 'CARRIAGE_RETURN';

    // Convert to uppercase and replace non-alphanumeric with underscores
    name = name.toUpperCase().replace(/[^A-Z0-9]+/g, '_');

    // Handle numeric values that would create invalid identifiers
    if (/^\d/.test(name)) {
      // For version numbers like "3.1.0"
      if (/^\d+(_\d+)*(_\d+)?$/.test(name)) {
        const parts = name.split('_');
        if (parts.length === 3 && parts.every((p) => /^\d+$/.test(p))) {
          name = `V${name}`; // V3_1_0
        } else if (parts.length === 2 && parts.every((p) => /^\d+$/.test(p))) {
          name = `V${name}`; // V1_0
        } else {
          // Convert numbers to words for small values
          const numWords: Record<string, string> = {
            '0': 'ZERO',
            '1': 'ONE',
            '2': 'TWO',
            '3': 'THREE',
            '4': 'FOUR',
            '5': 'FIVE',
            '6': 'SIX',
            '7': 'SEVEN',
            '8': 'EIGHT',
            '9': 'NINE',
            '10': 'TEN',
          };

          const numWord = numWords[name];
          if (numWord) {
            name = numWord;
          } else {
            name = `NUM_${name}`;
          }
        }
      } else {
        // General numeric prefix
        name = `NUM_${name}`;
      }
    }

    // Remove leading/trailing underscores
    name = name.replace(/^_+|_+$/g, '');

    // Ensure name is not empty
    if (!name) {
      name = 'CONSTANT';
    }

    // Add category prefix if provided
    if (category && !name.startsWith(category)) {
      name = `${category}_${name}`;
    }

    // Handle reserved words
    if (this.isReservedWord(name.toLowerCase())) {
      name = `${name}_VALUE`;
    }

    return name;
  }

  generateFromContext(
    value: string | number,
    context: string[],
    category?: string,
  ): string {
    // Try to extract meaningful name from context
    const contextWords = context
      .map((c) => c.toLowerCase())
      .flatMap((c) => c.split(/[^a-z0-9]+/))
      .filter((w) => w.length > 2 && !this.isCommonWord(w));

    // Look for descriptive words
    const descriptive = contextWords.find(
      (w) => !['the', 'and', 'for', 'with', 'from', 'into'].includes(w),
    );

    if (descriptive) {
      const base = descriptive.toUpperCase();
      const suffix = this.getValueSuffix(value);
      return category ? `${category}_${base}${suffix}` : `${base}${suffix}`;
    }

    // Fall back to basic generation
    return this.generateValidName(value, category);
  }

  private getValueSuffix(value: string | number): string {
    if (typeof value === 'number') {
      if (value % 1000 === 0 && value >= 1000) {
        return `_${value / 1000}K`;
      }
      if (value % 60 === 0 && value >= 60) {
        return `_${value / 60}MIN`;
      }
      return `_${value}`;
    }

    // For strings, don't add the value as suffix if it's too long
    if (value.length > 10) {
      return '';
    }

    const suffix = value.toUpperCase().replace(/[^A-Z0-9]/g, '_');
    return suffix ? `_${suffix}` : '';
  }

  private isReservedWord(word: string): boolean {
    const reserved = [
      'abstract',
      'arguments',
      'await',
      'boolean',
      'break',
      'byte',
      'case',
      'catch',
      'char',
      'class',
      'const',
      'continue',
      'debugger',
      'default',
      'delete',
      'do',
      'double',
      'else',
      'enum',
      'eval',
      'export',
      'extends',
      'false',
      'final',
      'finally',
      'float',
      'for',
      'function',
      'goto',
      'if',
      'implements',
      'import',
      'in',
      'instanceof',
      'int',
      'interface',
      'let',
      'long',
      'native',
      'new',
      'null',
      'package',
      'private',
      'protected',
      'public',
      'return',
      'short',
      'static',
      'super',
      'switch',
      'synchronized',
      'this',
      'throw',
      'throws',
      'transient',
      'true',
      'try',
      'typeof',
      'var',
      'void',
      'volatile',
      'while',
      'with',
      'yield',
    ];

    return reserved.includes(word);
  }

  private isCommonWord(word: string): boolean {
    const common = [
      'the',
      'be',
      'to',
      'of',
      'and',
      'a',
      'in',
      'that',
      'have',
      'i',
      'it',
      'for',
      'not',
      'on',
      'with',
      'he',
      'as',
      'you',
      'do',
      'at',
      'this',
      'but',
      'his',
      'by',
      'from',
      'they',
      'we',
      'say',
      'her',
      'she',
      'or',
      'an',
      'will',
      'my',
      'one',
      'all',
      'would',
      'there',
      'their',
      'what',
      'so',
      'up',
      'out',
      'if',
      'about',
      'who',
      'get',
      'which',
      'go',
      'me',
      'when',
      'make',
      'can',
      'like',
      'time',
      'no',
      'just',
      'him',
      'know',
      'take',
      'people',
      'into',
      'year',
      'your',
      'good',
      'some',
      'could',
      'them',
      'see',
      'other',
      'than',
      'then',
      'now',
      'look',
      'only',
      'come',
      'its',
      'over',
    ];

    return common.includes(word);
  }
}
