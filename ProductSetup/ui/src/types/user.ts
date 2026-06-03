export type UserRole = "admin" | "business_manager" | "business_user";

export interface AppUser {
  uid: string;
  email: string;
  role: UserRole;
  createdAt: string;
  createdBy?: string;
}

export interface ActivityLog {
  id?: string;
  userId: string;
  userEmail: string;
  action: string;
  details?: string;
  page?: string;
  timestamp: string;
}