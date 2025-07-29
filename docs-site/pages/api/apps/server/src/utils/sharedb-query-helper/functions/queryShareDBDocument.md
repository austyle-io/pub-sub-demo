[**collab-edit-demo**](../../../../../../README.md)

***

[collab-edit-demo](../../../../../../README.md) / [apps/server/src/utils/sharedb-query-helper](../README.md) / queryShareDBDocument

# Function: queryShareDBDocument()

> **queryShareDBDocument**(`collection`, `docId`, `userId`, `userEmail`, `userRole`): `Promise`\<[`ShareDBQueryResult`](../type-aliases/ShareDBQueryResult.md)\<\{ `id`: `string`; `title`: `string`; `content`: `string`; `acl`: \{ `owner`: `string`; `editors`: `string`[]; `viewers`: `string`[]; \}; `createdAt`: `string`; `updatedAt`: `string`; \}\>\>

Defined in: [apps/server/src/utils/sharedb-query-helper.ts:28](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/utils/sharedb-query-helper.ts#L28)

Fetch a document using ShareDB connection (guarantees latest state)

## Parameters

### collection

`string`

ShareDB collection name

### docId

`string`

Document ID

### userId

`string`

User ID for authentication context

### userEmail

`string`

User email for authentication context

### userRole

`string`

User role for authentication context

## Returns

`Promise`\<[`ShareDBQueryResult`](../type-aliases/ShareDBQueryResult.md)\<\{ `id`: `string`; `title`: `string`; `content`: `string`; `acl`: \{ `owner`: `string`; `editors`: `string`[]; `viewers`: `string`[]; \}; `createdAt`: `string`; `updatedAt`: `string`; \}\>\>

Promise with document data or error
