[**collab-edit-demo**](../../README.md)

***

[collab-edit-demo](../../README.md) / [validation](../README.md) / getValidationErrors

# Function: getValidationErrors()

> **getValidationErrors**(`validator`): [`ValidationError`](../type-aliases/ValidationError.md)[]

Defined in: [packages/shared/src/validation.ts:161](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/packages/shared/src/validation.ts#L161)

Extracts validation errors from an AJV validator.

Transforms AJV's error format into a more user-friendly structure
with field paths and messages.

## Parameters

### validator

`ValidateFunction`

AJV validator function that has been executed

## Returns

[`ValidationError`](../type-aliases/ValidationError.md)[]

Array of validation errors, empty if validation passed

## Since

1.0.0

## Example

```typescript
const isValid = validateUser(data);
if (!isValid) {
  const errors = getValidationErrors(validateUser);
  errors.forEach(error => {
    console.error(`${error.field}: ${error.message}`);
  });
}
```
