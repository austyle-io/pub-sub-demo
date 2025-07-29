[**collab-edit-demo**](../../README.md)

***

[collab-edit-demo](../../README.md) / [sharedb-types](../README.md) / Connection

# Type Alias: Connection

> **Connection** = `EventEmitter` & `object`

Defined in: [apps/server/src/types/sharedb.ts:336](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/server/src/types/sharedb.ts#L336)

Type definition for connection.

## Type declaration

### id

> **id**: `string`

### agent?

> `optional` **agent**: [`Agent`](Agent.md)

### get()

> **get**(`collection`, `id`): [`Doc`](Doc.md)

#### Parameters

##### collection

`string`

##### id

`string`

#### Returns

[`Doc`](Doc.md)

### createFetchQuery()

> **createFetchQuery**(`collection`, `query`, `options?`, `callback?`): [`Query`](Query.md)

#### Parameters

##### collection

`string`

##### query

`unknown`

##### options?

`unknown`

##### callback?

(`err?`, `results?`) => `void`

#### Returns

[`Query`](Query.md)

### createSubscribeQuery()

> **createSubscribeQuery**(`collection`, `query`, `options?`, `callback?`): [`Query`](Query.md)

#### Parameters

##### collection

`string`

##### query

`unknown`

##### options?

`unknown`

##### callback?

(`err?`, `results?`) => `void`

#### Returns

[`Query`](Query.md)

### close()

> **close**(): `void`

#### Returns

`void`

## Since

1.0.0
