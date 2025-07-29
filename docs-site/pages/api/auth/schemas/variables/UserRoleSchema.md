[**collab-edit-demo**](../../../README.md)

***

[collab-edit-demo](../../../README.md) / [auth/schemas](../README.md) / UserRoleSchema

# Variable: UserRoleSchema

> `const` **UserRoleSchema**: `TUnion`\<\[`TLiteral`\<`"viewer"`\>, `TLiteral`\<`"editor"`\>, `TLiteral`\<`"owner"`\>, `TLiteral`\<`"admin"`\>\]\>

Defined in: [packages/shared/src/auth/schemas.ts:31](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/packages/shared/src/auth/schemas.ts#L31)

Schema for user roles in the system.

Defines the available permission levels:
- 'viewer': Can only read documents
- 'editor': Can read and edit documents
- 'owner': Can read, edit, and manage document permissions
- 'admin': Full system access

## Since

1.0.0

## Example

```typescript
const userRole: UserRole = 'editor';
const isValid = UserRoleSchema.Check(userRole);
```
