import type { ValidateFunction } from 'ajv';
import { describe, expect, it } from 'vitest';
import type { CreateDocumentRequest, Document } from '../index';
import {
  getValidationErrors,
  validateCreateDocumentRequest,
  validateDocument,
  validateDocumentUpdate,
  validateOrThrow,
} from '../validation';

describe('Schema Validation', () => {
  describe('Document Schema', () => {
    it('should validate a valid document', () => {
      const validDoc: Document = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test Document',
        content: 'This is test content',
        acl: {
          owner: '123e4567-e89b-12d3-a456-426614174001',
          editors: ['123e4567-e89b-12d3-a456-426614174002'],
          viewers: [],
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      expect(validateDocument(validDoc)).toBe(true);
    });

    it('should reject document with invalid uuid', () => {
      const invalidDoc = {
        id: 'not-a-uuid',
        title: 'Test Document',
        content: 'This is test content',
        acl: {
          owner: '123e4567-e89b-12d3-a456-426614174001',
          editors: [],
          viewers: [],
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      expect(validateDocument(invalidDoc)).toBe(false);
      const errors = getValidationErrors(validateDocument);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]?.message).toContain('format');
    });

    it('should reject document with empty title', () => {
      const invalidDoc = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: '',
        content: 'This is test content',
        acl: {
          owner: '123e4567-e89b-12d3-a456-426614174001',
          editors: [],
          viewers: [],
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      expect(validateDocument(invalidDoc)).toBe(false);
    });

    it('should reject document with title too long', () => {
      const invalidDoc = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'a'.repeat(101),
        content: 'This is test content',
        acl: {
          owner: '123e4567-e89b-12d3-a456-426614174001',
          editors: [],
          viewers: [],
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      expect(validateDocument(invalidDoc)).toBe(false);
    });
  });

  describe('CreateDocumentRequest Schema', () => {
    it('should validate a valid create request', () => {
      const validRequest: CreateDocumentRequest = {
        title: 'New Document',
        content: 'Initial content',
      };

      expect(validateCreateDocumentRequest(validRequest)).toBe(true);
    });

    it('should validate request without content (optional)', () => {
      const validRequest = {
        title: 'New Document',
      };

      expect(validateCreateDocumentRequest(validRequest)).toBe(true);
    });

    it('should reject request without title', () => {
      const invalidRequest = {
        content: 'Initial content',
      };

      expect(
        validateCreateDocumentRequest(invalidRequest as CreateDocumentRequest),
      ).toBe(false);
    });
  });

  describe('DocumentUpdate Schema', () => {
    it('should validate update with only title', () => {
      const update = {
        title: 'Updated Title',
      };

      expect(validateDocumentUpdate(update)).toBe(true);
    });

    it('should validate update with only content', () => {
      const update = {
        content: 'Updated content',
      };

      expect(validateDocumentUpdate(update)).toBe(true);
    });

    it('should validate update with both fields', () => {
      const update = {
        title: 'Updated Title',
        content: 'Updated content',
      };

      expect(validateDocumentUpdate(update)).toBe(true);
    });

    it('should validate empty update object', () => {
      const update = {};

      expect(validateDocumentUpdate(update)).toBe(true);
    });
  });

  describe('validateOrThrow', () => {
    it('should return data when valid', () => {
      const data = {
        title: 'Test Document',
      };

      const result = validateOrThrow<CreateDocumentRequest>(
        data,
        validateCreateDocumentRequest as ValidateFunction<CreateDocumentRequest>,
      );

      expect(result).toEqual(data);
    });

    it('should throw when invalid', () => {
      const data = {
        content: 'Missing title',
      };

      expect(() => {
        validateOrThrow(
          data,
          validateCreateDocumentRequest as ValidateFunction<CreateDocumentRequest>,
          'Invalid request',
        );
      }).toThrow('Invalid request');
    });
  });
});
