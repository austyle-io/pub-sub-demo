[**collab-edit-demo**](../../../README.md)

***

[collab-edit-demo](../../../README.md) / [auth/jwt](../README.md) / decodeToken

# Function: decodeToken()

> **decodeToken**(`token`): `null` \| \{ `sub`: `string`; `email`: `string`; `role`: `"viewer"` \| `"editor"` \| `"owner"` \| `"admin"`; `iat?`: `number`; `exp?`: `number`; \}

Defined in: [packages/shared/src/auth/jwt.ts:206](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/packages/shared/src/auth/jwt.ts#L206)

Decodes a JWT token without verifying its signature.

Useful for reading token contents when verification is not needed,
such as checking expiration before making API calls.

## Parameters

### token

`string`

JWT token string to decode

## Returns

`null` \| \{ `sub`: `string`; `email`: `string`; `role`: `"viewer"` \| `"editor"` \| `"owner"` \| `"admin"`; `iat?`: `number`; `exp?`: `number`; \}

Decoded JWT payload or null if decoding fails

## Since

1.0.0

## Example

```typescript
const payload = decodeToken(token);
if (payload) {
  const expiresAt = new Date(payload.exp! * 1000);
  console.log(`Token expires at: ${expiresAt}`);
}
```
