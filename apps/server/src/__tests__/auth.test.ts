import type { CreateUserRequest, LoginRequest } from '@collab-edit/shared';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { app, server } from '../server';
import {
  closeDatabaseConnection,
  connectToDatabase,
  getUsersCollection,
} from '../utils/database';
import { isMongoDbAvailable } from './test-helpers';

const mongoDbAvailable = await isMongoDbAvailable();

describe.skipIf(!mongoDbAvailable)('Auth Endpoints', () => {
  beforeAll(async () => {
    // Environment variables are set globally in setup.ts
    await connectToDatabase();
  });

  afterAll(async () => {
    await closeDatabaseConnection();
    server.close();
  });

  beforeEach(async () => {
    // Clear users collection before each test for isolation
    const users = getUsersCollection();
    await users.deleteMany({});
  });

  describe('POST /api/auth/signup', () => {
    it('should create a new user with valid data', async () => {
      const newUser: CreateUserRequest = {
        email: 'test@example.com',
        password: 'password123',
      };

      const res = await request(app)
        .post('/api/auth/signup')
        .send(newUser)
        .expect(201);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe(newUser.email);
      expect(res.body.user.role).toBe('editor');
      expect(res.body.user).not.toHaveProperty('password');

      // Check that refresh token is set as HTTP-only cookie
      const cookies = res.headers['set-cookie'] as string[] | undefined;
      const refreshTokenCookie = cookies?.find((cookie: string) =>
        cookie.startsWith('refreshToken='),
      );
      expect(refreshTokenCookie).toBeDefined();
    });

    it('should reject duplicate email', async () => {
      const newUser: CreateUserRequest = {
        email: 'test@example.com',
        password: 'password123',
      };

      // Create first user
      await request(app).post('/api/auth/signup').send(newUser).expect(201);

      // Try to create duplicate
      const res = await request(app)
        .post('/api/auth/signup')
        .send(newUser)
        .expect(409);

      expect(res.body.error).toBe('User already exists');
    });

    it('should reject invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'invalid-email',
          password: 'password123',
        })
        .expect(400);

      expect(res.body.error).toBe('Validation failed');
      expect(res.body.details).toBeDefined();
    });

    it('should reject short password', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'short',
        })
        .expect(400);

      expect(res.body.error).toBe('Validation failed');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      await request(app).post('/api/auth/signup').send({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should login with valid credentials', async () => {
      const loginData: LoginRequest = {
        email: 'test@example.com',
        password: 'password123',
      };

      const res = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe(loginData.email);

      // Check that refresh token is set as HTTP-only cookie
      const cookies = res.headers['set-cookie'] as string[] | undefined;
      const refreshTokenCookie = cookies?.find((cookie: string) =>
        cookie.startsWith('refreshToken='),
      );
      expect(refreshTokenCookie).toBeDefined();
    });

    it('should reject invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrong-password',
        })
        .expect(401);

      expect(res.body.error).toBe('Invalid credentials');
    });

    it('should reject non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(401);

      expect(res.body.error).toBe('Invalid credentials');
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh tokens with valid refresh token', async () => {
      // Create and login user
      const loginRes = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(201);

      // Extract refresh token from cookie
      const cookies = loginRes.headers['set-cookie'] as string[] | undefined;
      const refreshTokenCookie = cookies?.find((cookie: string) =>
        cookie.startsWith('refreshToken='),
      );
      expect(refreshTokenCookie).toBeDefined();

      // Wait 1 second to ensure different iat timestamp
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Refresh tokens using cookie
      if (!refreshTokenCookie) {
        throw new Error('refreshTokenCookie not found');
      }

      const res = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', refreshTokenCookie)
        .expect(200);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('user');

      // New access token should be different
      expect(res.body.accessToken).not.toBe(loginRes.body.accessToken);

      // Should set a new refresh token cookie
      const newCookies = res.headers['set-cookie'] as string[] | undefined;
      const newRefreshTokenCookie = newCookies?.find((cookie: string) =>
        cookie.startsWith('refreshToken='),
      );
      expect(newRefreshTokenCookie).toBeDefined();
    });

    it('should reject invalid refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', 'refreshToken=invalid-token')
        .expect(401);

      expect(res.body.error).toBe('Invalid refresh token');
    });
  });
});
