[**collab-edit-demo**](../../../../../../README.md)

***

[collab-edit-demo](../../../../../../README.md) / [apps/server/src/utils/type-guards](../README.md) / isDocumentData

# Variable: isDocumentData()

> `const` **isDocumentData**: (`data`) => `null` \| \{ `id`: `string`; `title`: `string`; `content`: `string`; `acl`: \{ `owner`: `string`; `editors`: `string`[]; `viewers`: `string`[]; \}; `createdAt`: `string`; `updatedAt`: `string`; \} = `getValidatedDocumentData`

Defined in: [apps/server/src/utils/type-guards.ts:178](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/utils/type-guards.ts#L178)

Type guard for document data (alias for compatibility)

Validates and returns a Document if data is valid, null otherwise

## Parameters

### data

`unknown`

## Returns

`null` \| \{ `id`: `string`; `title`: `string`; `content`: `string`; `acl`: \{ `owner`: `string`; `editors`: `string`[]; `viewers`: `string`[]; \}; `createdAt`: `string`; `updatedAt`: `string`; \}
