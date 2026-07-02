import type { Complaint, ComplaintStatus, ComplaintUpdate, ComplaintPriority } from "@/types/db";
import type { Category } from "@/types/db/master";

// In-memory / localStorage mock DB for demoing without Firebase
export const mockCategories: Category[] = [
  { id: "cat_road", name: "Road", slug: "road", code: "ROAD", icon: "construction", color: "amber", defaultSlaHours: 72, displayOrder: 1, isActive: true, createdAt: {} as any, updatedAt: {} as any },
  { id: "cat_garbage", name: "Garbage", slug: "garbage", code: "GARB", icon: "trash-2", color: "green", defaultSlaHours: 24, displayOrder: 2, isActive: true, createdAt: {} as any, updatedAt: {} as any },
  { id: "cat_water", name: "Water", slug: "water", code: "WATR", icon: "droplets", color: "blue", defaultSlaHours: 48, displayOrder: 3, isActive: true, createdAt: {} as any, updatedAt: {} as any },
  { id: "cat_electricity", name: "Electricity", slug: "electricity", code: "ELEC", icon: "zap", color: "yellow", defaultSlaHours: 24, displayOrder: 4, isActive: true, createdAt: {} as any, updatedAt: {} as any },
  { id: "cat_health", name: "Health", slug: "health", code: "HLTH", icon: "heart-pulse", color: "red", defaultSlaHours: 12, displayOrder: 5, isActive: true, createdAt: {} as any, updatedAt: {} as any },
  { id: "cat_education", name: "Education", slug: "education", code: "EDUC", icon: "graduation-cap", color: "purple", defaultSlaHours: 120, displayOrder: 6, isActive: true, createdAt: {} as any, updatedAt: {} as any },
  { id: "cat_crime", name: "Crime", slug: "crime", code: "CRIM", icon: "shield-alert", color: "rose", defaultSlaHours: 6, displayOrder: 7, isActive: true, createdAt: {} as any, updatedAt: {} as any },
  { id: "cat_other", name: "Other", slug: "other", code: "OTHR", icon: "circle-help", color: "zinc", defaultSlaHours: 96, displayOrder: 8, isActive: true, createdAt: {} as any, updatedAt: {} as any },
];

export const mockVolunteers = [
  { id: "uid_vol_001", displayName: "Suresh Babu", phone: "+919880002001", isAvailable: true, wardIds: ["ward_142"] },
  { id: "uid_vol_002", displayName: "Kavitha Reddy", phone: "+919880002002", isAvailable: true, wardIds: ["ward_143"] },
  { id: "uid_vol_003", displayName: "John Doe", phone: "+919880002003", isAvailable: false, wardIds: ["ward_142", "ward_144"] },
  { id: "uid_vol_004", displayName: "Aravind Swamy", phone: "+919880002004", isAvailable: true, wardIds: ["ward_145"] },
];

export const mockWards = [
  { id: "ward_142", name: "Ullalu", wardNumber: 142 },
  { id: "ward_143", name: "Kengeri", wardNumber: 143 },
  { id: "ward_144", name: "Gnanabharathi", wardNumber: 144 },
  { id: "ward_145", name: "Hemmigepura", wardNumber: 145 },
];

