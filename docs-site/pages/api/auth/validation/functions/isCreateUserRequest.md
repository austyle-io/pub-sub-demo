[**collab-edit-demo**](../../../README.md)

***

[collab-edit-demo](../../../README.md) / [auth/validation](../README.md) / isCreateUserRequest

# Function: isCreateUserRequest()

> **isCreateUserRequest**(`value`): `value is { email: string; password: string }`

Defined in: [packages/shared/src/auth/validation.ts:198](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/packages/shared/src/auth/validation.ts#L198)

Type guard for CreateUserRequest objects.

Delegates to the TypeBox validator for complete schema validation.

## Parameters

### value

`unknown`

Unknown value to check

## Returns

`value is { email: string; password: string }`

True if value is a valid CreateUserRequest

## Since

1.0.0

## Example

```typescript
const requestData = await request.json();
if (isCreateUserRequest(requestData)) {
  // requestData is typed as CreateUserRequest
  const user = await createUser(requestData);
}
```
