import { Node } from 'ts-morph';
import type { ASTContext, CategoryPattern } from '../types/index.ts';

export class HeuristicAnalyzer {
  private categoryPatterns: CategoryPattern[] = [
    // HTTP Status Codes
    {
      name: 'HTTP_STATUS',
      pattern: (value, context) => {
        if (typeof value !== 'number') return false;
        if (value < 100 || value >= 600) return false;

        // Check variable/property names
        const hints = this.getContextHints(context);
        return hints.some((hint) =>
          /status|code|response|http|error/i.test(hint),
        );
      },
      priority: 10,
      namingTemplate: 'HTTP_{STATUS_NAME}',
    },

    // Ports
    {
      name: 'PORT',
      pattern: (value, context) => {
        if (typeof value !== 'number') return false;
        const commonPorts = [
          80, 443, 3000, 3001, 3002, 8080, 8081, 5432, 27017,
        ];
        if (!commonPorts.includes(value)) return false;

        const hints = this.getContextHints(context);
        return hints.some((hint) => /port|server|listen|bind/i.test(hint));
      },
      priority: 9,
      namingTemplate: '{SERVICE}_PORT',
    },

    // Timeouts and Delays
    {
      name: 'TIMEOUT',
      pattern: (value, context) => {
        if (typeof value !== 'number') return false;
        const commonTimeouts = [
          100, 200, 300, 500, 1000, 2000, 3000, 5000, 10000, 30000, 60000,
        ];
        if (!commonTimeouts.includes(value)) return false;

        const hints = this.getContextHints(context);
        return hints.some((hint) =>
          /timeout|delay|wait|interval|debounce|throttle|retry/i.test(hint),
        );
      },
      priority: 8,
      namingTemplate: '{ACTION}_TIMEOUT',
    },

    // Colors
    {
      name: 'COLOR',
      pattern: (value, context) => {
        if (typeof value !== 'string') return false;
        const colorPattern =
          /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$|^rgb|^hsl|^(red|blue|green|yellow|black|white|gray|grey)/i;
        if (!colorPattern.test(value)) return false;

        const hints = this.getContextHints(context);
        return hints.some((hint) =>
          /color|background|bg|foreground|fg|border|theme|style/i.test(hint),
        );
      },
      priority: 7,
      namingTemplate: '{COLOR_NAME}',
    },

    // Dimensions
    {
      name: 'DIMENSION',
      pattern: (value, context) => {
        if (typeof value !== 'string') return false;
        const dimensionPattern = /^\d+(\.\d+)?(px|em|rem|%|vh|vw)$/;
        if (!dimensionPattern.test(value)) return false;

        const hints = this.getContextHints(context);
        return hints.some((hint) =>
          /width|height|size|padding|margin|spacing|radius|border/i.test(hint),
        );
      },
      priority: 7,
      namingTemplate: '{DIMENSION_NAME}',
    },

    // API Endpoints
    {
      name: 'API_ENDPOINT',
      pattern: (value, context) => {
        if (typeof value !== 'string') return false;
        const apiPattern = /^\/api\/|^\/v\d+\/|^https?:\/\//;
        if (!apiPattern.test(value)) return false;

        const hints = this.getContextHints(context);
        return hints.some((hint) =>
          /url|endpoint|api|fetch|request|axios|http/i.test(hint),
        );
      },
      priority: 8,
      namingTemplate: '{ENDPOINT_NAME}',
    },

    // Environment Variables
    {
      name: 'ENV_VAR',
      pattern: (_value, context) => {
        const hints = this.getContextHints(context);
        return hints.some((hint) =>
          /process\.env|env\.|environment|config/i.test(hint),
        );
      },
      priority: 9,
      namingTemplate: '{ENV_NAME}',
    },

    // Feature Flags
    {
      name: 'FEATURE_FLAG',
      pattern: (_value, context) => {
        const hints = this.getContextHints(context);
        return hints.some((hint) =>
          /feature|flag|enable|disable|toggle|switch/i.test(hint),
        );
      },
      priority: 8,
      namingTemplate: 'FEATURE_{FLAG_NAME}',
    },

    // Error Messages
    {
      name: 'ERROR_MESSAGE',
      pattern: (value, context) => {
        if (typeof value !== 'string') return false;

        const hints = this.getContextHints(context);
        const isError = hints.some((hint) =>
          /error|fail|invalid|exception|throw|catch/i.test(hint),
        );

        // Also check if the string itself looks like an error
        const looksLikeError =
          /error|failed|invalid|cannot|unable|not found/i.test(value);

        return isError || looksLikeError;
      },
      priority: 6,
      namingTemplate: 'ERROR_{MESSAGE_NAME}',
    },

    // Storage Keys
    {
      name: 'STORAGE_KEY',
      pattern: (value, context) => {
        if (typeof value !== 'string') return false;

        const hints = this.getContextHints(context);
        return hints.some((hint) =>
          /storage|cache|cookie|session|localStorage|key/i.test(hint),
        );
      },
      priority: 7,
      namingTemplate: 'STORAGE_KEY_{NAME}',
    },
  ];

