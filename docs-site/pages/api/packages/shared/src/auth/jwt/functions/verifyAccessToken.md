[**collab-edit-demo**](../../../../../../README.md)

***

[collab-edit-demo](../../../../../../README.md) / [packages/shared/src/auth/jwt](../README.md) / verifyAccessToken

# Function: verifyAccessToken()

> **verifyAccessToken**(`token`): `object`

Defined in: [packages/shared/src/auth/jwt.ts:44](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/packages/shared/src/auth/jwt.ts#L44)

## Parameters

### token

`string`

## Returns

`object`

### sub

> **sub**: `string`

### email

> **email**: `string`

### role

> **role**: `"viewer"` \| `"editor"` \| `"owner"` \| `"admin"` = `UserRoleSchema`

### iat?

> `optional` **iat**: `number`

### exp?

> `optional` **exp**: `number`
