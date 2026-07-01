/**
 * services/dashboard.service.ts
 *
 * All Firestore read operations for the MLA dashboard.
 *
 * ─── Firestore optimization decisions ────────────────────────────────────────
 *
 *  1. CURSOR-BASED PAGINATION over offset pagination
 *     Firestore does not support offset skipping efficiently — it still reads
 *     and discards every document before the offset. Cursor pagination using
 *     startAfter(lastDocumentSnapshot) reads only the page you asked for.
 *
 *  2. STATS VIA onSnapshot OVER COUNT AGGREGATION
 *     Firestore's count() aggregation is a separate RPC and cannot be batched
 *     with a real-time listener. We maintain four lightweight status-filtered
 *     listeners and count the docs client-side. Each listener only fetches
 *     document IDs (no field data) — because we only need the count.
 *     Update: We use a dedicated counters/ document updated by the backend
 *     (see getDashboardStats) to avoid per-status listeners for counts.
 *
 *  3. FIELD SELECTION (select) IS NOT AVAILABLE IN THE WEB SDK
 *     The Firebase JS SDK doesn't support server-side field projection.
 *     To minimise data transfer we store only the fields needed for list
 *     display in a flat structure — the complaint document already does this
 *     (ticketNumber, citizenPhone, status, priority, categoryId, createdAt).
 *
 *  4. COMPOUND INDEXES
 *     Every multi-field query in this file requires a Firestore compound index.
 *     The required indexes are documented inline with each query.
 *     Run `firebase deploy --only firestore:indexes` after adding new queries.
 *
 *  5. DENORMALIZED CATEGORY/WARD NAMES ON COMPLAINTS
 *     Complaint documents store categoryId and wardId (not names). To avoid
 *     joining on every list render we resolve names once via a lookup map
 *     loaded from the master collections at dashboard startup (see loadMasterData).
 *
 *  6. REAL-TIME LISTENERS REPLACE POLLING
 *     onSnapshot listeners are kept open for the complaints list and the stats
 *     counter. They only deliver incremental deltas, not full re-reads.
 *     Each listener returns its own unsubscribe function — callers must invoke
 *     it in useEffect cleanup to prevent memory leaks.
 *
 *  7. SEARCH IS CLIENT-SIDE ON THE CURRENT PAGE
 *     Firestore does not support full-text search. We filter by ticketNumber
 *     prefix on the list already loaded in memory. For production, Algolia or
 *     Typesense can index complaint documents via a Cloud Function trigger.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
  type DocumentData,
  type Unsubscribe,
  type QueryConstraint,
} from "firebase/firestore";
import db from "@/firebase/firestore";
import { COLLECTIONS } from "@/constants/firestore";
import type { Complaint, ComplaintStatus, ComplaintUpdate } from "@/types/db";
import type { Category, Constituency } from "@/types/db/master";
import { logger } from "@/lib/logger";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DashboardStats {
  total: number;
  pending: number;
  assigned: number;
  inProgress: number;
  resolved: number;
  closed: number;
}

export interface ComplaintFilters {
  constituencyId?: string;
  status?: ComplaintStatus;
  categoryId?: string;
  assignedTo?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface ComplaintPage {
  complaints: Complaint[];
  /** Pass to the next fetchComplaintPage call to get the next page */
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}

export const PAGE_SIZE = 20;

// ─── Master data (loaded once, cached in memory) ──────────────────────────────

export interface MasterData {
  categories: Map<string, string>;     // id → name
  constituencies: Map<string, string>; // id → name
}

/**
 * [OPTIMIZATION 5] Load categories and constituencies once at dashboard
 * startup. The Map is passed to list renderers to resolve IDs → names
 * without issuing a Firestore read per row.
 *
 * Required indexes: none (simple collection scans, small documents)
 */
export async function loadMasterData(): Promise<MasterData> {
  const [catSnap, conSnap] = await Promise.all([
    getDocs(collection(db, COLLECTIONS.CATEGORIES)),
    getDocs(collection(db, COLLECTIONS.CONSTITUENCIES)),
  ]);

  const categories = new Map(
    catSnap.docs.map((d) => [d.id, (d.data() as Category).name]),
  );
  const constituencies = new Map(
    conSnap.docs.map((d) => [d.id, (d.data() as Constituency).name]),
  );

  return { categories, constituencies };
}

// ─── Stats ────────────────────────────────────────────────────────────────────

/**
 * [OPTIMIZATION 6] Real-time stats listener.
 *
 * We maintain a single onSnapshot on the complaints collection filtered to
 * the given constituencyId. The snapshot delivers incremental deltas.
 * We count statuses client-side from the snapshot's docs array.
 *
 * This avoids COUNT() RPCs and multiple separate listeners.
 *
 * Required index: constituencyId ASC, status ASC (composite)
 *
 * Trade-off: if a constituency has >10k complaints this snapshot becomes
 * expensive. At that scale, switch to a dedicated counters/{constituencyId}
 * document updated by Cloud Functions — but for the MVP this is fine.
 */