const INITIAL_COMPLAINTS: Omit<Complaint, "createdAt" | "updatedAt" | "slaDeadlineAt" | "resolvedAt" | "closedAt" | "assignedAt">[] = [
  {
    id: "cmp_001",
    ticketNumber: "CC-2026-000101",
    source: "whatsapp",
    whatsappMessageId: "wamid.001",
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
    description: "Large potholes on 15th Cross near the bus stop. Multiple vehicles damaged.",
    mediaIds: ["media_img_001"],
    status: "assigned",
    priority: "high",
    priorityScore: 3,
    assignedTo: "uid_vol_001",
    assignedBy: "uid_admin_001",
    slaBreached: false,
    resolutionNote: null,
    citizenRating: null,
    citizenFeedback: null,
  },
  {
    id: "cmp_002",
    ticketNumber: "CC-2026-000102",
    source: "whatsapp",
    whatsappMessageId: "wamid.002",
    citizenId: "919876543211",
    citizenPhone: "+919876543211",
    citizenName: "Rakesh K",
    organizationId: "org_ka_001",
    constituencyId: "con_rrn_157",
    areaId: "area_kengeri_001",
    wardId: "ward_143",
    streetId: "street_main_002",
    geoLocation: { latitude: 12.9152, longitude: 77.4821 },
    geoAddress: "Kengeri Main Road, opposite Post Office, Bengaluru 560060",
    categoryId: "cat_garbage",
    departmentId: "dept_bbmp_swm",
    description: "Huge pile of garbage accumulated on the roadside. Stray dogs gathering, emitting a terrible smell.",
    mediaIds: ["media_img_002"],
    status: "pending",
    priority: "medium",
    priorityScore: 2,
    assignedTo: null,
    assignedBy: null,
    slaBreached: false,
    resolutionNote: null,
    citizenRating: null,
    citizenFeedback: null,
  },
  {
    id: "cmp_003",
    ticketNumber: "CC-2026-000103",
    source: "whatsapp",
    whatsappMessageId: "wamid.003",
    citizenId: "919876543212",
    citizenPhone: "+919876543212",
    citizenName: "Ananya Gowda",
    organizationId: "org_ka_001",
    constituencyId: "con_rrn_157",
    areaId: "area_kengeri_001",
    wardId: "ward_142",
    streetId: "street_80ft_003",
    geoLocation: { latitude: 12.9231, longitude: 77.4912 },
    geoAddress: "80 Feet Road, Ullalu, Near Shell Petrol Bunk, Bengaluru 560110",
    categoryId: "cat_water",
    departmentId: "dept_bwssb",
    description: "BWSSB main water pipe is leaking. Gallons of drinking water wasting on the road since yesterday morning.",
    mediaIds: ["media_img_003"],
    status: "in_progress",
    priority: "high",
    priorityScore: 3,
    assignedTo: "uid_vol_001",
    assignedBy: "uid_admin_001",
    slaBreached: false,
    resolutionNote: null,
    citizenRating: null,
    citizenFeedback: null,
  },
  {
    id: "cmp_004",
    ticketNumber: "CC-2026-000104",
    source: "whatsapp",
    whatsappMessageId: "wamid.004",
    citizenId: "919876543213",
    citizenPhone: "+919876543213",
    citizenName: "Mohammad Ali",
    organizationId: "org_ka_001",
    constituencyId: "con_rrn_157",
    areaId: "area_kengeri_001",
    wardId: "ward_144",
    streetId: "street_mall_004",
    geoLocation: { latitude: 12.9412, longitude: 77.5122 },
    geoAddress: "Gnanabharathi Main Road, Near Bangalore University campus, Bengaluru 560056",
    categoryId: "cat_electricity",
    departmentId: "dept_bescom",
    description: "Broken street light wire dangling from pole. It is hanging very low and is highly dangerous, especially when it rains.",
    mediaIds: ["media_img_004"],
    status: "resolved",
    priority: "critical",
    priorityScore: 4,
    assignedTo: "uid_vol_002",
    assignedBy: "uid_admin_001",
    slaBreached: false,
    resolutionNote: "BESCOM engineer visited the site and secured the dangling wire. Pole lamp replaced.",
    citizenRating: 5,
    citizenFeedback: "Extremely fast response. Thank you!",
  },
  {
    id: "cmp_005",
    ticketNumber: "CC-2026-000105",
    source: "whatsapp",
    whatsappMessageId: "wamid.005",
    citizenId: "919876543214",
    citizenPhone: "+919876543214",
    citizenName: "Shantha Kumar",
    organizationId: "org_ka_001",
    constituencyId: "con_rrn_157",
    areaId: "area_kengeri_001",
    wardId: "ward_145",
    streetId: "street_park_005",
    geoLocation: { latitude: 12.8988, longitude: 77.4765 },
    geoAddress: "Hemmigepura 2nd Stage, Near Primary Health Center, Bengaluru 560062",
    categoryId: "cat_health",
    departmentId: "dept_health_bbmp",
    description: "Mosquito breeding ground in stagnant drain water nearby. Dengue cases are rising in the street. Fogging required.",
    mediaIds: [],
    status: "pending",
    priority: "medium",
    priorityScore: 2,
    assignedTo: null,
    assignedBy: null,
    slaBreached: true,
    resolutionNote: null,
    citizenRating: null,
    citizenFeedback: null,
  },
  {
    id: "cmp_006",
    ticketNumber: "CC-2026-000106",
    source: "whatsapp",
    whatsappMessageId: "wamid.006",
    citizenId: "919876543210",
    citizenPhone: "+919876543210",
    citizenName: "Meena S",
    organizationId: "org_ka_001",
    constituencyId: "con_rrn_157",
    areaId: "area_kengeri_001",
    wardId: "ward_142",
    streetId: "street_15cross_001",
    geoLocation: { latitude: 12.9271, longitude: 77.4991 },
    geoAddress: "15th Cross, Ullalu, Bengaluru 560060",
    categoryId: "cat_electricity",
    departmentId: "dept_bescom",
    description: "Frequent power cuts in our layout. Power goes off every evening for 3-4 hours without notice.",
    mediaIds: [],
    status: "closed",
    priority: "low",
    priorityScore: 1,
    assignedTo: "uid_vol_003",
    assignedBy: "uid_admin_001",
    slaBreached: false,
    resolutionNote: "BESCOM reported a transformer overload issue which was resolved by balancing the phase load.",
    citizenRating: 4,
    citizenFeedback: "Issue resolved. No frequent power cuts now.",
  },
  {
    id: "cmp_007",
    ticketNumber: "CC-2026-000107",
    source: "dashboard",
    whatsappMessageId: null,
    citizenId: "919876543215",
    citizenPhone: "+919876543215",
    citizenName: "Balaji Singh",
    organizationId: "org_ka_001",
    constituencyId: "con_rrn_157",
    areaId: "area_kengeri_001",
    wardId: "ward_143",
    streetId: "street_main_002",
    geoLocation: null,
    geoAddress: "Kengeri Satellite Town near Railway Station Road, Bengaluru 560060",
    categoryId: "cat_road",
    departmentId: "dept_bbmp_roads",
    description: "Footpath slabs are broken and open. Highly dangerous for pedestrians and elderly walking in the night.",
    mediaIds: ["media_img_007"],
    status: "in_progress",
    priority: "medium",
    priorityScore: 2,
    assignedTo: "uid_vol_002",
    assignedBy: "uid_admin_001",
    slaBreached: false,
    resolutionNote: null,
    citizenRating: null,
    citizenFeedback: null,
  }
];

