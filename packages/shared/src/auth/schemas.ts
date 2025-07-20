import { Type, Static } from '@sinclair/typebox'

export const UserRoleSchema = Type.Union([
  Type.Literal('viewer'),
  Type.Literal('editor'),
  Type.Literal('owner'),
  Type.Literal('admin')
])

export type UserRole = Static<typeof UserRoleSchema>

export const UserSchema = Type.Object({
  id: Type.String({ 
    format: 'uuid',
    description: 'Unique user identifier' 
  }),
  email: Type.String({ 
    format: 'email',
    description: 'User email address'
  }),
  password: Type.String({ 
    minLength: 60,
    description: 'Bcrypt hashed password'
  }),
  role: UserRoleSchema,
  createdAt: Type.String({
    format: 'date-time',
    description: 'ISO 8601 date-time when user was created'
  }),
  updatedAt: Type.String({
    format: 'date-time',
    description: 'ISO 8601 date-time when user was last updated'
  })
})

export type User = Static<typeof UserSchema>

export const PublicUserSchema = Type.Omit(UserSchema, ['password'])
export type PublicUser = Static<typeof PublicUserSchema>

export const CreateUserRequestSchema = Type.Object({
  email: Type.String({ 
    format: 'email',
    description: 'User email address'
  }),
  password: Type.String({ 
    minLength: 8,
    maxLength: 100,
    description: 'User password (8-100 characters)'
  })
})

export type CreateUserRequest = Static<typeof CreateUserRequestSchema>

export const LoginRequestSchema = Type.Object({
  email: Type.String({ 
    format: 'email',
    description: 'User email address'
  }),
  password: Type.String({ 
    description: 'User password'
  })
})

export type LoginRequest = Static<typeof LoginRequestSchema>

export const AuthResponseSchema = Type.Object({
  accessToken: Type.String({
    description: 'JWT access token (short-lived, 15 minutes)'
  }),
  refreshToken: Type.String({
    description: 'JWT refresh token (longer-lived, 7 days)'
  }),
  user: PublicUserSchema
})

export type AuthResponse = Static<typeof AuthResponseSchema>

export const RefreshTokenRequestSchema = Type.Object({
  refreshToken: Type.String({
    description: 'JWT refresh token'
  })
})

export type RefreshTokenRequest = Static<typeof RefreshTokenRequestSchema>

export const JwtPayloadSchema = Type.Object({
  sub: Type.String({
    description: 'Subject (user ID)'
  }),
  email: Type.String({
    format: 'email'
  }),
  role: UserRoleSchema,
  iat: Type.Optional(Type.Number()),
  exp: Type.Optional(Type.Number())
})

export type JwtPayload = Static<typeof JwtPayloadSchema>