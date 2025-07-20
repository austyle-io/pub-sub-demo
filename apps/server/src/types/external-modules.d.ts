/**
 * Type declarations for external modules without TypeScript definitions.
 * These are based on runtime usage and library documentation.
 */

declare module 'sharedb' {
  import type { EventEmitter } from 'node:events';
  import type { Duplex } from 'node:stream';

  type Middleware = (context: unknown, next: (err?: Error) => void) => void;

  class ShareDB extends EventEmitter {
    constructor(options?: {
      db?: unknown;
      pubsub?: unknown;
      milestoneDb?: unknown;
    });
    
    use(action: string, fn: Middleware): void;
    listen(stream: Duplex, req?: unknown): void;
    connect(): Connection;
  }

  class Connection extends EventEmitter {
    get(collection: string, id: string): Doc;
  }

  class Doc extends EventEmitter {
    data: unknown;
    id: string;
    collection: string;
    version: number;
    type: string | null;

    create(data: unknown, callback?: (err?: Error) => void): void;
    create(data: unknown, type: string, callback?: (err?: Error) => void): void;
    fetch(callback?: (err?: Error) => void): void;
    del(callback?: (err?: Error) => void): void;
    submitOp(op: unknown[], callback?: (err?: Error) => void): void;
    subscribe(callback?: (err?: Error) => void): void;
    unsubscribe(callback?: (err?: Error) => void): void;
  }

  export = ShareDB;
}

declare module 'sharedb-mongo' {
  function ShareDBMongo(url: string): unknown;
  export = ShareDBMongo;
}

declare module '@teamwork/websocket-json-stream' {
  import { Duplex } from 'node:stream';
  import { WebSocket } from 'ws';

  class WebSocketJSONStream extends Duplex {
    constructor(ws: WebSocket);
  }

  export = WebSocketJSONStream;
}