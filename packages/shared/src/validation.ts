/**
 * Runtime validation utilities using AJV (Another JSON Schema Validator).
 *
 * This module provides compiled validators for all schema types in the application,
 * along with utility functions for error handling and validation enforcement.
 * All validators are pre-compiled for optimal performance.
 *
 * @module validation
 * @since 1.0.0
 */

import type { ErrorObject, ValidateFunction } from 'ajv';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import {
  AuthResponseSchema,
  CreateUserRequestSchema,
  JwtPayloadSchema,
  LoginRequestSchema,
  RefreshTokenRequestSchema,
  UserSchema,
} from './auth';
import {
  CreateDocumentRequestSchema,
  DocumentSchema,
  DocumentUpdateSchema,
  ErrorResponseSchema,
  UpdateDocumentRequestSchema,
} from './schemas';

/**
 * AJV instance configured for the application.
 *
 * Configuration:
 * - allErrors: true - Collect all validation errors, not just the first
 * - removeAdditional: 'all' - Remove properties not defined in schema
 * - useDefaults: true - Apply default values from schema
 * - coerceTypes: true - Coerce types (e.g., string to number)
 *
 * @internal
 */
const ajv = new Ajv({
  allErrors: true,
  removeAdditional: 'all',
  useDefaults: true,
  coerceTypes: true,
});

// Add support for format validation (email, uuid, date-time, etc.)
addFormats(ajv);

// Document validators
/**
 * Validates a complete Document object.
 * @since 1.0.0
 */
export const validateDocument = ajv.compile(DocumentSchema);

/**
 * Validates a document update operation.
 * @since 1.0.0
 */
export const validateDocumentUpdate = ajv.compile(DocumentUpdateSchema);

/**
 * Validates a create document request payload.
 * @since 1.0.0
 */
export const validateCreateDocumentRequest = ajv.compile(
  CreateDocumentRequestSchema,
);

/**
 * Validates an update document request payload.
 * @since 1.0.0
 */
export const validateUpdateDocumentRequest = ajv.compile(
  UpdateDocumentRequestSchema,
);

/**
 * Validates an error response object.
 * @since 1.0.0
 */
export const validateErrorResponse = ajv.compile(ErrorResponseSchema);

// Authentication validators
/**
 * Validates a complete User object.
 * @since 1.0.0
 */
export const validateUser = ajv.compile(UserSchema);

/**
 * Validates a create user (registration) request.
 * @since 1.0.0
 */
export const validateCreateUserRequest = ajv.compile(CreateUserRequestSchema);

/**
 * Validates a login request payload.
 * @since 1.0.0
 */
export const validateLoginRequest = ajv.compile(LoginRequestSchema);

/**
 * Validates an authentication response.
 * @since 1.0.0
 */
export const validateAuthResponse = ajv.compile(AuthResponseSchema);

/**
 * Validates a refresh token request.
 * @since 1.0.0
 */
export const validateRefreshTokenRequest = ajv.compile(
  RefreshTokenRequestSchema,
);

/**
 * Validates a JWT payload structure.
 * @since 1.0.0
 */
export const validateJwtPayload = ajv.compile(JwtPayloadSchema);

/**
 * Structured validation error format.
 *
 * Provides field-level error information for better error reporting.
 *
 * @since 1.0.0
 */
export type ValidationError = {
  /** The field path where validation failed */
  field: string;
  /** Human-readable error message */
  message: string;
};

/**
 * Extracts validation errors from an AJV validator.
 *
 * Transforms AJV's error format into a more user-friendly structure
 * with field paths and messages.
 *
 * @param validator - AJV validator function that has been executed
 * @returns Array of validation errors, empty if validation passed
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * const isValid = validateUser(data);
 * if (!isValid) {
 *   const errors = getValidationErrors(validateUser);
 *   errors.forEach(error => {
 *     console.error(`${error.field}: ${error.message}`);
 *   });
 * }
 * ```
 */
export function getValidationErrors(
  validator: ValidateFunction,
): ValidationError[] {
  if (!validator.errors) return [];

  return validator.errors.map((error: ErrorObject) => ({
    field: error.instancePath ?? error.schemaPath,
    message: error.message ?? 'Validation failed',
  }));
}

/**
 * Validates data and throws an error if validation fails.
 *
 * This utility function combines validation with error handling,
 * providing a type-safe way to ensure data conforms to a schema.
 * The thrown error includes detailed validation information.
 *
 * @template T - The expected type after successful validation
 * @param data - Unknown data to validate
 * @param validator - AJV validator function for type T
 * @param errorMessage - Custom error message (default: 'Validation failed')
 * @returns The validated data typed as T
 * @throws {Error} Error with validationErrors property containing field-level errors
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * try {
 *   const user = validateOrThrow(requestData, validateUser, 'Invalid user data');
 *   // user is now typed as User
 *   await saveUser(user);
 * } catch (error) {
 *   if ('validationErrors' in error) {
 *     // Handle validation errors
 *     console.error('Validation failed:', error.validationErrors);
 *   }
 * }
 * ```
 */
export function validateOrThrow<T>(
  data: unknown,
  validator: ValidateFunction<T>,
  errorMessage = 'Validation failed',
): T {
  if (!validator(data)) {
    const errors = getValidationErrors(validator);
    const error = new Error(errorMessage) as Error & {
      validationErrors: ValidationError[];
    };
    error.validationErrors = errors;
    throw error;
  }
  // Safe assertion: validator confirms data matches type T
  return data as T;
}
