[**collab-edit-demo**](../../README.md)

***

[collab-edit-demo](../../README.md) / [validation](../README.md) / validateOrThrow

# Function: validateOrThrow()

> **validateOrThrow**\<`T`\>(`data`, `validator`, `errorMessage`): `T`

Defined in: [packages/shared/src/validation.ts:201](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/packages/shared/src/validation.ts#L201)

Validates data and throws an error if validation fails.

This utility function combines validation with error handling,
providing a type-safe way to ensure data conforms to a schema.
The thrown error includes detailed validation information.

## Type Parameters

### T

`T`

The expected type after successful validation

## Parameters

### data

`unknown`

Unknown data to validate

### validator

`ValidateFunction`\<`T`\>

AJV validator function for type T

### errorMessage

`string` = `'Validation failed'`

Custom error message (default: 'Validation failed')

## Returns

`T`

The validated data typed as T

## Throws

Error with validationErrors property containing field-level errors

## Since

1.0.0

## Example

```typescript
try {
  const user = validateOrThrow(requestData, validateUser, 'Invalid user data');
  // user is now typed as User
  await saveUser(user);
} catch (error) {
  if ('validationErrors' in error) {
    // Handle validation errors
    console.error('Validation failed:', error.validationErrors);
  }
}
```
