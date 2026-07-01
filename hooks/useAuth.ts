"use client";

/**
 * hooks/useAuth.ts
 *
 * Primary authentication hook for components.
 * Wraps useAuthContext and exposes a clean, flat API so components
 * never import directly from contexts/.
 *
 * Usage:
 *   const { session, isAuthenticated, signInWithGoogle, signOut } = useAuth();
 *   const { session, hasPermission } = useAuth();
 */

import { useAuthContext } from "@/contexts/AuthContext";
import { hasPermission, canAccessDashboard } from "@/lib/auth/permissions";
import type { Permission } from "@/types/auth";

export function useAuth() {
  const ctx = useAuthContext();

  return {
    // Session data
    session:         ctx.session,
    isAuthenticated: ctx.isAuthenticated,
    isLoading:       ctx.isLoading,
    authError:       ctx.authError,

    // Role helpers
    role:      ctx.session?.role ?? null,
    canAccess: canAccessDashboard(ctx.session?.role ?? null),

    /** Check a single permission against the current role */
    hasPermission: (permission: Permission): boolean =>
      ctx.session ? hasPermission(ctx.session.role, permission) : false,

    // Auth actions
    signInWithGoogle: ctx.signInWithGoogle,
    signInWithEmail:  ctx.signInWithEmail,
    signOut:          ctx.signOut,
  };
}
