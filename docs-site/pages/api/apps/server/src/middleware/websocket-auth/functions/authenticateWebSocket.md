[**collab-edit-demo**](../../../../../../README.md)

***

[collab-edit-demo](../../../../../../README.md) / [apps/server/src/middleware/websocket-auth](../README.md) / authenticateWebSocket

# Function: authenticateWebSocket()

> **authenticateWebSocket**(`req`): `Promise`\<\{ `id`: `string`; `email`: `string`; `password`: `string`; `role`: `"viewer"` \| `"editor"` \| `"owner"` \| `"admin"`; `createdAt`: `string`; `updatedAt`: `string`; \}\>

Defined in: [apps/server/src/middleware/websocket-auth.ts:19](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/middleware/websocket-auth.ts#L19)

## Parameters

### req

`IncomingMessage`

## Returns

`Promise`\<\{ `id`: `string`; `email`: `string`; `password`: `string`; `role`: `"viewer"` \| `"editor"` \| `"owner"` \| `"admin"`; `createdAt`: `string`; `updatedAt`: `string`; \}\>
