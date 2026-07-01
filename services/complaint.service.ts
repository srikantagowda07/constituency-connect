import {
  collection,
  doc,
  addDoc,
  getDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  type QueryConstraint,
} from "firebase/firestore";
import db from "@/firebase/firestore";
import { COLLECTIONS } from "@/constants/firestore";
import { PAGINATION } from "@/constants/app";
import type { Complaint, ComplaintStatus, ComplaintUpdate } from "@/types/db";
import { NotFoundError } from "@/lib/errors";
import { logger } from "@/lib/logger";

/**
 * Create a new complaint document and return its ID.
 */
export async function createComplaint(
  data: Omit<Complaint, "id" | "createdAt" | "updatedAt">,
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTIONS.COMPLAINTS), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  logger.info("Complaint created:", ref.id);
  return ref.id;
}

/**
 * Fetch a single complaint by ID.
 */
export async function getComplaint(id: string): Promise<Complaint> {
  const snap = await getDoc(doc(db, COLLECTIONS.COMPLAINTS, id));
  if (!snap.exists()) throw new NotFoundError("Complaint");
  return { id: snap.id, ...snap.data() } as Complaint;
}

/**
 * Update complaint status and append an audit record to complaint_updates.
 */
export async function updateComplaintStatus(
  complaintId: string,
  status: ComplaintStatus,
  actorId: string,
  actorName: string,
  fromStatus: ComplaintStatus,
  note?: string,
): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.COMPLAINTS, complaintId), {
    status,
    updatedAt: serverTimestamp(),
    ...(status === "resolved" ? { resolvedAt: serverTimestamp() } : {}),
    ...(status === "closed" ? { closedAt: serverTimestamp() } : {}),
  });

  const update: Omit<ComplaintUpdate, "id" | "createdAt" | "updatedAt"> = {
    complaintId,
    actorId,
    actorName,
    action: "status_changed",
    fromStatus,
    toStatus: status,
    assignedTo: null,
    note: note ?? null,
    notifiedCitizen: false,
  };
  await addDoc(collection(db, COLLECTIONS.COMPLAINT_UPDATES), {
    ...update,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  logger.info("Complaint status updated:", complaintId, "→", status);
}

/**
 * Assign a complaint to a volunteer and log the assignment.
 */
export async function assignComplaint(
  complaintId: string,
  volunteerId: string,
  assignedBy: string,
  assignedByName: string,
): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.COMPLAINTS, complaintId), {
    assignedTo: volunteerId,
    assignedBy,
    assignedAt: serverTimestamp(),
    status: "assigned" satisfies ComplaintStatus,
    updatedAt: serverTimestamp(),
  });

  const update: Omit<ComplaintUpdate, "id" | "createdAt" | "updatedAt"> = {
    complaintId,
    actorId: assignedBy,
    actorName: assignedByName,
    action: "assigned",
    fromStatus: "pending",
    toStatus: "assigned",
    assignedTo: volunteerId,
    note: null,
    notifiedCitizen: false,
  };
  await addDoc(collection(db, COLLECTIONS.COMPLAINT_UPDATES), {
    ...update,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  logger.info("Complaint assigned:", complaintId, "→", volunteerId);
}

/**
 * List complaints with optional filters.
 */
export async function listComplaints(options?: {
  constituencyId?: string;
  status?: ComplaintStatus;
  assignedTo?: string;
  pageSize?: number;
}): Promise<Complaint[]> {
  const constraints: QueryConstraint[] = [
    orderBy("createdAt", "desc"),
    limit(options?.pageSize ?? PAGINATION.DEFAULT_PAGE_SIZE),
  ];

  if (options?.constituencyId)
    constraints.push(where("constituencyId", "==", options.constituencyId));
  if (options?.status)
    constraints.push(where("status", "==", options.status));
  if (options?.assignedTo)
    constraints.push(where("assignedTo", "==", options.assignedTo));

  const snap = await getDocs(
    query(collection(db, COLLECTIONS.COMPLAINTS), ...constraints),
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Complaint));
}
