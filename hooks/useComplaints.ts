"use client";

import { useCallback, useEffect, useState } from "react";
import type { Complaint, ComplaintStatus } from "@/types/complaint";
import { listComplaints } from "@/services/complaint.service";
import { logger } from "@/lib/logger";

interface UseComplaintsOptions {
  constituency?: string;
  status?: ComplaintStatus;
  assignedTo?: string;
  pageSize?: number;
}

interface UseComplaintsReturn {
  complaints: Complaint[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Fetch and return a filtered list of complaints from Firestore.
 */
export function useComplaints(options?: UseComplaintsOptions): UseComplaintsReturn {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(() => {
    setLoading(true);
    setError(null);

    listComplaints(options)
      .then(setComplaints)
      .catch((err: unknown) => {
        logger.error("useComplaints error:", err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
      })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options?.constituency, options?.status, options?.assignedTo, options?.pageSize]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { complaints, loading, error, refetch: fetch };
}
