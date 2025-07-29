[**collab-edit-demo**](../../../README.md)

***

[collab-edit-demo](../../../README.md) / [auth/jwt](../README.md) / getAccessTokenSecret

# Function: getAccessTokenSecret()

> **getAccessTokenSecret**(): `string`

Defined in: [packages/shared/src/auth/jwt.ts:33](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/packages/shared/src/auth/jwt.ts#L33)

Retrieves the access token secret from environment variables.

Access token secret is used for signing and verifying short-lived access tokens.

## Returns

`string`

The JWT access token secret

## Throws

If JWT_ACCESS_SECRET environment variable is not set

## Since

1.0.0

## Example

```typescript
const secret = getAccessTokenSecret();
const token = jwt.sign(payload, secret);
```
