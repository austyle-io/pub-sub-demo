[**collab-edit-demo**](../../../../../../README.md)

***

[collab-edit-demo](../../../../../../README.md) / [apps/server/src/utils/event-consistency](../README.md) / emitDocumentChangeEvent

# Function: emitDocumentChangeEvent()

> **emitDocumentChangeEvent**(`collection`, `docId`, `operation`, `userId`, `changes?`): `void`

Defined in: [apps/server/src/utils/event-consistency.ts:157](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/utils/event-consistency.ts#L157)

Helper function to manually emit document change events

Since ShareDB context types are not fully compatible, we'll provide
a manual event emission system that can be called from route handlers
when operations complete.

## Parameters

### collection

`string`

### docId

`string`

### operation

`"delete"` | `"create"` | `"update"`

### userId

`string`

### changes?

`Record`\<`string`, `unknown`\>

## Returns

`void`
