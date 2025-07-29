[**collab-edit-demo**](../../../README.md)

***

[collab-edit-demo](../../../README.md) / [auth/password](../README.md) / verifyPassword

# Function: verifyPassword()

> **verifyPassword**(`password`, `hashedPassword`): `Promise`\<`boolean`\>

Defined in: [packages/shared/src/auth/password.ts:79](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/packages/shared/src/auth/password.ts#L79)

Verifies a plain text password against a bcrypt hash.

Compares the provided password with the stored hash in a timing-safe manner.
This function is designed to prevent timing attacks.

## Parameters

### password

`string`

Plain text password to verify

### hashedPassword

`string`

Bcrypt hash to compare against

## Returns

`Promise`\<`boolean`\>

Promise resolving to true if password matches, false otherwise

## Since

1.0.0

## Example

```typescript
const user = await db.users.findByEmail('user@example.com');
const isValid = await verifyPassword('MyPassword123', user.password);

if (isValid) {
  // Password is correct, proceed with authentication
  const tokens = generateTokens(user);
} else {
  // Invalid password
  throw new UnauthorizedError('Invalid credentials');
}
```
