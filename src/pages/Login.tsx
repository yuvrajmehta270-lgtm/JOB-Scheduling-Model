/**
 * src/pages/Login.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Login page for JobFlow — wired to Firebase Authentication in Phase 4.
 *
 * - Uses useAuth().login() which calls signInWithEmailAndPassword.
 * - Handles structured FirebaseError codes with user-friendly messages.
 * - Falls back to mock navigation when Firebase is not configured.
 * - After successful login, redirects to the originally intended URL (if any)
 *   or to /dashboard.
 */

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Zap, Mail, Lock, AlertCircle, ArrowRight,
  ShieldCheck, Calendar, Clock, CheckCircle2,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { isFirebaseConfigured } from '../services/firebase';

// ─── Firebase error code → human-readable message ───────────────────────────

function getAuthErrorMessage(code: string): string {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Invalid email or password. Please check your credentials and try again.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Contact your administrator.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please wait a few minutes and try again.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    default:
      return 'Sign in failed. Please try again.';
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, sendPasswordReset } = useAuth();

  const [email, setEmail] = useState('admin@jobflow.com');
  const [password, setPassword] = useState('Password123!');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Where to go after login — respect the ProtectedRoute "from" state
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password, rememberMe);
      // AuthContext.onAuthStateChanged will update userProfile,
      // ProtectedRoute will then allow through. Navigate to intended page.
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? '';
      setError(getAuthErrorMessage(code));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoSelect = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setError(null);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Enter your email address above first, then click Forgot Password.');
      return;
    }
    if (!isFirebaseConfigured) {
      alert('Password reset is not available in demo mode.');
      return;
    }
    try {
      await sendPasswordReset(email);
      alert(`Password reset email sent to ${email}. Check your inbox.`);
    } catch {
      setError('Failed to send password reset email. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col lg:flex-row">
      {/* Left Feature Showcase Panel */}
      <div className="lg:w-1/2 bg-gradient-to-br from-[#312E81] via-[#3730A3] to-[#1E1B4B] p-8 lg:p-16 flex flex-col justify-between relative overflow-hidden text-white border-r border-indigo-900/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand */}
        <div className="relative z-10">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-400 text-white shadow-lg shadow-indigo-950/60">
              <Zap className="w-6 h-6 fill-current text-white" />
            </div>
            <span className="text-2xl font-extrabold font-display tracking-tight text-white">
              Job<span className="text-cyan-400">Flow</span>
            </span>
          </div>
          <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-white/10 text-indigo-200 border border-white/10">
            Enterprise Field Dispatch
          </span>
        </div>

        {/* Hero Copy & Value Props */}
        <div className="my-12 relative z-10 max-w-lg space-y-6">
          <h1 className="text-3xl lg:text-4xl font-extrabold font-display tracking-tight leading-tight text-white">
            Smart Job Scheduling & Workforce Dispatch Platform
          </h1>
          <p className="text-sm text-indigo-200/90 leading-relaxed font-sans">
            Engineered for high-velocity dispatchers and operations managers. Instant schedule conflict detection, live timeline drag-and-drop, and strict role-based access control.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center space-x-3 bg-white/5 border border-white/10 p-3 rounded-xl backdrop-blur-xs">
              <Clock className="w-5 h-5 text-cyan-400 shrink-0" />
              <span className="text-xs font-semibold text-slate-100">Live Overlap & Schedule Conflict Prevention</span>
            </div>
            <div className="flex items-center space-x-3 bg-white/5 border border-white/10 p-3 rounded-xl backdrop-blur-xs">
              <Calendar className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="text-xs font-semibold text-slate-100">Interactive FullCalendar Shift Coordination</span>
            </div>
            <div className="flex items-center space-x-3 bg-white/5 border border-white/10 p-3 rounded-xl backdrop-blur-xs">
              <ShieldCheck className="w-5 h-5 text-indigo-300 shrink-0" />
              <span className="text-xs font-semibold text-slate-100">Granular RBAC for Admins, Managers & Field Staff</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-4 border-t border-white/10 text-xs text-indigo-300/70">
          {isFirebaseConfigured
            ? 'Firebase Auth • Cloud Firestore • Real-Time Sync'
            : 'Demo Mode • Mock Data • Full CRUD • Zero Server Latency'}
        </div>
      </div>

      {/* Right Sign-in Form Panel */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-level-3 border border-slate-200/90 p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-extrabold font-display text-slate-900 tracking-tight">
              Sign in to JobFlow
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {isFirebaseConfigured
                ? 'Enter your credentials to access the workspace'
                : 'Select a demo role below or enter credentials to continue'}
            </p>
          </div>

          {/* Demo Account Quick-Fill Pill Buttons */}
          <div className="space-y-2 pt-1">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Quick Demo Access:</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Admin',    email: 'admin@jobflow.com' },
                { label: 'Manager', email: 's.jenkins@jobflow.com' },
                { label: 'Employee', email: 'm.chen@jobflow.com' },
              ].map(({ label, email: demoEmail }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => handleDemoSelect(demoEmail)}
                  className={`px-2.5 py-2 text-xs font-semibold rounded-xl border transition-all text-center ${
                    email === demoEmail
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <form className="space-y-4 pt-2" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center space-x-2 text-rose-700 text-xs font-medium animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <Input
              label="Email Address"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
              required
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span className="text-slate-600 font-medium">Keep me signed in</span>
              </label>

              <button
                type="button"
                onClick={handleForgotPassword}
                className="font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full py-3 shadow-level-1 mt-2 text-sm"
              isLoading={isLoading}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Workspace
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center">
            <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {isFirebaseConfigured
                  ? 'Firebase Auth • Firestore Sync • RBAC Secured'
                  : 'Full CRUD • Mock Data Seeded • Zero Server Latency'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
