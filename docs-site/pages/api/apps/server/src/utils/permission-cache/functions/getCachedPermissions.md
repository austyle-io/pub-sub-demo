[**collab-edit-demo**](../../../../../../README.md)

***

[collab-edit-demo](../../../../../../README.md) / [apps/server/src/utils/permission-cache](../README.md) / getCachedPermissions

# Function: getCachedPermissions()

> **getCachedPermissions**(`collection`, `docId`, `userId`, `computeFn`): `Promise`\<\{ `canRead`: `boolean`; `canWrite`: `boolean`; `canDelete`: `boolean`; `fromCache`: `boolean`; \}\>

Defined in: [apps/server/src/utils/permission-cache.ts:244](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/utils/permission-cache.ts#L244)

Helper function to get or compute permissions with caching

## Parameters

### collection

`string`

### docId

`string`

### userId

`string`

### computeFn

() => `Promise`\<\{ `canRead`: `boolean`; `canWrite`: `boolean`; `canDelete`: `boolean`; \}\>

## Returns

`Promise`\<\{ `canRead`: `boolean`; `canWrite`: `boolean`; `canDelete`: `boolean`; `fromCache`: `boolean`; \}\>
