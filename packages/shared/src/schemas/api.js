Object.defineProperty(exports, '__esModule', { value: true });
exports.UpdateDocumentRequestSchema =
  exports.SuccessResponseSchema =
  exports.ErrorResponseSchema =
  exports.CreateDocumentResponseSchema =
  exports.CreateDocumentRequestSchema =
    void 0;
const typebox_1 = require('@sinclair/typebox');
const document_1 = require('./document');
/**
 * @summary Schema for the request to create a new document.
 * @remarks
 * This schema defines the shape of the request body when creating a new document.
 * It requires a title and allows for optional initial content.
 * @since 1.0.0
 */
exports.CreateDocumentRequestSchema = typebox_1.Type.Object({
  title: typebox_1.Type.String({
    maxLength: 100,
    minLength: 1,
    description: 'Title for the new document',
  }),
  content: typebox_1.Type.Optional(
    typebox_1.Type.String({
      default: '',
      description: 'Initial content for the document',
    }),
  ),
});
/**
 * @summary Schema for the response when a document is created successfully.
 * @remarks This schema is an alias for the main `DocumentSchema`.
 * @since 1.0.0
 */
exports.CreateDocumentResponseSchema = document_1.DocumentSchema;
/**
 * @summary Schema for a generic error response.
 * @remarks
 * This schema is used for all error responses from the API. It includes a
 * main error message and an optional field for additional details.
 * @since 1.0.0
 */
exports.ErrorResponseSchema = typebox_1.Type.Object({
  error: typebox_1.Type.String({
    description: 'Error message',
  }),
  details: typebox_1.Type.Optional(
    typebox_1.Type.Unknown({
      description: 'Additional error details',
    }),
  ),
});
/**
 * @summary Schema for a generic success response.
 * @remarks
 * This schema is used for success responses that do not return any specific data.
 * It includes a success flag and an optional message.
 * @since 1.0.0
 */
exports.SuccessResponseSchema = typebox_1.Type.Object({
  success: typebox_1.Type.Boolean({
    const: true,
  }),
  message: typebox_1.Type.Optional(typebox_1.Type.String()),
});
/**
 * @summary Schema for the request to update a document.
 * @remarks
 * This schema defines the shape of the request body when updating a document.
 * It currently only allows for updating the title.
 * @since 1.0.0
 */
exports.UpdateDocumentRequestSchema = typebox_1.Type.Object({
  title: typebox_1.Type.String({
    maxLength: 100,
    minLength: 1,
    description: 'Updated title for the document',
  }),
});
