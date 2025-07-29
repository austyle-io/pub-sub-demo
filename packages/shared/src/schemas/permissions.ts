import { type Static, Type } from '@sinclair/typebox';

/**
 * @summary Schema for user permissions on a document.
 * @remarks
 * This schema defines the boolean flags that determine a user's ability to
 * read, write, and delete a document.
 * @since 1.0.0
 */
export const PermissionsSchema = Type.Object({
  canRead: Type.Boolean(),
  canWrite: Type.Boolean(),
  canDelete: Type.Boolean(),
});

/**
 * @summary Type definition for user permissions on a document.
 * @since 1.0.0
 */
export type Permissions = Static<typeof PermissionsSchema>;
