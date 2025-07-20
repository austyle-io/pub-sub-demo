import DOMPurify from 'dompurify';

// Configure DOMPurify for safe HTML
const purifyConfig = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
  ALLOWED_ATTR: ['class'],
  ALLOW_DATA_ATTR: false,
  FORBID_SCRIPT: true,
  STRIP_COMMENTS: true
};

export const sanitizeHtml = (html: string): string => {
  if (!html || typeof html !== 'string') {
    return '';
  }
  return DOMPurify.sanitize(html, purifyConfig);
};

export const sanitizeFileName = (filename: string): string => {
  if (!filename || typeof filename !== 'string') {
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
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  // Remove control characters and normalize whitespace
  return text
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
    .substring(0, 10000); // Reasonable text limit
};

export const sanitizeDocumentTitle = (title: string): string => {
  const sanitized = sanitizeText(title);
  return sanitized || 'Untitled Document';
};
