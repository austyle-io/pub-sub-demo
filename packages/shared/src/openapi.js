Object.defineProperty(exports, '__esModule', { value: true });
exports.openApiSpec = void 0;
const auth_1 = require('./auth');
const schemas_1 = require('./schemas');
/**
 * @summary The OpenAPI 3.1 specification for the Collaborative Document Editor API.
 * @remarks
 * This specification provides a detailed description of the API endpoints, including
 * authentication, document management, and health checks. It is used for generating
 * API documentation and client libraries.
 * @since 1.0.0
 */
exports.openApiSpec = {
  openapi: '3.1.0',
  info: {
    title: 'Collaborative Document Editor API',
    version: '1.0.0',
    description:
      'API for managing collaborative documents with real-time editing support',
  },
  servers: [
    {
      url: 'http://localhost:3001',
      description: 'Development server',
    },
  ],
  security: [
    {
      bearerAuth: [],
    },
  ],
  paths: {
    '/api/auth/signup': {
      post: {
        summary: 'Create a new user account',
        operationId: 'signup',
        tags: ['Authentication'],
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: auth_1.CreateUserRequestSchema,
            },
          },
        },
        responses: {
          201: {
            description: 'User created successfully',
            content: {
              'application/json': {
                schema: auth_1.AuthResponseSchema,
              },
            },
          },
          400: {
            description: 'Invalid request data',
            content: {
              'application/json': {
                schema: schemas_1.ErrorResponseSchema,
              },
            },
          },
          409: {
            description: 'User already exists',
            content: {
              'application/json': {
                schema: schemas_1.ErrorResponseSchema,
              },
            },
          },
        },
      },
    },
    '/api/auth/login': {
      post: {
        summary: 'Login with email and password',
        operationId: 'login',
        tags: ['Authentication'],
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: auth_1.LoginRequestSchema,
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: auth_1.AuthResponseSchema,
              },
            },
          },
          401: {
            description: 'Invalid credentials',
            content: {
              'application/json': {
                schema: schemas_1.ErrorResponseSchema,
              },
            },
          },
        },
      },
    },
    '/api/auth/refresh': {
      post: {
        summary: 'Refresh access token',
        operationId: 'refreshToken',
        tags: ['Authentication'],
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: auth_1.RefreshTokenRequestSchema,
            },
          },
        },
        responses: {
          200: {
            description: 'Token refreshed successfully',
            content: {
              'application/json': {
                schema: auth_1.AuthResponseSchema,
              },
            },
          },
          401: {
            description: 'Invalid refresh token',
            content: {
              'application/json': {
                schema: schemas_1.ErrorResponseSchema,
              },
            },
          },
        },
      },
    },
    '/health': {
      get: {
        summary: 'Health check endpoint',
        operationId: 'getHealth',
        tags: ['System'],
        security: [],
        responses: {
          200: {
            description: 'Server is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: {
                      type: 'string',
                      const: 'ok',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/documents': {
      get: {
        summary: 'List all documents',
        operationId: 'listDocuments',
        tags: ['Documents'],
        responses: {
          200: {
            description: 'List of documents',
            content: {
              'application/json': {
                schema: schemas_1.DocumentListSchema,
              },
            },
          },
          500: {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: schemas_1.ErrorResponseSchema,
              },
            },
          },
        },
      },
      post: {
        summary: 'Create a new document',
        operationId: 'createDocument',
        tags: ['Documents'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: schemas_1.CreateDocumentRequestSchema,
            },
          },
        },
        responses: {
          201: {
            description: 'Document created successfully',
            content: {
              'application/json': {
                schema: schemas_1.CreateDocumentResponseSchema,
              },
            },
          },
          400: {
            description: 'Invalid request',
            content: {
              'application/json': {
                schema: schemas_1.ErrorResponseSchema,
              },
            },
          },
          500: {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: schemas_1.ErrorResponseSchema,
              },
            },
          },
        },
      },
    },
    '/api/documents/{id}': {
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Document ID',
          schema: {
            type: 'string',
            format: 'uuid',
          },
        },
      ],
      get: {
        summary: 'Get a document by ID',
        operationId: 'getDocument',
        tags: ['Documents'],
        responses: {
          200: {
            description: 'Document details',
            content: {
              'application/json': {
                schema: schemas_1.DocumentSchema,
              },
            },
          },
          404: {
            description: 'Document not found',
            content: {
              'application/json': {
                schema: schemas_1.ErrorResponseSchema,
              },
            },
          },
          500: {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: schemas_1.ErrorResponseSchema,
              },
            },
          },
        },
      },
      patch: {
        summary: 'Update a document',
        operationId: 'updateDocument',
        tags: ['Documents'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: schemas_1.DocumentUpdateSchema,
            },
          },
        },
        responses: {
          200: {
            description: 'Document updated successfully',
            content: {
              'application/json': {
                schema: schemas_1.DocumentSchema,
              },
            },
          },
          400: {
            description: 'Invalid request',
            content: {
              'application/json': {
                schema: schemas_1.ErrorResponseSchema,
              },
            },
          },
          404: {
            description: 'Document not found',
            content: {
              'application/json': {
                schema: schemas_1.ErrorResponseSchema,
              },
            },
          },
          500: {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: schemas_1.ErrorResponseSchema,
              },
            },
          },
        },
      },
      delete: {
        summary: 'Delete a document',
        operationId: 'deleteDocument',
        tags: ['Documents'],
        responses: {
          204: {
            description: 'Document deleted successfully',
          },
          404: {
            description: 'Document not found',
            content: {
              'application/json': {
                schema: schemas_1.ErrorResponseSchema,
              },
            },
          },
          500: {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: schemas_1.ErrorResponseSchema,
              },
            },
          },
        },
      },
    },
    '/api/documents/{id}/permissions': {
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Document ID',
          schema: {
            type: 'string',
            format: 'uuid',
          },
        },
      ],
      get: {
        summary: 'Get document permissions for current user',
        operationId: 'getDocumentPermissions',
        tags: ['Documents'],
        description:
          "Retrieve the current user's permissions for a specific document",
        responses: {
          200: {
            description: 'User permissions for the document',
            content: {
              'application/json': {
                schema: schemas_1.PermissionsSchema,
              },
            },
          },
          400: {
            description: 'Invalid document ID',
            content: {
              'application/json': {
                schema: schemas_1.ErrorResponseSchema,
              },
            },
          },
          401: {
            description: 'Authentication required',
            content: {
              'application/json': {
                schema: schemas_1.ErrorResponseSchema,
              },
            },
          },
          403: {
            description: 'Access denied - user cannot read this document',
            content: {
              'application/json': {
                schema: schemas_1.ErrorResponseSchema,
              },
            },
          },
          500: {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: schemas_1.ErrorResponseSchema,
              },
            },
          },
        },
      },
      put: {
        summary: 'Update document permissions (ACL)',
        operationId: 'updateDocumentPermissions',
        tags: ['Documents'],
        description:
          'Update the access control list for a document (owner/admin only)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  editors: {
                    type: 'array',
                    items: {
                      type: 'string',
                      format: 'uuid',
                    },
                    description: 'Array of user IDs with edit permissions',
                  },
                  viewers: {
                    type: 'array',
                    items: {
                      type: 'string',
                      format: 'uuid',
                    },
                    description: 'Array of user IDs with view permissions',
                  },
                },
                required: ['editors', 'viewers'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Permissions updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'Permissions updated successfully',
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Invalid request',
            content: {
              'application/json': {
                schema: schemas_1.ErrorResponseSchema,
              },
            },
          },
          401: {
            description: 'Authentication required',
            content: {
              'application/json': {
                schema: schemas_1.ErrorResponseSchema,
              },
            },
          },
          403: {
            description: 'Access denied - only owners can change permissions',
            content: {
              'application/json': {
                schema: schemas_1.ErrorResponseSchema,
              },
            },
          },
          404: {
            description: 'Document not found',
            content: {
              'application/json': {
                schema: schemas_1.ErrorResponseSchema,
              },
            },
          },
          500: {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: schemas_1.ErrorResponseSchema,
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Document: schemas_1.DocumentSchema,
      DocumentList: schemas_1.DocumentListSchema,
      CreateDocumentRequest: schemas_1.CreateDocumentRequestSchema,
      CreateDocumentResponse: schemas_1.CreateDocumentResponseSchema,
      DocumentUpdate: schemas_1.DocumentUpdateSchema,
      ErrorResponse: schemas_1.ErrorResponseSchema,
      Permissions: schemas_1.PermissionsSchema,
      CreateUserRequest: auth_1.CreateUserRequestSchema,
      LoginRequest: auth_1.LoginRequestSchema,
      AuthResponse: auth_1.AuthResponseSchema,
      RefreshTokenRequest: auth_1.RefreshTokenRequestSchema,
    },
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT authentication using Bearer token',
      },
    },
  },
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication endpoints',
    },
    {
      name: 'System',
      description: 'System endpoints',
    },
    {
      name: 'Documents',
      description: 'Document management endpoints',
    },
  ],
};
