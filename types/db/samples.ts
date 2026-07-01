/**
 * types/db/samples.ts
 *
 * Sample documents for every Firestore collection.
 *
 * Purpose:
 *  - Onboarding reference: shows exactly what a real document looks like.
 *  - Seed scripts can import these to populate a dev/staging database.
 *  - Dashboard mock data during UI development before real data exists.
 *
 * Notes:
 *  - Timestamp fields use a plain object { seconds, nanoseconds } to match
 *    the Firestore Timestamp wire format. Replace with Timestamp.now() or
 *    serverTimestamp() when writing to Firestore.
 *  - All IDs are short, readable strings — not random UUIDs — for clarity.
 */

import type {
  Organization,
  Constituency,
  Area,
  Ward,
  Street,
  Category,
  Department,
} from "./master";
import type { Admin, Volunteer } from "./admin";
import type { Citizen } from "./citizen";
import type { Complaint, ComplaintUpdate, Media, Notification } from "./complaint";

// ─── Timestamp stub ────────────────────────────────────────────────────────
// Firestore Timestamp fields are represented here as the raw wire-format object
// so this file has no runtime dependency on firebase/firestore.
const T = (iso: string) =>
  ({ seconds: Math.floor(new Date(iso).getTime() / 1000), nanoseconds: 0 }) as unknown as
    import("firebase/firestore").Timestamp;

// ─── Master samples ────────────────────────────────────────────────────────

/** organizations */
export const sampleOrganization: Organization = {
  id: "org_ka_001",
  name: "Karnataka Legislative Assembly",
  slug: "karnataka-legislative-assembly",
  code: "KLA",
  state: "Karnataka",
  country: "IN",
  contactEmail: "admin@kla.karnataka.gov.in",
  logoUrl: "https://firebasestorage.googleapis.com/v0/b/cc-dev.appspot.com/o/orgs%2Forg_ka_001%2Flogo.png",
  isActive: true,
  createdAt: T("2024-01-01T00:00:00Z"),
  updatedAt: T("2024-01-01T00:00:00Z"),
};

/** constituencies */
export const sampleConstituency: Constituency = {
  id: "con_rrn_157",
  organizationId: "org_ka_001",
  name: "Rajarajeshwari Nagar",
  slug: "rajarajeshwari-nagar",
  code: "AC-157",
  representativeName: "N. Munirathna",
  representativePhone: "+918022971234",
  geoCenter: { latitude: 12.9281, longitude: 77.5006 },
  isActive: true,
  createdAt: T("2024-01-01T00:00:00Z"),
  updatedAt: T("2024-01-01T00:00:00Z"),
};

/** areas */
export const sampleArea: Area = {
  id: "area_kengeri_001",
  constituencyId: "con_rrn_157",
  name: "Kengeri",
  slug: "kengeri",
  pinCodes: ["560060", "560061"],
  isActive: true,
  createdAt: T("2024-01-01T00:00:00Z"),
  updatedAt: T("2024-01-01T00:00:00Z"),
};

/** wards */
export const sampleWard: Ward = {
  id: "ward_142",
  constituencyId: "con_rrn_157",
  areaId: "area_kengeri_001",
  name: "Ullalu",
  slug: "ullalu",
  wardNumber: 142,
  councillorName: "Smt. Kavitha Reddy",
  isActive: true,
  createdAt: T("2024-01-01T00:00:00Z"),
  updatedAt: T("2024-01-01T00:00:00Z"),
};

/** streets */
export const sampleStreet: Street = {
  id: "street_15cross_001",
  wardId: "ward_142",
  areaId: "area_kengeri_001",
  constituencyId: "con_rrn_157",
  name: "15th Cross, Kengeri Satellite Town",
  slug: "15th-cross-kengeri-satellite-town",
  isActive: true,
  createdAt: T("2024-01-01T00:00:00Z"),
  updatedAt: T("2024-01-01T00:00:00Z"),
};

