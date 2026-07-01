/**
 * lib/conversation/ticket.ts
 *
 * Ticket number generator.
 *
 * Format: CC-YYYY-NNNNNN
 *   CC     = Constituency Connect prefix
 *   YYYY   = current year
 *   NNNNNN = zero-padded 6-digit sequential number stored in Firestore
 *
 * Strategy:
 *   A single Firestore document at counters/ticket_counter stores the
 *   running sequence value. We use a Firestore transaction to increment
 *   it atomically — safe under concurrent webhook invocations.
 *
 * Why not random IDs?
 *   Citizens receive the ticket number over WhatsApp. "CC-2024-001042"
 *   is memorable and easy to read back over a voice call. A UUID is not.
 */

import {
  doc,
  runTransaction,
  getFirestore,
} from "firebase/firestore";
import app from "@/firebase/firebase";

const COUNTER_COLLECTION = "counters";
const COUNTER_DOC_ID = "ticket_counter";

/**
 * Atomically increment the counter and return the next ticket number.
 *
 * @example
 * const ticket = await generateTicketNumber(); // "CC-2024-001042"
 */
export async function generateTicketNumber(): Promise<string> {
  const db = getFirestore(app);
  const counterRef = doc(db, COUNTER_COLLECTION, COUNTER_DOC_ID);

  const nextValue = await runTransaction(db, async (tx) => {
    const snap = await tx.get(counterRef);
    const current: number = snap.exists()
      ? (snap.data()["value"] as number ?? 0)
      : 0;
    const next = current + 1;
    tx.set(counterRef, { value: next });
    return next;
  });

  const year = new Date().getFullYear();
  const sequence = String(nextValue).padStart(6, "0");
  return `CC-${year}-${sequence}`;
}
