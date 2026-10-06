export type UserRole = 'admin' | 'manager' | 'employee';
export type UserStatus = 'active' | 'inactive';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  department: string;
  status: UserStatus;
  createdAt: string;
  avatarUrl?: string;
}

export type JobPriority = 'low' | 'medium' | 'high' | 'critical';
export type JobStatus = 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';

export interface Job {
  id: string;
  title: string;
  description: string;
  assignedTo: string | null;
  assignedToName: string | null;
  createdBy: string;
  createdByName: string;
  priority: JobPriority;
  status: JobStatus;
  startTime: string; // ISO 8601 string
  endTime: string;   // ISO 8601 string
  createdAt: string; // ISO 8601 string
  updatedAt: string; // ISO 8601 string
  location?: string;
  notes?: string;
}

export type ActionType = 
  | 'job_created'
  | 'job_updated'
  | 'job_assigned'
  | 'job_rescheduled'
  | 'status_changed'
  | 'priority_changed'
  | 'job_deleted'
  | 'user_updated';

export interface ActivityLog {
  id: string;
  jobId: string | null;
  performedBy: string;
  performedByName: string;
  actionType: ActionType;
  details: string;
  timestamp: string; // ISO 8601
}

export interface AppNotification {
  id: string;
  recipientId: string;
  title: string;
  message: string;
  link: string;
  read: boolean;
  createdAt: string; // ISO 8601
}

export interface JobFilterParams {
  searchQuery?: string;
  status?: JobStatus | 'all';
  priority?: JobPriority | 'all';
  assignedTo?: string | 'all';
  startDate?: string;
  endDate?: string;
  sortBy?: 'startTime' | 'priority' | 'status' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface DashboardMetrics {
  totalJobs: number;
  scheduledJobs: number;
  inProgressJobs: number;
  completedJobs: number;
  overdueJobs: number;
  cancelledJobs: number;
  completionRate: number;
}
