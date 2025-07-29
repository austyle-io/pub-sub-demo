[**collab-edit-demo**](../../../../../../README.md)

***

[collab-edit-demo](../../../../../../README.md) / [apps/server/src/types/sharedb](../README.md) / PubSubAdapter

# Type Alias: PubSubAdapter

> **PubSubAdapter** = `object`

Defined in: [apps/server/src/types/sharedb.ts:107](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/types/sharedb.ts#L107)

## Methods

### close()

> **close**(`callback?`): `void`

Defined in: [apps/server/src/types/sharedb.ts:108](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/types/sharedb.ts#L108)

#### Parameters

##### callback?

(`err?`) => `void`

#### Returns

`void`

***

### publish()

> **publish**(`channel`, `message`, `callback?`): `void`

Defined in: [apps/server/src/types/sharedb.ts:109](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/types/sharedb.ts#L109)

#### Parameters

##### channel

`string`

##### message

`unknown`

##### callback?

(`err?`) => `void`

#### Returns

`void`

***

### subscribe()

> **subscribe**(`channel`, `callback`): `void`

Defined in: [apps/server/src/types/sharedb.ts:114](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/types/sharedb.ts#L114)

#### Parameters

##### channel

`string`

##### callback

(`err?`, `message?`) => `void`

#### Returns

`void`
