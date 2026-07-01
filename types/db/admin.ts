/**
 * types/db/admin.ts
 *
 * TypeScript interfaces for the two admin collections:
 *  - admins      (MLA office staff with dashboard access)
 *  - volunteers  (field workers assigned to resolve complaints)
 *
 * ─── Relationships ───────────────────────────────────────────────────────────
 *
 *  admins
 *    └─ uid            → Firebase Auth UID (document ID = uid)
 *    └─ organizationId → organizations
 *    └─ constituencyId → constituencies
 *
 *  volunteers
 *    └─ uid            → Firebase Auth UID (document ID = uid)
 *    └─ organizationId → organizations
 *    └─ constituencyId → constituencies
 *    └─ wardIds[]      → wards  (a volunteer covers one or more wards)
 *    └─ categoryIds[]  → categories (optional specialisation)
 *
 * ─── Firestore optimization notes ───────────────────────────────────────────
 *  - Document ID = Firebase Auth UID so getDoc(uid) never requires a query.
 *  - wardIds array on volunteers enables:
 *      where("wardIds", "array-contains", wardId)
 *    to find available volunteers for a complaint without a join.
 *  - `stats` is a denormalized summary updated by Cloud Functions on each
 *    complaint assignment/resolution — avoids expensive COUNT aggregations.
 *  - `isActive` / `isAvailable` are separate:
 *      isActive   = account is not banned/deleted
 *      isAvailable = volunteer is currently accepting new assignments
 */

import type { Timestamp } from "firebase/firestore";
import type { DbDocument } from "./master";

// ─── Shared user fields ──────────────────────────────────────────────────────

interface BaseUser extends DbDocument {
  /** Firebase Auth UID — identical to the Firestore document ID. */
  uid: string;
  organizationId: string;
  constituencyId: string;
  displayName: string;
  /** E.164 format. e.g. "+919876543210" */
  phone: string;
  email: string | null;
  photoUrl: string | null;
  isActive: boolean;
  /** Last seen timestamp (updated by the client on each authenticated request). */
  lastSeenAt: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── admins ───────────────────────────────────────────────────────────────────
/**
 * Collection: admins
 *
 * MLA office staff who use the dashboard.
 * Role determines what they can see and do:
 *
 *   super_admin  — full access across all constituencies in the organisation
 *   admin        — full access within their assigned constituency
 *   manager      — can assign and update complaints, no settings access
 *   viewer       — read-only dashboard access
 *
 * References: organizationId → organizations, constituencyId → constituencies
 * Referenced by: complaint_updates.updatedBy, complaints.assignedBy
 */
export type AdminRole = "super_admin" | "admin" | "manager" | "viewer";

export interface Admin extends BaseUser {
  role: AdminRole;
  /**
   * Permissions explicitly granted beyond the role defaults.
   * Stored as a string array of permission keys.
   * e.g. ["export_reports", "manage_volunteers"]
   */
  permissions: string[];
}

// ─── volunteers ───────────────────────────────────────────────────────────────
/**
 * Collection: volunteers
 *
 * Field workers responsible for physically resolving complaints.
 * A volunteer is assigned to one constituency but covers one or more wards.
 *
 * References:
 *   organizationId  → organizations
 *   constituencyId  → constituencies
 *   wardIds[]       → wards
 *   categoryIds[]   → categories (optional; empty = handles all categories)
 *
 * Referenced by: complaints.assignedTo, complaint_updates.updatedBy
 */
export type VolunteerStatus = "active" | "inactive" | "suspended";

export interface VolunteerStats {
  /** Total complaints ever assigned to this volunteer. */
  totalAssigned: number;
  /** Complaints currently in-progress. */
  activeCount: number;
  /** Complaints resolved. */
  resolvedCount: number;
  /** Average resolution time in hours (rolling 30-day). */
  avgResolutionHours: number | null;
}

export interface Volunteer extends BaseUser {
  status: VolunteerStatus;
  /**
   * Ward IDs this volunteer covers.
   * Queried with array-contains to find eligible volunteers during assignment.
   */
  wardIds: string[];
  /**
   * Category IDs this volunteer specialises in.
   * Empty array means the volunteer handles all categories.
   */
  categoryIds: string[];
  /**
   * Whether the volunteer is currently accepting new complaint assignments.
   * Separate from `status` so a temporarily unavailable (e.g. on leave)
   * volunteer doesn't lose their account status.
   */
  isAvailable: boolean;
  /** Denormalized stats updated by backend on assignment/resolution. */
  stats: VolunteerStats;
}
