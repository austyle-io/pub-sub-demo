[**collab-edit-demo**](../../../../../../README.md)

***

[collab-edit-demo](../../../../../../README.md) / [apps/server/src/utils/type-guards](../README.md) / createValidatedDocument

# Function: createValidatedDocument()

> **createValidatedDocument**(`data`): `object`

Defined in: [apps/server/src/utils/type-guards.ts:168](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/utils/type-guards.ts#L168)

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
