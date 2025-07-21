import { beforeAll, describe, expect, it } from 'vitest';
import {
  decodeToken,
  type JwtPayload,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from '../auth/jwt';

describe('JWT Utilities', () => {
  beforeAll(() => {
    // Set JWT secrets for testing
    process.env['JWT_ACCESS_SECRET'] =
      'test-access-secret-key-for-testing-only';
    process.env['JWT_REFRESH_SECRET'] =
      'test-refresh-secret-key-for-testing-only';
  });

  const testPayload: JwtPayload = {
    sub: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    role: 'editor',
  };

  describe('Access Tokens', () => {
    it('should sign and verify access token', () => {
      const token = signAccessToken(testPayload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts

      const decoded = verifyAccessToken(token);
      expect(decoded.sub).toBe(testPayload.sub);
      expect(decoded.email).toBe(testPayload.email);
      expect(decoded.role).toBe(testPayload.role);
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
      if (decoded.exp && decoded.iat) {
        expect(decoded.exp - decoded.iat).toBe(15 * 60); // 15 minutes
      }
    });

    it('should reject invalid access token', () => {
      expect(() => {
        verifyAccessToken('invalid.token.here');
      }).toThrow();
    });

    it('should reject token with wrong audience', () => {
      const refreshToken = signRefreshToken(testPayload);

      expect(() => {
        verifyAccessToken(refreshToken); // Using refresh token as access token
      }).toThrow();
    });
  });

  describe('Refresh Tokens', () => {
    it('should sign and verify refresh token', () => {
      const token = signRefreshToken(testPayload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const decoded = verifyRefreshToken(token);
      expect(decoded.sub).toBe(testPayload.sub);
      expect(decoded.email).toBe(testPayload.email);
      expect(decoded.role).toBe(testPayload.role);
      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
      if (decoded.exp && decoded.iat) {
        expect(decoded.exp - decoded.iat).toBe(7 * 24 * 60 * 60); // 7 days
      }
    });

    it('should reject invalid refresh token', () => {
      expect(() => {
        verifyRefreshToken('invalid.token.here');
      }).toThrow();
    });

    it('should reject token with wrong audience', () => {
      const accessToken = signAccessToken(testPayload);

      expect(() => {
        verifyRefreshToken(accessToken); // Using access token as refresh token
      }).toThrow();
    });
  });

  describe('Decode Token', () => {
    it('should decode valid token without verification', () => {
      const token = signAccessToken(testPayload);
      const decoded = decodeToken(token);

      expect(decoded).not.toBeNull();
      expect(decoded?.sub).toBe(testPayload.sub);
      expect(decoded?.email).toBe(testPayload.email);
      expect(decoded?.role).toBe(testPayload.role);
    });

    it('should return null for invalid token', () => {
      const decoded = decodeToken('invalid.token');
      expect(decoded).toBeNull();
    });

    it('should decode expired token', () => {
      // Create an expired token by modifying the payload
      const expiredPayload = {
        ...testPayload,
        iat: Math.floor(Date.now() / 1000) - 3600,
        exp: Math.floor(Date.now() / 1000) - 1800,
      };

      const header = Buffer.from(
        JSON.stringify({ alg: 'HS256', typ: 'JWT' }),
      ).toString('base64url');
      const payload = Buffer.from(JSON.stringify(expiredPayload)).toString(
        'base64url',
      );
      const expiredToken = `${header}.${payload}.fake-signature`;

      const decoded = decodeToken(expiredToken);
      expect(decoded).not.toBeNull();
      expect(decoded?.sub).toBe(testPayload.sub);
    });
  });

  describe('JWT Secret Handling', () => {
    it('should throw error when JWT_ACCESS_SECRET is missing', () => {
      const originalSecret = process.env['JWT_ACCESS_SECRET'];
      delete process.env['JWT_ACCESS_SECRET'];

      expect(() => {
        signAccessToken(testPayload);
      }).toThrow(
        'JWT_ACCESS_SECRET not configured. Please check your environment variables.',
      );

      // Restore original secret
      process.env['JWT_ACCESS_SECRET'] = originalSecret;
    });

    it('should throw error when JWT_REFRESH_SECRET is missing', () => {
      const originalSecret = process.env['JWT_REFRESH_SECRET'];
      delete process.env['JWT_REFRESH_SECRET'];

      expect(() => {
        signRefreshToken(testPayload);
      }).toThrow(
        'JWT_REFRESH_SECRET not configured. Please check your environment variables.',
      );

      // Restore original secret
      process.env['JWT_REFRESH_SECRET'] = originalSecret;
    });
  });
});
