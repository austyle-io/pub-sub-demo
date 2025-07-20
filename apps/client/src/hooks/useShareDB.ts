import { useState, useEffect, useRef } from 'react';
import { Connection } from 'sharedb/lib/client';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { Document } from 'sharedb';

export function useShareDB(docId: string) {
  const [doc, setDoc] = useState<Document | null>(null);
  const connectionRef = useRef<Connection | null>(null);

  useEffect(() => {
    const socket = new ReconnectingWebSocket('ws://localhost:3001');
    const connection = new Connection(socket);
    connectionRef.current = connection;

    const sdbDoc = connection.get('documents', docId);
    sdbDoc.subscribe((err) => {
      if (err) {
        console.error(err);
        return;
      }
      setDoc(sdbDoc);
    });

    return () => {
      sdbDoc.destroy();
      connection.close();
    };
  }, [docId]);

  return doc;
}
