import { type JwtPayload, signAccessToken } from '@collab-edit/shared';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { app, server } from '../server';
import { isMongoDbAvailable } from './test-helpers';

const mongoDbAvailable = await isMongoDbAvailable();

let token: string;

afterAll(() => {
  server.close();
});

beforeAll(() => {
  process.env['JWT_SECRET'] = 'test-secret-key-for-testing-only';
  const payload: JwtPayload = {
    sub: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    role: 'editor',
  };
  token = signAccessToken(payload);
});

describe.skipIf(!mongoDbAvailable)('POST /api/documents', () => {
  it('should create a new document', async () => {
    const res = await request(app)
      .post('/api/documents')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test Document', content: 'This is a test document.' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('title', 'Test Document');
    expect(res.body).toHaveProperty('content', 'This is a test document.');
  });
});
