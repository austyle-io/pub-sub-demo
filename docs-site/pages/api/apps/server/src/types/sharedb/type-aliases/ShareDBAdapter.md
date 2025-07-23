[**collab-edit-demo**](../../../../../../README.md)

***

[collab-edit-demo](../../../../../../README.md) / [apps/server/src/types/sharedb](../README.md) / ShareDBAdapter

# Type Alias: ShareDBAdapter

> **ShareDBAdapter** = `object`

Defined in: [apps/server/src/types/sharedb.ts:80](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/types/sharedb.ts#L80)

## Methods

### close()

> **close**(`callback?`): `void`

Defined in: [apps/server/src/types/sharedb.ts:81](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/types/sharedb.ts#L81)

#### Parameters

##### callback?

(`err?`) => `void`

#### Returns

`void`

***

### commit()

> **commit**(`collection`, `id`, `op`, `snapshot`, `options`, `callback`): `void`

Defined in: [apps/server/src/types/sharedb.ts:82](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/types/sharedb.ts#L82)

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

Defined in: [apps/server/src/types/sharedb.ts:90](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/types/sharedb.ts#L90)

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

Defined in: [apps/server/src/types/sharedb.ts:97](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/types/sharedb.ts#L97)

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
