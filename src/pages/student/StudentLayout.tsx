import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../routes/paths';
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
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Dashboard', to: ROUTES.STUDENT.DASHBOARD, icon: LayoutDashboard },
  { name: 'My Program', to: ROUTES.STUDENT.PROGRAM, icon: BookOpen },
  { name: 'Attendance', to: ROUTES.STUDENT.ATTENDANCE, icon: CalendarCheck },
  { name: 'Assessments', to: ROUTES.STUDENT.ASSESSMENTS, icon: Award },
  { name: 'Progress', to: ROUTES.STUDENT.PROGRESS, icon: TrendingUp },
  { name: 'Feedback', to: ROUTES.STUDENT.FEEDBACK, icon: MessageSquareQuote },
  { name: 'Documents', to: ROUTES.STUDENT.DOCUMENTS, icon: FileText },
  { name: 'Profile', to: ROUTES.STUDENT.PROFILE, icon: User },
];

export const StudentLayout: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate(ROUTES.AUTH.SIGN_IN, { replace: true });
  };

  // Safe user display name & initials
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
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  Active Student
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto" aria-label="Student Portal Navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;

            return (
              <NavLink
                key={item.name}
                to={item.to}
                className={({ isActive: linkActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    linkActive
                      ? 'bg-brand-leaf text-white shadow-xs'
                      : 'text-slate-600 hover:text-brand-blue hover:bg-slate-100/80'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-brand-blue'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-3 border-t border-slate-100 space-y-1.5 bg-slate-50/50">
          <a
            href={ROUTES.HOME}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-medium text-slate-500 hover:text-brand-blue hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            <span>Public Website</span>
          </a>

          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ------------------------------------------------------------- */}
      {/* MOBILE TOPBAR & DRAWER                                        */}
      {/* ------------------------------------------------------------- */}
      <div className="md:hidden sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between px-4 py-3">
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
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-leaf"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Slide-down Drawer */}
        {mobileMenuOpen && (
          <div className="border-t border-slate-100 px-4 py-3 bg-white shadow-lg animate-in slide-in-from-top-2 duration-150">
            {/* Student Info in Mobile Drawer */}
            <div className="flex items-center gap-3 p-3 mb-3 bg-brand-cream/60 rounded-xl border border-brand-yellow/30">
              <div className="w-9 h-9 rounded-lg bg-brand-leaf text-white font-display font-bold text-xs flex items-center justify-center">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-brand-blue truncate">{displayName}</p>
                <p className="text-[11px] text-slate-500 font-mono truncate">{user?.email}</p>
              </div>
            </div>

            {/* Nav list */}
            <nav className="space-y-1 mb-3">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive: linkActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold ${
                        linkActive
                          ? 'bg-brand-leaf text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* Mobile Footer Actions */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <a
                href={ROUTES.HOME}
                className="text-slate-500 hover:text-brand-blue flex items-center gap-1.5 py-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Public Site</span>
              </a>
              <button
                type="button"
                onClick={handleSignOut}
                className="text-rose-600 font-semibold flex items-center gap-1.5 py-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MAIN CONTENT AREA                                             */}
      {/* ------------------------------------------------------------- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
