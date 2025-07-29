import type { Document } from '@collab-edit/shared';
import type { ShareDBDocument } from '../routes/doc.routes';
import { dbLogger } from '../services/logger';
import { logAuditEvent } from './audit-logger';
import { connectToDatabase } from './database';

/**
 * @summary Checks if a user has a specific permission for a document.
 * @remarks
 * This function checks if a user has read, write, or delete permissions for a
 * document by checking the document's ACL in the database.
 * @param collection - The name of the collection.
 * @param docId - The ID of the document.
 * @param userId - The ID of the user.
 * @param permission - The permission to check.
 * @returns A promise that resolves to an object containing a boolean indicating
 * whether the user has the permission and an optional reason for denial.
 * @since 1.0.0
 */
export const checkDocumentPermission = async (
  collection: string,
  docId: string,
  userId: string,
  permission: 'read' | 'write' | 'delete',
): Promise<{ allowed: boolean; reason?: string }> => {
  dbLogger.debug('Checking document permission', {
    collection,
    docId,
    userId,
    permission,
  });

  // Only check permissions for documents collection
  if (collection !== 'documents') {
    logAuditEvent({
      userId,
      action: permission,
      resource: 'document',
      resourceId: docId,
      result: 'denied',
      reason: 'Invalid collection',
    });
    return { allowed: false, reason: 'Invalid collection' };
  }

  try {
    const db = await connectToDatabase();
    const documents = db.collection<ShareDBDocument>('o_documents');

    const doc = await documents.findOne({ d: docId });
    dbLogger.debug('Document found for permission check', {
      docId,
      documentFound: !!doc,
      hasData: !!(doc?.create?.data ?? doc?.data),
    });
    if (!doc) {
      logAuditEvent({
        userId,
        action: permission,
        resource: 'document',
        resourceId: docId,
        result: 'denied',
        reason: 'Document not found',
      });
      return { allowed: false, reason: 'Document not found' };
    }

    const documentData = doc.create?.data ?? doc.data;
    if (!documentData) {
      logAuditEvent({
        userId,
        action: permission,
        resource: 'document',
        resourceId: docId,
        result: 'denied',
        reason: 'Document data not found',
      });
      return { allowed: false, reason: 'Document data not found' };
    }

    let hasPermission = false;
    // Check ownership
    if (documentData.acl.owner === userId) {
      hasPermission = true;
    }

    // Check write permission
    if (permission === 'write' || permission === 'delete') {
      hasPermission =
        hasPermission || documentData.acl.editors.includes(userId);
    }

    // Check read permission
    if (permission === 'read') {
      hasPermission =
        hasPermission ||
        documentData.acl.editors.includes(userId) ||
        documentData.acl.viewers.includes(userId);
    }

    logAuditEvent({
      userId,
      action: permission,
      resource: 'document',
      resourceId: docId,
      result: hasPermission ? 'allowed' : 'denied',
      reason: hasPermission ? undefined : 'Insufficient permissions',
    });

    return { allowed: hasPermission };
  } catch (error) {
    dbLogger.error('Error checking document permission', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      collection,
      docId,
      userId,
      permission,
    });
    logAuditEvent({
      userId,
      action: permission,
      resource: 'document',
      resourceId: docId,
      result: 'denied',
      reason: 'Error checking permission',
    });
    return { allowed: false, reason: 'Error checking permission' };
  }
};

/**
 * @summary Checks if a user can edit a document.
 * @param doc - The document to check.
 * @param userId - The ID of the user.
 * @param userRole - The role of the user.
 * @returns `true` if the user can edit the document, `false` otherwise.
 * @since 1.0.0
 */
export const canUserEditDocument = (
  doc: Document,
  userId: string,
  userRole: string,
): boolean => {
  // Admins can edit anything
  if (userRole === 'admin') {
    return true;
  }

  // Owners can edit
  if (doc.acl.owner === userId) {
    return true;
  }

  // Check if user is in editors list
  return doc.acl.editors.includes(userId);
};

/**
 * @summary Checks if a user can view a document.
 * @param doc - The document to check.
 * @param userId - The ID of the user.
 * @param userRole - The role of the user.
 * @returns `true` if the user can view the document, `false` otherwise.
 * @since 1.0.0
 */
export const canUserViewDocument = (
  doc: Document,
  userId: string,
  userRole: string,
): boolean => {
  // Admins can view anything
  if (userRole === 'admin') {
    return true;
  }

  // Check if user can edit (editors can also view)
  if (canUserEditDocument(doc, userId, userRole)) {
    return true;
  }

  // Check if user is in viewers list
  return doc.acl.viewers.includes(userId);
};
