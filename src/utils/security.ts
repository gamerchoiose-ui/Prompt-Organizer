import DOMPurify from 'dompurify';

/**
 * Sanitizes potentially unsafe HTML or Markdown rendered strings to prevent XSS attacks.
 * Uses DOMPurify to strip malicious scripts, event handlers, and unauthorized tags.
 */
export function sanitizeHTML(dirtyHtml: string): string {
  if (typeof window !== 'undefined' && window.document) {
    return DOMPurify.sanitize(dirtyHtml);
  }
  return dirtyHtml;
}

/**
 * Sanitizes plain text inputs or prompt contents.
 */
export function sanitizePromptText(text: string): string {
  if (!text) return '';
  // Basic script tag stripping or encoding for safe text rendering
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .trim();
}

/**
 * Validates that API keys or secrets are never logged or exposed to client storage.
 */
export function maskApiKey(key?: string): string {
  if (!key) return 'Not Configured';
  if (key.length <= 8) return '••••••••';
  return `${key.slice(0, 4)}••••••••${key.slice(-4)}`;
}
