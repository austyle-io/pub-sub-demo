import { randomUUID } from 'node:crypto';
import {
  type Document,
  validateCreateDocumentRequest,
  validateUpdateDocumentRequest,
} from '@collab-edit/shared';
import { type Request, type Response, Router } from 'express';
import type { Db } from 'mongodb';
import { authenticate } from '../middleware/passport';
import { getShareDB, initializeShareDB } from '../services/sharedb.service';
import type { Op } from '../types/sharedb';
import { getDatabase } from '../utils/database';
import { checkDocumentPermission } from '../utils/permissions';
import { getValidatedDocumentData, isDocumentData } from '../utils/type-guards';

// Type for ShareDB documents stored in MongoDB
type ShareDBDocument = {
  _id: string;
  _v: number;
  _type: string;
  data: Document;
};

const router: Router = Router();

/**
 * Create a new document
 */
router.post('/', authenticate, async (req: Request, res: Response) => {
  const { title, content = '' } = req.body;

  if (!validateCreateDocumentRequest({ title, content })) {
    return res.status(400).json({ message: 'Invalid request body' });
  }

  const shareDBService = initializeShareDB();
  // Create connection with user context
  const connection = shareDBService.createAuthenticatedConnection(
    req.user.sub,
    req.user.email,
    req.user.role
  );
  const id = randomUUID();
  const doc = connection.get('documents', id);

  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const now = new Date().toISOString();
  const documentData: Document = {
    id,
    title,
    content,
    acl: {
      owner: req.user.sub,
      editors: [req.user.sub],
      viewers: [req.user.sub],
    },
    createdAt: now,
    updatedAt: now,
  };

  return new Promise<void>((resolve) => {
    doc.create(documentData, (err) => {
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
});

/**
 * List all documents the user has access to
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const db: Db = getDatabase();
    const collection = db.collection('o_documents');

    console.log('List documents for user:', req.user.sub);

    // Find documents where user is owner, editor, or viewer
    // ShareDB stores initial data in 'create.data' field
    const query =
      req.user.role === 'admin'
        ? {} // Admins can see all documents
        : {
            $or: [
              { 'create.data.acl.owner': req.user.sub },
              { 'create.data.acl.editors': req.user.sub },
              { 'create.data.acl.viewers': req.user.sub },
            ],
          };

    const documents = await collection
      .find(query)
      .project({
        _id: 0,
        'create.data.id': 1,
        'create.data.title': 1,
        'create.data.createdAt': 1,
        'create.data.updatedAt': 1,
        'create.data.acl.owner': 1,
      })
      .toArray();
    
    console.log('Found documents:', documents.length);

    // Transform the ShareDB document format to our API format
    const formattedDocs = documents.map((doc: any) => {
      try {
        // ShareDB stores initial data in 'create.data' field
        const docData = doc.create?.data;
        
        if (!docData) {
          console.error('No doc.create.data in:', JSON.stringify(doc));
          return null;
        }

        const validatedDoc = getValidatedDocumentData(docData);

        if (!validatedDoc) {
          console.error('Failed to validate doc data:', JSON.stringify(docData));
          return null;
        }

        return validatedDoc;
      } catch (err) {
        console.error('Error transforming document:', err, JSON.stringify(doc));
        return null;
      }
    }).filter(doc => doc !== null);

    console.log('Returning', formattedDocs.length, 'documents');
    return res.json(formattedDocs);
  } catch (error) {
    console.error('Failed to list documents:', error);
    return res.status(500).json({ message: 'Failed to list documents' });
  }
});

/**
 * Get a specific document by ID
 */
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { id } = req.params;
  if (!id) {
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
    req.user.role
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
 * Update a document (metadata only, not content - content is updated via ShareDB)
 */
router.patch('/:id', authenticate, async (req: Request, res: Response) => {
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
    req.user.role
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
 * Delete a document
 */
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: 'Document ID is required' });
  }

  // Only owners and admins can delete documents
  const db: Db = getDatabase();
  const collection = db.collection<ShareDBDocument>('o_documents');
  const docData = await collection.findOne({ 'data.id': id });

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
    req.user.role
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

/**
 * Get document permissions for current user
 */
router.get(
  '/:id/permissions',
  authenticate,
  async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'Document ID is required' });
    }

    try {
      const userId = req.user.sub;

      // Check each permission level
      const readResult = await checkDocumentPermission(
        'documents',
        id,
        userId,
        'read',
      );
      const writeResult = await checkDocumentPermission(
        'documents',
        id,
        userId,
        'write',
      );
      const deleteResult = await checkDocumentPermission(
        'documents',
        id,
        userId,
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
 * Update document permissions (ACL)
 */
router.put(
  '/:id/permissions',
  authenticate,
  async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.params;
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

    // Only owners and admins can change permissions
    const db: Db = getDatabase();
    const collection = db.collection<ShareDBDocument>('o_documents');
    const docData = await collection.findOne({ d: id });

    if (!docData) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // ShareDB stores data in create.data initially
    const documentData = docData.create?.data || docData.data;
    const isOwner = documentData?.acl?.owner === req.user.sub;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ message: 'Only owners can change permissions' });
    }

    const shareDB = getShareDB();
    const connection = shareDB.connect();
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

        // Update ACL
        const validatedDoc = getValidatedDocumentData(doc.data);
        if (!validatedDoc) {
          res.status(500).json({ message: 'Invalid document data' });
          resolve();
          return;
        }

        const op: Op[] = [
          { p: ['acl', 'editors'], od: validatedDoc.acl.editors, oi: editors },
          { p: ['acl', 'viewers'], od: validatedDoc.acl.viewers, oi: viewers },
          {
            p: ['updatedAt'],
            od: validatedDoc.updatedAt,
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

export default router;
