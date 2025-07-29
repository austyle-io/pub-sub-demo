[**collab-edit-demo**](../../../README.md)

***

[collab-edit-demo](../../../README.md) / [auth/validation](../README.md) / isValidUser

# Function: isValidUser()

> **isValidUser**(`obj`): obj is \{ id: string; email: string; password: string; role: "viewer" \| "editor" \| "owner" \| "admin"; createdAt: string; updatedAt: string \}

Defined in: [packages/shared/src/auth/validation.ts:164](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/packages/shared/src/auth/validation.ts#L164)

Runtime type guard for User objects.

Validates that an object has all required user properties with correct types
and valid values (e.g., valid email format, known role).

## Parameters

### obj

`unknown`

Unknown value to check

## Returns

obj is \{ id: string; email: string; password: string; role: "viewer" \| "editor" \| "owner" \| "admin"; createdAt: string; updatedAt: string \}

True if value is a valid User

## Since

1.0.0

## Example

```typescript
const userData = await getUserFromDatabase(id);
if (isValidUser(userData)) {
  // userData is now typed as User
  console.log(`User ${userData.email} has role ${userData.role}`);
}
```
