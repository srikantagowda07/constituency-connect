export type UserRole = "citizen" | "volunteer" | "mla" | "admin";

export interface UserProfile {
  uid: string;
  phone: string;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  constituency: string | null;
  ward: string | null;
  createdAt: string; // ISO-8601
  updatedAt: string; // ISO-8601
}