  analyzeCategory(
    value: string | number,
    context: ASTContext,
  ): { category?: string; confidence: number; suggestedName?: string } {
    let bestMatch: { pattern: CategoryPattern; confidence: number } | null =
      null;

    for (const pattern of this.categoryPatterns) {
      const matches =
        typeof pattern.pattern === 'function'
          ? pattern.pattern(value, context)
          : pattern.pattern.test(String(value));

      if (matches) {
        const confidence = this.calculateConfidence(value, context, pattern);

        if (!bestMatch || confidence > bestMatch.confidence) {
          bestMatch = { pattern, confidence };
        }
      }
    }

    if (bestMatch && bestMatch.confidence > 0.5) {
      return {
        category: bestMatch.pattern.name,
        confidence: bestMatch.confidence,
        suggestedName: this.generateSuggestedName(
          value,
          context,
          bestMatch.pattern,
        ),
      };
    }

    return { confidence: 0 };
  }

  private getContextHints(context: ASTContext): string[] {
    const hints: string[] = [];

    // Variable name
    const variableName = this.getVariableName(context.node);
    if (variableName) hints.push(variableName);

    // Property name
    const propertyName = this.getPropertyName(context.node);
    if (propertyName) hints.push(propertyName);

    // Function name
    if (context.scope.functionName) {
      hints.push(context.scope.functionName);
    }

    // Class name
    if (context.scope.className) {
      hints.push(context.scope.className);
    }

    // File name
    const fileName = context.fileContext.filePath.split('/').pop() || '';
    hints.push(fileName);

    // Parent node text (limited)
    for (const parent of context.parentChain.slice(0, 3)) {
      const text = parent.getText();
      if (text.length < 100) {
        hints.push(text);
      }
    }

    return hints;
  }

  private getVariableName(node: Node): string | undefined {
    const parent = node.getParent();
    if (parent && Node.isVariableDeclaration(parent)) {
      return parent.getName();
    }
    return undefined;
  }

  private getPropertyName(node: Node): string | undefined {
    const parent = node.getParent();
    if (parent && Node.isPropertyAssignment(parent)) {
      return parent.getName();
    }
    return undefined;
  }

  private calculateConfidence(
    _value: unknown,
    context: ASTContext,
    pattern: CategoryPattern,
  ): number {
    let confidence = 0.5; // Base confidence

    // Increase confidence based on context hints
    const hints = this.getContextHints(context);
    const relevantHints = hints.filter((hint) => {
      const lowerHint = hint.toLowerCase();
      const categoryLower = pattern.name.toLowerCase();
      return (
        lowerHint.includes(categoryLower) ||
        categoryLower.split('_').some((part) => lowerHint.includes(part))
      );
    });

    confidence += relevantHints.length * 0.1;

    // Increase confidence based on pattern priority
    confidence += pattern.priority * 0.01;

    // Cap at 1.0
    return Math.min(confidence, 1.0);
  }

  private generateSuggestedName(
    value: unknown,
    context: ASTContext,
    pattern: CategoryPattern,
  ): string {
    if (!pattern.namingTemplate) {
      return this.defaultNameGeneration(value, pattern.name);
    }

    let name = pattern.namingTemplate;

    // Replace placeholders with context-aware names
    const hints = this.getContextHints(context);
    const variableName = this.getVariableName(context.node);
    const propertyName = this.getPropertyName(context.node);

    // Common replacements
    name = name.replace('{STATUS_NAME}', this.getHttpStatusName(value));
    name = name.replace('{SERVICE}', this.extractServiceName(hints));
    name = name.replace('{ACTION}', this.extractActionName(hints));
    name = name.replace('{COLOR_NAME}', this.getColorName(value));
    name = name.replace(
      '{DIMENSION_NAME}',
      this.getDimensionName(value, hints),
    );
    name = name.replace('{ENDPOINT_NAME}', this.getEndpointName(value));
    name = name.replace(
      '{ENV_NAME}',
      this.getEnvName(variableName || propertyName || ''),
    );
    name = name.replace(
      '{FLAG_NAME}',
      this.getFlagName(variableName || propertyName || ''),
    );
    name = name.replace('{MESSAGE_NAME}', this.getMessageName(value));
    name = name.replace(
      '{NAME}',
      this.getGenericName(variableName ?? propertyName ?? String(value)),
    );

    return this.sanitizeConstantName(name);
  }

