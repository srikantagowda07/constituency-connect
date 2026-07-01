/**
 * lib/conversation/index.ts
 *
 * Public API of the conversation engine.
 * The webhook adapter and any tests import from "@/lib/conversation".
 *
 * Only processMessage and the normalisation helper need to be public.
 * Everything else (step handlers, state store) is internal.
 */

export { processMessage } from "./engine";
export { normalizeInboundMessage } from "./normalize";
export type {
  InboundMessage,
  OutboundMessage,
  EngineResult,
  ConversationStep,
  ConversationState,
} from "@/types/conversation";
