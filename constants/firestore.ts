/**
 * constants/firestore.ts
 *
 * Single source of truth for every Firestore collection name.
 * Always import from here — never hard-code collection strings.
 *
 * ─── Collection groups ───────────────────────────────────────────────────────
 *
 *  MASTER        Configuration collections (organizations → streets, categories, departments)
 *  ADMIN         Staff collections (admins, volunteers)
 *  CITIZEN       Citizen collection
 *  COMPLAINT     Complaint lifecycle collections
 */

export const COLLECTIONS = {
  // ── Master ────────────────────────────────────────────────────────────────
  ORGANIZATIONS: "organizations",
  CONSTITUENCIES: "constituencies",
  AREAS: "areas",
  WARDS: "wards",
  STREETS: "streets",
  CATEGORIES: "categories",
  DEPARTMENTS: "departments",

  // ── Admin ─────────────────────────────────────────────────────────────────
  ADMINS: "admins",
  VOLUNTEERS: "volunteers",

  // ── Citizen ───────────────────────────────────────────────────────────────
  CITIZENS: "citizens",

  // ── Complaint ─────────────────────────────────────────────────────────────
  COMPLAINTS: "complaints",
  COMPLAINT_UPDATES: "complaint_updates",
  MEDIA: "media",
  NOTIFICATIONS: "notifications",
} as const;

/** Union type of all valid Firestore collection names. */
export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];
