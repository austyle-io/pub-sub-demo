/**
 * Test utilities for managing environment variables
 */

/**
 * Temporarily removes an environment variable for testing
 */
export function withoutEnvVar(key: string, fn: () => void): void {
  const originalValue = process.env[key];

  // Set to empty string - this is falsy but avoids the delete operator
  process.env[key] = '';

  try {
    fn();
  } finally {
    // Restore original value
    if (originalValue !== undefined) {
      process.env[key] = originalValue;
    } else {
      // If it was undefined originally, set it back to empty
      process.env[key] = '';
    }
  }
}
