/**
 * src/components/layout/AppLayout.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Main application layout shell (Sidebar + Header + main content outlet).
 *
 * PHASE 4 UPDATE:
 * - onLogout now calls useAuth().logout() (Firebase signOut) directly.
 * - notifications are read from AppContext (will be Firestore-backed in future).
 * - Props simplified: no longer receives notifications or onLogout from App.tsx.
 */

import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export const AppLayout: React.FC = () => {
  const { currentUser } = useAppContext();
  const { logout } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = (path: string): string => {
    if (path.startsWith('/jobs/')) return 'Job Details';
    switch (path) {
      case '/dashboard':  return 'Dashboard';
      case '/jobs':       return 'Job Management';
      case '/calendar':   return 'Schedule Calendar';
      case '/users':      return 'User Directory & RBAC';
      case '/reports':    return 'Reports & Analytics';
      case '/settings':   return 'System Settings';
      default:            return 'JobFlow SaaS';
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('[AppLayout] Logout failed:', err);
      // Force redirect even if Firebase logout throws
      window.location.href = '/login';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar
        userRole={currentUser.role}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        <Header
          currentUser={currentUser}
          notifications={[]}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onLogout={handleLogout}
          pageTitle={getPageTitle(location.pathname)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
