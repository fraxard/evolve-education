import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES, ADMIN_ROUTES, isAdminHostname, getPublicUrl } from '../../routes/paths';
import { ShieldAlert, LogOut, ExternalLink, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'teacher' | 'student')[];
  requireActive?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requireActive = true,
}) => {
  const { user, isLoading, signOut } = useAuth();
  const location = useLocation();
  const isAdmin = isAdminHostname();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-slate-300">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mb-3" />
        <p className="font-mono text-xs">Authenticating operator session...</p>
      </div>
    );
  }

  // Not logged in:
  if (!user) {
    const signInPath = isAdmin ? ADMIN_ROUTES.SIGN_IN : ROUTES.AUTH.SIGN_IN;
    return <Navigate to={signInPath} state={{ from: location }} replace />;
  }

  // Role validation failure:
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const isStudentPortal = allowedRoles.length === 1 && allowedRoles[0] === 'student';
    const isTeacherPortal = allowedRoles.length === 1 && allowedRoles[0] === 'teacher';
    const title = isStudentPortal
      ? 'Student Access Restricted'
      : isTeacherPortal
      ? 'Teacher Access Restricted'
      : 'Administrative Access Restricted';

    const areaDescription = isStudentPortal
      ? 'The requested portal is restricted to active enrolled students.'
      : isTeacherPortal
      ? 'The requested portal is restricted to active faculty members.'
      : 'The requested control panel is restricted to authorized administrators.';

    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900 text-slate-100 font-body">
        <div className="max-w-md w-full p-6 bg-slate-800 border border-slate-700 rounded-xl shadow-xl text-center">
          <div className="w-10 h-10 rounded-lg bg-rose-950 border border-rose-800 text-rose-400 flex items-center justify-center mx-auto mb-3">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h2 className="text-base font-semibold text-white mb-1">{title}</h2>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            {areaDescription} Your authenticated account (<span className="font-mono text-slate-200">{user.email}</span>) holds role <span className="font-mono font-semibold uppercase text-amber-400">{user.role}</span>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2 border-t border-slate-700/80">
            <button
              onClick={async () => {
                await signOut();
                window.location.href = isAdmin ? ADMIN_ROUTES.SIGN_IN : ROUTES.AUTH.SIGN_IN;
              }}
              className="w-full sm:w-auto px-3.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
            <a
              href={getPublicUrl('/')}
              className="w-full sm:w-auto px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Return to Public Site</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Account status check:
  if (requireActive && user.account_status !== 'active') {
    const signInPath = isAdmin ? ADMIN_ROUTES.SIGN_IN : ROUTES.AUTH.SIGN_IN;
    return <Navigate to={signInPath} replace />;
  }

  return <>{children}</>;
};
