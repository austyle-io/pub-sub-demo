export * from "./jwt";
export * from "./password";
export * from "./schemas";

import type {
  CreateUserRequest,
  LoginRequest,
  RefreshTokenRequest,
  JwtPayload,
  AuthResponse,
} from "./schemas";
import {
  validateCreateUserRequest,
  validateLoginRequest,
  validateRefreshTokenRequest,
} from "../validation";
import isNil from "lodash.isnil";
import isObject from "lodash.isobject";
import isString from "lodash.isstring";

/**
 * Runtime type guard for JWT payload from JSON.parse
 */
export function isJwtPayload(value: unknown): value is JwtPayload {
  if (isNil(value) || !isObject(value)) {
    return false;
  }

  const payload = value as Record<string, unknown>;
  return (
    isString(payload["sub"]) &&
    isString(payload["email"]) &&
    isString(payload["role"]) &&
    typeof payload["exp"] === "number" &&
    typeof payload["iat"] === "number"
  );
}

/**
 * Runtime type guard for API error responses
 */
export function isApiError(
  value: unknown
): value is { error: string; details?: unknown } {
  if (isNil(value) || !isObject(value)) {
    return false;
  }

  const error = value as Record<string, unknown>;
  return isString(error["error"]);
}

/**
 * Runtime type guard for authentication response from API
 */
export function isAuthResponse(value: unknown): value is AuthResponse {
  if (isNil(value) || !isObject(value)) {
    return false;
  }

  const response = value as Record<string, unknown>;
  return (
    isString(response["accessToken"]) &&
    isString(response["refreshToken"]) &&
    !isNil(response["user"]) &&
    isObject(response["user"])
  );
}

// Type guard validators
export function isCreateUserRequest(
  value: unknown
): value is CreateUserRequest {
  return validateCreateUserRequest(value);
}

export function isLoginRequest(value: unknown): value is LoginRequest {
  return validateLoginRequest(value);
}

export function isRefreshTokenRequest(
  value: unknown
): value is RefreshTokenRequest {
  return validateRefreshTokenRequest(value);
}
