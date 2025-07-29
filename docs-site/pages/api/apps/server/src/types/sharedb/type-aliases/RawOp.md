[**collab-edit-demo**](../../../../../../README.md)

***

[collab-edit-demo](../../../../../../README.md) / [apps/server/src/types/sharedb](../README.md) / RawOp

# Type Alias: RawOp

> **RawOp** = `object` & \{ `create`: \{ `type`: `string`; `data`: [`DocumentData`](DocumentData.md); \}; `del?`: `never`; `op?`: `never`; \} \| \{ `del`: `true`; `create?`: `never`; `op?`: `never`; \} \| \{ `op`: [`Op`](Op.md)[]; `create?`: `never`; `del?`: `never`; \}

Defined in: [apps/server/src/types/sharedb.ts:166](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/types/sharedb.ts#L166)

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
