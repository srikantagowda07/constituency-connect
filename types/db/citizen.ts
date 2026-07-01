/**
 * types/db/citizen.ts
 *
 * TypeScript interface for the citizens collection.
 *
 * ─── Design rationale ────────────────────────────────────────────────────────
 *
 * Citizens interact exclusively through WhatsApp.
 * They never log in to the dashboard or create a Firebase Auth account.
 *
 * A citizen record is created automatically the first time a WhatsApp message
 * is received from an unknown phone number. It is identified by phone number,
 * not a UID.
 *
 * The document ID is the E.164 phone number with the "+" stripped:
 *   "+919876543210" → document ID "919876543210"
 * This makes citizen lookups O(1) (getDoc by phone) without needing an index.
 *
 * ─── Relationships ───────────────────────────────────────────────────────────
 *
 *  citizens
 *    └─ constituencyId → constituencies  (resolved from ward on first complaint)
 *    └─ wardId         → wards           (self-reported or resolved from street)
 *    └─ streetId       → streets         (most recently used)
 *
 *  Referenced by: complaints.citizenId
 *
 * ─── Firestore optimization notes ───────────────────────────────────────────
 *  - Document ID = stripped E.164 phone → O(1) lookup, no index required.
 *  - Location IDs are "last known" — updated each time the citizen files
 *    a new complaint. This is a single field update, not a new document.
 *  - `stats` is denormalized (updated by backend) to avoid COUNT aggregations
 *    on the complaints collection per citizen.
 *  - `preferredLanguage` drives WhatsApp message template selection.
 *  - `consentGiven` records that the citizen accepted the terms via WhatsApp
 *    opt-in — required for WhatsApp Business API compliance.
 */

import type { Timestamp } from "firebase/firestore";
import type { DbDocument, GeoPoint } from "./master";

// ─── WhatsApp conversation state ─────────────────────────────────────────────

/**
 * Tracks where a citizen is in the WhatsApp conversation flow.
 * The backend state machine uses this to know which prompt to send next.
 *
 * idle            → no active flow
 * awaiting_*      → waiting for the citizen's next reply
 * confirming      → bot sent a summary, awaiting "YES" or "NO"
 */
export type ConversationState =
  | "idle"
  | "awaiting_category"
  | "awaiting_description"
  | "awaiting_photo"
  | "awaiting_location"
  | "awaiting_street"
  | "confirming"
  | "completed";

export interface ConversationContext {
  state: ConversationState;
  /**
   * Partial complaint data accumulated across the conversation turns.
   * Stored as a flexible record so the flow can be extended without
   * changing the interface.
   */
  draft: Record<string, unknown>;
  /** Timestamp of the last message in this conversation turn. */
  lastActivityAt: Timestamp;
}

// ─── Citizen stats ────────────────────────────────────────────────────────────

export interface CitizenStats {
  totalComplaints: number;
  resolvedComplaints: number;
  pendingComplaints: number;
}

// ─── citizens ─────────────────────────────────────────────────────────────────
/**
 * Collection: citizens
 * Document ID: E.164 phone without "+". e.g. "919876543210"
 *
 * References:
 *   constituencyId → constituencies
 *   wardId         → wards
 *   streetId       → streets
 *
 * Referenced by: complaints.citizenId
 */
export interface Citizen extends DbDocument {
  /**
   * E.164 phone number with "+" prefix.
   * Redundantly stored in the document body for display/export.
   * e.g. "+919876543210"
   */
  phone: string;
  /** Name extracted from WhatsApp profile or self-reported. */
  displayName: string | null;
  /** WhatsApp profile picture URL (may be null if not shared). */
  photoUrl: string | null;
  /**
   * BCP-47 language tag for WhatsApp message templates.
   * e.g. "en", "kn" (Kannada), "hi"
   */
  preferredLanguage: string;
  /**
   * Most recently used / confirmed constituency.
   * Null until the first complaint is filed.
   */
  constituencyId: string | null;
  /** Most recently used ward. Null until resolved from a complaint. */
  wardId: string | null;
  /** Most recently used street. Null until the citizen selects one. */
  streetId: string | null;
  /** Last known GPS location shared by the citizen. */
  lastKnownLocation: GeoPoint | null;
  /**
   * Active WhatsApp conversation state.
   * Updated on every inbound message; reset to idle after submission.
   */
  conversation: ConversationContext;
  /** WhatsApp opt-in consent (required for Business API). */
  consentGiven: boolean;
  /** Timestamp of consent. */
  consentGivenAt: Timestamp | null;
  /** True if the citizen has been blocked from submitting complaints. */
  isBlocked: boolean;
  /** Reason for blocking (admin-supplied note). */
  blockedReason: string | null;
  /** Denormalized complaint counts updated by backend. */
  stats: CitizenStats;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
