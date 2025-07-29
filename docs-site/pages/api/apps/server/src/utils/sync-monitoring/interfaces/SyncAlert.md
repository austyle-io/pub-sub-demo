[**collab-edit-demo**](../../../../../../README.md)

***

[collab-edit-demo](../../../../../../README.md) / [apps/server/src/utils/sync-monitoring](../README.md) / SyncAlert

# Interface: SyncAlert

Defined in: [apps/server/src/utils/sync-monitoring.ts:57](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/server/src/utils/sync-monitoring.ts#L57)

Type definition for sync alert.

## Since

1.0.0

## Properties

### type

> **type**: `"error"` \| `"latency"` \| `"consistency"` \| `"performance"`

Defined in: [apps/server/src/utils/sync-monitoring.ts:58](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/server/src/utils/sync-monitoring.ts#L58)

***

### severity

> **severity**: `"warning"` \| `"critical"`

Defined in: [apps/server/src/utils/sync-monitoring.ts:59](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/server/src/utils/sync-monitoring.ts#L59)

***

### message

> **message**: `string`

Defined in: [apps/server/src/utils/sync-monitoring.ts:60](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/server/src/utils/sync-monitoring.ts#L60)

***

### timestamp

> **timestamp**: `number`

Defined in: [apps/server/src/utils/sync-monitoring.ts:61](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/server/src/utils/sync-monitoring.ts#L61)

***

### metrics

> **metrics**: `Record`\<`string`, `number`\>

Defined in: [apps/server/src/utils/sync-monitoring.ts:62](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/server/src/utils/sync-monitoring.ts#L62)
