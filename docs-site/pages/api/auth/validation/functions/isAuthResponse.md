[**collab-edit-demo**](../../../README.md)

***

[collab-edit-demo](../../../README.md) / [auth/validation](../README.md) / isAuthResponse

# Function: isAuthResponse()

> **isAuthResponse**(`value`): value is \{ accessToken: string; refreshToken: string; user: \{ id: string; email: string; role: "viewer" \| "editor" \| "owner" \| "admin"; createdAt: string; updatedAt: string \} \}

Defined in: [packages/shared/src/auth/validation.ts:110](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/packages/shared/src/auth/validation.ts#L110)

Runtime type guard for authentication responses.

Validates that a value contains valid access token, refresh token,
and user information.

## Parameters

### value

`unknown`

Unknown value to check

## Returns

value is \{ accessToken: string; refreshToken: string; user: \{ id: string; email: string; role: "viewer" \| "editor" \| "owner" \| "admin"; createdAt: string; updatedAt: string \} \}

True if value is a valid AuthResponse

## Since

1.0.0

## Example

```typescript
const response = await authService.login(credentials);
if (isAuthResponse(response)) {
  localStorage.setItem('accessToken', response.accessToken);
  updateUserContext(response.user);
}
```
