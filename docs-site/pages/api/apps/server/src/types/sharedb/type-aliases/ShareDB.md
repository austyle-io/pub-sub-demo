[**collab-edit-demo**](../../../../../../README.md)

***

[collab-edit-demo](../../../../../../README.md) / [apps/server/src/types/sharedb](../README.md) / ShareDB

# Type Alias: ShareDB

> **ShareDB** = `EventEmitter` & `object`

Defined in: [apps/server/src/types/sharedb.ts:232](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/types/sharedb.ts#L232)

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
