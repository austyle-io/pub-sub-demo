[**collab-edit-demo**](../../../../../../README.md)

***

[collab-edit-demo](../../../../../../README.md) / [apps/server/src/utils/event-consistency](../README.md) / DocumentChangeEvent

# Interface: DocumentChangeEvent

Defined in: [apps/server/src/utils/event-consistency.ts:17](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/utils/event-consistency.ts#L17)

Event-Based Consistency System for ShareDB Operations

This system provides a robust alternative to direct MongoDB queries by listening
to ShareDB operation completion events and providing consistency guarantees.

Key benefits:
- Eliminates race conditions between ShareDB and MongoDB
- Provides real-time notifications of document changes
- Enables reactive programming patterns for document state
- Supports caching invalidation strategies

## Extended by

- [`PermissionChangeEvent`](PermissionChangeEvent.md)

## Properties

### collection

> **collection**: `string`

Defined in: [apps/server/src/utils/event-consistency.ts:18](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/utils/event-consistency.ts#L18)

***

### docId

> **docId**: `string`

Defined in: [apps/server/src/utils/event-consistency.ts:19](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/utils/event-consistency.ts#L19)

***

### operation

> **operation**: `"delete"` \| `"create"` \| `"update"`

Defined in: [apps/server/src/utils/event-consistency.ts:20](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/utils/event-consistency.ts#L20)

***

### userId

> **userId**: `string`

Defined in: [apps/server/src/utils/event-consistency.ts:21](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/utils/event-consistency.ts#L21)

***

### timestamp

> **timestamp**: `string`

Defined in: [apps/server/src/utils/event-consistency.ts:22](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/utils/event-consistency.ts#L22)

***

### changes?

> `optional` **changes**: `Record`\<`string`, `unknown`\>

Defined in: [apps/server/src/utils/event-consistency.ts:23](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/utils/event-consistency.ts#L23)
