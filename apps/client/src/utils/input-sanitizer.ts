import DOMPurify from 'dompurify';
import isNil from 'lodash.isnil';
import isString from 'lodash.isstring';

// Configure DOMPurify for safe HTML
const purifyConfig = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
  ALLOWED_ATTR: ['class'],
  ALLOW_DATA_ATTR: false,
  FORBID_SCRIPT: true,
  STRIP_COMMENTS: true,
};

/**
 * @summary Sanitizes an HTML string to prevent XSS attacks.
 * @remarks
 * This function uses DOMPurify to remove any potentially malicious HTML, allowing
 * only a safe subset of tags and attributes.
 * @param html - The HTML string to sanitize.
 * @returns The sanitized HTML string.
 * @since 1.0.0
 */
export const sanitizeHtml = (html: string): string => {
  if (isNil(html) || !isString(html)) {
    return '';
  }
  return DOMPurify.sanitize(html, purifyConfig);
};

/**
 * @summary Sanitizes a filename to prevent directory traversal and other attacks.
 * @param filename - The filename to sanitize.
 * @returns The sanitized filename.
 * @since 1.0.0
 */
export const sanitizeFileName = (filename: string): string => {
  if (isNil(filename) || !isString(filename)) {
    return 'untitled';
  }

  // Remove potentially dangerous characters and limit length
  return filename
    .replace(/[^a-zA-Z0-9.-_\s]/g, '_') // Replace dangerous chars with underscore
    .replace(/\s+/g, '_') // Replace spaces with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .substring(0, 255) // Limit length
    .toLowerCase();
};

/**
 * @summary Sanitizes a plain text string.
 * @remarks
 * This function removes control characters and normalizes whitespace to ensure
 * that the text is safe for display and storage.
 * @param text - The text to sanitize.
 * @returns The sanitized text.
 * @since 1.0.0
 */
export const sanitizeText = (text: string): string => {
  if (isNil(text) || !isString(text)) {
    return '';
  }

  // Remove control characters and normalize whitespace
  const cleanText = Array.from(text)
    .filter((char) => {
      const code = char.charCodeAt(0);
      // Keep printable characters (32-126) and common whitespace (9, 10, 13)
      return (
        (code >= 32 && code <= 126) || code === 9 || code === 10 || code === 13
      );
    })
    .join('');

  return cleanText
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
    .substring(0, 10000); // Reasonable text limit
};

/**
 * @summary Sanitizes a document title.
 * @param title - The title to sanitize.
 * @returns The sanitized title.
 * @since 1.0.0
 */
export const sanitizeDocumentTitle = (title: string): string => {
  const sanitized = sanitizeText(title);
  return sanitized.length > 0 ? sanitized : 'Untitled Document';
};
