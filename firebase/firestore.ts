/**
 * firebase/firestore.ts
 *
 * Firestore service module.
 *
 * Responsibilities:
 *  - Initialise and export the Firestore database instance.
 *  - Provide generic, typed CRUD helper functions that all feature
 *    services can use without importing from "firebase/firestore" directly.
 *
 * Design decisions:
 *  - Every helper is generic over T so callers get full type inference.
 *  - Helpers throw the underlying FirebaseError on failure — callers
 *    decide how to handle errors.
 *  - No business logic lives here. Collections, queries, and field
 *    mappings belong in services/.
 */

import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  serverTimestamp,
  type Firestore,
  type DocumentData,
  type DocumentSnapshot,
  type QueryConstraint,
  type WithFieldValue,
  type PartialWithFieldValue,
  type QuerySnapshot,
} from "firebase/firestore";
import app from "./firebase";

// ─── Firestore singleton ─────────────────────────────────────────────────────

const db: Firestore = getFirestore(app);

export default db;

// ─── Generic typed helpers ───────────────────────────────────────────────────

/**
 * Fetch a single document by collection path and document ID.
 * Returns null when the document does not exist.
 *
 * @example
 * const user = await getDocument<UserProfile>("users", uid);
 */
export async function getDocument<T extends DocumentData>(
  collectionPath: string,
  documentId: string,
): Promise<T | null> {
  const snap: DocumentSnapshot<DocumentData> = await getDoc(
    doc(db, collectionPath, documentId),
  );
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as unknown as T;
}

/**
 * Fetch all documents from a collection, with optional query constraints.
 *
 * @example
 * const complaints = await getDocuments<Complaint>("complaints", [
 *   where("status", "==", "pending"),
 *   orderBy("createdAt", "desc"),
 *   limit(20),
 * ]);
 */
export async function getDocuments<T extends DocumentData>(
  collectionPath: string,
  constraints: QueryConstraint[] = [],
): Promise<T[]> {
  const ref = collection(db, collectionPath);
  const q = constraints.length > 0 ? query(ref, ...constraints) : query(ref);
  const snap: QuerySnapshot<DocumentData> = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as unknown as T));
}

/**
 * Add a new document to a collection with an auto-generated ID.
 * Automatically injects `createdAt` and `updatedAt` server timestamps.
 * Returns the new document ID.
 *
 * @example
 * const id = await addDocument("complaints", { category: "road", ... });
 */
export async function addDocument<T extends DocumentData>(
  collectionPath: string,
  data: WithFieldValue<Omit<T, "id">>,
): Promise<string> {
  const ref = await addDoc(collection(db, collectionPath), {
    ...(data as object),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/**
 * Create or overwrite a document at a known ID.
 * Automatically injects `createdAt` and `updatedAt` server timestamps.
 *
 * @example
 * await setDocument("users", uid, { uid, displayName: "Alice", ... });
 */
export async function setDocument<T extends DocumentData>(
  collectionPath: string,
  documentId: string,
  data: WithFieldValue<Omit<T, "id">>,
): Promise<void> {
  await setDoc(doc(db, collectionPath, documentId), {
    ...(data as object),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Partially update fields on an existing document.
 * Automatically refreshes the `updatedAt` server timestamp.
 *
 * @example
 * await updateDocument("complaints", id, { status: "resolved" });
 */
export async function updateDocument<T extends DocumentData>(
  collectionPath: string,
  documentId: string,
  data: PartialWithFieldValue<T>,
): Promise<void> {
  await updateDoc(doc(db, collectionPath, documentId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete a document by collection path and document ID.
 *
 * @example
 * await deleteDocument("notifications", notificationId);
 */
export async function deleteDocument(
  collectionPath: string,
  documentId: string,
): Promise<void> {
  await deleteDoc(doc(db, collectionPath, documentId));
}

/**
 * Check whether a document exists without fetching its data.
 *
 * @example
 * const exists = await documentExists("users", uid);
 */
export async function documentExists(
  collectionPath: string,
  documentId: string,
): Promise<boolean> {
  const snap = await getDoc(doc(db, collectionPath, documentId));
  return snap.exists();
}
