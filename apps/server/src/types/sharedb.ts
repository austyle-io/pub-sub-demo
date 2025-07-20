/**
 * ShareDB type definitions using type aliases instead of interfaces.
 * Based on @types/sharedb but adapted to avoid interfaces and 'any' types.
 */

import type { EventEmitter } from 'node:events';
import type { IncomingMessage } from 'node:http';
import type { Duplex } from 'node:stream';
import type { WebSocket } from 'ws';

// JSON types for document data
export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONObject
  | JSONArray;
export type JSONObject = { [key: string]: JSONValue };
export type JSONArray = JSONValue[];

// ShareDB core types
export type DocumentData = JSONObject;
export type DocumentID = string;
export type CollectionName = string;
export type VersionNumber = number;
export type OperationType = 'create' | 'del' | 'op';

// Operation types for JSON0 OT type
export type Path = ReadonlyArray<string | number>;

export type AddNumOp = {
  p: Path;
  na: number;
};

export type ObjectInsertOp = {
  p: Path;
  oi: JSONValue;
};

export type ObjectDeleteOp = {
  p: Path;
  od: JSONValue;
};

export type ObjectReplaceOp = {
  p: Path;
  oi: JSONValue;
  od: JSONValue;
};

export type StringInsertOp = {
  p: Path;
  si: string;
};

export type StringDeleteOp = {
  p: Path;
  sd: string;
};

// Union of all operation types
export type Op =
  | AddNumOp
  | ObjectInsertOp
  | ObjectDeleteOp
  | ObjectReplaceOp
  | StringInsertOp
  | StringDeleteOp;

// ShareDB connection options
export type ShareDBOptions = {
  db?: ShareDBAdapter;
  pubsub?: PubSubAdapter;
  milestoneDb?: MilestoneDBAdapter;
};

// Database adapter types
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
  // Additional methods exist but omitted for brevity
};

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
  // Additional methods exist but omitted for brevity
};

export type MilestoneDBAdapter = ShareDBAdapter;

// Agent type for middleware context
export type Agent = {
  custom?: Record<string, unknown>;
  backend: ShareDB;
  src: string;
  clientId: string;
  stream: Duplex;
  request?: IncomingMessage;
};

// Context type for middleware
export type Context = {
  agent: Agent;
  collection: string;
  id: string;
  op?: RawOp;
  data?: DocumentData;
  req?: IncomingMessage;
  snapshots?: Snapshot[];
};

// Middleware function type
export type Middleware = (
  context: Context,
  next: (err?: Error) => void,
) => void;

// Snapshot type
export type Snapshot<T = DocumentData> = {
  id: string;
  v: VersionNumber;
  type: string | null;
  data?: T;
  m: SnapshotMeta | null;
};

export type SnapshotMeta = {
  ctime: number;
  mtime: number;
  // Allow additional metadata via intersection
} & Record<string, unknown>;

// Raw operation type
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

// ShareDB Doc class type
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

// ShareDB Connection class type
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

// Query type
export type Query = EventEmitter & {
  ready: boolean;
  results: Doc[];
  extra: unknown;

  destroy(): void;
};

// Main ShareDB class type
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

// WebSocketJSONStream type
export type WebSocketJSONStream = Duplex & {
  constructor: (ws: WebSocket) => WebSocketJSONStream;
};

// Factory function types
export type ShareDBConstructor = new (options?: ShareDBOptions) => ShareDB;
export type ShareDBMongoFactory = (url: string) => ShareDBAdapter;
export type WebSocketJSONStreamConstructor = new (
  ws: WebSocket,
) => WebSocketJSONStream;
