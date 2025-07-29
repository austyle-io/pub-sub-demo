[**collab-edit-demo**](../../../../../../README.md)

***

[collab-edit-demo](../../../../../../README.md) / [apps/server/src/services/sharedb.service](../README.md) / initializeShareDB

# Function: initializeShareDB()

> **initializeShareDB**(): [`ShareDBService`](../classes/ShareDBService.md)

Defined in: [apps/server/src/services/sharedb.service.ts:361](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/server/src/services/sharedb.service.ts#L361)

Initialize the ShareDB service singleton.

Creates a new ShareDB service instance if one doesn't exist, or returns
the existing instance. This ensures a single ShareDB backend is used
throughout the application.

## Returns

[`ShareDBService`](../classes/ShareDBService.md)

The ShareDB service instance

## Since

1.0.0

## Example

```typescript
// In server initialization
const shareDBService = initializeShareDB();
shareDBService.attachToServer(httpServer);
```
