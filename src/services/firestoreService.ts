/**
 * src/services/firestoreService.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Pure Firestore CRUD helpers for JobFlow.
 *
 * Each function wraps the Firebase SDK and maps Firestore documents to/from
 * the application's TypeScript types. No React state is touched here — these
 * are plain async functions consumed by FirestoreContext.
 */

import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Job, UserProfile, ActivityLog, AppNotification } from '../types';

// ─── Firestore collection references ────────────────────────────────────────

export const COLLECTIONS = {
  USERS:         'users',
  JOBS:          'jobs',
  ACTIVITIES:    'activities',
  NOTIFICATIONS: 'notifications',
} as const;

// ─── Document converters ─────────────────────────────────────────────────────

/** Convert a Firestore Timestamp or ISO string → ISO string */
function toISO(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === 'string') return value;
  return new Date().toISOString();
}

function docToUserProfile(snap: QueryDocumentSnapshot<DocumentData>): UserProfile {
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

function docToJob(snap: QueryDocumentSnapshot<DocumentData>): Job {
  const d = snap.data();
  return {
    id:              snap.id,
    title:           d.title ?? '',
    description:     d.description ?? '',
    assignedTo:      d.assignedTo ?? null,
    assignedToName:  d.assignedToName ?? null,
    createdBy:       d.createdBy ?? '',
    createdByName:   d.createdByName ?? '',
    priority:        d.priority ?? 'medium',
    status:          d.status ?? 'pending',
    startTime:       toISO(d.startTime),
    endTime:         toISO(d.endTime),
    createdAt:       toISO(d.createdAt),
    updatedAt:       toISO(d.updatedAt),
    location:        d.location ?? undefined,
    notes:           d.notes ?? undefined,
  };
}

function docToActivity(snap: QueryDocumentSnapshot<DocumentData>): ActivityLog {
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

function docToNotification(snap: QueryDocumentSnapshot<DocumentData>): AppNotification {
  const d = snap.data();
  return {
    id:          snap.id,
    recipientId: d.recipientId ?? '',
    title:       d.title ?? '',
    message:     d.message ?? '',
    link:        d.link ?? '/',
    read:        d.read ?? false,
    createdAt:   toISO(d.createdAt),
  };
}

// ─── User Operations ─────────────────────────────────────────────────────────

/** Fetch all user profiles from Firestore. */
export async function fetchAllUsers(): Promise<UserProfile[]> {
  const snap = await getDocs(collection(db, COLLECTIONS.USERS));
  return snap.docs.map(docToUserProfile);
}

/** Create or overwrite a user profile document (document ID = Firebase Auth UID). */
export async function upsertUserProfile(uid: string, data: Omit<UserProfile, 'uid'>): Promise<void> {
  await setDoc(doc(db, COLLECTIONS.USERS, uid), {
    ...data,
    createdAt: data.createdAt ?? serverTimestamp(),
  }, { merge: true });
}

/** Update specific fields on a user profile. */
export async function updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.USERS, uid), data);
}

/** Get a single user profile by UID. */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.USERS, uid));
  if (!snap.exists()) return null;
  return docToUserProfile(snap as QueryDocumentSnapshot<DocumentData>);
}

// ─── Job Operations ──────────────────────────────────────────────────────────

/** Fetch all jobs ordered by startTime descending. */
export async function fetchAllJobs(): Promise<Job[]> {
  const q = query(
    collection(db, COLLECTIONS.JOBS),
    orderBy('startTime', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map(docToJob);
}

/** Create a new job document. Returns the new document ID. */
export async function createJobDoc(data: Omit<Job, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTIONS.JOBS), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/** Update an existing job document. */
export async function updateJobDoc(id: string, data: Partial<Job>): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.JOBS, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/** Delete a job document. */
export async function deleteJobDoc(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.JOBS, id));
}

// ─── Activity Log Operations ─────────────────────────────────────────────────

/** Fetch the most recent N activity log entries. */
export async function fetchRecentActivities(limitCount = 100): Promise<ActivityLog[]> {
  const q = query(
    collection(db, COLLECTIONS.ACTIVITIES),
    orderBy('timestamp', 'desc'),
    limit(limitCount),
  );
  const snap = await getDocs(q);
  return snap.docs.map(docToActivity);
}

/** Write a new activity log entry. */
export async function createActivityDoc(data: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTIONS.ACTIVITIES), {
    ...data,
    timestamp: serverTimestamp(),
  });
  return ref.id;
}

// ─── Notification Operations ─────────────────────────────────────────────────

/** Fetch notifications for a specific user. */
export async function fetchUserNotifications(recipientId: string): Promise<AppNotification[]> {
  const q = query(
    collection(db, COLLECTIONS.NOTIFICATIONS),
    orderBy('createdAt', 'desc'),
    limit(50),
  );
  const snap = await getDocs(q);
  return snap.docs
    .map(docToNotification)
    .filter((n) => n.recipientId === recipientId);
}

/** Create a new notification document. */
export async function createNotificationDoc(data: Omit<AppNotification, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), {
    ...data,
    read: false,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/** Mark a notification as read. */
export async function markNotificationRead(id: string): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.NOTIFICATIONS, id), { read: true });
}
