/**
 * Authentication and user-related schemas using TypeBox for runtime validation.
 *
 * This module defines the core authentication schemas used throughout the application
 * for user management, authentication, and authorization. All schemas provide both
 * compile-time TypeScript types and runtime validation capabilities.
 *
 * @module auth/schemas
 * @since 1.0.0
 */

import { type Static, Type } from '@sinclair/typebox';

/**
 * Schema for user roles in the system.
 *
 * Defines the available permission levels:
 * - 'viewer': Can only read documents
 * - 'editor': Can read and edit documents
 * - 'owner': Can read, edit, and manage document permissions
 * - 'admin': Full system access
 *
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * const userRole: UserRole = 'editor';
 * const isValid = UserRoleSchema.Check(userRole);
 * ```
 */
export const UserRoleSchema = Type.Union([
  Type.Literal('viewer'),
  Type.Literal('editor'),
  Type.Literal('owner'),
  Type.Literal('admin'),
]);

/**
 * User role type derived from the schema.
 * @since 1.0.0
 */
export type UserRole = Static<typeof UserRoleSchema>;

/**
 * Schema for a complete user object with all properties.
 *
 * Contains all user information including sensitive data like hashed passwords.
 * This schema should only be used internally and never exposed to clients.
 *
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * const user: User = {
 *   id: '123e4567-e89b-12d3-a456-426614174000',
 *   email: 'user@example.com',
 *   password: '$2b$10$K1yHwRM6zSKSQVxZb3qYnuV2s8Q0/9ocSV5GKxXQiNa',  // bcrypt hash
 *   role: 'editor',
 *   createdAt: '2025-01-21T10:00:00Z',
 *   updatedAt: '2025-01-21T10:00:00Z'
 * };
 * ```
 */
export const UserSchema = Type.Object({
  id: Type.String({
    format: 'uuid',
    description: 'Unique user identifier',
  }),
  email: Type.String({
    format: 'email',
    description: 'User email address',
  }),
  password: Type.String({
    minLength: 60,
    description: 'Bcrypt hashed password',
  }),
  role: UserRoleSchema,
  createdAt: Type.String({
    format: 'date-time',
    description: 'ISO 8601 date-time when user was created',
  }),
  updatedAt: Type.String({
    format: 'date-time',
    description: 'ISO 8601 date-time when user was last updated',
  }),
});

/**
 * Complete user type including sensitive data.
 * @since 1.0.0
 */
export type User = Static<typeof UserSchema>;

/**
 * Schema for public user data without sensitive information.
 *
 * This schema omits the password field and is safe to expose to clients.
 * Use this for API responses and client-side data.
 *
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * const publicUser: PublicUser = {
 *   id: '123e4567-e89b-12d3-a456-426614174000',
 *   email: 'user@example.com',
 *   role: 'editor',
 *   createdAt: '2025-01-21T10:00:00Z',
 *   updatedAt: '2025-01-21T10:00:00Z'
 * };
 * ```
 */
export const PublicUserSchema = Type.Omit(UserSchema, ['password']);

/**
 * Public user type without sensitive data.
 * @since 1.0.0
 */
export type PublicUser = Static<typeof PublicUserSchema>;

/**
 * Schema for user registration requests.
 *
 * Validates new user registration data with password requirements:
 * - Email must be valid format
 * - Password must be 8-100 characters
 *
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * const request: CreateUserRequest = {
 *   email: 'newuser@example.com',
 *   password: 'SecurePass123!'
 * };
 * const isValid = CreateUserRequestSchema.Check(request);
 * ```
 */
export const CreateUserRequestSchema = Type.Object({
  email: Type.String({
    format: 'email',
    description: 'User email address',
  }),
  password: Type.String({
    minLength: 8,
    maxLength: 100,
    description: 'User password (8-100 characters)',
  }),
});

/**
 * User registration request type.
 * @since 1.0.0
 */
export type CreateUserRequest = Static<typeof CreateUserRequestSchema>;

/**
 * Schema for user login requests.
 *
 * Validates login credentials. No password length requirements
 * as we're checking against existing accounts.
 *
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * const loginData: LoginRequest = {
 *   email: 'user@example.com',
 *   password: 'MyPassword123'
 * };
 * ```
 */
export const LoginRequestSchema = Type.Object({
  email: Type.String({
    format: 'email',
    description: 'User email address',
  }),
  password: Type.String({
    description: 'User password',
  }),
});

/**
 * Login request type.
 * @since 1.0.0
 */
export type LoginRequest = Static<typeof LoginRequestSchema>;

/**
 * Schema for authentication responses.
 *
 * Contains JWT tokens and user information returned after successful
 * authentication (login or registration):
 * - Access token: Short-lived (15 minutes) for API requests
 * - Refresh token: Long-lived (7 days) for token renewal
 * - User data: Public user information without password
 *
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * const authResponse: AuthResponse = {
 *   accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ',
 *   refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwicmVmcmVzaCI6dHJ1ZSwiaWF0IjoxNTE2MjM5MDIyfQ',
 *   user: {
 *     id: '123e4567-e89b-12d3-a456-426614174000',
 *     email: 'user@example.com',
 *     role: 'editor',
 *     createdAt: '2025-01-21T10:00:00Z',
 *     updatedAt: '2025-01-21T10:00:00Z'
 *   }
 * };
 * ```
 */
export const AuthResponseSchema = Type.Object({
  accessToken: Type.String({
    description: 'JWT access token (short-lived, 15 minutes)',
  }),
  refreshToken: Type.String({
    description: 'JWT refresh token (longer-lived, 7 days)',
  }),
  user: PublicUserSchema,
});

/**
 * Authentication response type.
 * @since 1.0.0
 */
export type AuthResponse = Static<typeof AuthResponseSchema>;

/**
 * Schema for refresh token requests.
 *
 * Used to exchange a valid refresh token for new access/refresh token pair.
 *
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * const refreshRequest: RefreshTokenRequest = {
 *   refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwicmVmcmVzaCI6dHJ1ZSwiaWF0IjoxNTE2MjM5MDIyfQ'
 * };
 * ```
 */
export const RefreshTokenRequestSchema = Type.Object({
  refreshToken: Type.String({
    description: 'JWT refresh token',
  }),
});

/**
 * Refresh token request type.
 * @since 1.0.0
 */
export type RefreshTokenRequest = Static<typeof RefreshTokenRequestSchema>;

/**
 * Schema for JWT token payload.
 *
 * Standard JWT claims with custom user information:
 * - sub: Subject claim containing user ID
 * - email: User's email address
 * - role: User's permission level
 * - iat: Issued at timestamp (optional, set by JWT library)
 * - exp: Expiration timestamp (optional, set by JWT library)
 *
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * const payload: JwtPayload = {
 *   sub: '123e4567-e89b-12d3-a456-426614174000',
 *   email: 'user@example.com',
 *   role: 'editor',
 *   iat: 1643723400,
 *   exp: 1643724300
 * };
 * ```
 */
export const JwtPayloadSchema = Type.Object({
  sub: Type.String({
    description: 'Subject (user ID)',
  }),
  email: Type.String({
    format: 'email',
  }),
  role: UserRoleSchema,
  iat: Type.Optional(Type.Number()),
  exp: Type.Optional(Type.Number()),
});

/**
 * JWT payload type.
 * @since 1.0.0
 */
export type JwtPayload = Static<typeof JwtPayloadSchema>;
