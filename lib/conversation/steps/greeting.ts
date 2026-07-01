/**
 * lib/conversation/steps/greeting.ts
 *
 * Triggered when a citizen sends any message while state is "idle".
 * Responds with a welcome message and asks them to select a constituency.
 * Fetches the active constituency list from Firestore.
 */

import { getDocs, collection, query, where, orderBy } from "firebase/firestore";
import db from "@/firebase/firestore";
import { COLLECTIONS } from "@/constants/firestore";
import type { Constituency } from "@/types/db/master";
import {
  type StepHandlerContext,
  type StepHandlerResult,
  type ListSection,
} from "@/types/conversation";

export async function handleGreeting(ctx: StepHandlerContext): Promise<StepHandlerResult> {
  const { state, message } = ctx;

  // Fetch active constituencies
  const snap = await getDocs(
    query(
      collection(db, COLLECTIONS.CONSTITUENCIES),
      where("isActive", "==", true),
      orderBy("name"),
    ),
  );

  const constituencies = snap.docs.map((d) => d.data() as Constituency);

  if (constituencies.length === 0) {
    return {
      nextState: { ...state, step: "idle" },
      replies: [{
        to: message.from,
        type: "text",
        text: "⚠️ Service is temporarily unavailable. Please try again shortly.",
      }],
      complaintPayload: null,
    };
  }

  const sections: ListSection[] = [{
    title: "Select your constituency",
    rows: constituencies.map((c) => ({
      id: c.id,
      title: c.name,
      description: `Assembly Constituency ${c.code}`,
    })),
  }];

  return {
    nextState: {
      ...state,
      step: "awaiting_constituency",
      draft: { ...state.draft },
      lastActivityAt: new Date().toISOString(),
      retryCount: 0,
    },
    replies: [{
      to: message.from,
      type: "list",
      listHeader: "🏛️ Constituency Connect",
      listBody: "Welcome! I'll help you file a complaint.\n\nFirst, please select your constituency:",
      listButtonLabel: "Select Constituency",
      listSections: sections,
    }],
    complaintPayload: null,
  };
}
