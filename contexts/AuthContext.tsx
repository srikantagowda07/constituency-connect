"use client";

/**
 * contexts/AuthContext.tsx
 *
 * The single source of truth for authentication state in the dashboard.
 *
 * ─── What this context does ───────────────────────────────────────────────────
 *
 *  1. Subscribes to Firebase Auth's onAuthStateChanged listener.
 *     Firebase persists the session in IndexedDB by default, so the user
 *     stays logged in across browser refreshes without any extra work.
 *
 *  2. On sign-in, reads the user's Firestore document from either
 *     `admins/{uid}` or `volunteers/{uid}` to resolve their role and
 *     constituency. The document lookup is a single getDoc — O(1).
 *
 *  3. Exposes a unified AuthSession object (uid + role + constituencyId)
 *     plus helper booleans (isAuthenticated, isLoading).
 *
 *  4. Exposes signIn methods (Google, Email/Password) and signOut.
 *
 * ─── Why no JWT ───────────────────────────────────────────────────────────────
 *  Firebase Auth already issues an ID token that's stored securely in
 *  IndexedDB and refreshed automatically every hour. There's no need to
 *  create a separate JWT. The role is resolved from Firestore (not from
 *  token claims) so role changes take effect on next page load without
 *  waiting for a token refresh.
 *
 * ─── Session persistence ─────────────────────────────────────────────────────
 *  Firebase Auth uses browserLocalPersistence by default — the session
 *  survives tab closes and browser restarts. No cookie or localStorage
 *  management is needed.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  type User,
} from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import auth, {
  signInWithGoogle as firebaseSignInWithGoogle,
  signOutCurrentUser,
  subscribeAuthState,
} from "@/firebase/auth";
import db from "@/firebase/firestore";
import { COLLECTIONS } from "@/constants/firestore";
import type { AppRole, AuthSession } from "@/types/auth";
import type { Admin, Volunteer } from "@/types/db";
import { ROUTES } from "@/constants/routes";
import { logger } from "@/lib/logger";

// ─── Context type ─────────────────────────────────────────────────────────────

interface AuthContextValue {
  session: AuthSession | null;
  isAuthenticated: boolean;
  /** True during initial auth state resolution (splash screen guard) */
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  /** Last sign-in error message, cleared on next sign-in attempt */
  authError: string | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Firestore role resolution ────────────────────────────────────────────────

/**
 * Given a Firebase Auth UID, looks up the user's role and constituency
 * from Firestore. Checks `admins` first, then `volunteers`.
 *
 * Returns null if no matching document is found (unknown user — access denied).
 */
async function resolveUserRole(uid: string): Promise<{
  role: AppRole;
  constituencyId: string;
  organizationId: string;
} | null> {
  // Check admins collection first
  const adminSnap = await getDoc(doc(db, COLLECTIONS.ADMINS, uid));
  if (adminSnap.exists()) {
    const data = adminSnap.data() as Admin;
    return {
      role: data.role as AppRole,
      constituencyId: data.constituencyId,
      organizationId: data.organizationId,
    };
  }

  // Check volunteers collection
  const volunteerSnap = await getDoc(doc(db, COLLECTIONS.VOLUNTEERS, uid));
  if (volunteerSnap.exists()) {
    const data = volunteerSnap.data() as Volunteer;
    return {
      role: "volunteer",
      constituencyId: data.constituencyId,
      organizationId: data.organizationId,
    };
  }

  logger.warn("[AuthContext] User not found in admins or volunteers:", uid);
  return null;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession]   = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // ── Subscribe to Firebase Auth state ────────────────────────────────────
  useEffect(() => {
    const unsubscribe = subscribeAuthState(async (firebaseUser: User | null) => {
      if (!firebaseUser) {
        setSession(null);
        setIsLoading(false);
        return;
      }

      try {
        const resolved = await resolveUserRole(firebaseUser.uid);
        if (!resolved) {
          // User has a Firebase Auth account but no Firestore profile.
          // Sign them out rather than leaving them in a broken half-auth state.
          await signOutCurrentUser();
          document.cookie = "cc_session=; Max-Age=0; path=/; SameSite=Strict";
          setSession(null);
          setAuthError("Your account does not have dashboard access. Contact your administrator.");
        } else {
          // Write the optimistic session cookie for middleware to read
          document.cookie = "cc_session=1; path=/; SameSite=Strict";
          setSession({
            uid:            firebaseUser.uid,
            email:          firebaseUser.email,
            displayName:    firebaseUser.displayName,
            photoURL:       firebaseUser.photoURL,
            role:           resolved.role,
            constituencyId: resolved.constituencyId,
            organizationId: resolved.organizationId,
            loading:        false,
          });
          setAuthError(null);
        }
      } catch (err) {
        logger.error("[AuthContext] Role resolution error:", err);
        setAuthError("Failed to load your profile. Please try again.");
        setSession(null);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // ── Sign-in: Google ──────────────────────────────────────────────────────
  const signInWithGoogle = useCallback(async () => {
    setAuthError(null);
    try {
      await firebaseSignInWithGoogle();
      // onAuthStateChanged fires automatically — no manual session setting here
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Google sign-in failed.";
      logger.error("[AuthContext] Google sign-in error:", err);
      setAuthError(msg);
      throw err;
    }
  }, []);

  // ── Sign-in: Email / Password ────────────────────────────────────────────
  const signInWithEmail = useCallback(async (email: string, password: string) => {
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged fires automatically
    } catch (err: unknown) {
      const msg = friendlyAuthError(err);
      logger.error("[AuthContext] Email sign-in error:", err);
      setAuthError(msg);
      throw new Error(msg);
    }
  }, []);

  // ── Sign-out ─────────────────────────────────────────────────────────────
  const signOut = useCallback(async () => {
    try {
      await signOutCurrentUser();
      document.cookie = "cc_session=; Max-Age=0; path=/; SameSite=Strict";
      setSession(null);
    } catch (err) {
      logger.error("[AuthContext] Sign-out error:", err);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        isAuthenticated: session !== null,
        isLoading,
        signInWithGoogle,
        signInWithEmail,
        signOut,
        authError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used inside <AuthProvider>");
  return ctx;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Map Firebase Auth error codes to user-friendly messages. */
function friendlyAuthError(err: unknown): string {
  if (err instanceof Error) {
    const code = (err as { code?: string }).code ?? "";
    const map: Record<string, string> = {
      "auth/user-not-found":       "No account found with this email.",
      "auth/wrong-password":       "Incorrect password. Please try again.",
      "auth/invalid-email":        "Please enter a valid email address.",
      "auth/too-many-requests":    "Too many attempts. Please wait a moment.",
      "auth/user-disabled":        "This account has been disabled.",
      "auth/invalid-credential":   "Invalid email or password.",
      "auth/popup-closed-by-user": "Sign-in was cancelled.",
    };
    return map[code] ?? err.message;
  }
  return "An unexpected error occurred.";
}

// Export createUserWithEmailAndPassword for admin onboarding use
export { createUserWithEmailAndPassword, auth as firebaseAuth };
export type { ROUTES };
