[**collab-edit-demo**](../../../README.md)

***

[collab-edit-demo](../../../README.md) / [auth/password](../README.md) / hashPassword

# Function: hashPassword()

> **hashPassword**(`password`): `Promise`\<`string`\>

Defined in: [packages/shared/src/auth/password.ts:50](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/packages/shared/src/auth/password.ts#L50)

Hashes a plain text password using bcrypt.

Creates a secure hash that includes the salt, making it safe to store
in the database. The hash format includes the algorithm, cost factor,
salt, and hashed password.

## Parameters

### password

`string`

Plain text password to hash

## Returns

`Promise`\<`string`\>

Promise resolving to the hashed password

## Since

1.0.0

## Example

```typescript
const hashedPassword = await hashPassword('MySecurePassword123');
// Result: $2b$12$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGH (60 character string)

// Store in database
await db.users.create({
  email: 'user@example.com',
  password: hashedPassword
});
```
