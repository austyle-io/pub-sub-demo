[**collab-edit-demo**](../../../README.md)

***

[collab-edit-demo](../../../README.md) / [auth/jwt](../README.md) / verifyAccessToken

# Function: verifyAccessToken()

> **verifyAccessToken**(`token`): `object`

Defined in: [packages/shared/src/auth/jwt.ts:146](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/packages/shared/src/auth/jwt.ts#L146)

Verifies and decodes a JWT access token.

Validates the token signature, expiration, issuer, and audience claims.

## Parameters

### token

`string`

JWT access token string to verify

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
  const payload = verifyAccessToken(token);
  console.log(`Authenticated user: ${payload.email}`);
} catch (error) {
  console.error('Invalid or expired token');
}
```
