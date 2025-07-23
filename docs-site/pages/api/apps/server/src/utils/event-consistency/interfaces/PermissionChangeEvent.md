[**collab-edit-demo**](../../../../../../README.md)

***

[collab-edit-demo](../../../../../../README.md) / [apps/server/src/utils/event-consistency](../README.md) / PermissionChangeEvent

# Interface: PermissionChangeEvent

Defined in: [apps/server/src/utils/event-consistency.ts:26](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/utils/event-consistency.ts#L26)

Event-Based Consistency System for ShareDB Operations

This system provides a robust alternative to direct MongoDB queries by listening
to ShareDB operation completion events and providing consistency guarantees.

Key benefits:
- Eliminates race conditions between ShareDB and MongoDB
- Provides real-time notifications of document changes
- Enables reactive programming patterns for document state
- Supports caching invalidation strategies

## Extends

- [`DocumentChangeEvent`](DocumentChangeEvent.md)

## Properties

### collection

> **collection**: `string`

Defined in: [apps/server/src/utils/event-consistency.ts:18](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/utils/event-consistency.ts#L18)

#### Inherited from

[`DocumentChangeEvent`](DocumentChangeEvent.md).[`collection`](DocumentChangeEvent.md#collection)

***

### docId

> **docId**: `string`

Defined in: [apps/server/src/utils/event-consistency.ts:19](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/utils/event-consistency.ts#L19)

#### Inherited from

[`DocumentChangeEvent`](DocumentChangeEvent.md).[`docId`](DocumentChangeEvent.md#docid)

***

### userId

> **userId**: `string`

Defined in: [apps/server/src/utils/event-consistency.ts:21](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/utils/event-consistency.ts#L21)

#### Inherited from

[`DocumentChangeEvent`](DocumentChangeEvent.md).[`userId`](DocumentChangeEvent.md#userid)

***

### timestamp

> **timestamp**: `string`

Defined in: [apps/server/src/utils/event-consistency.ts:22](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/utils/event-consistency.ts#L22)

#### Inherited from

[`DocumentChangeEvent`](DocumentChangeEvent.md).[`timestamp`](DocumentChangeEvent.md#timestamp)

***

### changes?

> `optional` **changes**: `Record`\<`string`, `unknown`\>

Defined in: [apps/server/src/utils/event-consistency.ts:23](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/utils/event-consistency.ts#L23)

#### Inherited from

[`DocumentChangeEvent`](DocumentChangeEvent.md).[`changes`](DocumentChangeEvent.md#changes)

***

### operation

> **operation**: `"update"`

Defined in: [apps/server/src/utils/event-consistency.ts:27](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/utils/event-consistency.ts#L27)

#### Overrides

[`DocumentChangeEvent`](DocumentChangeEvent.md).[`operation`](DocumentChangeEvent.md#operation)

***

### permissionChanges

> **permissionChanges**: `object`

Defined in: [apps/server/src/utils/event-consistency.ts:28](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/utils/event-consistency.ts#L28)

#### oldAcl?

> `optional` **oldAcl**: `object`

##### oldAcl.owner

> **owner**: `string`

##### oldAcl.editors

> **editors**: `string`[]

##### oldAcl.viewers

> **viewers**: `string`[]

#### newAcl

> **newAcl**: `object`

##### newAcl.owner

> **owner**: `string`

##### newAcl.editors

> **editors**: `string`[]

##### newAcl.viewers

> **viewers**: `string`[]
