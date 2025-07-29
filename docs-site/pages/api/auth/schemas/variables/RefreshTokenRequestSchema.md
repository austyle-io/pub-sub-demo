[**collab-edit-demo**](../../../README.md)

***

[collab-edit-demo](../../../README.md) / [auth/schemas](../README.md) / RefreshTokenRequestSchema

# Variable: RefreshTokenRequestSchema

> `const` **RefreshTokenRequestSchema**: `TObject`\<\{ `refreshToken`: `TString`; \}\>

Defined in: [packages/shared/src/auth/schemas.ts:245](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/packages/shared/src/auth/schemas.ts#L245)

Schema for refresh token requests.

Used to exchange a valid refresh token for new access/refresh token pair.

## Since

1.0.0

## Example

```typescript
const refreshRequest: RefreshTokenRequest = {
  refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwicmVmcmVzaCI6dHJ1ZSwiaWF0IjoxNTE2MjM5MDIyfQ'
};
```
