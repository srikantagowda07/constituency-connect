/**
 * lib/conversation/steps/completed.ts
 *
 * Terminal step — entered after the complaint is created.
 *
 * The engine sends the confirmation message (with ticket number) directly,
 * so by the time a second message arrives the citizen is already in "completed".
 * This handler resets them to idle and acknowledges any follow-up message.
 */

import {
  type StepHandlerContext,
  type StepHandlerResult,
  initialState,
} from "@/types/conversation";

export function handleCompleted(ctx: StepHandlerContext): StepHandlerResult {
  const { message } = ctx;

  return {
    nextState: { ...initialState(), lastActivityAt: new Date().toISOString() },
    replies: [{
      to: message.from,
      type: "text",
      text: "Your complaint has been submitted. 🙏\n\nSay *Hi* anytime to file a new complaint.",
    }],
    complaintPayload: null,
  };
}
