[**collab-edit-demo**](../../../../../../README.md)

***

[collab-edit-demo](../../../../../../README.md) / [apps/server/src/types/sharedb](../README.md) / Connection

# Type Alias: Connection

> **Connection** = `EventEmitter` & `object`

Defined in: [apps/server/src/types/sharedb.ts:202](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/types/sharedb.ts#L202)

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
