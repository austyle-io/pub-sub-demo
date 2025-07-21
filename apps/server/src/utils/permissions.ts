import type { Document } from '@collab-edit/shared';
import type { ShareDBDocument } from '../routes/doc.routes';
import { logAuditEvent } from './audit-logger';
import { connectToDatabase } from './database';

export async function checkDocumentPermission(
  collection: string,
  docId: string,
  userId: string,
  permission: 'read' | 'write' | 'delete',
): Promise<{ allowed: boolean; reason?: string }> {
  console.log('checkDocumentPermission called with:');
  console.log('  collection:', collection);
  console.log('  docId:', docId);
  console.log('  userId:', userId);
  console.log('  permission:', permission);

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
    console.log(
      'Document found in checkDocumentPermission:',
      JSON.stringify(doc),
    );
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
    console.error('Error checking document permission:', error);
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
}

export function canUserEditDocument(
  doc: Document,
  userId: string,
  userRole: string,
): boolean {
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
}

export function canUserViewDocument(
  doc: Document,
  userId: string,
  userRole: string,
): boolean {
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
}
