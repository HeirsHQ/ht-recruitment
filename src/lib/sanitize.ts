/**
 * Input sanitization utilities.
 *
 * All user-supplied text should pass through `sanitizeText` before being
 * persisted or rendered in contexts where XSS is possible.
 */

// ---------------------------------------------------------------------------
// Text sanitisation
// ---------------------------------------------------------------------------

const SCRIPT_TAG_RE = /<script[\s>][\s\S]*?<\/script\s*>/gi;
const EVENT_HANDLER_RE = /\s*on\w+\s*=\s*["'][^"']*["']/gi;
const HTML_TAG_RE = /<\/?[^>]+(>|$)/g;
const JAVASCRIPT_PROTO_RE = /javascript\s*:/gi;
const DATA_PROTO_RE = /data\s*:\s*text\/html/gi;

/**
 * Strip all HTML tags, script blocks, event handlers, and dangerous protocol
 * URIs from a string. Returns a plain-text string safe for display or storage.
 */
export function sanitizeText(input: string): string {
  if (!input) return input;

  let result = input;

  // 1. Remove full <script>…</script> blocks
  result = result.replace(SCRIPT_TAG_RE, "");

  // 2. Remove inline event handlers (onerror, onclick, etc.)
  result = result.replace(EVENT_HANDLER_RE, "");

  // 3. Strip remaining HTML tags
  result = result.replace(HTML_TAG_RE, "");

  // 4. Neutralise javascript: and dangerous data: URIs
  result = result.replace(JAVASCRIPT_PROTO_RE, "");
  result = result.replace(DATA_PROTO_RE, "");

  // 5. Trim leading/trailing whitespace
  return result.trim();
}

// ---------------------------------------------------------------------------
// Email validation
// ---------------------------------------------------------------------------

const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/** Returns `true` when the value resembles a valid email address. */
export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

/**
 * Validate a comma-separated list of emails.
 * Returns `{ valid, invalid }` arrays.
 */
export function validateEmailList(raw: string): { valid: string[]; invalid: string[] } {
  const parts = raw
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  const valid: string[] = [];
  const invalid: string[] = [];

  for (const part of parts) {
    if (isValidEmail(part)) {
      valid.push(part);
    } else {
      invalid.push(part);
    }
  }

  return { valid, invalid };
}

// ---------------------------------------------------------------------------
// Password strength validation
// ---------------------------------------------------------------------------

export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
}

/** Enforce minimum password requirements. */
export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = [];

  if (password.length < 8) errors.push("Must be at least 8 characters");
  if (!/[a-z]/.test(password)) errors.push("Must include a lowercase letter");
  if (!/[A-Z]/.test(password)) errors.push("Must include an uppercase letter");
  if (!/\d/.test(password)) errors.push("Must include a number");
  if (!/[^a-zA-Z0-9]/.test(password)) errors.push("Must include a special character");

  return { isValid: errors.length === 0, errors };
}

// ---------------------------------------------------------------------------
// File validation
// ---------------------------------------------------------------------------

/** PDF magic bytes: %PDF */
const PDF_MAGIC = [0x25, 0x50, 0x44, 0x46];

/** Verify that the first bytes of a buffer match the PDF magic bytes. */
export function isPdfMagicValid(buffer: Buffer | Uint8Array): boolean {
  if (buffer.length < PDF_MAGIC.length) return false;
  return PDF_MAGIC.every((byte, i) => buffer[i] === byte);
}

const ALLOWED_FILE_EXTENSIONS = [".pdf"];

const DANGEROUS_NAME_CHARS_RE = /[<>:"/\\|?*\x00-\x1f]/g;

/** Sanitise a file name, stripping directory traversal and dangerous chars. */
export function sanitizeFileName(name: string): string {
  // Remove directory traversal
  let safe = name.replace(/\.\./g, "").replace(/[/\\]/g, "");
  // Strip dangerous characters
  safe = safe.replace(DANGEROUS_NAME_CHARS_RE, "_");
  return safe.trim() || "unnamed";
}

/** Return `true` when the file extension is in the allow-list. */
export function hasAllowedExtension(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  return ALLOWED_FILE_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

// ---------------------------------------------------------------------------
// URL validation
// ---------------------------------------------------------------------------

/**
 * Returns `true` if the URL uses a safe protocol (http or https).
 * Blocks `javascript:`, `data:`, `vbscript:`, etc.
 */
export function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Number validation
// ---------------------------------------------------------------------------

/** Clamp a numeric string to a non-negative integer, returning `undefined` for invalid values. */
export function parsePositiveInt(value: string): number | undefined {
  const n = parseInt(value, 10);
  if (isNaN(n) || n < 0) return undefined;
  return n;
}
