/**
 * lib/conversation/steps/select-ward.ts
 *
 * Handles ward selection and presents streets for the chosen ward.
 */

import { getDoc, getDocs, doc, collection, query, where, orderBy } from "firebase/firestore";
import db from "@/firebase/firestore";
import { COLLECTIONS } from "@/constants/firestore";
import type { Ward, Street } from "@/types/db/master";
import {
  type StepHandlerContext,
  type StepHandlerResult,
  type ListSection,
} from "@/types/conversation";
import { buildRetryReply } from "./shared";

const MAX_RETRIES = 3;

export async function handleSelectWard(ctx: StepHandlerContext): Promise<StepHandlerResult> {
  const { state, message } = ctx;
  const selectedId = message.text?.trim() ?? "";

  const wardSnap = await getDoc(doc(db, COLLECTIONS.WARDS, selectedId));
  if (!wardSnap.exists()) {
    if (state.retryCount >= MAX_RETRIES) {
      return buildRetryReply(ctx, "awaiting_ward", "Too many invalid attempts. Please say Hi to restart.");
    }
    return {
      nextState: { ...state, retryCount: state.retryCount + 1, lastActivityAt: new Date().toISOString() },
      replies: [{ to: message.from, type: "text", text: "Please select a ward from the list." }],
      complaintPayload: null,
    };
  }

  const ward = wardSnap.data() as Ward;

  const streetsSnap = await getDocs(
    query(
      collection(db, COLLECTIONS.STREETS),
      where("wardId", "==", selectedId),
      where("isActive", "==", true),
      orderBy("name"),
    ),
  );
  const streets = streetsSnap.docs.map((d) => d.data() as Street);

  const sections: ListSection[] = [{
    title: "Select your street",
    rows: streets.map((s) => ({ id: s.id, title: s.name })),
  }];

  return {
    nextState: {
      ...state,
      step: "awaiting_street",
      draft: { ...state.draft, wardId: ward.id, wardName: ward.name },
      lastActivityAt: new Date().toISOString(),
      retryCount: 0,
    },
    replies: [{
      to: message.from,
      type: "list",
      listHeader: `📍 ${ward.name}`,
      listBody: "Now select your street:",
      listButtonLabel: "Select Street",
      listSections: sections,
    }],
    complaintPayload: null,
  };
}
