import type { EventEmitter } from 'events';
import type { IncomingMessage } from 'http';
import type { Duplex } from 'stream';

/**
 * @summary Defines the types of JSON values that can be stored in ShareDB documents.
 * @since 1.0.0
 */
export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONObject
  | JSONArray;

/**
 * @summary Defines the structure of a JSON object for document data.
 * @since 1.0.0
 */
export type JSONObject = { [key: string]: JSONValue };

/**
 * @summary Defines the structure of a JSON array for document data.
 * @since 1.0.0
 */
export type JSONArray = JSONValue[];

/**
 * @summary Defines the structure of the data stored in a ShareDB document.
 * @since 1.0.0
 */
export type DocumentData = JSONObject;

/**
 * @summary Defines the unique identifier for a ShareDB document.
 * @since 1.0.0
 */
export type DocumentID = string;

/**
 * @summary Defines the name of a ShareDB collection.
 * @since 1.0.0
 */
export type CollectionName = string;

/**
 * @summary Defines the version number for document operations.
 * @since 1.0.0
 */
export type VersionNumber = number;

/**
 * @summary Defines the types of operations that can be performed on a document.
 * @remarks
 * - `create`: Create a new document.
 * - `del`: Delete an existing document.
 * - `op`: Apply an operation to a document.
 * @since 1.0.0
 */
export type OperationType = 'create' | 'del' | 'op';

/**
 * @summary Defines the path to a value within a JSON document.
 * @remarks This is used for operational transform operations.
 * @since 1.0.0
 */
export type Path = ReadonlyArray<string | number>;

/**
 * @summary Defines an operation that adds a number to a numeric value.
 * @since 1.0.0
 */
export type AddNumOp = {
  /** The path to the numeric value. */
  p: Path;
  /** The number to add. */
  na: number;
};

/**
 * @summary Defines an operation that inserts a value at a specified path.
 * @since 1.0.0
 */
export type ObjectInsertOp = {
  /** The path where the value should be inserted. */
  p: Path;
  /** The object or value to insert. */
  oi: JSONValue;
};

/**
 * @summary Defines an operation that deletes a value at a specified path.
 * @since 1.0.0
 */
export type ObjectDeleteOp = {
  /** The path to the value to delete. */
  p: Path;
  /** The object or value being deleted (for conflict resolution). */
  od: JSONValue;
};

/**
 * @summary Defines an operation that replaces a value at a specified path.
 * @since 1.0.0
 */
export type ObjectReplaceOp = {
  /** The path to the value to replace. */
  p: Path;
  /** The new object or value to insert. */
  oi: JSONValue;
  /** The old object or value being replaced. */
  od: JSONValue;
};

/**
 * @summary Defines an operation that inserts text into a string.
 * @since 1.0.0
 */
export type StringInsertOp = {
  /** The path to the string, including the character index as the last element. */
  p: Path;
  /** The string to insert. */
  si: string;
};

/**
 * @summary Defines an operation that deletes text from a string.
 * @since 1.0.0
 */
export type StringDeleteOp = {
  /** The path to the string, including the character index as the last element. */
  p: Path;
  /** The string to delete. */
  sd: string;
};

/**
 * @summary A union of all possible JSON0 operational transform operation types.
 * @since 1.0.0
 */
export type Op =
  | AddNumOp
  | ObjectInsertOp
  | ObjectDeleteOp
  | ObjectReplaceOp
  | StringInsertOp
  | StringDeleteOp;

/**
 * @summary Defines the options for configuring a ShareDB instance.
 * @since 1.0.0
 */
export type ShareDBOptions = {
  db?: ShareDBAdapter;
  pubsub?: PubSubAdapter;
  milestoneDb?: MilestoneDBAdapter;
};

/**
 * @summary Defines the interface for a ShareDB database adapter.
 * @since 1.0.0
 */
export type ShareDBAdapter = {
  close(callback?: (err?: Error) => void): void;
  commit(
    collection: string,
    id: string,
    op: RawOp,
    snapshot: Snapshot,
    options: unknown,
    callback: (err?: Error) => void,
  ): void;
  getSnapshot(
    collection: string,
    id: string,
    fields: unknown,
    options: unknown,
    callback: (err?: Error, snapshot?: Snapshot) => void,
  ): void;
  getSnapshotBulk(
    collection: string,
    ids: string[],
    fields: unknown,
    options: unknown,
    callback: (err?: Error, snapshots?: Record<string, Snapshot>) => void,
  ): void;
  // Additional methods exist but are omitted for brevity.
};

/**
 * @summary Defines the interface for a ShareDB pub/sub adapter.
 * @since 1.0.0
 */
export type PubSubAdapter = {
  close(callback?: (err?: Error) => void): void;
  publish(
    channel: string,
    message: unknown,
    callback?: (err?: Error) => void,
  ): void;
  subscribe(
    channel: string,
    callback: (err?: Error, message?: unknown) => void,
  ): void;
  // Additional methods exist but are omitted for brevity.
};

