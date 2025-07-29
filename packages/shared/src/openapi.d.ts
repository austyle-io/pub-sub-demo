/**
 * @summary The OpenAPI 3.1 specification for the Collaborative Document Editor API.
 * @remarks
 * This specification provides a detailed description of the API endpoints, including
 * authentication, document management, and health checks. It is used for generating
 * API documentation and client libraries.
 * @since 1.0.0
 */
export declare const openApiSpec: {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
  };
  servers: {
    url: string;
    description: string;
  }[];
  security: {
    bearerAuth: never[];
  }[];
  paths: {
    '/api/auth/signup': {
      post: {
        summary: string;
        operationId: string;
        tags: string[];
        security: never[];
        requestBody: {
          required: boolean;
          content: {
            'application/json': {
              schema: import('@sinclair/typebox').TObject<{
                email: import('@sinclair/typebox').TString;
                password: import('@sinclair/typebox').TString;
              }>;
            };
          };
        };
        responses: {
          '201': {
            description: string;
            content: {
              'application/json': {
                schema: import('@sinclair/typebox').TObject<{
                  accessToken: import('@sinclair/typebox').TString;
                  refreshToken: import('@sinclair/typebox').TString;
                  user: import('@sinclair/typebox').TObject<{
                    email: import('@sinclair/typebox').TString;
                    id: import('@sinclair/typebox').TString;
                    role: import('@sinclair/typebox').TUnion<
                      [
                        import('@sinclair/typebox').TLiteral<'viewer'>,
                        import('@sinclair/typebox').TLiteral<'editor'>,
                        import('@sinclair/typebox').TLiteral<'owner'>,
                        import('@sinclair/typebox').TLiteral<'admin'>,
                      ]
                    >;
                    createdAt: import('@sinclair/typebox').TString;
                    updatedAt: import('@sinclair/typebox').TString;
                  }>;
                }>;
              };
            };
          };
          '400': {
            description: string;
            content: {
              'application/json': {
                schema: import('@sinclair/typebox').TObject<{
                  error: import('@sinclair/typebox').TString;
                  details: import('@sinclair/typebox').TOptional<
                    import('@sinclair/typebox').TUnknown
                  >;
                }>;
              };
            };
          };
          '409': {
            description: string;
            content: {
              'application/json': {
                schema: import('@sinclair/typebox').TObject<{
                  error: import('@sinclair/typebox').TString;
                  details: import('@sinclair/typebox').TOptional<
                    import('@sinclair/typebox').TUnknown
                  >;
                }>;
              };
            };
          };
        };
      };
    };
    '/api/auth/login': {
      post: {
        summary: string;
        operationId: string;
        tags: string[];
        security: never[];
        requestBody: {
          required: boolean;
          content: {
            'application/json': {
              schema: import('@sinclair/typebox').TObject<{
                email: import('@sinclair/typebox').TString;
                password: import('@sinclair/typebox').TString;
              }>;
            };
          };
        };
        responses: {
          '200': {
            description: string;
            content: {
              'application/json': {
                schema: import('@sinclair/typebox').TObject<{
                  accessToken: import('@sinclair/typebox').TString;
                  refreshToken: import('@sinclair/typebox').TString;
                  user: import('@sinclair/typebox').TObject<{
                    email: import('@sinclair/typebox').TString;
                    id: import('@sinclair/typebox').TString;
                    role: import('@sinclair/typebox').TUnion<
                      [
                        import('@sinclair/typebox').TLiteral<'viewer'>,
                        import('@sinclair/typebox').TLiteral<'editor'>,
                        import('@sinclair/typebox').TLiteral<'owner'>,
                        import('@sinclair/typebox').TLiteral<'admin'>,
                      ]
                    >;
                    createdAt: import('@sinclair/typebox').TString;
                    updatedAt: import('@sinclair/typebox').TString;
                  }>;
                }>;
              };
            };
          };
          '401': {
            description: string;
            content: {
              'application/json': {
                schema: import('@sinclair/typebox').TObject<{
                  error: import('@sinclair/typebox').TString;
                  details: import('@sinclair/typebox').TOptional<
                    import('@sinclair/typebox').TUnknown
                  >;
                }>;
              };
            };
          };
        };
      };
    };
    '/api/auth/refresh': {
      post: {
        summary: string;
        operationId: string;
        tags: string[];
        security: never[];
        requestBody: {
          required: boolean;
          content: {
            'application/json': {
              schema: import('@sinclair/typebox').TObject<{
                refreshToken: import('@sinclair/typebox').TString;
              }>;
            };
          };
        };
        responses: {
          '200': {
            description: string;
            content: {
              'application/json': {
                schema: import('@sinclair/typebox').TObject<{
                  accessToken: import('@sinclair/typebox').TString;
                  refreshToken: import('@sinclair/typebox').TString;
                  user: import('@sinclair/typebox').TObject<{
                    email: import('@sinclair/typebox').TString;
                    id: import('@sinclair/typebox').TString;
                    role: import('@sinclair/typebox').TUnion<
                      [
                        import('@sinclair/typebox').TLiteral<'viewer'>,
                        import('@sinclair/typebox').TLiteral<'editor'>,
                        import('@sinclair/typebox').TLiteral<'owner'>,
                        import('@sinclair/typebox').TLiteral<'admin'>,
                      ]
                    >;
                    createdAt: import('@sinclair/typebox').TString;
                    updatedAt: import('@sinclair/typebox').TString;
                  }>;
                }>;
              };
            };
          };
          '401': {
            description: string;
            content: {
              'application/json': {
                schema: import('@sinclair/typebox').TObject<{
                  error: import('@sinclair/typebox').TString;
                  details: import('@sinclair/typebox').TOptional<
                    import('@sinclair/typebox').TUnknown
                  >;
                }>;
              };
            };
          };
        };
      };
    };
    '/health': {
      get: {
        summary: string;
        operationId: string;
        tags: string[];
        security: never[];
        responses: {
          '200': {
            description: string;
            content: {
              'application/json': {
                schema: {
                  type: string;
                  properties: {
                    status: {
                      type: string;
                      const: string;
                    };
                  };
                };
              };
            };
          };
        };
      };
    };
    '/api/documents': {
      get: {
        summary: string;
        operationId: string;
        tags: string[];
        responses: {
          '200': {
            description: string;
            content: {
              'application/json': {
                schema: import('@sinclair/typebox').TArray<
                  import('@sinclair/typebox').TObject<{
                    id: import('@sinclair/typebox').TString;
                    title: import('@sinclair/typebox').TString;
                    content: import('@sinclair/typebox').TString;
                    acl: import('@sinclair/typebox').TObject<{
                      owner: import('@sinclair/typebox').TString;
                      editors: import('@sinclair/typebox').TArray<
                        import('@sinclair/typebox').TString
                      >;
                      viewers: import('@sinclair/typebox').TArray<
                        import('@sinclair/typebox').TString
                      >;
                    }>;
                    createdAt: import('@sinclair/typebox').TString;
                    updatedAt: import('@sinclair/typebox').TString;
                  }>
                >;
              };
            };
          };
          '500': {
            description: string;
            content: {
              'application/json': {
                schema: import('@sinclair/typebox').TObject<{
                  error: import('@sinclair/typebox').TString;
                  details: import('@sinclair/typebox').TOptional<
                    import('@sinclair/typebox').TUnknown
                  >;
                }>;
              };
            };
          };
        };
      };
      post: {
        summary: string;
        operationId: string;
        tags: string[];
        requestBody: {
          required: boolean;
          content: {
            'application/json': {
              schema: import('@sinclair/typebox').TObject<{
                title: import('@sinclair/typebox').TString;
                content: import('@sinclair/typebox').TOptional<
                  import('@sinclair/typebox').TString
                >;
              }>;
            };
          };
        };
        responses: {
          '201': {
            description: string;
            content: {
              'application/json': {
                schema: import('@sinclair/typebox').TObject<{
                  id: import('@sinclair/typebox').TString;
                  title: import('@sinclair/typebox').TString;
                  content: import('@sinclair/typebox').TString;
                  acl: import('@sinclair/typebox').TObject<{
                    owner: import('@sinclair/typebox').TString;
                    editors: import('@sinclair/typebox').TArray<
                      import('@sinclair/typebox').TString
                    >;
                    viewers: import('@sinclair/typebox').TArray<
                      import('@sinclair/typebox').TString
                    >;
                  }>;
                  createdAt: import('@sinclair/typebox').TString;
                  updatedAt: import('@sinclair/typebox').TString;
                }>;
              };
            };
          };
          '400': {
            description: string;
            content: {
              'application/json': {
                schema: import('@sinclair/typebox').TObject<{
                  error: import('@sinclair/typebox').TString;
                  details: import('@sinclair/typebox').TOptional<
                    import('@sinclair/typebox').TUnknown
                  >;
                }>;
              };
            };
          };
          '500': {
            description: string;
            content: {
              'application/json': {
                schema: import('@sinclair/typebox').TObject<{
                  error: import('@sinclair/typebox').TString;
                  details: import('@sinclair/typebox').TOptional<
                    import('@sinclair/typebox').TUnknown
                  >;
                }>;
              };
            };
          };
        };
      };
    };
    '/api/documents/{id}': {
      parameters: {
        name: string;
        in: string;
        required: boolean;
        description: string;
        schema: {
          type: string;
          format: string;
        };
      }[];
      get: {
        summary: string;
        operationId: string;
        tags: string[];
        responses: {
          '200': {
            description: string;
            content: {
              'application/json': {
                schema: import('@sinclair/typebox').TObject<{
                  id: import('@sinclair/typebox').TString;
                  title: import('@sinclair/typebox').TString;
                  content: import('@sinclair/typebox').TString;
                  acl: import('@sinclair/typebox').TObject<{
                    owner: import('@sinclair/typebox').TString;
                    editors: import('@sinclair/typebox').TArray<
                      import('@sinclair/typebox').TString
                    >;
                    viewers: import('@sinclair/typebox').TArray<
                      import('@sinclair/typebox').TString
                    >;
                  }>;
                  createdAt: import('@sinclair/typebox').TString;
                  updatedAt: import('@sinclair/typebox').TString;
                }>;
              };
            };
          };
          '404': {
            description: string;
            content: {
              'application/json': {
                schema: import('@sinclair/typebox').TObject<{
                  error: import('@sinclair/typebox').TString;
                  details: import('@sinclair/typebox').TOptional<
                    import('@sinclair/typebox').TUnknown
                  >;
                }>;
              };
            };
          };
          '500': {
            description: string;
            content: {
              'application/json': {
                schema: import('@sinclair/typebox').TObject<{
                  error: import('@sinclair/typebox').TString;
                  details: import('@sinclair/typebox').TOptional<
                    import('@sinclair/typebox').TUnknown
                  >;
                }>;
              };
            };
          };
        };
      };
      patch: {
        summary: string;
        operationId: string;
        tags: string[];
        requestBody: {
          required: boolean;
          content: {
            'application/json': {
              schema: import('@sinclair/typebox').TObject<{
                title: import('@sinclair/typebox').TOptional<
                  import('@sinclair/typebox').TString
                >;
                content: import('@sinclair/typebox').TOptional<
                  import('@sinclair/typebox').TString
                >;
              }>;
            };
          };
        };
        responses: {
          '200': {
            description: string;
            content: {
              'application/json': {
                schema: import('@sinclair/typebox').TObject<{
                  id: import('@sinclair/typebox').TString;
                  title: import('@sinclair/typebox').TString;
                  content: import('@sinclair/typebox').TString;
                  acl: import('@sinclair/typebox').TObject<{
                    owner: import('@sinclair/typebox').TString;
                    editors: import('@sinclair/typebox').TArray<
                      import('@sinclair/typebox').TString
                    >;
                    viewers: import('@sinclair/typebox').TArray<
                      import('@sinclair/typebox').TString
                    >;
                  }>;
                  createdAt: import('@sinclair/typebox').TString;
                  updatedAt: import('@sinclair/typebox').TString;
                }>;
              };
            };
          };
          '400': {
            description: string;
            content: {
              'application/json': {
                schema: import('@sinclair/typebox').TObject<{
                  error: import('@sinclair/typebox').TString;
                  details: import('@sinclair/typebox').TOptional<
                    import('@sinclair/typebox').TUnknown
                  >;
                }>;
              };
            };
          };
          '404': {
            description: string;
            content: {
              'application/json': {
                schema: import('@sinclair/typebox').TObject<{
                  error: import('@sinclair/typebox').TString;
                  details: import('@sinclair/typebox').TOptional<
                    import('@sinclair/typebox').TUnknown
                  >;
                }>;
              };
            };
          };
          '500': {
            description: string;
            content: {
              'application/json': {
                schema: import('@sinclair/typebox').TObject<{
                  error: import('@sinclair/typebox').TString;
                  details: import('@sinclair/typebox').TOptional<
                    import('@sinclair/typebox').TUnknown
                  >;
                }>;
              };
            };
          };
        };
      };
      delete: {
        summary: string;
        operationId: string;
        tags: string[];
        responses: {
          '204': {
            description: string;
          };
          '404': {
            description: string;
            content: {
              'application/json': {
                schema: import('@sinclair/typebox').TObject<{
                  error: import('@sinclair/typebox').TString;
                  details: import('@sinclair/typebox').TOptional<
                    import('@sinclair/typebox').TUnknown
                  >;
                }>;
              };
            };
          };
          '500': {
            description: string;
            content: {
              'application/json': {
                schema: import('@sinclair/typebox').TObject<{
                  error: import('@sinclair/typebox').TString;
                  details: import('@sinclair/typebox').TOptional<
                    import('@sinclair/typebox').TUnknown
                  >;
                }>;
              };
            };
          };
        };
      };
    };
    '/api/documents/{id}/permissions': {
      parameters: {
        name: string;
        in: string;
        required: boolean;
        description: string;
        schema: {
          type: string;
          format: string;
        };
      }[];
      get: {
        summary: string;
        operationId: string;
        tags: string[];
        description: string;
        responses: {
          '200': {
            description: string;
            content: {
              'application/json': {
                schema: import('@sinclair/typebox').TObject<{
                  canRead: import('@sinclair/typebox').TBoolean;
                  canWrite: import('@sinclair/typebox').TBoolean;
                  canDelete: import('@sinclair/typebox').TBoolean;
                }>;
              };
            };
          };
          '400': {
            description: string;
            content: {
              'application/json': {
                schema: import('@sinclair/typebox').TObject<{
                  error: import('@sinclair/typebox').TString;
                  details: import('@sinclair/typebox').TOptional<
                    import('@sinclair/typebox').TUnknown
                  >;
                }>;
              };
            };
          };
          '401': {
            description: string;
            content: {
              'application/json': {
                schema: import('@sinclair/typebox').TObject<{
                  error: import('@sinclair/typebox').TString;
                  details: import('@sinclair/typebox').TOptional<
                    import('@sinclair/typebox').TUnknown
                  >;
                }>;
              };
            };
          };
          '403': {
            description: string;
            content: {
              'application/json': {
                schema: import('@sinclair/typebox').TObject<{
                  error: import('@sinclair/typebox').TString;
                  details: import('@sinclair/typebox').TOptional<
                    import('@sinclair/typebox').TUnknown
                  >;
                }>;
              };
            };
          };
          '500': {
            description: string;
            content: {
              'application/json': {
                schema: import('@sinclair/typebox').TObject<{
                  error: import('@sinclair/typebox').TString;
                  details: import('@sinclair/typebox').TOptional<
                    import('@sinclair/typebox').TUnknown
                  >;
                }>;
              };
            };
          };
        };
      };
      put: {
        summary: string;
        operationId: string;
        tags: string[];
        description: string;
        requestBody: {
          required: boolean;
          content: {
            'application/json': {
              schema: {
                type: string;
                properties: {
                  editors: {
                    type: string;
                    items: {
                      type: string;
                      format: string;
                    };
                    description: string;
                  };
                  viewers: {
                    type: string;
                    items: {
                      type: string;
                      format: string;
                    };
                    description: string;
                  };
                };
                required: string[];
              };
            };
          };
        };
        responses: {
          '200': {
            description: string;
            content: {
              'application/json': {
                schema: {
                  type: string;
                  properties: {
                    message: {
                      type: string;
                      example: string;
                    };
                  };
                };
              };
            };
          };
          '400': {
            description: string;
            content: {
              'application/json': {
                schema: import('@sinclair/typebox').TObject<{
                  error: import('@sinclair/typebox').TString;
                  details: import('@sinclair/typebox').TOptional<
                    import('@sinclair/typebox').TUnknown
                  >;
                }>;
              };
            };
          };
          '401': {
            description: string;
            content: {
              'application/json': {
                schema: import('@sinclair/typebox').TObject<{
                  error: import('@sinclair/typebox').TString;
                  details: import('@sinclair/typebox').TOptional<
                    import('@sinclair/typebox').TUnknown
                  >;
                }>;
              };
            };
          };
          '403': {
            description: string;
            content: {
              'application/json': {
                schema: import('@sinclair/typebox').TObject<{
                  error: import('@sinclair/typebox').TString;
                  details: import('@sinclair/typebox').TOptional<
                    import('@sinclair/typebox').TUnknown
                  >;
                }>;
              };
            };
          };
          '404': {
            description: string;
            content: {
              'application/json': {
                schema: import('@sinclair/typebox').TObject<{
                  error: import('@sinclair/typebox').TString;
                  details: import('@sinclair/typebox').TOptional<
                    import('@sinclair/typebox').TUnknown
                  >;
                }>;
              };
            };
          };
          '500': {
            description: string;
            content: {
              'application/json': {
                schema: import('@sinclair/typebox').TObject<{
                  error: import('@sinclair/typebox').TString;
                  details: import('@sinclair/typebox').TOptional<
                    import('@sinclair/typebox').TUnknown
                  >;
                }>;
              };
            };
          };
        };
      };
    };
  };
  components: {
    schemas: {
      Document: import('@sinclair/typebox').TObject<{
        id: import('@sinclair/typebox').TString;
        title: import('@sinclair/typebox').TString;
        content: import('@sinclair/typebox').TString;
        acl: import('@sinclair/typebox').TObject<{
          owner: import('@sinclair/typebox').TString;
          editors: import('@sinclair/typebox').TArray<
            import('@sinclair/typebox').TString
          >;
          viewers: import('@sinclair/typebox').TArray<
            import('@sinclair/typebox').TString
          >;
        }>;
        createdAt: import('@sinclair/typebox').TString;
        updatedAt: import('@sinclair/typebox').TString;
      }>;
      DocumentList: import('@sinclair/typebox').TArray<
        import('@sinclair/typebox').TObject<{
          id: import('@sinclair/typebox').TString;
          title: import('@sinclair/typebox').TString;
          content: import('@sinclair/typebox').TString;
          acl: import('@sinclair/typebox').TObject<{
            owner: import('@sinclair/typebox').TString;
            editors: import('@sinclair/typebox').TArray<
              import('@sinclair/typebox').TString
            >;
            viewers: import('@sinclair/typebox').TArray<
              import('@sinclair/typebox').TString
            >;
          }>;
          createdAt: import('@sinclair/typebox').TString;
          updatedAt: import('@sinclair/typebox').TString;
        }>
      >;
      CreateDocumentRequest: import('@sinclair/typebox').TObject<{
        title: import('@sinclair/typebox').TString;
        content: import('@sinclair/typebox').TOptional<
          import('@sinclair/typebox').TString
        >;
      }>;
      CreateDocumentResponse: import('@sinclair/typebox').TObject<{
        id: import('@sinclair/typebox').TString;
        title: import('@sinclair/typebox').TString;
        content: import('@sinclair/typebox').TString;
        acl: import('@sinclair/typebox').TObject<{
          owner: import('@sinclair/typebox').TString;
          editors: import('@sinclair/typebox').TArray<
            import('@sinclair/typebox').TString
          >;
          viewers: import('@sinclair/typebox').TArray<
            import('@sinclair/typebox').TString
          >;
        }>;
        createdAt: import('@sinclair/typebox').TString;
        updatedAt: import('@sinclair/typebox').TString;
      }>;
      DocumentUpdate: import('@sinclair/typebox').TObject<{
        title: import('@sinclair/typebox').TOptional<
          import('@sinclair/typebox').TString
        >;
        content: import('@sinclair/typebox').TOptional<
          import('@sinclair/typebox').TString
        >;
      }>;
      ErrorResponse: import('@sinclair/typebox').TObject<{
        error: import('@sinclair/typebox').TString;
        details: import('@sinclair/typebox').TOptional<
          import('@sinclair/typebox').TUnknown
        >;
      }>;
      Permissions: import('@sinclair/typebox').TObject<{
        canRead: import('@sinclair/typebox').TBoolean;
        canWrite: import('@sinclair/typebox').TBoolean;
        canDelete: import('@sinclair/typebox').TBoolean;
      }>;
      CreateUserRequest: import('@sinclair/typebox').TObject<{
        email: import('@sinclair/typebox').TString;
        password: import('@sinclair/typebox').TString;
      }>;
      LoginRequest: import('@sinclair/typebox').TObject<{
        email: import('@sinclair/typebox').TString;
        password: import('@sinclair/typebox').TString;
      }>;
      AuthResponse: import('@sinclair/typebox').TObject<{
        accessToken: import('@sinclair/typebox').TString;
        refreshToken: import('@sinclair/typebox').TString;
        user: import('@sinclair/typebox').TObject<{
          email: import('@sinclair/typebox').TString;
          id: import('@sinclair/typebox').TString;
          role: import('@sinclair/typebox').TUnion<
            [
              import('@sinclair/typebox').TLiteral<'viewer'>,
              import('@sinclair/typebox').TLiteral<'editor'>,
              import('@sinclair/typebox').TLiteral<'owner'>,
              import('@sinclair/typebox').TLiteral<'admin'>,
            ]
          >;
          createdAt: import('@sinclair/typebox').TString;
          updatedAt: import('@sinclair/typebox').TString;
        }>;
      }>;
      RefreshTokenRequest: import('@sinclair/typebox').TObject<{
        refreshToken: import('@sinclair/typebox').TString;
      }>;
    };
    securitySchemes: {
      bearerAuth: {
        type: string;
        scheme: string;
        bearerFormat: string;
        description: string;
      };
    };
  };
  tags: {
    name: string;
    description: string;
  }[];
};
//# sourceMappingURL=openapi.d.ts.map
