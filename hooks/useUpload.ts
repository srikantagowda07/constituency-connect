"use client";

import { useState, useCallback } from "react";
import { uploadComplaintPhoto, type UploadProgress } from "@/services/storage.service";
import { logger } from "@/lib/logger";

interface UseUploadReturn {
  upload: (complaintId: string, file: File) => Promise<string | null>;
  progress: UploadProgress | null;
  uploading: boolean;
  error: Error | null;
}

/**
 * Upload a complaint photo with progress tracking.
 */
export function useUpload(): UseUploadReturn {
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const upload = useCallback(async (complaintId: string, file: File): Promise<string | null> => {
    setUploading(true);
    setError(null);
    setProgress(null);

    try {
      const url = await uploadComplaintPhoto(complaintId, file, setProgress);
      return url;
    } catch (err: unknown) {
      logger.error("useUpload error:", err);
      setError(err instanceof Error ? err : new Error("Upload failed"));
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

  return { upload, progress, uploading, error };
}
