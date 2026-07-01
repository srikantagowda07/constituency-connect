/**
 * lib/conversation/steps/collect-photo.ts
 *
 * Handles photo upload or skip, then asks for a description.
 *
 * Accepted inputs:
 *   - WhatsApp image message → saves the mediaId to draft
 *   - "skip_photo" button reply → advances without a photo
 *   - Any text starting with "skip" (case-insensitive) → same
 */

import {
  type StepHandlerContext,
  type StepHandlerResult,
} from "@/types/conversation";

export function handleCollectPhoto(ctx: StepHandlerContext): StepHandlerResult {
  const { state, message } = ctx;

  const isSkip =
    message.type === "interactive_reply" && message.text === "skip_photo"
    || (message.type === "text" && (message.text?.toLowerCase().startsWith("skip") ?? false));

  const mediaId = message.type === "image" ? message.mediaId : null;

  return {
    nextState: {
      ...state,
      step: "awaiting_description",
      draft: {
        ...state.draft,
        whatsappMediaId: isSkip ? null : (mediaId ?? state.draft.whatsappMediaId),
      },
      lastActivityAt: new Date().toISOString(),
      retryCount: 0,
    },
    replies: [{
      to: message.from,
      type: "text",
      text: mediaId
        ? "✅ Photo received!\n\nNow please describe the issue in a few words:"
        : "Okay, no photo.\n\nPlease describe the issue in a few words:",
    }],
    complaintPayload: null,
  };
}
