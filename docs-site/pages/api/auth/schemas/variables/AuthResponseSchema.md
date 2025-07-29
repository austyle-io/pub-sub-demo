[**collab-edit-demo**](../../../README.md)

***

[collab-edit-demo](../../../README.md) / [auth/schemas](../README.md) / AuthResponseSchema

# Variable: AuthResponseSchema

> `const` **AuthResponseSchema**: `TObject`\<\{ `accessToken`: `TString`; `refreshToken`: `TString`; `user`: `TObject`\<\{ `id`: `TString`; `email`: `TString`; `role`: `TUnion`\<\[`TLiteral`\<`"viewer"`\>, `TLiteral`\<`"editor"`\>, `TLiteral`\<`"owner"`\>, `TLiteral`\<`"admin"`\>\]\>; `createdAt`: `TString`; `updatedAt`: `TString`; \}\>; \}\>

Defined in: [packages/shared/src/auth/schemas.ts:215](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/packages/shared/src/auth/schemas.ts#L215)

Schema for authentication responses.

Contains JWT tokens and user information returned after successful
authentication (login or registration):
- Access token: Short-lived (15 minutes) for API requests
- Refresh token: Long-lived (7 days) for token renewal
- User data: Public user information without password

## Since

1.0.0

## Example

```typescript
const authResponse: AuthResponse = {
  accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ',
  refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwicmVmcmVzaCI6dHJ1ZSwiaWF0IjoxNTE2MjM5MDIyfQ',
  user: {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'user@example.com',
    role: 'editor',
    createdAt: '2025-01-21T10:00:00Z',
    updatedAt: '2025-01-21T10:00:00Z'
  }
};
```
