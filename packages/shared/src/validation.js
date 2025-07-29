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
var __importDefault =
  (this && this.__importDefault) ||
  ((mod) => (mod && mod.__esModule ? mod : { default: mod }));
Object.defineProperty(exports, '__esModule', { value: true });
exports.validateJwtPayload =
  exports.validateRefreshTokenRequest =
  exports.validateAuthResponse =
  exports.validateLoginRequest =
  exports.validateCreateUserRequest =
  exports.validateUser =
  exports.validateErrorResponse =
  exports.validateUpdateDocumentRequest =
  exports.validateCreateDocumentRequest =
  exports.validateDocumentUpdate =
  exports.validateDocument =
    void 0;
exports.getValidationErrors = getValidationErrors;
exports.validateOrThrow = validateOrThrow;
const ajv_1 = __importDefault(require('ajv'));
const ajv_formats_1 = __importDefault(require('ajv-formats'));
const auth_1 = require('./auth');
const schemas_1 = require('./schemas');
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
const ajv = new ajv_1.default({
  allErrors: true,
  removeAdditional: 'all',
  useDefaults: true,
  coerceTypes: true,
});
// Add support for format validation (email, uuid, date-time, etc.)
(0, ajv_formats_1.default)(ajv);
// Document validators
/**
 * Validates a complete Document object.
 * @since 1.0.0
 */
exports.validateDocument = ajv.compile(schemas_1.DocumentSchema);
/**
 * Validates a document update operation.
 * @since 1.0.0
 */
exports.validateDocumentUpdate = ajv.compile(schemas_1.DocumentUpdateSchema);
/**
 * Validates a create document request payload.
 * @since 1.0.0
 */
exports.validateCreateDocumentRequest = ajv.compile(
  schemas_1.CreateDocumentRequestSchema,
);
/**
 * Validates an update document request payload.
 * @since 1.0.0
 */
exports.validateUpdateDocumentRequest = ajv.compile(
  schemas_1.UpdateDocumentRequestSchema,
);
/**
 * Validates an error response object.
 * @since 1.0.0
 */
exports.validateErrorResponse = ajv.compile(schemas_1.ErrorResponseSchema);
// Authentication validators
/**
 * Validates a complete User object.
 * @since 1.0.0
 */
exports.validateUser = ajv.compile(auth_1.UserSchema);
/**
 * Validates a create user (registration) request.
 * @since 1.0.0
 */
exports.validateCreateUserRequest = ajv.compile(auth_1.CreateUserRequestSchema);
/**
 * Validates a login request payload.
 * @since 1.0.0
 */
exports.validateLoginRequest = ajv.compile(auth_1.LoginRequestSchema);
/**
 * Validates an authentication response.
 * @since 1.0.0
 */
exports.validateAuthResponse = ajv.compile(auth_1.AuthResponseSchema);
/**
 * Validates a refresh token request.
 * @since 1.0.0
 */
exports.validateRefreshTokenRequest = ajv.compile(
  auth_1.RefreshTokenRequestSchema,
);
/**
 * Validates a JWT payload structure.
 * @since 1.0.0
 */
exports.validateJwtPayload = ajv.compile(auth_1.JwtPayloadSchema);
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
function getValidationErrors(validator) {
  if (!validator.errors) return [];
  return validator.errors.map((error) => ({
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
function validateOrThrow(data, validator, errorMessage = 'Validation failed') {
  if (!validator(data)) {
    const errors = getValidationErrors(validator);
    const error = new Error(errorMessage);
    error.validationErrors = errors;
    throw error;
  }
  // Safe assertion: validator confirms data matches type T
  return data;
}
