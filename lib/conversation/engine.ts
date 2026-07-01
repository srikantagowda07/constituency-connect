/**
 * lib/conversation/engine.ts
 *
 * The conversation engine — the single entry point for all inbound WhatsApp
 * messages. It is the only file that knows about both the step handlers and
 * the state store.
 *
 * ─── Responsibilities ────────────────────────────────────────────────────────
 *  1. Load the citizen's current conversation state from Firestore.
 *  2. Guard against blocked citizens.
 *  3. Route the inbound message to the correct step handler.
 *  4. If the handler produced a ComplaintPayload, create the Firestore
 *     complaint document and generate the ticket number.
 *  5. Persist the updated state back to Firestore.
 *  6. Return an EngineResult with the outbound messages for the webhook to send.
 *
 * ─── What the engine does NOT do ─────────────────────────────────────────────
 *  - It does not send WhatsApp messages (the webhook adapter does that).
 *  - It does not parse the raw Meta Cloud API payload (the adapter does that).
 *  - Step handlers do not call Firestore or send messages directly.
 *
 * This separation means the engine and every handler can be unit-tested
 * by injecting an InboundMessage without running a server.
 */

import {
  type InboundMessage,
  type EngineResult,
  type OutboundMessage,
  type StepHandlerContext,
  type StepHandlerResult,
  initialState,
} from "@/types/conversation";
import { loadState, saveState, finalizeConversation } from "./state-store";
import { generateTicketNumber } from "./ticket";

// ── Step handlers ─────────────────────────────────────────────────────────────
import { handleGreeting }             from "./steps/greeting";
import { handleSelectConstituency }   from "./steps/select-constituency";
import { handleSelectArea }           from "./steps/select-area";
import { handleSelectWard }           from "./steps/select-ward";
import { handleSelectStreet }         from "./steps/select-street";
import { handleSelectCategory }       from "./steps/select-category";
import { handleCollectPhoto }         from "./steps/collect-photo";
import { handleCollectDescription }   from "./steps/collect-description";
import { handleCollectLocation }      from "./steps/collect-location";
import { handleConfirming }           from "./steps/confirming";
import { handleCompleted }            from "./steps/completed";

