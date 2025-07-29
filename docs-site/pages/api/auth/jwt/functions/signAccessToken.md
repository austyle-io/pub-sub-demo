[**collab-edit-demo**](../../../README.md)

***

[collab-edit-demo](../../../README.md) / [auth/jwt](../README.md) / signAccessToken

# Function: signAccessToken()

> **signAccessToken**(`payload`): `string`

Defined in: [packages/shared/src/auth/jwt.ts:88](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/packages/shared/src/auth/jwt.ts#L88)

Signs a JWT access token with the provided payload.

Creates a short-lived token (15 minutes) for API authentication.
The token includes issuer and audience claims for added security.

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

Signed JWT access token string

## Since

1.0.0

## Example

```typescript
const payload: JwtPayload = {
  sub: user.id,
  email: user.email,
  role: user.role
};
const accessToken = signAccessToken(payload);
```
