[**collab-edit-demo**](../../../README.md)

***

[collab-edit-demo](../../../README.md) / [auth/jwt](../README.md) / verifyRefreshToken

# Function: verifyRefreshToken()

> **verifyRefreshToken**(`token`): `object`

Defined in: [packages/shared/src/auth/jwt.ts:178](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/packages/shared/src/auth/jwt.ts#L178)

Verifies and decodes a JWT refresh token.

Validates the token signature, expiration, issuer, and audience claims
specific to refresh tokens.

## Parameters

### token

`string`

JWT refresh token string to verify

## Returns

`object`

Decoded JWT payload

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

## Throws

If token is invalid or expired

## Since

1.0.0

## Example

```typescript
try {
  const payload = verifyRefreshToken(refreshToken);
  // Generate new token pair
  const newAccessToken = signAccessToken(payload);
  const newRefreshToken = signRefreshToken(payload);
} catch (error) {
  console.error('Invalid refresh token');
}
```
