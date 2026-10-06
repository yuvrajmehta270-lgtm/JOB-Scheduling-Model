/**
 * src/services/seedFirestore.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * One-time Firestore seeding utility for JobFlow.
 *
 * This script uploads the mock seed data (SEED_USERS, SEED_JOBS,
 * SEED_ACTIVITY) to your configured Firestore database.
 *
 * HOW TO USE:
 * 1. Ensure your .env file has valid Firebase credentials.
 * 2. Ensure Firebase Auth has user accounts created matching the seed emails
 *    (or use Firebase Console to create them with password: Password123!)
 * 3. Run from the browser console or a one-off script:
 *
 *    import { seedFirestore } from './src/services/seedFirestore';
 *    seedFirestore().then(() => console.log('Done!'));
 *
 * This is idempotent: it uses setDoc with merge, so re-running will not
 * create duplicates for users (keyed by uid) but WILL add new job/activity
 * documents on each run (since they use addDoc with new IDs).
 *
 * IMPORTANT: Only run this once per environment. Comment out or delete after
 * initial seeding to avoid data duplication.
 */

import {
  collection,
  doc,
  setDoc,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { SEED_USERS, SEED_JOBS, SEED_ACTIVITY } from '../context/mockData';

export async function seedFirestore(): Promise<void> {
  if (!isFirebaseConfigured) {
    console.warn('[seedFirestore] Firebase is not configured. Skipping seed.');
    return;
  }

  console.log('[seedFirestore] Starting Firestore seed...');

  // ── Seed Users ────────────────────────────────────────────────────────────
  console.log('[seedFirestore] Seeding users...');
  for (const user of SEED_USERS) {
    const { uid, ...rest } = user;
    await setDoc(
      doc(db, 'users', uid),
      { ...rest, createdAt: serverTimestamp() },
      { merge: true },
    );
    console.log(`  ✓ User: ${user.displayName} (${user.role})`);
  }

  // ── Seed Jobs ─────────────────────────────────────────────────────────────
  console.log('[seedFirestore] Seeding jobs...');
  for (const job of SEED_JOBS) {
    const { id: _id, ...rest } = job;
    await addDoc(collection(db, 'jobs'), {
      ...rest,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log(`  ✓ Job: ${job.title}`);
  }

  // ── Seed Activity Logs ────────────────────────────────────────────────────
  console.log('[seedFirestore] Seeding activity logs...');
  for (const activity of SEED_ACTIVITY) {
    const { id: _id, ...rest } = activity;
    await addDoc(collection(db, 'activities'), {
      ...rest,
      timestamp: serverTimestamp(),
    });
    console.log(`  ✓ Activity: ${activity.details.slice(0, 50)}`);
  }

  console.log('[seedFirestore] ✅ Seed complete!');
  console.log('');
  console.log('Next steps:');
  console.log('  1. Go to Firebase Console → Authentication → Users');
  console.log('  2. Create accounts for each seed user with password: Password123!');
  console.log('  3. Ensure the Auth UID matches the uid in the users collection');
  console.log('  4. Remove or comment out the seedFirestore() call after use');
}
