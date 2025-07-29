[**collab-edit-demo**](../../../../../README.md)

***

[collab-edit-demo](../../../../../README.md) / [packages/shared/src/openapi](../README.md) / openApiSpec

# Variable: openApiSpec

> `const` **openApiSpec**: `object`

Defined in: [packages/shared/src/openapi.ts:17](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/packages/shared/src/openapi.ts#L17)

## Type declaration

### openapi

> **openapi**: `string` = `'3.1.0'`

### info

> **info**: `object`

#### info.title

> **title**: `string` = `'Collaborative Document Editor API'`

#### info.version

> **version**: `string` = `'1.0.0'`

#### info.description

> **description**: `string` = `'API for managing collaborative documents with real-time editing support'`

### servers

> **servers**: `object`[]

### security

> **security**: `object`[]

### paths

> **paths**: `object`

#### paths./api/auth/signup

> **/api/auth/signup**: `object`

#### paths./api/auth/signup.post

> **post**: `object`

#### paths./api/auth/signup.post.summary

> **summary**: `string` = `'Create a new user account'`

#### paths./api/auth/signup.post.operationId

> **operationId**: `string` = `'signup'`

#### paths./api/auth/signup.post.tags

> **tags**: `string`[]

#### paths./api/auth/signup.post.security

> **security**: `never`[] = `[]`

#### paths./api/auth/signup.post.requestBody

> **requestBody**: `object`

#### paths./api/auth/signup.post.requestBody.required

> **required**: `boolean` = `true`

#### paths./api/auth/signup.post.requestBody.content

> **content**: `object`

#### paths./api/auth/signup.post.requestBody.content.application/json

> **application/json**: `object`

#### paths./api/auth/signup.post.requestBody.content.application/json.schema

> **schema**: `TObject`\<\{ `email`: `TString`; `password`: `TString`; \}\> = `CreateUserRequestSchema`

#### paths./api/auth/signup.post.responses

> **responses**: `object`

#### paths./api/auth/signup.post.responses.201

> **201**: `object`

#### paths./api/auth/signup.post.responses.201.description

> **description**: `string` = `'User created successfully'`

#### paths./api/auth/signup.post.responses.201.content

> **content**: `object`

#### paths./api/auth/signup.post.responses.201.content.application/json

> **application/json**: `object`

#### paths./api/auth/signup.post.responses.201.content.application/json.schema

> **schema**: `TObject`\<\{ `accessToken`: `TString`; `refreshToken`: `TString`; `user`: `TObject`\<...\>; \}\> = `AuthResponseSchema`

#### paths./api/auth/signup.post.responses.400

> **400**: `object`

#### paths./api/auth/signup.post.responses.400.description

> **description**: `string` = `'Invalid request data'`

#### paths./api/auth/signup.post.responses.400.content

> **content**: `object`

#### paths./api/auth/signup.post.responses.400.content.application/json

> **application/json**: `object`

#### paths./api/auth/signup.post.responses.400.content.application/json.schema

> **schema**: `TObject`\<\{ `error`: `TString`; `details`: `TOptional`\<...\>; \}\> = `ErrorResponseSchema`

#### paths./api/auth/signup.post.responses.409

> **409**: `object`

#### paths./api/auth/signup.post.responses.409.description

> **description**: `string` = `'User already exists'`

#### paths./api/auth/signup.post.responses.409.content

> **content**: `object`

#### paths./api/auth/signup.post.responses.409.content.application/json

> **application/json**: `object`

#### paths./api/auth/signup.post.responses.409.content.application/json.schema

> **schema**: `TObject`\<\{ `error`: `TString`; `details`: `TOptional`\<...\>; \}\> = `ErrorResponseSchema`

#### paths./api/auth/login

> **/api/auth/login**: `object`

#### paths./api/auth/login.post

> **post**: `object`

#### paths./api/auth/login.post.summary

> **summary**: `string` = `'Login with email and password'`

#### paths./api/auth/login.post.operationId

> **operationId**: `string` = `'login'`

#### paths./api/auth/login.post.tags

> **tags**: `string`[]

#### paths./api/auth/login.post.security

> **security**: `never`[] = `[]`

#### paths./api/auth/login.post.requestBody

> **requestBody**: `object`

#### paths./api/auth/login.post.requestBody.required

> **required**: `boolean` = `true`

#### paths./api/auth/login.post.requestBody.content

> **content**: `object`

#### paths./api/auth/login.post.requestBody.content.application/json

> **application/json**: `object`

#### paths./api/auth/login.post.requestBody.content.application/json.schema

> **schema**: `TObject`\<\{ `email`: `TString`; `password`: `TString`; \}\> = `LoginRequestSchema`

#### paths./api/auth/login.post.responses

> **responses**: `object`

#### paths./api/auth/login.post.responses.200

> **200**: `object`

#### paths./api/auth/login.post.responses.200.description

> **description**: `string` = `'Login successful'`

#### paths./api/auth/login.post.responses.200.content

> **content**: `object`

#### paths./api/auth/login.post.responses.200.content.application/json

> **application/json**: `object`

#### paths./api/auth/login.post.responses.200.content.application/json.schema

> **schema**: `TObject`\<\{ `accessToken`: `TString`; `refreshToken`: `TString`; `user`: `TObject`\<...\>; \}\> = `AuthResponseSchema`

#### paths./api/auth/login.post.responses.401

> **401**: `object`

#### paths./api/auth/login.post.responses.401.description

> **description**: `string` = `'Invalid credentials'`

#### paths./api/auth/login.post.responses.401.content

> **content**: `object`

#### paths./api/auth/login.post.responses.401.content.application/json

> **application/json**: `object`

#### paths./api/auth/login.post.responses.401.content.application/json.schema

> **schema**: `TObject`\<\{ `error`: `TString`; `details`: `TOptional`\<...\>; \}\> = `ErrorResponseSchema`

#### paths./api/auth/refresh

> **/api/auth/refresh**: `object`

#### paths./api/auth/refresh.post

> **post**: `object`

#### paths./api/auth/refresh.post.summary

> **summary**: `string` = `'Refresh access token'`

#### paths./api/auth/refresh.post.operationId

> **operationId**: `string` = `'refreshToken'`

#### paths./api/auth/refresh.post.tags

> **tags**: `string`[]

#### paths./api/auth/refresh.post.security

> **security**: `never`[] = `[]`

#### paths./api/auth/refresh.post.requestBody

> **requestBody**: `object`

#### paths./api/auth/refresh.post.requestBody.required

> **required**: `boolean` = `true`

#### paths./api/auth/refresh.post.requestBody.content

> **content**: `object`

#### paths./api/auth/refresh.post.requestBody.content.application/json

> **application/json**: `object`

#### paths./api/auth/refresh.post.requestBody.content.application/json.schema

> **schema**: `TObject`\<\{ `refreshToken`: `TString`; \}\> = `RefreshTokenRequestSchema`

#### paths./api/auth/refresh.post.responses

> **responses**: `object`

#### paths./api/auth/refresh.post.responses.200

> **200**: `object`

#### paths./api/auth/refresh.post.responses.200.description

> **description**: `string` = `'Token refreshed successfully'`

#### paths./api/auth/refresh.post.responses.200.content

> **content**: `object`

#### paths./api/auth/refresh.post.responses.200.content.application/json

> **application/json**: `object`

#### paths./api/auth/refresh.post.responses.200.content.application/json.schema

> **schema**: `TObject`\<\{ `accessToken`: `TString`; `refreshToken`: `TString`; `user`: `TObject`\<...\>; \}\> = `AuthResponseSchema`

#### paths./api/auth/refresh.post.responses.401

> **401**: `object`

#### paths./api/auth/refresh.post.responses.401.description

> **description**: `string` = `'Invalid refresh token'`

#### paths./api/auth/refresh.post.responses.401.content

> **content**: `object`

#### paths./api/auth/refresh.post.responses.401.content.application/json

> **application/json**: `object`

#### paths./api/auth/refresh.post.responses.401.content.application/json.schema

> **schema**: `TObject`\<\{ `error`: `TString`; `details`: `TOptional`\<...\>; \}\> = `ErrorResponseSchema`

#### paths./health

> **/health**: `object`

#### paths./health.get

> **get**: `object`

#### paths./health.get.summary

> **summary**: `string` = `'Health check endpoint'`

#### paths./health.get.operationId

> **operationId**: `string` = `'getHealth'`

#### paths./health.get.tags

> **tags**: `string`[]

#### paths./health.get.security

> **security**: `never`[] = `[]`

#### paths./health.get.responses

> **responses**: `object`

#### paths./health.get.responses.200

> **200**: `object`

#### paths./health.get.responses.200.description

> **description**: `string` = `'Server is healthy'`

#### paths./health.get.responses.200.content

> **content**: `object`

#### paths./health.get.responses.200.content.application/json

> **application/json**: `object`

#### paths./health.get.responses.200.content.application/json.schema

> **schema**: `object`

#### paths./health.get.responses.200.content.application/json.schema.type

> **type**: `string` = `'object'`

#### paths./health.get.responses.200.content.application/json.schema.properties

> **properties**: `object`

#### paths./health.get.responses.200.content.application/json.schema.properties.status

> **status**: `object`

#### paths./health.get.responses.200.content.application/json.schema.properties.status.type

> **type**: ... = `'string'`

#### paths./health.get.responses.200.content.application/json.schema.properties.status.const

> **const**: ... = `'ok'`

#### paths./api/documents

> **/api/documents**: `object`

#### paths./api/documents.get

> **get**: `object`

#### paths./api/documents.get.summary

> **summary**: `string` = `'List all documents'`

#### paths./api/documents.get.operationId

> **operationId**: `string` = `'listDocuments'`

#### paths./api/documents.get.tags

> **tags**: `string`[]

#### paths./api/documents.get.responses

> **responses**: `object`

#### paths./api/documents.get.responses.200

> **200**: `object`

#### paths./api/documents.get.responses.200.description

> **description**: `string` = `'List of documents'`

#### paths./api/documents.get.responses.200.content

> **content**: `object`

#### paths./api/documents.get.responses.200.content.application/json

> **application/json**: `object`

#### paths./api/documents.get.responses.200.content.application/json.schema

> **schema**: `TArray`\<`TObject`\<\{ `id`: ...; `title`: ...; `content`: ...; `acl`: ...; `createdAt`: ...; `updatedAt`: ...; \}\>\> = `DocumentListSchema`

#### paths./api/documents.get.responses.500

> **500**: `object`

#### paths./api/documents.get.responses.500.description

> **description**: `string` = `'Internal server error'`

#### paths./api/documents.get.responses.500.content

> **content**: `object`

#### paths./api/documents.get.responses.500.content.application/json

> **application/json**: `object`

#### paths./api/documents.get.responses.500.content.application/json.schema

> **schema**: `TObject`\<\{ `error`: `TString`; `details`: `TOptional`\<...\>; \}\> = `ErrorResponseSchema`

#### paths./api/documents.post

> **post**: `object`

#### paths./api/documents.post.summary

> **summary**: `string` = `'Create a new document'`

#### paths./api/documents.post.operationId

> **operationId**: `string` = `'createDocument'`

#### paths./api/documents.post.tags

> **tags**: `string`[]

#### paths./api/documents.post.requestBody

> **requestBody**: `object`

#### paths./api/documents.post.requestBody.required

> **required**: `boolean` = `true`

#### paths./api/documents.post.requestBody.content

> **content**: `object`

#### paths./api/documents.post.requestBody.content.application/json

> **application/json**: `object`

#### paths./api/documents.post.requestBody.content.application/json.schema

> **schema**: `TObject`\<\{ `title`: `TString`; `content`: `TOptional`\<`TString`\>; \}\> = `CreateDocumentRequestSchema`

#### paths./api/documents.post.responses

> **responses**: `object`

#### paths./api/documents.post.responses.201

> **201**: `object`

#### paths./api/documents.post.responses.201.description

> **description**: `string` = `'Document created successfully'`

#### paths./api/documents.post.responses.201.content

> **content**: `object`

#### paths./api/documents.post.responses.201.content.application/json

> **application/json**: `object`

#### paths./api/documents.post.responses.201.content.application/json.schema

> **schema**: `TObject`\<\{ `id`: `TString`; `title`: `TString`; `content`: `TString`; `acl`: `TObject`\<...\>; `createdAt`: `TString`; `updatedAt`: `TString`; \}\> = `CreateDocumentResponseSchema`

#### paths./api/documents.post.responses.400

> **400**: `object`

#### paths./api/documents.post.responses.400.description

> **description**: `string` = `'Invalid request'`

#### paths./api/documents.post.responses.400.content

> **content**: `object`

#### paths./api/documents.post.responses.400.content.application/json

> **application/json**: `object`

#### paths./api/documents.post.responses.400.content.application/json.schema

> **schema**: `TObject`\<\{ `error`: `TString`; `details`: `TOptional`\<...\>; \}\> = `ErrorResponseSchema`

#### paths./api/documents.post.responses.500

> **500**: `object`

#### paths./api/documents.post.responses.500.description

> **description**: `string` = `'Internal server error'`

#### paths./api/documents.post.responses.500.content

> **content**: `object`

#### paths./api/documents.post.responses.500.content.application/json

> **application/json**: `object`

#### paths./api/documents.post.responses.500.content.application/json.schema

> **schema**: `TObject`\<\{ `error`: `TString`; `details`: `TOptional`\<...\>; \}\> = `ErrorResponseSchema`

#### paths./api/documents/\{id\}

> **/api/documents/\{id\}**: `object`

#### paths./api/documents/\{id\}.parameters

> **parameters**: `object`[]

#### paths./api/documents/\{id\}.get

> **get**: `object`

#### paths./api/documents/\{id\}.get.summary

> **summary**: `string` = `'Get a document by ID'`

#### paths./api/documents/\{id\}.get.operationId

> **operationId**: `string` = `'getDocument'`

#### paths./api/documents/\{id\}.get.tags

> **tags**: `string`[]

#### paths./api/documents/\{id\}.get.responses

> **responses**: `object`

#### paths./api/documents/\{id\}.get.responses.200

> **200**: `object`

#### paths./api/documents/\{id\}.get.responses.200.description

> **description**: `string` = `'Document details'`

#### paths./api/documents/\{id\}.get.responses.200.content

> **content**: `object`

#### paths./api/documents/\{id\}.get.responses.200.content.application/json

> **application/json**: `object`

#### paths./api/documents/\{id\}.get.responses.200.content.application/json.schema

> **schema**: `TObject`\<\{ `id`: `TString`; `title`: `TString`; `content`: `TString`; `acl`: `TObject`\<...\>; `createdAt`: `TString`; `updatedAt`: `TString`; \}\> = `DocumentSchema`

#### paths./api/documents/\{id\}.get.responses.404

> **404**: `object`

#### paths./api/documents/\{id\}.get.responses.404.description

> **description**: `string` = `'Document not found'`

#### paths./api/documents/\{id\}.get.responses.404.content

> **content**: `object`

#### paths./api/documents/\{id\}.get.responses.404.content.application/json

> **application/json**: `object`

#### paths./api/documents/\{id\}.get.responses.404.content.application/json.schema

> **schema**: `TObject`\<\{ `error`: `TString`; `details`: `TOptional`\<...\>; \}\> = `ErrorResponseSchema`

#### paths./api/documents/\{id\}.get.responses.500

> **500**: `object`

#### paths./api/documents/\{id\}.get.responses.500.description

> **description**: `string` = `'Internal server error'`

#### paths./api/documents/\{id\}.get.responses.500.content

> **content**: `object`

#### paths./api/documents/\{id\}.get.responses.500.content.application/json

> **application/json**: `object`

#### paths./api/documents/\{id\}.get.responses.500.content.application/json.schema

> **schema**: `TObject`\<\{ `error`: `TString`; `details`: `TOptional`\<...\>; \}\> = `ErrorResponseSchema`

#### paths./api/documents/\{id\}.patch

> **patch**: `object`

#### paths./api/documents/\{id\}.patch.summary

> **summary**: `string` = `'Update a document'`

#### paths./api/documents/\{id\}.patch.operationId

> **operationId**: `string` = `'updateDocument'`

#### paths./api/documents/\{id\}.patch.tags

> **tags**: `string`[]

#### paths./api/documents/\{id\}.patch.requestBody

> **requestBody**: `object`

#### paths./api/documents/\{id\}.patch.requestBody.required

> **required**: `boolean` = `true`

#### paths./api/documents/\{id\}.patch.requestBody.content

> **content**: `object`

#### paths./api/documents/\{id\}.patch.requestBody.content.application/json

> **application/json**: `object`

#### paths./api/documents/\{id\}.patch.requestBody.content.application/json.schema

> **schema**: `TObject`\<\{ `title`: `TOptional`\<`TString`\>; `content`: `TOptional`\<`TString`\>; \}\> = `DocumentUpdateSchema`

#### paths./api/documents/\{id\}.patch.responses

> **responses**: `object`

#### paths./api/documents/\{id\}.patch.responses.200

> **200**: `object`

#### paths./api/documents/\{id\}.patch.responses.200.description

> **description**: `string` = `'Document updated successfully'`

#### paths./api/documents/\{id\}.patch.responses.200.content

> **content**: `object`

#### paths./api/documents/\{id\}.patch.responses.200.content.application/json

> **application/json**: `object`

#### paths./api/documents/\{id\}.patch.responses.200.content.application/json.schema

> **schema**: `TObject`\<\{ `id`: `TString`; `title`: `TString`; `content`: `TString`; `acl`: `TObject`\<...\>; `createdAt`: `TString`; `updatedAt`: `TString`; \}\> = `DocumentSchema`

#### paths./api/documents/\{id\}.patch.responses.400

> **400**: `object`

#### paths./api/documents/\{id\}.patch.responses.400.description

> **description**: `string` = `'Invalid request'`

#### paths./api/documents/\{id\}.patch.responses.400.content

> **content**: `object`

#### paths./api/documents/\{id\}.patch.responses.400.content.application/json

> **application/json**: `object`

#### paths./api/documents/\{id\}.patch.responses.400.content.application/json.schema

> **schema**: `TObject`\<\{ `error`: `TString`; `details`: `TOptional`\<...\>; \}\> = `ErrorResponseSchema`

#### paths./api/documents/\{id\}.patch.responses.404

> **404**: `object`

#### paths./api/documents/\{id\}.patch.responses.404.description

> **description**: `string` = `'Document not found'`

#### paths./api/documents/\{id\}.patch.responses.404.content

> **content**: `object`

#### paths./api/documents/\{id\}.patch.responses.404.content.application/json

> **application/json**: `object`

#### paths./api/documents/\{id\}.patch.responses.404.content.application/json.schema

> **schema**: `TObject`\<\{ `error`: `TString`; `details`: `TOptional`\<...\>; \}\> = `ErrorResponseSchema`

#### paths./api/documents/\{id\}.patch.responses.500

> **500**: `object`

#### paths./api/documents/\{id\}.patch.responses.500.description

> **description**: `string` = `'Internal server error'`

#### paths./api/documents/\{id\}.patch.responses.500.content

> **content**: `object`

#### paths./api/documents/\{id\}.patch.responses.500.content.application/json

> **application/json**: `object`

#### paths./api/documents/\{id\}.patch.responses.500.content.application/json.schema

> **schema**: `TObject`\<\{ `error`: `TString`; `details`: `TOptional`\<...\>; \}\> = `ErrorResponseSchema`

#### paths./api/documents/\{id\}.delete

> **delete**: `object`

#### paths./api/documents/\{id\}.delete.summary

> **summary**: `string` = `'Delete a document'`

#### paths./api/documents/\{id\}.delete.operationId

> **operationId**: `string` = `'deleteDocument'`

#### paths./api/documents/\{id\}.delete.tags

> **tags**: `string`[]

#### paths./api/documents/\{id\}.delete.responses

> **responses**: `object`

#### paths./api/documents/\{id\}.delete.responses.204

> **204**: `object`

#### paths./api/documents/\{id\}.delete.responses.204.description

> **description**: `string` = `'Document deleted successfully'`

#### paths./api/documents/\{id\}.delete.responses.404

> **404**: `object`

#### paths./api/documents/\{id\}.delete.responses.404.description

> **description**: `string` = `'Document not found'`

#### paths./api/documents/\{id\}.delete.responses.404.content

> **content**: `object`

#### paths./api/documents/\{id\}.delete.responses.404.content.application/json

> **application/json**: `object`

#### paths./api/documents/\{id\}.delete.responses.404.content.application/json.schema

> **schema**: `TObject`\<\{ `error`: `TString`; `details`: `TOptional`\<...\>; \}\> = `ErrorResponseSchema`

#### paths./api/documents/\{id\}.delete.responses.500

> **500**: `object`

#### paths./api/documents/\{id\}.delete.responses.500.description

> **description**: `string` = `'Internal server error'`

#### paths./api/documents/\{id\}.delete.responses.500.content

> **content**: `object`

#### paths./api/documents/\{id\}.delete.responses.500.content.application/json

> **application/json**: `object`

#### paths./api/documents/\{id\}.delete.responses.500.content.application/json.schema

> **schema**: `TObject`\<\{ `error`: `TString`; `details`: `TOptional`\<...\>; \}\> = `ErrorResponseSchema`

#### paths./api/documents/\{id\}/permissions

> **/api/documents/\{id\}/permissions**: `object`

#### paths./api/documents/\{id\}/permissions.parameters

> **parameters**: `object`[]

#### paths./api/documents/\{id\}/permissions.get

> **get**: `object`

#### paths./api/documents/\{id\}/permissions.get.summary

> **summary**: `string` = `'Get document permissions for current user'`

#### paths./api/documents/\{id\}/permissions.get.operationId

> **operationId**: `string` = `'getDocumentPermissions'`

#### paths./api/documents/\{id\}/permissions.get.tags

> **tags**: `string`[]

#### paths./api/documents/\{id\}/permissions.get.description

> **description**: `string` = `"Retrieve the current user's permissions for a specific document"`

#### paths./api/documents/\{id\}/permissions.get.responses

> **responses**: `object`

#### paths./api/documents/\{id\}/permissions.get.responses.200

> **200**: `object`

#### paths./api/documents/\{id\}/permissions.get.responses.200.description

> **description**: `string` = `'User permissions for the document'`

#### paths./api/documents/\{id\}/permissions.get.responses.200.content

> **content**: `object`

#### paths./api/documents/\{id\}/permissions.get.responses.200.content.application/json

> **application/json**: `object`

#### paths./api/documents/\{id\}/permissions.get.responses.200.content.application/json.schema

> **schema**: `TObject`\<\{ `canRead`: `TBoolean`; `canWrite`: `TBoolean`; `canDelete`: `TBoolean`; \}\> = `PermissionsSchema`

#### paths./api/documents/\{id\}/permissions.get.responses.400

> **400**: `object`

#### paths./api/documents/\{id\}/permissions.get.responses.400.description

> **description**: `string` = `'Invalid document ID'`

#### paths./api/documents/\{id\}/permissions.get.responses.400.content

> **content**: `object`

#### paths./api/documents/\{id\}/permissions.get.responses.400.content.application/json

> **application/json**: `object`

#### paths./api/documents/\{id\}/permissions.get.responses.400.content.application/json.schema

> **schema**: `TObject`\<\{ `error`: `TString`; `details`: `TOptional`\<...\>; \}\> = `ErrorResponseSchema`

#### paths./api/documents/\{id\}/permissions.get.responses.401

> **401**: `object`

#### paths./api/documents/\{id\}/permissions.get.responses.401.description

> **description**: `string` = `'Authentication required'`

#### paths./api/documents/\{id\}/permissions.get.responses.401.content

> **content**: `object`

#### paths./api/documents/\{id\}/permissions.get.responses.401.content.application/json

> **application/json**: `object`

#### paths./api/documents/\{id\}/permissions.get.responses.401.content.application/json.schema

> **schema**: `TObject`\<\{ `error`: `TString`; `details`: `TOptional`\<...\>; \}\> = `ErrorResponseSchema`

#### paths./api/documents/\{id\}/permissions.get.responses.403

> **403**: `object`

#### paths./api/documents/\{id\}/permissions.get.responses.403.description

> **description**: `string` = `'Access denied - user cannot read this document'`

#### paths./api/documents/\{id\}/permissions.get.responses.403.content

> **content**: `object`

#### paths./api/documents/\{id\}/permissions.get.responses.403.content.application/json

> **application/json**: `object`

#### paths./api/documents/\{id\}/permissions.get.responses.403.content.application/json.schema

> **schema**: `TObject`\<\{ `error`: `TString`; `details`: `TOptional`\<...\>; \}\> = `ErrorResponseSchema`

#### paths./api/documents/\{id\}/permissions.get.responses.500

> **500**: `object`

#### paths./api/documents/\{id\}/permissions.get.responses.500.description

> **description**: `string` = `'Internal server error'`

#### paths./api/documents/\{id\}/permissions.get.responses.500.content

> **content**: `object`

#### paths./api/documents/\{id\}/permissions.get.responses.500.content.application/json

> **application/json**: `object`

#### paths./api/documents/\{id\}/permissions.get.responses.500.content.application/json.schema

> **schema**: `TObject`\<\{ `error`: `TString`; `details`: `TOptional`\<...\>; \}\> = `ErrorResponseSchema`

#### paths./api/documents/\{id\}/permissions.put

> **put**: `object`

#### paths./api/documents/\{id\}/permissions.put.summary

> **summary**: `string` = `'Update document permissions (ACL)'`

#### paths./api/documents/\{id\}/permissions.put.operationId

> **operationId**: `string` = `'updateDocumentPermissions'`

#### paths./api/documents/\{id\}/permissions.put.tags

> **tags**: `string`[]

#### paths./api/documents/\{id\}/permissions.put.description

> **description**: `string` = `'Update the access control list for a document (owner/admin only)'`

#### paths./api/documents/\{id\}/permissions.put.requestBody

> **requestBody**: `object`

#### paths./api/documents/\{id\}/permissions.put.requestBody.required

> **required**: `boolean` = `true`

#### paths./api/documents/\{id\}/permissions.put.requestBody.content

> **content**: `object`

#### paths./api/documents/\{id\}/permissions.put.requestBody.content.application/json

> **application/json**: `object`

#### paths./api/documents/\{id\}/permissions.put.requestBody.content.application/json.schema

> **schema**: `object`

#### paths./api/documents/\{id\}/permissions.put.requestBody.content.application/json.schema.type

> **type**: `string` = `'object'`

#### paths./api/documents/\{id\}/permissions.put.requestBody.content.application/json.schema.properties

> **properties**: `object`

#### paths./api/documents/\{id\}/permissions.put.requestBody.content.application/json.schema.properties.editors

> **editors**: `object`

#### paths./api/documents/\{id\}/permissions.put.requestBody.content.application/json.schema.properties.editors.type

> **type**: `string` = `'array'`

#### paths./api/documents/\{id\}/permissions.put.requestBody.content.application/json.schema.properties.editors.items

> **items**: `object`

#### paths./api/documents/\{id\}/permissions.put.requestBody.content.application/json.schema.properties.editors.items.type

> **type**: ... = `'string'`

#### paths./api/documents/\{id\}/permissions.put.requestBody.content.application/json.schema.properties.editors.items.format

> **format**: ... = `'uuid'`

#### paths./api/documents/\{id\}/permissions.put.requestBody.content.application/json.schema.properties.editors.description

> **description**: `string` = `'Array of user IDs with edit permissions'`

#### paths./api/documents/\{id\}/permissions.put.requestBody.content.application/json.schema.properties.viewers

> **viewers**: `object`

#### paths./api/documents/\{id\}/permissions.put.requestBody.content.application/json.schema.properties.viewers.type

> **type**: `string` = `'array'`

#### paths./api/documents/\{id\}/permissions.put.requestBody.content.application/json.schema.properties.viewers.items

> **items**: `object`

#### paths./api/documents/\{id\}/permissions.put.requestBody.content.application/json.schema.properties.viewers.items.type

> **type**: ... = `'string'`

#### paths./api/documents/\{id\}/permissions.put.requestBody.content.application/json.schema.properties.viewers.items.format

> **format**: ... = `'uuid'`

#### paths./api/documents/\{id\}/permissions.put.requestBody.content.application/json.schema.properties.viewers.description

> **description**: `string` = `'Array of user IDs with view permissions'`

#### paths./api/documents/\{id\}/permissions.put.requestBody.content.application/json.schema.required

> **required**: `string`[]

#### paths./api/documents/\{id\}/permissions.put.responses

> **responses**: `object`

#### paths./api/documents/\{id\}/permissions.put.responses.200

> **200**: `object`

#### paths./api/documents/\{id\}/permissions.put.responses.200.description

> **description**: `string` = `'Permissions updated successfully'`

#### paths./api/documents/\{id\}/permissions.put.responses.200.content

> **content**: `object`

#### paths./api/documents/\{id\}/permissions.put.responses.200.content.application/json

> **application/json**: `object`

#### paths./api/documents/\{id\}/permissions.put.responses.200.content.application/json.schema

> **schema**: `object`

#### paths./api/documents/\{id\}/permissions.put.responses.200.content.application/json.schema.type

> **type**: `string` = `'object'`

#### paths./api/documents/\{id\}/permissions.put.responses.200.content.application/json.schema.properties

> **properties**: `object`

#### paths./api/documents/\{id\}/permissions.put.responses.200.content.application/json.schema.properties.message

> **message**: `object`

#### paths./api/documents/\{id\}/permissions.put.responses.200.content.application/json.schema.properties.message.type

> **type**: ... = `'string'`

#### paths./api/documents/\{id\}/permissions.put.responses.200.content.application/json.schema.properties.message.example

> **example**: ... = `'Permissions updated successfully'`

#### paths./api/documents/\{id\}/permissions.put.responses.400

> **400**: `object`

#### paths./api/documents/\{id\}/permissions.put.responses.400.description

> **description**: `string` = `'Invalid request'`

#### paths./api/documents/\{id\}/permissions.put.responses.400.content

> **content**: `object`

#### paths./api/documents/\{id\}/permissions.put.responses.400.content.application/json

> **application/json**: `object`

#### paths./api/documents/\{id\}/permissions.put.responses.400.content.application/json.schema

> **schema**: `TObject`\<\{ `error`: `TString`; `details`: `TOptional`\<...\>; \}\> = `ErrorResponseSchema`

#### paths./api/documents/\{id\}/permissions.put.responses.401

> **401**: `object`

#### paths./api/documents/\{id\}/permissions.put.responses.401.description

> **description**: `string` = `'Authentication required'`

#### paths./api/documents/\{id\}/permissions.put.responses.401.content

> **content**: `object`

#### paths./api/documents/\{id\}/permissions.put.responses.401.content.application/json

> **application/json**: `object`

#### paths./api/documents/\{id\}/permissions.put.responses.401.content.application/json.schema

> **schema**: `TObject`\<\{ `error`: `TString`; `details`: `TOptional`\<...\>; \}\> = `ErrorResponseSchema`

#### paths./api/documents/\{id\}/permissions.put.responses.403

> **403**: `object`

#### paths./api/documents/\{id\}/permissions.put.responses.403.description

> **description**: `string` = `'Access denied - only owners can change permissions'`

#### paths./api/documents/\{id\}/permissions.put.responses.403.content

> **content**: `object`

#### paths./api/documents/\{id\}/permissions.put.responses.403.content.application/json

> **application/json**: `object`

#### paths./api/documents/\{id\}/permissions.put.responses.403.content.application/json.schema

> **schema**: `TObject`\<\{ `error`: `TString`; `details`: `TOptional`\<...\>; \}\> = `ErrorResponseSchema`

#### paths./api/documents/\{id\}/permissions.put.responses.404

> **404**: `object`

#### paths./api/documents/\{id\}/permissions.put.responses.404.description

> **description**: `string` = `'Document not found'`

#### paths./api/documents/\{id\}/permissions.put.responses.404.content

> **content**: `object`

#### paths./api/documents/\{id\}/permissions.put.responses.404.content.application/json

> **application/json**: `object`

#### paths./api/documents/\{id\}/permissions.put.responses.404.content.application/json.schema

> **schema**: `TObject`\<\{ `error`: `TString`; `details`: `TOptional`\<...\>; \}\> = `ErrorResponseSchema`

#### paths./api/documents/\{id\}/permissions.put.responses.500

> **500**: `object`

#### paths./api/documents/\{id\}/permissions.put.responses.500.description

> **description**: `string` = `'Internal server error'`

#### paths./api/documents/\{id\}/permissions.put.responses.500.content

> **content**: `object`

#### paths./api/documents/\{id\}/permissions.put.responses.500.content.application/json

> **application/json**: `object`

#### paths./api/documents/\{id\}/permissions.put.responses.500.content.application/json.schema

> **schema**: `TObject`\<\{ `error`: `TString`; `details`: `TOptional`\<...\>; \}\> = `ErrorResponseSchema`

### components

> **components**: `object`

#### components.schemas

> **schemas**: `object`

#### components.schemas.Document

> **Document**: `TObject`\<\{ `id`: `TString`; `title`: `TString`; `content`: `TString`; `acl`: `TObject`\<\{ `owner`: `TString`; `editors`: `TArray`\<`TString`\>; `viewers`: `TArray`\<`TString`\>; \}\>; `createdAt`: `TString`; `updatedAt`: `TString`; \}\> = `DocumentSchema`

#### components.schemas.DocumentList

> **DocumentList**: `TArray`\<`TObject`\<\{ `id`: `TString`; `title`: `TString`; `content`: `TString`; `acl`: `TObject`\<\{ `owner`: `TString`; `editors`: `TArray`\<`TString`\>; `viewers`: `TArray`\<`TString`\>; \}\>; `createdAt`: `TString`; `updatedAt`: `TString`; \}\>\> = `DocumentListSchema`

#### components.schemas.CreateDocumentRequest

> **CreateDocumentRequest**: `TObject`\<\{ `title`: `TString`; `content`: `TOptional`\<`TString`\>; \}\> = `CreateDocumentRequestSchema`

#### components.schemas.CreateDocumentResponse

> **CreateDocumentResponse**: `TObject`\<\{ `id`: `TString`; `title`: `TString`; `content`: `TString`; `acl`: `TObject`\<\{ `owner`: `TString`; `editors`: `TArray`\<`TString`\>; `viewers`: `TArray`\<`TString`\>; \}\>; `createdAt`: `TString`; `updatedAt`: `TString`; \}\> = `CreateDocumentResponseSchema`

#### components.schemas.DocumentUpdate

> **DocumentUpdate**: `TObject`\<\{ `title`: `TOptional`\<`TString`\>; `content`: `TOptional`\<`TString`\>; \}\> = `DocumentUpdateSchema`

#### components.schemas.ErrorResponse

> **ErrorResponse**: `TObject`\<\{ `error`: `TString`; `details`: `TOptional`\<`TUnknown`\>; \}\> = `ErrorResponseSchema`

#### components.schemas.Permissions

> **Permissions**: `TObject`\<\{ `canRead`: `TBoolean`; `canWrite`: `TBoolean`; `canDelete`: `TBoolean`; \}\> = `PermissionsSchema`

#### components.schemas.CreateUserRequest

> **CreateUserRequest**: `TObject`\<\{ `email`: `TString`; `password`: `TString`; \}\> = `CreateUserRequestSchema`

#### components.schemas.LoginRequest

> **LoginRequest**: `TObject`\<\{ `email`: `TString`; `password`: `TString`; \}\> = `LoginRequestSchema`

#### components.schemas.AuthResponse

> **AuthResponse**: `TObject`\<\{ `accessToken`: `TString`; `refreshToken`: `TString`; `user`: `TObject`\<\{ `id`: `TString`; `email`: `TString`; `role`: `TUnion`\<\[`TLiteral`\<`"viewer"`\>, `TLiteral`\<`"editor"`\>, `TLiteral`\<`"owner"`\>, `TLiteral`\<`"admin"`\>\]\>; `createdAt`: `TString`; `updatedAt`: `TString`; \}\>; \}\> = `AuthResponseSchema`

#### components.schemas.RefreshTokenRequest

> **RefreshTokenRequest**: `TObject`\<\{ `refreshToken`: `TString`; \}\> = `RefreshTokenRequestSchema`

#### components.securitySchemes

> **securitySchemes**: `object`

#### components.securitySchemes.bearerAuth

> **bearerAuth**: `object`

#### components.securitySchemes.bearerAuth.type

> **type**: `string` = `'http'`

#### components.securitySchemes.bearerAuth.scheme

> **scheme**: `string` = `'bearer'`

#### components.securitySchemes.bearerAuth.bearerFormat

> **bearerFormat**: `string` = `'JWT'`

#### components.securitySchemes.bearerAuth.description

> **description**: `string` = `'JWT authentication using Bearer token'`

### tags

> **tags**: `object`[]
