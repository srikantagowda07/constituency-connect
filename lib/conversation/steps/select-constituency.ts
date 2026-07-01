/**
 * lib/conversation/steps/select-constituency.ts
 *
 * Handles the citizen's constituency selection.
 * Validates the selected ID exists, saves it to draft, then fetches areas
 * for that constituency and presents them as the next list.
 */

import { getDoc, getDocs, doc, collection, query, where, orderBy } from "firebase/firestore";
import db from "@/firebase/firestore";
import { COLLECTIONS } from "@/constants/firestore";
import type { Constituency, Area } from "@/types/db/master";
import {
  type StepHandlerContext,
  type StepHandlerResult,
  type ListSection,
} from "@/types/conversation";
import { buildRetryReply } from "./shared";

const MAX_RETRIES = 3;

export async function handleSelectConstituency(
  ctx: StepHandlerContext,
): Promise<StepHandlerResult> {
  const { state, message } = ctx;
  const selectedId = message.text?.trim() ?? "";

  // Validate the selection
  const constituencySnap = await getDoc(
    doc(db, COLLECTIONS.CONSTITUENCIES, selectedId),
  );

  if (!constituencySnap.exists()) {
    if (state.retryCount >= MAX_RETRIES) {
      return buildRetryReply(ctx, "awaiting_constituency", "Sorry, I couldn't understand your selection. Please restart by saying Hi.");
    }
    return {
      nextState: { ...state, retryCount: state.retryCount + 1, lastActivityAt: new Date().toISOString() },
      replies: [{ to: message.from, type: "text", text: "Please use the list to select a constituency." }],
      complaintPayload: null,
    };
  }

  const constituency = constituencySnap.data() as Constituency;

  // Fetch areas for this constituency
  const areasSnap = await getDocs(
    query(
      collection(db, COLLECTIONS.AREAS),
      where("constituencyId", "==", selectedId),
      where("isActive", "==", true),
      orderBy("name"),
    ),
  );

  const areas = areasSnap.docs.map((d) => d.data() as Area);

  const sections: ListSection[] = [{
    title: "Select your area",
    rows: areas.map((a) => ({ id: a.id, title: a.name })),
  }];

  return {
    nextState: {
      ...state,
      step: "awaiting_area",
      draft: {
        ...state.draft,
        constituencyId: constituency.id,
        constituencyName: constituency.name,
      },
      lastActivityAt: new Date().toISOString(),
      retryCount: 0,
    },
    replies: [{
      to: message.from,
      type: "list",
      listHeader: `📍 ${constituency.name}`,
      listBody: "Now select your area:",
      listButtonLabel: "Select Area",
      listSections: sections,
    }],
    complaintPayload: null,
  };
}
