/**
 * lib/conversation/steps/select-category.ts
 *
 * Handles category selection and asks the citizen to upload a photo.
 */

import { getDoc, doc } from "firebase/firestore";
import db from "@/firebase/firestore";
import { COLLECTIONS } from "@/constants/firestore";
import type { Category } from "@/types/db/master";
import {
  type StepHandlerContext,
  type StepHandlerResult,
} from "@/types/conversation";
import { buildRetryReply } from "./shared";

const MAX_RETRIES = 3;

export async function handleSelectCategory(ctx: StepHandlerContext): Promise<StepHandlerResult> {
  const { state, message } = ctx;
  const selectedId = message.text?.trim() ?? "";

  const catSnap = await getDoc(doc(db, COLLECTIONS.CATEGORIES, selectedId));
  if (!catSnap.exists()) {
    if (state.retryCount >= MAX_RETRIES) {
      return buildRetryReply(ctx, "awaiting_category", "Too many invalid attempts. Please say Hi to restart.");
    }
    return {
      nextState: { ...state, retryCount: state.retryCount + 1, lastActivityAt: new Date().toISOString() },
      replies: [{ to: message.from, type: "text", text: "Please select a category from the list." }],
      complaintPayload: null,
    };
  }

  const category = catSnap.data() as Category;

  return {
    nextState: {
      ...state,
      step: "awaiting_photo",
      draft: {
        ...state.draft,
        categoryId: category.id,
        categoryName: category.name,
      },
      lastActivityAt: new Date().toISOString(),
      retryCount: 0,
    },
    replies: [{
      to: message.from,
      type: "buttons",
      buttonsBody: `📸 Please send a photo of the issue (optional).\n\nCategory: *${category.name}*\n\nYou can skip if you don't have a photo.`,
      buttons: [{ id: "skip_photo", title: "Skip Photo" }],
    }],
    complaintPayload: null,
  };
}
