/**
 * Runtime validation functions for authentication-related types.
 *
 * This module provides type guards and validation utilities for authentication
 * data structures. All functions perform runtime checks to ensure type safety
 * when dealing with untrusted data from network requests or external sources.
 *
 * @module auth/validation
 * @since 1.0.0
 */

import isNil from 'lodash.isnil';
import isObject from 'lodash.isobject';
import isString from 'lodash.isstring';
import {
  validateCreateUserRequest,
  validateLoginRequest,
  validateRefreshTokenRequest,
} from '../validation';
import type {
  AuthResponse,
  CreateUserRequest,
  JwtPayload,
  LoginRequest,
  RefreshTokenRequest,
  User,
} from './schemas';

/**
 * Runtime type guard for JWT payload objects.
 *
 * Validates that a value conforms to the JwtPayload structure with all
 * required fields present and correctly typed.
 *
 * @param value - Unknown value to check
 * @returns True if value is a valid JwtPayload
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * const decoded = jwt.verify(token, secret);
 * if (isJwtPayload(decoded)) {
 *   console.log(`User ${decoded.sub} has role ${decoded.role}`);
 * }
 * ```
 */
export function isJwtPayload(value: unknown): value is JwtPayload {
  if (isNil(value) || !isObject(value)) {
    return false;
  }
  const payload = value as Record<string, unknown>;
  return (
    isString(payload['sub']) &&
    isString(payload['email']) &&
    isString(payload['role']) &&
    typeof payload['exp'] === 'number' &&
    typeof payload['iat'] === 'number'
  );
}

/**
 * Runtime type guard for generic API error objects.
 *
 * Checks if a value is an error response object with at least an error message.
 *
 * @param value - Unknown value to check
 * @returns True if value has an error string property
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * try {
 *   const response = await fetch('/api/auth/login', options);
 *   const data = await response.json();
 *   if (isApiError(data)) {
 *     console.error('Login failed:', data.error);
 *   }
 * } catch (e) {
 *   // handle network error
 * }
 * ```
 */
export function isApiError(
  value: unknown,
): value is { error: string; details?: unknown } {
  return (
    isObject(value) && isString((value as Record<string, unknown>)['error'])
  );
}

/**
 * Runtime type guard for authentication responses.
 *
 * Validates that a value contains valid access token, refresh token,
 * and user information.
 *
 * @param value - Unknown value to check
 * @returns True if value is a valid AuthResponse
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * const response = await authService.login(credentials);
 * if (isAuthResponse(response)) {
 *   localStorage.setItem('accessToken', response.accessToken);
 *   updateUserContext(response.user);
 * }
 * ```
 */
export function isAuthResponse(value: unknown): value is AuthResponse {
  if (!isObject(value)) return false;
  const resp = value as Record<string, unknown>;
  return (
    isString(resp['accessToken']) &&
    isString(resp['refreshToken']) &&
    isValidUser(resp['user'])
  );
}

//---------------------------------------------
// Additional helpers / validators
//---------------------------------------------

/**
 * Validates email format using a simple regex pattern.
 *
 * Checks for basic email structure: local@domain.tld
 *
 * @param email - Email string to validate
 * @returns True if email format is valid
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * if (isValidEmail('user@example.com')) {
 *   // proceed with registration
 * }
 * ```
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Runtime type guard for User objects.
 *
 * Validates that an object has all required user properties with correct types
 * and valid values (e.g., valid email format, known role).
 *
 * @param obj - Unknown value to check
 * @returns True if value is a valid User
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * const userData = await getUserFromDatabase(id);
 * if (isValidUser(userData)) {
 *   // userData is now typed as User
 *   console.log(`User ${userData.email} has role ${userData.role}`);
 * }
 * ```
 */
export const isValidUser = (obj: unknown): obj is User => {
  if (!isObject(obj)) return false;
  const u = obj as Record<string, unknown>;
  const id = u['id'];
  const email = u['email'];
  const role = u['role'];
  return (
    isString(id) &&
    id.length > 0 &&
    isString(email) &&
    isValidEmail(email) &&
    isString(role) &&
    ['viewer', 'editor', 'owner', 'admin'].includes(role)
  );
};

/**
 * Type guard for CreateUserRequest objects.
 *
 * Delegates to the TypeBox validator for complete schema validation.
 *
 * @param value - Unknown value to check
 * @returns True if value is a valid CreateUserRequest
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * const requestData = await request.json();
 * if (isCreateUserRequest(requestData)) {
 *   // requestData is typed as CreateUserRequest
 *   const user = await createUser(requestData);
 * }
 * ```
 */
export function isCreateUserRequest(
  value: unknown,
): value is CreateUserRequest {
  return validateCreateUserRequest(value);
}

/**
 * Type guard for LoginRequest objects.
 *
 * Delegates to the TypeBox validator for complete schema validation.
 *
 * @param value - Unknown value to check
 * @returns True if value is a valid LoginRequest
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * const loginData = await request.json();
 * if (isLoginRequest(loginData)) {
 *   const authResponse = await authenticateUser(loginData);
 * }
 * ```
 */
export function isLoginRequest(value: unknown): value is LoginRequest {
  return validateLoginRequest(value);
}

/**
 * Type guard for RefreshTokenRequest objects.
 *
 * Delegates to the TypeBox validator for complete schema validation.
 *
 * @param value - Unknown value to check
 * @returns True if value is a valid RefreshTokenRequest
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * const refreshData = await request.json();
 * if (isRefreshTokenRequest(refreshData)) {
 *   const newTokens = await refreshAuthTokens(refreshData);
 * }
 * ```
 */
export function isRefreshTokenRequest(
  value: unknown,
): value is RefreshTokenRequest {
  return validateRefreshTokenRequest(value);
}
