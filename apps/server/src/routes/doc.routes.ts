import {
  type Document as SharedDocument,
  validateUpdateDocumentRequest,
} from '@collab-edit/shared';
import { type Request, type Response, Router } from 'express';
import type { Db } from 'mongodb';
import { authenticate } from '../middleware/passport';
import { initializeShareDB } from '../services/sharedb.service';
import type { Op } from '../types/sharedb';
import { getDatabase } from '../utils/database';
import { checkDocumentPermission } from '../utils/permissions';
import { checkDocumentPermissionViaShareDB } from '../utils/sharedb-query-helper';
import { getValidatedDocumentData } from '../utils/type-guards';

/**
 * @summary Type definition for a ShareDB document stored in MongoDB.
 * @private
 */
export type ShareDBDocument = {
  d: string;
  _v: number;
  data: SharedDocument;
  create?: {
    data: SharedDocument;
  };
};

const router: Router = Router();

/**
 * @summary Creates a new document.
 * @route POST /api/documents
 * @param req.body - The document creation data.
 * @returns A 201 response with the created document, or an error response.
 */
router.post('/', authenticate, async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { title, content } = req.body;

  // Validate input
  if (!title || typeof title !== 'string') {
    return res.status(400).json({ message: 'Title is required' });
  }

  if (!content || typeof content !== 'string') {
    return res.status(400).json({ message: 'Content is required' });
  }

  try {
    const shareDBService = initializeShareDB();
    const connection = shareDBService.createAuthenticatedConnection(
      req.user.sub,
      req.user.email,
      req.user.role,
    );

    // Generate a unique document ID
    const docId = `doc_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2)}`;
    const doc = connection.get('documents', docId);

    const now = new Date().toISOString();
    const documentData: SharedDocument = {
      id: docId,
      title,
      content,
      acl: {
        owner: req.user.sub,
        editors: [],
        viewers: [],
      },
      createdAt: now,
      updatedAt: now,
    };

    return new Promise<void>((resolve) => {
      doc.create(documentData, (err?: Error) => {
        if (err) {
          console.error('Failed to create document:', err);
          res.status(500).json({ message: 'Failed to create document' });
          resolve();
          return;
        }

        res.status(201).json(documentData);
        resolve();
      });
    });
  } catch (error) {
    console.error('Failed to create document:', error);
    return res.status(500).json({ message: 'Failed to create document' });
  }
});

/**
 * @summary Gets the permissions for the current user on a specific document.
 * @route GET /api/documents/:id/permissions
 * @param req.params.id - The ID of the document.
 * @returns A 200 response with the user's permissions, or an error response.
 */
