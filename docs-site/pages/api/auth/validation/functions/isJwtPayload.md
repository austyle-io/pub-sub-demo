[**collab-edit-demo**](../../../README.md)

***

[collab-edit-demo](../../../README.md) / [auth/validation](../README.md) / isJwtPayload

# Function: isJwtPayload()

> **isJwtPayload**(`value`): value is \{ sub: string; email: string; role: "viewer" \| "editor" \| "owner" \| "admin"; iat?: number; exp?: number \}

Defined in: [packages/shared/src/auth/validation.ts:47](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/packages/shared/src/auth/validation.ts#L47)

Runtime type guard for JWT payload objects.

Validates that a value conforms to the JwtPayload structure with all
required fields present and correctly typed.

## Parameters

### value

`unknown`

Unknown value to check

## Returns

value is \{ sub: string; email: string; role: "viewer" \| "editor" \| "owner" \| "admin"; iat?: number; exp?: number \}

True if value is a valid JwtPayload

## Since

1.0.0

## Example

```typescript
const decoded = jwt.verify(token, secret);
if (isJwtPayload(decoded)) {
  console.log(`User ${decoded.sub} has role ${decoded.role}`);
}
```
