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
import type { ValidateFunction } from 'ajv';
/**
 * Validates a complete Document object.
 * @since 1.0.0
 */
export declare const validateDocument: ValidateFunction<{
  [x: string]: {};
}>;
/**
 * Validates a document update operation.
 * @since 1.0.0
 */
export declare const validateDocumentUpdate: ValidateFunction<{
  [x: string]: {};
}>;
/**
 * Validates a create document request payload.
 * @since 1.0.0
 */
export declare const validateCreateDocumentRequest: ValidateFunction<{
  [x: string]: {};
}>;
/**
 * Validates an update document request payload.
 * @since 1.0.0
 */
export declare const validateUpdateDocumentRequest: ValidateFunction<{
  [x: string]: {};
}>;
/**
 * Validates an error response object.
 * @since 1.0.0
 */
export declare const validateErrorResponse: ValidateFunction<{
  [x: string]: {};
}>;
/**
 * Validates a complete User object.
 * @since 1.0.0
 */
export declare const validateUser: ValidateFunction<{
  [x: string]: {};
}>;
/**
 * Validates a create user (registration) request.
 * @since 1.0.0
 */
export declare const validateCreateUserRequest: ValidateFunction<{
  [x: string]: {};
}>;
/**
 * Validates a login request payload.
 * @since 1.0.0
 */
export declare const validateLoginRequest: ValidateFunction<{
  [x: string]: {};
}>;
/**
 * Validates an authentication response.
 * @since 1.0.0
 */
export declare const validateAuthResponse: ValidateFunction<{
  [x: string]: {};
}>;
/**
 * Validates a refresh token request.
 * @since 1.0.0
 */
export declare const validateRefreshTokenRequest: ValidateFunction<{
  [x: string]: {};
}>;
/**
 * Validates a JWT payload structure.
 * @since 1.0.0
 */
export declare const validateJwtPayload: ValidateFunction<{
  [x: string]: {};
}>;
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
export declare function getValidationErrors(
  validator: ValidateFunction,
): ValidationError[];
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
export declare function validateOrThrow<T>(
  data: unknown,
  validator: ValidateFunction<T>,
  errorMessage?: string,
): T;
//# sourceMappingURL=validation.d.ts.map
