Object.defineProperty(exports, '__esModule', { value: true });
exports.DocumentUpdateSchema =
  exports.DocumentListSchema =
  exports.DocumentSchema =
  exports.DocumentACLSchema =
    void 0;
const typebox_1 = require('@sinclair/typebox');
/**
 * @summary Schema for the document's Access Control List (ACL).
 * @remarks
 * This schema defines the ownership and permissions for a document, specifying
 * who can edit and view it.
 * @since 1.0.0
 */
exports.DocumentACLSchema = typebox_1.Type.Object({
  owner: typebox_1.Type.String({
    format: 'uuid',
    description: 'User ID of the document owner',
  }),
  editors: typebox_1.Type.Array(
    typebox_1.Type.String({
      format: 'uuid',
    }),
    {
      description: 'Array of user IDs who can edit the document',
    },
  ),
  viewers: typebox_1.Type.Array(
    typebox_1.Type.String({
      format: 'uuid',
    }),
    {
      description: 'Array of user IDs who can view the document',
    },
  ),
});
/**
 * @summary Schema for a complete document.
 * @remarks
 * This schema defines the entire structure of a document, including its content,
 * metadata, and access control list.
 * @since 1.0.0
 */
exports.DocumentSchema = typebox_1.Type.Object({
  id: typebox_1.Type.String({
    format: 'uuid',
    description: 'Unique document identifier',
  }),
  title: typebox_1.Type.String({
    maxLength: 100,
    minLength: 1,
    description: 'Document title',
  }),
  content: typebox_1.Type.String({
    description: 'Document content (plain text for now)',
  }),
  acl: exports.DocumentACLSchema,
  createdAt: typebox_1.Type.String({
    format: 'date-time',
    description: 'ISO 8601 date-time when document was created',
  }),
  updatedAt: typebox_1.Type.String({
    format: 'date-time',
    description: 'ISO 8601 date-time when document was last updated',
  }),
});
/**
 * @summary Schema for a list of documents.
 * @since 1.0.0
 */
exports.DocumentListSchema = typebox_1.Type.Array(exports.DocumentSchema);
/**
 * @summary Schema for updating a document.
 * @remarks
 * This schema defines the fields that can be updated in a document.
 * All fields are optional.
 * @since 1.0.0
 */
exports.DocumentUpdateSchema = typebox_1.Type.Object({
  title: typebox_1.Type.Optional(
    typebox_1.Type.String({
      maxLength: 100,
      minLength: 1,
    }),
  ),
  content: typebox_1.Type.Optional(typebox_1.Type.String()),
});
