import type { Static } from '@sinclair/typebox';
/**
 * @summary Schema for the request to create a new document.
 * @remarks
 * This schema defines the shape of the request body when creating a new document.
 * It requires a title and allows for optional initial content.
 * @since 1.0.0
 */
export declare const CreateDocumentRequestSchema: import(
  '@sinclair/typebox',
).TObject<{
  title: import('@sinclair/typebox').TString;
  content: import('@sinclair/typebox').TOptional<
    import('@sinclair/typebox').TString
  >;
}>;
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
export declare const CreateDocumentResponseSchema: import(
  '@sinclair/typebox',
).TObject<{
  id: import('@sinclair/typebox').TString;
  title: import('@sinclair/typebox').TString;
  content: import('@sinclair/typebox').TString;
  acl: import('@sinclair/typebox').TObject<{
    owner: import('@sinclair/typebox').TString;
    editors: import('@sinclair/typebox').TArray<
      import('@sinclair/typebox').TString
    >;
    viewers: import('@sinclair/typebox').TArray<
      import('@sinclair/typebox').TString
    >;
  }>;
  createdAt: import('@sinclair/typebox').TString;
  updatedAt: import('@sinclair/typebox').TString;
}>;
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
export declare const ErrorResponseSchema: import('@sinclair/typebox').TObject<{
  error: import('@sinclair/typebox').TString;
  details: import('@sinclair/typebox').TOptional<
    import('@sinclair/typebox').TUnknown
  >;
}>;
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
export declare const SuccessResponseSchema: import(
  '@sinclair/typebox',
).TObject<{
  success: import('@sinclair/typebox').TBoolean;
  message: import('@sinclair/typebox').TOptional<
    import('@sinclair/typebox').TString
  >;
}>;
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
export declare const UpdateDocumentRequestSchema: import(
  '@sinclair/typebox',
).TObject<{
  title: import('@sinclair/typebox').TString;
}>;
/**
 * @summary Type definition for the update document request.
 * @since 1.0.0
 */
export type UpdateDocumentRequest = Static<typeof UpdateDocumentRequestSchema>;
//# sourceMappingURL=api.d.ts.map
