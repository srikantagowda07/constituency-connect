"use client";

/**
 * hooks/useDashboardStats.ts
 *
 * Real-time dashboard stats hook.
 * Opens one Firestore onSnapshot listener for the given constituency and
 * returns live complaint counts. The listener is cleaned up automatically
 * when the component unmounts.
 */

import { useEffect, useState } from "react";
import { subscribeDashboardStats, type DashboardStats } from "@/services/dashboard.service";
import { logger } from "@/lib/logger";

interface UseDashboardStatsReturn {
  stats: DashboardStats | null;
  loading: boolean;
  error: Error | null;
}

const EMPTY_STATS: DashboardStats = {
  total: 0,
  pending: 0,
  assigned: 0,
  inProgress: 0,
  resolved: 0,
  closed: 0,
};

export function useDashboardStats(constituencyId: string | null): UseDashboardStatsReturn {
  const [stats, setStats]   = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<Error | null>(null);

  useEffect(() => {
    if (!constituencyId) {
      setStats(EMPTY_STATS);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeDashboardStats(
      constituencyId,
      (data) => {
        setStats(data);
        setLoading(false);
      },
      (err) => {
        logger.error("useDashboardStats error:", err);
        setError(err);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [constituencyId]);

  return { stats, loading, error };
}