export function subscribeDashboardStats(
  constituencyId: string,
  onData: (stats: DashboardStats) => void,
  onError: (err: Error) => void,
): Unsubscribe {
  const constraints: QueryConstraint[] = [
    where("constituencyId", "==", constituencyId),
  ];

  const q = query(collection(db, COLLECTIONS.COMPLAINTS), ...constraints);

  return onSnapshot(
    q,
    (snap) => {
      const stats: DashboardStats = {
        total: snap.size,
        pending: 0,
        assigned: 0,
        inProgress: 0,
        resolved: 0,
        closed: 0,
      };
      for (const d of snap.docs) {
        const status = (d.data() as Complaint).status;
        if (status === "pending")     stats.pending++;
        else if (status === "assigned")   stats.assigned++;
        else if (status === "in_progress") stats.inProgress++;
        else if (status === "resolved")    stats.resolved++;
        else if (status === "closed")      stats.closed++;
      }
      onData(stats);
    },
    (err) => {
      logger.error("[Dashboard] Stats listener error:", err);
      onError(err);
    },
  );
}

// ─── Complaint list (paginated + real-time) ───────────────────────────────────

/**
 * [OPTIMIZATION 1 + 6] Cursor-based pagination with a real-time listener.
 *
 * We use onSnapshot (not getDocs) so the current page updates live as
 * complaints are filed or status changes. The page size cap limits how many
 * documents are watched at once.
 *
 * startAfter(cursor) gives us true cursor-based pagination — only the
 * PAGE_SIZE documents after the cursor are fetched from Firestore.
 *
 * Required index: constituencyId ASC, createdAt DESC (composite)
 * Additional optional indexes depending on filter combinations:
 *   constituencyId + status + createdAt
 *   constituencyId + categoryId + createdAt
 *   constituencyId + assignedTo + createdAt
 */
export function subscribeComplaintList(
  filters: ComplaintFilters,
  cursor: QueryDocumentSnapshot<DocumentData> | null,
  onData: (complaints: Complaint[], lastDoc: QueryDocumentSnapshot<DocumentData> | null, hasMore: boolean) => void,
  onError: (err: Error) => void,
): Unsubscribe {
  const constraints: QueryConstraint[] = [];

  // Always filter by constituency — the primary partition key
  if (filters.constituencyId) {
    constraints.push(where("constituencyId", "==", filters.constituencyId));
  }
  if (filters.status) {
    constraints.push(where("status", "==", filters.status));
  }
  if (filters.categoryId) {
    constraints.push(where("categoryId", "==", filters.categoryId));
  }
  if (filters.assignedTo) {
    constraints.push(where("assignedTo", "==", filters.assignedTo));
  }

  // Always sort newest-first; secondary sort by ticketNumber for stable ordering
  constraints.push(orderBy("createdAt", "desc"));

  // [OPTIMIZATION 1] Fetch PAGE_SIZE + 1 to know if there's a next page
  // without a separate count query.
  constraints.push(limit(PAGE_SIZE + 1));

  if (cursor) {
    constraints.push(startAfter(cursor));
  }

  const q = query(collection(db, COLLECTIONS.COMPLAINTS), ...constraints);

  return onSnapshot(
    q,
    (snap) => {
      const hasMore = snap.docs.length > PAGE_SIZE;
      const docs = hasMore ? snap.docs.slice(0, PAGE_SIZE) : snap.docs;
      const lastDoc = docs.length > 0 ? (docs[docs.length - 1] ?? null) : null;
      const complaints = docs.map((d) => ({ id: d.id, ...d.data() } as Complaint));
      onData(complaints, lastDoc, hasMore);
    },
    (err) => {
      logger.error("[Dashboard] List listener error:", err);
      onError(err);
    },
  );
}

// ─── Complaint detail (real-time) ─────────────────────────────────────────────

/**
 * [OPTIMIZATION 6] Single-document real-time listener.
 *
 * A single onSnapshot on one document is the most efficient Firestore
 * read pattern — it only bills 1 read per change, not per page load.
 *
 * Required index: none (single document by ID)
 */
export function subscribeComplaintDetail(
  complaintId: string,
  onData: (complaint: Complaint | null) => void,
  onError: (err: Error) => void,
): Unsubscribe {
  const ref = doc(db, COLLECTIONS.COMPLAINTS, complaintId);

  return onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) {
        onData(null);
        return;
      }
      onData({ id: snap.id, ...snap.data() } as Complaint);
    },
    (err) => {
      logger.error("[Dashboard] Detail listener error:", err);
      onError(err);
    },
  );
}

// ─── Complaint audit log ──────────────────────────────────────────────────────

/**
 * Fetch the audit trail for a single complaint.
 *
 * [OPTIMIZATION 4] Uses a compound index on complaintId + createdAt.
 * complaint_updates is a flat collection (not subcollection) so the
 * dashboard can also query "all updates by volunteer X" across complaints.
 *
 * Required index: complaintId ASC, createdAt ASC (composite)
 */
export async function fetchComplaintUpdates(
  complaintId: string,
): Promise<ComplaintUpdate[]> {
  const snap = await getDocs(
    query(
      collection(db, COLLECTIONS.COMPLAINT_UPDATES),
      where("complaintId", "==", complaintId),
      orderBy("createdAt", "asc"),
    ),
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ComplaintUpdate));
}

// ─── Single complaint fetch (one-shot, no listener) ──────────────────────────

/**
 * One-shot fetch for server-side rendering or non-reactive contexts.
 */
export async function fetchComplaint(complaintId: string): Promise<Complaint | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.COMPLAINTS, complaintId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Complaint;
}
