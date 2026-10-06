/**
 * src/context/AppContext.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Application-wide computed state context for JobFlow.
 *
 * PHASE 4 UPDATE:
 * AppContext is now a thin bridge over FirestoreContext. It no longer holds
 * its own job/user/activity state — that is owned by FirestoreContext (which
 * handles both real Firestore and mock-data fallback).
 *
 * AppContext adds:
 *   - Computed metrics (totalJobs, scheduledJobs, completionRate, etc.)
 *   - Derived lists (upcomingJobs, recentActivity, overdueJobIds)
 *   - The currentUser profile (from AuthContext)
 *
 * All CRUD actions (createJob, updateJob, etc.) are forwarded from
 * FirestoreContext so that existing page components require zero changes.
 *
 * BACKWARDS COMPATIBILITY:
 * The exported AppContextValue interface and useAppContext() hook are
 * preserved exactly, so every existing page and component continues to work
 * without modification.
 */

import React, { createContext, useContext, useMemo } from 'react';
import type { Job, UserProfile, ActivityLog, DashboardMetrics } from '../types';
import type { JobFormData, UserFormData } from '../utils/validationSchemas';
import type { ConflictCheckResult } from '../utils/conflictDetector';
import { useAuth } from './AuthContext';
import { useFirestore } from './FirestoreContext';
import { SEED_USERS } from './mockData';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AppContextValue {
  // State
  jobs: Job[];
  users: UserProfile[];
  activityLogs: ActivityLog[];
  currentUser: UserProfile;

  // Loading
  isLoading: boolean;

  // Computed
  metrics: DashboardMetrics;
  upcomingJobs: Job[];
  overdueJobIds: Set<string>;

  // Job actions (now async — still return Job for backwards compat)
  getJobById: (id: string) => Job | undefined;
  createJob: (data: JobFormData) => Promise<Job>;
  updateJob: (id: string, data: JobFormData) => Promise<Job>;
  updateJobStatus: (id: string, status: Job['status']) => Promise<void>;
  rescheduleJob: (id: string, newStart: string, newEnd: string) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;

  // User actions
  createUser: (data: UserFormData) => Promise<UserProfile>;
  updateUser: (uid: string, data: UserFormData) => Promise<UserProfile>;
  deleteUser: (uid: string) => Promise<void>;

  // Conflict checking
  checkConflict: (start: string, end: string, assigneeUid: string | null, ignoreJobId?: string) => ConflictCheckResult;

  // Activity
  recentActivity: ActivityLog[];
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AppContext = createContext<AppContextValue | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile } = useAuth();
  const firestore = useFirestore();

  // The current user comes from Firebase Auth; fall back to seed admin in mock mode
  const currentUser: UserProfile =
    userProfile ?? SEED_USERS.find((u) => u.role === 'admin') ?? SEED_USERS[0];

  // ── Overdue detection (pure computation, no mutation) ───────────────────
  const overdueJobIds = useMemo<Set<string>>(() => {
    const now = new Date();
    return new Set(
      firestore.jobs
        .filter((j) => {
          if (j.status === 'completed' || j.status === 'cancelled') return false;
          return new Date(j.endTime) < now;
        })
        .map((j) => j.id),
    );
  }, [firestore.jobs]);

  // Auto-mark overdue for metric counts (without mutating Firestore)
  const effectiveJobs = useMemo<Job[]>(() => {
    return firestore.jobs.map((j) =>
      overdueJobIds.has(j.id) && j.status !== 'overdue'
        ? { ...j, status: 'overdue' as Job['status'] }
        : j,
    );
  }, [firestore.jobs, overdueJobIds]);

  // ── Dashboard Metrics ────────────────────────────────────────────────────
  const metrics = useMemo<DashboardMetrics>(() => {
    const totals = effectiveJobs.reduce(
      (acc, job) => {
        acc.totalJobs += 1;
        if (job.status === 'scheduled')   acc.scheduledJobs += 1;
        if (job.status === 'in_progress') acc.inProgressJobs += 1;
        if (job.status === 'completed')   acc.completedJobs += 1;
        if (job.status === 'overdue')     acc.overdueJobs += 1;
        if (job.status === 'cancelled')   acc.cancelledJobs += 1;
        return acc;
      },
      {
        totalJobs: 0, scheduledJobs: 0, inProgressJobs: 0,
        completedJobs: 0, overdueJobs: 0, cancelledJobs: 0, completionRate: 0,
      },
    );
    const eligible = totals.totalJobs - totals.cancelledJobs;
    totals.completionRate = eligible > 0
      ? Math.round((totals.completedJobs / eligible) * 100)
      : 0;
    return totals;
  }, [effectiveJobs]);

  // ── Upcoming Jobs ────────────────────────────────────────────────────────
  const upcomingJobs = useMemo<Job[]>(() => {
    const now = new Date();
    return effectiveJobs
      .filter((j) => {
        const start = new Date(j.startTime);
        return (j.status === 'scheduled' || j.status === 'pending') && start >= now;
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 8);
  }, [effectiveJobs]);

  // ── Recent Activity ──────────────────────────────────────────────────────
  const recentActivity = useMemo<ActivityLog[]>(() => {
    return [...firestore.activityLogs]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20);
  }, [firestore.activityLogs]);

  // ── Assemble value ───────────────────────────────────────────────────────
  const value: AppContextValue = {
    // Data
    jobs:         effectiveJobs,
    users:        firestore.users,
    activityLogs: firestore.activityLogs,
    currentUser,
    isLoading:    firestore.firestoreLoading,

    // Computed
    metrics,
    upcomingJobs,
    overdueJobIds,
    recentActivity,

    // Job CRUD (forwarded from FirestoreContext)
    getJobById:      firestore.getJobById,
    createJob:       firestore.createJob,
    updateJob:       firestore.updateJob,
    updateJobStatus: firestore.updateJobStatus,
    rescheduleJob:   firestore.rescheduleJob,
    deleteJob:       firestore.deleteJob,

    // User CRUD (forwarded from FirestoreContext)
    createUser: firestore.createUser,
    updateUser: firestore.updateUser,
    deleteUser: firestore.deleteUser,

    // Conflict checking (forwarded from FirestoreContext, uses live jobs)
    checkConflict: firestore.checkConflict,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used inside <AppProvider>');
  return ctx;
}
