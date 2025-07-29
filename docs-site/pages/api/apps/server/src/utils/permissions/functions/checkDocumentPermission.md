[**collab-edit-demo**](../../../../../../README.md)

***

[collab-edit-demo](../../../../../../README.md) / [apps/server/src/utils/permissions](../README.md) / checkDocumentPermission

# Function: checkDocumentPermission()

> **checkDocumentPermission**(`collection`, `docId`, `userId`, `permission`): `Promise`\<\{ `allowed`: `boolean`; `reason?`: `string`; \}\>

Defined in: [apps/server/src/utils/permissions.ts:7](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/utils/permissions.ts#L7)

## Parameters

### collection

`string`

### docId

`string`

### userId

`string`

### permission

`"delete"` | `"read"` | `"write"`

## Returns

`Promise`\<\{ `allowed`: `boolean`; `reason?`: `string`; \}\>