  private defaultNameGeneration(value: unknown, category: string): string {
    const valueStr = String(value)
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');

    return `${category}_${valueStr}`;
  }

  private getHttpStatusName(value: unknown): string {
    const statusNames: Record<number, string> = {
      200: 'OK',
      201: 'CREATED',
      204: 'NO_CONTENT',
      301: 'MOVED_PERMANENTLY',
      302: 'FOUND',
      304: 'NOT_MODIFIED',
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      405: 'METHOD_NOT_ALLOWED',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_SERVER_ERROR',
      502: 'BAD_GATEWAY',
      503: 'SERVICE_UNAVAILABLE',
    };

    return statusNames[value as number] || `STATUS_${value}`;
  }

  private extractServiceName(hints: string[]): string {
    for (const hint of hints) {
      if (hint.includes('server')) return 'SERVER';
      if (hint.includes('client')) return 'CLIENT';
      if (hint.includes('api')) return 'API';
      if (hint.includes('database')) return 'DATABASE';
      if (hint.includes('cache')) return 'CACHE';
    }
    return 'DEFAULT';
  }

  private extractActionName(hints: string[]): string {
    for (const hint of hints) {
      if (hint.includes('connect')) return 'CONNECT';
      if (hint.includes('request')) return 'REQUEST';
      if (hint.includes('response')) return 'RESPONSE';
      if (hint.includes('retry')) return 'RETRY';
      if (hint.includes('poll')) return 'POLL';
      if (hint.includes('debounce')) return 'DEBOUNCE';
    }
    return 'DEFAULT';
  }

  private getColorName(value: unknown): string {
    const colorMap: Record<string, string> = {
      '#ff0000': 'RED',
      '#00ff00': 'GREEN',
      '#0000ff': 'BLUE',
      '#ffff00': 'YELLOW',
      '#000000': 'BLACK',
      '#ffffff': 'WHITE',
      '#808080': 'GRAY',
    };

    const valueStr = String(value).toLowerCase();
    return (
      colorMap[valueStr] || valueStr.toUpperCase().replace(/[^A-Z0-9]/g, '_')
    );
  }

  private getDimensionName(value: unknown, hints: string[]): string {
    const valueStr = String(value);

    for (const hint of hints) {
      if (hint.includes('width')) return `WIDTH_${valueStr.toUpperCase()}`;
      if (hint.includes('height')) return `HEIGHT_${valueStr.toUpperCase()}`;
      if (hint.includes('padding')) return `PADDING_${valueStr.toUpperCase()}`;
      if (hint.includes('margin')) return `MARGIN_${valueStr.toUpperCase()}`;
      if (hint.includes('radius')) return `RADIUS_${valueStr.toUpperCase()}`;
    }

    return `SIZE_${valueStr.toUpperCase()}`;
  }

  private getEndpointName(value: unknown): string {
    const valueStr = String(value);
    const parts = valueStr.split('/').filter((p) => p && !p.startsWith(':'));

    if (parts.includes('api')) {
      parts.splice(parts.indexOf('api'), 1);
    }

    return parts.map((p) => p.toUpperCase()).join('_') || 'ENDPOINT';
  }

  private getEnvName(hint: string): string {
    return hint.toUpperCase().replace(/[^A-Z0-9]/g, '_') || 'CONFIG';
  }

  private getFlagName(hint: string): string {
    return hint.toUpperCase().replace(/[^A-Z0-9]/g, '_') || 'FLAG';
  }

  private getMessageName(value: unknown): string {
    const valueStr = String(value);
    const words = valueStr.split(/\s+/).slice(0, 3);
    return (
      words
        .map((w) => w.toUpperCase())
        .join('_')
        .replace(/[^A-Z0-9_]/g, '') || 'MESSAGE'
    );
  }

  private getGenericName(hint: string | number): string {
    const hintStr = String(hint || '');
    return hintStr.toUpperCase().replace(/[^A-Z0-9]/g, '_') || 'VALUE';
  }

  private sanitizeConstantName(name: string): string {
    // Remove invalid characters
    let sanitized = name.replace(/[^A-Z0-9_]/g, '_');

    // Ensure it doesn't start with a number
    if (/^\d/.test(sanitized)) {
      sanitized = `VALUE_${sanitized}`;
    }

    // Remove duplicate underscores
    sanitized = sanitized.replace(/_+/g, '_');

    // Remove leading/trailing underscores
    sanitized = sanitized.replace(/^_+|_+$/g, '');

    // Ensure it's not empty
    if (!sanitized) {
      sanitized = 'CONSTANT';
    }

    return sanitized;
  }
}
