[**collab-edit-demo**](../../../../../../README.md)

***

[collab-edit-demo](../../../../../../README.md) / [apps/server/src/utils/permission-cache](../README.md) / CachedPermission

# Interface: CachedPermission

Defined in: [apps/server/src/utils/permission-cache.ts:18](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/utils/permission-cache.ts#L18)

Intelligent Permission Caching System

This system provides fast permission lookups while maintaining consistency
by automatically invalidating cached permissions when documents change.

Key features:
- LRU cache with configurable size and TTL
- Automatic invalidation on document/permission changes
- Hierarchical cache keys for granular invalidation
- Metrics and monitoring support
- Memory-efficient storage

## Properties

### userId

> **userId**: `string`

Defined in: [apps/server/src/utils/permission-cache.ts:19](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/utils/permission-cache.ts#L19)

***

### docId

> **docId**: `string`

Defined in: [apps/server/src/utils/permission-cache.ts:20](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/utils/permission-cache.ts#L20)

***

### collection

> **collection**: `string`

Defined in: [apps/server/src/utils/permission-cache.ts:21](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/utils/permission-cache.ts#L21)

***

### canRead

> **canRead**: `boolean`

Defined in: [apps/server/src/utils/permission-cache.ts:22](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/utils/permission-cache.ts#L22)

***

### canWrite

> **canWrite**: `boolean`

Defined in: [apps/server/src/utils/permission-cache.ts:23](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/utils/permission-cache.ts#L23)

***

### canDelete

> **canDelete**: `boolean`

Defined in: [apps/server/src/utils/permission-cache.ts:24](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/utils/permission-cache.ts#L24)

***

### cachedAt

> **cachedAt**: `number`

Defined in: [apps/server/src/utils/permission-cache.ts:25](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/utils/permission-cache.ts#L25)

***

### ttl

> **ttl**: `number`

Defined in: [apps/server/src/utils/permission-cache.ts:26](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/utils/permission-cache.ts#L26)
