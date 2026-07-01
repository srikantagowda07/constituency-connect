/**
 * lib/conversation/steps/collect-description.ts
 *
 * Collects the citizen's free-text description of the issue.
 * Validates minimum length (10 chars) and advances to location request.
 */

import {
  type StepHandlerContext,
  type StepHandlerResult,
} from "@/types/conversation";

const MIN_LENGTH = 10;
const MAX_LENGTH = 500;

export function handleCollectDescription(ctx: StepHandlerContext): StepHandlerResult {
  const { state, message } = ctx;
  const text = message.text?.trim() ?? "";

  if (text.length < MIN_LENGTH) {
    return {
      nextState: { ...state, retryCount: state.retryCount + 1, lastActivityAt: new Date().toISOString() },
      replies: [{
        to: message.from,
        type: "text",
        text: `Please provide a bit more detail (at least ${MIN_LENGTH} characters).\n\nDescribe the issue:`,
      }],
      complaintPayload: null,
    };
  }

  const description = text.slice(0, MAX_LENGTH);

  return {
    nextState: {
      ...state,
      step: "awaiting_location",
      draft: { ...state.draft, description },
      lastActivityAt: new Date().toISOString(),
      retryCount: 0,
    },
    replies: [{
      to: message.from,
      type: "buttons",
      buttonsBody: "📍 Please share your location (optional) so we can pinpoint the issue on a map.\n\nTap the 📎 icon in WhatsApp and choose *Location*, or skip.",
      buttons: [{ id: "skip_location", title: "Skip Location" }],
    }],
    complaintPayload: null,
  };
}
