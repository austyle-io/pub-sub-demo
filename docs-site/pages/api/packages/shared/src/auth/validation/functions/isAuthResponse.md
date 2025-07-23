[**collab-edit-demo**](../../../../../../README.md)

***

[collab-edit-demo](../../../../../../README.md) / [packages/shared/src/auth/validation](../README.md) / isAuthResponse

# Function: isAuthResponse()

> **isAuthResponse**(`value`): value is \{ accessToken: string; refreshToken: string; user: \{ id: string; email: string; role: "viewer" \| "editor" \| "owner" \| "admin"; createdAt: string; updatedAt: string \} \}

Defined in: [packages/shared/src/auth/validation.ts:49](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/packages/shared/src/auth/validation.ts#L49)

Runtime type guard for authentication responses.

## Parameters

### value

`unknown`

## Returns

value is \{ accessToken: string; refreshToken: string; user: \{ id: string; email: string; role: "viewer" \| "editor" \| "owner" \| "admin"; createdAt: string; updatedAt: string \} \}
