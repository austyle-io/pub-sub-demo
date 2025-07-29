[**collab-edit-demo**](../../../README.md)

***

[collab-edit-demo](../../../README.md) / [auth/schemas](../README.md) / PublicUserSchema

# Variable: PublicUserSchema

> `const` **PublicUserSchema**: `TObject`\<\{ `id`: `TString`; `email`: `TString`; `role`: `TUnion`\<\[`TLiteral`\<`"viewer"`\>, `TLiteral`\<`"editor"`\>, `TLiteral`\<`"owner"`\>, `TLiteral`\<`"admin"`\>\]\>; `createdAt`: `TString`; `updatedAt`: `TString`; \}\>

Defined in: [packages/shared/src/auth/schemas.ts:113](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/packages/shared/src/auth/schemas.ts#L113)

Schema for public user data without sensitive information.

This schema omits the password field and is safe to expose to clients.
Use this for API responses and client-side data.

## Since

1.0.0

## Example

```typescript
const publicUser: PublicUser = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'user@example.com',
  role: 'editor',
  createdAt: '2025-01-21T10:00:00Z',
  updatedAt: '2025-01-21T10:00:00Z'
};
```
