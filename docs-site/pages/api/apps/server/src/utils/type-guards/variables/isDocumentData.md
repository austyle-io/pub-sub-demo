[**collab-edit-demo**](../../../../../../README.md)

***

[collab-edit-demo](../../../../../../README.md) / [apps/server/src/utils/type-guards](../README.md) / isDocumentData

# Variable: isDocumentData()

> `const` **isDocumentData**: (`data`) => `null` \| \{ `id`: `string`; `title`: `string`; `content`: `string`; `acl`: \{ `owner`: `string`; `editors`: `string`[]; `viewers`: `string`[]; \}; `createdAt`: `string`; `updatedAt`: `string`; \} = `getValidatedDocumentData`

Defined in: [apps/server/src/utils/type-guards.ts:202](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/server/src/utils/type-guards.ts#L202)

Type guard for document data (alias for compatibility)

Validates and returns a Document if data is valid, null otherwise

## Parameters

### data

`unknown`

## Returns

`null` \| \{ `id`: `string`; `title`: `string`; `content`: `string`; `acl`: \{ `owner`: `string`; `editors`: `string`[]; `viewers`: `string`[]; \}; `createdAt`: `string`; `updatedAt`: `string`; \}

## Since

1.0.0

## Since

1.0.0
