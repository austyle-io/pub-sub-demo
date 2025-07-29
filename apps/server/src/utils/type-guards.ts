import type { Document } from '@collab-edit/shared';
import isArray from 'lodash.isarray';
import isNil from 'lodash.isnil';
import isObject from 'lodash.isobject';
import isString from 'lodash.isstring';
import type { AuthenticatedRequest } from '../middleware/websocket-auth';

// ShareDB snapshot type for type safety
type ShareDBSnapshot = {
  id: string;
  v: number;
  type: string | null;
  data?: Record<string, unknown>;
  m: Record<string, unknown> | null;
};

// ShareDB context type guard - updated to include snapshots
type ShareDBContext = {
  agent: {
    custom?: {
      userId?: string;
      email?: string;
      role?: string;
    };
  };
  collection?: string;
  id?: string;
  req?: AuthenticatedRequest;
  snapshots?: ShareDBSnapshot[];
};

/**
 * Type guard to check if a context object has valid ShareDB structure
 */
export const isShareDBContext = (ctx: unknown): ctx is ShareDBContext => {
  if (!isObject(ctx)) return false;
  const context = ctx as Record<string, unknown>;
  return (
    !isNil(context['agent']) &&
    isObject(context['agent']) &&
    (isNil(context['collection']) || isString(context['collection'])) &&
    (isNil(context['id']) || isString(context['id'])) &&
    (isNil(context['snapshots']) || isArray(context['snapshots']))
  );
};

/**
 * Type guard to check if an object is a valid ShareDB snapshot
 */
export const isShareDBSnapshot = (obj: unknown): obj is ShareDBSnapshot => {
  if (!isObject(obj)) return false;
  const snapshot = obj as Record<string, unknown>;
  return (
    isString(snapshot['id']) &&
    typeof snapshot['v'] === 'number' &&
    (isNil(snapshot['type']) || isString(snapshot['type'])) &&
    (isNil(snapshot['data']) || isObject(snapshot['data'])) &&
    (isNil(snapshot['m']) || isObject(snapshot['m']))
  );
};

/**
 * Type guard to check if an array contains valid ShareDB snapshots
 */
export const isSnapshotsArray = (arr: unknown): arr is ShareDBSnapshot[] => {
  if (!isArray(arr)) return false;
  return arr.every(isShareDBSnapshot);
};

/**
 * Safely extracts snapshots array from ShareDB context
 */
export const getContextSnapshots = (ctx: ShareDBContext): ShareDBSnapshot[] => {
  const snapshots = ctx.snapshots ?? [];
  if (!isSnapshotsArray(snapshots)) {
    return [];
  }
  return snapshots;
};

/**
 * Type guard for user data containing userId and role
 */
export const hasUserIdAndRole = (
  data: unknown,
): data is { userId: string; role: string } => {
  if (!isObject(data)) return false;
  const obj = data as Record<string, unknown>;
  return isString(obj['userId']) && isString(obj['role']);
};

/**
 * Type guard to check if a request is authenticated
 */
export const isAuthenticatedRequest = (
  req: unknown,
): req is AuthenticatedRequest => {
  if (!isObject(req)) return false;
  const request = req as Record<string, unknown>;
  return (
    'user' in request && !isNil(request['user']) && isObject(request['user'])
  );
};

/**
 * Type guard for user creation data
 */
export const isUserCreationData = (
  data: unknown,
): data is { userId: string; email: string; role: string } => {
  if (!isObject(data)) return false;
  const obj = data as Record<string, unknown>;
  return (
    isString(obj['userId']) && isString(obj['email']) && isString(obj['role'])
  );
};

/**
 * Type guard for user role update data
 */
export const isUserRoleData = (
  data: unknown,
): data is { userId: string; role: string } => {
  if (!isObject(data)) return false;
  const obj = data as Record<string, unknown>;
  return isString(obj['userId']) && isString(obj['role']);
};

/**
 * Type guard for optional user update data
 */
export const isOptionalUserData = (
  data: unknown,
): data is { userId?: string; role?: string } => {
  if (!isObject(data)) return false;
  const obj = data as Record<string, unknown>;
  return (
    (isNil(obj['userId']) || isString(obj['userId'])) &&
    (isNil(obj['role']) || isString(obj['role']))
  );
};

/**
 * Type guard for document data
 */
type DocumentData = {
  title: string;
  content: string;
  acl: {
    owner: string;
    editors: string[];
    viewers: string[];
  };
};

/**
 * Validates and returns a Document if data is valid, null otherwise
 */
export function getValidatedDocumentData(data: unknown): Document | null {
  // Basic validation - implement proper document validation
  if (!isObject(data)) return null;
  return data as Document;
}

/**
 * Creates a validated Document from DocumentData
 */
export function createValidatedDocument(data: DocumentData): Document {
  return {
    id: '', // Will be set by the database
    ...data,
  } as Document;
}

/**
 * Type guard for document data (alias for compatibility)
 */
export const isDocumentData = getValidatedDocumentData;
