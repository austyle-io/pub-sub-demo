[**collab-edit-demo**](../../../../../../README.md)

***

[collab-edit-demo](../../../../../../README.md) / [apps/server/src/utils/sync-monitoring](../README.md) / SyncMetrics

# Interface: SyncMetrics

Defined in: [apps/server/src/utils/sync-monitoring.ts:21](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/utils/sync-monitoring.ts#L21)

ShareDB-MongoDB Synchronization Monitoring System

This system provides comprehensive monitoring and observability for
ShareDB-MongoDB synchronization, helping identify and resolve consistency
issues before they impact users.

Features:
- Sync latency tracking
- Consistency verification
- Performance metrics
- Alert thresholds
- Health check endpoints
- Historical trending

## Properties

### avgSyncLatency

> **avgSyncLatency**: `number`

Defined in: [apps/server/src/utils/sync-monitoring.ts:23](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/utils/sync-monitoring.ts#L23)

***

### maxSyncLatency

> **maxSyncLatency**: `number`

Defined in: [apps/server/src/utils/sync-monitoring.ts:24](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/utils/sync-monitoring.ts#L24)

***

### minSyncLatency

> **minSyncLatency**: `number`

Defined in: [apps/server/src/utils/sync-monitoring.ts:25](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/utils/sync-monitoring.ts#L25)

***

### p95SyncLatency

> **p95SyncLatency**: `number`

Defined in: [apps/server/src/utils/sync-monitoring.ts:26](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/utils/sync-monitoring.ts#L26)

***

### p99SyncLatency

> **p99SyncLatency**: `number`

Defined in: [apps/server/src/utils/sync-monitoring.ts:27](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/utils/sync-monitoring.ts#L27)

***

### totalOperations

> **totalOperations**: `number`

Defined in: [apps/server/src/utils/sync-monitoring.ts:30](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/utils/sync-monitoring.ts#L30)

***

### successfulOperations

> **successfulOperations**: `number`

Defined in: [apps/server/src/utils/sync-monitoring.ts:31](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/utils/sync-monitoring.ts#L31)

***

### failedOperations

> **failedOperations**: `number`

Defined in: [apps/server/src/utils/sync-monitoring.ts:32](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/utils/sync-monitoring.ts#L32)

***

### consistencyChecks

> **consistencyChecks**: `number`

Defined in: [apps/server/src/utils/sync-monitoring.ts:35](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/utils/sync-monitoring.ts#L35)

***

### consistencyFailures

> **consistencyFailures**: `number`

Defined in: [apps/server/src/utils/sync-monitoring.ts:36](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/utils/sync-monitoring.ts#L36)

***

### consistencyFailureRate

> **consistencyFailureRate**: `number`

Defined in: [apps/server/src/utils/sync-monitoring.ts:37](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/utils/sync-monitoring.ts#L37)

***

### avgQueryTime

> **avgQueryTime**: `number`

Defined in: [apps/server/src/utils/sync-monitoring.ts:40](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/utils/sync-monitoring.ts#L40)

***

### cacheHitRate

> **cacheHitRate**: `number`

Defined in: [apps/server/src/utils/sync-monitoring.ts:41](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/utils/sync-monitoring.ts#L41)

***

### windowStartTime

> **windowStartTime**: `number`

Defined in: [apps/server/src/utils/sync-monitoring.ts:44](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/utils/sync-monitoring.ts#L44)

***

### windowEndTime

> **windowEndTime**: `number`

Defined in: [apps/server/src/utils/sync-monitoring.ts:45](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/utils/sync-monitoring.ts#L45)

***

### duration

> **duration**: `number`

Defined in: [apps/server/src/utils/sync-monitoring.ts:46](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/utils/sync-monitoring.ts#L46)
