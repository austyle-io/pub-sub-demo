import { EventEmitter } from 'node:events';
import { logAuditEvent } from './audit-logger';

/**
 * Event-Based Consistency System for ShareDB Operations
 *
 * This system provides a robust alternative to direct MongoDB queries by listening
 * to ShareDB operation completion events and providing consistency guarantees.
 *
 * Key benefits:
 * - Eliminates race conditions between ShareDB and MongoDB
 * - Provides real-time notifications of document changes
 * - Enables reactive programming patterns for document state
 * - Supports caching invalidation strategies
 */

/**
 * Type definition for document change event.
 * @since 1.0.0
 */
export interface DocumentChangeEvent {
  collection: string;
  docId: string;
  operation: 'create' | 'update' | 'delete';
  userId: string;
  timestamp: string;
  changes?: Record<string, unknown>;
}

/**
 * Type definition for permission change event.
 * @since 1.0.0
 */
export interface PermissionChangeEvent extends DocumentChangeEvent {
  operation: 'update';
  permissionChanges: {
    oldAcl?: {
      owner: string;
      editors: string[];
      viewers: string[];
    };
    newAcl: {
      owner: string;
      editors: string[];
      viewers: string[];
    };
  };
}

class DocumentEventSystem extends EventEmitter {
  private static instance: DocumentEventSystem;

  static getInstance(): DocumentEventSystem {
    if (!DocumentEventSystem.instance) {
      DocumentEventSystem.instance = new DocumentEventSystem();
    }
    return DocumentEventSystem.instance;
  }

  /**
   * Emit a document change event
   */
  emitDocumentChange(event: DocumentChangeEvent): void {
    this.emit('document:change', event);
    this.emit(`document:${event.operation}`, event);
    this.emit(`document:${event.collection}:${event.docId}`, event);

    // Log for audit purposes
    logAuditEvent({
      userId: event.userId,
      action: event.operation,
      resource: 'document',
      resourceId: event.docId,
      result: 'allowed',
      reason: 'Operation completed via ShareDB',
    });
  }

  /**
   * Emit a permission change event
   */
  emitPermissionChange(event: PermissionChangeEvent): void {
    this.emit('permission:change', event);
    this.emit(`permission:${event.collection}:${event.docId}`, event);

    // Log permission changes for audit
    logAuditEvent({
      userId: event.userId,
      action: 'update_permissions',
      resource: 'document',
      resourceId: event.docId,
      result: 'allowed',
      reason: 'ACL updated via ShareDB',
    });
  }

  /**
   * Wait for a specific document operation to complete
   * This provides consistency guarantees for critical operations
   */
  waitForOperation(
    collection: string,
    docId: string,
    operation: 'create' | 'update' | 'delete',
    timeoutMs = 5000,
  ): Promise<DocumentChangeEvent> {
    return new Promise((resolve, reject) => {
      const eventName = `document:${collection}:${docId}`;
      const timeout = setTimeout(() => {
        this.removeListener(eventName, handler);
        reject(
          new Error(
            `Timeout waiting for ${operation} operation on ${collection}:${docId}`,
          ),
        );
      }, timeoutMs);

      const handler = (event: DocumentChangeEvent) => {
        if (event.operation === operation) {
          clearTimeout(timeout);
          this.removeListener(eventName, handler);
          resolve(event);
        }
      };

      this.on(eventName, handler);
    });
  }

  /**
   * Subscribe to permission changes for a specific document
   */
  onPermissionChange(
    collection: string,
    docId: string,
    handler: (event: PermissionChangeEvent) => void,
  ): () => void {
    const eventName = `permission:${collection}:${docId}`;
    this.on(eventName, handler);

    // Return unsubscribe function
    return () => this.removeListener(eventName, handler);
  }

  /**
   * Subscribe to all document changes (useful for caching invalidation)
   */
  onDocumentChange(handler: (event: DocumentChangeEvent) => void): () => void {
    this.on('document:change', handler);

    // Return unsubscribe function
    return () => this.removeListener('document:change', handler);
  }
}

/**
 * document Events.
 * @since 1.0.0
 */
export const documentEvents = DocumentEventSystem.getInstance();

/**
 * Helper function to manually emit document change events
 *
 * Since ShareDB context types are not fully compatible, we'll provide
 * a manual event emission system that can be called from route handlers
 * when operations complete.
 */
export function emitDocumentChangeEvent(
  collection: string,
  docId: string,
  operation: 'create' | 'update' | 'delete',
  userId: string,
  changes?: Record<string, unknown>,
): void {
  documentEvents.emitDocumentChange({
    collection,
    docId,
    operation,
    userId,
    timestamp: new Date().toISOString(),
    changes,
  });
}

/**
 * Helper function to manually emit permission change events
 */
export function emitPermissionChangeEvent(
  collection: string,
  docId: string,
  userId: string,
  newAcl: {
    owner: string;
    editors: string[];
    viewers: string[];
  },
  oldAcl?: {
    owner: string;
    editors: string[];
    viewers: string[];
  },
): void {
  const permissionEvent: PermissionChangeEvent = {
    collection,
    docId,
    operation: 'update',
    userId,
    timestamp: new Date().toISOString(),
    permissionChanges: {
      oldAcl,
      newAcl,
    },
  };

  documentEvents.emitPermissionChange(permissionEvent);
}
