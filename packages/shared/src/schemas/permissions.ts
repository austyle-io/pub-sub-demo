import { type Static, Type } from '@sinclair/typebox';

export const PermissionsSchema = Type.Object({
  canRead: Type.Boolean(),
  canWrite: Type.Boolean(),
  canDelete: Type.Boolean(),
});

export type Permissions = Static<typeof PermissionsSchema>;
