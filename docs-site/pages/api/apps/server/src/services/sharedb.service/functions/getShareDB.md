[**collab-edit-demo**](../../../../../../README.md)

***

[collab-edit-demo](../../../../../../README.md) / [apps/server/src/services/sharedb.service](../README.md) / getShareDB

# Function: getShareDB()

> **getShareDB**(): `ShareDB`

Defined in: [apps/server/src/services/sharedb.service.ts:387](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/server/src/services/sharedb.service.ts#L387)

Get the ShareDB backend instance.

Provides access to the underlying ShareDB backend for direct operations.
The ShareDB service must be initialized before calling this function.

## Returns

`ShareDB`

The ShareDB backend instance

## Throws

If ShareDB service has not been initialized

## Since

1.0.0

## Example

```typescript
// Get backend for direct operations
const backend = getShareDB();
const connection = backend.connect();
```

## See

[initializeShareDB](initializeShareDB.md) for initialization
