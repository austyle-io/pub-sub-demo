[**collab-edit-demo**](../../../../../../README.md)

***

[collab-edit-demo](../../../../../../README.md) / [apps/server/src/utils/event-consistency](../README.md) / emitPermissionChangeEvent

# Function: emitPermissionChangeEvent()

> **emitPermissionChangeEvent**(`collection`, `docId`, `userId`, `newAcl`, `oldAcl?`): `void`

Defined in: [apps/server/src/utils/event-consistency.ts:189](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/server/src/utils/event-consistency.ts#L189)

Helper function to manually emit permission change events

## Parameters

### collection

`string`

### docId

`string`

### userId

`string`

### newAcl

#### owner

`string`

#### editors

`string`[]

#### viewers

`string`[]

### oldAcl?

#### owner

`string`

#### editors

`string`[]

#### viewers

`string`[]

## Returns

`void`
