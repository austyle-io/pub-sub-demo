/**
 * Document schema validation utilities.
 *
 * This module provides runtime type guards for document-related data structures,
 * ensuring type safety when working with document ACLs and document objects.
 *
 * @module schemas/validation
 * @since 1.0.0
 */

import isObject from 'lodash.isobject';
import isString from 'lodash.isstring';
import type { Document, DocumentACL } from './document';

/**
 * Validates that an object conforms to the DocumentACL structure.
 *
 * Checks for required ACL properties:
 * - owner: string (user ID of document owner)
 * - editors: array of strings (user IDs with edit permission)
 * - viewers: array of strings (user IDs with view permission)
 *
 * @param obj - Unknown value to validate
 * @returns True if value is a valid DocumentACL
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * const acl = {
 *   owner: 'user-123',
 *   editors: ['user-456', 'user-789'],
 *   viewers: ['user-012']
 * };
 *
 * if (isValidACL(acl)) {
 *   // acl is typed as DocumentACL
 *   console.log(`Document owned by ${acl.owner}`);
 * }
 * ```
 */
export const isValidACL = (obj: unknown): obj is DocumentACL => {
  if (!isObject(obj)) return false;

  const acl = obj as Record<string, unknown>;
  return (
    isString(acl['owner']) &&
    Array.isArray(acl['editors']) &&
    Array.isArray(acl['viewers'])
  );
};

/**
 * Validates that an object conforms to the Document structure.
 *
 * Performs comprehensive validation including:
 * - id: non-empty string
 * - title: non-empty string (after trimming)
 * - content: string (can be empty)
 * - acl: valid DocumentACL structure
 *
 * @param obj - Unknown value to validate
 * @returns True if value is a valid Document
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * const documentData = await fetchDocument(id);
 *
 * if (isValidDocumentData(documentData)) {
 *   // documentData is typed as Document
 *   renderDocument(documentData);
 * } else {
 *   console.error('Invalid document structure');
 * }
 * ```
 */
export const isValidDocumentData = (obj: unknown): obj is Document => {
  if (!isObject(obj)) return false;

  const doc = obj as Record<string, unknown>;
  return (
    isString(doc['id']) &&
    (doc['id'] as string).length > 0 &&
    isString(doc['title']) &&
    (doc['title'] as string).trim().length > 0 &&
    isString(doc['content']) &&
    isValidACL(doc['acl'])
  );
};
