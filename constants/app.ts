export const APP_NAME = "Constituency Connect";
export const APP_DESCRIPTION = "WhatsApp-based Public Grievance Management Platform";

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

export const STORAGE_PATHS = {
  COMPLAINT_PHOTOS: (complaintId: string) => `complaints/${complaintId}/photos`,
  PROFILE_PHOTOS: (uid: string) => `users/${uid}/avatar`,
} as const;

export const COMPLAINT_CATEGORIES: Record<string, string> = {
  road: "Road & Infrastructure",
  water: "Water Supply",
  electricity: "Electricity",
  sanitation: "Sanitation & Waste",
  drainage: "Drainage",
  streetlight: "Street Lighting",
  other: "Other",
};

export const COMPLAINT_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  assigned: "Assigned",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};
