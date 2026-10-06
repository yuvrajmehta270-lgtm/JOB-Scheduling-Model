/**
 * src/components/auth/RoleGuard.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Element-level RBAC guard for JobFlow.
 *
 * Conditionally renders its children based on the authenticated user's role.
 * Use this to show/hide individual UI elements (buttons, columns, sections)
 * without redirecting the user.
 *
 * Usage:
 *   <RoleGuard roles={['admin', 'manager']}>
 *     <Button>Create Job</Button>
 *   </RoleGuard>
 *
 *   <RoleGuard roles={['admin']} fallback={<p>Admin only</p>}>
 *     <DeleteButton />
 *   </RoleGuard>
 */

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';

interface RoleGuardProps {
  /** Roles allowed to see the children. */
  roles: UserRole[];
  /** Optional content to show when the user does NOT have the required role. */
  fallback?: React.ReactNode;
  /** Content to render when authorized. */
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  roles,
  fallback = null,
  children,
}) => {
  const { userProfile } = useAuth();

  if (!userProfile) return <>{fallback}</>;
  if (!roles.includes(userProfile.role)) return <>{fallback}</>;

  return <>{children}</>;
};
