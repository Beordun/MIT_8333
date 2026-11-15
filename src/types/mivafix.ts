export type RoleName = "STUDENT_STAFF" | "MAINTENANCE_OFFICER" | "ADMIN";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type RequestStatus = "PENDING" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export interface CategoryItem {
  id: string;
  name: string;
  description: string;
  slaHours: number;
}

export interface RequestItem {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  location: string;
  priority: Priority;
  status: RequestStatus;
  evidenceUrl: string | null;
  createdAt: string;
  category: { id: string; name: string; slaHours: number };
  requester: { id: string; fullName: string; email: string; department: string };
  assignments: Array<{
    id: string;
    notes: string | null;
    assignedAt: string;
    officer: { id: string; fullName: string; email: string };
  }>;
}

export interface StatusUpdateItem {
  id: string;
  oldStatus: RequestStatus | null;
  newStatus: RequestStatus;
  comment: string;
  createdAt: string;
  updatedBy: {
    id: string;
    fullName: string;
    role: { name: RoleName };
  };
}

export interface RequestDetail extends RequestItem {
  statusUpdates: StatusUpdateItem[];
}

export interface UserItem {
  id: string;
  fullName: string;
  email: string;
  department: string;
  role: RoleName;
  createdAt?: string;
}

