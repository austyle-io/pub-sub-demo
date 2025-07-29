[**collab-edit-demo**](../../README.md)

***

[collab-edit-demo](../../README.md) / [sharedb-types](../README.md) / PubSubAdapter

# Type Alias: PubSubAdapter

> **PubSubAdapter** = `object`

Defined in: [apps/server/src/types/sharedb.ts:205](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/server/src/types/sharedb.ts#L205)

Type definition for pub sub adapter.

## Since

1.0.0

## Methods

### close()

> **close**(`callback?`): `void`

Defined in: [apps/server/src/types/sharedb.ts:206](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/server/src/types/sharedb.ts#L206)

#### Parameters

##### callback?

(`err?`) => `void`

#### Returns

`void`

***

### publish()

> **publish**(`channel`, `message`, `callback?`): `void`

Defined in: [apps/server/src/types/sharedb.ts:207](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/server/src/types/sharedb.ts#L207)

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

Defined in: [apps/server/src/types/sharedb.ts:212](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/server/src/types/sharedb.ts#L212)

#### Parameters

##### channel

`string`

##### callback

(`err?`, `message?`) => `void`

#### Returns

`void`
