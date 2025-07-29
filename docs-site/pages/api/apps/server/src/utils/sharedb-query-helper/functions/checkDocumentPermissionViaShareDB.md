[**collab-edit-demo**](../../../../../../README.md)

***

[collab-edit-demo](../../../../../../README.md) / [apps/server/src/utils/sharedb-query-helper](../README.md) / checkDocumentPermissionViaShareDB

# Function: checkDocumentPermissionViaShareDB()

> **checkDocumentPermissionViaShareDB**(`collection`, `docId`, `userId`, `userEmail`, `userRole`, `permission`): `Promise`\<\{ `allowed`: `boolean`; `reason?`: `string`; \}\>

Defined in: [apps/server/src/utils/sharedb-query-helper.ts:92](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/server/src/utils/sharedb-query-helper.ts#L92)

Check document permissions using ShareDB direct query

This replaces the MongoDB-based permission checking to avoid
race conditions with ShareDB operations.

## Parameters

### collection

`string`

### docId

`string`

### userId

`string`

### userEmail

`string`

### userRole

`string`

### permission

`"delete"` | `"read"` | `"write"`

## Returns

`Promise`\<\{ `allowed`: `boolean`; `reason?`: `string`; \}\>
