[**collab-edit-demo**](../../../../../../README.md)

***

[collab-edit-demo](../../../../../../README.md) / [apps/server/src/utils/audit-logger](../README.md) / AuditEvent

# Type Alias: AuditEvent

> **AuditEvent** = `object`

Defined in: [apps/server/src/utils/audit-logger.ts:14](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/server/src/utils/audit-logger.ts#L14)

Type definition for audit event.

## Since

1.0.0

## Properties

### userId?

> `optional` **userId**: `string`

Defined in: [apps/server/src/utils/audit-logger.ts:15](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/server/src/utils/audit-logger.ts#L15)

***

### action

> **action**: `string`

Defined in: [apps/server/src/utils/audit-logger.ts:16](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/server/src/utils/audit-logger.ts#L16)

***

### resource

> **resource**: `string`

Defined in: [apps/server/src/utils/audit-logger.ts:17](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/server/src/utils/audit-logger.ts#L17)

***

### resourceId?

> `optional` **resourceId**: `string`

Defined in: [apps/server/src/utils/audit-logger.ts:18](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/server/src/utils/audit-logger.ts#L18)

***

### result

> **result**: `"allowed"` \| `"denied"`

Defined in: [apps/server/src/utils/audit-logger.ts:19](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/server/src/utils/audit-logger.ts#L19)

***

### reason?

> `optional` **reason**: `string`

Defined in: [apps/server/src/utils/audit-logger.ts:20](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/server/src/utils/audit-logger.ts#L20)

***

### metadata?

> `optional` **metadata**: `Record`\<`string`, `unknown`\>

Defined in: [apps/server/src/utils/audit-logger.ts:21](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/server/src/utils/audit-logger.ts#L21)
