[**collab-edit-demo**](../../../README.md)

***

[collab-edit-demo](../../../README.md) / [auth/jwt](../README.md) / signRefreshToken

# Function: signRefreshToken()

> **signRefreshToken**(`payload`): `string`

Defined in: [packages/shared/src/auth/jwt.ts:117](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/packages/shared/src/auth/jwt.ts#L117)

Signs a JWT refresh token with the provided payload.

Creates a long-lived token (7 days) for obtaining new access tokens.
The token includes issuer and audience claims specific to refresh operations.

## Parameters

### payload

JWT payload containing user information

#### sub

`string` = `...`

#### email

`string` = `...`

#### role

`"viewer"` \| `"editor"` \| `"owner"` \| `"admin"` = `UserRoleSchema`

#### iat?

`number` = `...`

#### exp?

`number` = `...`

## Returns

`string`

Signed JWT refresh token string

## Since

1.0.0

## Example

```typescript
const payload: JwtPayload = {
  sub: user.id,
  email: user.email,
  role: user.role
};
const refreshToken = signRefreshToken(payload);
```
