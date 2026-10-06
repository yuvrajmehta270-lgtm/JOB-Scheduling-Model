/**
 * src/components/auth/ProtectedRoute.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Route-level authentication and role guard for JobFlow.
 *
 * Usage in App.tsx:
 *   <ProtectedRoute>                          — requires any authenticated user
 *   <ProtectedRoute roles={['admin']}>        — requires admin role
 *
 * Behaviour:
 *   - While auth is resolving (authLoading) → shows a full-screen spinner
 *   - If unauthenticated → redirects to /login (preserving the intended URL)
 *   - If authenticated but wrong role → shows a 403 access denied screen
 *   - If authenticated and role matches → renders children / <Outlet>
 */

import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';
import { Zap, ShieldOff } from 'lucide-react';

interface ProtectedRouteProps {
  /** If provided, the route is also guarded by role. Empty array = any auth. */
  roles?: UserRole[];
  /** Render children directly instead of using Outlet (for non-layout routes). */
  children?: React.ReactNode;
}

// ─── Full-screen loading spinner ────────────────────────────────────────────

const AuthLoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center">
    <div className="flex flex-col items-center space-y-4">
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 shadow-lg shadow-indigo-200 animate-pulse">
        <Zap className="w-7 h-7 fill-current text-white" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-700">Authenticating…</p>
        <p className="text-xs text-slate-400 mt-1">Verifying your session</p>
      </div>
    </div>
  </div>
);

// ─── Access Denied screen ────────────────────────────────────────────────────

const AccessDeniedScreen: React.FC = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
    <div className="max-w-sm text-center space-y-4">
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 mx-auto">
        <ShieldOff className="w-7 h-7 text-rose-500" />
      </div>
      <div>
        <h1 className="text-xl font-bold text-slate-900 font-display">Access Denied</h1>
        <p className="text-sm text-slate-500 mt-1">
          You don&apos;t have permission to view this page.
          Contact your administrator if you believe this is an error.
        </p>
      </div>
      <a
        href="/dashboard"
        className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors"
      >
        Return to Dashboard
      </a>
    </div>
  </div>
);

// ─── Guard component ─────────────────────────────────────────────────────────

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  roles = [],
  children,
}) => {
  const { userProfile, authLoading } = useAuth();
  const location = useLocation();

  // Still resolving auth state
  if (authLoading) {
    return <AuthLoadingScreen />;
  }

  // Not authenticated → redirect to /login, remembering where they wanted to go
  if (!userProfile) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check (skip if no roles specified)
  if (roles.length > 0 && !roles.includes(userProfile.role)) {
    return <AccessDeniedScreen />;
  }

  // Authenticated and authorized
  return children ? <>{children}</> : <Outlet />;
};
