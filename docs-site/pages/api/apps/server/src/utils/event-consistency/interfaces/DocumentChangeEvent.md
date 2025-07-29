[**collab-edit-demo**](../../../../../../README.md)

***

[collab-edit-demo](../../../../../../README.md) / [apps/server/src/utils/event-consistency](../README.md) / DocumentChangeEvent

# Interface: DocumentChangeEvent

Defined in: [apps/server/src/utils/event-consistency.ts:21](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/server/src/utils/event-consistency.ts#L21)

Type definition for document change event.

## Since

1.0.0

## Extended by

- [`PermissionChangeEvent`](PermissionChangeEvent.md)

## Properties

### collection

> **collection**: `string`

Defined in: [apps/server/src/utils/event-consistency.ts:22](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/server/src/utils/event-consistency.ts#L22)

***

### docId

> **docId**: `string`

Defined in: [apps/server/src/utils/event-consistency.ts:23](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/server/src/utils/event-consistency.ts#L23)

***

### operation

> **operation**: `"delete"` \| `"create"` \| `"update"`

Defined in: [apps/server/src/utils/event-consistency.ts:24](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/server/src/utils/event-consistency.ts#L24)

***

### userId

> **userId**: `string`

Defined in: [apps/server/src/utils/event-consistency.ts:25](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/server/src/utils/event-consistency.ts#L25)

***

### timestamp

> **timestamp**: `string`

Defined in: [apps/server/src/utils/event-consistency.ts:26](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/server/src/utils/event-consistency.ts#L26)

***

### changes?

> `optional` **changes**: `Record`\<`string`, `unknown`\>

Defined in: [apps/server/src/utils/event-consistency.ts:27](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/server/src/utils/event-consistency.ts#L27)
