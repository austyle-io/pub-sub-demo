const SAFE_ERROR_MESSAGES = {
  'Invalid credentials': 'Invalid credentials',
  'Account locked': 'Account temporarily locked',
  'Token expired': 'Session expired',
  'Invalid token': 'Authentication failed',
  'Insufficient permissions': 'Access denied',
  'Document not found': 'Document not found',
  'Network error': 'Connection error'
} as const;

type SafeErrorKey = keyof typeof SAFE_ERROR_MESSAGES;

export const sanitizeError = (error: string): string => {
  // Check if it's a known safe error
  if (error in SAFE_ERROR_MESSAGES) {
    return SAFE_ERROR_MESSAGES[error as SafeErrorKey];
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
