import isFunction from 'lodash.isfunction';
import isNil from 'lodash.isnil';
import isObject from 'lodash.isobject';
import isString from 'lodash.isstring';
import { useEffect, useRef, useState } from 'react';
import ReconnectingWebSocketLib from 'reconnecting-websocket';
import { Connection } from 'sharedb/lib/client';
import { useAuth } from '../contexts/AuthContext';
import { cookieManager } from '../utils/cookie-manager';

/**
 * @summary Represents a ShareDB document with typed data and methods.
 * @private
 */
type ShareDBDocument = {
  data: { content?: string; title?: string; [key: string]: unknown };
  on(event: string, callback: (...args: unknown[]) => void): void;
  removeListener(event: string, callback: (...args: unknown[]) => void): void;
  submitOp(op: unknown[], callback?: (err?: Error) => void): void;
  destroy(): void;
};

/**
 * @summary Type guard to check if an object has the expected data structure for a document.
 * @param data - The unknown data to validate.
 * @returns `true` if the data is a valid document data object, `false` otherwise.
 * @since 1.0.0
 */
export const isDocumentData = (data: unknown): data is { content?: string } => {
  if (!isObject(data)) return false;
  const obj = data as Record<string, unknown>;
  return isNil(obj['content']) || isString(obj['content']);
};

/**
 * @summary Type guard to validate the structure of a ShareDB document object.
 * @description Checks for the presence and correct type of essential ShareDB document properties.
 * @param doc - The unknown object to validate.
 * @returns `true` if the object is a valid ShareDB document, `false` otherwise.
 * @private
 */
const isShareDBDocument = (doc: unknown): doc is ShareDBDocument => {
  if (!isObject(doc)) return false;
  const obj = doc as Record<string, unknown>;
  return (
    'data' in obj &&
    'on' in obj &&
    isFunction(obj['on']) &&
    'removeListener' in obj &&
    isFunction(obj['removeListener']) &&
    'submitOp' in obj &&
    isFunction(obj['submitOp']) &&
    'destroy' in obj &&
    isFunction(obj['destroy'])
  );
};

/**
 * @summary A React hook to connect to and interact with a ShareDB document.
 * @remarks
 * This hook manages the lifecycle of a ShareDB connection for a specific document.
 * It handles WebSocket connection, authentication via secure cookies, and document
 * subscription. The hook returns the live ShareDB document object, which updates
 * in real-time.
 *
 * Authentication is handled by setting a secure, HttpOnly cookie with the access
 * token, which is then read by the server during the WebSocket upgrade request.
 * This avoids exposing the token in URL query parameters.
 *
 * @param docId - The ID of the ShareDB document to subscribe to.
 * @returns The ShareDB document object, or `null` if the connection is not yet
 * established or an error occurs.
 * @since 1.0.0
 *
 * @example
 * '''tsx
 * import { useShareDB } from './useShareDB';
 *
 * const MyDocumentEditor = ({ docId }) => {
 *   const doc = useShareDB(docId);
 *
 *   if (!doc) {
 *     return <div>Loading document...</div>;
 *   }
 *
 *   return <textarea value={doc.data.content} />;
 * };
 * '''
 */
export function useShareDB(docId: string) {
  const [doc, setDoc] = useState<ShareDBDocument | null>(null);
  const connectionRef = useRef<Connection | null>(null);
  const { accessToken } = useAuth();

  useEffect(() => {
    if (!accessToken) return;

    // Set secure cookie for WebSocket authentication using modern Cookie Store API
    // This prevents token exposure in server access logs while maintaining security
    const setupWebSocketAuth = async () => {
      await cookieManager.setWebSocketToken(accessToken);

      // Create WebSocket connection without query parameters (secure)
      const socket = new ReconnectingWebSocketLib('ws://localhost:3001');

      // ShareDB Connection expects a specific Socket interface
      // We need to cast to the proper type since ReconnectingWebSocket is compatible
      const connection = new Connection(socket as never);
      connectionRef.current = connection;

      const sdbDoc = connection.get('documents', docId);
      sdbDoc.subscribe((err) => {
        if (err) {
          console.error(err);
          return;
        }

        // Validate the document before setting it
        if (isShareDBDocument(sdbDoc)) {
          setDoc(sdbDoc);
        } else {
          console.error('Invalid ShareDB document received');
        }
      });
    };

    setupWebSocketAuth().catch(console.error);

    return () => {
      if (connectionRef.current) {
        connectionRef.current.close();
      }
      // Clear the WebSocket token cookie on cleanup using secure cookie manager
      cookieManager.clearWebSocketToken().catch(console.error);
    };
  }, [docId, accessToken]);

  return doc;
}
