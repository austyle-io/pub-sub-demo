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
import type { Static } from '@sinclair/typebox';
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
export declare const UserRoleSchema: import('@sinclair/typebox').TUnion<
  [
    import('@sinclair/typebox').TLiteral<'viewer'>,
    import('@sinclair/typebox').TLiteral<'editor'>,
    import('@sinclair/typebox').TLiteral<'owner'>,
    import('@sinclair/typebox').TLiteral<'admin'>,
  ]
>;
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
export declare const UserSchema: import('@sinclair/typebox').TObject<{
  id: import('@sinclair/typebox').TString;
  email: import('@sinclair/typebox').TString;
  password: import('@sinclair/typebox').TString;
  role: import('@sinclair/typebox').TUnion<
    [
      import('@sinclair/typebox').TLiteral<'viewer'>,
      import('@sinclair/typebox').TLiteral<'editor'>,
      import('@sinclair/typebox').TLiteral<'owner'>,
      import('@sinclair/typebox').TLiteral<'admin'>,
    ]
  >;
  createdAt: import('@sinclair/typebox').TString;
  updatedAt: import('@sinclair/typebox').TString;
}>;
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
export declare const PublicUserSchema: import('@sinclair/typebox').TObject<{
  email: import('@sinclair/typebox').TString;
  id: import('@sinclair/typebox').TString;
  role: import('@sinclair/typebox').TUnion<
    [
      import('@sinclair/typebox').TLiteral<'viewer'>,
      import('@sinclair/typebox').TLiteral<'editor'>,
      import('@sinclair/typebox').TLiteral<'owner'>,
      import('@sinclair/typebox').TLiteral<'admin'>,
    ]
  >;
  createdAt: import('@sinclair/typebox').TString;
  updatedAt: import('@sinclair/typebox').TString;
}>;
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
export declare const CreateUserRequestSchema: import(
  '@sinclair/typebox',
).TObject<{
  email: import('@sinclair/typebox').TString;
  password: import('@sinclair/typebox').TString;
}>;
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
export declare const LoginRequestSchema: import('@sinclair/typebox').TObject<{
  email: import('@sinclair/typebox').TString;
  password: import('@sinclair/typebox').TString;
}>;
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
export declare const AuthResponseSchema: import('@sinclair/typebox').TObject<{
  accessToken: import('@sinclair/typebox').TString;
  refreshToken: import('@sinclair/typebox').TString;
  user: import('@sinclair/typebox').TObject<{
    email: import('@sinclair/typebox').TString;
    id: import('@sinclair/typebox').TString;
    role: import('@sinclair/typebox').TUnion<
      [
        import('@sinclair/typebox').TLiteral<'viewer'>,
        import('@sinclair/typebox').TLiteral<'editor'>,
        import('@sinclair/typebox').TLiteral<'owner'>,
        import('@sinclair/typebox').TLiteral<'admin'>,
      ]
    >;
    createdAt: import('@sinclair/typebox').TString;
    updatedAt: import('@sinclair/typebox').TString;
  }>;
}>;
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
export declare const RefreshTokenRequestSchema: import(
  '@sinclair/typebox',
).TObject<{
  refreshToken: import('@sinclair/typebox').TString;
}>;
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
export declare const JwtPayloadSchema: import('@sinclair/typebox').TObject<{
  sub: import('@sinclair/typebox').TString;
  email: import('@sinclair/typebox').TString;
  role: import('@sinclair/typebox').TUnion<
    [
      import('@sinclair/typebox').TLiteral<'viewer'>,
      import('@sinclair/typebox').TLiteral<'editor'>,
      import('@sinclair/typebox').TLiteral<'owner'>,
      import('@sinclair/typebox').TLiteral<'admin'>,
    ]
  >;
  iat: import('@sinclair/typebox').TOptional<
    import('@sinclair/typebox').TNumber
  >;
  exp: import('@sinclair/typebox').TOptional<
    import('@sinclair/typebox').TNumber
  >;
}>;
/**
 * JWT payload type.
 * @since 1.0.0
 */
export type JwtPayload = Static<typeof JwtPayloadSchema>;
//# sourceMappingURL=schemas.d.ts.map
