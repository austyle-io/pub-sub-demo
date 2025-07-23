[**collab-edit-demo**](../../../../../../README.md)

***

[collab-edit-demo](../../../../../../README.md) / [apps/server/src/utils/permissions](../README.md) / canUserViewDocument

# Function: canUserViewDocument()

> **canUserViewDocument**(`doc`, `userId`, `userRole`): `boolean`

Defined in: [apps/server/src/utils/permissions.ts:138](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/utils/permissions.ts#L138)

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
