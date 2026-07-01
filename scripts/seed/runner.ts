/**
 * scripts/seed/runner.ts
 *
 * Shared Firebase Admin SDK initialisation and Firestore batch writer.
 *
 * Used by every seed data module. Handles:
 *  - Admin SDK init (reads service account from env or JSON file)
 *  - Batched writes (Firestore max 500 ops per batch — auto-chunked here)
 *  - Idempotent upserts (set with merge:false → deterministic doc IDs)
 *  - Progress logging
 */

import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore, type WriteBatch } from "firebase-admin/firestore";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

// Load .env.local so the script works without exporting env vars manually
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// ─── Admin SDK init ──────────────────────────────────────────────────────────

function initAdmin(): App {
  if (getApps().length > 0) return getApps()[0]!;

  // Option 1: Inline env vars (recommended for CI/CD)
  const projectId   = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey  = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (projectId && clientEmail && privateKey) {
    return initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  }

  // Option 2: Service account JSON file (for local development)
  const jsonPath = path.resolve(process.cwd(), "service-account.json");
  if (fs.existsSync(jsonPath)) {
    console.log("  Using service-account.json for Admin SDK credentials.");
    return initializeApp({ credential: cert(jsonPath) });
  }

  // Option 3: Application Default Credentials (gcloud auth application-default login)
  console.log("  Using Application Default Credentials.");
  return initializeApp();
}

// ─── Firestore singleton ─────────────────────────────────────────────────────

let _db: Firestore | null = null;

export function getDb(): Firestore {
  if (!_db) {
    initAdmin();
    _db = getFirestore();
    _db.settings({ ignoreUndefinedProperties: true });
  }
  return _db;
}

// ─── Batch writer ────────────────────────────────────────────────────────────

const BATCH_SIZE = 400; // Stay safely under Firestore's 500-op limit

/**
 * Write an array of documents to a Firestore collection in batches.
 * Uses `set` (full overwrite) so the script is idempotent — re-running
 * it will overwrite existing documents with the same ID rather than failing.
 *
 * @param collection  Firestore collection name
 * @param documents   Array of objects. Each must have an `id: string` field.
 */
export async function seedCollection<T extends { id: string }>(
  collection: string,
  documents: T[],
): Promise<void> {
  const db = getDb();
  const total = documents.length;

  console.log(`\n  Seeding "${collection}" — ${total} document(s)`);

  for (let i = 0; i < documents.length; i += BATCH_SIZE) {
    const chunk = documents.slice(i, i + BATCH_SIZE);
    const batch: WriteBatch = db.batch();

    for (const doc of chunk) {
      const { id, ...data } = doc;
      const ref = db.collection(collection).doc(id);
      batch.set(ref, {
        ...data,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await batch.commit();
    const end = Math.min(i + BATCH_SIZE, total);
    console.log(`    ✓ Wrote ${i + 1}–${end} of ${total}`);
  }

  console.log(`  ✓ "${collection}" done.`);
}

// ─── Section logger ───────────────────────────────────────────────────────────

export function logSection(title: string): void {
  console.log(`\n${"─".repeat(56)}`);
  console.log(`  ${title}`);
  console.log("─".repeat(56));
}
