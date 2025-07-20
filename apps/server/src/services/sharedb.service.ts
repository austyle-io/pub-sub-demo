import type { Server } from 'node:http';
import type { Socket } from 'node:net';

import WebSocketJSONStream from '@teamwork/websocket-json-stream';
import ShareDB from 'sharedb';
import ShareDBMongo from 'sharedb-mongo';
import { type WebSocket, WebSocketServer } from 'ws';
import {
  type AuthenticatedRequest,
  authenticateWebSocket,
} from '../middleware/websocket-auth';
import { checkDocumentPermission } from '../utils/permissions';
import type { 
  ShareDB as ShareDBType, 
  Context, 
  ShareDBConstructor,
  ShareDBMongoFactory,
  WebSocketJSONStreamConstructor
} from '../types/sharedb';

let shareDBService: ShareDBService;

// Type assertions for untyped modules
const ShareDBClass = ShareDB as unknown as ShareDBConstructor;
const shareDBMongo = ShareDBMongo as unknown as ShareDBMongoFactory;
const WSJSONStream = WebSocketJSONStream as unknown as WebSocketJSONStreamConstructor;

/**
 * Service to configure and attach ShareDB for real-time document collaboration.
 */
export class ShareDBService {
  private backend: ShareDBType;
  private wss: WebSocketServer;

  constructor() {
    // Initialize ShareDB with MongoDB
    const mongoUrl =
      process.env['MONGO_URL'] || 'mongodb://localhost:27017/collab_demo';
    this.backend = new ShareDBClass({
      db: shareDBMongo(mongoUrl),
    });

    // Create WebSocket server
    this.wss = new WebSocketServer({ noServer: true });

    // Configure ShareDB middleware
    this.setupMiddleware();
  }

  /**
   * Register ShareDB middleware for authentication and permission checks.
   */
  private setupMiddleware(): void {
    // Connect middleware - attach user info to agent
    this.backend.use('connect', (context: Context, next) => {
      const req = context.req as AuthenticatedRequest | undefined;
      if (req?.user && context.agent.custom) {
        context.agent.custom = {
          userId: req.user.sub,
          email: req.user.email,
          role: req.user.role,
        };
      }
      next();
    });

    // Submit middleware - check write permissions
    this.backend.use('submit', async (context: Context, next) => {
      const customData = context.agent.custom as { userId?: string; role?: string } | undefined;
      const { userId, role } = customData || {};

      if (!userId) {
        return next(new Error('Unauthorized: No user ID'));
      }

      // Admins can edit anything
      if (role === 'admin') {
        return next();
      }

      // Check document permissions
      const hasPermission = await checkDocumentPermission(
        context.collection,
        context.id,
        userId,
        'write',
      );

      if (!hasPermission) {
        return next(new Error('Unauthorized: No write permission'));
      }

      next();
    });

    // Read middleware - check read permissions
    this.backend.use('readSnapshots', async (context: Context, next) => {
      const customData = context.agent.custom as { userId?: string; role?: string } | undefined;
      const { userId, role } = customData || {};

      if (!userId) {
        return next(new Error('Unauthorized: No user ID'));
      }

      // Admins can read anything
      if (role === 'admin') {
        return next();
      }

      // Check document permissions for each snapshot
      const snapshots = context.snapshots || [];
      for (const snapshot of snapshots) {
        const hasPermission = await checkDocumentPermission(
          context.collection,
          snapshot.id,
          userId,
          'read',
        );

        if (!hasPermission) {
          return next(new Error('Unauthorized: No read permission'));
        }
      }

      next();
    });
  }

  /**
   * Attach the WebSocket server to the given HTTP server, with auth upgrade handling.
   * @param server HTTP server instance to upgrade
   */
  attachToServer(server: Server): void {
    // Handle WebSocket upgrade with authentication
    server.on('upgrade', (request, socket, head) => {
      authenticateWebSocket(
        request,
        socket as Socket,
        head,
        (authenticated) => {
          if (authenticated) {
            this.wss.handleUpgrade(request, socket, head, (ws) => {
              this.wss.emit('connection', ws, request);
            });
          }
        },
      );
    });

    // Handle WebSocket connections
    this.wss.on('connection', (ws: WebSocket, req: AuthenticatedRequest) => {
      const stream = new WSJSONStream(ws);
      this.backend.listen(stream, req);
    });
  }

  /**
   * Access the underlying ShareDB backend instance.
   * @returns configured ShareDB backend
   */
  getShareDB(): ShareDBType {
    return this.backend;
  }
}

export function initializeShareDB(): ShareDBService {
  if (!shareDBService) {
    shareDBService = new ShareDBService();
  }
  return shareDBService;
}

export function getShareDB(): ShareDBType {
  if (!shareDBService) {
    throw new Error('ShareDB service has not been initialized');
  }
  return shareDBService.getShareDB();
}
