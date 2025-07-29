[**collab-edit-demo**](../../../../../../README.md)

***

[collab-edit-demo](../../../../../../README.md) / [apps/server/src/utils/permission-cache](../README.md) / getCachedPermissions

# Function: getCachedPermissions()

> **getCachedPermissions**(`collection`, `docId`, `userId`, `computeFn`): `Promise`\<\{ `canRead`: `boolean`; `canWrite`: `boolean`; `canDelete`: `boolean`; `fromCache`: `boolean`; \}\>

Defined in: [apps/server/src/utils/permission-cache.ts:256](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/server/src/utils/permission-cache.ts#L256)

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
