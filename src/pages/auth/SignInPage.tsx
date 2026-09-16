import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES, getAdminUrl } from '../../routes/paths';
import { siteContent } from '../../data/content';
import { ArrowRight, Lock, Mail, AlertCircle, Clock, XCircle, LogOut } from 'lucide-react';

export const SignInPage: React.FC = () => {
  const { user, signIn, signOut, isLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Role-based redirect if already authenticated
  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === 'admin') {
        // Cross-domain SSO ticket handoff: ensures admin subdomain receives authenticated session cookie
        (async () => {
          try {
            const ticketRes = await fetch('/api/auth/sso-ticket', {
              method: 'POST',
              credentials: 'include',
            });
            if (ticketRes.ok) {
              const { ticket } = await ticketRes.json();
              window.location.href = getAdminUrl(`/api/auth/claim-ticket?ticket=${ticket}&redirect=/dashboard`);
              return;
            }
          } catch {
            // Fallback to direct redirect
          }
          window.location.href = getAdminUrl('/dashboard');
        })();
      } else if (user.role === 'student' && user.account_status === 'active') {
        navigate(ROUTES.PORTAL.STUDENT, { replace: true });
      } else if (user.role === 'teacher' && user.account_status === 'active') {
        navigate(ROUTES.PORTAL.TEACHER, { replace: true });
      }
    }
  }, [user, isLoading, navigate]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-cream text-brand-dark-muted font-body">
        <img src={siteContent.brand.logoSrc} alt={siteContent.brand.logoAlt} className="h-10 mb-4 animate-pulse" />
        <p className="text-xs">Checking authorization status...</p>
      </div>
    );
  }

  // Admin already logged in: brief transition display while redirecting cross-host
  if (user && user.role === 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-cream text-brand-dark font-body p-4">
        <div className="text-center p-8 bg-white rounded-3xl border border-brand-border shadow-card max-w-md w-full">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="font-display font-bold text-xl text-brand-blue mb-2">Administrator Session Active</h2>
          <p className="text-sm text-brand-dark-muted mb-4">
            Forwarding your session to the Institutional Administrative Control Panel...
          </p>
          <a
            href={getAdminUrl('/dashboard')}
            className="text-xs text-brand-leaf font-bold hover:underline"
          >
            Click here if you are not redirected automatically
          </a>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await signIn(email, password);
      if (!res.success) {
        setError(res.error || 'Invalid credentials.');
        return;
      }

      const loggedInUser = res.user!;
      if (loggedInUser.role === 'admin') {
        try {
          const ticketRes = await fetch('/api/auth/sso-ticket', {
            method: 'POST',
            credentials: 'include',
          });
          if (ticketRes.ok) {
            const { ticket } = await ticketRes.json();
            window.location.href = getAdminUrl(`/api/auth/claim-ticket?ticket=${ticket}&redirect=/dashboard`);
            return;
          }
        } catch {
          // Fallback to direct redirect
        }
        window.location.href = getAdminUrl('/dashboard');
        return;
      } else if (loggedInUser.role === 'student' && loggedInUser.account_status === 'active') {
        navigate(ROUTES.PORTAL.STUDENT, { replace: true });
      } else if (loggedInUser.role === 'teacher' && loggedInUser.account_status === 'active') {
        navigate(ROUTES.PORTAL.TEACHER, { replace: true });
      }
      // If status is pending or rejected, component will re-render status screen below
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If user is currently signed in but pending review
  if (!isLoading && user && user.account_status === 'pending') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-brand-cream text-brand-dark">
        <div className="w-full max-w-lg p-8 sm:p-10 bg-white rounded-3xl border border-brand-border shadow-card text-center">
          <Link to={ROUTES.HOME} className="inline-block mb-6">
            <img src={siteContent.brand.logoSrc} alt={siteContent.brand.logoAlt} className="h-12 mx-auto object-contain" />
          </Link>

          <div className="w-16 h-16 rounded-full bg-brand-yellow/20 text-brand-orange flex items-center justify-center mx-auto mb-5">
            <Clock className="w-8 h-8" />
          </div>

          <span className="inline-block px-3 py-1 rounded-full bg-brand-soft-yellow/50 border border-brand-yellow/40 text-brand-dark font-accent text-xs font-bold uppercase tracking-wider mb-3">
            Application Under Review
          </span>

          <h1 className="font-display font-bold text-2xl sm:text-3xl text-brand-blue mb-3">
            Welcome, {user.fullName || user.email}
          </h1>

          <p className="font-body text-sm sm:text-base text-brand-dark-muted leading-relaxed mb-6">
            Your student admission application has been received and is currently under review by our administrative team. 
            Once approved and assigned to your curriculum batch, your portal access will be automatically activated.
          </p>

          <div className="p-4 rounded-2xl bg-brand-cream-alt/70 border border-brand-border/80 text-left text-xs text-brand-dark-muted mb-6 space-y-1.5 font-body">
            <p><span className="font-semibold text-brand-dark">Account Email:</span> {user.email}</p>
            <p><span className="font-semibold text-brand-dark">Application Status:</span> Pending Administrative Review</p>
            <p><span className="font-semibold text-brand-dark">Next Step:</span> Batch & Teacher Assignment</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
            <Link
              to={ROUTES.HOME}
              className="w-full sm:w-auto px-6 py-2.5 rounded-full border border-brand-border text-brand-blue font-display font-bold text-sm hover:bg-brand-cream transition-colors"
            >
              Return to Website
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-brand-cream text-brand-dark-muted font-display font-bold text-sm hover:bg-brand-border/60 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If user is currently signed in but application was rejected
  if (!isLoading && user && user.account_status === 'rejected') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-brand-cream text-brand-dark">
        <div className="w-full max-w-lg p-8 sm:p-10 bg-white rounded-3xl border border-brand-border shadow-card text-center">
          <Link to={ROUTES.HOME} className="inline-block mb-6">
            <img src={siteContent.brand.logoSrc} alt={siteContent.brand.logoAlt} className="h-12 mx-auto object-contain" />
          </Link>

          <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-5">
            <XCircle className="w-8 h-8" />
          </div>

          <h1 className="font-display font-bold text-2xl sm:text-3xl text-brand-blue mb-3">
            Application Status
          </h1>

          <p className="font-body text-sm sm:text-base text-brand-dark-muted leading-relaxed mb-6">
            Thank you for your interest in Evolve Education. Following administrative review, we regret to inform you that your application could not be approved at this time.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
            <Link
              to={ROUTES.HOME}
              className="w-full sm:w-auto px-6 py-2.5 rounded-full border border-brand-border text-brand-blue font-display font-bold text-sm hover:bg-brand-cream transition-colors"
            >
              Return to Website
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-brand-cream text-brand-dark-muted font-display font-bold text-sm hover:bg-brand-border/60 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If user is currently signed in but account is inactive/suspended
  if (!isLoading && user && user.account_status === 'inactive') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-brand-cream text-brand-dark">
        <div className="w-full max-w-lg p-8 sm:p-10 bg-white rounded-3xl border border-brand-border shadow-card text-center">
          <Link to={ROUTES.HOME} className="inline-block mb-6">
            <img src={siteContent.brand.logoSrc} alt={siteContent.brand.logoAlt} className="h-12 mx-auto object-contain" />
          </Link>

          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mx-auto mb-5">
            <Lock className="w-8 h-8" />
          </div>

          <h1 className="font-display font-bold text-2xl sm:text-3xl text-brand-blue mb-3">
            Account Inactive
          </h1>

          <p className="font-body text-sm sm:text-base text-brand-dark-muted leading-relaxed mb-6">
            Your account ({user.email}) is currently inactive. Please reach out to institution administration for assistance.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
            <Link
              to={ROUTES.HOME}
              className="w-full sm:w-auto px-6 py-2.5 rounded-full border border-brand-border text-brand-blue font-display font-bold text-sm hover:bg-brand-cream transition-colors"
            >
              Return to Website
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-brand-cream text-brand-dark-muted font-display font-bold text-sm hover:bg-brand-border/60 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-brand-cream">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to={ROUTES.HOME} className="inline-block mb-4">
          <img src={siteContent.brand.logoSrc} alt={siteContent.brand.logoAlt} className="h-14 mx-auto object-contain" />
        </Link>
        <h2 className="font-display font-extrabold text-3xl text-brand-blue tracking-tight">
          Sign In to Evolve
        </h2>
        <p className="mt-2 text-sm text-brand-dark-muted font-body">
          Enter your credentials to access the education platform.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl sm:rounded-4xl border border-brand-border shadow-card">
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="font-body leading-relaxed">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-accent font-bold uppercase tracking-wider text-brand-blue mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-dark-muted">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-brand-border focus:border-brand-leaf focus:ring-2 focus:ring-brand-leaf/20 outline-none text-sm font-body transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-accent font-bold uppercase tracking-wider text-brand-blue mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-dark-muted">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-brand-border focus:border-brand-leaf focus:ring-2 focus:ring-brand-leaf/20 outline-none text-sm font-body transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-full bg-brand-leaf hover:bg-brand-leaf-dark text-white font-display font-bold text-base shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-brand-border-light text-center">
            <p className="text-xs text-brand-dark-muted font-body">
              Looking to join Evolve Education?
            </p>
            <Link
              to={ROUTES.AUTH.SIGN_UP}
              className="mt-2 inline-flex items-center gap-1 text-sm font-display font-bold text-brand-blue hover:text-brand-leaf transition-colors"
            >
              <span>Submit a Student Application</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
