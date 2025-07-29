[**collab-edit-demo**](../../README.md)

***

[collab-edit-demo](../../README.md) / [sharedb-types](../README.md) / ObjectDeleteOp

# Type Alias: ObjectDeleteOp

> **ObjectDeleteOp** = `object`

Defined in: [apps/server/src/types/sharedb.ts:104](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/server/src/types/sharedb.ts#L104)

Object delete operation - deletes a value at a path

## Since

1.0.0

## Properties

### p

> **p**: [`Path`](Path.md)

Defined in: [apps/server/src/types/sharedb.ts:106](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/server/src/types/sharedb.ts#L106)

Path to delete from

***

### od

> **od**: [`JSONValue`](JSONValue.md)

Defined in: [apps/server/src/types/sharedb.ts:108](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/server/src/types/sharedb.ts#L108)

Object/value being deleted (for conflict resolution)
