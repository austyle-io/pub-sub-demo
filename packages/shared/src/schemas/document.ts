import { Type, Static } from '@sinclair/typebox'

export const DocumentACLSchema = Type.Object({
  owner: Type.String({
    format: 'uuid',
    description: 'User ID of the document owner'
  }),
  editors: Type.Array(Type.String({
    format: 'uuid'
  }), {
    description: 'Array of user IDs who can edit the document'
  }),
  viewers: Type.Array(Type.String({
    format: 'uuid'
  }), {
    description: 'Array of user IDs who can view the document'
  })
})

export type DocumentACL = Static<typeof DocumentACLSchema>

export const DocumentSchema = Type.Object({
  id: Type.String({ 
    format: 'uuid',
    description: 'Unique document identifier' 
  }),
  title: Type.String({ 
    maxLength: 100,
    minLength: 1,
    description: 'Document title' 
  }),
  content: Type.String({
    description: 'Document content (plain text for now)'
  }),
  acl: DocumentACLSchema,
  createdAt: Type.String({
    format: 'date-time',
    description: 'ISO 8601 date-time when document was created'
  }),
  updatedAt: Type.String({
    format: 'date-time',
    description: 'ISO 8601 date-time when document was last updated'
  })
})

export type Document = Static<typeof DocumentSchema>

export const DocumentListSchema = Type.Array(DocumentSchema)
export type DocumentList = Static<typeof DocumentListSchema>

export const DocumentUpdateSchema = Type.Object({
  title: Type.Optional(Type.String({ 
    maxLength: 100,
    minLength: 1
  })),
  content: Type.Optional(Type.String())
})

export type DocumentUpdate = Static<typeof DocumentUpdateSchema>