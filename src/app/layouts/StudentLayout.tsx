import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { APP_ROUTES, getPublicUrl } from '../../routes/paths';
import { siteContent } from '../../data/content';
import {
  LayoutDashboard,
  BookOpen,
  CalendarCheck,
  Award,
  TrendingUp,
  MessageSquareQuote,
  FileText,
  User,
  LogOut,
  Menu,
  X,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface NavItem {
  name: string;
  to: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Dashboard', to: APP_ROUTES.DASHBOARD, icon: LayoutDashboard },
  { name: 'My Program', to: APP_ROUTES.PROGRAM, icon: BookOpen },
  { name: 'Attendance', to: APP_ROUTES.ATTENDANCE, icon: CalendarCheck },
  { name: 'Assessments', to: APP_ROUTES.ASSESSMENTS, icon: Award },
  { name: 'Progress', to: APP_ROUTES.PROGRESS, icon: TrendingUp },
  { name: 'Feedback', to: APP_ROUTES.FEEDBACK, icon: MessageSquareQuote },
  { name: 'Documents', to: APP_ROUTES.DOCUMENTS, icon: FileText },
  { name: 'Profile', to: APP_ROUTES.PROFILE, icon: User },
];

export const StudentLayout: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate(APP_ROUTES.SIGN_IN, { replace: true });
  };

  const displayName = user?.fullName || user?.email?.split('@')[0] || 'Student';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'ST';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-800 font-body">
      {/* ------------------------------------------------------------- */}
      {/* DESKTOP SIDEBAR                                               */}
      {/* ------------------------------------------------------------- */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-white border-r border-slate-200 shrink-0 sticky top-0 h-screen z-30">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
          <img
            src={siteContent.brand.logoSrc}
            alt={siteContent.brand.logoAlt}
            className="h-9 w-auto object-contain"
          />
          <div>
            <span className="block font-display font-bold text-sm text-brand-blue tracking-tight leading-tight">
              Evolve Education
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-leaf font-mono uppercase tracking-wider">
              <Sparkles className="w-3 h-3" /> Student Portal
            </span>
          </div>
        </div>

        {/* Student Identity Card in Sidebar */}
        <div className="p-4 mx-3 my-3 bg-gradient-to-br from-brand-cream/60 to-brand-cream-alt/40 border border-brand-yellow/30 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-leaf text-white font-display font-bold text-sm flex items-center justify-center shadow-xs shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold font-display text-brand-blue truncate">
                {displayName}
              </p>
              <p className="text-[11px] text-slate-500 font-mono truncate">
                {user?.email}
              </p>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  Active Student
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs transition-colors duration-150 ${
                  isActive
                    ? 'bg-brand-blue text-white shadow-xs'
                    : 'text-slate-600 hover:text-brand-blue hover:bg-brand-cream/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-brand-yellow' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-3 border-t border-slate-100 space-y-1 shrink-0">
          <a
            href={getPublicUrl('/')}
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-500 hover:text-brand-blue hover:bg-slate-50 rounded-xl transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-slate-400" />
            <span>Public Website</span>
          </a>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ------------------------------------------------------------- */}
      {/* MOBILE TOPBAR & DRAWER                                        */}
      {/* ------------------------------------------------------------- */}
      <div className="md:hidden bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src={siteContent.brand.logoSrc}
              alt={siteContent.brand.logoAlt}
              className="h-7 w-auto object-contain"
            />
            <span className="font-display font-bold text-xs text-brand-blue">
              Student Portal
            </span>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-slate-200 px-4 py-3 space-y-1 bg-white">
            <div className="pb-3 mb-2 border-b border-slate-100 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-leaf text-white font-display font-bold text-xs flex items-center justify-center">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-brand-blue truncate">{displayName}</p>
                <p className="text-[10px] text-slate-500 font-mono truncate">{user?.email}</p>
              </div>
            </div>

            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium ${
                    isActive
                      ? 'bg-brand-blue text-white'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}

            <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between">
              <a
                href={getPublicUrl('/')}
                className="text-xs text-slate-500 hover:text-brand-blue inline-flex items-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Public Site</span>
              </a>
              <button
                onClick={handleSignOut}
                className="text-xs text-rose-600 hover:text-rose-700 font-medium inline-flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MAIN VIEWPORT                                                 */}
      {/* ------------------------------------------------------------- */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