const INITIAL_UPDATES: Record<string, Omit<ComplaintUpdate, "createdAt" | "updatedAt">[]> = {
  cmp_001: [
    { id: "upd_001_1", complaintId: "cmp_001", actorId: "system", actorName: "Constituency Connect Bot", action: "created", fromStatus: null, toStatus: "pending", assignedTo: null, note: "Complaint successfully received via WhatsApp.", notifiedCitizen: true },
    { id: "upd_001_2", complaintId: "cmp_001", actorId: "uid_admin_001", actorName: "Ravi Kumar", action: "assigned", fromStatus: "pending", toStatus: "assigned", assignedTo: "uid_vol_001", note: "Assigned to Suresh Babu for verification.", notifiedCitizen: true }
  ],
  cmp_002: [
    { id: "upd_002_1", complaintId: "cmp_002", actorId: "system", actorName: "Constituency Connect Bot", action: "created", fromStatus: null, toStatus: "pending", assignedTo: null, note: "Complaint successfully registered via WhatsApp.", notifiedCitizen: true }
  ],
  cmp_003: [
    { id: "upd_003_1", complaintId: "cmp_003", actorId: "system", actorName: "Constituency Connect Bot", action: "created", fromStatus: null, toStatus: "pending", assignedTo: null, note: "Complaint registered.", notifiedCitizen: true },
    { id: "upd_003_2", complaintId: "cmp_003", actorId: "uid_admin_001", actorName: "Ravi Kumar", action: "assigned", fromStatus: "pending", toStatus: "assigned", assignedTo: "uid_vol_001", note: "Assigned to Suresh Babu.", notifiedCitizen: true },
    { id: "upd_003_3", complaintId: "cmp_003", actorId: "uid_vol_001", actorName: "Suresh Babu", action: "status_changed", fromStatus: "assigned", toStatus: "in_progress", assignedTo: null, note: "Inspected the leakage site. Contacted BWSSB local technician for joint repair.", notifiedCitizen: true }
  ],
  cmp_004: [
    { id: "upd_004_1", complaintId: "cmp_004", actorId: "system", actorName: "Constituency Connect Bot", action: "created", fromStatus: null, toStatus: "pending", assignedTo: null, note: "Registered.", notifiedCitizen: true },
    { id: "upd_004_2", complaintId: "cmp_004", actorId: "uid_admin_001", actorName: "Ravi Kumar", action: "assigned", fromStatus: "pending", toStatus: "assigned", assignedTo: "uid_vol_002", note: "Assigned to Kavitha Reddy.", notifiedCitizen: true },
    { id: "upd_004_3", complaintId: "cmp_004", actorId: "uid_vol_002", actorName: "Kavitha Reddy", action: "status_changed", fromStatus: "assigned", toStatus: "in_progress", assignedTo: null, note: "Visiting site with BESCOM inspector.", notifiedCitizen: true },
    { id: "upd_004_4", complaintId: "cmp_004", actorId: "uid_vol_002", actorName: "Kavitha Reddy", action: "status_changed", fromStatus: "in_progress", toStatus: "resolved", assignedTo: null, note: "Dangling wire secured, lamp replaced. BESCOM cleared work order.", notifiedCitizen: true }
  ],
  cmp_005: [
    { id: "upd_005_1", complaintId: "cmp_005", actorId: "system", actorName: "Constituency Connect Bot", action: "created", fromStatus: null, toStatus: "pending", assignedTo: null, note: "Registered.", notifiedCitizen: true },
    { id: "upd_005_2", complaintId: "cmp_005", actorId: "system", actorName: "System scheduler", action: "sla_breached", fromStatus: null, toStatus: null, assignedTo: null, note: "SLA Deadline (12 hours) breached without action.", notifiedCitizen: false }
  ],
  cmp_006: [
    { id: "upd_006_1", complaintId: "cmp_006", actorId: "system", actorName: "Constituency Connect Bot", action: "created", fromStatus: null, toStatus: "pending", assignedTo: null, note: "Registered.", notifiedCitizen: true },
    { id: "upd_006_2", complaintId: "cmp_006", actorId: "uid_admin_001", actorName: "Ravi Kumar", action: "assigned", fromStatus: "pending", toStatus: "assigned", assignedTo: "uid_vol_003", note: "Assigned to John Doe.", notifiedCitizen: true },
    { id: "upd_006_3", complaintId: "cmp_006", actorId: "uid_vol_003", actorName: "John Doe", action: "status_changed", fromStatus: "assigned", toStatus: "in_progress", assignedTo: null, note: "In touch with local sub station.", notifiedCitizen: true },
    { id: "upd_006_4", complaintId: "cmp_006", actorId: "uid_vol_003", actorName: "John Doe", action: "status_changed", fromStatus: "in_progress", toStatus: "resolved", assignedTo: null, note: "Overload issue fixed.", notifiedCitizen: true },
    { id: "upd_006_5", complaintId: "cmp_006", actorId: "uid_admin_001", actorName: "Ravi Kumar", action: "closed", fromStatus: "resolved", toStatus: "closed", assignedTo: null, note: "Citizen confirmed fix. Closed ticket.", notifiedCitizen: true }
  ],
  cmp_007: [
    { id: "upd_007_1", complaintId: "cmp_007", actorId: "uid_admin_001", actorName: "Ravi Kumar", action: "created", fromStatus: null, toStatus: "pending", assignedTo: null, note: "Complaint lodged from MLA dashboard.", notifiedCitizen: false },
    { id: "upd_007_2", complaintId: "cmp_007", actorId: "uid_admin_001", actorName: "Ravi Kumar", action: "assigned", fromStatus: "pending", toStatus: "assigned", assignedTo: "uid_vol_002", note: "Assigned to Kavitha Reddy.", notifiedCitizen: true },
    { id: "upd_007_3", complaintId: "cmp_007", actorId: "uid_vol_002", actorName: "Kavitha Reddy", action: "status_changed", fromStatus: "assigned", toStatus: "in_progress", assignedTo: null, note: "Inspection scheduled.", notifiedCitizen: true }
  ]
};

