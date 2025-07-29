[**collab-edit-demo**](../../../../../../README.md)

***

[collab-edit-demo](../../../../../../README.md) / [apps/client/src/hooks/useLogger](../README.md) / ClientLogger

# Type Alias: ClientLogger

> **ClientLogger** = `object`

Defined in: [apps/client/src/hooks/useLogger.ts:31](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/client/src/hooks/useLogger.ts#L31)

Type definition for client logger.

## Since

1.0.0

## Properties

### error()

> **error**: (`message`, `context?`) => `void`

Defined in: [apps/client/src/hooks/useLogger.ts:32](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/client/src/hooks/useLogger.ts#L32)

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

Defined in: [apps/client/src/hooks/useLogger.ts:33](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/client/src/hooks/useLogger.ts#L33)

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

Defined in: [apps/client/src/hooks/useLogger.ts:34](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/client/src/hooks/useLogger.ts#L34)

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

Defined in: [apps/client/src/hooks/useLogger.ts:35](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/client/src/hooks/useLogger.ts#L35)

#### Parameters

##### message

`string`

##### context?

[`LogContext`](LogContext.md)

#### Returns

`void`

***

### child()

> **child**: (`context`) => `ClientLogger`

Defined in: [apps/client/src/hooks/useLogger.ts:36](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/client/src/hooks/useLogger.ts#L36)

#### Parameters

##### context

[`LogContext`](LogContext.md)

#### Returns

`ClientLogger`
