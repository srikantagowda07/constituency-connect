"use client";

/**
 * components/auth/RoleGuard.tsx
 *
 * Conditionally renders children based on the current user's role or permission.
 *
 * Usage (permission-based — preferred):
 *   <RoleGuard permission="complaints:assign">
 *     <AssignButton />
 *   </RoleGuard>
 *
 * Usage (role-based — for coarser gating):
 *   <RoleGuard roles={["admin", "mla", "super_admin"]}>
 *     <SettingsLink />
 *   </RoleGuard>
 *
 * Usage (with fallback):
 *   <RoleGuard permission="export:reports" fallback={<UpgradeBanner />}>
 *     <ExportButton />
 *   </RoleGuard>
 */

import type { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { AppRole, Permission } from "@/types/auth";
import { hasPermission } from "@/lib/auth/permissions";

interface RoleGuardProps {
  children: ReactNode;
  /** Render if the user has this permission. Takes priority over `roles`. */
  permission?: Permission;
  /** Render if the user's role is in this list. */
  roles?: AppRole[];
  /** What to render when access is denied. Defaults to null (render nothing). */
  fallback?: ReactNode;
}

export function RoleGuard({
  children,
  permission,
  roles,
  fallback = null,
}: RoleGuardProps) {
  const { session, isLoading } = useAuth();

  // While the session is loading, render nothing to avoid flicker
  if (isLoading) return null;

  // No session = definitely no access
  if (!session) return <>{fallback}</>;

  let allowed = false;

  if (permission) {
    allowed = hasPermission(session.role, permission);
  } else if (roles) {
    allowed = roles.includes(session.role);
  } else {
    // No constraint — allow any authenticated user
    allowed = true;
  }

  return allowed ? <>{children}</> : <>{fallback}</>;
}