// ── Complaint creation ────────────────────────────────────────────────────────
import {
  collection,
  addDoc,
  serverTimestamp,
  getDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import db from "@/firebase/firestore";
import { COLLECTIONS } from "@/constants/firestore";
import type { Category } from "@/types/db/master";
import { logger } from "@/lib/logger";

// ─── Engine entry point ───────────────────────────────────────────────────────

/**
 * Process one inbound WhatsApp message and return outbound replies.
 *
 * @param message  Normalised inbound message from the webhook adapter
 * @returns        EngineResult — replies to send + complaint info if created
 */
export async function processMessage(message: InboundMessage): Promise<EngineResult> {
  const phone = message.from;

  // ── 1. Load state ──────────────────────────────────────────────────────────
  const state = await loadState(phone);

  // ── 2. Check if citizen is blocked ────────────────────────────────────────
  const citizenRef = doc(db, COLLECTIONS.CITIZENS, phone.replace(/^\+/, ""));
  const citizenSnap = await getDoc(citizenRef);
  if (citizenSnap.exists() && citizenSnap.data()["isBlocked"] === true) {
    return {
      newState: state,
      replies: [{
        to: phone,
        type: "text",
        text: "Your account has been suspended. Please contact the MLA office for assistance.",
      }],
      complaintId: null,
      ticketNumber: null,
    };
  }

  // ── 3. Route to the correct step handler ──────────────────────────────────
  const ctx: StepHandlerContext = { state, message, phone };
  const result: StepHandlerResult = await route(ctx);

  // ── 4. If handler produced a complaint payload, create the document ────────
  let complaintId: string | null = null;
  let ticketNumber: string | null = null;
  let confirmationReply: OutboundMessage | null = null;

  if (result.complaintPayload !== null) {
    try {
      ticketNumber = await generateTicketNumber();

      // Resolve SLA deadline from the category
      const catSnap = await getDoc(
        doc(db, COLLECTIONS.CATEGORIES, result.complaintPayload.categoryId),
      );
      const category = catSnap.exists() ? (catSnap.data() as Category) : null;
      const slaHours = category?.defaultSlaHours ?? 72;
      const slaDeadlineAt = new Date(Date.now() + slaHours * 60 * 60 * 1000);

      // Write the complaint document
      const ref = await addDoc(collection(db, COLLECTIONS.COMPLAINTS), {
        ticketNumber,
        source: "whatsapp",
        whatsappMessageId: message.messageId,
        ...result.complaintPayload,
        mediaIds: [],
        status: "pending",
        priority: "medium",
        priorityScore: 2,
        assignedTo: null,
        assignedBy: null,
        assignedAt: null,
        slaDeadlineAt,
        slaBreached: false,
        resolutionNote: null,
        resolvedAt: null,
        closedAt: null,
        citizenRating: null,
        citizenFeedback: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      complaintId = ref.id;

      // Update citizen's last-known location IDs and bump stats
      await finalizeConversation(phone, {
        constituencyId: result.complaintPayload.constituencyId,
        wardId:         result.complaintPayload.wardId,
        streetId:       result.complaintPayload.streetId,
        totalDelta:   1,
        pendingDelta: 1,
      });

      logger.info("[Engine] Complaint created:", complaintId, ticketNumber);

      // Build the confirmation message
      confirmationReply = {
        to: phone,
        type: "text",
        text:
          `✅ *Complaint Submitted Successfully!*\n\n` +
          `🎫 Ticket Number: *${ticketNumber}*\n\n` +
          `Your complaint has been registered and will be reviewed by the MLA office. ` +
          `You will receive updates on this WhatsApp number.\n\n` +
          `Expected resolution: within *${slaHours} hours*.\n\n` +
          `Thank you for reaching out! 🙏`,
      };
    } catch (err) {
      logger.error("[Engine] Failed to create complaint:", err);
      confirmationReply = {
        to: phone,
        type: "text",
        text: "⚠️ We received your complaint but had trouble saving it. Please say *Hi* to try again or contact the MLA office directly.",
      };
      // Reset to idle so the citizen can retry
      result.nextState = initialState();
    }
  }

  // ── 5. Persist updated state ───────────────────────────────────────────────
  await saveState(phone, result.nextState);

  // ── 6. Assemble final reply list ───────────────────────────────────────────
  const replies: OutboundMessage[] = [
    ...result.replies,
    ...(confirmationReply ? [confirmationReply] : []),
  ];

  return {
    newState: result.nextState,
    replies,
    complaintId,
    ticketNumber,
  };
}

// ─── Router ───────────────────────────────────────────────────────────────────

async function route(ctx: StepHandlerContext): Promise<StepHandlerResult> {
  const { step } = ctx.state;

  switch (step) {
    case "idle":
    case "greeting":
      return handleGreeting(ctx);

    case "awaiting_constituency":
      return handleSelectConstituency(ctx);

    case "awaiting_area":
      return handleSelectArea(ctx);

    case "awaiting_ward":
      return handleSelectWard(ctx);

    case "awaiting_street":
      return handleSelectStreet(ctx);

    case "awaiting_category":
      return handleSelectCategory(ctx);

    case "awaiting_photo":
      return handleCollectPhoto(ctx);

    case "awaiting_description":
      return handleCollectDescription(ctx);

    case "awaiting_location":
      return handleCollectLocation(ctx);

    case "confirming":
      return handleConfirming(ctx);

    case "completed":
      return handleCompleted(ctx);

    default: {
      // Exhaustive check — TypeScript will error if a new step is added without
      // a corresponding case above.
      const _exhaustive: never = step;
      logger.error("[Engine] Unhandled step:", _exhaustive);
      return {
        nextState: { ...initialState(), lastActivityAt: new Date().toISOString() },
        replies: [{ to: ctx.message.from, type: "text", text: "Something went wrong. Please say Hi to restart." }],
        complaintPayload: null,
      };
    }
  }
}
