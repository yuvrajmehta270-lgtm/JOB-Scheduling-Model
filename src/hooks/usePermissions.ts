/**
 * src/hooks/usePermissions.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Role-based permission utility hook for JobFlow.
 *
 * Usage:
 *   const { canCreateJob, canDeleteJob, canManageUsers } = usePermissions();
 *
 * All permission checks are derived from the authenticated user's role in
 * AuthContext. No prop-drilling required.
 */

import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';

export interface Permissions {
  role: UserRole | null;

  // Job permissions
  canCreateJob: boolean;       // admin, manager
  canEditJob: boolean;         // admin, manager
  canDeleteJob: boolean;       // admin only
  canChangeJobStatus: boolean; // all authenticated (employees: own assigned only)
  canRescheduleJob: boolean;   // admin, manager
  canViewAllJobs: boolean;     // admin, manager; employees see own only

  // User management permissions
  canManageUsers: boolean;     // admin only
  canViewUsers: boolean;       // admin only

  // Report permissions
  canViewReports: boolean;     // admin, manager

  // Settings permissions
  canEditSystemSettings: boolean; // admin only

  // Helper method
  hasRole: (...roles: UserRole[]) => boolean;
}

export function usePermissions(): Permissions {
  const { userProfile } = useAuth();
  const role = userProfile?.role ?? null;

  const hasRole = (...roles: UserRole[]): boolean => {
    if (!role) return false;
    return roles.includes(role);
  };

  return {
    role,
    canCreateJob:          hasRole('admin', 'manager'),
    canEditJob:            hasRole('admin', 'manager'),
    canDeleteJob:          hasRole('admin'),
    canChangeJobStatus:    hasRole('admin', 'manager', 'employee'),
    canRescheduleJob:      hasRole('admin', 'manager'),
    canViewAllJobs:        hasRole('admin', 'manager'),
    canManageUsers:        hasRole('admin'),
    canViewUsers:          hasRole('admin'),
    canViewReports:        hasRole('admin', 'manager'),
    canEditSystemSettings: hasRole('admin'),
    hasRole,
  };
}
