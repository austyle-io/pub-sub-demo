[**collab-edit-demo**](../../../../../../README.md)

***

[collab-edit-demo](../../../../../../README.md) / [apps/client/src/hooks/useLogger](../README.md) / ClientLogger

# Type Alias: ClientLogger

> **ClientLogger** = `object`

Defined in: [apps/client/src/hooks/useLogger.ts:15](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/client/src/hooks/useLogger.ts#L15)

## Properties

### error()

> **error**: (`message`, `context?`) => `void`

Defined in: [apps/client/src/hooks/useLogger.ts:16](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/client/src/hooks/useLogger.ts#L16)

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

Defined in: [apps/client/src/hooks/useLogger.ts:17](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/client/src/hooks/useLogger.ts#L17)

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

Defined in: [apps/client/src/hooks/useLogger.ts:18](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/client/src/hooks/useLogger.ts#L18)

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

Defined in: [apps/client/src/hooks/useLogger.ts:19](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/client/src/hooks/useLogger.ts#L19)

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

Defined in: [apps/client/src/hooks/useLogger.ts:20](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/client/src/hooks/useLogger.ts#L20)

#### Parameters

##### context

[`LogContext`](LogContext.md)

#### Returns

`ClientLogger`
