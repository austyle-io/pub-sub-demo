import DOMPurify from 'dompurify';
import { isNil, isString } from 'lodash';

// Configure DOMPurify for safe HTML
const purifyConfig = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
  ALLOWED_ATTR: ['class'],
  ALLOW_DATA_ATTR: false,
  FORBID_SCRIPT: true,
  STRIP_COMMENTS: true,
};

export const sanitizeHtml = (html: string): string => {
  if (isNil(html) || !isString(html)) {
    return '';
  }
  return DOMPurify.sanitize(html, purifyConfig);
};

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

export const sanitizeDocumentTitle = (title: string): string => {
  const sanitized = sanitizeText(title);
  return sanitized.length > 0 ? sanitized : 'Untitled Document';
};
