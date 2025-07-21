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
} as const;

const SAFE_ERROR_MESSAGES: Record<SafeErrorKey, string> = {
  [SAFE_ERROR_KEY.INVALID_CREDENTIALS]: 'Invalid credentials',
  [SAFE_ERROR_KEY.ACCOUNT_LOCKED]: 'Account temporarily locked',
  [SAFE_ERROR_KEY.TOKEN_EXPIRED]: 'Session expired',
  [SAFE_ERROR_KEY.INVALID_TOKEN]: 'Authentication failed',
  [SAFE_ERROR_KEY.INVALID_REFRESH_TOKEN]: 'Invalid refresh token',
  [SAFE_ERROR_KEY.INSUFFICIENT_PERMISSIONS]: 'Access denied',
  [SAFE_ERROR_KEY.DOCUMENT_NOT_FOUND]: 'Document not found',
  [SAFE_ERROR_KEY.NETWORK_ERROR]: 'Connection error',
  [SAFE_ERROR_KEY.USER_ALREADY_EXISTS]: 'User already exists',
} as const;

type SafeErrorKey = (typeof SAFE_ERROR_KEY)[keyof typeof SAFE_ERROR_KEY];

const isSafeErrorKey = (key: string): key is SafeErrorKey => {
  return Object.values(SAFE_ERROR_KEY).includes(key as SafeErrorKey);
};

export const sanitizeError = (error: string): string => {
  // Check if it's a known safe error
  if (isSafeErrorKey(error)) {
    return SAFE_ERROR_MESSAGES[error];
  }

  // Default safe message for unknown errors
  return 'An error occurred. Please try again.';
};

export const sanitizeApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return sanitizeError(error.message);
  }

  if (typeof error === 'string') {
    return sanitizeError(error);
  }

  return 'An unexpected error occurred.';
};
