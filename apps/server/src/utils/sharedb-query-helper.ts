import type { Document } from '@collab-edit/shared';
import { initializeShareDB } from '../services/sharedb.service';

/**
 * ShareDB Query Helper - Provides race-condition-free document access
 *
 * This utility solves the ShareDB-MongoDB synchronization issue by querying
 * ShareDB directly instead of MongoDB, ensuring we always get the latest
 * document state including recent operations that may not have synced yet.
 */

export type ShareDBQueryResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Fetch a document using ShareDB connection (guarantees latest state)
 *
 * @param collection - ShareDB collection name
 * @param docId - Document ID
 * @param userId - User ID for authentication context
 * @param userEmail - User email for authentication context
 * @param userRole - User role for authentication context
 * @returns Promise with document data or error
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
 * Check document permissions using ShareDB direct query
 *
 * This replaces the MongoDB-based permission checking to avoid
 * race conditions with ShareDB operations.
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
