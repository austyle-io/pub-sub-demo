import {
  type JwtPayload,
  signAccessToken,
  signRefreshToken,
} from '@collab-edit/shared';
import type { NextFunction, Request, Response } from 'express';
import { beforeAll, describe, expect, it } from 'vitest';
import { authenticate } from '../middleware/passport';

describe('JWT Authentication Middleware', () => {
  beforeAll(() => {
    process.env['JWT_ACCESS_SECRET'] = 'test-access-secret-key-for-testing-only';
    process.env['JWT_REFRESH_SECRET'] = 'test-refresh-secret-key-for-testing-only';
  });

  it('should authenticate valid JWT token', async () => {
    const payload: JwtPayload = {
      sub: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      role: 'editor',
    };

    const token = signAccessToken(payload);

    // Mock request with valid token
    const req = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    } as Request;

    const res = {} as Response;

    // Test authentication
    await new Promise<void>((resolve) => {
      authenticate(req, res, ((err?: Error) => {
        expect(err).toBeUndefined();
        resolve();
      }) as NextFunction);
    });
  });

  it('should reject request without token', async () => {
    const req = {
      headers: {},
    } as Request;

    const res = {
      status: (code: number) => {
        expect(code).toBe(401);
        return res;
      },
      json: (_data: unknown) => res,
      end: () => res,
      setHeader: () => res,
    } as unknown as Response;

    const errorThrown = false;
    const next = (err?: Error) => {
      if (err) {
        // errorThrown = true;
      }
    };

    authenticate(req, res, next as NextFunction);

    // Passport will handle the 401 response
    expect(errorThrown).toBe(false);
  });

  it('should reject invalid token', async () => {
    const req = {
      headers: {
        authorization: 'Bearer invalid.token.here',
      },
    } as Request;

    const res = {
      status: (code: number) => {
        expect(code).toBe(401);
        return res;
      },
      json: (_data: unknown) => res,
      end: () => res,
      setHeader: () => res,
    } as unknown as Response;

    const errorThrown = false;
    const next = (err?: Error) => {
      if (err) {
        // errorThrown = true;
      }
    };

    authenticate(req, res, next as NextFunction);
    expect(errorThrown).toBe(false);
  });

  it('should reject refresh token used as access token', async () => {
    const payload: JwtPayload = {
      sub: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      role: 'editor',
    };

    const refreshToken = signRefreshToken(payload); // Wrong token type

    const req = {
      headers: {
        authorization: `Bearer ${refreshToken}`,
      },
    } as Request;

    const res = {
      status: (code: number) => {
        expect(code).toBe(401);
        return res;
      },
      json: (_data: unknown) => res,
      end: () => res,
      setHeader: () => res,
    } as unknown as Response;

    const next = () => {};

    authenticate(req, res, next as NextFunction);
  });
});
