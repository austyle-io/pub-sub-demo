// biome-ignore lint/suspicious/noExplicitAny: External library type definitions require any types
declare module 'sharedb' {
  import { EventEmitter } from 'node:events';

  interface ShareDBOptions {
    db?: any;
    pubsub?: any;
    milestoneDb?: any;
  }

  interface Agent {
    custom?: any;
    backend: ShareDB;
    src: string;
    clientId: string;
  }

  interface Context {
    agent: Agent;
    collection: string;
    id: string;
    op?: any;
    data?: any;
    req?: any;
    snapshots?: any[];
  }

  type Middleware = (context: Context, next: (err?: Error) => void) => void;

  class ShareDB extends EventEmitter {
    constructor(options?: ShareDBOptions);
    use(action: string, fn: Middleware): void;
    listen(stream: any, req?: any): void;
    connect(): Connection;
  }

  class Connection extends EventEmitter {
    get(collection: string, id: string): Doc;
  }

  class Doc extends EventEmitter {
    data: any;
    id: string;
    collection: string;

    create(data: any, callback?: (err: Error) => void): void;
    create(data: any, type: string, callback?: (err: Error) => void): void;
    fetch(callback?: (err: Error) => void): void;
    del(callback?: (err: Error) => void): void;
    submitOp(op: any, callback?: (err: Error) => void): void;
    subscribe(callback?: (err: Error) => void): void;
    unsubscribe(callback?: (err: Error) => void): void;
    on(event: string, callback: (...args: any[]) => void): this;
  }

  export = ShareDB;
}

declare module 'sharedb-mongo' {
  function ShareDBMongo(url: string): any;
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
