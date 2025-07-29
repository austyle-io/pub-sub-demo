import { type Static, Type } from '@sinclair/typebox';

/**
 * @summary Schema for the document's Access Control List (ACL).
 * @remarks
 * This schema defines the ownership and permissions for a document, specifying
 * who can edit and view it.
 * @since 1.0.0
 */
export const DocumentACLSchema = Type.Object({
  owner: Type.String({
    format: 'uuid',
    description: 'User ID of the document owner',
  }),
  editors: Type.Array(
    Type.String({
      format: 'uuid',
    }),
    {
      description: 'Array of user IDs who can edit the document',
    },
  ),
  viewers: Type.Array(
    Type.String({
      format: 'uuid',
    }),
    {
      description: 'Array of user IDs who can view the document',
    },
  ),
});

/**
 * @summary Type definition for the document's Access Control List (ACL).
 * @since 1.0.0
 */
export type DocumentACL = Static<typeof DocumentACLSchema>;

/**
 * @summary Schema for a complete document.
 * @remarks
 * This schema defines the entire structure of a document, including its content,
 * metadata, and access control list.
 * @since 1.0.0
 */
export const DocumentSchema = Type.Object({
  id: Type.String({
    format: 'uuid',
    description: 'Unique document identifier',
  }),
  title: Type.String({
    maxLength: 100,
    minLength: 1,
    description: 'Document title',
  }),
  content: Type.String({
    description: 'Document content (plain text for now)',
  }),
  acl: DocumentACLSchema,
  createdAt: Type.String({
    format: 'date-time',
    description: 'ISO 8601 date-time when document was created',
  }),
  updatedAt: Type.String({
    format: 'date-time',
    description: 'ISO 8601 date-time when document was last updated',
  }),
});

/**
 * @summary Type definition for a complete document.
 * @since 1.0.0
 */
export type Document = Static<typeof DocumentSchema>;

/**
 * @summary Schema for a list of documents.
 * @since 1.0.0
 */
export const DocumentListSchema = Type.Array(DocumentSchema);

/**
 * @summary Type definition for a list of documents.
 * @since 1.0.0
 */
export type DocumentList = Static<typeof DocumentListSchema>;

/**
 * @summary Schema for updating a document.
 * @remarks
 * This schema defines the fields that can be updated in a document.
 * All fields are optional.
 * @since 1.0.0
 */
export const DocumentUpdateSchema = Type.Object({
  title: Type.Optional(
    Type.String({
      maxLength: 100,
      minLength: 1,
    }),
  ),
  content: Type.Optional(Type.String()),
});

/**
 * @summary Type definition for a document update.
 * @since 1.0.0
 */
export type DocumentUpdate = Static<typeof DocumentUpdateSchema>;
