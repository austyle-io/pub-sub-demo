[**collab-edit-demo**](../../../../../../README.md)

***

[collab-edit-demo](../../../../../../README.md) / [apps/server/src/utils/sharedb-query-helper](../README.md) / ShareDBQueryResult

# Type Alias: ShareDBQueryResult\<T\>

> **ShareDBQueryResult**\<`T`\> = `object`

Defined in: [apps/server/src/utils/sharedb-query-helper.ts:12](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/utils/sharedb-query-helper.ts#L12)

ShareDB Query Helper - Provides race-condition-free document access

This utility solves the ShareDB-MongoDB synchronization issue by querying
ShareDB directly instead of MongoDB, ensuring we always get the latest
document state including recent operations that may not have synced yet.

## Type Parameters

### T

`T` = `unknown`

## Properties

### success

> **success**: `boolean`

Defined in: [apps/server/src/utils/sharedb-query-helper.ts:13](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/utils/sharedb-query-helper.ts#L13)

***

### data?

> `optional` **data**: `T`

Defined in: [apps/server/src/utils/sharedb-query-helper.ts:14](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/utils/sharedb-query-helper.ts#L14)

***

### error?

> `optional` **error**: `string`

Defined in: [apps/server/src/utils/sharedb-query-helper.ts:15](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/server/src/utils/sharedb-query-helper.ts#L15)
