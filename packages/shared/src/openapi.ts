import { 
  DocumentSchema,
  DocumentListSchema,
  CreateDocumentRequestSchema,
  CreateDocumentResponseSchema,
  ErrorResponseSchema,
  DocumentUpdateSchema
} from './schemas'
import {
  CreateUserRequestSchema,
  LoginRequestSchema,
  AuthResponseSchema,
  RefreshTokenRequestSchema
} from './auth'

export const openApiSpec = {
  openapi: '3.1.0',
  info: {
    title: 'Collaborative Document Editor API',
    version: '1.0.0',
    description: 'API for managing collaborative documents with real-time editing support'
  },
  servers: [
    {
      url: 'http://localhost:3001',
      description: 'Development server'
    }
  ],
  security: [
    {
      bearerAuth: []
    }
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
              schema: CreateUserRequestSchema
            }
          }
        },
        responses: {
          '201': {
            description: 'User created successfully',
            content: {
              'application/json': {
                schema: AuthResponseSchema
              }
            }
          },
          '400': {
            description: 'Invalid request data',
            content: {
              'application/json': {
                schema: ErrorResponseSchema
              }
            }
          },
          '409': {
            description: 'User already exists',
            content: {
              'application/json': {
                schema: ErrorResponseSchema
              }
            }
          }
        }
      }
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
              schema: LoginRequestSchema
            }
          }
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: AuthResponseSchema
              }
            }
          },
          '401': {
            description: 'Invalid credentials',
            content: {
              'application/json': {
                schema: ErrorResponseSchema
              }
            }
          }
        }
      }
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
              schema: RefreshTokenRequestSchema
            }
          }
        },
        responses: {
          '200': {
            description: 'Token refreshed successfully',
            content: {
              'application/json': {
                schema: AuthResponseSchema
              }
            }
          },
          '401': {
            description: 'Invalid refresh token',
            content: {
              'application/json': {
                schema: ErrorResponseSchema
              }
            }
          }
        }
      }
    },
    '/health': {
      get: {
        summary: 'Health check endpoint',
        operationId: 'getHealth',
        tags: ['System'],
        security: [],
        responses: {
          '200': {
            description: 'Server is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: {
                      type: 'string',
                      const: 'ok'
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/documents': {
      get: {
        summary: 'List all documents',
        operationId: 'listDocuments',
        tags: ['Documents'],
        responses: {
          '200': {
            description: 'List of documents',
            content: {
              'application/json': {
                schema: DocumentListSchema
              }
            }
          },
          '500': {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: ErrorResponseSchema
              }
            }
          }
        }
      },
      post: {
        summary: 'Create a new document',
        operationId: 'createDocument',
        tags: ['Documents'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: CreateDocumentRequestSchema
            }
          }
        },
        responses: {
          '201': {
            description: 'Document created successfully',
            content: {
              'application/json': {
                schema: CreateDocumentResponseSchema
              }
            }
          },
          '400': {
            description: 'Invalid request',
            content: {
              'application/json': {
                schema: ErrorResponseSchema
              }
            }
          },
          '500': {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: ErrorResponseSchema
              }
            }
          }
        }
      }
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
            format: 'uuid'
          }
        }
      ],
      get: {
        summary: 'Get a document by ID',
        operationId: 'getDocument',
        tags: ['Documents'],
        responses: {
          '200': {
            description: 'Document details',
            content: {
              'application/json': {
                schema: DocumentSchema
              }
            }
          },
          '404': {
            description: 'Document not found',
            content: {
              'application/json': {
                schema: ErrorResponseSchema
              }
            }
          },
          '500': {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: ErrorResponseSchema
              }
            }
          }
        }
      },
      patch: {
        summary: 'Update a document',
        operationId: 'updateDocument',
        tags: ['Documents'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: DocumentUpdateSchema
            }
          }
        },
        responses: {
          '200': {
            description: 'Document updated successfully',
            content: {
              'application/json': {
                schema: DocumentSchema
              }
            }
          },
          '400': {
            description: 'Invalid request',
            content: {
              'application/json': {
                schema: ErrorResponseSchema
              }
            }
          },
          '404': {
            description: 'Document not found',
            content: {
              'application/json': {
                schema: ErrorResponseSchema
              }
            }
          },
          '500': {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: ErrorResponseSchema
              }
            }
          }
        }
      },
      delete: {
        summary: 'Delete a document',
        operationId: 'deleteDocument',
        tags: ['Documents'],
        responses: {
          '204': {
            description: 'Document deleted successfully'
          },
          '404': {
            description: 'Document not found',
            content: {
              'application/json': {
                schema: ErrorResponseSchema
              }
            }
          },
          '500': {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: ErrorResponseSchema
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {
      Document: DocumentSchema,
      DocumentList: DocumentListSchema,
      CreateDocumentRequest: CreateDocumentRequestSchema,
      CreateDocumentResponse: CreateDocumentResponseSchema,
      DocumentUpdate: DocumentUpdateSchema,
      ErrorResponse: ErrorResponseSchema,
      CreateUserRequest: CreateUserRequestSchema,
      LoginRequest: LoginRequestSchema,
      AuthResponse: AuthResponseSchema,
      RefreshTokenRequest: RefreshTokenRequestSchema
    },
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT authentication using Bearer token'
      }
    }
  },
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication endpoints'
    },
    {
      name: 'System',
      description: 'System endpoints'
    },
    {
      name: 'Documents',
      description: 'Document management endpoints'
    }
  ]
}