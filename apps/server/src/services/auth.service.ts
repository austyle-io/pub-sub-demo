import { v4 as uuidv4 } from 'uuid'
import {
  type User,
  type CreateUserRequest,
  type LoginRequest,
  type AuthResponse,
  type JwtPayload,
  hashPassword,
  verifyPassword,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
} from '@collab-edit/shared'
import { getUsersCollection } from '../utils/database'

export class AuthService {
  async createUser(data: CreateUserRequest): Promise<AuthResponse> {
    const users = getUsersCollection()
    
    // Check if user already exists
    const existingUser = await users.findOne({ email: data.email })
    if (existingUser) {
      throw new Error('User already exists')
    }
    
    // Create new user
    const hashedPassword = await hashPassword(data.password)
    const now = new Date().toISOString()
    
    const newUser: User = {
      id: uuidv4(),
      email: data.email,
      password: hashedPassword,
      role: 'editor', // Default role
      createdAt: now,
      updatedAt: now
    }
    
    await users.insertOne(newUser)
    
    // Generate tokens
    const jwtPayload: JwtPayload = {
      sub: newUser.id,
      email: newUser.email,
      role: newUser.role
    }
    
    const accessToken = signAccessToken(jwtPayload)
    const refreshToken = signRefreshToken(jwtPayload)
    
    // Return auth response without password
    const { password: _, ...publicUser } = newUser
    
    return {
      accessToken,
      refreshToken,
      user: publicUser
    }
  }
  
  async login(data: LoginRequest): Promise<AuthResponse> {
    const users = getUsersCollection()
    
    // Find user by email
    const user = await users.findOne({ email: data.email })
    if (!user) {
      throw new Error('Invalid credentials')
    }
    
    // Verify password
    const isValidPassword = await verifyPassword(data.password, user.password)
    if (!isValidPassword) {
      throw new Error('Invalid credentials')
    }
    
    // Generate tokens
    const jwtPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role
    }
    
    const accessToken = signAccessToken(jwtPayload)
    const refreshToken = signRefreshToken(jwtPayload)
    
    // Return auth response without password
    const { password: _, ...publicUser } = user
    
    return {
      accessToken,
      refreshToken,
      user: publicUser
    }
  }
  
  async refreshTokens(refreshToken: string): Promise<AuthResponse> {
    try {
      // Verify refresh token
      const payload = verifyRefreshToken(refreshToken)
      
      // Get fresh user data
      const users = getUsersCollection()
      const user = await users.findOne({ id: payload.sub })
      
      if (!user) {
        throw new Error('User not found')
      }
      
      // Generate new tokens
      const newJwtPayload: JwtPayload = {
        sub: user.id,
        email: user.email,
        role: user.role
      }
      
      const newAccessToken = signAccessToken(newJwtPayload)
      const newRefreshToken = signRefreshToken(newJwtPayload)
      
      // Return auth response without password
      const { password: _, ...publicUser } = user
      
      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: publicUser
      }
    } catch (error) {
      throw new Error('Invalid refresh token')
    }
  }
  
  async getUserById(userId: string): Promise<User | null> {
    const users = getUsersCollection()
    return users.findOne({ id: userId })
  }
}