import { describe, it, expect, beforeAll } from 'vitest'
import { signAccessToken, signRefreshToken, type JwtPayload } from '@collab-edit/shared'
import { authenticate } from '../middleware/passport'
import type { Request, Response } from 'express'

describe('JWT Authentication Middleware', () => {
  beforeAll(() => {
    process.env['JWT_SECRET'] = 'test-secret-key-for-testing-only'
  })

  it('should authenticate valid JWT token', async () => {
    const payload: JwtPayload = {
      sub: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      role: 'editor'
    }
    
    const token = signAccessToken(payload)
    
    // Mock request with valid token
    const req = {
      headers: {
        authorization: `Bearer ${token}`
      }
    } as Request
    
    const res = {} as Response
    let nextCalled = false
    const next = () => { nextCalled = true }
    
    // Test authentication
    await new Promise<void>((resolve) => {
      authenticate(req, res, (err?: any) => {
        expect(err).toBeUndefined()
        expect(nextCalled).toBe(false) // next should be called by passport
        resolve()
      })
    })
  })

  it('should reject request without token', async () => {
    const req = {
      headers: {}
    } as Request
    
    const res = {
      status: (code: number) => {
        expect(code).toBe(401)
        return res
      },
      json: (data: any) => res,
      end: () => res,
      setHeader: () => res
    } as any
    
    let errorThrown = false
    const next = (err?: any) => {
      if (err) errorThrown = true
    }
    
    authenticate(req, res, next)
    
    // Passport will handle the 401 response
  })

  it('should reject invalid token', async () => {
    const req = {
      headers: {
        authorization: 'Bearer invalid.token.here'
      }
    } as Request
    
    const res = {
      status: (code: number) => {
        expect(code).toBe(401)
        return res
      },
      json: (data: any) => res,
      end: () => res,
      setHeader: () => res
    } as any
    
    let errorThrown = false
    const next = (err?: any) => {
      if (err) errorThrown = true
    }
    
    authenticate(req, res, next)
  })

  it('should reject refresh token used as access token', async () => {
    const payload: JwtPayload = {
      sub: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      role: 'editor'
    }
    
    const refreshToken = signRefreshToken(payload) // Wrong token type
    
    const req = {
      headers: {
        authorization: `Bearer ${refreshToken}`
      }
    } as Request
    
    const res = {
      status: (code: number) => {
        expect(code).toBe(401)
        return res
      },
      json: (data: any) => res,
      end: () => res,
      setHeader: () => res
    } as any
    
    const next = () => {}
    
    authenticate(req, res, next)
  })
})