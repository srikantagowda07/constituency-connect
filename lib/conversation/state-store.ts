/**
 * lib/conversation/state-store.ts
 *
 * Conversation state persistence layer.
 *
 * The state is stored inside the citizen's Firestore document:
 *   citizens/{citizenId}/conversation  (a nested map, not a subcollection)
 *
 * This keeps the state co-located with the citizen record so a single
 * getDoc call retrieves both citizen metadata and conversation state.
 *
 * ─── Stale conversation handling ─────────────────────────────────────────────
 * If a citizen abandons the flow and comes back >24 hours later, their
 * draft is stale. loadState detects this and resets to idle so they start
 * fresh rather than resuming a half-complete complaint.
 */

import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import db from "@/firebase/firestore";
import { COLLECTIONS } from "@/constants/firestore";
import {
  type ConversationState,
  type ComplaintDraft,
  initialState,
  emptyDraft,
} from "@/types/conversation";
import { logger } from "@/lib/logger";

/** Conversations idle for longer than this are reset automatically. */
const STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours

// ─── Phone → document ID ─────────────────────────────────────────────────────

/**
 * Strip the leading "+" from an E.164 number to get the Firestore doc ID.
 * "+919876543210" → "919876543210"
 */
export function phoneToDocId(phone: string): string {
  return phone.replace(/^\+/, "");
}

// ─── Load ─────────────────────────────────────────────────────────────────────

/**
 * Load the current conversation state for a citizen.
 *
 * If the citizen document does not exist it is created with a default state.
 * If the last activity was >24h ago the conversation is reset to idle.
 *
 * Always returns a valid ConversationState — never throws.
 */
export async function loadState(phone: string): Promise<ConversationState> {
  const docId = phoneToDocId(phone);
  const ref = doc(db, COLLECTIONS.CITIZENS, docId);

  try {
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      // First contact — create the citizen document
      const state = initialState();
      await setDoc(ref, {
        id: docId,
        phone,
        displayName: null,
        photoUrl: null,
        preferredLanguage: "en",
        constituencyId: null,
        wardId: null,
        streetId: null,
        lastKnownLocation: null,
        conversation: serializeState(state),
        consentGiven: false,
        consentGivenAt: null,
        isBlocked: false,
        blockedReason: null,
        stats: { totalComplaints: 0, resolvedComplaints: 0, pendingComplaints: 0 },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      logger.info("[StateStore] New citizen created:", docId);
      return state;
    }

    const data = snap.data();
    const raw = data["conversation"] as SerializedState | undefined;

    if (!raw) {
      const state = initialState();
      await saveState(phone, state);
      return state;
    }

    const state = deserializeState(raw);

    // Reset stale conversations
    const ageMs = Date.now() - new Date(state.lastActivityAt).getTime();
    if (ageMs > STALE_THRESHOLD_MS && state.step !== "idle") {
      logger.info("[StateStore] Stale conversation reset for:", docId);
      const fresh = initialState();
      await saveState(phone, fresh);
      return fresh;
    }

    return state;
  } catch (err) {
    logger.error("[StateStore] loadState error:", err);
    return initialState();
  }
}

// ─── Save ─────────────────────────────────────────────────────────────────────

/**
 * Persist the updated conversation state back to Firestore.
 * Uses updateDoc (not setDoc) to avoid overwriting other citizen fields.
 */
export async function saveState(
  phone: string,
  state: ConversationState,
): Promise<void> {
  const docId = phoneToDocId(phone);
  const ref = doc(db, COLLECTIONS.CITIZENS, docId);

  try {
    await updateDoc(ref, {
      conversation: serializeState(state),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    logger.error("[StateStore] saveState error:", err);
    throw err;
  }
}

/**
 * After a complaint is submitted, update the citizen's "last known" location
 * IDs and increment the denormalized stats counter.
 */
export async function finalizeConversation(
  phone: string,
  updates: {
    constituencyId: string;
    wardId: string;
    streetId: string;
    totalDelta: number;
    pendingDelta: number;
  },
): Promise<void> {
  const docId = phoneToDocId(phone);
  const ref = doc(db, COLLECTIONS.CITIZENS, docId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const data = snap.data();
  const stats = (data["stats"] as { totalComplaints: number; pendingComplaints: number; resolvedComplaints: number }) ?? {
    totalComplaints: 0,
    pendingComplaints: 0,
    resolvedComplaints: 0,
  };

  await updateDoc(ref, {
    constituencyId: updates.constituencyId,
    wardId: updates.wardId,
    streetId: updates.streetId,
    "stats.totalComplaints": stats.totalComplaints + updates.totalDelta,
    "stats.pendingComplaints": stats.pendingComplaints + updates.pendingDelta,
    updatedAt: serverTimestamp(),
  });
}

// ─── Serialisation helpers ────────────────────────────────────────────────────
// Firestore stores nested maps. ComplaintDraft contains null values which
// Firestore accepts fine, but we type the serialized form explicitly.

interface SerializedState {
  step: string;
  draft: ComplaintDraft;
  lastActivityAt: string;
  retryCount: number;
}

function serializeState(state: ConversationState): SerializedState {
  return {
    step: state.step,
    draft: state.draft,
    lastActivityAt: state.lastActivityAt,
    retryCount: state.retryCount,
  };
}

function deserializeState(raw: SerializedState): ConversationState {
  return {
    step: (raw.step as ConversationState["step"]) ?? "idle",
    draft: { ...emptyDraft(), ...(raw.draft ?? {}) },
    lastActivityAt: raw.lastActivityAt ?? new Date().toISOString(),
    retryCount: raw.retryCount ?? 0,
  };
}
