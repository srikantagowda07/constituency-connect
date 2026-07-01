/**
 * types/auth.ts
 *
 * All authentication and authorisation types for the dashboard.
 *
 * ─── Role hierarchy ───────────────────────────────────────────────────────────
 *
 *   super_admin  All access, all constituencies
 *       │
 *     admin      Full access within their constituency
 *       │
 *     mla        Same as admin (elected representative view)
 *       │
 *    manager     Assign complaints, update status — no settings
 *       │
 *   volunteer    Own complaints only, update status on assigned ones
 *       │
 *     viewer     Read-only dashboard
 *
 * ─── How roles are stored ─────────────────────────────────────────────────────
 *  - Admins:     admins/{uid}.role
 *  - Volunteers: volunteers/{uid}.role  (always "volunteer")
 *  - MLA:        admins/{uid}.role = "mla"
 *
 *  The client reads the Firestore document after Firebase Auth confirms the
 *  session. No JWT custom claims are used — the role lives in Firestore only.
 */

export type AppRole =
  | "super_admin"
  | "admin"
  | "mla"
  | "manager"
  | "volunteer"
  | "viewer";

/**
 * The full resolved session object stored in AuthContext.
 * Populated after both Firebase Auth AND the Firestore role lookup succeed.
 */
export interface AuthSession {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: AppRole;
  constituencyId: string;
  organizationId: string;
  /** True while the auth state is being resolved (initial load) */
  loading: boolean;
}

/**
 * Permission keys used throughout the app.
 * Add new permissions here and map them in lib/auth/permissions.ts.
 */
export type Permission =
  | "complaints:read"
  | "complaints:assign"
  | "complaints:update_status"
  | "complaints:close"
  | "complaints:reject"
  | "volunteers:read"
  | "volunteers:manage"
  | "analytics:read"
  | "settings:read"
  | "settings:write"
  | "export:reports";
