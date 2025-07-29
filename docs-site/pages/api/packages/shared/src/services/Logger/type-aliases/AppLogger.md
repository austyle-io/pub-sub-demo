[**collab-edit-demo**](../../../../../../README.md)

***

[collab-edit-demo](../../../../../../README.md) / [packages/shared/src/services/Logger](../README.md) / AppLogger

# Type Alias: AppLogger

> **AppLogger** = `object`

Defined in: [packages/shared/src/services/Logger.ts:46](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/packages/shared/src/services/Logger.ts#L46)

Type definition for app logger.

## Since

1.0.0

## Properties

### error()

> **error**: (`message`, `context?`) => `void`

Defined in: [packages/shared/src/services/Logger.ts:47](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/packages/shared/src/services/Logger.ts#L47)

#### Parameters

##### message

`string`

##### context?

[`LogContext`](LogContext.md)

#### Returns

`void`

***

### warn()

> **warn**: (`message`, `context?`) => `void`

Defined in: [packages/shared/src/services/Logger.ts:48](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/packages/shared/src/services/Logger.ts#L48)

#### Parameters

##### message

`string`

##### context?

[`LogContext`](LogContext.md)

#### Returns

`void`

***

### info()

> **info**: (`message`, `context?`) => `void`

Defined in: [packages/shared/src/services/Logger.ts:49](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/packages/shared/src/services/Logger.ts#L49)

#### Parameters

##### message

`string`

##### context?

[`LogContext`](LogContext.md)

#### Returns

`void`

***

### debug()

> **debug**: (`message`, `context?`) => `void`

Defined in: [packages/shared/src/services/Logger.ts:50](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/packages/shared/src/services/Logger.ts#L50)

#### Parameters

##### message

`string`

##### context?

[`LogContext`](LogContext.md)

#### Returns

`void`

***

### trace()

> **trace**: (`message`, `context?`) => `void`

Defined in: [packages/shared/src/services/Logger.ts:51](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/packages/shared/src/services/Logger.ts#L51)

#### Parameters

##### message

`string`

##### context?

[`LogContext`](LogContext.md)

#### Returns

`void`

***

### child()

> **child**: (`bindings`) => `AppLogger`

Defined in: [packages/shared/src/services/Logger.ts:52](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/packages/shared/src/services/Logger.ts#L52)

#### Parameters

##### bindings

[`LogContext`](LogContext.md)

#### Returns

`AppLogger`

***

### flush()

> **flush**: () => `Promise`\<`void`\>

Defined in: [packages/shared/src/services/Logger.ts:53](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/packages/shared/src/services/Logger.ts#L53)

#### Returns

`Promise`\<`void`\>
