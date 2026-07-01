/**
 * lib/conversation/steps/confirming.ts
 *
 * Handles the citizen's final YES / NO confirmation.
 *
 * YES → builds a ComplaintPayload and returns it to the engine, which
 *       creates the complaint document and generates the ticket number.
 *
 * NO  → resets to idle with a cancellation message.
 *
 * Any other input → asks the citizen to use the buttons.
 */

import { getDocs, collection, query, where } from "firebase/firestore";
import db from "@/firebase/firestore";
import { COLLECTIONS } from "@/constants/firestore";
import type { Department } from "@/types/db/master";
import {
  type StepHandlerContext,
  type StepHandlerResult,
  type ComplaintPayload,
  initialState,
} from "@/types/conversation";
import { phoneToDocId } from "../state-store";

// The organizationId is read from the constituency's organizationId at runtime.
// For now we resolve it by reading the constituency document lazily inside this handler.
import { getDoc, doc } from "firebase/firestore";
import type { Constituency } from "@/types/db/master";

export async function handleConfirming(ctx: StepHandlerContext): Promise<StepHandlerResult> {
  const { state, message, phone } = ctx;
  const draft = state.draft;

  const isYes =
    (message.type === "interactive_reply" && message.text === "confirm_yes") ||
    (message.type === "text" && /^y(es)?$/i.test(message.text?.trim() ?? ""));

  const isNo =
    (message.type === "interactive_reply" && message.text === "confirm_no") ||
    (message.type === "text" && /^no?$/i.test(message.text?.trim() ?? ""));

  // ── NO / Cancel ────────────────────────────────────────────────────────────
  if (isNo) {
    return {
      nextState: { ...initialState(), lastActivityAt: new Date().toISOString() },
      replies: [{
        to: message.from,
        type: "text",
        text: "Your complaint has been cancelled. Say *Hi* anytime to start a new complaint. 🙏",
      }],
      complaintPayload: null,
    };
  }

  // ── Unrecognised input ─────────────────────────────────────────────────────
  if (!isYes) {
    return {
      nextState: { ...state, retryCount: state.retryCount + 1, lastActivityAt: new Date().toISOString() },
      replies: [{
        to: message.from,
        type: "buttons",
        buttonsBody: "Please tap one of the buttons to confirm or cancel your complaint.",
        buttons: [
          { id: "confirm_yes", title: "Yes, Submit" },
          { id: "confirm_no",  title: "No, Cancel"  },
        ],
      }],
      complaintPayload: null,
    };
  }

  // ── YES — validate all required draft fields are present ──────────────────
  const required: (keyof typeof draft)[] = [
    "constituencyId", "areaId", "wardId", "streetId", "categoryId", "description",
  ];
  const missing = required.filter((k) => !draft[k]);
  if (missing.length > 0) {
    return {
      nextState: { ...initialState(), lastActivityAt: new Date().toISOString() },
      replies: [{
        to: message.from,
        type: "text",
        text: "Something went wrong with your complaint. Please say *Hi* to start again. Sorry for the inconvenience!",
      }],
      complaintPayload: null,
    };
  }

  // ── Resolve organizationId from constituency ────────────────────────────────
  const constituencySnap = await getDoc(
    doc(db, COLLECTIONS.CONSTITUENCIES, draft.constituencyId!),
  );
  const constituency = constituencySnap.exists()
    ? (constituencySnap.data() as Constituency)
    : null;
  const organizationId = constituency?.organizationId ?? "";

  // ── Resolve departmentId from categoryId ──────────────────────────────────
  const deptSnap = await getDocs(
    query(
      collection(db, COLLECTIONS.DEPARTMENTS),
      where("categoryIds", "array-contains", draft.categoryId!),
    ),
  );
  const department = deptSnap.docs.length > 0
    ? (deptSnap.docs[0]!.data() as Department)
    : null;

  const payload: ComplaintPayload = {
    citizenId:        phoneToDocId(phone),
    citizenPhone:     phone,
    citizenName:      null,          // populated from WhatsApp profile if available
    organizationId,
    constituencyId:   draft.constituencyId!,
    areaId:           draft.areaId!,
    wardId:           draft.wardId!,
    streetId:         draft.streetId!,
    categoryId:       draft.categoryId!,
    departmentId:     department?.id ?? null,
    description:      draft.description!,
    whatsappMediaId:  draft.whatsappMediaId,
    latitude:         draft.latitude,
    longitude:        draft.longitude,
    geoAddress:       draft.geoAddress,
  };

  return {
    nextState: {
      ...state,
      step: "completed",
      lastActivityAt: new Date().toISOString(),
      retryCount: 0,
    },
    replies: [],                  // engine sends confirmation after creating the complaint
    complaintPayload: payload,
  };
}
