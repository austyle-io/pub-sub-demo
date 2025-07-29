[**collab-edit-demo**](../../../../../../README.md)

***

[collab-edit-demo](../../../../../../README.md) / [apps/server/src/services/auth.service](../README.md) / AuthService

# Class: AuthService

Defined in: [apps/server/src/services/auth.service.ts:19](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/services/auth.service.ts#L19)

## Constructors

### Constructor

> **new AuthService**(): `AuthService`

#### Returns

`AuthService`

## Methods

### createUser()

> **createUser**(`data`): `Promise`\<\{ `accessToken`: `string`; `refreshToken`: `string`; `user`: \{ `email`: `string`; `role`: `"viewer"` \| `"editor"` \| `"owner"` \| `"admin"`; `id`: `string`; `createdAt`: `string`; `updatedAt`: `string`; \}; \}\>

Defined in: [apps/server/src/services/auth.service.ts:20](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/services/auth.service.ts#L20)

#### Parameters

##### data

###### email

`string`

###### password

`string`

#### Returns

`Promise`\<\{ `accessToken`: `string`; `refreshToken`: `string`; `user`: \{ `email`: `string`; `role`: `"viewer"` \| `"editor"` \| `"owner"` \| `"admin"`; `id`: `string`; `createdAt`: `string`; `updatedAt`: `string`; \}; \}\>

***

### login()

> **login**(`data`): `Promise`\<\{ `accessToken`: `string`; `refreshToken`: `string`; `user`: \{ `email`: `string`; `role`: `"viewer"` \| `"editor"` \| `"owner"` \| `"admin"`; `id`: `string`; `createdAt`: `string`; `updatedAt`: `string`; \}; \}\>

Defined in: [apps/server/src/services/auth.service.ts:64](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/services/auth.service.ts#L64)

#### Parameters

##### data

###### email

`string`

###### password

`string`

#### Returns

`Promise`\<\{ `accessToken`: `string`; `refreshToken`: `string`; `user`: \{ `email`: `string`; `role`: `"viewer"` \| `"editor"` \| `"owner"` \| `"admin"`; `id`: `string`; `createdAt`: `string`; `updatedAt`: `string`; \}; \}\>

***

### refreshTokens()

> **refreshTokens**(`refreshToken`): `Promise`\<\{ `accessToken`: `string`; `refreshToken`: `string`; `user`: \{ `email`: `string`; `role`: `"viewer"` \| `"editor"` \| `"owner"` \| `"admin"`; `id`: `string`; `createdAt`: `string`; `updatedAt`: `string`; \}; \}\>

Defined in: [apps/server/src/services/auth.service.ts:99](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/services/auth.service.ts#L99)

#### Parameters

##### refreshToken

`string`

#### Returns

`Promise`\<\{ `accessToken`: `string`; `refreshToken`: `string`; `user`: \{ `email`: `string`; `role`: `"viewer"` \| `"editor"` \| `"owner"` \| `"admin"`; `id`: `string`; `createdAt`: `string`; `updatedAt`: `string`; \}; \}\>

***

### getUserById()

> **getUserById**(`userId`): `Promise`\<`null` \| \{ `id`: `string`; `email`: `string`; `password`: `string`; `role`: `"viewer"` \| `"editor"` \| `"owner"` \| `"admin"`; `createdAt`: `string`; `updatedAt`: `string`; \}\>

Defined in: [apps/server/src/services/auth.service.ts:135](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/services/auth.service.ts#L135)

#### Parameters

##### userId

`string`

#### Returns

`Promise`\<`null` \| \{ `id`: `string`; `email`: `string`; `password`: `string`; `role`: `"viewer"` \| `"editor"` \| `"owner"` \| `"admin"`; `createdAt`: `string`; `updatedAt`: `string`; \}\>
