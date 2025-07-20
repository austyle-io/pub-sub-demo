import { isDocument, isValidDocumentData } from '@collab-edit/shared';
import isNil from 'lodash.isnil';
import isObject from 'lodash.isobject';
import isString from 'lodash.isstring';
import type { DocumentData, Context } from '../types/sharedb';
import type { AuthenticatedRequest } from '../middleware/websocket-auth';

/**
 * Type guard to check if an unknown value is a Document
 */
export { isDocument };

/**
 * Runtime type guard for ShareDB Context from unknown middleware parameter
 */
export function isShareDBContext(value: unknown): value is Context {
  if (isNil(value) || !isObject(value)) {
    return false;
  }

  const ctx = value as Record<string, unknown>;
  return (
    !isNil(ctx['agent']) &&
    isObject(ctx['agent']) &&
    (isNil(ctx['collection']) || isString(ctx['collection'])) &&
    (isNil(ctx['id']) || isString(ctx['id']))
  );
}

/**
 * Runtime type guard for AuthenticatedRequest
 */
export function isAuthenticatedRequest(value: unknown): value is AuthenticatedRequest {
  if (isNil(value) || !isObject(value)) {
    return false;
  }

  const req = value as Record<string, unknown>;
  return (
    'user' in req &&
    !isNil(req['user']) &&
    isObject(req['user'])
  );
}

/**
 * Runtime type guard for ShareDB agent custom data structure
 */
export function isAgentCustomData(value: unknown): value is { userId: string; email: string; role: string } {
  if (isNil(value) || !isObject(value)) {
    return false;
  }

  const data = value as Record<string, unknown>;
  return (
    isString(data['userId']) &&
    isString(data['email']) &&
    isString(data['role'])
  );
}

/**
 * Type guard to check if unknown value has userId and role
 */
export function isUserCustomData(
  value: unknown
): value is { userId: string; role: string } {
  if (isNil(value) || !isObject(value)) {
    return false;
  }

  // Safe assertion after type checking
  const data = value as Record<string, unknown>;
  return isString(data['userId']) && isString(data['role']);
}

/**
 * Type guard for partial user custom data
 */
export function hasUserIdAndRole(
  value: unknown
): value is { userId?: string; role?: string } {
  if (isNil(value) || !isObject(value)) {
    return false;
  }

  // Safe assertion after type checking
  const data = value as Record<string, unknown>;
  return (
    (isNil(data['userId']) || isString(data['userId'])) &&
    (isNil(data['role']) || isString(data['role']))
  );
}

/**
 * Type guard to check if a value is DocumentData (JSONObject)
 */
export function isDocumentData(value: unknown): value is DocumentData {
  return !isNil(value) && isObject(value) && !Array.isArray(value);
}

/**
 * Safe getter for document data with validation
 */
export function getValidatedDocumentData(data: unknown): Document | null {
  if (isValidDocumentData(data)) {
    return data;
  }
  return null;
}

/**
 * Create a validated Document from ShareDB data
 */
export function createValidatedDocument(data: DocumentData): Document {
  const doc = data satisfies Record<string, unknown>;

  if (isValidDocumentData(doc)) {
    return doc;
  }

  throw new Error('Invalid document data structure');
}
