/**
 * src/App.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Root application component for JobFlow.
 *
 * Provider hierarchy (outer → inner):
 *   BrowserRouter
 *     AuthProvider        ← Firebase Auth state
 *       FirestoreProvider ← Real-time Firestore (or mock-data fallback)
 *         AppProvider     ← Computed metrics & convenience CRUD bridge
 *           ToastProvider ← Toast notification system
 *             Routes...
 *
 * Protected routes are wrapped with <ProtectedRoute> which handles:
 *   - Auth loading spinner
 *   - Redirect to /login when unauthenticated
 *   - Role-gated access (403 screen) when role doesn't match
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FirestoreProvider } from './context/FirestoreContext';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './components/ui/Toast';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Jobs } from './pages/Jobs';
import { JobDetailsPage } from './pages/JobDetailsPage';
import { Calendar } from './pages/Calendar';
import { Users } from './pages/Users';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { NotFound } from './pages/NotFound';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FirestoreProvider>
          <AppProvider>
            <ToastProvider>
              <AppRoutes />
            </ToastProvider>
          </AppProvider>
        </FirestoreProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

// ─── Routes ───────────────────────────────────────────────────────────────────

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public: login page */}
      <Route path="/login" element={<Login />} />

      {/* Protected: all authenticated users */}
      <Route element={<ProtectedRoute />}>
        <Route
          path="/"
          element={<AppLayout />}
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="jobs/:jobId" element={<JobDetailsPage />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="settings" element={<Settings />} />

          {/* Manager + Admin only */}
          <Route element={<ProtectedRoute roles={['admin', 'manager']} />}>
            <Route path="reports" element={<Reports />} />
          </Route>

          {/* Admin only */}
          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route path="users" element={<Users />} />
          </Route>
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
