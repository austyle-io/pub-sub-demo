import type { Static } from '@sinclair/typebox';
/**
 * @summary Schema for the document's Access Control List (ACL).
 * @remarks
 * This schema defines the ownership and permissions for a document, specifying
 * who can edit and view it.
 * @since 1.0.0
 */
export declare const DocumentACLSchema: import('@sinclair/typebox').TObject<{
  owner: import('@sinclair/typebox').TString;
  editors: import('@sinclair/typebox').TArray<
    import('@sinclair/typebox').TString
  >;
  viewers: import('@sinclair/typebox').TArray<
    import('@sinclair/typebox').TString
  >;
}>;
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
export declare const DocumentSchema: import('@sinclair/typebox').TObject<{
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
 * @summary Type definition for a complete document.
 * @since 1.0.0
 */
export type Document = Static<typeof DocumentSchema>;
/**
 * @summary Schema for a list of documents.
 * @since 1.0.0
 */
export declare const DocumentListSchema: import('@sinclair/typebox').TArray<
  import('@sinclair/typebox').TObject<{
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
  }>
>;
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
export declare const DocumentUpdateSchema: import('@sinclair/typebox').TObject<{
  title: import('@sinclair/typebox').TOptional<
    import('@sinclair/typebox').TString
  >;
  content: import('@sinclair/typebox').TOptional<
    import('@sinclair/typebox').TString
  >;
}>;
/**
 * @summary Type definition for a document update.
 * @since 1.0.0
 */
export type DocumentUpdate = Static<typeof DocumentUpdateSchema>;
//# sourceMappingURL=document.d.ts.map
