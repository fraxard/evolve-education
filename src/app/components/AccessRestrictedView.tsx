import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { APP_ROUTES } from '../../routes/paths';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';

interface AccessRestrictedViewProps {
  requiredRole: 'teacher' | 'student';
  title?: string;
  message?: string;
}

export const AccessRestrictedView: React.FC<AccessRestrictedViewProps> = ({
  requiredRole,
  title = 'Access Restricted',
  message,
}) => {
  const { user, signOut } = useAuth();

  const isRequiredTeacher = requiredRole === 'teacher';
  const defaultMessage = isRequiredTeacher
    ? 'This operational module is strictly reserved for authorized faculty members. Enrolled students do not have permission to access teacher batch management or grading interfaces.'
    : 'This operational module is strictly reserved for enrolled students. Faculty members manage courses through their assigned batch workspace.';

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 font-body">
      <div className="max-w-md w-full p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl text-center text-slate-100">
        <div className="w-12 h-12 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-400 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>

        <span className="inline-block px-2.5 py-0.5 rounded bg-rose-950/60 border border-rose-800/80 text-rose-300 font-mono text-[10px] uppercase tracking-wider mb-2">
          HTTP 403 — Role Boundary Enforced
        </span>

        <h2 className="text-lg font-display font-semibold text-white mb-2">
          {title}
        </h2>

        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          {message || defaultMessage}
        </p>

        <div className="p-3 mb-6 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center justify-between">
          <span className="text-slate-500">Your Account:</span>
          <span className="text-slate-200">{user?.email}</span>
          <span className="uppercase px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-800/60 font-semibold">
            {user?.role}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2 border-t border-slate-800">
          <Link
            to={APP_ROUTES.DASHBOARD}
            className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors inline-flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Dashboard</span>
          </Link>
          <button
            onClick={signOut}
            className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
