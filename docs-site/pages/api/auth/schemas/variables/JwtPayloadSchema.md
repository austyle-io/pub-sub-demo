[**collab-edit-demo**](../../../README.md)

***

[collab-edit-demo](../../../README.md) / [auth/schemas](../README.md) / JwtPayloadSchema

# Variable: JwtPayloadSchema

> `const` **JwtPayloadSchema**: `TObject`\<\{ `sub`: `TString`; `email`: `TString`; `role`: `TUnion`\<\[`TLiteral`\<`"viewer"`\>, `TLiteral`\<`"editor"`\>, `TLiteral`\<`"owner"`\>, `TLiteral`\<`"admin"`\>\]\>; `iat`: `TOptional`\<`TNumber`\>; `exp`: `TOptional`\<`TNumber`\>; \}\>

Defined in: [packages/shared/src/auth/schemas.ts:280](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/packages/shared/src/auth/schemas.ts#L280)

Schema for JWT token payload.

Standard JWT claims with custom user information:
- sub: Subject claim containing user ID
- email: User's email address
- role: User's permission level
- iat: Issued at timestamp (optional, set by JWT library)
- exp: Expiration timestamp (optional, set by JWT library)

## Since

1.0.0

## Example

```typescript
const payload: JwtPayload = {
  sub: '123e4567-e89b-12d3-a456-426614174000',
  email: 'user@example.com',
  role: 'editor',
  iat: 1643723400,
  exp: 1643724300
};
```
