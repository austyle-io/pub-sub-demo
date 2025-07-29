[**collab-edit-demo**](../../../README.md)

***

[collab-edit-demo](../../../README.md) / [schemas/validation](../README.md) / isValidDocumentData

# Function: isValidDocumentData()

> **isValidDocumentData**(`obj`): `obj is { id: string; title: string; content: string; acl: { owner: string; editors: string[]; viewers: string[] }; createdAt: string; updatedAt: string }`

Defined in: [packages/shared/src/schemas/validation.ts:77](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/packages/shared/src/schemas/validation.ts#L77)

Validates that an object conforms to the Document structure.

Performs comprehensive validation including:
- id: non-empty string
- title: non-empty string (after trimming)
- content: string (can be empty)
- acl: valid DocumentACL structure

## Parameters

### obj

`unknown`

Unknown value to validate

## Returns

`obj is { id: string; title: string; content: string; acl: { owner: string; editors: string[]; viewers: string[] }; createdAt: string; updatedAt: string }`

True if value is a valid Document

## Since

1.0.0

## Example

```typescript
const documentData = await fetchDocument(id);

if (isValidDocumentData(documentData)) {
  // documentData is typed as Document
  renderDocument(documentData);
} else {
  console.error('Invalid document structure');
}
```
