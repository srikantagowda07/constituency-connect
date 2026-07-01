/**
 * lib/conversation/steps/collect-location.ts
 *
 * Handles the optional GPS location share step.
 *
 * Accepted inputs:
 *   - WhatsApp location message  → saves lat/lng/address to draft
 *   - "skip_location" button     → advances with null location
 *   - Any text starting "skip"   → same as button skip
 *
 * After this step the conversation moves to "confirming" where the citizen
 * reviews the full summary before it's submitted.
 */

import {
  type StepHandlerContext,
  type StepHandlerResult,
} from "@/types/conversation";
import { summaryLine } from "./shared";

export function handleCollectLocation(ctx: StepHandlerContext): StepHandlerResult {
  const { state, message } = ctx;

  const isSkip =
    (message.type === "interactive_reply" && message.text === "skip_location") ||
    (message.type === "text" && (message.text?.toLowerCase().startsWith("skip") ?? false));

  const hasLocation = message.type === "location" &&
    message.latitude !== null &&
    message.longitude !== null;

  const latitude  = hasLocation ? message.latitude  : null;
  const longitude = hasLocation ? message.longitude : null;

  const updatedDraft = {
    ...state.draft,
    latitude,
    longitude,
    geoAddress: null, // reverse geocoding happens server-side when complaint is created
  };

  // Build summary for the confirmation message
  const summary = [
    summaryLine("📍 Constituency", updatedDraft.constituencyName),
    summaryLine("🏘️ Area",         updatedDraft.areaName),
    summaryLine("🗺️ Ward",          updatedDraft.wardName),
    summaryLine("🛣️ Street",        updatedDraft.streetName),
    summaryLine("📋 Category",      updatedDraft.categoryName),
    summaryLine("📝 Description",   updatedDraft.description),
    summaryLine("📸 Photo",         updatedDraft.whatsappMediaId ? "Attached ✅" : "None"),
    summaryLine("📍 Location",      hasLocation ? `${latitude?.toFixed(4)}, ${longitude?.toFixed(4)}` : "Not shared"),
  ].join("\n");

  return {
    nextState: {
      ...state,
      step: "confirming",
      draft: updatedDraft,
      lastActivityAt: new Date().toISOString(),
      retryCount: 0,
    },
    replies: [{
      to: message.from,
      type: "buttons",
      buttonsHeader: "✅ Review Your Complaint",
      buttonsBody: `Please review and confirm:\n\n${summary}\n\nShall I submit this complaint?`,
      buttons: [
        { id: "confirm_yes", title: "Yes, Submit" },
        { id: "confirm_no",  title: "No, Cancel"  },
      ],
    }],
    complaintPayload: null,
  };
}
