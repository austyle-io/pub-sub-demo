[**collab-edit-demo**](../../../../../../README.md)

***

[collab-edit-demo](../../../../../../README.md) / [apps/server/src/utils/permissions](../README.md) / canUserViewDocument

# Function: canUserViewDocument()

> **canUserViewDocument**(`doc`, `userId`, `userRole`): `boolean`

Defined in: [apps/server/src/utils/permissions.ts:150](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/server/src/utils/permissions.ts#L150)

can User View Document.

## Parameters

### doc

#### id

`string`

#### title

`string`

#### content

`string`

#### acl

\{ `owner`: `string`; `editors`: `string`[]; `viewers`: `string`[]; \}

#### acl.owner

`string`

#### acl.editors

`string`[]

#### acl.viewers

`string`[]

#### createdAt

`string`

#### updatedAt

`string`

### userId

`string`

### userRole

`string`

## Returns

`boolean`

## Since

1.0.0
