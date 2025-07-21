import { isFunction, isNil, isObject, isString } from "lodash";
import { useEffect, useRef, useState } from "react";
import ReconnectingWebSocketLib from "reconnecting-websocket";
import { Connection } from "sharedb/lib/client";
import { useAuth } from "../contexts/AuthContext";

// ShareDB Document type with proper typing
type ShareDBDocument = {
  data: unknown;
  on(event: string, callback: (...args: unknown[]) => void): void;
  submitOp(op: unknown[]): void;
  destroy(): void;
};

// Type guard for ShareDB document data
export const isDocumentData = (data: unknown): data is { content?: string } => {
  return (
    isObject(data) &&
    (isNil((data as any).content) || isString((data as any).content))
  );
};

// Type guard for ShareDB document
const isShareDBDocument = (doc: unknown): doc is ShareDBDocument => {
  return (
    isObject(doc) &&
    "data" in doc &&
    "on" in doc &&
    isFunction((doc as Record<string, unknown>)["on"]) &&
    "submitOp" in doc &&
    isFunction((doc as Record<string, unknown>)["submitOp"]) &&
    "destroy" in doc &&
    isFunction((doc as Record<string, unknown>)["destroy"])
  );
};

export function useShareDB(docId: string) {
  const [doc, setDoc] = useState<ShareDBDocument | null>(null);
  const connectionRef = useRef<Connection | null>(null);
  const { accessToken } = useAuth();

  useEffect(() => {
    if (!accessToken) return;

    const socket = new ReconnectingWebSocketLib("ws://localhost:3001");
    // ShareDB Connection expects a WebSocket-like interface
    // ReconnectingWebSocket implements this interface but we need to cast it
    const connection = new Connection(socket as any);
    connectionRef.current = connection;

    const sdbDoc = connection.get("documents", docId);
    sdbDoc.subscribe((err) => {
      if (err) {
        console.error(err);
        return;
      }

      // Validate the document before setting it
      if (isShareDBDocument(sdbDoc)) {
        setDoc(sdbDoc);
      } else {
        console.error("Invalid ShareDB document received");
      }
    });

    return () => {
      sdbDoc.destroy();
      connection.close();
    };
  }, [docId, accessToken]);

  return doc;
}
