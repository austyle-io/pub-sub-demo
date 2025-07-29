[**collab-edit-demo**](../../../../../../README.md)

***

[collab-edit-demo](../../../../../../README.md) / [apps/server/src/services/sharedb.service](../README.md) / ShareDBService

# Class: ShareDBService

Defined in: [apps/server/src/services/sharedb.service.ts:77](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/server/src/services/sharedb.service.ts#L77)

Service to configure and attach ShareDB for real-time document collaboration.

This service manages the ShareDB backend, WebSocket connections, and middleware
for authentication and permission checking in a collaborative editing environment.

## Example

```typescript
const shareDBService = initializeShareDB();
shareDBService.attachToServer(httpServer);
```

## Since

1.0.0

## Constructors

### Constructor

> **new ShareDBService**(): `ShareDBService`

Defined in: [apps/server/src/services/sharedb.service.ts:90](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/server/src/services/sharedb.service.ts#L90)

#### Returns

`ShareDBService`

## Methods

### attachToServer()

> **attachToServer**(`server`): `void`

Defined in: [apps/server/src/services/sharedb.service.ts:253](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/server/src/services/sharedb.service.ts#L253)

Attach the WebSocket server to the given HTTP server, with auth upgrade handling.

This method sets up the WebSocket upgrade handler on the HTTP server, authenticates
incoming WebSocket connections, and establishes ShareDB communication streams.

#### Parameters

##### server

`Server`

HTTP server instance to upgrade

#### Returns

`void`

#### Throws

Will reject WebSocket connections that fail authentication

#### Since

1.0.0

#### Example

```typescript
const server = http.createServer(app);
shareDBService.attachToServer(server);
```

***

### getShareDB()

> **getShareDB**(): `ShareDB`

Defined in: [apps/server/src/services/sharedb.service.ts:298](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/server/src/services/sharedb.service.ts#L298)

Access the underlying ShareDB backend instance.

#### Returns

`ShareDB`

The configured ShareDB backend instance

#### Since

1.0.0

#### Example

```typescript
const backend = shareDBService.getShareDB();
const doc = backend.connect().get('documents', 'doc-id');
```

***

### createAuthenticatedConnection()

> **createAuthenticatedConnection**(`userId`, `email`, `role`): `Connection`

Defined in: [apps/server/src/services/sharedb.service.ts:324](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/server/src/services/sharedb.service.ts#L324)

Create a connection with user context for backend operations.

This method creates a ShareDB connection with authenticated user context,
allowing backend operations to respect permission checks.

#### Parameters

##### userId

`string`

Unique identifier of the user

##### email

`string`

Email address of the user

##### role

`string`

User role (e.g., 'admin', 'user')

#### Returns

`Connection`

ShareDB connection with authenticated context

#### Since

1.0.0

#### Example

```typescript
const connection = shareDBService.createAuthenticatedConnection(
  'user-123',
  'user@example.com',
  'user'
);
const doc = connection.get('documents', 'doc-id');
```
