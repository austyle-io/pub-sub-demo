[**collab-edit-demo**](../../../README.md)

***

[collab-edit-demo](../../../README.md) / [auth/validation](../README.md) / isRefreshTokenRequest

# Function: isRefreshTokenRequest()

> **isRefreshTokenRequest**(`value`): `value is { refreshToken: string }`

Defined in: [packages/shared/src/auth/validation.ts:242](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/packages/shared/src/auth/validation.ts#L242)

Type guard for RefreshTokenRequest objects.

Delegates to the TypeBox validator for complete schema validation.

## Parameters

### value

`unknown`

Unknown value to check

## Returns

`value is { refreshToken: string }`

True if value is a valid RefreshTokenRequest

## Since

1.0.0

## Example

```typescript
const refreshData = await request.json();
if (isRefreshTokenRequest(refreshData)) {
  const newTokens = await refreshAuthTokens(refreshData);
}
```
