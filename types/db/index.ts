/**
 * types/db/index.ts
 * Barrel export for all Firestore database types.
 * Import from "@/types/db" throughout the application.
 */
export type {
  DbDocument,
  Organization,
  Constituency,
  Area,
  Ward,
  Street,
  Category,
  Department,
  GeoPoint,
} from "./master";

export type { AdminRole, Admin, VolunteerStatus, VolunteerStats, Volunteer } from "./admin";

export type {
  ConversationState,
  ConversationContext,
  CitizenStats,
  Citizen,
} from "./citizen";

export type {
  ComplaintStatus,
  ComplaintPriority,
  ComplaintSource,
  Complaint,
  UpdateAction,
  ComplaintUpdate,
  MediaType,
  MediaStatus,
  MediaUploadedBy,
  Media,
  NotificationChannel,
  NotificationStatus,
  NotificationRecipientType,
  WhatsAppTemplatePayload,
  Notification,
} from "./complaint";
