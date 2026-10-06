/**
 * src/context/FirestoreContext.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Real-time Firestore synchronisation layer for JobFlow.
 *
 * This context:
 *   1. Subscribes to real-time `onSnapshot` listeners for jobs, users, and
 *      activities collections when Firebase is configured.
 *   2. Exposes Firestore-backed CRUD operations that write to Firestore AND
 *      log activity records.
 *   3. Falls back to mock data and in-memory operations when Firebase is not
 *      configured (isFirebaseConfigured == false).
 *
 * The component tree expects this to wrap AppProvider so that AppProvider
 * can consume the Firestore data through props.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp,
  orderBy,
  query,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../services/firebase';
import { useAuth } from './AuthContext';
import type { Job, UserProfile, ActivityLog } from '../types';
import type { JobFormData, UserFormData } from '../utils/validationSchemas';
import { checkScheduleConflict } from '../utils/conflictDetector';
import type { ConflictCheckResult } from '../utils/conflictDetector';
import { SEED_JOBS, SEED_USERS, SEED_ACTIVITY } from './mockData';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toISO(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === 'string') return value;
  return new Date().toISOString();
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function snapToJob(snap: QueryDocumentSnapshot<DocumentData>): Job {
  const d = snap.data();
  return {
    id:             snap.id,
    title:          d.title ?? '',
    description:    d.description ?? '',
    assignedTo:     d.assignedTo ?? null,
    assignedToName: d.assignedToName ?? null,
    createdBy:      d.createdBy ?? '',
    createdByName:  d.createdByName ?? '',
    priority:       d.priority ?? 'medium',
    status:         d.status ?? 'pending',
    startTime:      toISO(d.startTime),
    endTime:        toISO(d.endTime),
    createdAt:      toISO(d.createdAt),
    updatedAt:      toISO(d.updatedAt),
    location:       d.location ?? undefined,
    notes:          d.notes ?? undefined,
  };
}

function snapToUser(snap: QueryDocumentSnapshot<DocumentData>): UserProfile {
  const d = snap.data();
  return {
    uid:         snap.id,
    email:       d.email ?? '',
    displayName: d.displayName ?? '',
    role:        d.role ?? 'employee',
    department:  d.department ?? '',
    status:      d.status ?? 'active',
    createdAt:   toISO(d.createdAt),
    avatarUrl:   d.avatarUrl ?? undefined,
  };
}

function snapToActivity(snap: QueryDocumentSnapshot<DocumentData>): ActivityLog {
  const d = snap.data();
  return {
    id:              snap.id,
    jobId:           d.jobId ?? null,
    performedBy:     d.performedBy ?? '',
    performedByName: d.performedByName ?? '',
    actionType:      d.actionType ?? 'job_updated',
    details:         d.details ?? '',
    timestamp:       toISO(d.timestamp),
  };
}

// ─── Context Shape ────────────────────────────────────────────────────────────

export interface FirestoreContextValue {
  // Live data (from Firestore or mock)
  jobs: Job[];
  users: UserProfile[];
  activityLogs: ActivityLog[];
  firestoreLoading: boolean;

  // Job CRUD
  createJob: (data: JobFormData) => Promise<Job>;
  updateJob: (id: string, data: JobFormData) => Promise<Job>;
  updateJobStatus: (id: string, status: Job['status']) => Promise<void>;
  rescheduleJob: (id: string, newStart: string, newEnd: string) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  getJobById: (id: string) => Job | undefined;

  // User CRUD
  createUser: (data: UserFormData) => Promise<UserProfile>;
  updateUser: (uid: string, data: UserFormData) => Promise<UserProfile>;
  deleteUser: (uid: string) => Promise<void>;

  // Conflict checking
  checkConflict: (start: string, end: string, assigneeUid: string | null, ignoreJobId?: string) => ConflictCheckResult;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const FirestoreContext = createContext<FirestoreContextValue | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const FirestoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { userProfile } = useAuth();

  const [jobs, setJobs] = useState<Job[]>(isFirebaseConfigured ? [] : SEED_JOBS);
  const [users, setUsers] = useState<UserProfile[]>(isFirebaseConfigured ? [] : SEED_USERS);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(isFirebaseConfigured ? [] : SEED_ACTIVITY);
  const [firestoreLoading, setFirestoreLoading] = useState<boolean>(isFirebaseConfigured);

  // ── Real-time Firestore listeners ────────────────────────────────────────

  useEffect(() => {
    if (!isFirebaseConfigured) return; // Mock mode — skip listeners

    let jobsReady = false;
    let usersReady = false;
    let activitiesReady = false;

    const checkAllReady = () => {
      if (jobsReady && usersReady && activitiesReady) {
        setFirestoreLoading(false);
      }
    };

    const unsubJobs = onSnapshot(
      query(collection(db, 'jobs'), orderBy('startTime', 'desc')),
      (snap) => {
        setJobs(snap.docs.map(snapToJob));
        jobsReady = true;
        checkAllReady();
      },
      (err) => {
        console.error('[FirestoreContext] jobs listener error:', err);
        setJobs(SEED_JOBS); // Fallback
        jobsReady = true;
        checkAllReady();
      },
    );

    const unsubUsers = onSnapshot(
      collection(db, 'users'),
      (snap) => {
        setUsers(snap.docs.map(snapToUser));
        usersReady = true;
        checkAllReady();
      },
      (err) => {
        console.error('[FirestoreContext] users listener error:', err);
        setUsers(SEED_USERS); // Fallback
        usersReady = true;
        checkAllReady();
      },
    );

    const unsubActivities = onSnapshot(
      query(collection(db, 'activities'), orderBy('timestamp', 'desc')),
      (snap) => {
        setActivityLogs(snap.docs.map(snapToActivity));
        activitiesReady = true;
        checkAllReady();
      },
      (err) => {
        console.error('[FirestoreContext] activities listener error:', err);
        setActivityLogs(SEED_ACTIVITY); // Fallback
        activitiesReady = true;
        checkAllReady();
      },
    );

    return () => {
      unsubJobs();
      unsubUsers();
      unsubActivities();
    };
  }, []);

  // ── Activity log helper ──────────────────────────────────────────────────

  const logActivity = useCallback(
    async (data: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<void> => {
      if (!userProfile) return;

      if (isFirebaseConfigured) {
        await addDoc(collection(db, 'activities'), {
          ...data,
          timestamp: serverTimestamp(),
        });
        // onSnapshot listener will update activityLogs automatically
      } else {
        // Mock mode — update in-memory
        const newLog: ActivityLog = {
          ...data,
          id: generateId('act'),
          timestamp: new Date().toISOString(),
        };
        setActivityLogs((prev) => [newLog, ...prev].slice(0, 100));
      }
    },
    [userProfile],
  );

  // ── Job CRUD ─────────────────────────────────────────────────────────────

  const createJob = useCallback(
    async (data: JobFormData): Promise<Job> => {
      const actor = userProfile ?? { uid: 'unknown', displayName: 'Unknown User' };
      const assignedUser = data.assignedTo
        ? users.find((u) => u.uid === data.assignedTo) ?? null
        : null;

      const now = new Date().toISOString();
      const jobData: Omit<Job, 'id'> = {
        title:          data.title,
        description:    data.description,
        assignedTo:     data.assignedTo || null,
        assignedToName: assignedUser ? assignedUser.displayName : null,
        createdBy:      actor.uid,
        createdByName:  actor.displayName,
        priority:       data.priority,
        status:         data.status,
        startTime:      data.startTime,
        endTime:        data.endTime,
        location:       data.location || undefined,
        notes:          data.notes || undefined,
        createdAt:      now,
        updatedAt:      now,
      };

      let newJob: Job;

      if (isFirebaseConfigured) {
        const ref = await addDoc(collection(db, 'jobs'), {
          ...jobData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        newJob = { ...jobData, id: ref.id };
        // onSnapshot will sync jobs state automatically
      } else {
        newJob = { ...jobData, id: generateId('job') };
        setJobs((prev) => [newJob, ...prev]);
      }

      await logActivity({
        jobId:           newJob.id,
        performedBy:     actor.uid,
        performedByName: actor.displayName,
        actionType:      'job_created',
        details:         `created job "${newJob.title}"`,
      });

      return newJob;
    },
    [users, userProfile, logActivity],
  );

  const updateJob = useCallback(
    async (id: string, data: JobFormData): Promise<Job> => {
      const actor = userProfile ?? { uid: 'unknown', displayName: 'Unknown User' };
      const assignedUser = data.assignedTo
        ? users.find((u) => u.uid === data.assignedTo) ?? null
        : null;

      const updates: Partial<Job> = {
        title:          data.title,
        description:    data.description,
        assignedTo:     data.assignedTo || null,
        assignedToName: assignedUser ? assignedUser.displayName : null,
        priority:       data.priority,
        status:         data.status,
        startTime:      data.startTime,
        endTime:        data.endTime,
        location:       data.location || undefined,
        notes:          data.notes || undefined,
        updatedAt:      new Date().toISOString(),
      };

      let updated!: Job;

      if (isFirebaseConfigured) {
        await updateDoc(doc(db, 'jobs', id), {
          ...updates,
          updatedAt: serverTimestamp(),
        });
        // onSnapshot will update jobs; build return value optimistically
        const existing = jobs.find((j) => j.id === id);
        updated = { ...(existing ?? ({} as Job)), ...updates, id };
      } else {
        setJobs((prev) =>
          prev.map((j) => {
            if (j.id !== id) return j;
            updated = { ...j, ...updates };
            return updated;
          }),
        );
      }

      await logActivity({
        jobId:           id,
        performedBy:     actor.uid,
        performedByName: actor.displayName,
        actionType:      'job_updated',
        details:         `updated job "${data.title}"`,
      });

      return updated;
    },
    [users, userProfile, jobs, logActivity],
  );

  const updateJobStatus = useCallback(
    async (id: string, status: Job['status']): Promise<void> => {
      const actor = userProfile ?? { uid: 'unknown', displayName: 'Unknown User' };
      const job = jobs.find((j) => j.id === id);

      if (isFirebaseConfigured) {
        await updateDoc(doc(db, 'jobs', id), {
          status,
          updatedAt: serverTimestamp(),
        });
      } else {
        setJobs((prev) =>
          prev.map((j) =>
            j.id === id ? { ...j, status, updatedAt: new Date().toISOString() } : j,
          ),
        );
      }

      await logActivity({
        jobId:           id,
        performedBy:     actor.uid,
        performedByName: actor.displayName,
        actionType:      'status_changed',
        details:         `changed status of "${job?.title ?? id}" to ${status.replace('_', ' ')}`,
      });
    },
    [jobs, userProfile, logActivity],
  );

  const rescheduleJob = useCallback(
    async (id: string, newStart: string, newEnd: string): Promise<void> => {
      const actor = userProfile ?? { uid: 'unknown', displayName: 'Unknown User' };
      const job = jobs.find((j) => j.id === id);

      if (isFirebaseConfigured) {
        await updateDoc(doc(db, 'jobs', id), {
          startTime: newStart,
          endTime:   newEnd,
          updatedAt: serverTimestamp(),
        });
      } else {
        setJobs((prev) =>
          prev.map((j) =>
            j.id === id
              ? { ...j, startTime: newStart, endTime: newEnd, updatedAt: new Date().toISOString() }
              : j,
          ),
        );
      }

      await logActivity({
        jobId:           id,
        performedBy:     actor.uid,
        performedByName: actor.displayName,
        actionType:      'job_rescheduled',
        details:         `rescheduled "${job?.title ?? id}" to ${new Date(newStart).toLocaleString()}`,
      });
    },
    [jobs, userProfile, logActivity],
  );

  const deleteJob = useCallback(
    async (id: string): Promise<void> => {
      const actor = userProfile ?? { uid: 'unknown', displayName: 'Unknown User' };
      const job = jobs.find((j) => j.id === id);

      if (isFirebaseConfigured) {
        await deleteDoc(doc(db, 'jobs', id));
      } else {
        setJobs((prev) => prev.filter((j) => j.id !== id));
      }

      if (job) {
        await logActivity({
          jobId:           null,
          performedBy:     actor.uid,
          performedByName: actor.displayName,
          actionType:      'job_deleted',
          details:         `deleted job "${job.title}"`,
        });
      }
    },
    [jobs, userProfile, logActivity],
  );

  const getJobById = useCallback(
    (id: string) => jobs.find((j) => j.id === id),
    [jobs],
  );

  // ── User CRUD ────────────────────────────────────────────────────────────

  const createUser = useCallback(
    async (data: UserFormData): Promise<UserProfile> => {
      const actor = userProfile ?? { uid: 'unknown', displayName: 'Unknown User' };
      const now = new Date().toISOString();
      const newUser: UserProfile = {
        uid:         generateId('user'),
        email:       data.email,
        displayName: data.displayName,
        role:        data.role,
        department:  data.department,
        status:      data.status,
        createdAt:   now,
      };

      if (isFirebaseConfigured) {
        // Note: Firebase Auth account creation is an admin operation done in
        // User Management. Here we only create the Firestore profile document.
        // The UID used here is the local generated ID as a placeholder; in
        // production, the Firebase Admin SDK or Identity Platform would be used.
        await addDoc(collection(db, 'users'), {
          ...newUser,
          createdAt: serverTimestamp(),
        });
      } else {
        setUsers((prev) => [newUser, ...prev]);
      }

      await logActivity({
        jobId:           null,
        performedBy:     actor.uid,
        performedByName: actor.displayName,
        actionType:      'user_updated',
        details:         `provisioned new user "${newUser.displayName}" with role ${newUser.role}`,
      });

      return newUser;
    },
    [userProfile, logActivity],
  );

  const updateUser = useCallback(
    async (uid: string, data: UserFormData): Promise<UserProfile> => {
      const actor = userProfile ?? { uid: 'unknown', displayName: 'Unknown User' };
      const existing = users.find((u) => u.uid === uid);
      const updated: UserProfile = {
        ...(existing ?? ({} as UserProfile)),
        uid,
        email:       data.email,
        displayName: data.displayName,
        role:        data.role,
        department:  data.department,
        status:      data.status,
      };

      if (isFirebaseConfigured) {
        await updateDoc(doc(db, 'users', uid), {
          email:       data.email,
          displayName: data.displayName,
          role:        data.role,
          department:  data.department,
          status:      data.status,
        });
      } else {
        setUsers((prev) => prev.map((u) => (u.uid === uid ? updated : u)));
      }

      await logActivity({
        jobId:           null,
        performedBy:     actor.uid,
        performedByName: actor.displayName,
        actionType:      'user_updated',
        details:         `updated profile of "${data.displayName}"`,
      });

      return updated;
    },
    [users, userProfile, logActivity],
  );

  const deleteUser = useCallback(
    async (uid: string): Promise<void> => {
      const actor = userProfile ?? { uid: 'unknown', displayName: 'Unknown User' };
      const user = users.find((u) => u.uid === uid);

      if (isFirebaseConfigured) {
        await deleteDoc(doc(db, 'users', uid));
      } else {
        setUsers((prev) => prev.filter((u) => u.uid !== uid));
      }

      if (user) {
        await logActivity({
          jobId:           null,
          performedBy:     actor.uid,
          performedByName: actor.displayName,
          actionType:      'user_updated',
          details:         `deactivated user account "${user.displayName}"`,
        });
      }
    },
    [users, userProfile, logActivity],
  );

  // ── Conflict check ───────────────────────────────────────────────────────

  const checkConflict = useCallback(
    (start: string, end: string, assigneeUid: string | null, ignoreJobId?: string): ConflictCheckResult =>
      checkScheduleConflict(start, end, assigneeUid, jobs, ignoreJobId),
    [jobs],
  );

  // ── Value ────────────────────────────────────────────────────────────────

  const value: FirestoreContextValue = {
    jobs,
    users,
    activityLogs,
    firestoreLoading,
    createJob,
    updateJob,
    updateJobStatus,
    rescheduleJob,
    deleteJob,
    getJobById,
    createUser,
    updateUser,
    deleteUser,
    checkConflict,
  };

  return (
    <FirestoreContext.Provider value={value}>
      {children}
    </FirestoreContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useFirestore(): FirestoreContextValue {
  const ctx = useContext(FirestoreContext);
  if (!ctx) throw new Error('useFirestore must be used inside <FirestoreProvider>');
  return ctx;
}
