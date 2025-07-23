[**collab-edit-demo**](../../../../../../README.md)

***

[collab-edit-demo](../../../../../../README.md) / [apps/server/src/types/sharedb](../README.md) / Doc

# Type Alias: Doc

> **Doc** = `EventEmitter` & `object`

Defined in: [apps/server/src/types/sharedb.ts:180](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/types/sharedb.ts#L180)

## Type declaration

### data

> **data**: [`DocumentData`](DocumentData.md) \| `null`

### id

> **id**: `string`

### collection

> **collection**: `string`

### version

> **version**: `number`

### type

> **type**: `string` \| `null`

### create()

#### Call Signature

> **create**(`data`, `callback?`): `void`

##### Parameters

###### data

[`JSONObject`](JSONObject.md)

###### callback?

(`err?`) => `void`

##### Returns

`void`

#### Call Signature

> **create**(`data`, `type`, `callback?`): `void`

##### Parameters

###### data

[`JSONObject`](JSONObject.md)

###### type

`string`

###### callback?

(`err?`) => `void`

##### Returns

`void`

### fetch()

> **fetch**(`callback?`): `void`

#### Parameters

##### callback?

(`err?`) => `void`

#### Returns

`void`

### del()

> **del**(`callback?`): `void`

#### Parameters

##### callback?

(`err?`) => `void`

#### Returns

`void`

### submitOp()

> **submitOp**(`op`, `callback?`): `void`

#### Parameters

##### op

[`Op`](Op.md)[]

##### callback?

(`err?`) => `void`

#### Returns

`void`

### subscribe()

> **subscribe**(`callback?`): `void`

#### Parameters

##### callback?

(`err?`) => `void`

#### Returns

`void`

### unsubscribe()

> **unsubscribe**(`callback?`): `void`

#### Parameters

##### callback?

(`err?`) => `void`

#### Returns

`void`

### destroy()

> **destroy**(): `void`

#### Returns

`void`
