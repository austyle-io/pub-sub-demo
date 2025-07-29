[**collab-edit-demo**](../../../README.md)

***

[collab-edit-demo](../../../README.md) / [auth/schemas](../README.md) / LoginRequestSchema

# Variable: LoginRequestSchema

> `const` **LoginRequestSchema**: `TObject`\<\{ `email`: `TString`; `password`: `TString`; \}\>

Defined in: [packages/shared/src/auth/schemas.ts:173](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/packages/shared/src/auth/schemas.ts#L173)

Schema for user login requests.

Validates login credentials. No password length requirements
as we're checking against existing accounts.

## Since

1.0.0

## Example

```typescript
const loginData: LoginRequest = {
  email: 'user@example.com',
  password: 'MyPassword123'
};
```
