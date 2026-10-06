/**
 * src/context/AuthContext.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Firebase Authentication context for JobFlow.
 *
 * Wraps onAuthStateChanged so any component can access:
 *   - firebaseUser  — the raw Firebase User object (or null if not signed in)
 *   - userProfile   — the Firestore UserProfile document (contains role)
 *   - authLoading   — true while the initial auth state is being resolved
 *   - login()       — wraps signInWithEmailAndPassword
 *   - logout()      — wraps Firebase signOut
 *   - sendPasswordReset() — wraps sendPasswordResetEmail
 *
 * When Firebase is not configured (isFirebaseConfigured == false) the context
 * injects the mock admin user profile so the app continues to work in dev mode
 * without a Firebase project.
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
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  type User as FirebaseUser,
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../services/firebase';
import { getUserProfile } from '../services/firestoreService';
import type { UserProfile } from '../types';
import { SEED_USERS } from './mockData';

// ─── Context shape ────────────────────────────────────────────────────────────

export interface AuthContextValue {
  /** Raw Firebase User (null when unauthenticated or Firebase not configured) */
  firebaseUser: FirebaseUser | null;
  /** Full Firestore user profile including RBAC role */
  userProfile: UserProfile | null;
  /** True while initial auth state is being resolved */
  authLoading: boolean;
  /** Sign in with email + password. Throws a structured FirebaseError on failure. */
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  /** Sign out the current user */
  logout: () => Promise<void>;
  /** Dispatch a password reset email */
  sendPasswordReset: (email: string) => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // ── Mock mode (Firebase not configured) ─────────────────────────────────
  useEffect(() => {
    if (!isFirebaseConfigured) {
      // In mock mode, inject the seed admin user as the "logged-in" user.
      // The login page will simply navigate to /dashboard without Firebase.
      const mockAdmin = SEED_USERS.find((u) => u.role === 'admin') ?? SEED_USERS[0];
      setFirebaseUser(null);
      setUserProfile(mockAdmin);
      setAuthLoading(false);
      return;
    }

    // ── Real Firebase Auth listener ────────────────────────────────────────
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);

      if (fbUser) {
        try {
          const profile = await getUserProfile(fbUser.uid);
          if (profile) {
            setUserProfile(profile);
          } else {
            // Profile missing from Firestore — build minimal profile from auth data
            const fallback: UserProfile = {
              uid:         fbUser.uid,
              email:       fbUser.email ?? '',
              displayName: fbUser.displayName ?? fbUser.email ?? 'User',
              role:        'employee',
              department:  'General',
              status:      'active',
              createdAt:   new Date().toISOString(),
            };
            setUserProfile(fallback);
          }
        } catch (err) {
          console.error('[AuthContext] Failed to load user profile:', err);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }

      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ── login ────────────────────────────────────────────────────────────────

  const login = useCallback(async (
    email: string,
    password: string,
    rememberMe = true,
  ): Promise<void> => {
    if (!isFirebaseConfigured) {
      // Mock mode — just resolve (navigation handled by Login page)
      return;
    }

    // Set auth persistence based on "remember me" flag
    await setPersistence(
      auth,
      rememberMe ? browserLocalPersistence : browserSessionPersistence,
    );
    await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged handles the rest (profile fetch + state update)
  }, []);

  // ── logout ───────────────────────────────────────────────────────────────

  const logout = useCallback(async (): Promise<void> => {
    if (!isFirebaseConfigured) {
      // Mock mode — clear profile and reload
      setUserProfile(null);
      window.location.href = '/login';
      return;
    }
    await signOut(auth);
    setUserProfile(null);
  }, []);

  // ── password reset ───────────────────────────────────────────────────────

  const sendPasswordReset = useCallback(async (email: string): Promise<void> => {
    if (!isFirebaseConfigured) {
      throw new Error('Firebase is not configured. Password reset is unavailable in demo mode.');
    }
    await sendPasswordResetEmail(auth, email);
  }, []);

  const value: AuthContextValue = {
    firebaseUser,
    userProfile,
    authLoading,
    login,
    logout,
    sendPasswordReset,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
