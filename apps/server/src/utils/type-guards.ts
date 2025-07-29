import type { Document as SharedDocument } from '@collab-edit/shared';
import isArray from 'lodash.isarray';
import isNil from 'lodash.isnil';
import isObject from 'lodash.isobject';
import isString from 'lodash.isstring';
import type { AuthenticatedRequest } from '../middleware/websocket-auth';

/**
 * @summary Defines the structure of a ShareDB snapshot for type safety.
 * @private
 */
type ShareDBSnapshot = {
  id: string;
  v: number;
  type: string | null;
  data?: Record<string, unknown>;
  m: Record<string, unknown> | null;
};

/**
 * @summary Defines the structure of the ShareDB context object.
 * @private
 */
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
 * @summary Type guard to check if an object has a valid ShareDB context structure.
 * @param ctx - The unknown object to validate.
 * @returns `true` if the object is a valid ShareDB context, `false` otherwise.
 * @since 1.0.0
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
 * @summary Type guard to check if an object is a valid ShareDB snapshot.
 * @param obj - The unknown object to validate.
 * @returns `true` if the object is a valid ShareDB snapshot, `false` otherwise.
 * @since 1.0.0
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
 * @summary Type guard to check if an array contains valid ShareDB snapshots.
 * @param arr - The unknown array to validate.
 * @returns `true` if the array contains valid ShareDB snapshots, `false` otherwise.
 * @since 1.0.0
 */
export const isSnapshotsArray = (arr: unknown): arr is ShareDBSnapshot[] => {
  if (!isArray(arr)) return false;
  return arr.every(isShareDBSnapshot);
};

/**
 * @summary Safely extracts the snapshots array from a ShareDB context.
 * @param ctx - The ShareDB context.
 * @returns An array of ShareDB snapshots.
 * @since 1.0.0
 */
export const getContextSnapshots = (ctx: ShareDBContext): ShareDBSnapshot[] => {
  const snapshots = ctx.snapshots ?? [];
  if (!isSnapshotsArray(snapshots)) {
    return [];
  }
  return snapshots;
};

/**
 * @summary Type guard for user data that contains a user ID and role.
 * @param data - The unknown data to validate.
 * @returns `true` if the data contains a user ID and role, `false` otherwise.
 * @since 1.0.0
 */
export const hasUserIdAndRole = (
  data: unknown,
): data is { userId: string; role: string } => {
  if (!isObject(data)) return false;
  const obj = data as Record<string, unknown>;
  return isString(obj['userId']) && isString(obj['role']);
};

/**
 * @summary Type guard to check if a request is authenticated.
 * @param req - The unknown request to validate.
 * @returns `true` if the request is authenticated, `false` otherwise.
 * @since 1.0.0
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
 * @summary Type guard for user creation data.
 * @param data - The unknown data to validate.
 * @returns `true` if the data is valid user creation data, `false` otherwise.
 * @since 1.0.0
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
 * @summary Type guard for user role update data.
 * @param data - The unknown data to validate.
 * @returns `true` if the data is valid user role update data, `false` otherwise.
 * @since 1.0.0
 */
export const isUserRoleData = (
  data: unknown,
): data is { userId: string; role: string } => {
  if (!isObject(data)) return false;
  const obj = data as Record<string, unknown>;
  return isString(obj['userId']) && isString(obj['role']);
};

/**
 * @summary Type guard for optional user update data.
 * @param data - The unknown data to validate.
 * @returns `true` if the data is valid optional user update data, `false` otherwise.
 * @since 1.0.0
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
 * @summary Defines the structure of the data for a document.
 * @private
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
 * @summary Validates and returns a `Document` if the data is valid, or `null` otherwise.
 * @param data - The unknown data to validate.
 * @returns A `Document` object or `null`.
 * @since 1.0.0
 */
export function getValidatedDocumentData(data: unknown): SharedDocument | null {
  // Basic validation - implement proper document validation
  if (!isObject(data)) return null;
  return data as SharedDocument;
}

/**
 * @summary Creates a validated `Document` from `DocumentData`.
 * @param data - The document data.
 * @returns A `Document` object.
 * @since 1.0.0
 */
export function createValidatedDocument(data: DocumentData): SharedDocument {
  return {
    id: '', // Will be set by the database
    ...data,
  } as SharedDocument;
}

/**
 * @summary Type guard for document data.
 * @remarks This is an alias for `getValidatedDocumentData` for compatibility.
 * @since 1.0.0
 */
export const isDocumentData = getValidatedDocumentData;
