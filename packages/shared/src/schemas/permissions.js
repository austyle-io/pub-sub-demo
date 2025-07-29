Object.defineProperty(exports, '__esModule', { value: true });
exports.PermissionsSchema = void 0;
const typebox_1 = require('@sinclair/typebox');
/**
 * @summary Schema for user permissions on a document.
 * @remarks
 * This schema defines the boolean flags that determine a user's ability to
 * read, write, and delete a document.
 * @since 1.0.0
 */
exports.PermissionsSchema = typebox_1.Type.Object({
  canRead: typebox_1.Type.Boolean(),
  canWrite: typebox_1.Type.Boolean(),
  canDelete: typebox_1.Type.Boolean(),
});
