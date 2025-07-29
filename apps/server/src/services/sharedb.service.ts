import type { Server } from 'node:http';
import type { Duplex } from 'node:stream';

import WebSocketJSONStream from '@teamwork/websocket-json-stream';
import ShareDB from 'sharedb';
import ShareDBMongo from 'sharedb-mongo';
import { type WebSocket, WebSocketServer } from 'ws';
import {
  type AuthenticatedRequest,
  authenticateWebSocket,
} from '../middleware/websocket-auth';
import { checkDocumentPermission } from '../utils/permissions';
import {
  getContextSnapshots,
  hasUserIdAndRole,
  isAuthenticatedRequest,
  isShareDBContext,
} from '../utils/type-guards';

/**
 * @summary Singleton instance of the ShareDB service.
 * @private
 */
let shareDBService: ShareDBService;

/**
 * @summary Creates a new ShareDB backend instance with the given options.
 * @param options - ShareDB configuration options.
 * @param options.db - Database adapter instance.
 * @returns A new ShareDB backend instance.
 * @private
 * @since 1.0.0
 */
const createShareDB = (options?: { db?: unknown }) => {
  // ShareDB constructor returns an instance
  return new ShareDB(options);
};

/**
 * @summary Creates a MongoDB adapter for ShareDB.
 * @param url - The MongoDB connection URL.
 * @returns A ShareDB MongoDB adapter instance.
 * @private
 * @since 1.0.0
 */
const createMongoAdapter = (url: string): unknown => {
  // ShareDBMongo returns a database adapter
  return ShareDBMongo(url);
};

/**
 * @summary Creates a WebSocket JSON stream for ShareDB communication.
 * @param ws - The WebSocket connection instance.
 * @returns A Duplex stream for bidirectional data flow.
 * @private
 * @since 1.0.0
 */
const createWebSocketStream = (ws: WebSocket): Duplex => {
  // WebSocketJSONStream extends Duplex
  return new WebSocketJSONStream(ws) satisfies Duplex;
};

/**
 * @summary Service to configure and attach ShareDB for real-time document collaboration.
 * @remarks
 * This service manages the ShareDB backend, WebSocket connections, and middleware
 * for authentication and permission checking in a collaborative editing environment.
 * @example
 * ```typescript
 * const shareDBService = initializeShareDB();
 * shareDBService.attachToServer(httpServer);
 * ```
 * @since 1.0.0
 */
export class ShareDBService {
  /**
   * @summary The ShareDB backend instance for document operations.
   * @private
   */
  private backend: InstanceType<typeof ShareDB>;

  /**
   * @summary The WebSocket server for real-time communication.
   * @private
   */
  private wss: WebSocketServer;

  constructor() {
    // Initialize ShareDB with MongoDB
    const mongoUrl =
      process.env['MONGO_URL'] ?? 'mongodb://localhost:27017/collab_demo';
    this.backend = createShareDB({
      db: createMongoAdapter(mongoUrl),
    });

    // Create WebSocket server
    this.wss = new WebSocketServer({ noServer: true });

    // Configure ShareDB middleware
    this.setupMiddleware();
  }

