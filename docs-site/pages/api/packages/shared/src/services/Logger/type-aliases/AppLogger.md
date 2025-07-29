[**collab-edit-demo**](../../../../../../README.md)

***

[collab-edit-demo](../../../../../../README.md) / [packages/shared/src/services/Logger](../README.md) / AppLogger

# Type Alias: AppLogger

> **AppLogger** = `object`

Defined in: [packages/shared/src/services/Logger.ts:26](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/packages/shared/src/services/Logger.ts#L26)

## Properties

### error()

> **error**: (`message`, `context?`) => `void`

Defined in: [packages/shared/src/services/Logger.ts:27](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/packages/shared/src/services/Logger.ts#L27)

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

Defined in: [packages/shared/src/services/Logger.ts:28](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/packages/shared/src/services/Logger.ts#L28)

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

Defined in: [packages/shared/src/services/Logger.ts:29](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/packages/shared/src/services/Logger.ts#L29)

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

Defined in: [packages/shared/src/services/Logger.ts:30](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/packages/shared/src/services/Logger.ts#L30)

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

Defined in: [packages/shared/src/services/Logger.ts:31](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/packages/shared/src/services/Logger.ts#L31)

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

Defined in: [packages/shared/src/services/Logger.ts:32](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/packages/shared/src/services/Logger.ts#L32)

#### Parameters

##### bindings

[`LogContext`](LogContext.md)

#### Returns

`AppLogger`

***

### flush()

> **flush**: () => `Promise`\<`void`\>

Defined in: [packages/shared/src/services/Logger.ts:33](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/packages/shared/src/services/Logger.ts#L33)

#### Returns

`Promise`\<`void`\>
