/**
 * lib/conversation/steps/select-area.ts
 *
 * Handles area selection and presents wards for the chosen area.
 */

import { getDoc, getDocs, doc, collection, query, where, orderBy } from "firebase/firestore";
import db from "@/firebase/firestore";
import { COLLECTIONS } from "@/constants/firestore";
import type { Area, Ward } from "@/types/db/master";
import {
  type StepHandlerContext,
  type StepHandlerResult,
  type ListSection,
} from "@/types/conversation";
import { buildRetryReply } from "./shared";

const MAX_RETRIES = 3;

export async function handleSelectArea(ctx: StepHandlerContext): Promise<StepHandlerResult> {
  const { state, message } = ctx;
  const selectedId = message.text?.trim() ?? "";

  const areaSnap = await getDoc(doc(db, COLLECTIONS.AREAS, selectedId));
  if (!areaSnap.exists()) {
    if (state.retryCount >= MAX_RETRIES) {
      return buildRetryReply(ctx, "awaiting_area", "Too many invalid attempts. Please say Hi to restart.");
    }
    return {
      nextState: { ...state, retryCount: state.retryCount + 1, lastActivityAt: new Date().toISOString() },
      replies: [{ to: message.from, type: "text", text: "Please select an area from the list." }],
      complaintPayload: null,
    };
  }

  const area = areaSnap.data() as Area;

  const wardsSnap = await getDocs(
    query(
      collection(db, COLLECTIONS.WARDS),
      where("areaId", "==", selectedId),
      where("isActive", "==", true),
      orderBy("wardNumber"),
    ),
  );
  const wards = wardsSnap.docs.map((d) => d.data() as Ward);

  const sections: ListSection[] = [{
    title: "Select your ward",
    rows: wards.map((w) => ({
      id: w.id,
      title: w.name,
      description: `Ward No. ${w.wardNumber}`,
    })),
  }];

  return {
    nextState: {
      ...state,
      step: "awaiting_ward",
      draft: { ...state.draft, areaId: area.id, areaName: area.name },
      lastActivityAt: new Date().toISOString(),
      retryCount: 0,
    },
    replies: [{
      to: message.from,
      type: "list",
      listHeader: `📍 ${area.name}`,
      listBody: "Now select your ward:",
      listButtonLabel: "Select Ward",
      listSections: sections,
    }],
    complaintPayload: null,
  };
}
