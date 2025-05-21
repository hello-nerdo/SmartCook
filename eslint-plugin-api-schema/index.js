module.exports = {
  rules: {
    'require-body-schema': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Require method-specific schemas and proper validation in API routes',
          category: 'Possible Errors',
          recommended: true,
        },
        schema: [],
      },
      create(context) {
        // Only apply to route.ts files in the api directory
        if (!context.getFilename().includes('/api/') || !context.getFilename().endsWith('route.ts')) {
          return {};
        }

        const methodSchemas = {
          POST: { required: false, found: false, name: 'PostSchema' },
          PUT: { required: false, found: false, name: 'PutSchema' },
          PATCH: { required: false, found: false, name: 'PatchSchema' },
          DELETE: { required: false, found: false, name: 'DeleteSchema' }
        };

        let hasValidationUsage = false;

        return {
          VariableDeclarator(node) {
            const schemaName = node.id.name;
            Object.values(methodSchemas).forEach(schema => {
              if (schemaName === schema.name) {
                schema.found = true;
              }
            });
          },
          'ExportNamedDeclaration > FunctionDeclaration'(node) {
            const method = node.id.name;
            if (methodSchemas[method]) {
              methodSchemas[method].required = true;
            }
          },
          CallExpression(node) {
            // Check for .parse() or .safeParse() usage
            if (
              node.callee.type === 'MemberExpression' &&
              ['parse', 'safeParse'].includes(node.callee.property.name)
            ) {
              hasValidationUsage = true;
            }
          },
          'Program:exit'(node) {
            Object.entries(methodSchemas).forEach(([method, schema]) => {
              if (schema.required && !schema.found) {
                context.report({
                  node,
                  message: `API route with ${method} method must define a ${schema.name}`,
                });
              }
            });

            const hasAnyRequiredSchema = Object.values(methodSchemas).some(
              schema => schema.required
            );

            if (hasAnyRequiredSchema && !hasValidationUsage) {
              context.report({
                node,
                message: 'Schema validation must be performed using .parse() or .safeParse()',
              });
            }
          },
        };
      },
    },
  },
}; 