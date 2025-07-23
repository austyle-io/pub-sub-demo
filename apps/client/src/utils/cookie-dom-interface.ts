/**
 * Low-level cookie DOM interface
 * This module provides the only sanctioned access to document.cookie
 * All other code should use the Cookie Store API
 */

/**
 * Set a cookie string directly to the DOM
 * This is the only function in the codebase that should access document.cookie
 * @internal Used only by the Cookie Store polyfill
 */
export function setCookieString(cookieString: string): void {
  if (typeof document === 'undefined') {
    throw new Error('document is not available in this environment');
  }

  // This is the only sanctioned use of document.cookie in the entire codebase
  // All other cookie operations should use the Cookie Store API
  document.cookie = cookieString;
}

/**
 * Get the raw cookie string from the DOM
 * @internal Used only by the Cookie Store polyfill
 */
export function getCookieString(): string {
  if (typeof document === 'undefined') {
    throw new Error('document is not available in this environment');
  }

  // This is the only sanctioned read of document.cookie in the entire codebase
  return document.cookie;
}
