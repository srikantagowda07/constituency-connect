/**
 * Validate Indian mobile number (10 digits, starting with 6-9).
 */
export function isValidIndianPhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone.replace(/\D/g, "").slice(-10));
}

/**
 * Validate that a string is non-empty after trimming.
 */
export function isNonEmpty(value: string): boolean {
  return value.trim().length > 0;
}

/**
 * Validate minimum and maximum string length.
 */
export function isWithinLength(value: string, min: number, max: number): boolean {
  const len = value.trim().length;
  return len >= min && len <= max;
}

/**
 * Validate a URL string.
 */
export function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}
