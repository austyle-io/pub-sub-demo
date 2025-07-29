[**collab-edit-demo**](../../../../../../README.md)

***

[collab-edit-demo](../../../../../../README.md) / [apps/client/src/utils/cookie-store-polyfill](../README.md) / CookieStore

# Type Alias: CookieStore

> **CookieStore** = `object`

Defined in: [apps/client/src/utils/cookie-store-polyfill.ts:52](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/client/src/utils/cookie-store-polyfill.ts#L52)

Type definition for cookie store.

## Since

1.0.0

## Methods

### get()

#### Call Signature

> **get**(`name`): `Promise`\<`undefined` \| [`Cookie`](Cookie.md)\>

Defined in: [apps/client/src/utils/cookie-store-polyfill.ts:53](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/client/src/utils/cookie-store-polyfill.ts#L53)

##### Parameters

###### name

`string`

##### Returns

`Promise`\<`undefined` \| [`Cookie`](Cookie.md)\>

#### Call Signature

> **get**(`options?`): `Promise`\<`undefined` \| [`Cookie`](Cookie.md)\>

Defined in: [apps/client/src/utils/cookie-store-polyfill.ts:54](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/client/src/utils/cookie-store-polyfill.ts#L54)

##### Parameters

###### options?

[`CookieStoreGetOptions`](CookieStoreGetOptions.md)

##### Returns

`Promise`\<`undefined` \| [`Cookie`](Cookie.md)\>

***

### getAll()

#### Call Signature

> **getAll**(`name?`): `Promise`\<[`Cookie`](Cookie.md)[]\>

Defined in: [apps/client/src/utils/cookie-store-polyfill.ts:55](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/client/src/utils/cookie-store-polyfill.ts#L55)

##### Parameters

###### name?

`string`

##### Returns

`Promise`\<[`Cookie`](Cookie.md)[]\>

#### Call Signature

> **getAll**(`options?`): `Promise`\<[`Cookie`](Cookie.md)[]\>

Defined in: [apps/client/src/utils/cookie-store-polyfill.ts:56](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/client/src/utils/cookie-store-polyfill.ts#L56)

##### Parameters

###### options?

[`CookieStoreGetOptions`](CookieStoreGetOptions.md)

##### Returns

`Promise`\<[`Cookie`](Cookie.md)[]\>

***

### set()

#### Call Signature

> **set**(`name`, `value`): `Promise`\<`void`\>

Defined in: [apps/client/src/utils/cookie-store-polyfill.ts:57](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/client/src/utils/cookie-store-polyfill.ts#L57)

##### Parameters

###### name

`string`

###### value

`string`

##### Returns

`Promise`\<`void`\>

#### Call Signature

> **set**(`options`): `Promise`\<`void`\>

Defined in: [apps/client/src/utils/cookie-store-polyfill.ts:58](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/client/src/utils/cookie-store-polyfill.ts#L58)

##### Parameters

###### options

[`CookieInit`](CookieInit.md)

##### Returns

`Promise`\<`void`\>

***

### delete()

#### Call Signature

> **delete**(`name`): `Promise`\<`void`\>

Defined in: [apps/client/src/utils/cookie-store-polyfill.ts:59](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/client/src/utils/cookie-store-polyfill.ts#L59)

##### Parameters

###### name

`string`

##### Returns

`Promise`\<`void`\>

#### Call Signature

> **delete**(`options`): `Promise`\<`void`\>

Defined in: [apps/client/src/utils/cookie-store-polyfill.ts:60](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/client/src/utils/cookie-store-polyfill.ts#L60)

##### Parameters

###### options

[`CookieInit`](CookieInit.md)

##### Returns

`Promise`\<`void`\>
