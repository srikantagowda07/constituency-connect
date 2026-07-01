import type { User, Unsubscribe } from "firebase/auth";
import {
  sendPhoneOtp,
  confirmPhoneOtp,
  signInWithGoogle,
  signOutCurrentUser,
  subscribeAuthState,
  getCurrentUser,
  type PhoneOtpSession,
} from "@/firebase/auth";
import { logger } from "@/lib/logger";

export type { PhoneOtpSession };

/**
 * Initiate phone OTP sign-in.
 * The caller must ensure a DOM element with `recaptchaContainerId` is mounted.
 */
export async function sendOtp(
  phoneNumber: string,
  recaptchaContainerId: string,
): Promise<PhoneOtpSession> {
  const session = await sendPhoneOtp(phoneNumber, recaptchaContainerId);
  logger.info("OTP sent to", phoneNumber);
  return session;
}

/**
 * Confirm the OTP the user entered.
 */
export async function confirmOtp(session: PhoneOtpSession, otp: string): Promise<User> {
  const user = await confirmPhoneOtp(session, otp);
  logger.info("OTP confirmed for user", user.uid);
  return user;
}

/**
 * Sign in with Google (MLA / admin users).
 */
export async function signInAdmin(): Promise<User> {
  const user = await signInWithGoogle();
  logger.info("Google sign-in:", user.uid);
  return user;
}

/**
 * Sign the current user out.
 */
export async function signOutUser(): Promise<void> {
  await signOutCurrentUser();
  logger.info("User signed out");
}

/**
 * Subscribe to auth state changes. Returns the unsubscribe function.
 */
export function subscribeToAuthState(
  callback: (user: User | null) => void,
): Unsubscribe {
  return subscribeAuthState(callback);
}

/**
 * Return the currently authenticated user, or null.
 */
export { getCurrentUser };