  /**
   * @summary Registers ShareDB middleware for authentication and permission checks.
   * @remarks
   * Sets up three main middleware handlers:
   * - `connect`: Attaches user information to the ShareDB agent.
   * - `submit`: Validates write permissions before allowing document changes.
   * - `readSnapshots`: Validates read permissions for document access.
   * @private
   * @since 1.0.0
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
        if (ctx.req && 'user' in ctx.req) {
          if (!isAuthenticatedRequest(ctx.req)) {
            return next(new Error('Invalid authenticated request'));
          }

          const authenticatedReq = ctx.req;
          if (authenticatedReq.user) {
            // Initialize custom if it doesn't exist
            if (!ctx.agent.custom) {
              ctx.agent.custom = {};
            }

            ctx.agent.custom = {
              userId: authenticatedReq.user['id'],
              email: authenticatedReq.user['email'],
              role: authenticatedReq.user['role'],
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
          ctx.collection ?? '',
          ctx.id ?? '',
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
        const snapshots = getContextSnapshots(ctx);
        for (const snapshot of snapshots) {
          const hasPermission = await checkDocumentPermission(
            ctx.collection ?? '',
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
   * @summary Attaches the WebSocket server to the given HTTP server, with auth upgrade handling.
   * @remarks
   * This method sets up the WebSocket upgrade handler on the HTTP server, authenticates
   * incoming WebSocket connections, and establishes ShareDB communication streams.
   * @param server - The HTTP server instance to upgrade.
   * @throws Will reject WebSocket connections that fail authentication.
   * @since 1.0.0
   * @example
   * ```typescript
   * const server = http.createServer(app);
   * shareDBService.attachToServer(server);
   * ```
   */
  attachToServer(server: Server): void {
    // Handle WebSocket upgrade with authentication
    server.on('upgrade', async (request, socket, head) => {
      try {
        // Authenticate the WebSocket connection
        const user = await authenticateWebSocket(request);

        // Attach user to request for ShareDB middleware
        (request as AuthenticatedRequest).user = { ...user, sub: user.id };

        // Handle the WebSocket upgrade
        this.wss.handleUpgrade(request, socket, head, (ws) => {
          this.wss.emit('connection', ws, request);
        });
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('WebSocket upgrade error:', error.message);
        } else {
          console.error('WebSocket upgrade error:', error);
        }
        // Authentication failed - reject the connection
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
      }
    });

    // Handle WebSocket connections
    this.wss.on('connection', (ws: WebSocket, req: AuthenticatedRequest) => {
      const stream = createWebSocketStream(ws);
      this.backend.listen(stream, req);
    });
  }

  /**
   * @summary Accesses the underlying ShareDB backend instance.
   * @returns The configured ShareDB backend instance.
   * @since 1.0.0
   * @example
   * ```typescript
   * const backend = shareDBService.getShareDB();
   * const doc = backend.connect().get('documents', 'doc-id');
   * ```
   */
  getShareDB() {
    return this.backend;
  }

  /**
   * @summary Creates a connection with user context for backend operations.
   * @remarks
   * This method creates a ShareDB connection with authenticated user context,
   * allowing backend operations to respect permission checks.
   * @param userId - The unique identifier of the user.
   * @param email - The email address of the user.
   * @param role - The user role (e.g., 'admin', 'user').
   * @returns A ShareDB connection with authenticated context.
   * @since 1.0.0
   * @example
   * ```typescript
   * const connection = shareDBService.createAuthenticatedConnection(
   *   'user-123',
   *   'user@example.com',
   *   'user'
   * );
   * const doc = connection.get('documents', 'doc-id');
   * ```
   */
  createAuthenticatedConnection(userId: string, email: string, role: string) {
    const connection = this.backend.connect();
    // HACK: The `agent` property is not in the ShareDB types, but it is used
    // by the middleware. We use proper typing to access it safely.
    const agent = (
      connection as unknown as { agent?: { custom?: Record<string, unknown> } }
    ).agent;

    // Set custom data on the agent
    if (agent) {
      agent.custom = {
        userId,
        email,
        role,
      };
    }
    return connection;
  }
}

/**
 * @summary Initializes the ShareDB service singleton.
 * @remarks
 * Creates a new ShareDB service instance if one doesn't exist, or returns
 * the existing instance. This ensures a single ShareDB backend is used
 * throughout the application.
 * @returns The ShareDB service instance.
 * @since 1.0.0
 * @example
 * ```typescript
 * // In server initialization
 * const shareDBService = initializeShareDB();
 * shareDBService.attachToServer(httpServer);
 * ```
 */
export const initializeShareDB = (): ShareDBService => {
  if (!shareDBService) {
    shareDBService = new ShareDBService();
  }
  return shareDBService;
};

/**
 * @summary Gets the ShareDB backend instance.
 * @remarks
 * Provides access to the underlying ShareDB backend for direct operations.
 * The ShareDB service must be initialized before calling this function.
 * @returns The ShareDB backend instance.
 * @throws {Error} If the ShareDB service has not been initialized.
 * @since 1.0.0
 * @example
 * ```typescript
 * // Get backend for direct operations
 * const backend = getShareDB();
 * const connection = backend.connect();
 * ```
 * @see {@link initializeShareDB} for initialization.
 */
export const getShareDB = (): InstanceType<typeof ShareDB> => {
  if (!shareDBService) {
    throw new Error('ShareDB service has not been initialized');
  }
  return shareDBService.getShareDB();
};
