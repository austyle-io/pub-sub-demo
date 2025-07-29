[**collab-edit-demo**](../../../../../../README.md)

***

[collab-edit-demo](../../../../../../README.md) / [apps/server/src/services/auth.service](../README.md) / AuthService

# Class: AuthService

Defined in: [apps/server/src/services/auth.service.ts:23](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/server/src/services/auth.service.ts#L23)

Service for auth operations.

## Since

1.0.0

## Constructors

### Constructor

> **new AuthService**(): `AuthService`

#### Returns

`AuthService`

## Methods

### createUser()

> **createUser**(`data`): `Promise`\<\{ `accessToken`: `string`; `refreshToken`: `string`; `user`: \{ `email`: `string`; `id`: `string`; `role`: `"viewer"` \| `"editor"` \| `"owner"` \| `"admin"`; `createdAt`: `string`; `updatedAt`: `string`; \}; \}\>

Defined in: [apps/server/src/services/auth.service.ts:24](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/server/src/services/auth.service.ts#L24)

#### Parameters

##### data

###### email

`string`

###### password

`string`

#### Returns

`Promise`\<\{ `accessToken`: `string`; `refreshToken`: `string`; `user`: \{ `email`: `string`; `id`: `string`; `role`: `"viewer"` \| `"editor"` \| `"owner"` \| `"admin"`; `createdAt`: `string`; `updatedAt`: `string`; \}; \}\>

***

### login()

> **login**(`data`): `Promise`\<\{ `accessToken`: `string`; `refreshToken`: `string`; `user`: \{ `email`: `string`; `id`: `string`; `role`: `"viewer"` \| `"editor"` \| `"owner"` \| `"admin"`; `createdAt`: `string`; `updatedAt`: `string`; \}; \}\>

Defined in: [apps/server/src/services/auth.service.ts:68](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/server/src/services/auth.service.ts#L68)

#### Parameters

##### data

###### email

`string`

###### password

`string`

#### Returns

`Promise`\<\{ `accessToken`: `string`; `refreshToken`: `string`; `user`: \{ `email`: `string`; `id`: `string`; `role`: `"viewer"` \| `"editor"` \| `"owner"` \| `"admin"`; `createdAt`: `string`; `updatedAt`: `string`; \}; \}\>

***

### refreshTokens()

> **refreshTokens**(`refreshToken`): `Promise`\<\{ `accessToken`: `string`; `refreshToken`: `string`; `user`: \{ `email`: `string`; `id`: `string`; `role`: `"viewer"` \| `"editor"` \| `"owner"` \| `"admin"`; `createdAt`: `string`; `updatedAt`: `string`; \}; \}\>

Defined in: [apps/server/src/services/auth.service.ts:103](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/server/src/services/auth.service.ts#L103)

#### Parameters

##### refreshToken

`string`

#### Returns

`Promise`\<\{ `accessToken`: `string`; `refreshToken`: `string`; `user`: \{ `email`: `string`; `id`: `string`; `role`: `"viewer"` \| `"editor"` \| `"owner"` \| `"admin"`; `createdAt`: `string`; `updatedAt`: `string`; \}; \}\>

***

### getUserById()

> **getUserById**(`userId`): `Promise`\<`null` \| \{ `id`: `string`; `email`: `string`; `password`: `string`; `role`: `"viewer"` \| `"editor"` \| `"owner"` \| `"admin"`; `createdAt`: `string`; `updatedAt`: `string`; \}\>

Defined in: [apps/server/src/services/auth.service.ts:139](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/server/src/services/auth.service.ts#L139)

#### Parameters

##### userId

`string`

#### Returns

`Promise`\<`null` \| \{ `id`: `string`; `email`: `string`; `password`: `string`; `role`: `"viewer"` \| `"editor"` \| `"owner"` \| `"admin"`; `createdAt`: `string`; `updatedAt`: `string`; \}\>
