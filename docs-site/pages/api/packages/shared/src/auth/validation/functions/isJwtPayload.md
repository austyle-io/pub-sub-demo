[**collab-edit-demo**](../../../../../../README.md)

***

[collab-edit-demo](../../../../../../README.md) / [packages/shared/src/auth/validation](../README.md) / isJwtPayload

# Function: isJwtPayload()

> **isJwtPayload**(`value`): value is \{ sub: string; email: string; role: "viewer" \| "editor" \| "owner" \| "admin"; iat?: number; exp?: number \}

Defined in: [packages/shared/src/auth/validation.ts:21](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/packages/shared/src/auth/validation.ts#L21)

Runtime type guard for JWT payload objects.

## Parameters

### value

`unknown`

## Returns

value is \{ sub: string; email: string; role: "viewer" \| "editor" \| "owner" \| "admin"; iat?: number; exp?: number \}
