Object.defineProperty(exports, '__esModule', { value: true });
exports.sanitizeApiError = exports.sanitizeError = void 0;
/**
 * @summary A dictionary of safe error keys that can be exposed to the client.
 * @private
 */
const SAFE_ERROR_KEY = {
  INVALID_CREDENTIALS: 'Invalid credentials',
  ACCOUNT_LOCKED: 'Account temporarily locked',
  TOKEN_EXPIRED: 'Session expired',
  INVALID_TOKEN: 'Authentication failed',
  INVALID_REFRESH_TOKEN: 'Invalid refresh token',
  INSUFFICIENT_PERMISSIONS: 'Access denied',
  DOCUMENT_NOT_FOUND: 'Document not found',
  NETWORK_ERROR: 'Connection error',
  USER_ALREADY_EXISTS: 'User already exists',
};
/**
 * @summary A mapping of safe error keys to user-friendly error messages.
 * @private
 */
const SAFE_ERROR_MESSAGES = {
  [SAFE_ERROR_KEY.INVALID_CREDENTIALS]: 'Invalid credentials',
  [SAFE_ERROR_KEY.ACCOUNT_LOCKED]: 'Account temporarily locked',
  [SAFE_ERROR_KEY.TOKEN_EXPIRED]: 'Session expired',
  [SAFE_ERROR_KEY.INVALID_TOKEN]: 'Authentication failed',
  [SAFE_ERROR_KEY.INVALID_REFRESH_TOKEN]: 'Invalid refresh token',
  [SAFE_ERROR_KEY.INSUFFICIENT_PERMISSIONS]: 'Access denied',
  [SAFE_ERROR_KEY.DOCUMENT_NOT_FOUND]: 'Document not found',
  [SAFE_ERROR_KEY.NETWORK_ERROR]: 'Connection error',
  [SAFE_ERROR_KEY.USER_ALREADY_EXISTS]: 'User already exists',
};
const isSafeErrorKey = (key) => {
  return Object.values(SAFE_ERROR_KEY).includes(key);
};
/**
 * @summary Sanitizes an error message to ensure it is safe for client-side display.
 * @remarks
 * This function checks if the error message is a known safe error. If it is, it
 * returns the corresponding user-friendly message. Otherwise, it returns a generic
 * error message to avoid exposing sensitive information.
 * @param error - The error message to sanitize.
 * @returns A safe error message.
 * @since 1.0.0
 */
const sanitizeError = (error) => {
  // Check if it's a known safe error
  if (isSafeErrorKey(error)) {
    return SAFE_ERROR_MESSAGES[error];
  }
  // Default safe message for unknown errors
  return 'An error occurred. Please try again.';
};
exports.sanitizeError = sanitizeError;
/**
 * @summary Sanitizes an error of unknown type to ensure it is safe for client-side display.
 * @remarks
 * This function handles errors of any type, extracts the message if it's an `Error`
 * object or a string, and then sanitizes it using the `sanitizeError` function.
 * @param error - The error to sanitize.
 * @returns A safe error message.
 * @since 1.0.0
 */
const sanitizeApiError = (error) => {
  if (error instanceof Error) {
    return (0, exports.sanitizeError)(error.message);
  }
  if (typeof error === 'string') {
    return (0, exports.sanitizeError)(error);
  }
  return 'An unexpected error occurred.';
};
exports.sanitizeApiError = sanitizeApiError;