router.get(
  '/:id/permissions',
  authenticate,
  async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.params;

    if (!id || id.trim() === '') {
      return res.status(400).json({ message: 'Document ID is required' });
    }

    try {
      const userId = req.user.sub;
      const userEmail = req.user.email;
      const userRole = req.user.role;

      // Use ShareDB-based permission checking to avoid race conditions
      const readResult = await checkDocumentPermissionViaShareDB(
        'documents',
        id,
        userId,
        userEmail,
        userRole,
        'read',
      );
      const writeResult = await checkDocumentPermissionViaShareDB(
        'documents',
        id,
        userId,
        userEmail,
        userRole,
        'write',
      );
      const deleteResult = await checkDocumentPermissionViaShareDB(
        'documents',
        id,
        userId,
        userEmail,
        userRole,
        'delete',
      );

      // If user can't even read, return 403
      if (!readResult.allowed) {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Return permissions object
      return res.json({
        canRead: readResult.allowed,
        canWrite: writeResult.allowed,
        canDelete: deleteResult.allowed,
      });
    } catch (error) {
      console.error('Error fetching document permissions:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },
);

/**
 * @summary Updates the permissions (ACL) for a document.
 * @route PUT /api/documents/:id/permissions
 * @param req.params.id - The ID of the document.
 * @param req.body - The new permissions data.
 * @returns A 200 response with a success message, or an error response.
 */
router.put(
  '/:id/permissions',
  authenticate,
  async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.params;
    console.log('Update permissions for document ID:', id);
    const { editors = [], viewers = [] } = req.body;

    if (!id) {
      return res.status(400).json({ message: 'Document ID is required' });
    }

    // Validate input
    if (!Array.isArray(editors) || !Array.isArray(viewers)) {
      return res
        .status(400)
        .json({ message: 'Editors and viewers must be arrays' });
    }

    // Use ShareDB to fetch the document, check permissions, and update ACL in one atomic operation
    const shareDBService = initializeShareDB();
    const connection = shareDBService.createAuthenticatedConnection(
      req.user.sub,
      req.user.email,
      req.user.role,
    );
    const doc = connection.get('documents', id);

    return new Promise<void>((resolve) => {
      doc.fetch((err?: Error) => {
        if (err) {
          console.error(
            'Failed to fetch document for permissions update:',
            err,
          );
          res.status(500).json({ message: 'Failed to fetch document' });
          resolve();
          return;
        }

        if (!doc.data) {
          res.status(404).json({ message: 'Document not found' });
          resolve();
          return;
        }

        // Now, check for ownership
        const documentData = getValidatedDocumentData(doc.data);
        if (!documentData) {
          res.status(500).json({ message: 'Invalid document data' });
          resolve();
          return;
        }

        const isOwner = documentData.acl.owner === req.user?.sub;
        const isAdmin = req.user?.role === 'admin';

        if (!isOwner && !isAdmin) {
          res
            .status(403)
            .json({ message: 'Only owners or admins can change permissions' });
          resolve();
          return;
        }

        // Proceed with the update
        const op: Op[] = [
          { p: ['acl', 'editors'], od: documentData.acl.editors, oi: editors },
          { p: ['acl', 'viewers'], od: documentData.acl.viewers, oi: viewers },
          {
            p: ['updatedAt'],
            od: documentData.updatedAt,
            oi: new Date().toISOString(),
          },
        ];

        doc.submitOp(op, (submitErr) => {
          if (submitErr) {
            console.error('Failed to update permissions:', submitErr);
            res.status(500).json({ message: 'Failed to update permissions' });
            resolve();
            return;
          }

          res.json({ message: 'Permissions updated successfully' });
          resolve();
        });
      });
    });
  },
);

/**
 * @summary Gets a specific document by its ID.
 * @route GET /api/documents/:id
 * @param req.params.id - The ID of the document.
 * @returns A 200 response with the document data, or an error response.
 */
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { id } = req.params;

  if (!id || id.trim() === '') {
    return res.status(400).json({ message: 'Document ID is required' });
  }

  // Reject IDs that match route names (security measure)
  if (id === 'permissions') {
    return res.status(400).json({ message: 'Document ID is required' });
  }

  // Check permissions
  const hasPermission = await checkDocumentPermission(
    'documents',
    id,
    req.user.sub,
    'read',
  );

  if (!hasPermission && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const shareDBService = initializeShareDB();
  const connection = shareDBService.createAuthenticatedConnection(
    req.user.sub,
    req.user.email,
    req.user.role,
  );
  const doc = connection.get('documents', id);

  return new Promise<void>((resolve) => {
    doc.fetch((err?: Error) => {
      if (err) {
        console.error('Failed to fetch document:', err);
        res.status(500).json({ message: 'Failed to fetch document' });
        resolve();
        return;
      }

      if (!doc.data) {
        res.status(404).json({ message: 'Document not found' });
        resolve();
        return;
      }

      res.json(doc.data);
      resolve();
    });
  });
});

/**
 * @summary Updates a document's metadata.
 * @remarks This route only updates the document's metadata (e.g., title).
 * The content is updated via ShareDB.
 * @route PATCH /api/documents/:id
 * @param req.params.id - The ID of the document.
 * @param req.body - The new metadata.
 * @returns A 200 response with a success message, or an error response.
 */
router.patch('/:id', async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { id } = req.params;
  const { title } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'Document ID is required' });
  }

  if (!validateUpdateDocumentRequest({ title })) {
    return res.status(400).json({ message: 'Invalid request body' });
  }

  // Check permissions
  const hasPermission = await checkDocumentPermission(
    'documents',
    id,
    req.user.sub,
    'write',
  );

  if (!hasPermission && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const shareDBService = initializeShareDB();
  const connection = shareDBService.createAuthenticatedConnection(
    req.user.sub,
    req.user.email,
    req.user.role,
  );
  const doc = connection.get('documents', id);

  return new Promise<void>((resolve) => {
    doc.fetch((err?: Error) => {
      if (err) {
        console.error('Failed to fetch document:', err);
        res.status(500).json({ message: 'Failed to fetch document' });
        resolve();
        return;
      }

      if (!doc.data) {
        res.status(404).json({ message: 'Document not found' });
        resolve();
        return;
      }

      // Update title and updatedAt timestamp
      const validatedDoc = getValidatedDocumentData(doc.data);
      if (!validatedDoc) {
        res.status(500).json({ message: 'Invalid document data' });
        resolve();
        return;
      }

      const op: Op[] = [
        { p: ['title'], od: validatedDoc.title, oi: title },
        {
          p: ['updatedAt'],
          od: validatedDoc.updatedAt,
          oi: new Date().toISOString(),
        },
      ];

      doc.submitOp(op, (submitErr) => {
        if (submitErr) {
          console.error('Failed to update document:', submitErr);
          res.status(500).json({ message: 'Failed to update document' });
          resolve();
          return;
        }

        res.json({ message: 'Document updated successfully' });
        resolve();
      });
    });
  });
});

/**
 * @summary Deletes a document.
 * @route DELETE /api/documents/:id
 * @param req.params.id - The ID of the document.
 * @returns A 204 response, or an error response.
 */
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: 'Document ID is required' });
  }

  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Only owners and admins can delete documents
  const db: Db = getDatabase();
  const collection = db.collection<ShareDBDocument>('o_documents');
  const docData = await collection.findOne({ d: id });

  if (!docData) {
    return res.status(404).json({ message: 'Document not found' });
  }

  const isOwner = docData.data.acl.owner === req.user.sub;
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    return res
      .status(403)
      .json({ message: 'Only owners can delete documents' });
  }

  const shareDBService = initializeShareDB();
  const connection = shareDBService.createAuthenticatedConnection(
    req.user.sub,
    req.user.email,
    req.user.role,
  );
  const doc = connection.get('documents', id);

  return new Promise<void>((resolve) => {
    doc.del((err?: Error) => {
      if (err) {
        console.error('Failed to delete document:', err);
        res.status(500).json({ message: 'Failed to delete document' });
        resolve();
        return;
      }

      res.status(204).send();
      resolve();
    });
  });
});

export default router;
