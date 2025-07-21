import type { JwtPayload } from '@collab-edit/shared';
import { signAccessToken } from '@collab-edit/shared';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { app, server } from '../server';
import { isMongoDbAvailable } from './test-helpers';

const mongoDbAvailable = await isMongoDbAvailable();

let token: string;
let ownerToken: string;
let viewerToken: string;
let unauthorizedToken: string;

afterAll(() => {
  server.close();
});

beforeAll(() => {
  // Environment variables are set globally in setup.ts

  // Editor token
  const payload: JwtPayload = {
    sub: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    role: 'editor',
    exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
    iat: Math.floor(Date.now() / 1000),
  };
  token = signAccessToken(payload);

  // Owner token
  const ownerPayload: JwtPayload = {
    sub: '123e4567-e89b-12d3-a456-426614174001',
    email: 'owner@example.com',
    role: 'editor',
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
    iat: Math.floor(Date.now() / 1000),
  };
  ownerToken = signAccessToken(ownerPayload);

  // Viewer token
  const viewerPayload: JwtPayload = {
    sub: '123e4567-e89b-12d3-a456-426614174002',
    email: 'viewer@example.com',
    role: 'editor',
  };
  viewerToken = signAccessToken(viewerPayload);

  // Unauthorized user token
  const unauthorizedPayload: JwtPayload = {
    sub: '123e4567-e89b-12d3-a456-426614174999',
    email: 'unauthorized@example.com',
    role: 'editor',
  };
  unauthorizedToken = signAccessToken(unauthorizedPayload);
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

describe.skipIf(!mongoDbAvailable)('GET /api/documents/:id/permissions', () => {
  let documentId: string;

  beforeAll(async () => {
    // Create a test document with the owner
    const res = await request(app)
      .post('/api/documents')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        title: 'Permissions Test Document',
        content: 'Testing permissions',
      });

    documentId = res.body.id;

    // Add viewer to the document's ACL
    await request(app)
      .put(`/api/documents/${documentId}/permissions`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        editors: [],
        viewers: ['123e4567-e89b-12d3-a456-426614174002'], // viewer user ID
      });
  });

  it('should return permissions for document owner', async () => {
    const res = await request(app)
      .get(`/api/documents/${documentId}/permissions`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      canRead: true,
      canWrite: true,
      canDelete: true,
    });
  });

  it('should return limited permissions for viewer', async () => {
    const res = await request(app)
      .get(`/api/documents/${documentId}/permissions`)
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      canRead: true,
      canWrite: false,
      canDelete: false,
    });
  });

  it('should return 403 for unauthorized user', async () => {
    const res = await request(app)
      .get(`/api/documents/${documentId}/permissions`)
      .set('Authorization', `Bearer ${unauthorizedToken}`);

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('message', 'Access denied');
  });

  it('should return 401 without authentication', async () => {
    const res = await request(app).get(
      `/api/documents/${documentId}/permissions`,
    );

    expect(res.status).toBe(401);
  });

  it('should return 400 for invalid document ID', async () => {
    const res = await request(app)
      .get('/api/documents//permissions')
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'Document ID is required');
  });

  it('should return 403 for non-existent document', async () => {
    const res = await request(app)
      .get('/api/documents/non-existent-id/permissions')
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('message', 'Access denied');
  });
});
