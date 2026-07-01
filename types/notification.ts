export type NotificationChannel = "whatsapp" | "in_app";
export type NotificationStatus = "pending" | "sent" | "failed" | "read";

export interface Notification {
  id: string;
  recipientId: string;
  channel: NotificationChannel;
  title: string;
  body: string;
  status: NotificationStatus;
  complaintId: string | null;
  createdAt: string; // ISO-8601
  sentAt: string | null; // ISO-8601
}
