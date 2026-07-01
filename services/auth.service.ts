import {
  signInWithPhoneNumber,
  signOut,
  onAuthStateChanged,
  RecaptchaVerifier,
  type ConfirmationResult,
  type User,
  type Unsubscribe,
} from "firebase/auth";
import auth from "@/firebase/auth";
import { logger } from "@/lib/logger";

/**
 * Initiate phone number sign-in and return a ConfirmationResult.
 * The caller must render a #recaptcha-container element in the DOM.
 */
export async function sendOtp(
  phoneNumber: string,
  recaptchaContainerId: string,
): Promise<ConfirmationResult> {
  const verifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
    size: "invisible",
  });
  const result = await signInWithPhoneNumber(auth, phoneNumber, verifier);
  logger.info("OTP sent to", phoneNumber);
  return result;
}

/**
 * Confirm the OTP entered by the user.
 */
export async function confirmOtp(
  confirmationResult: ConfirmationResult,
  otp: string,
): Promise<User> {
  const credential = await confirmationResult.confirm(otp);
  logger.info("OTP confirmed for user", credential.user.uid);
  return credential.user;
}

/**
 * Sign the current user out.
 */
export async function signOutUser(): Promise<void> {
  await signOut(auth);
  logger.info("User signed out");
}

/**
 * Subscribe to auth state changes.
 * Returns the unsubscribe function.
 */
export function subscribeToAuthState(
  callback: (user: User | null) => void,
): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}

/**
 * Return the currently authenticated user, or null.
 */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}
