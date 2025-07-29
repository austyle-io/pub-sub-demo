[**collab-edit-demo**](../../../README.md)

***

[collab-edit-demo](../../../README.md) / [auth/validation](../README.md) / isValidEmail

# Function: isValidEmail()

> **isValidEmail**(`email`): `boolean`

Defined in: [packages/shared/src/auth/validation.ts:140](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/packages/shared/src/auth/validation.ts#L140)

Validates email format using a simple regex pattern.

Checks for basic email structure: local@domain.tld

## Parameters

### email

`string`

Email string to validate

## Returns

`boolean`

True if email format is valid

## Since

1.0.0

## Example

```typescript
if (isValidEmail('user@example.com')) {
  // proceed with registration
}
```
