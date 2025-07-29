[**collab-edit-demo**](../../../../../../README.md)

***

[collab-edit-demo](../../../../../../README.md) / [apps/server/src/middleware/websocket-auth](../README.md) / authenticateWebSocket

# Function: authenticateWebSocket()

> **authenticateWebSocket**(`req`): `Promise`\<\{ `id`: `string`; `email`: `string`; `password`: `string`; `role`: `"viewer"` \| `"editor"` \| `"owner"` \| `"admin"`; `createdAt`: `string`; `updatedAt`: `string`; \}\>

Defined in: [apps/server/src/middleware/websocket-auth.ts:27](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/server/src/middleware/websocket-auth.ts#L27)

authenticate Web Socket.

## Parameters

### req

`IncomingMessage`

## Returns

`Promise`\<\{ `id`: `string`; `email`: `string`; `password`: `string`; `role`: `"viewer"` \| `"editor"` \| `"owner"` \| `"admin"`; `createdAt`: `string`; `updatedAt`: `string`; \}\>

## Since

1.0.0
