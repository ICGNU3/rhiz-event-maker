import DOMPurify from "isomorphic-dompurify";

/**
 * Basic text sanitization to remove HTML tags and prevent XSS
 * Useful for fields that should just be plain text
 */
export function sanitizeText(text: string): string {
  if (!text) return "";
  // Removes all HTML tags
  if (typeof window === 'undefined') {
    // Server-side fallback (simple regex, robust storage should use library if needed)
    return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] });
  }
  // Client-side/DOM environment can use stricter clearing if library available
  // But for now, simple regex strip is often enough for plain text fields
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] }).trim();
}

/**
 * Sanitize potentially HTML-rich content if you want to allow format but block scripts
 * (Requires a heavy library like dompurify, usually better to strictly disallow HTML for simple inputs)
 */
export function sanitizeHtml(html: string): string {
   return DOMPurify.sanitize(html);
}

/**
 * Sanitize filename to strict alphanumeric + safe chars
 */
export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-z0-9\.\-\_]/gi, "_").toLowerCase();
}

/**
 * Recursively sanitize an object's string values
 */
export function sanitizeObject<T>(obj: T): T {
  if (typeof obj === "string") {
    return sanitizeText(obj) as unknown as T;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item)) as unknown as T;
  }
  if (typeof obj === "object" && obj !== null) {
    const newObj: Record<string, unknown> = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        newObj[key] = sanitizeObject((obj as Record<string, unknown>)[key]);
      }
    }
    return newObj as T;
  }
  return obj;
}