/** categories */
export const sampleCategory: Category = {
  id: "cat_road",
  name: "Road & Infrastructure",
  slug: "road-infrastructure",
  code: "ROAD",
  icon: "construction",
  color: "amber",
  defaultSlaHours: 72,
  displayOrder: 1,
  isActive: true,
  createdAt: T("2024-01-01T00:00:00Z"),
  updatedAt: T("2024-01-01T00:00:00Z"),
};

/** departments */
export const sampleDepartment: Department = {
  id: "dept_bbmp_roads",
  organizationId: "org_ka_001",
  name: "Bruhat Bengaluru Mahanagara Palike – Roads Division",
  slug: "bbmp-roads-division",
  code: "BBMP-ROADS",
  categoryIds: ["cat_road", "cat_drainage"],
  contactEmail: "roads@bbmp.gov.in",
  contactPhone: "+918022660000",
  displayOrder: 1,
  isActive: true,
  createdAt: T("2024-01-01T00:00:00Z"),
  updatedAt: T("2024-01-01T00:00:00Z"),
};

// ─── Admin samples ─────────────────────────────────────────────────────────

/** admins  (document ID = Firebase Auth UID) */
export const sampleAdmin: Admin = {
  id: "uid_admin_001",
  uid: "uid_admin_001",
  organizationId: "org_ka_001",
  constituencyId: "con_rrn_157",
  displayName: "Ravi Kumar",
  phone: "+919880001001",
  email: "ravi.kumar@mlaoffice.in",
  photoUrl: null,
  role: "admin",
  permissions: ["export_reports", "manage_volunteers"],
  isActive: true,
  lastSeenAt: T("2024-07-01T12:00:00Z"),
  createdAt: T("2024-01-15T09:00:00Z"),
  updatedAt: T("2024-07-01T12:00:00Z"),
};

/** volunteers  (document ID = Firebase Auth UID) */
export const sampleVolunteer: Volunteer = {
  id: "uid_vol_001",
  uid: "uid_vol_001",
  organizationId: "org_ka_001",
  constituencyId: "con_rrn_157",
  displayName: "Suresh Babu",
  phone: "+919880002001",
  email: null,
  photoUrl: null,
  status: "active",
  wardIds: ["ward_142", "ward_143"],
  categoryIds: ["cat_road", "cat_drainage"],
  isAvailable: true,
  isActive: true,
  lastSeenAt: T("2024-07-01T10:30:00Z"),
  stats: {
    totalAssigned: 48,
    activeCount: 3,
    resolvedCount: 44,
    avgResolutionHours: 18.5,
  },
  createdAt: T("2024-02-01T09:00:00Z"),
  updatedAt: T("2024-07-01T10:30:00Z"),
};

// ─── Citizen sample ────────────────────────────────────────────────────────

/**
 * citizens  (document ID = E.164 phone without "+")
 * Phone "+919876543210" → document ID "919876543210"
 */
export const sampleCitizen: Citizen = {
  id: "919876543210",
  phone: "+919876543210",
  displayName: "Meena S",
  photoUrl: null,
  preferredLanguage: "kn",
  constituencyId: "con_rrn_157",
  wardId: "ward_142",
  streetId: "street_15cross_001",
  lastKnownLocation: { latitude: 12.9275, longitude: 77.4998 },
  conversation: {
    state: "idle",
    draft: {},
    lastActivityAt: T("2024-07-01T11:45:00Z"),
  },
  consentGiven: true,
  consentGivenAt: T("2024-03-10T08:00:00Z"),
  isBlocked: false,
  blockedReason: null,
  stats: {
    totalComplaints: 4,
    resolvedComplaints: 3,
    pendingComplaints: 1,
  },
  createdAt: T("2024-03-10T08:00:00Z"),
  updatedAt: T("2024-07-01T11:45:00Z"),
};

// ─── Complaint samples ─────────────────────────────────────────────────────

