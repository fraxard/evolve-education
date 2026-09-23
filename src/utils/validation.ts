/**
 * Validation utilities for phone and numeric fields
 */

/**
 * Sanitizes phone input in real time as the user types:
 * - Allows leading '+' only at the start
 * - Allows digits, spaces, hyphens, and parentheses
 * - Strips all letters and other symbols
 */
export function sanitizePhone(value: string): string {
  if (!value) return '';

  const hasLeadingPlus = value.startsWith('+');
  // Strip everything that isn't digit, space, hyphen, or paren
  const cleaned = value.replace(/[^\d\s\-()]/g, '');

  return hasLeadingPlus ? `+${cleaned.replace(/\+/g, '')}` : cleaned.replace(/\+/g, '');
}

/**
 * Validates whether a phone number meets Evolve Education standards:
 * - Optional leading '+'
 * - Digits, spaces, hyphens, and parentheses
 * - At least 7 actual numeric digits, maximum 25 characters total
 */
export function isValidPhone(value: string): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  // Regex ensures only permitted characters and reasonable length
  const regex = /^\+?[0-9\s\-()]{7,25}$/;
  if (!regex.test(trimmed)) return false;

  // Must have at least 7 digits
  const digitCount = trimmed.replace(/\D/g, '').length;
  return digitCount >= 7 && digitCount <= 18;
}

/**
 * Sanitizes integer inputs (e.g., cohort capacity):
 * - Strips non-digits
 * - Prevents negative signs or decimal points
 */
export function sanitizeInteger(value: string): string {
  if (!value) return '';
  return value.replace(/\D/g, '');
}
