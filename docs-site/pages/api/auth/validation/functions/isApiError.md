[**collab-edit-demo**](../../../README.md)

***

[collab-edit-demo](../../../README.md) / [auth/validation](../README.md) / isApiError

# Function: isApiError()

> **isApiError**(`value`): `value is { error: string; details?: unknown }`

Defined in: [packages/shared/src/auth/validation.ts:83](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/packages/shared/src/auth/validation.ts#L83)

Runtime type guard for generic API error objects.

Checks if a value is an error response object with at least an error message.

## Parameters

### value

`unknown`

Unknown value to check

## Returns

`value is { error: string; details?: unknown }`

True if value has an error string property

## Since

1.0.0

## Example

```typescript
try {
  const response = await fetch('/api/auth/login', options);
  const data = await response.json();
  if (isApiError(data)) {
    console.error('Login failed:', data.error);
  }
} catch (e) {
  // handle network error
}
```
