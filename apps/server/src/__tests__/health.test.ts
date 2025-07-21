import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../server';

describe('Health Endpoint', () => {
  it('GET /health returns ok status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    // Don't assert exact structure - just verify it includes status: ok
  });
});
