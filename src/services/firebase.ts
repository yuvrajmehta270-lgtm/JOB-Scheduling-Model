/**
 * src/services/firebase.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Firebase app initialisation for JobFlow.
 *
 * All configuration values are read from Vite environment variables
 * (VITE_FIREBASE_*). These must be defined in a local `.env` file that is
 * NEVER committed to source control (see .env.example for the template).
 *
 * When the env vars are absent (e.g. in CI or before a Firebase project has
 * been created) the module still exports valid references — they will simply
 * produce "app not initialised" errors at call-time, which FirestoreContext
 * catches and falls back to mock data gracefully.
 */

import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// ─── Configuration ───────────────────────────────────────────────────────────

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

/**
 * Whether Firebase is properly configured in the current environment.
 * Used by AuthContext and FirestoreContext to decide whether to use Firebase
 * or fall back to mock data.
 */
export const isFirebaseConfigured: boolean =
  Boolean(firebaseConfig.apiKey) &&
  Boolean(firebaseConfig.projectId) &&
  firebaseConfig.apiKey !== 'your_api_key_here';

// ─── Initialisation ──────────────────────────────────────────────────────────

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (isFirebaseConfigured) {
  app  = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db   = getFirestore(app);
} else {
  // Provide typed stubs so the rest of the codebase can import without
  // conditional checks. Actual calls will be guarded in AuthContext /
  // FirestoreContext based on `isFirebaseConfigured`.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  app  = null as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  auth = null as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db   = null as any;

  if (import.meta.env.DEV) {
    console.info(
      '[JobFlow] Firebase is not configured. Running in mock-data mode.\n' +
      'Copy .env.example → .env and fill in your Firebase project values to enable full Firebase integration.'
    );
  }
}

export { app, auth, db };
