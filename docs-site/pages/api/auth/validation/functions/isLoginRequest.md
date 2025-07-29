[**collab-edit-demo**](../../../README.md)

***

[collab-edit-demo](../../../README.md) / [auth/validation](../README.md) / isLoginRequest

# Function: isLoginRequest()

> **isLoginRequest**(`value`): `value is { email: string; password: string }`

Defined in: [packages/shared/src/auth/validation.ts:221](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/packages/shared/src/auth/validation.ts#L221)

Type guard for LoginRequest objects.

Delegates to the TypeBox validator for complete schema validation.

## Parameters

### value

`unknown`

Unknown value to check

## Returns

`value is { email: string; password: string }`

True if value is a valid LoginRequest

## Since

1.0.0

## Example

```typescript
const loginData = await request.json();
if (isLoginRequest(loginData)) {
  const authResponse = await authenticateUser(loginData);
}
```
