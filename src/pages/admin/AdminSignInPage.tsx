import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ADMIN_ROUTES, getPublicUrl } from '../../routes/paths';
import { Shield, AlertCircle, ArrowRight, Loader2, ShieldAlert, LogOut, ExternalLink } from 'lucide-react';

export const AdminSignInPage: React.FC = () => {
  const { user, signIn, signOut, isLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated as an admin, redirect immediately to dashboard
  useEffect(() => {
    if (!isLoading && user?.role === 'admin') {
      navigate(ADMIN_ROUTES.DASHBOARD, { replace: true });
    }
  }, [user, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const result = await signIn(email.trim(), password);
      if (!result.success || !result.user) {
        setError(result.error || 'Invalid credentials. Please verify your email and password.');
        setSubmitting(false);
        return;
      }

      // Strict role verification: only 'admin' role may access the Administrative Control Panel
      if (result.user.role !== 'admin') {
        await signOut();
        setError('Access denied. This portal is restricted to authorized institutional administrators only.');
        setSubmitting(false);
        return;
      }

      // Valid admin
      navigate(ADMIN_ROUTES.DASHBOARD, { replace: true });
    } catch {
      setError('A connection error occurred. Please try again.');
      setSubmitting(false);
    }
  };

  // 1. Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 text-slate-100 font-body">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mb-3" />
        <p className="font-mono text-xs text-slate-400">Verifying administrator session...</p>
      </div>
    );
  }

  // 2. If authenticated as an ADMIN, redirecting via useEffect; show brief transition state
  if (user?.role === 'admin') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 text-slate-100 font-body">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mb-3" />
        <p className="font-mono text-xs text-slate-400">Redirecting to administrator dashboard...</p>
      </div>
    );
  }

  // 3. If authenticated as NON-ADMIN (student or teacher): show Access Denied / Administrative Access Required
  if (user) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 text-slate-100 antialiased font-body">
        <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-xl p-6 sm:p-8 shadow-xl text-center">
          <div className="w-12 h-12 rounded-lg bg-rose-950 border border-rose-800 text-rose-400 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <span className="inline-block px-2.5 py-0.5 rounded bg-rose-950/60 border border-rose-800/80 text-rose-300 font-mono text-[11px] uppercase tracking-wider mb-2">
            Administrative Access Required
          </span>

          <h2 className="text-lg font-display font-semibold text-white mb-2">
            Access Restricted
          </h2>

          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            You are currently signed in as <span className="font-mono text-slate-200">{user.email}</span> with account role <span className="font-mono font-semibold uppercase text-amber-400">{user.role}</span>. This control panel is strictly restricted to authorized institutional administrators.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-700/80">
            <a
              href={getPublicUrl('/')}
              className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors inline-flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Return to Public Website</span>
            </a>
            <button
              type="button"
              onClick={signOut}
              className="w-full sm:w-auto px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-semibold transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out & Switch Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 text-slate-100 antialiased font-body selection:bg-slate-700">
      <div className="w-full max-w-sm">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 mb-3 text-emerald-400">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-display font-semibold tracking-tight text-white">
            Evolve Education
          </h1>
          <p className="text-xs font-mono tracking-wider uppercase text-slate-400 mt-1">
            Institutional Administration
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-800 border border-slate-700/80 rounded-xl p-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-700 text-xs">
            <span className="text-slate-400 font-medium">Control Panel Access</span>
            <span className="px-2 py-0.5 rounded bg-slate-700/60 text-slate-300 font-mono text-[10px]">
              SECURE SESSION
            </span>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-950/70 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Administrator Email
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="admin@evolve.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Password
                </label>
              </div>
              <input
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-2 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-slate-700 text-center">
            <span className="text-[11px] text-slate-500">
              Authorized personnel only. All access attempts are logged.
            </span>
          </div>
        </div>

        {/* External Return Link */}
        <div className="text-center mt-6">
          <a
            href={getPublicUrl('/')}
            className="text-xs text-slate-400 hover:text-slate-300 transition-colors inline-flex items-center gap-1"
          >
            <span>&larr; Return to Public Website</span>
          </a>
        </div>
      </div>
    </div>
  );
};
