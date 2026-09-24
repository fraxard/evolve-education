import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { APP_ROUTES, getPublicUrl } from '../../routes/paths';
import {
  LayoutDashboard,
  Layers,
  GraduationCap,
  CalendarCheck,
  Award,
  MessageSquareQuote,
  User,
  LogOut,
  ExternalLink,
  Menu,
  X,
} from 'lucide-react';

export const TeacherLayout: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate(APP_ROUTES.SIGN_IN, { replace: true });
  };

  const navGroups = [
    {
      title: 'Operational',
      items: [
        { name: 'Dashboard', path: APP_ROUTES.DASHBOARD, icon: LayoutDashboard },
        { name: 'My Batches', path: APP_ROUTES.BATCHES, icon: Layers },
        { name: 'Students', path: APP_ROUTES.STUDENTS, icon: GraduationCap },
      ],
    },
    {
      title: 'Pedagogical',
      items: [
        { name: 'Attendance', path: APP_ROUTES.ATTENDANCE, icon: CalendarCheck },
        { name: 'Assessments', path: APP_ROUTES.ASSESSMENTS, icon: Award },
        { name: 'Feedback & Notes', path: APP_ROUTES.FEEDBACK, icon: MessageSquareQuote },
      ],
    },
    {
      title: 'Account',
      items: [
        { name: 'Profile & Settings', path: APP_ROUTES.PROFILE, icon: User },
      ],
    },
  ];

  const displayName = user?.fullName || user?.email?.split('@')[0] || 'Faculty';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'FC';

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row text-slate-100 antialiased font-body selection:bg-slate-700">
      {/* Mobile Topbar */}
      <header className="md:hidden bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between border-b border-slate-800 z-30">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 font-mono text-xs font-bold">
            EE
          </div>
          <span className="font-semibold text-xs tracking-tight text-slate-200">
            Faculty Portal
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1 rounded text-slate-400 hover:text-white"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Compact Operational Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 w-60 bg-slate-900 text-slate-300 flex flex-col z-40 transition-transform duration-200 ease-in-out border-r border-slate-800 md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-14 flex items-center gap-2.5 px-4 border-b border-slate-800 shrink-0">
          <div className="w-7 h-7 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 font-mono text-xs font-bold">
            EE
          </div>
          <div className="flex flex-col">
            <span className="font-display font-semibold text-xs text-white tracking-tight leading-tight">
              Evolve Education
            </span>
            <span className="text-[10px] font-mono text-emerald-400 tracking-wider uppercase font-medium">
              Faculty Workspace
            </span>
          </div>
        </div>

        {/* User Badge in Sidebar */}
        <div className="p-3 mx-2 my-2 bg-slate-850/60 border border-slate-800 rounded-lg">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs font-semibold flex items-center justify-center shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-white truncate">{displayName}</p>
              <p className="text-[10px] text-slate-400 font-mono truncate">{user?.email}</p>
              <div className="mt-0.5 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[9px] font-mono uppercase tracking-wider text-emerald-400 font-medium">
                  Faculty Member
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-4">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <div className="px-2 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
                {group.title}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-800 text-white font-semibold border-l-2 border-emerald-400 pl-2'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-slate-800 space-y-1 shrink-0">
          <a
            href={getPublicUrl('/')}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Public Website</span>
          </a>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors text-left"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-900">
        {/* Top Header Bar */}
        <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Surface:
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-emerald-400">
              app.localhost
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-xs text-slate-400">
              Signed in as <strong className="text-slate-200 font-medium">{user?.email}</strong>
            </span>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