class MockDb {
  private isClient: boolean;

  constructor() {
    this.isClient = typeof window !== "undefined";
  }

  private getStored<T>(key: string, initial: T): T {
    if (!this.isClient) return initial;
    const val = localStorage.getItem(key);
    if (!val) {
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }
    try {
      return JSON.parse(val) as T;
    } catch {
      return initial;
    }
  }

  private setStored<T>(key: string, value: T): void {
    if (!this.isClient) return;
    localStorage.setItem(key, JSON.stringify(value));
  }

  getComplaints(): Complaint[] {
    const raw = this.getStored("mock_complaints", INITIAL_COMPLAINTS);
    return raw.map((c, i) => {
      const createdDaysAgo = 10 - i * 1.5;
      const createdAtDate = new Date(Date.now() - createdDaysAgo * 24 * 60 * 60 * 1000);
      const slaDeadlineDate = new Date(createdAtDate.getTime() + (c.categoryId === "cat_health" ? 12 : 72) * 60 * 60 * 1000);
      
      const secondsC = Math.floor(createdAtDate.getTime() / 1000);
      const secondsS = Math.floor(slaDeadlineDate.getTime() / 1000);

      return {
        ...c,
        createdAt: { seconds: secondsC, nanoseconds: 0 } as any,
        updatedAt: { seconds: secondsC, nanoseconds: 0 } as any,
        slaDeadlineAt: { seconds: secondsS, nanoseconds: 0 } as any,
        resolvedAt: c.status === "resolved" || c.status === "closed" ? ({ seconds: secondsC + 12000, nanoseconds: 0 } as any) : null,
        closedAt: c.status === "closed" ? ({ seconds: secondsC + 15000, nanoseconds: 0 } as any) : null,
        assignedAt: c.assignedTo ? ({ seconds: secondsC + 3600, nanoseconds: 0 } as any) : null,
      } as Complaint;
    });
  }

