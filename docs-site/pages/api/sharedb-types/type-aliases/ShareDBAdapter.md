[**collab-edit-demo**](../../README.md)

***

[collab-edit-demo](../../README.md) / [sharedb-types](../README.md) / ShareDBAdapter

# Type Alias: ShareDBAdapter

> **ShareDBAdapter** = `object`

Defined in: [apps/server/src/types/sharedb.ts:174](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/server/src/types/sharedb.ts#L174)

Type definition for share d b adapter.

## Since

1.0.0

## Methods

### close()

> **close**(`callback?`): `void`

Defined in: [apps/server/src/types/sharedb.ts:175](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/server/src/types/sharedb.ts#L175)

#### Parameters

##### callback?

(`err?`) => `void`

#### Returns

`void`

***

### commit()

> **commit**(`collection`, `id`, `op`, `snapshot`, `options`, `callback`): `void`

Defined in: [apps/server/src/types/sharedb.ts:176](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/server/src/types/sharedb.ts#L176)

#### Parameters

##### collection

`string`

##### id

`string`

##### op

[`RawOp`](RawOp.md)

##### snapshot

[`Snapshot`](Snapshot.md)

##### options

`unknown`

##### callback

(`err?`) => `void`

#### Returns

`void`

***

### getSnapshot()

> **getSnapshot**(`collection`, `id`, `fields`, `options`, `callback`): `void`

Defined in: [apps/server/src/types/sharedb.ts:184](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/server/src/types/sharedb.ts#L184)

#### Parameters

##### collection

`string`

##### id

`string`

##### fields

`unknown`

##### options

`unknown`

##### callback

(`err?`, `snapshot?`) => `void`

#### Returns

`void`

***

### getSnapshotBulk()

> **getSnapshotBulk**(`collection`, `ids`, `fields`, `options`, `callback`): `void`

Defined in: [apps/server/src/types/sharedb.ts:191](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/server/src/types/sharedb.ts#L191)

#### Parameters

##### collection

`string`

##### ids

`string`[]

##### fields

`unknown`

##### options

`unknown`

##### callback

(`err?`, `snapshots?`) => `void`

#### Returns

`void`
