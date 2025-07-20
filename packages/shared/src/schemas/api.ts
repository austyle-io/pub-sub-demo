import { type Static, Type } from '@sinclair/typebox';
import { DocumentSchema } from './document';

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

export type CreateDocumentRequest = Static<typeof CreateDocumentRequestSchema>;

export const CreateDocumentResponseSchema = DocumentSchema;
export type CreateDocumentResponse = Static<
  typeof CreateDocumentResponseSchema
>;

export const ErrorResponseSchema = Type.Object({
  error: Type.String({
    description: 'Error message',
  }),
  details: Type.Optional(
    Type.Any({
      description: 'Additional error details',
    }),
  ),
});

export type ErrorResponse = Static<typeof ErrorResponseSchema>;

export const SuccessResponseSchema = Type.Object({
  success: Type.Boolean({
    const: true,
  }),
  message: Type.Optional(Type.String()),
});

export type SuccessResponse = Static<typeof SuccessResponseSchema>;

export const UpdateDocumentRequestSchema = Type.Object({
  title: Type.String({
    maxLength: 100,
    minLength: 1,
    description: 'Updated title for the document',
  }),
});

export type UpdateDocumentRequest = Static<typeof UpdateDocumentRequestSchema>;
