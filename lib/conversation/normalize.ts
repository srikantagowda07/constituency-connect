/**
 * lib/conversation/normalize.ts
 *
 * Converts the raw Meta Cloud API webhook payload into a clean InboundMessage.
 *
 * The Meta payload is deeply nested and has many optional fields. This parser
 * extracts only what the engine needs and returns a flat, typed object.
 *
 * Reference: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples
 *
 * ─── Supported message types ─────────────────────────────────────────────────
 *   text              → plain text reply
 *   image             → photo with mediaId
 *   location          → GPS share
 *   interactive       → button_reply or list_reply
 *   (everything else) → "unsupported" — engine sends a polite fallback
 */

import type { InboundMessage, InboundMessageType } from "@/types/conversation";

// ─── Raw Meta Cloud API shape (minimal — only fields we read) ─────────────────

interface MetaMessage {
  id: string;
  from: string;
  timestamp: string;
  type: string;
  text?: { body: string };
  image?: { id: string; mime_type: string; caption?: string };
  location?: { latitude: number; longitude: number; name?: string; address?: string };
  interactive?: {
    type: "button_reply" | "list_reply";
    button_reply?: { id: string; title: string };
    list_reply?:   { id: string; title: string };
  };
}

interface MetaEntry {
  changes: Array<{
    value: {
      messages?: MetaMessage[];
      metadata?: { phone_number_id: string };
    };
  }>;
}

export interface MetaWebhookPayload {
  object: string;
  entry: MetaEntry[];
}

// ─── Parser ───────────────────────────────────────────────────────────────────

/**
 * Extract the first message from a Meta Cloud API webhook payload.
 * Returns null if the payload contains no actionable message
 * (e.g., a delivery receipt, status update, or unsupported event).
 *
 * @example
 * const msg = normalizeInboundMessage(req.body);
 * if (!msg) return; // not a user message — ignore
 */
export function normalizeInboundMessage(
  payload: MetaWebhookPayload,
): InboundMessage | null {
  const entry   = payload.entry?.[0];
  const change  = entry?.changes?.[0];
  const value   = change?.value;
  const raw     = value?.messages?.[0];

  if (!raw) return null;                      // status update / receipt — ignore

  const base = {
    messageId: raw.id,
    from: `+${raw.from}`,                     // ensure E.164 with "+"
    timestamp: raw.timestamp,
    text: null as string | null,
    mediaId: null as string | null,
    latitude: null as number | null,
    longitude: null as number | null,
  };

  switch (raw.type) {
    case "text":
      return {
        ...base,
        type: "text" satisfies InboundMessageType,
        text: raw.text?.body?.trim() ?? null,
      };

    case "image":
      return {
        ...base,
        type: "image" satisfies InboundMessageType,
        mediaId: raw.image?.id ?? null,
        text: raw.image?.caption?.trim() ?? null,
      };

    case "location":
      return {
        ...base,
        type: "location" satisfies InboundMessageType,
        latitude:  raw.location?.latitude  ?? null,
        longitude: raw.location?.longitude ?? null,
        text: raw.location?.address ?? raw.location?.name ?? null,
      };

    case "interactive": {
      const reply = raw.interactive?.type === "list_reply"
        ? raw.interactive.list_reply
        : raw.interactive?.button_reply;
      return {
        ...base,
        type: "interactive_reply" satisfies InboundMessageType,
        text: reply?.id ?? null,         // step handlers match on the reply ID
      };
    }

    default:
      return {
        ...base,
        type: "unsupported" satisfies InboundMessageType,
        text: null,
      };
  }
}
