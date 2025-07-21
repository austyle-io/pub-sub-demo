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
 */
export function isApiError(
  value: unknown,
): value is { error: string; details?: unknown } {
  return isObject(value) && isString((value as Record<string, unknown>)['error']);
}

/**
 * Runtime type guard for authentication responses.
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
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

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

export function isCreateUserRequest(
  value: unknown,
): value is CreateUserRequest {
  return validateCreateUserRequest(value);
}

export function isLoginRequest(value: unknown): value is LoginRequest {
  return validateLoginRequest(value);
}

export function isRefreshTokenRequest(
  value: unknown,
): value is RefreshTokenRequest {
  return validateRefreshTokenRequest(value);
}
