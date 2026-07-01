/**
 * types/conversation.ts
 *
 * All types for the WhatsApp conversation state machine.
 *
 * ─── State machine ────────────────────────────────────────────────────────────
 *
 *   idle
 *     ↓  citizen says anything
 *   greeting
 *     ↓  bot sends constituency list
 *   awaiting_constituency
 *     ↓  citizen picks a number
 *   awaiting_area
 *     ↓  citizen picks a number
 *   awaiting_ward
 *     ↓  citizen picks a number
 *   awaiting_street
 *     ↓  citizen picks a number
 *   awaiting_category
 *     ↓  citizen picks a number
 *   awaiting_photo
 *     ↓  citizen sends image or types "skip"
 *   awaiting_description
 *     ↓  citizen types free text
 *   awaiting_location
 *     ↓  citizen shares GPS or types "skip"
 *   confirming
 *     ↓  citizen types "YES" or "NO"
 *   completed  (terminal — resets to idle after Xms)
 *
 * ─── Design decisions ────────────────────────────────────────────────────────
 *  - States are a discriminated union so each step handler receives only the
 *    draft fields that are valid for that point in the flow.
 *  - InboundMessage covers all message types the Meta Cloud API can send.
 *  - OutboundMessage is what a step handler returns — it never calls the API
 *    directly, keeping handlers pure and independently testable.
 */

// ─── Conversation steps (state names) ────────────────────────────────────────

export type ConversationStep =
  | "idle"
  | "greeting"
  | "awaiting_constituency"
  | "awaiting_area"
  | "awaiting_ward"
  | "awaiting_street"
  | "awaiting_category"
  | "awaiting_photo"
  | "awaiting_description"
  | "awaiting_location"
  | "confirming"
  | "completed";

// ─── Draft — accumulated complaint data ──────────────────────────────────────

/**
 * ComplaintDraft accumulates across multiple WhatsApp turns.
 * Fields become non-null as the citizen progresses through the flow.
 * The engine persists this in Firestore on every turn.
 */
export interface ComplaintDraft {
  constituencyId: string | null;
  constituencyName: string | null;
  areaId: string | null;
  areaName: string | null;
  wardId: string | null;
  wardName: string | null;
  streetId: string | null;
  streetName: string | null;
  categoryId: string | null;
  categoryName: string | null;
  description: string | null;
  /** WhatsApp media ID (from Meta Cloud API) — downloaded and stored later */
  whatsappMediaId: string | null;
  /** GPS from citizen's WhatsApp location share */
  latitude: number | null;
  longitude: number | null;
  geoAddress: string | null;
}

export function emptyDraft(): ComplaintDraft {
  return {
    constituencyId: null,
    constituencyName: null,
    areaId: null,
    areaName: null,
    wardId: null,
    wardName: null,
    streetId: null,
    streetName: null,
    categoryId: null,
    categoryName: null,
    description: null,
    whatsappMediaId: null,
    latitude: null,
    longitude: null,
    geoAddress: null,
  };
}

// ─── Persisted state (stored in citizens.conversation) ───────────────────────

export interface ConversationState {
  step: ConversationStep;
  draft: ComplaintDraft;
  /** ISO-8601 — used to expire stale conversations (>24h resets to idle) */
  lastActivityAt: string;
  /** Number of times the citizen sent an unrecognised reply at the current step */
  retryCount: number;
}

export function initialState(): ConversationState {
  return {
    step: "idle",
    draft: emptyDraft(),
    lastActivityAt: new Date().toISOString(),
    retryCount: 0,
  };
}

// ─── Inbound message (from Meta Cloud API, normalised) ───────────────────────

export type InboundMessageType =
  | "text"
  | "image"
  | "location"
  | "interactive_reply"  // button or list reply
  | "unsupported";

export interface InboundMessage {
  /** WhatsApp message ID (wamid.*) */
  messageId: string;
  /** Sender's E.164 phone with "+" */
  from: string;
  type: InboundMessageType;
  /** For text and interactive_reply — the text the user sent/selected */
  text: string | null;
  /** For image — the Meta Cloud API media ID */
  mediaId: string | null;
  /** For location — GPS coords */
  latitude: number | null;
  longitude: number | null;
  /** Raw timestamp from Meta */
  timestamp: string;
}

// ─── Outbound message (what the engine returns to the webhook adapter) ────────

export type OutboundMessageType =
  | "text"           // plain text reply
  | "list"           // interactive list (≤10 rows)
  | "buttons"        // interactive buttons (≤3)
  | "template";      // approved WhatsApp template (for notifications)

export interface ListRow {
  id: string;
  title: string;
  description?: string;
}

export interface ListSection {
  title: string;
  rows: ListRow[];
}

export interface ButtonOption {
  id: string;
  title: string;
}

export interface OutboundMessage {
  to: string;
  type: OutboundMessageType;
  /** Used when type = "text" */
  text?: string;
  /** Used when type = "list" */
  listHeader?: string;
  listBody?: string;
  listButtonLabel?: string;
  listSections?: ListSection[];
  /** Used when type = "buttons" */
  buttonsHeader?: string;
  buttonsBody?: string;
  buttons?: ButtonOption[];
  /** Used when type = "template" */
  templateName?: string;
  templateLanguage?: string;
  templateParameters?: string[];
}

// ─── Engine result ────────────────────────────────────────────────────────────

/**
 * The return value of the engine's `processMessage` function.
 * The webhook adapter sends every message in `replies` back to the citizen.
 */
export interface EngineResult {
  /** Updated state — already persisted by the engine before returning */
  newState: ConversationState;
  /** One or more outbound messages to send (usually one, occasionally two) */
  replies: OutboundMessage[];
  /** Set when the flow reaches "completed" and a complaint was created */
  complaintId: string | null;
  ticketNumber: string | null;
}

// ─── Step handler contract ────────────────────────────────────────────────────

/**
 * Every step handler implements this signature.
 * Handlers are pure functions: they receive state + message, return a new state
 * and a reply. They never call Firestore or the WhatsApp API directly.
 */
export interface StepHandlerContext {
  state: ConversationState;
  message: InboundMessage;
  /** Citizen's phone — needed to build the complaint citizenId */
  phone: string;
}

export interface StepHandlerResult {
  nextState: ConversationState;
  replies: OutboundMessage[];
  /** Only set by the confirming step on YES confirmation */
  complaintPayload: ComplaintPayload | null;
}

// ─── Complaint payload (produced by confirming step, consumed by engine) ──────

/**
 * Everything needed to create the complaints document.
 * Produced once the citizen confirms "YES".
 */
export interface ComplaintPayload {
  citizenId: string;
  citizenPhone: string;
  citizenName: string | null;
  organizationId: string;
  constituencyId: string;
  areaId: string;
  wardId: string;
  streetId: string;
  categoryId: string;
  departmentId: string | null;
  description: string;
  whatsappMediaId: string | null;
  latitude: number | null;
  longitude: number | null;
  geoAddress: string | null;
}
