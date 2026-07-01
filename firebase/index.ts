/**
 * firebase/index.ts
 *
 * Public barrel for the firebase/ module.
 * Import Firebase singletons and helpers from "@/firebase" throughout the app.
 *
 * @example
 * import { app, db, auth, storage } from "@/firebase";
 * import { getDocument, addDocument } from "@/firebase";
 * import { sendPhoneOtp, confirmPhoneOtp } from "@/firebase";
 * import { uploadFile, deleteFile } from "@/firebase";
 */

// ─── Firebase App ────────────────────────────────────────────────────────────
export { default as app, validateEnv } from "./firebase";

// ─── Firestore ───────────────────────────────────────────────────────────────
export { default as db } from "./firestore";
export {
  getDocument,
  getDocuments,
  addDocument,
  setDocument,
  updateDocument,
  deleteDocument,
  documentExists,
} from "./firestore";

// ─── Storage ─────────────────────────────────────────────────────────────────
export { default as storage } from "./storage";
export {
  uploadFile,
  getFileURL,
  deleteFile,
  getFileMetadata,
  listFiles,
} from "./storage";
export type { UploadProgress, UploadResult } from "./storage";

// ─── Auth ────────────────────────────────────────────────────────────────────
export { default as auth } from "./auth";
export {
  sendPhoneOtp,
  confirmPhoneOtp,
  signInWithGoogle,
  signOutCurrentUser,
  subscribeAuthState,
  getCurrentUser,
  updateCurrentUserProfile,
  toAuthUser,
} from "./auth";
export type { PhoneOtpSession, AuthUser } from "./auth";
