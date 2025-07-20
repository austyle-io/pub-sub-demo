import { describe, it, expect, afterAll } from 'vitest'
import request from 'supertest'
import { app, server } from '../server'

describe('Health Endpoint', () => {
  afterAll(() => {
    server.close()
  })

  it('GET /health returns ok status', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: 'ok' })
  })
})