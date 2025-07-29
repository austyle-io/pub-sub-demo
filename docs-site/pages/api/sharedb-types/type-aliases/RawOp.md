[**collab-edit-demo**](../../README.md)

***

[collab-edit-demo](../../README.md) / [sharedb-types](../README.md) / RawOp

# Type Alias: RawOp

> **RawOp** = `object` & \{ `create`: \{ `type`: `string`; `data`: [`DocumentData`](DocumentData.md); \}; `del?`: `never`; `op?`: `never`; \} \| \{ `del`: `true`; `create?`: `never`; `op?`: `never`; \} \| \{ `op`: [`Op`](Op.md)[]; `create?`: `never`; `del?`: `never`; \}

Defined in: [apps/server/src/types/sharedb.ts:292](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/server/src/types/sharedb.ts#L292)

Type definition for raw op.

## Type declaration

### src

> **src**: `string`

### seq

> **seq**: `number`

### v

> **v**: [`VersionNumber`](VersionNumber.md)

### m

> **m**: `unknown`

### c

> **c**: [`CollectionName`](CollectionName.md)

### d

> **d**: [`DocumentID`](DocumentID.md)

## Since

1.0.0
