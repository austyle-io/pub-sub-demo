[**collab-edit-demo**](../../../../../../README.md)

***

[collab-edit-demo](../../../../../../README.md) / [apps/server/src/utils/permissions](../README.md) / checkDocumentPermission

# Function: checkDocumentPermission()

> **checkDocumentPermission**(`collection`, `docId`, `userId`, `permission`): `Promise`\<\{ `allowed`: `boolean`; `reason?`: `string`; \}\>

Defined in: [apps/server/src/utils/permissions.ts:11](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/server/src/utils/permissions.ts#L11)

check Document Permission.

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

## Since

1.0.0
