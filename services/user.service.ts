import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  type PartialWithFieldValue,
} from "firebase/firestore";
import db from "@/firebase/firestore";
import { COLLECTIONS } from "@/constants/firestore";
import type { UserProfile } from "@/types/user";
import { NotFoundError } from "@/lib/errors";
import { logger } from "@/lib/logger";

/**
 * The generic UserProfile lives in the "admins" collection for dashboard users.
 * Citizens are stored separately in the "citizens" collection.
 * @internal Use the typed admin/citizen services for new code.
 */
const USER_COLLECTION = COLLECTIONS.ADMINS;

/**
 * Fetch a user profile by UID.
 * Throws NotFoundError if the document does not exist.
 */
export async function getUserProfile(uid: string): Promise<UserProfile> {
  const snap = await getDoc(doc(db, USER_COLLECTION, uid));
  if (!snap.exists()) throw new NotFoundError("User");
  return snap.data() as UserProfile;
}

/**
 * Create a new user profile document.
 */
export async function createUserProfile(
  profile: Omit<UserProfile, "createdAt" | "updatedAt">,
): Promise<void> {
  const ref = doc(db, USER_COLLECTION, profile.uid);
  await setDoc(ref, {
    ...profile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  logger.info("User profile created:", profile.uid);
}

/**
 * Partially update a user profile.
 */
export async function updateUserProfile(
  uid: string,
  updates: PartialWithFieldValue<UserProfile>,
): Promise<void> {
  const ref = doc(db, USER_COLLECTION, uid);
  await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
  logger.info("User profile updated:", uid);
}
