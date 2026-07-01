/**
 * app/api/whatsapp/webhook/route.ts
 *
 * Next.js App Router API route — the only entry point for Meta Cloud API.
 *
 * ─── Responsibilities (and ONLY these) ───────────────────────────────────────
 *  GET  — Webhook verification handshake (required by Meta on first setup).
 *  POST — Receive inbound messages, call the engine, send replies via WhatsApp.
 *
 * ─── What this file does NOT do ──────────────────────────────────────────────
 *  ✗ No conversation logic
 *  ✗ No Firestore reads/writes
 *  ✗ No state management
 *
 * All of that lives in lib/conversation/engine.ts.
 *
 * ─── Security ─────────────────────────────────────────────────────────────────
 *  - GET:  validates the hub.verify_token against WHATSAPP_VERIFY_TOKEN env var.
 *  - POST: validates the X-Hub-Signature-256 HMAC header using
 *          WHATSAPP_WEBHOOK_SECRET to prevent spoofed requests.
 */

import { type NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { processMessage, normalizeInboundMessage } from "@/lib/conversation";
import type { OutboundMessage } from "@/lib/conversation";
import type { MetaWebhookPayload } from "@/lib/conversation/normalize";
import { logger } from "@/lib/logger";

// ─── Environment variables ────────────────────────────────────────────────────

const VERIFY_TOKEN   = process.env.WHATSAPP_VERIFY_TOKEN!;
const WEBHOOK_SECRET = process.env.WHATSAPP_WEBHOOK_SECRET!;
const ACCESS_TOKEN   = process.env.WHATSAPP_ACCESS_TOKEN!;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;

const META_API_BASE = "https://graph.facebook.com/v19.0";

// ─── GET — Webhook verification ───────────────────────────────────────────────

export function GET(req: NextRequest): NextResponse {
  const { searchParams } = req.nextUrl;
  const mode      = searchParams.get("hub.mode");
  const token     = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    logger.info("[Webhook] Verification handshake passed.");
    return new NextResponse(challenge, { status: 200 });
  }

  logger.warn("[Webhook] Verification failed — token mismatch.");
  return new NextResponse("Forbidden", { status: 403 });
}

// ─── POST — Inbound message handler ──────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  // ── 1. Validate HMAC signature ─────────────────────────────────────────
  const rawBody  = await req.text();
  const signature = req.headers.get("x-hub-signature-256") ?? "";

  if (!isValidSignature(rawBody, signature)) {
    logger.warn("[Webhook] Invalid HMAC signature — request rejected.");
    return new NextResponse("Forbidden", { status: 403 });
  }

  // ── 2. Parse and normalise the payload ─────────────────────────────────
  let payload: MetaWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as MetaWebhookPayload;
  } catch {
    return new NextResponse("Bad Request", { status: 400 });
  }

  const inboundMessage = normalizeInboundMessage(payload);

  // Not an actionable message (e.g. delivery receipt, read receipt, status)
  if (!inboundMessage) {
    return new NextResponse("OK", { status: 200 });
  }

  logger.info("[Webhook] Inbound from:", inboundMessage.from, "type:", inboundMessage.type);

  // ── 3. Run the conversation engine ────────────────────────────────────
  let engineResult;
  try {
    engineResult = await processMessage(inboundMessage);
  } catch (err) {
    logger.error("[Webhook] Engine error:", err);
    // Always return 200 to Meta — otherwise it retries indefinitely
    return new NextResponse("OK", { status: 200 });
  }

  // ── 4. Send each reply back to WhatsApp ───────────────────────────────
  for (const reply of engineResult.replies) {
    try {
      await sendWhatsAppMessage(reply);
    } catch (err) {
      logger.error("[Webhook] Failed to send reply:", err);
      // Continue trying to send remaining replies even if one fails
    }
  }

  if (engineResult.ticketNumber) {
    logger.info("[Webhook] Complaint created:", engineResult.complaintId, engineResult.ticketNumber);
  }

  // Always return 200 so Meta does not retry
  return new NextResponse("OK", { status: 200 });
}

// ─── HMAC signature validation ────────────────────────────────────────────────

function isValidSignature(body: string, signatureHeader: string): boolean {
  if (!WEBHOOK_SECRET) return true; // skip validation if secret not configured (dev)
  if (!signatureHeader.startsWith("sha256=")) return false;

  const expected = createHmac("sha256", WEBHOOK_SECRET)
    .update(body, "utf8")
    .digest("hex");

  const provided = signatureHeader.slice("sha256=".length);

  try {
    return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(provided, "hex"));
  } catch {
    return false;
  }
}

// ─── WhatsApp Cloud API sender ────────────────────────────────────────────────

async function sendWhatsAppMessage(msg: OutboundMessage): Promise<void> {
  const url = `${META_API_BASE}/${PHONE_NUMBER_ID}/messages`;

  const body = buildRequestBody(msg);
  if (!body) return;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`WhatsApp API error ${res.status}: ${text}`);
  }
}

/** Convert OutboundMessage to the Meta Cloud API JSON shape. */
function buildRequestBody(msg: OutboundMessage): Record<string, unknown> | null {
  const base = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: msg.to.replace(/^\+/, ""), // Meta expects number without "+"
  };

  switch (msg.type) {
    case "text":
      return {
        ...base,
        type: "text",
        text: { body: msg.text ?? "", preview_url: false },
      };

    case "buttons":
      return {
        ...base,
        type: "interactive",
        interactive: {
          type: "button",
          header: msg.buttonsHeader ? { type: "text", text: msg.buttonsHeader } : undefined,
          body:   { text: msg.buttonsBody ?? "" },
          action: {
            buttons: (msg.buttons ?? []).map((b) => ({
              type: "reply",
              reply: { id: b.id, title: b.title },
            })),
          },
        },
      };

    case "list":
      return {
        ...base,
        type: "interactive",
        interactive: {
          type: "list",
          header: msg.listHeader ? { type: "text", text: msg.listHeader } : undefined,
          body:   { text: msg.listBody ?? "" },
          action: {
            button: msg.listButtonLabel ?? "Select",
            sections: (msg.listSections ?? []).map((s) => ({
              title: s.title,
              rows: s.rows.map((r) => ({
                id: r.id,
                title: r.title,
                description: r.description ?? "",
              })),
            })),
          },
        },
      };

    case "template":
      return {
        ...base,
        type: "template",
        template: {
          name: msg.templateName,
          language: { code: msg.templateLanguage ?? "en" },
          components: msg.templateParameters?.length
            ? [{
                type: "body",
                parameters: msg.templateParameters.map((p) => ({
                  type: "text",
                  text: p,
                })),
              }]
            : [],
        },
      };

    default:
      return null;
  }
}
