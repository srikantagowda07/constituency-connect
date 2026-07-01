/**
 * lib/conversation/steps/shared.ts
 *
 * Shared utilities used across multiple step handlers.
 */

import {
  type StepHandlerContext,
  type StepHandlerResult,
  type ConversationStep,
  initialState,
} from "@/types/conversation";

/**
 * Build a "give up" response when MAX_RETRIES is exceeded.
 * Resets the conversation to idle so the citizen can start fresh.
 */
export function buildRetryReply(
  ctx: StepHandlerContext,
  _step: ConversationStep,
  message: string,
): StepHandlerResult {
  return {
    nextState: { ...initialState(), lastActivityAt: new Date().toISOString() },
    replies: [{ to: ctx.message.from, type: "text", text: message }],
    complaintPayload: null,
  };
}

/**
 * Format a summary line for the confirmation message.
 */
export function summaryLine(label: string, value: string | null): string {
  return `${label}: ${value ?? "—"}`;
}
