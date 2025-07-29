[**collab-edit-demo**](../../../README.md)

***

[collab-edit-demo](../../../README.md) / [schemas/validation](../README.md) / isValidACL

# Function: isValidACL()

> **isValidACL**(`obj`): `obj is { owner: string; editors: string[]; viewers: string[] }`

Defined in: [packages/shared/src/schemas/validation.ts:41](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/packages/shared/src/schemas/validation.ts#L41)

Validates that an object conforms to the DocumentACL structure.

Checks for required ACL properties:
- owner: string (user ID of document owner)
- editors: array of strings (user IDs with edit permission)
- viewers: array of strings (user IDs with view permission)

## Parameters

### obj

`unknown`

Unknown value to validate

## Returns

`obj is { owner: string; editors: string[]; viewers: string[] }`

True if value is a valid DocumentACL

## Since

1.0.0

## Example

```typescript
const acl = {
  owner: 'user-123',
  editors: ['user-456', 'user-789'],
  viewers: ['user-012']
};

if (isValidACL(acl)) {
  // acl is typed as DocumentACL
  console.log(`Document owned by ${acl.owner}`);
}
```
