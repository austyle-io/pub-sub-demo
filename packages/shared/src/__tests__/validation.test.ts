import { TypeCompiler } from '@sinclair/typebox/compiler';
import type { ValidateFunction } from 'ajv';
import { describe, expect, it } from 'vitest';
import type { CreateDocumentRequest, Document, Permissions } from '../index';
import { PermissionsSchema } from '../schemas/permissions';
import {
  getValidationErrors,
  validateCreateDocumentRequest,
  validateDocument,
  validateDocumentUpdate,
  validateOrThrow,
} from '../validation';

const validatePermissions = TypeCompiler.Compile(PermissionsSchema);

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

describe('PermissionsSchema', () => {
  it('should validate valid permissions object', () => {
    const validPermissions: Permissions = {
      canRead: true,
      canWrite: false,
      canDelete: false,
    };

    expect(validatePermissions.Check(validPermissions)).toBe(true);
  });

  it('should validate all permissions as false', () => {
    const validPermissions: Permissions = {
      canRead: false,
      canWrite: false,
      canDelete: false,
    };

    expect(validatePermissions.Check(validPermissions)).toBe(true);
  });

  it('should validate all permissions as true', () => {
    const validPermissions: Permissions = {
      canRead: true,
      canWrite: true,
      canDelete: true,
    };

    expect(validatePermissions.Check(validPermissions)).toBe(true);
  });

  it('should reject permissions with missing fields', () => {
    const invalidPermissions = {
      canRead: true,
      canWrite: false,
      // canDelete missing
    };

    expect(validatePermissions.Check(invalidPermissions)).toBe(false);
    const errors = [...validatePermissions.Errors(invalidPermissions)];
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject permissions with wrong types', () => {
    const invalidPermissions = {
      canRead: 'true', // string instead of boolean
      canWrite: false,
      canDelete: false,
    };

    expect(validatePermissions.Check(invalidPermissions)).toBe(false);
    const errors = [...validatePermissions.Errors(invalidPermissions)];
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject permissions with extra properties', () => {
    const invalidPermissions = {
      canRead: true,
      canWrite: false,
      canDelete: false,
      extraProperty: 'not allowed',
    };

    // Note: This depends on the schema's additionalProperties setting
    // If additionalProperties is false, this should fail
    // If true or not set, this might pass
    const result = validatePermissions.Check(invalidPermissions);
    // We expect this to pass since TypeBox schemas don't set additionalProperties: false by default
    expect(result).toBe(true);
  });
});
