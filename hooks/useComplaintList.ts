"use client";

/**
 * hooks/useComplaintList.ts
 *
 * Paginated, filtered, real-time complaint list hook.
 *
 * Pagination model:
 *   - Each page is a Firestore cursor-based window (startAfter).
 *   - `nextPage()` advances the cursor; `prevPage()` pops the cursor stack.
 *   - The cursor stack is reset whenever filters change.
 *
 * Search model:
 *   - Client-side filter over the current page by ticketNumber prefix or
 *     citizen phone fragment. No extra Firestore reads.
 *
 * Real-time:
 *   - The current page is a live onSnapshot listener — new complaints and
 *     status changes on the visible page appear automatically.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import type { Complaint, ComplaintStatus } from "@/types/db";
import {
  subscribeComplaintList,
  type ComplaintFilters,
  PAGE_SIZE,
} from "@/services/dashboard.service";
import { logger } from "@/lib/logger";

interface UseComplaintListOptions {
  constituencyId?: string;
  status?: ComplaintStatus;
  categoryId?: string;
  assignedTo?: string;
  search?: string;
}

interface UseComplaintListReturn {
  complaints: Complaint[];
  loading: boolean;
  error: Error | null;
  /** Current page number (1-indexed, for display only) */
  page: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: () => void;
  prevPage: () => void;
}

export function useComplaintList(options: UseComplaintListOptions): UseComplaintListReturn {
  const [allComplaints, setAllComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<Error | null>(null);
  const [hasMore, setHasMore]   = useState(false);

  // Cursor stack: index 0 = page 1 (no cursor), each entry = start of that page
  const [cursorStack, setCursorStack] = useState<Array<QueryDocumentSnapshot<DocumentData> | null>>([null]);
  const [pageIndex, setPageIndex]     = useState(0);

  // Keep latest cursor snapshot for pagination
  const lastDocRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);

  // Build filters object — stable reference via JSON key comparison
  const filters: ComplaintFilters = {};
  if (options.constituencyId !== undefined) filters.constituencyId = options.constituencyId;
  if (options.status !== undefined) filters.status = options.status;
  if (options.categoryId !== undefined) filters.categoryId = options.categoryId;
  if (options.assignedTo !== undefined) filters.assignedTo = options.assignedTo;

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCursorStack([null]);
    setPageIndex(0);
    lastDocRef.current = null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    options.constituencyId,
    options.status,
    options.categoryId,
    options.assignedTo,
  ]);

  // Subscribe to the current page
  useEffect(() => {
    setLoading(true);
    setError(null);

    const cursor = cursorStack[pageIndex] ?? null;

    const unsubscribe = subscribeComplaintList(
      filters,
      cursor,
      (data, last, more) => {
        setAllComplaints(data);
        lastDocRef.current = last;
        setHasMore(more);
        setLoading(false);
      },
      (err) => {
        logger.error("useComplaintList error:", err);
        setError(err);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    options.constituencyId,
    options.status,
    options.categoryId,
    options.assignedTo,
    pageIndex,
    // cursorStack reference is stable within a page; pageIndex drives re-subscribe
  ]);

  // Client-side search filter over the loaded page
  const search = options.search?.trim().toLowerCase() ?? "";
  const complaints = search
    ? allComplaints.filter(
        (c) =>
          c.ticketNumber.toLowerCase().includes(search) ||
          c.citizenPhone.includes(search) ||
          (c.citizenName?.toLowerCase().includes(search) ?? false),
      )
    : allComplaints;

  const nextPage = useCallback(() => {
    if (!hasMore || !lastDocRef.current) return;
    setCursorStack((prev) => {
      const next = [...prev];
      // If we're not at the end of the stack (user went back then forward), reuse
      if (pageIndex + 1 >= next.length) {
        next.push(lastDocRef.current);
      }
      return next;
    });
    setPageIndex((p) => p + 1);
  }, [hasMore, pageIndex]);

  const prevPage = useCallback(() => {
    if (pageIndex === 0) return;
    setPageIndex((p) => p - 1);
  }, [pageIndex]);

  return {
    complaints,
    loading,
    error,
    page: pageIndex + 1,
    hasNextPage: hasMore,
    hasPrevPage: pageIndex > 0,
    nextPage,
    prevPage,
  };
}
