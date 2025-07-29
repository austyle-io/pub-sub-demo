import type { Document } from '@collab-edit/shared';
import { initializeShareDB } from '../services/sharedb.service';

/**
 * ShareDB Query Helper - Provides race-condition-free document access
 *
 * This utility solves the ShareDB-MongoDB synchronization issue by querying
 * ShareDB directly instead of MongoDB, ensuring we always get the latest
 * document state including recent operations that may not have synced yet.
 */

/**
 * @summary Defines the result of a ShareDB query.
 * @template T - The type of the data returned by the query.
 * @since 1.0.0
 */
export type ShareDBQueryResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * @summary Fetches a document using a ShareDB connection.
 * @remarks
 * This function fetches a document directly from ShareDB, which guarantees that
 * the latest state of the document is returned, including any recent operations
 * that may not have been synced to the database yet.
 * @param collection - The name of the ShareDB collection.
 * @param docId - The ID of the document.
 * @param userId - The ID of the user for the authentication context.
 * @param userEmail - The email of the user for the authentication context.
 * @param userRole - The role of the user for the authentication context.
 * @returns A promise that resolves to the document data or an error.
 * @since 1.0.0
 */
export const queryShareDBDocument = async (
  collection: string,
  docId: string,
  userId: string,
  userEmail: string,
  userRole: string,
): Promise<ShareDBQueryResult<Document>> => {
  return new Promise((resolve) => {
    try {
      const shareDBService = initializeShareDB();
      const connection = shareDBService.createAuthenticatedConnection(
        userId,
        userEmail,
        userRole,
      );

      const doc = connection.get(collection, docId);

      doc.fetch((err) => {
        if (err) {
          console.error('ShareDB fetch error:', err);
          resolve({
            success: false,
            error: 'Failed to fetch document from ShareDB',
          });
          return;
        }

        if (!doc.data) {
          resolve({
            success: false,
            error: 'Document not found',
          });
          return;
        }

        // Return the document data from ShareDB's in-memory state
        resolve({
          success: true,
          data: doc.data as Document,
        });

        // Note: ShareDB connections are managed automatically
      });
    } catch (error) {
      console.error('ShareDB query error:', error);
      resolve({
        success: false,
        error: 'ShareDB query failed',
      });
    }
  });
};

/**
 * @summary Checks document permissions using a direct ShareDB query.
 * @remarks
 * This function replaces the MongoDB-based permission checking to avoid race
 * conditions with ShareDB operations.
 * @param collection - The name of the ShareDB collection.
 * @param docId - The ID of the document.
 * @param userId - The ID of the user.
 * @param userEmail - The email of the user.
 * @param userRole - The role of the user.
 * @param permission - The permission to check.
 * @returns A promise that resolves to an object containing a boolean indicating
 * whether the user has the permission and an optional reason for denial.
 * @since 1.0.0
 */
export const checkDocumentPermissionViaShareDB = async (
  collection: string,
  docId: string,
  userId: string,
  userEmail: string,
  userRole: string,
  permission: 'read' | 'write' | 'delete',
): Promise<{ allowed: boolean; reason?: string }> => {
  // Only check permissions for documents collection
  if (collection !== 'documents') {
    return { allowed: false, reason: 'Invalid collection' };
  }

  const result = await queryShareDBDocument(
    collection,
    docId,
    userId,
    userEmail,
    userRole,
  );

  if (!result.success || !result.data) {
    return { allowed: false, reason: result.error ?? 'Document not found' };
  }

  const doc = result.data;
  let hasPermission = false;

  // Check ownership
  if (doc.acl.owner === userId) {
    hasPermission = true;
  }

  // Check write permission
  if (permission === 'write' || permission === 'delete') {
    hasPermission = hasPermission || doc.acl.editors.includes(userId);
  }

  // Check read permission
  if (permission === 'read') {
    hasPermission =
      hasPermission ||
      doc.acl.editors.includes(userId) ||
      doc.acl.viewers.includes(userId);
  }

  return {
    allowed: hasPermission,
    reason: hasPermission ? undefined : 'Insufficient permissions',
  };
};