  saveComplaints(complaints: Complaint[]): void {
    this.setStored("mock_complaints", complaints);
  }

  getComplaint(id: string): Complaint | undefined {
    return this.getComplaints().find(c => c.id === id);
  }

  getUpdates(complaintId: string): ComplaintUpdate[] {
    const allUpdates = this.getStored("mock_updates", INITIAL_UPDATES);
    const updates = allUpdates[complaintId] ?? [];
    return updates.map((u, i) => {
      const date = new Date(Date.now() - (3 - i * 0.5) * 24 * 60 * 60 * 1000);
      return {
        ...u,
        createdAt: { seconds: Math.floor(date.getTime() / 1000), nanoseconds: 0 } as any,
        updatedAt: { seconds: Math.floor(date.getTime() / 1000), nanoseconds: 0 } as any,
      } as ComplaintUpdate;
    });
  }

  addUpdate(complaintId: string, update: Omit<ComplaintUpdate, "id" | "createdAt" | "updatedAt">): void {
    const allUpdates = this.getStored("mock_updates", INITIAL_UPDATES);
    if (!allUpdates[complaintId]) allUpdates[complaintId] = [];
    const newUpdate = {
      ...update,
      id: `upd_${Date.now()}`,
    };
    allUpdates[complaintId]!.push(newUpdate);
    this.setStored("mock_updates", allUpdates);
  }

  updateComplaintStatus(id: string, status: ComplaintStatus, note?: string): boolean {
    const complaints = this.getComplaints();
    const idx = complaints.findIndex(c => c.id === id);
    if (idx === -1) return false;

    const c = complaints[idx]!;
    const fromStatus = c.status;
    c.status = status;
    this.saveComplaints(complaints);

    this.addUpdate(id, {
      complaintId: id,
      actorId: "uid_admin_001",
      actorName: "Ravi Kumar (Admin)",
      action: "status_changed",
      fromStatus,
      toStatus: status,
      assignedTo: null,
      note: note ?? `Status updated to ${status}.`,
      notifiedCitizen: true,
    });
    return true;
  }

  assignComplaint(id: string, volunteerId: string | null): boolean {
    const complaints = this.getComplaints();
    const idx = complaints.findIndex(c => c.id === id);
    if (idx === -1) return false;

    const c = complaints[idx]!;
    const fromStatus = c.status;
    const vol = mockVolunteers.find(v => v.id === volunteerId);

    c.assignedTo = volunteerId;
    if (volunteerId) {
      c.status = "assigned";
      c.assignedAt = { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } as any;
      c.assignedBy = "uid_admin_001";
    } else {
      c.status = "pending";
      c.assignedAt = null;
      c.assignedBy = null;
    }
    this.saveComplaints(complaints);

    this.addUpdate(id, {
      complaintId: id,
      actorId: "uid_admin_001",
      actorName: "Ravi Kumar (Admin)",
      action: volunteerId ? "assigned" : "unassigned",
      fromStatus,
      toStatus: c.status,
      assignedTo: volunteerId,
      note: volunteerId ? `Assigned to ${vol?.displayName ?? "Volunteer"}.` : "Unassigned volunteer.",
      notifiedCitizen: true,
    });
    return true;
  }
}

export const mockDb = new MockDb();
