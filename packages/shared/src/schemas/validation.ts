import { isObject, isString } from 'lodash';
import type { Document, DocumentACL } from './document';

export const isValidACL = (obj: unknown): obj is DocumentACL => {
  if (!isObject(obj)) return false;

  const acl = obj as Record<string, unknown>;
  return (
    isString(acl['owner']) &&
    Array.isArray(acl['editors']) &&
    Array.isArray(acl['viewers'])
  );
};

export const isValidDocumentData = (obj: unknown): obj is Document => {
  if (!isObject(obj)) return false;

  const doc = obj as Record<string, unknown>;
  return (
    isString(doc['id']) && doc['id'].length > 0 &&
    isString(doc['title']) && (doc['title'] as string).trim().length > 0 &&
    isString(doc['content']) &&
    isValidACL(doc['acl'])
  );
};
