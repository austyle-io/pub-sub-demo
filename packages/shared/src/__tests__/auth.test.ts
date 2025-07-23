import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from '../auth/password';
import {
  type CreateUserRequest,
  type LoginRequest,
  type RefreshTokenRequest,
  getValidationErrors,
  validateCreateUserRequest,
  validateLoginRequest,
  validateRefreshTokenRequest,
} from '../index';

describe('Auth Validation', () => {
  describe('CreateUserRequest Schema', () => {
    it('should validate a valid signup request', () => {
      const validRequest: CreateUserRequest = {
        email: 'test@example.com',
        password: 'password123',
      };

      expect(validateCreateUserRequest(validRequest)).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidRequest = {
        email: 'not-an-email',
        password: 'password123',
      };

      expect(validateCreateUserRequest(invalidRequest)).toBe(false);
      const errors = getValidationErrors(validateCreateUserRequest);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]?.message).toContain('format');
    });

    it('should reject short password', () => {
      const invalidRequest = {
        email: 'test@example.com',
        password: 'short',
      };

      expect(validateCreateUserRequest(invalidRequest)).toBe(false);
      const errors = getValidationErrors(validateCreateUserRequest);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject missing fields', () => {
      const invalidRequest = {
        email: 'test@example.com',
      };

      expect(validateCreateUserRequest(invalidRequest)).toBe(false);
    });
  });

  describe('LoginRequest Schema', () => {
    it('should validate a valid login request', () => {
      const validRequest: LoginRequest = {
        email: 'test@example.com',
        password: 'password123',
      };

      expect(validateLoginRequest(validRequest)).toBe(true);
    });

    it('should reject invalid data', () => {
      const invalidRequest = {
        email: 'test@example.com',
      };

      expect(validateLoginRequest(invalidRequest)).toBe(false);
    });
  });

  describe('RefreshTokenRequest Schema', () => {
    it('should validate a valid refresh request', () => {
      const validRequest: RefreshTokenRequest = {
        refreshToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
      };

      expect(validateRefreshTokenRequest(validRequest)).toBe(true);
    });

    it('should reject missing token', () => {
      const invalidRequest = {};

      expect(validateRefreshTokenRequest(invalidRequest)).toBe(false);
    });
  });

  describe('Password Hashing', () => {
    it('should hash and verify passwords', async () => {
      const password = 'test-password-123';

      const hash = await hashPassword(password);
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50); // bcrypt hashes are ~60 chars

      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);

      const isInvalid = await verifyPassword('wrong-password', hash);
      expect(isInvalid).toBe(false);
    }, 10000); // 10 second timeout for CI environments

    it('should generate different hashes for same password', async () => {
      const password = 'test-password-123';

      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);

      // Both should verify correctly
      expect(await verifyPassword(password, hash1)).toBe(true);
      expect(await verifyPassword(password, hash2)).toBe(true);
    }, 10000); // 10 second timeout for CI environments
  });
});
