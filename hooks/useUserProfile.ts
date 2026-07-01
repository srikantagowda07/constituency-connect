"use client";

import { useEffect, useState } from "react";
import type { UserProfile } from "@/types/user";
import { getUserProfile } from "@/services/user.service";
import { logger } from "@/lib/logger";

interface UseUserProfileReturn {
  profile: UserProfile | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Fetch and return a Firestore user profile for the given UID.
 */
export function useUserProfile(uid: string | null): UseUserProfileReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!uid) return;
    setLoading(true);
    setError(null);

    getUserProfile(uid)
      .then(setProfile)
      .catch((err: unknown) => {
        logger.error("useUserProfile error:", err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
      })
      .finally(() => setLoading(false));
  }, [uid]);

  return { profile, loading, error };
}
