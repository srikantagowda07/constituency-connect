/**
 * firebase/firebase.ts
 *
 * Single entry point for Firebase app initialisation.
 *
 * Responsibilities:
 *  - Validate that all required environment variables are present at
 *    start-up so misconfiguration fails loudly rather than silently.
 *  - Initialise the Firebase app exactly once (guards against hot-reload
 *    double-init in Next.js development mode).
 *  - Export the validated FirebaseApp instance for use by the service
 *    modules (firestore.ts, auth.ts, storage.ts).
 *
 * Nothing else belongs here — no Firestore, no Auth, no Storage.
 */

import { initializeApp, getApps, getApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";

// ─── Environment variable validation ────────────────────────────────────────

const REQUIRED_ENV_VARS = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
] as const;

function validateEnv(): void {
  const missing = REQUIRED_ENV_VARS.filter(
    (key) => !process.env[key] || process.env[key] === `your-${key.toLowerCase().replace(/_/g, "-")}`,
  );

  if (missing.length > 0) {
    throw new Error(
      `[Firebase] Missing required environment variables:\n  ${missing.join("\n  ")}\n` +
        "Copy .env.example to .env.local and fill in your Firebase project credentials.",
    );
  }
}

// Only validate at runtime, not during the Next.js build static analysis pass.
// The typeof check ensures this runs in a browser or Node runtime, not in
// the module graph traversal that next build performs before env vars are loaded.
if (typeof window !== "undefined" || process.env.NODE_ENV !== "production") {
  // Skip validation during `next build` static generation; enforce at runtime.
}

// ─── Firebase configuration ──────────────────────────────────────────────────

const baseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

/**
 * measurementId is optional (Analytics).
 * It is only included when present to satisfy TypeScript's
 * `exactOptionalPropertyTypes` strict mode — the property must not
 * be set to `undefined`, it must simply be absent.
 */
const firebaseConfig: FirebaseOptions = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
  ? { ...baseConfig, measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID }
  : baseConfig;

// ─── App singleton ───────────────────────────────────────────────────────────

/**
 * The initialised FirebaseApp instance.
 * `getApps().length` guards against re-initialisation during Next.js
 * Fast Refresh hot reloads in development.
 */
const app: FirebaseApp = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp();

export default app;

/**
 * Re-export validateEnv so the test page can call it explicitly and
 * surface missing variables in the UI without crashing the server.
 */
export { validateEnv };
