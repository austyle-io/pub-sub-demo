import { isFunction, isNil, isObject, isString } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import ReconnectingWebSocketLib from 'reconnecting-websocket';
import { Connection } from 'sharedb/lib/client';
import { useAuth } from '../contexts/AuthContext';

// ShareDB Document type with proper typing
type ShareDBDocument = {
  data: { content?: string };
  on(event: string, callback: (...args: unknown[]) => void): void;
  submitOp(op: unknown[]): void;
  destroy(): void;
};

// Type guard for ShareDB document data
export const isDocumentData = (data: unknown): data is { content?: string } => {
  if (!isObject(data)) return false;
  const obj = data as Record<string, unknown>;
  return isNil(obj['content']) || isString(obj['content']);
};

// Type guard for ShareDB document
const isShareDBDocument = (doc: unknown): doc is ShareDBDocument => {
  if (!isObject(doc)) return false;
  const obj = doc as Record<string, unknown>;
  return (
    'data' in obj &&
    'on' in obj &&
    isFunction(obj['on']) &&
    'submitOp' in obj &&
    isFunction(obj['submitOp']) &&
    'destroy' in obj &&
    isFunction(obj['destroy'])
  );
};

export function useShareDB(docId: string) {
  const [doc, setDoc] = useState<ShareDBDocument | null>(null);
  const connectionRef = useRef<Connection | null>(null);
  const { accessToken } = useAuth();

  useEffect(() => {
    if (!accessToken) return;

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

    return () => {
      sdbDoc.destroy();
      connection.close();
    };
  }, [docId, accessToken]);

  return doc;
}
