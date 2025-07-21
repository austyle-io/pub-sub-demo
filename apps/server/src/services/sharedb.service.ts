import type { Server } from 'node:http';
import type { Duplex } from 'node:stream';

import WebSocketJSONStream from '@teamwork/websocket-json-stream';
import ShareDB from 'sharedb';
import ShareDBMongo from 'sharedb-mongo';
import { type WebSocket, WebSocketServer } from 'ws';
import type { AuthenticatedRequest } from '../middleware/websocket-auth';
import { checkDocumentPermission } from '../utils/permissions';
import {
  hasUserIdAndRole,
  isAuthenticatedRequest,
  isShareDBContext,
} from '../utils/type-guards';

let shareDBService: ShareDBService;

// Create typed wrappers for untyped modules
const createShareDB = (options?: { db?: unknown }) => {
  // ShareDB constructor returns an instance
  return new ShareDB(options);
};

const createMongoAdapter = (url: string): unknown => {
  // ShareDBMongo returns a database adapter
  return ShareDBMongo(url);
};

const createWebSocketStream = (ws: WebSocket): Duplex => {
  // WebSocketJSONStream extends Duplex
  return new WebSocketJSONStream(ws) satisfies Duplex;
};

/**
 * Service to configure and attach ShareDB for real-time document collaboration.
 */
export class ShareDBService {
  private backend: InstanceType<typeof ShareDB>;
  private wss: WebSocketServer;

  constructor() {
    // Initialize ShareDB with MongoDB
    const mongoUrl =
      process.env.MONGO_URL ?? 'mongodb://localhost:27017/collab_demo';
    this.backend = createShareDB({
      db: createMongoAdapter(mongoUrl),
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
    this.backend.use(
      'connect',
      (context: unknown, next: (err?: Error) => void) => {
        if (!isShareDBContext(context)) {
          return next(new Error('Invalid ShareDB context'));
        }

        const ctx = context; // Now safely typed as Context
        if (ctx.req && 'user' in ctx.req && ctx.agent.custom) {
          if (!isAuthenticatedRequest(ctx.req)) {
            return next(new Error('Invalid authenticated request'));
          }

          const authenticatedReq = ctx.req;
          if (authenticatedReq.user) {
            ctx.agent.custom = {
              userId: authenticatedReq.user.id,
              email: authenticatedReq.user.email,
              role: authenticatedReq.user.role,
            };
          }
        }
        next();
      },
    );

    // Submit middleware - check write permissions
    this.backend.use(
      'submit',
      async (context: unknown, next: (err?: Error) => void) => {
        if (!isShareDBContext(context)) {
          return next(new Error('Invalid ShareDB context'));
        }

        const ctx = context; // Now safely typed as Context
        const customData = ctx.agent.custom;

        if (!hasUserIdAndRole(customData)) {
          return next(new Error('Unauthorized: Invalid user data'));
        }

        const { userId, role } = customData;

        if (!userId) {
          return next(new Error('Unauthorized: No user ID'));
        }

        // Admins can edit anything
        if (role === 'admin') {
          return next();
        }

        // Check document permissions
        const hasPermission = await checkDocumentPermission(
          ctx.collection,
          ctx.id,
          userId,
          'write',
        );

        if (!hasPermission) {
          return next(new Error('Unauthorized: No write permission'));
        }

        next();
      },
    );

    // Read middleware - check read permissions
    this.backend.use(
      'readSnapshots',
      async (context: unknown, next: (err?: Error) => void) => {
        if (!isShareDBContext(context)) {
          return next(new Error('Invalid ShareDB context'));
        }

        const ctx = context; // Now safely typed as Context
        const customData = ctx.agent.custom;

        if (!hasUserIdAndRole(customData)) {
          return next(new Error('Unauthorized: Invalid user data'));
        }

        const { userId, role } = customData;

        if (!userId) {
          return next(new Error('Unauthorized: No user ID'));
        }

        // Admins can read anything
        if (role === 'admin') {
          return next();
        }

        // Check document permissions for each snapshot
        const snapshots = ctx.snapshots ?? [];
        for (const snapshot of snapshots) {
          const hasPermission = await checkDocumentPermission(
            ctx.collection,
            snapshot.id,
            userId,
            'read',
          );

          if (!hasPermission) {
            return next(new Error('Unauthorized: No read permission'));
          }
        }

        next();
      },
    );
  }

  /**
   * Attach the WebSocket server to the given HTTP server, with auth upgrade handling.
   * @param server HTTP server instance to upgrade
   */
  attachToServer(server: Server): void {
    // Handle WebSocket upgrade with authentication
    server.on('upgrade', (request, socket, head) => {
      // For now, we'll handle auth in the connection handler
      this.wss.handleUpgrade(request, socket, head, (ws) => {
        this.wss.emit('connection', ws, request);
      });
    });

    // Handle WebSocket connections
    this.wss.on('connection', (ws: WebSocket, req: AuthenticatedRequest) => {
      const stream = createWebSocketStream(ws);
      this.backend.listen(stream, req);
    });
  }

  /**
   * Access the underlying ShareDB backend instance.
   * @returns configured ShareDB backend
   */
  getShareDB() {
    return this.backend;
  }
}

export function initializeShareDB(): ShareDBService {
  if (!shareDBService) {
    shareDBService = new ShareDBService();
  }
  return shareDBService;
}

export function getShareDB() {
  if (!shareDBService) {
    throw new Error('ShareDB service has not been initialized');
  }
  return shareDBService.getShareDB();
}
