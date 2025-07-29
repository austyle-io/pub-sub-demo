[**collab-edit-demo**](../../../../../../README.md)

***

[collab-edit-demo](../../../../../../README.md) / [apps/server/src/utils/type-guards](../README.md) / createValidatedDocument

# Function: createValidatedDocument()

> **createValidatedDocument**(`data`): `object`

Defined in: [apps/server/src/utils/type-guards.ts:190](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/server/src/utils/type-guards.ts#L190)

Creates a validated Document from DocumentData

## Parameters

### data

`DocumentData`

## Returns

`object`

### id

> **id**: `string`

### title

> **title**: `string`

### content

> **content**: `string`

### acl

> **acl**: `object`

#### acl.owner

> **owner**: `string`

#### acl.editors

> **editors**: `string`[]

#### acl.viewers

> **viewers**: `string`[]

### createdAt

> **createdAt**: `string`

### updatedAt

> **updatedAt**: `string`

## Since

1.0.0
