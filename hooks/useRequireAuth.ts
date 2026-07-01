"use client";

/**
 * hooks/useRequireAuth.ts
 *
 * Redirect hook for protected pages.
 * Place at the top of any page that requires authentication.
 *
 * Behaviour:
 *  - While loading: returns { loading: true } — caller should render a spinner.
 *  - Not authenticated: redirects to /login.
 *  - Authenticated but wrong role: redirects to /login with ?error=access_denied.
 *  - Authenticated + correct role: returns { loading: false, session }.
 *
 * Usage:
 *   const { loading, session } = useRequireAuth();
 *   const { loading, session } = useRequireAuth({ permission: "settings:write" });
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";
import type { Permission } from "@/types/auth";

interface UseRequireAuthOptions {
  /** If provided, user must also have this permission or they are redirected. */
  permission?: Permission;
  /** Override the redirect target (default: /login). */
  redirectTo?: string;
}

export function useRequireAuth(options: UseRequireAuthOptions = {}) {
  const { session, isAuthenticated, isLoading, hasPermission } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace(ROUTES.LOGIN);
      return;
    }

    if (options.permission && !hasPermission(options.permission)) {
      router.replace(`${options.redirectTo ?? ROUTES.LOGIN}?error=access_denied`);
    }
  }, [isLoading, isAuthenticated, options.permission, options.redirectTo, router, hasPermission]);

  return { loading: isLoading, session };
}
