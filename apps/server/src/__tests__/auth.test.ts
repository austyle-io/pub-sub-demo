import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { app, server } from '../server'
import { connectToDatabase, closeDatabaseConnection, getUsersCollection } from '../utils/database'
import type { CreateUserRequest, LoginRequest } from '@collab-edit/shared'

describe('Auth Endpoints', () => {
  beforeAll(async () => {
    // Set test JWT secret
    process.env['JWT_SECRET'] = 'test-secret-key-for-testing-only'
    await connectToDatabase()
  })
  
  afterAll(async () => {
    await closeDatabaseConnection()
    server.close()
  })
  
  beforeEach(async () => {
    // Clear users collection before each test
    const users = getUsersCollection()
    await users.deleteMany({})
  })
  
  describe('POST /api/auth/signup', () => {
    it('should create a new user with valid data', async () => {
      const newUser: CreateUserRequest = {
        email: 'test@example.com',
        password: 'password123'
      }
      
      const res = await request(app)
        .post('/api/auth/signup')
        .send(newUser)
        .expect(201)
      
      expect(res.body).toHaveProperty('accessToken')
      expect(res.body).toHaveProperty('refreshToken')
      expect(res.body).toHaveProperty('user')
      expect(res.body.user.email).toBe(newUser.email)
      expect(res.body.user.role).toBe('editor')
      expect(res.body.user).not.toHaveProperty('password')
    })
    
    it('should reject duplicate email', async () => {
      const newUser: CreateUserRequest = {
        email: 'test@example.com',
        password: 'password123'
      }
      
      // Create first user
      await request(app)
        .post('/api/auth/signup')
        .send(newUser)
        .expect(201)
      
      // Try to create duplicate
      const res = await request(app)
        .post('/api/auth/signup')
        .send(newUser)
        .expect(409)
      
      expect(res.body.error).toBe('User already exists')
    })
    
    it('should reject invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'invalid-email',
          password: 'password123'
        })
        .expect(400)
      
      expect(res.body.error).toBe('Validation failed')
      expect(res.body.details).toBeDefined()
    })
    
    it('should reject short password', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'short'
        })
        .expect(400)
      
      expect(res.body.error).toBe('Validation failed')
    })
  })
  
  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
    })
    
    it('should login with valid credentials', async () => {
      const loginData: LoginRequest = {
        email: 'test@example.com',
        password: 'password123'
      }
      
      const res = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200)
      
      expect(res.body).toHaveProperty('accessToken')
      expect(res.body).toHaveProperty('refreshToken')
      expect(res.body).toHaveProperty('user')
      expect(res.body.user.email).toBe(loginData.email)
    })
    
    it('should reject invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrong-password'
        })
        .expect(401)
      
      expect(res.body.error).toBe('Invalid credentials')
    })
    
    it('should reject non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
        .expect(401)
      
      expect(res.body.error).toBe('Invalid credentials')
    })
  })
  
  describe('POST /api/auth/refresh', () => {
    it('should refresh tokens with valid refresh token', async () => {
      // Create and login user
      const loginRes = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(201)
      
      const { refreshToken } = loginRes.body
      
      // Refresh tokens
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200)
      
      expect(res.body).toHaveProperty('accessToken')
      expect(res.body).toHaveProperty('refreshToken')
      expect(res.body).toHaveProperty('user')
      
      // New tokens should be different
      expect(res.body.accessToken).not.toBe(loginRes.body.accessToken)
      expect(res.body.refreshToken).not.toBe(loginRes.body.refreshToken)
    })
    
    it('should reject invalid refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401)
      
      expect(res.body.error).toBe('Invalid refresh token')
    })
  })
})