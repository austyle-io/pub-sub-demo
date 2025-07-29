/**
 * JWT token management utilities for authentication.
 *
 * This module provides functions for creating, verifying, and decoding JWT tokens
 * used in the authentication system. It manages both access tokens (short-lived)
 * and refresh tokens (long-lived) with proper secret management.
 *
 * @module auth/jwt
 * @since 1.0.0
 */
import type { JwtPayload as AuthJwtPayload } from './schemas';
export type { JwtPayload } from './schemas';
/**
 * Retrieves the access token secret from environment variables.
 *
 * Access token secret is used for signing and verifying short-lived access tokens.
 *
 * @returns The JWT access token secret
 * @throws {Error} If JWT_ACCESS_SECRET environment variable is not set
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * const secret = getAccessTokenSecret();
 * const token = jwt.sign(payload, secret);
 * ```
 */
export declare const getAccessTokenSecret: () => string;
/**
 * Retrieves the refresh token secret from environment variables.
 *
 * Refresh token secret is used for signing and verifying long-lived refresh tokens.
 *
 * @returns The JWT refresh token secret
 * @throws {Error} If JWT_REFRESH_SECRET environment variable is not set
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * const secret = getRefreshTokenSecret();
 * const refreshToken = jwt.sign(payload, secret, { expiresIn: '7d' });
 * ```
 */
export declare const getRefreshTokenSecret: () => string;
/**
 * Signs a JWT access token with the provided payload.
 *
 * Creates a short-lived token (15 minutes) for API authentication.
 * The token includes issuer and audience claims for added security.
 *
 * @param payload - JWT payload containing user information
 * @returns Signed JWT access token string
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * const payload: JwtPayload = {
 *   sub: user.id,
 *   email: user.email,
 *   role: user.role
 * };
 * const accessToken = signAccessToken(payload);
 * ```
 */
export declare const signAccessToken: (payload: AuthJwtPayload) => string;
/**
 * Signs a JWT refresh token with the provided payload.
 *
 * Creates a long-lived token (7 days) for obtaining new access tokens.
 * The token includes issuer and audience claims specific to refresh operations.
 *
 * @param payload - JWT payload containing user information
 * @returns Signed JWT refresh token string
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * const payload: JwtPayload = {
 *   sub: user.id,
 *   email: user.email,
 *   role: user.role
 * };
 * const refreshToken = signRefreshToken(payload);
 * ```
 */
export declare const signRefreshToken: (payload: AuthJwtPayload) => string;
/**
 * Verifies and decodes a JWT access token.
 *
 * Validates the token signature, expiration, issuer, and audience claims.
 *
 * @param token - JWT access token string to verify
 * @returns Decoded JWT payload
 * @throws {JsonWebTokenError} If token is invalid or expired
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * try {
 *   const payload = verifyAccessToken(token);
 *   console.log(`Authenticated user: ${payload.email}`);
 * } catch (error) {
 *   console.error('Invalid or expired token');
 * }
 * ```
 */
export declare const verifyAccessToken: (token: string) => AuthJwtPayload;
/**
 * Verifies and decodes a JWT refresh token.
 *
 * Validates the token signature, expiration, issuer, and audience claims
 * specific to refresh tokens.
 *
 * @param token - JWT refresh token string to verify
 * @returns Decoded JWT payload
 * @throws {JsonWebTokenError} If token is invalid or expired
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * try {
 *   const payload = verifyRefreshToken(refreshToken);
 *   // Generate new token pair
 *   const newAccessToken = signAccessToken(payload);
 *   const newRefreshToken = signRefreshToken(payload);
 * } catch (error) {
 *   console.error('Invalid refresh token');
 * }
 * ```
 */
export declare const verifyRefreshToken: (token: string) => AuthJwtPayload;
/**
 * Decodes a JWT token without verifying its signature.
 *
 * Useful for reading token contents when verification is not needed,
 * such as checking expiration before making API calls.
 *
 * @param token - JWT token string to decode
 * @returns Decoded JWT payload or null if decoding fails
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * const payload = decodeToken(token);
 * if (payload) {
 *   const expiresAt = new Date(payload.exp! * 1000);
 *   console.log(`Token expires at: ${expiresAt}`);
 * }
 * ```
 */
export declare const decodeToken: (token: string) => AuthJwtPayload | null;
//# sourceMappingURL=jwt.d.ts.map
