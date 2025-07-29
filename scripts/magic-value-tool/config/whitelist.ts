import type { WhitelistRule } from '../types/index.ts';

export const DEFAULT_WHITELIST: WhitelistRule[] = [
  // Array indices
  { value: 0, contexts: ['isArrayIndex'], reason: 'Array index' },
  { value: 1, contexts: ['isArrayIndex'], reason: 'Array index' },
  { value: 2, contexts: ['isArrayIndex'], reason: 'Array index' },
  { value: -1, contexts: ['isArrayIndex'], reason: 'Last element index' },

  // Common calculations
  { value: 0, contexts: ['isCalculation'], reason: 'Zero in calculation' },
  { value: 1, contexts: ['isCalculation'], reason: 'Unity in calculation' },
  { value: 2, contexts: ['isCalculation'], reason: 'Double in calculation' },
  { value: 10, contexts: ['isCalculation'], reason: 'Base 10 calculation' },
  { value: 100, contexts: ['isCalculation'], reason: 'Percentage calculation' },
  {
    value: 1000,
    contexts: ['isCalculation'],
    reason: 'Milliseconds conversion',
  },
  { value: 1024, contexts: ['isCalculation'], reason: 'Byte conversion' },

  // String operations
  { value: 0, contexts: ['isFunctionParameter'], reason: 'String slice start' },
  {
    value: 1,
    contexts: ['isFunctionParameter'],
    reason: 'String operation parameter',
  },
  {
    value: -1,
    contexts: ['isFunctionParameter'],
    reason: 'String slice from end',
  },

  // Common comparisons
  { value: 0, contexts: ['isComparison'], reason: 'Zero comparison' },
  { value: 1, contexts: ['isComparison'], reason: 'Unity comparison' },
  { value: -1, contexts: ['isComparison'], reason: 'Negative comparison' },

  // Test contexts - never transform test descriptions
  {
    value: /.*/,
    contexts: ['isTestContext'],
    reason: 'Test description',
    pattern: 'regex',
  },

  // Type contexts - preserve type literals
  {
    value: /.*/,
    contexts: ['isTypeContext'],
    reason: 'Type literal',
    pattern: 'regex',
  },

  // JSX attributes that require string literals
  {
    value: 'button',
    contexts: ['isJSXAttribute'],
    reason: 'HTML element type',
  },
  { value: 'submit', contexts: ['isJSXAttribute'], reason: 'HTML form type' },
  { value: 'text', contexts: ['isJSXAttribute'], reason: 'HTML input type' },
  {
    value: 'password',
    contexts: ['isJSXAttribute'],
    reason: 'HTML input type',
  },
  { value: 'email', contexts: ['isJSXAttribute'], reason: 'HTML input type' },
  { value: 'number', contexts: ['isJSXAttribute'], reason: 'HTML input type' },
  {
    value: 'checkbox',
    contexts: ['isJSXAttribute'],
    reason: 'HTML input type',
  },
  { value: 'radio', contexts: ['isJSXAttribute'], reason: 'HTML input type' },

  // Empty values
  { value: '', reason: 'Empty string' },
  {
    value: 0,
    contexts: ['!isCalculation', '!isArrayIndex'],
    reason: 'Zero initialization',
  },

  // Single characters often used as separators
  { value: ' ', reason: 'Space character' },
  { value: ',', reason: 'Comma separator' },
  { value: '.', reason: 'Dot separator' },
  { value: '/', reason: 'Path separator' },
  { value: '\\', reason: 'Path separator' },
  { value: ':', reason: 'Colon separator' },
  { value: ';', reason: 'Semicolon separator' },
  { value: '-', reason: 'Dash separator' },
  { value: '_', reason: 'Underscore separator' },

  // Common HTTP methods
  { value: 'GET', contexts: ['isFunctionParameter'], reason: 'HTTP method' },
  { value: 'POST', contexts: ['isFunctionParameter'], reason: 'HTTP method' },
  { value: 'PUT', contexts: ['isFunctionParameter'], reason: 'HTTP method' },
  { value: 'DELETE', contexts: ['isFunctionParameter'], reason: 'HTTP method' },
  { value: 'PATCH', contexts: ['isFunctionParameter'], reason: 'HTTP method' },

  // Boolean strings
  { value: 'true', contexts: ['isComparison'], reason: 'Boolean string' },
  { value: 'false', contexts: ['isComparison'], reason: 'Boolean string' },

  // Common time values in calculations
  { value: 24, contexts: ['isCalculation'], reason: 'Hours in day' },
  { value: 60, contexts: ['isCalculation'], reason: 'Seconds/minutes' },
  { value: 365, contexts: ['isCalculation'], reason: 'Days in year' },
  { value: 7, contexts: ['isCalculation'], reason: 'Days in week' },
];

export class WhitelistMatcher {
  private rules: WhitelistRule[];

  constructor(rules: WhitelistRule[] = DEFAULT_WHITELIST) {
    this.rules = rules;
  }

  isWhitelisted(
    value: string | number,
    contexts: Record<string, boolean>,
  ): { whitelisted: boolean; reason?: string } {
    for (const rule of this.rules) {
      if (
        this.matchesValue(value, rule) &&
        this.matchesContext(contexts, rule)
      ) {
        return { whitelisted: true, reason: rule.reason };
      }
    }

    return { whitelisted: false };
  }

  private matchesValue(value: string | number, rule: WhitelistRule): boolean {
    if (rule.pattern === 'regex' && rule.value instanceof RegExp) {
      return rule.value.test(String(value));
    }

    return value === rule.value;
  }

  private matchesContext(
    contexts: Record<string, boolean>,
    rule: WhitelistRule,
  ): boolean {
    if (!rule.contexts || rule.contexts.length === 0) {
      return true;
    }

    return rule.contexts.every((contextRule) => {
      if (contextRule.startsWith('!')) {
        const context = contextRule.slice(1);
        return !contexts[context];
      }
      return contexts[contextRule];
    });
  }

  addRule(rule: WhitelistRule): void {
    this.rules.push(rule);
  }

  removeRule(value: string | number | RegExp): void {
    this.rules = this.rules.filter((rule) => rule.value !== value);
  }
}
