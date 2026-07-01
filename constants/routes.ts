export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  DASHBOARD_COMPLAINTS: "/dashboard/complaints",
  DASHBOARD_ANALYTICS: "/dashboard/analytics",
  DASHBOARD_VOLUNTEERS: "/dashboard/volunteers",
  DASHBOARD_SETTINGS: "/dashboard/settings",
  COMPLAINT_DETAIL: (id: string) => `/dashboard/complaints/${id}`,
  PROFILE: "/profile",
} as const;
