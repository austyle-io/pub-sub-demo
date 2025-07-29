/**
 * Custom ESLint plugin for cursor rules that cannot be enforced by Biome
 */

module.exports = {
  meta: {
    name: 'cursor-rules',
    version: '1.0.0',
  },
  rules: {
    // Rule: Enforce Zod validation for external data
    'require-zod-validation': {
      meta: {
        type: 'problem',
        docs: {
          description:
            'Require Zod validation for external data (API responses, form inputs)',
        },
        messages: {
          missingValidation: 'External data must be validated with Zod schemas',
        },
      },
      create(context) {
        return {
          // Check fetch/axios calls
          CallExpression(node) {
            if (
              (node.callee.name === 'fetch' ||
                (node.callee.type === 'MemberExpression' &&
                  node.callee.object.name === 'axios')) &&
              node.parent.type === 'AwaitExpression'
            ) {
              const parent = node.parent.parent;
              // Check if the result is validated
              if (parent && parent.type === 'VariableDeclarator') {
                const scope = context.getScope();
                const variable = scope.variables.find(
                  (v) => v.name === parent.id.name,
                );
                if (variable && variable.references.length > 0) {
                  const hasValidation = variable.references.some((ref) => {
                    const refParent = ref.identifier.parent;
                    return (
                      refParent &&
                      refParent.type === 'MemberExpression' &&
                      refParent.property.name === 'safeParse'
                    );
                  });
                  if (!hasValidation) {
                    context.report({
                      node,
                      messageId: 'missingValidation',
                    });
                  }
                }
              }
            }
          },
        };
      },
    },

    // Rule: Enforce lookup objects over switch
    'prefer-lookup-object': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Prefer lookup objects over switch statements',
        },
        messages: {
          preferLookup:
            'Use lookup objects instead of switch statements for O(1) performance',
        },
      },
      create(context) {
        return {
          SwitchStatement(node) {
            // Check if all cases are simple returns or assignments
            const cases = node.cases.filter((c) => c.test !== null);
            const allSimple = cases.every((c) => {
              return (
                c.consequent.length === 1 &&
                (c.consequent[0].type === 'ReturnStatement' ||
                  (c.consequent[0].type === 'ExpressionStatement' &&
                    c.consequent[0].expression.type === 'AssignmentExpression'))
              );
            });

            if (allSimple && cases.length > 3) {
              context.report({
                node,
                messageId: 'preferLookup',
              });
            }
          },
        };
      },
    },

    // Rule: Enforce branded types
    'use-branded-types': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Use branded types for domain identifiers',
        },
        messages: {
          useBrandedType:
            'Use branded type instead of primitive string/number for {{identifier}}',
        },
      },
      create(context) {
        const brandedTypePatterns = [
          /[Ii]d$/,
          /[Uu]uid$/,
          /[Tt]oken$/,
          /[Kk]ey$/,
          /[Hh]ash$/,
        ];

        return {
          TSTypeAnnotation(node) {
            if (
              node.typeAnnotation.type === 'TSStringKeyword' ||
              node.typeAnnotation.type === 'TSNumberKeyword'
            ) {
              const parent = node.parent;
              if (parent.type === 'Identifier') {
                const name = parent.name;
                if (brandedTypePatterns.some((pattern) => pattern.test(name))) {
                  context.report({
                    node,
                    messageId: 'useBrandedType',
                    data: { identifier: name },
                  });
                }
              }
            }
          },
        };
      },
    },

    // Rule: Enforce enum-object pattern
    'use-enum-object-pattern': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Use const object pattern instead of TypeScript enums',
        },
        fixable: 'code',
        messages: {
          useConstObject: 'Use const object with as const instead of enum',
        },
      },
      create(context) {
        return {
          TSEnumDeclaration(node) {
            context.report({
              node,
              messageId: 'useConstObject',
              fix(fixer) {
                const enumName = node.id.name;
                const members = node.members
                  .map((member) => {
                    const key = member.id.name;
                    const value = member.initializer
                      ? context.getSourceCode().getText(member.initializer)
                      : `"${key}"`;
                    return `  ${key}: ${value},`;
                  })
                  .join('\n');

                const replacement = `export const ${enumName} = {\n${members}\n} as const;\n\nexport type ${enumName} = (typeof ${enumName})[keyof typeof ${enumName}];`;

                return fixer.replaceText(node, replacement);
              },
            });
          },
        };
      },
    },
  },
};
