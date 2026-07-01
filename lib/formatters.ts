/**
 * Format an ISO-8601 date string to a readable locale date.
 */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

/**
 * Format an ISO-8601 date string to a readable locale date + time.
 */
export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

/**
 * Return a relative time string (e.g. "2 hours ago") from an ISO-8601 date.
 */
export function relativeTime(iso: string): string {
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const diffMs = new Date(iso).getTime() - Date.now();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHr = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHr / 24);

  if (Math.abs(diffSec) < 60) return rtf.format(diffSec, "second");
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, "minute");
  if (Math.abs(diffHr) < 24) return rtf.format(diffHr, "hour");
  return rtf.format(diffDay, "day");
}

/**
 * Truncate a string to a maximum length, appending "…" if needed.
 */
export function truncate(str: string, maxLength: number): string {
  return str.length <= maxLength ? str : `${str.slice(0, maxLength)}…`;
}

/**
 * Convert a phone number to a WhatsApp-safe format (strip non-digits, add country code).
 */
export function toWhatsAppPhone(phone: string, defaultCountryCode = "91"): string {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith(defaultCountryCode) ? digits : `${defaultCountryCode}${digits}`;
}
