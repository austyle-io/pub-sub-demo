import { type Static, Type } from '@sinclair/typebox';
import { DocumentSchema } from './document';

/**
 * @summary Schema for the request to create a new document.
 * @remarks
 * This schema defines the shape of the request body when creating a new document.
 * It requires a title and allows for optional initial content.
 * @since 1.0.0
 */
export const CreateDocumentRequestSchema = Type.Object({
  title: Type.String({
    maxLength: 100,
    minLength: 1,
    description: 'Title for the new document',
  }),
  content: Type.Optional(
    Type.String({
      default: '',
      description: 'Initial content for the document',
    }),
  ),
});

/**
 * @summary Type definition for the create document request.
 * @since 1.0.0
 */
export type CreateDocumentRequest = Static<typeof CreateDocumentRequestSchema>;

/**
 * @summary Schema for the response when a document is created successfully.
 * @remarks This schema is an alias for the main `DocumentSchema`.
 * @since 1.0.0
 */
export const CreateDocumentResponseSchema = DocumentSchema;

/**
 * @summary Type definition for the create document response.
 * @since 1.0.0
 */
export type CreateDocumentResponse = Static<
  typeof CreateDocumentResponseSchema
>;

/**
 * @summary Schema for a generic error response.
 * @remarks
 * This schema is used for all error responses from the API. It includes a
 * main error message and an optional field for additional details.
 * @since 1.0.0
 */
export const ErrorResponseSchema = Type.Object({
  error: Type.String({
    description: 'Error message',
  }),
  details: Type.Optional(
    Type.Unknown({
      description: 'Additional error details',
    }),
  ),
});

/**
 * @summary Type definition for a generic error response.
 * @since 1.0.0
 */
export type ErrorResponse = Static<typeof ErrorResponseSchema>;

/**
 * @summary Schema for a generic success response.
 * @remarks
 * This schema is used for success responses that do not return any specific data.
 * It includes a success flag and an optional message.
 * @since 1.0.0
 */
export const SuccessResponseSchema = Type.Object({
  success: Type.Boolean({
    const: true,
  }),
  message: Type.Optional(Type.String()),
});

/**
 * @summary Type definition for a generic success response.
 * @since 1.0.0
 */
export type SuccessResponse = Static<typeof SuccessResponseSchema>;

/**
 * @summary Schema for the request to update a document.
 * @remarks
 * This schema defines the shape of the request body when updating a document.
 * It currently only allows for updating the title.
 * @since 1.0.0
 */
export const UpdateDocumentRequestSchema = Type.Object({
  title: Type.String({
    maxLength: 100,
    minLength: 1,
    description: 'Updated title for the document',
  }),
});

/**
 * @summary Type definition for the update document request.
 * @since 1.0.0
 */
export type UpdateDocumentRequest = Static<typeof UpdateDocumentRequestSchema>;
