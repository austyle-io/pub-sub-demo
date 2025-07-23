[**collab-edit-demo**](../../../../../../README.md)

***

[collab-edit-demo](../../../../../../README.md) / [packages/shared/src/auth/jwt](../README.md) / decodeToken

# Function: decodeToken()

> **decodeToken**(`token`): `null` \| \{ `sub`: `string`; `email`: `string`; `role`: `"viewer"` \| `"editor"` \| `"owner"` \| `"admin"`; `iat?`: `number`; `exp?`: `number`; \}

Defined in: [packages/shared/src/auth/jwt.ts:62](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/packages/shared/src/auth/jwt.ts#L62)

## Parameters

### token

`string`

## Returns

`null` \| \{ `sub`: `string`; `email`: `string`; `role`: `"viewer"` \| `"editor"` \| `"owner"` \| `"admin"`; `iat?`: `number`; `exp?`: `number`; \}