/**
 * @summary Defines the interface for a ShareDB milestone database adapter.
 * @since 1.0.0
 */
export type MilestoneDBAdapter = ShareDBAdapter;

/**
 * @summary Defines the agent object that represents a client connection.
 * @since 1.0.0
 */
export type Agent = {
  custom?: Record<string, unknown>;
  backend: ShareDB;
  src: string;
  clientId: string;
  stream: Duplex;
  request?: IncomingMessage;
};

/**
 * @summary Defines the context object that is passed to ShareDB middleware.
 * @since 1.0.0
 */
export type Context = {
  agent: Agent;
  collection: string;
  id: string;
  op?: RawOp;
  data?: DocumentData;
  req?: IncomingMessage;
  snapshots?: Snapshot[];
};

/**
 * @summary Defines the function signature for ShareDB middleware.
 * @since 1.0.0
 */
export type Middleware = (
  context: Context,
  next: (err?: Error) => void,
) => void;

/**
 * @summary Defines the structure of a ShareDB document snapshot.
 * @since 1.0.0
 */
export type Snapshot<T = DocumentData> = {
  id: string;
  v: VersionNumber;
  type: string | null;
  data?: T;
  m: SnapshotMeta | null;
};

/**
 * @summary Defines the metadata associated with a snapshot.
 * @since 1.0.0
 */
export type SnapshotMeta = {
  ctime: number;
  mtime: number;
  // Allow additional metadata via intersection.
} & Record<string, unknown>;

/**
 * @summary Defines the structure of a raw ShareDB operation.
 * @since 1.0.0
 */
export type RawOp = {
  src: string;
  seq: number;
  v: VersionNumber;
  m: unknown;
  c: CollectionName;
  d: DocumentID;
} & (
  | { create: { type: string; data: DocumentData }; del?: never; op?: never }
  | { del: true; create?: never; op?: never }
  | { op: Op[]; create?: never; del?: never }
);

/**
 * @summary Defines the interface for a ShareDB document object.
 * @since 1.0.0
 */
export type Doc = EventEmitter & {
  data: DocumentData | null;
  id: string;
  collection: string;
  version: number;
  type: string | null;

  create(data: DocumentData, callback?: (err?: Error) => void): void;
  create(
    data: DocumentData,
    type: string,
    callback?: (err?: Error) => void,
  ): void;
  fetch(callback?: (err?: Error) => void): void;
  del(callback?: (err?: Error) => void): void;
  submitOp(op: Op[], callback?: (err?: Error) => void): void;
  subscribe(callback?: (err?: Error) => void): void;
  unsubscribe(callback?: (err?: Error) => void): void;
  destroy(): void;
};

/**
 * @summary Defines the interface for a ShareDB connection object.
 * @since 1.0.0
 */
export type Connection = EventEmitter & {
  id: string;
  agent?: Agent;

  get(collection: string, id: string): Doc;
  createFetchQuery(
    collection: string,
    query: unknown,
    options?: unknown,
    callback?: (err?: Error, results?: Doc[]) => void,
  ): Query;
  createSubscribeQuery(
    collection: string,
    query: unknown,
    options?: unknown,
    callback?: (err?: Error, results?: Doc[]) => void,
  ): Query;
  close(): void;
};

/**
 * @summary Defines the interface for a ShareDB query object.
 * @since 1.0.0
 */
export type Query = EventEmitter & {
  ready: boolean;
  results: Doc[];
  extra: unknown;

  destroy(): void;
};

/**
 * @summary Defines the interface for the main ShareDB class.
 * @since 1.0.0
 */
export type ShareDB = EventEmitter & {
  connect(connection?: Connection, req?: IncomingMessage): Connection;
  listen(stream: Duplex, request?: IncomingMessage): Agent;
  close(callback?: (err?: Error) => void): void;
  use(action: string, fn: Middleware): void;
  addProjection(
    name: string,
    collection: string,
    fields: Record<string, boolean>,
  ): void;
};

/**
 * @summary Defines the interface for a WebSocket JSON stream.
 * @since 1.0.0
 */
export type WebSocketJSONStream = Duplex & {
  constructor: (ws: WebSocket) => WebSocketJSONStream;
};

/**
 * @summary Defines the constructor for the ShareDB class.
 * @since 1.0.0
 */
export type ShareDBConstructor = new (options?: ShareDBOptions) => ShareDB;

/**
 * @summary Defines the factory function for the ShareDB MongoDB adapter.
 * @since 1.0.0
 */
export type ShareDBMongoFactory = (url: string) => ShareDBAdapter;

/**
 * @summary Defines the constructor for the WebSocket JSON stream.
 * @since 1.0.0
 */
export type WebSocketJSONStreamConstructor = new (
  ws: WebSocket,
) => WebSocketJSONStream;
