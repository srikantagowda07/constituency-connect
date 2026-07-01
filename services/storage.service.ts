import { uploadFile, deleteFile, type UploadProgress } from "@/firebase/storage";
import { STORAGE_PATHS } from "@/constants/app";
import { logger } from "@/lib/logger";

export type { UploadProgress };

/**
 * Upload a complaint photo and return its public download URL.
 * Delegates to the generic uploadFile helper in firebase/storage.ts.
 */
export async function uploadComplaintPhoto(
  complaintId: string,
  file: File,
  onProgress?: (progress: UploadProgress) => void,
): Promise<string> {
  const fileName = `${Date.now()}-${file.name}`;
  const storagePath = `${STORAGE_PATHS.COMPLAINT_PHOTOS(complaintId)}/${fileName}`;

  const result = await uploadFile(storagePath, file, onProgress);
  logger.info("Photo uploaded:", result.downloadURL);
  return result.downloadURL;
}

/**
 * Delete a file by its full Firebase Storage path.
 */
export async function deleteStorageFile(storagePath: string): Promise<void> {
  await deleteFile(storagePath);
  logger.info("Storage file deleted:", storagePath);
}
