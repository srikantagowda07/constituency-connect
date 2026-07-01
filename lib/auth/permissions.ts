/**
 * lib/auth/permissions.ts
 *
 * Role → permission matrix.
 * Single source of truth for what each role can do.
 *
 * Usage:
 *   hasPermission(role, "complaints:assign")   → boolean
 *   requirePermission(role, "settings:write")  → throws PermissionError
 *
 * Design:
 *   - Permissions are additive. Higher roles include all lower-role permissions.
 *   - The matrix is a plain object — no class hierarchy, no magic.
 *     It is imported at build time and tree-shaken; there's no runtime overhead.
 */

import type { AppRole, Permission } from "@/types/auth";
import { PermissionError } from "@/lib/errors";

// ─── Matrix ───────────────────────────────────────────────────────────────────

const ROLE_PERMISSIONS: Record<AppRole, Set<Permission>> = {
  viewer: new Set<Permission>([
    "complaints:read",
  ]),

  volunteer: new Set<Permission>([
    "complaints:read",
    "complaints:update_status",
  ]),

  manager: new Set<Permission>([
    "complaints:read",
    "complaints:assign",
    "complaints:update_status",
    "complaints:close",
    "volunteers:read",
    "analytics:read",
  ]),

  mla: new Set<Permission>([
    "complaints:read",
    "complaints:assign",
    "complaints:update_status",
    "complaints:close",
    "complaints:reject",
    "volunteers:read",
    "analytics:read",
    "export:reports",
    "settings:read",
  ]),

  admin: new Set<Permission>([
    "complaints:read",
    "complaints:assign",
    "complaints:update_status",
    "complaints:close",
    "complaints:reject",
    "volunteers:read",
    "volunteers:manage",
    "analytics:read",
    "export:reports",
    "settings:read",
    "settings:write",
  ]),

  super_admin: new Set<Permission>([
    "complaints:read",
    "complaints:assign",
    "complaints:update_status",
    "complaints:close",
    "complaints:reject",
    "volunteers:read",
    "volunteers:manage",
    "analytics:read",
    "export:reports",
    "settings:read",
    "settings:write",
  ]),
};

// ─── Guards ───────────────────────────────────────────────────────────────────

/**
 * Returns true if the given role has the requested permission.
 *
 * @example
 * if (hasPermission(session.role, "complaints:assign")) { ... }
 */
export function hasPermission(role: AppRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.has(permission) ?? false;
}

/**
 * Returns all permissions for a given role.
 */
export function getPermissions(role: AppRole): Permission[] {
  return Array.from(ROLE_PERMISSIONS[role] ?? []);
}

/**
 * Throws a PermissionError if the role lacks the requested permission.
 * Use this in server-side API routes or service functions.
 *
 * @example
 * requirePermission(session.role, "settings:write");
 */
export function requirePermission(role: AppRole, permission: Permission): void {
  if (!hasPermission(role, permission)) {
    throw new PermissionError(
      `Role "${role}" does not have permission "${permission}"`,
    );
  }
}

/**
 * Returns true if the given role can access the dashboard at all.
 * Viewers and above can log in; unauthenticated users cannot.
 */
export function canAccessDashboard(role: AppRole | null): boolean {
  if (!role) return false;
  return hasPermission(role, "complaints:read");
}

/**
 * Returns the dashboard home route appropriate for the role.
 * Volunteers go directly to their assigned complaints.
 */
export function defaultRouteForRole(role: AppRole): string {
  if (role === "volunteer") return "/dashboard/complaints?assignedTo=me";
  return "/dashboard";
}