/** complaints */
export const sampleComplaint: Complaint = {
  id: "cmp_abc123",
  ticketNumber: "CC-2024-001042",
  source: "whatsapp",
  whatsappMessageId: "wamid.HBgMOTE5ODc2NTQzMjEwFQIAEhgUM0E5RjU4",
  citizenId: "919876543210",
  citizenPhone: "+919876543210",
  citizenName: "Meena S",
  organizationId: "org_ka_001",
  constituencyId: "con_rrn_157",
  areaId: "area_kengeri_001",
  wardId: "ward_142",
  streetId: "street_15cross_001",
  geoLocation: { latitude: 12.9275, longitude: 77.4998 },
  geoAddress: "15th Cross, Kengeri Satellite Town, Bengaluru, Karnataka 560060",
  categoryId: "cat_road",
  departmentId: "dept_bbmp_roads",
  description: "Large pothole on 15th Cross near the bus stop. Multiple vehicles damaged.",
  mediaIds: ["media_img_001"],
  status: "assigned",
  priority: "high",
  priorityScore: 3,
  assignedTo: "uid_vol_001",
  assignedBy: "uid_admin_001",
  assignedAt: T("2024-07-01T09:15:00Z"),
  slaDeadlineAt: T("2024-07-04T07:30:00Z"),
  slaBreached: false,
  resolutionNote: null,
  resolvedAt: null,
  closedAt: null,
  citizenRating: null,
  citizenFeedback: null,
  createdAt: T("2024-07-01T07:30:00Z"),
  updatedAt: T("2024-07-01T09:15:00Z"),
};

/** complaint_updates */
export const sampleComplaintUpdate: ComplaintUpdate = {
  id: "upd_xyz789",
  complaintId: "cmp_abc123",
  actorId: "uid_admin_001",
  actorName: "Ravi Kumar",
  action: "assigned",
  fromStatus: "pending",
  toStatus: "assigned",
  assignedTo: "uid_vol_001",
  note: "Assigned to Suresh Babu – Ward 142 specialist.",
  notifiedCitizen: true,
  createdAt: T("2024-07-01T09:15:00Z"),
  updatedAt: T("2024-07-01T09:15:00Z"),
};

/** media */
export const sampleMedia: Media = {
  id: "media_img_001",
  complaintId: "cmp_abc123",
  uploadedById: "919876543210",
  uploadedByType: "citizen",
  type: "image",
  mimeType: "image/jpeg",
  originalFileName: "photo_from_whatsapp.jpg",
  storagePath: "complaints/cmp_abc123/photos/1720000000000-photo_from_whatsapp.jpg",
  downloadUrl:
    "https://firebasestorage.googleapis.com/v0/b/cc-dev.appspot.com/o/complaints%2Fcmp_abc123%2Fphotos%2F1720000000000-photo_from_whatsapp.jpg?alt=media",
  sizeBytes: 284672,
  status: "uploaded",
  whatsappMediaId: "1234567890123456",
  createdAt: T("2024-07-01T07:32:00Z"),
  updatedAt: T("2024-07-01T07:32:00Z"),
};

/** notifications */
export const sampleNotification: Notification = {
  id: "notif_001",
  recipientId: "919876543210",
  recipientType: "citizen",
  channel: "whatsapp",
  title: "Complaint Assigned",
  body: "Your complaint CC-2024-001042 has been assigned to a field volunteer and will be resolved within 72 hours.",
  whatsAppPayload: {
    templateName: "complaint_assigned",
    languageCode: "kn",
    parameters: ["CC-2024-001042", "Suresh Babu", "72 ಗಂಟೆ"],
  },
  complaintId: "cmp_abc123",
  ticketNumber: "CC-2024-001042",
  status: "delivered",
  externalMessageId: "wamid.HBgMOTE5ODc2NTQzMjEwFQIAERgSMEI0",
  errorMessage: null,
  attemptCount: 1,
  sentAt: T("2024-07-01T09:15:30Z"),
  deliveredAt: T("2024-07-01T09:15:45Z"),
  readAt: null,
  createdAt: T("2024-07-01T09:15:00Z"),
  updatedAt: T("2024-07-01T09:15:45Z"),
};
