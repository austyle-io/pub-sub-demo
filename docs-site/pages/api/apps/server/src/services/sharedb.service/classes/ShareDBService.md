[**collab-edit-demo**](../../../../../../README.md)

***

[collab-edit-demo](../../../../../../README.md) / [apps/server/src/services/sharedb.service](../README.md) / ShareDBService

# Class: ShareDBService

Defined in: [apps/server/src/services/sharedb.service.ts:41](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/services/sharedb.service.ts#L41)

Service to configure and attach ShareDB for real-time document collaboration.

## Constructors

### Constructor

> **new ShareDBService**(): `ShareDBService`

Defined in: [apps/server/src/services/sharedb.service.ts:45](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/services/sharedb.service.ts#L45)

#### Returns

`ShareDBService`

## Methods

### attachToServer()

> **attachToServer**(`server`): `void`

Defined in: [apps/server/src/services/sharedb.service.ts:188](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/services/sharedb.service.ts#L188)

Attach the WebSocket server to the given HTTP server, with auth upgrade handling.

#### Parameters

##### server

`Server`

HTTP server instance to upgrade

#### Returns

`void`

***

### getShareDB()

> **getShareDB**(): `ShareDB`

Defined in: [apps/server/src/services/sharedb.service.ts:225](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/services/sharedb.service.ts#L225)

Access the underlying ShareDB backend instance.

#### Returns

`ShareDB`

configured ShareDB backend

***

### createAuthenticatedConnection()

> **createAuthenticatedConnection**(`userId`, `email`, `role`): `Connection`

Defined in: [apps/server/src/services/sharedb.service.ts:232](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/services/sharedb.service.ts#L232)

Create a connection with user context for backend operations

#### Parameters

##### userId

`string`

##### email

`string`

##### role

`string`

#### Returns

`Connection`
