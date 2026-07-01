export type ComplaintStatus =
  | "pending"
  | "assigned"
  | "in_progress"
  | "resolved"
  | "closed";

export type ComplaintCategory =
  | "road"
  | "water"
  | "electricity"
  | "sanitation"
  | "drainage"
  | "streetlight"
  | "other";

export interface GeoLocation {
  latitude: number;
  longitude: number;
  address: string | null;
}

export interface Complaint {
  id: string;
  citizenId: string;
  citizenPhone: string;
  category: ComplaintCategory;
  description: string;
  constituency: string;
  ward: string | null;
  area: string | null;
  street: string | null;
  location: GeoLocation | null;
  photoUrls: string[];
  status: ComplaintStatus;
  assignedTo: string | null; // volunteer uid
  whatsappMessageId: string | null;
  createdAt: string; // ISO-8601
  updatedAt: string; // ISO-8601
  resolvedAt: string | null; // ISO-8601
}

export interface ComplaintStatusUpdate {
  complaintId: string;
  status: ComplaintStatus;
  updatedBy: string;
  note: string | null;
  updatedAt: string; // ISO-8601
}
