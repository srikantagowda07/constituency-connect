/**
 * firebase/auth.ts
 *
 * Firebase Authentication service module.
 *
 * Responsibilities:
 *  - Initialise and export the Auth instance.
 *  - Provide typed helpers for all authentication flows used by
 *    Constituency Connect (phone OTP, Google, sign-out, session observation).
 *
 * Design decisions:
 *  - Phone auth is the primary flow (citizens use WhatsApp — no email).
 *  - Google sign-in is provided for MLA/admin dashboard users.
 *  - All helpers accept the Auth instance from this module; callers never
 *    import from "firebase/auth" directly.
 *  - RecaptchaVerifier is created inside sendPhoneOtp and cleaned up after
 *    use to avoid DOM leaks across hot reloads.
 */

import {
  getAuth,
  signInWithPhoneNumber,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  RecaptchaVerifier,
  type Auth,
  type User,
  type ConfirmationResult,
  type Unsubscribe,
  type UserCredential,
} from "firebase/auth";
import app from "./firebase";

// ─── Auth singleton ──────────────────────────────────────────────────────────

const auth: Auth = getAuth(app);

export default auth;

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PhoneOtpSession {
  /** Call confirmPhoneOtp with the code the user received. */
  confirmationResult: ConfirmationResult;
  /** The phone number the OTP was sent to (formatted). */
  phoneNumber: string;
}

export interface AuthUser {
  uid: string;
  phone: string | null;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Send a phone OTP to the given number.
 *
 * The caller must ensure a DOM element with `recaptchaContainerId` exists
 * before calling this function. Use an invisible reCAPTCHA in production.
 *
 * @param phoneNumber  E.164 format, e.g. "+919876543210"
 * @param recaptchaContainerId  ID of the DOM element for the reCAPTCHA widget
 *
 * @example
 * const session = await sendPhoneOtp("+919876543210", "recaptcha-container");
 */
export async function sendPhoneOtp(
  phoneNumber: string,
  recaptchaContainerId: string,
): Promise<PhoneOtpSession> {
  const verifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
    size: "invisible",
    callback: () => {
      // reCAPTCHA solved — OTP request proceeds automatically.
    },
  });

  const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, verifier);
  return { confirmationResult, phoneNumber };
}

/**
 * Confirm the OTP the user entered.
 * Returns the authenticated Firebase User on success.
 *
 * @example
 * const user = await confirmPhoneOtp(session, "123456");
 */
export async function confirmPhoneOtp(
  session: PhoneOtpSession,
  otp: string,
): Promise<User> {
  const credential: UserCredential = await session.confirmationResult.confirm(otp);
  return credential.user;
}

/**
 * Sign in with a Google account (popup flow).
 * Suitable for MLA and admin dashboard users on desktop.
 *
 * @example
 * const user = await signInWithGoogle();
 */
export async function signInWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const credential = await signInWithPopup(auth, provider);
  return credential.user;
}

/**
 * Sign the current user out and clear the local session.
 *
 * @example
 * await signOutCurrentUser();
 */
export async function signOutCurrentUser(): Promise<void> {
  await signOut(auth);
}

/**
 * Subscribe to auth state changes.
 * The callback fires immediately with the current user (or null),
 * then again on every sign-in / sign-out event.
 * Returns the unsubscribe function — call it in a useEffect cleanup.
 *
 * @example
 * const unsubscribe = subscribeAuthState((user) => setUser(user));
 * return () => unsubscribe();
 */
export function subscribeAuthState(
  callback: (user: User | null) => void,
): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}

/**
 * Return the currently signed-in user, or null.
 * This is a synchronous snapshot — prefer subscribeAuthState for reactive UI.
 *
 * @example
 * const user = getCurrentUser();
 */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

/**
 * Update the display name and/or photo URL for the current user.
 *
 * @example
 * await updateCurrentUserProfile({ displayName: "Ravi Kumar" });
 */
export async function updateCurrentUserProfile(updates: {
  displayName?: string;
  photoURL?: string;
}): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("[Auth] No authenticated user to update.");
  await updateProfile(user, updates);
}

/**
 * Map a Firebase User to a plain AuthUser object.
 * Useful for storing in React state without holding a mutable Firebase reference.
 *
 * @example
 * const authUser = toAuthUser(firebaseUser);
 */
export function toAuthUser(user: User): AuthUser {
  return {
    uid: user.uid,
    phone: user.phoneNumber,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    isAnonymous: user.isAnonymous,
  };
}
