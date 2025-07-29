[**collab-edit-demo**](../../../../../../README.md)

***

[collab-edit-demo](../../../../../../README.md) / [apps/server/src/utils/event-consistency](../README.md) / emitPermissionChangeEvent

# Function: emitPermissionChangeEvent()

> **emitPermissionChangeEvent**(`collection`, `docId`, `userId`, `newAcl`, `oldAcl?`): `void`

Defined in: [apps/server/src/utils/event-consistency.ts:177](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/utils/event-consistency.ts#L177)

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
