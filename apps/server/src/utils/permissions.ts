import type { Document } from '@collab-edit/shared';
import { connectToDatabase } from './database';

export async function checkDocumentPermission(
  collection: string,
  docId: string,
  userId: string,
  permission: 'read' | 'write',
): Promise<boolean> {
  // Only check permissions for documents collection
  if (collection !== 'documents') {
    return false;
  }

  try {
    const db = await connectToDatabase();
    const documents = db.collection<Document>('documents');

    const doc = await documents.findOne({ id: docId });
    if (!doc) {
      return false;
    }

    // Check ownership
    if (doc.acl.owner === userId) {
      return true;
    }

    // Check write permission
    if (permission === 'write') {
      return doc.acl.editors.includes(userId);
    }

    // Check read permission
    return doc.acl.editors.includes(userId) || doc.acl.viewers.includes(userId);
  } catch (error) {
    console.error('Error checking document permission:', error);
    return false;
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
