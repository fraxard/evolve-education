import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ADMIN_ROUTES, getPublicUrl } from '../../routes/paths';
import {
  LayoutDashboard,
  FileSpreadsheet,
  GraduationCap,
  Users,
  BookOpen,
  Layers,
  ShieldAlert,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Shield,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate(ADMIN_ROUTES.SIGN_IN);
  };

  const navGroups = [
    {
      title: 'Overview',
      items: [
        { name: 'Dashboard', path: ADMIN_ROUTES.DASHBOARD, icon: LayoutDashboard },
      ],
    },
    {
      title: 'Admissions',
      items: [
        { name: 'Applications', path: ADMIN_ROUTES.APPLICATIONS, icon: FileSpreadsheet },
      ],
    },
    {
      title: 'People',
      items: [
        { name: 'Students', path: ADMIN_ROUTES.STUDENTS, icon: GraduationCap },
        { name: 'Teachers', path: ADMIN_ROUTES.TEACHERS, icon: Users },
      ],
    },
    {
      title: 'Academic Structure',
      items: [
        { name: 'Programs', path: ADMIN_ROUTES.PROGRAMS, icon: BookOpen },
        { name: 'Batches', path: ADMIN_ROUTES.BATCHES, icon: Layers },
      ],
    },
    {
      title: 'System & Governance',
      items: [
        { name: 'Audit Logs', path: ADMIN_ROUTES.AUDIT_LOGS, icon: ShieldAlert },
        { name: 'System Settings', path: ADMIN_ROUTES.SETTINGS, icon: Settings },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row text-slate-800 antialiased font-body selection:bg-slate-300">
      {/* Mobile Topbar */}
      <header className="md:hidden bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between border-b border-slate-800 z-30">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 font-mono text-xs font-bold">
            EE
          </div>
          <span className="font-semibold text-xs tracking-tight text-slate-200">
            Institutional Admin
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
        {/* Header Branding */}
        <div className="px-4 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 text-xs">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="font-semibold text-xs text-white leading-tight">
                Evolve Education
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Control Panel
              </div>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-1 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4 text-xs">
          {navGroups.map((group) => (
            <div key={group.title}>
              <div className="px-2 mb-1 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                {group.title}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-slate-800 text-white font-semibold border-l-2 border-emerald-400 pl-2'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Compact Operator Profile & Sign Out Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2 mb-2 px-1">
            <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-mono text-emerald-400 font-bold">
              {(user?.email?.[0] || 'A').toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-medium text-slate-200 truncate">
                {user?.email}
              </div>
              <div className="text-[9px] text-emerald-400 font-mono uppercase">
                Administrator
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px]">
            <a
              href={getPublicUrl('/')}
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
              title="Open Public Website"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Public Site</span>
            </a>
            <button
              onClick={handleSignOut}
              className="text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
              title="Terminate Admin Session"
            >
              <LogOut className="w-3 h-3" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Compact Institutional Topbar */}
        <header className="hidden md:flex items-center justify-between px-6 py-2.5 bg-white border-b border-slate-200 text-xs">
          <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
            <span>ADMIN</span>
            <span>/</span>
            <span className="text-slate-900 font-semibold capitalize font-body">
              {location.pathname.split('/').filter(Boolean)[0] || 'Dashboard'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="font-mono">Active Session: {user?.email}</span>
            </div>
            <div className="h-3.5 w-px bg-slate-200" />
            <a
              href={getPublicUrl('/')}
              target="_blank"
              rel="noreferrer"
              className="text-slate-500 hover:text-slate-800 flex items-center gap-1 text-[11px] transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              <span>View Public Site</span>
            </a>
            <button
              onClick={handleSignOut}
              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded text-[11px] transition-colors flex items-center gap-1"
            >
              <LogOut className="w-3 h-3" />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
