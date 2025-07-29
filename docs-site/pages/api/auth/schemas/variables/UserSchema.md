[**collab-edit-demo**](../../../README.md)

***

[collab-edit-demo](../../../README.md) / [auth/schemas](../README.md) / UserSchema

# Variable: UserSchema

> `const` **UserSchema**: `TObject`\<\{ `id`: `TString`; `email`: `TString`; `password`: `TString`; `role`: `TUnion`\<\[`TLiteral`\<`"viewer"`\>, `TLiteral`\<`"editor"`\>, `TLiteral`\<`"owner"`\>, `TLiteral`\<`"admin"`\>\]\>; `createdAt`: `TString`; `updatedAt`: `TString`; \}\>

Defined in: [packages/shared/src/auth/schemas.ts:64](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/packages/shared/src/auth/schemas.ts#L64)

Schema for a complete user object with all properties.

Contains all user information including sensitive data like hashed passwords.
This schema should only be used internally and never exposed to clients.

## Since

1.0.0

## Example

```typescript
const user: User = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'user@example.com',
  password: '$2b$10$K1yHwRM6zSKSQVxZb3qYnuV2s8Q0/9ocSV5GKxXQiNa',  // bcrypt hash
  role: 'editor',
  createdAt: '2025-01-21T10:00:00Z',
  updatedAt: '2025-01-21T10:00:00Z'
};
```
