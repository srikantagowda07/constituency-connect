import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  type UploadTaskSnapshot,
} from "firebase/storage";
import storage from "@/firebase/storage";
import { STORAGE_PATHS } from "@/constants/app";
import { logger } from "@/lib/logger";

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  percent: number;
}

/**
 * Upload a complaint photo and return its download URL.
 * Calls onProgress with upload progress during the upload.
 */
export async function uploadComplaintPhoto(
  complaintId: string,
  file: File,
  onProgress?: (progress: UploadProgress) => void,
): Promise<string> {
  const fileName = `${Date.now()}-${file.name}`;
  const storageRef = ref(storage, `${STORAGE_PATHS.COMPLAINT_PHOTOS(complaintId)}/${fileName}`);
  const task = uploadBytesResumable(storageRef, file);

  return new Promise<string>((resolve, reject) => {
    task.on(
      "state_changed",
      (snapshot: UploadTaskSnapshot) => {
        onProgress?.({
          bytesTransferred: snapshot.bytesTransferred,
          totalBytes: snapshot.totalBytes,
          percent: (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
        });
      },
      reject,
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        logger.info("Photo uploaded:", url);
        resolve(url);
      },
    );
  });
}

/**
 * Delete a file by its full storage path.
 */
export async function deleteStorageFile(path: string): Promise<void> {
  await deleteObject(ref(storage, path));
  logger.info("Storage file deleted:", path);
}
