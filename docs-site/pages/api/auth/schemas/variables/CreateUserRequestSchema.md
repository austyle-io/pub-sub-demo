[**collab-edit-demo**](../../../README.md)

***

[collab-edit-demo](../../../README.md) / [auth/schemas](../README.md) / CreateUserRequestSchema

# Variable: CreateUserRequestSchema

> `const` **CreateUserRequestSchema**: `TObject`\<\{ `email`: `TString`; `password`: `TString`; \}\>

Defined in: [packages/shared/src/auth/schemas.ts:139](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/packages/shared/src/auth/schemas.ts#L139)

Schema for user registration requests.

Validates new user registration data with password requirements:
- Email must be valid format
- Password must be 8-100 characters

## Since

1.0.0

## Example

```typescript
const request: CreateUserRequest = {
  email: 'newuser@example.com',
  password: 'SecurePass123!'
};
const isValid = CreateUserRequestSchema.Check(request);
```
