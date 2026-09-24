import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { APP_ROUTES, getAdminUrl, getPublicUrl } from '../../routes/paths';
import { TeacherLayout } from './TeacherLayout';
import { StudentLayout } from './StudentLayout';
import { Loader2, Shield, LogOut, ExternalLink, ArrowRight } from 'lucide-react';

export const AppShell: React.FC = () => {
  const { user, isLoading, signOut } = useAuth();
  const location = useLocation();

  // 1. Loading Session State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 text-slate-100 font-body">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mb-3" />
        <p className="font-mono text-xs text-slate-400">Loading operational session...</p>
      </div>
    );
  }

  // 2. Unauthenticated State: Redirect to App Sign-In
  if (!user) {
    return <Navigate to={APP_ROUTES.SIGN_IN} state={{ from: location }} replace />;
  }

  // 3. Admin Account Boundary Handling: Dispatch to Admin Portal
  if (user.role === 'admin') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 text-slate-100 antialiased font-body selection:bg-slate-700">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl text-center">
          <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6" />
          </div>

          <span className="inline-block px-2.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[11px] uppercase tracking-wider mb-2">
            Administrator Session Active
          </span>

          <h2 className="text-lg font-display font-semibold text-white mb-2">
            Institutional Admin Dispatch
          </h2>

          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            You are signed in as <span className="font-mono text-slate-200">{user.email}</span> with administrative governance privileges. The Operational App (<span className="font-mono text-emerald-400">app.localhost</span>) is reserved for faculty and student workspaces.
          </p>

          <div className="space-y-2 pt-2 border-t border-slate-800">
            <a
              href={getAdminUrl('/dashboard')}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-colors inline-flex items-center justify-center gap-2"
            >
              <span>Go to Admin Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={signOut}
                className="px-3.5 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
              <span className="text-slate-700">|</span>
              <a
                href={getPublicUrl('/')}
                className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 rounded-lg transition-colors inline-flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Public Website</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4. Role Dispatch: Teacher Shell
  if (user.role === 'teacher') {
    return <TeacherLayout />;
  }

  // 5. Role Dispatch: Student Shell
  if (user.role === 'student') {
    return <StudentLayout />;
  }

  // 6. Fallback Unrecognized Role
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 text-slate-200 font-body">
      <p className="text-sm font-medium mb-3">Unrecognized operational account role.</p>
      <button
        onClick={signOut}
        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs rounded-lg font-mono"
      >
        Sign Out
      </button>
    </div>
  );
};
