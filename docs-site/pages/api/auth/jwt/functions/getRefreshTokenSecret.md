[**collab-edit-demo**](../../../README.md)

***

[collab-edit-demo](../../../README.md) / [auth/jwt](../README.md) / getRefreshTokenSecret

# Function: getRefreshTokenSecret()

> **getRefreshTokenSecret**(): `string`

Defined in: [packages/shared/src/auth/jwt.ts:58](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/packages/shared/src/auth/jwt.ts#L58)

Retrieves the refresh token secret from environment variables.

Refresh token secret is used for signing and verifying long-lived refresh tokens.

## Returns

`string`

The JWT refresh token secret

## Throws

If JWT_REFRESH_SECRET environment variable is not set

## Since

1.0.0

## Example

```typescript
const secret = getRefreshTokenSecret();
const refreshToken = jwt.sign(payload, secret, { expiresIn: '7d' });
```
