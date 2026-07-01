/**
 * firebase/storage.ts
 *
 * Firebase Storage service module.
 *
 * Responsibilities:
 *  - Initialise and export the Storage instance.
 *  - Provide typed helpers for uploading, downloading, and deleting files.
 *
 * Design decisions:
 *  - Uploads expose a real-time progress callback so UI components can
 *    render a progress bar without coupling to Firebase internals.
 *  - Every helper accepts a `storagePath` string so callers (services/)
 *    own the path-naming convention — not this module.
 *  - No business logic lives here (no complaint IDs, no path building).
 */

import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  getMetadata,
  listAll,
  type FirebaseStorage,
  type StorageReference,
  type UploadTaskSnapshot,
  type FullMetadata,
} from "firebase/storage";
import app from "./firebase";

// ─── Storage singleton ───────────────────────────────────────────────────────

const storage: FirebaseStorage = getStorage(app);

export default storage;

// ─── Types ───────────────────────────────────────────────────────────────────

export interface UploadProgress {
  /** Bytes transferred so far */
  bytesTransferred: number;
  /** Total bytes to transfer */
  totalBytes: number;
  /** Percentage complete, 0–100 */
  percent: number;
  /** Current upload task state */
  state: UploadTaskSnapshot["state"];
}

export interface UploadResult {
  /** Public download URL */
  downloadURL: string;
  /** Full storage path (use this to delete the file later) */
  storagePath: string;
  /** File name without path */
  fileName: string;
  /** MIME type */
  contentType: string | undefined;
  /** File size in bytes */
  size: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Upload a File to the given storage path.
 * Returns a Promise that resolves with the download URL and metadata once
 * the upload is complete. An optional `onProgress` callback receives
 * live progress updates during the upload.
 *
 * @example
 * const result = await uploadFile(
 *   "complaints/abc123/photos/photo.jpg",
 *   file,
 *   (p) => console.log(`${p.percent.toFixed(0)}%`),
 * );
 */
export async function uploadFile(
  storagePath: string,
  file: File,
  onProgress?: (progress: UploadProgress) => void,
): Promise<UploadResult> {
  const storageRef: StorageReference = ref(storage, storagePath);
  const task = uploadBytesResumable(storageRef, file, {
    contentType: file.type,
  });

  return new Promise<UploadResult>((resolve, reject) => {
    task.on(
      "state_changed",
      (snapshot: UploadTaskSnapshot) => {
        onProgress?.({
          bytesTransferred: snapshot.bytesTransferred,
          totalBytes: snapshot.totalBytes,
          percent:
            snapshot.totalBytes > 0
              ? (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              : 0,
          state: snapshot.state,
        });
      },
      reject,
      async () => {
        try {
          const downloadURL = await getDownloadURL(task.snapshot.ref);
          const meta: FullMetadata = await getMetadata(task.snapshot.ref);
          resolve({
            downloadURL,
            storagePath,
            fileName: meta.name,
            contentType: meta.contentType ?? undefined,
            size: meta.size,
          });
        } catch (err) {
          reject(err);
        }
      },
    );
  });
}

/**
 * Get the public download URL for an existing file.
 *
 * @example
 * const url = await getFileURL("complaints/abc123/photos/photo.jpg");
 */
export async function getFileURL(storagePath: string): Promise<string> {
  return getDownloadURL(ref(storage, storagePath));
}

/**
 * Delete a file at the given storage path.
 *
 * @example
 * await deleteFile("complaints/abc123/photos/photo.jpg");
 */
export async function deleteFile(storagePath: string): Promise<void> {
  await deleteObject(ref(storage, storagePath));
}

/**
 * Fetch the metadata for a stored file.
 *
 * @example
 * const meta = await getFileMetadata("complaints/abc123/photos/photo.jpg");
 * console.log(meta.size, meta.contentType);
 */
export async function getFileMetadata(storagePath: string): Promise<FullMetadata> {
  return getMetadata(ref(storage, storagePath));
}

/**
 * List all file paths under a storage folder prefix.
 * Returns an array of full storage paths (not download URLs).
 *
 * @example
 * const paths = await listFiles("complaints/abc123/photos");
 */
export async function listFiles(folderPath: string): Promise<string[]> {
  const result = await listAll(ref(storage, folderPath));
  return result.items.map((item) => item.fullPath);
}
