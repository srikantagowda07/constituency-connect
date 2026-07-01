/**
 * lib/conversation/steps/select-street.ts
 *
 * Handles street selection and presents the complaint category list.
 */

import { getDoc, getDocs, doc, collection, query, where, orderBy } from "firebase/firestore";
import db from "@/firebase/firestore";
import { COLLECTIONS } from "@/constants/firestore";
import type { Street, Category } from "@/types/db/master";
import {
  type StepHandlerContext,
  type StepHandlerResult,
  type ListSection,
} from "@/types/conversation";
import { buildRetryReply } from "./shared";

const MAX_RETRIES = 3;

export async function handleSelectStreet(ctx: StepHandlerContext): Promise<StepHandlerResult> {
  const { state, message } = ctx;
  const selectedId = message.text?.trim() ?? "";

  const streetSnap = await getDoc(doc(db, COLLECTIONS.STREETS, selectedId));
  if (!streetSnap.exists()) {
    if (state.retryCount >= MAX_RETRIES) {
      return buildRetryReply(ctx, "awaiting_street", "Too many invalid attempts. Please say Hi to restart.");
    }
    return {
      nextState: { ...state, retryCount: state.retryCount + 1, lastActivityAt: new Date().toISOString() },
      replies: [{ to: message.from, type: "text", text: "Please select a street from the list." }],
      complaintPayload: null,
    };
  }

  const street = streetSnap.data() as Street;

  // Fetch global categories
  const catSnap = await getDocs(
    query(
      collection(db, COLLECTIONS.CATEGORIES),
      where("isActive", "==", true),
      orderBy("displayOrder"),
    ),
  );
  const categories = catSnap.docs.map((d) => d.data() as Category);

  const sections: ListSection[] = [{
    title: "Select complaint category",
    rows: categories.map((c) => ({ id: c.id, title: c.name })),
  }];

  return {
    nextState: {
      ...state,
      step: "awaiting_category",
      draft: { ...state.draft, streetId: street.id, streetName: street.name },
      lastActivityAt: new Date().toISOString(),
      retryCount: 0,
    },
    replies: [{
      to: message.from,
      type: "list",
      listHeader: "📋 Complaint Category",
      listBody: `Street: ${street.name}\n\nWhat type of problem are you reporting?`,
      listButtonLabel: "Select Category",
      listSections: sections,
    }],
    complaintPayload: null,
  };
}
