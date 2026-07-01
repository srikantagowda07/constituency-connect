/**
 * middleware.ts
 *
 * Next.js Edge Middleware — first line of defence for route protection.
 *
 * ─── What it does ─────────────────────────────────────────────────────────────
 *  Redirects unauthenticated requests away from /dashboard/* before the
 *  page even starts rendering. This prevents a flash of the protected page
 *  on hard refresh.
 *
 * ─── What it does NOT do ──────────────────────────────────────────────────────
 *  It does NOT check roles or permissions. That is the job of:
 *    1. useRequireAuth() in page components (client-side, full role check)
 *    2. RoleGuard component (client-side, conditional rendering)
 *
 *  Middleware runs in the Edge Runtime which cannot import firebase/auth
 *  (Node.js APIs are not available). It can only inspect cookies.
 *
 * ─── How Firebase Auth session is detected ────────────────────────────────────
 *  Firebase Auth stores its session in IndexedDB in the browser, not in a
 *  cookie. The middleware therefore cannot verify the Firebase token on the
 *  server. Instead, we use a lightweight session cookie:
 *
 *   - When the user signs in, AuthContext writes a plain cookie named
 *     "cc_session" (value "1", SameSite=Strict, no expiry).
 *   - On sign-out, AuthContext deletes the cookie.
 *   - The middleware reads this cookie to decide whether to redirect.
 *
 *  This is an OPTIMISTIC check — the middleware trusts the presence of the
 *  cookie but does NOT verify the Firebase ID token. The real security
 *  boundary is Firestore Security Rules (server-side) and the role check in
 *  the page's useRequireAuth() hook.
 *
 * ─── Protected path patterns ──────────────────────────────────────────────────
 *  /dashboard and all sub-routes → require session cookie
 *  /login → redirect to /dashboard if already logged in
 */

import { type NextRequest, NextResponse } from "next/server";

/** Cookie name set by AuthContext after a successful sign-in. */
const SESSION_COOKIE = "cc_session";

/** Routes that require authentication. */
const PROTECTED_PREFIXES = ["/dashboard"];

/** Routes that authenticated users should not see (redirect away). */
const AUTH_ONLY_ROUTES = ["/login"];

export function middleware(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;
  const hasSession   = req.cookies.has(SESSION_COOKIE);

  // ── Protect dashboard routes ──────────────────────────────────────────────
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (isProtected && !hasSession) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Redirect logged-in users away from /login ──────────────────────────────
  const isAuthOnly = AUTH_ONLY_ROUTES.includes(pathname);
  if (isAuthOnly && hasSession) {
    const dashUrl = req.nextUrl.clone();
    dashUrl.pathname = "/dashboard";
    dashUrl.searchParams.delete("from");
    return NextResponse.redirect(dashUrl);
  }

  return NextResponse.next();
}

export const config = {
  /*
   * Match all routes except:
   *  - _next/static  (static files)
   *  - _next/image   (image optimisation)
   *  - favicon.ico
   *  - public/ files (svg, png, etc.)
   *  - api/whatsapp (webhook — must be publicly accessible)
   */
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)|api/whatsapp).*)",
  ],
};
