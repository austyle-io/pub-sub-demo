import type { Static } from '@sinclair/typebox';
/**
 * @summary Schema for user permissions on a document.
 * @remarks
 * This schema defines the boolean flags that determine a user's ability to
 * read, write, and delete a document.
 * @since 1.0.0
 */
export declare const PermissionsSchema: import('@sinclair/typebox').TObject<{
  canRead: import('@sinclair/typebox').TBoolean;
  canWrite: import('@sinclair/typebox').TBoolean;
  canDelete: import('@sinclair/typebox').TBoolean;
}>;
/**
 * @summary Type definition for user permissions on a document.
 * @since 1.0.0
 */
export type Permissions = Static<typeof PermissionsSchema>;
//# sourceMappingURL=permissions.d.ts.map
