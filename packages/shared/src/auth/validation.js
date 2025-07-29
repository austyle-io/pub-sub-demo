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
var __importDefault =
  (this && this.__importDefault) ||
  ((mod) => (mod && mod.__esModule ? mod : { default: mod }));
Object.defineProperty(exports, '__esModule', { value: true });
exports.isValidUser = exports.isValidEmail = void 0;
exports.isJwtPayload = isJwtPayload;
exports.isApiError = isApiError;
exports.isAuthResponse = isAuthResponse;
exports.isCreateUserRequest = isCreateUserRequest;
exports.isLoginRequest = isLoginRequest;
exports.isRefreshTokenRequest = isRefreshTokenRequest;
const lodash_isnil_1 = __importDefault(require('lodash.isnil'));
const lodash_isobject_1 = __importDefault(require('lodash.isobject'));
const lodash_isstring_1 = __importDefault(require('lodash.isstring'));
const validation_1 = require('../validation');
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
function isJwtPayload(value) {
  if (
    (0, lodash_isnil_1.default)(value) ||
    !(0, lodash_isobject_1.default)(value)
  ) {
    return false;
  }
  const payload = value;
  return (
    (0, lodash_isstring_1.default)(payload['sub']) &&
    (0, lodash_isstring_1.default)(payload['email']) &&
    (0, lodash_isstring_1.default)(payload['role']) &&
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
function isApiError(value) {
  return (
    (0, lodash_isobject_1.default)(value) &&
    (0, lodash_isstring_1.default)(value['error'])
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
function isAuthResponse(value) {
  if (!(0, lodash_isobject_1.default)(value)) return false;
  const resp = value;
  return (
    (0, lodash_isstring_1.default)(resp['accessToken']) &&
    (0, lodash_isstring_1.default)(resp['refreshToken']) &&
    (0, exports.isValidUser)(resp['user'])
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
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
exports.isValidEmail = isValidEmail;
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
const isValidUser = (obj) => {
  if (!(0, lodash_isobject_1.default)(obj)) return false;
  const u = obj;
  const id = u['id'];
  const email = u['email'];
  const role = u['role'];
  return (
    (0, lodash_isstring_1.default)(id) &&
    id.length > 0 &&
    (0, lodash_isstring_1.default)(email) &&
    (0, exports.isValidEmail)(email) &&
    (0, lodash_isstring_1.default)(role) &&
    ['viewer', 'editor', 'owner', 'admin'].includes(role)
  );
};
exports.isValidUser = isValidUser;
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
function isCreateUserRequest(value) {
  return (0, validation_1.validateCreateUserRequest)(value);
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
function isLoginRequest(value) {
  return (0, validation_1.validateLoginRequest)(value);
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
function isRefreshTokenRequest(value) {
  return (0, validation_1.validateRefreshTokenRequest)(value);
}
