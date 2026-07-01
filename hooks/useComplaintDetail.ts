"use client";

/**
 * hooks/useComplaintDetail.ts
 *
 * Real-time single-complaint listener + its audit log.
 * The complaint document updates live (e.g. status change by a volunteer).
 * The audit log is fetched once on mount (updates are append-only).
 */

import { useEffect, useState } from "react";
import type { Complaint, ComplaintUpdate } from "@/types/db";
import {
  subscribeComplaintDetail,
  fetchComplaintUpdates,
} from "@/services/dashboard.service";
import { logger } from "@/lib/logger";

interface UseComplaintDetailReturn {
  complaint: Complaint | null;
  updates: ComplaintUpdate[];
  loading: boolean;
  error: Error | null;
}

export function useComplaintDetail(complaintId: string | null): UseComplaintDetailReturn {
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [updates, setUpdates]     = useState<ComplaintUpdate[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<Error | null>(null);

  useEffect(() => {
    if (!complaintId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Real-time complaint listener
    const unsubscribe = subscribeComplaintDetail(
      complaintId,
      (data) => {
        setComplaint(data);
        setLoading(false);
      },
      (err) => {
        logger.error("useComplaintDetail error:", err);
        setError(err);
        setLoading(false);
      },
    );

    // One-shot audit log fetch (append-only — no need for real-time here)
    fetchComplaintUpdates(complaintId)
      .then(setUpdates)
      .catch((err: unknown) => logger.error("useComplaintDetail updates error:", err));

    return () => unsubscribe();
  }, [complaintId]);

  return { complaint, updates, loading, error };
}
