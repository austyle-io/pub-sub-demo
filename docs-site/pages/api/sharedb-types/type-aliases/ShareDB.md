[**collab-edit-demo**](../../README.md)

***

[collab-edit-demo](../../README.md) / [sharedb-types](../README.md) / ShareDB

# Type Alias: ShareDB

> **ShareDB** = `EventEmitter` & `object`

Defined in: [apps/server/src/types/sharedb.ts:374](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/server/src/types/sharedb.ts#L374)

Type definition for share d b.

## Type declaration

### connect()

> **connect**(`connection?`, `req?`): [`Connection`](Connection.md)

#### Parameters

##### connection?

[`Connection`](Connection.md)

##### req?

`IncomingMessage`

#### Returns

[`Connection`](Connection.md)

### listen()

> **listen**(`stream`, `request?`): [`Agent`](Agent.md)

#### Parameters

##### stream

`Duplex`

##### request?

`IncomingMessage`

#### Returns

[`Agent`](Agent.md)

### close()

> **close**(`callback?`): `void`

#### Parameters

##### callback?

(`err?`) => `void`

#### Returns

`void`

### use()

> **use**(`action`, `fn`): `void`

#### Parameters

##### action

`string`

##### fn

[`Middleware`](Middleware.md)

#### Returns

`void`

### addProjection()

> **addProjection**(`name`, `collection`, `fields`): `void`

#### Parameters

##### name

`string`

##### collection

`string`

##### fields

`Record`\<`string`, `boolean`\>

#### Returns

`void`

## Since

1.0.0
