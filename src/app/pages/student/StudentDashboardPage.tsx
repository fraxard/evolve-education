import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { APP_ROUTES } from '../../../routes/paths';
import {
  BookOpen,
  CalendarCheck,
  Award,
  TrendingUp,
  MessageSquareQuote,
  FileText,
  Sparkles,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export const StudentDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const displayName = user?.fullName || user?.email?.split('@')[0] || 'Student';

  const studentModules = [
    {
      title: 'My Program',
      path: APP_ROUTES.PROGRAM,
      icon: BookOpen,
      phase: 'Phase 2B.5',
      desc: 'Active course enrollment, syllabus progression, and instructor details.',
    },
    {
      title: 'My Attendance',
      path: APP_ROUTES.ATTENDANCE,
      icon: CalendarCheck,
      phase: 'Phase 2B.5',
      desc: 'Personal attendance records, absence logs, and session statistics.',
    },
    {
      title: 'Assessments & Grades',
      path: APP_ROUTES.ASSESSMENTS,
      icon: Award,
      phase: 'Phase 2B.5',
      desc: 'Upcoming deadlines, assignment scores, and teacher evaluation remarks.',
    },
    {
      title: 'Academic Progress',
      path: APP_ROUTES.PROGRESS,
      icon: TrendingUp,
      phase: 'Phase 2B.5',
      desc: 'Milestones, completed modules, and overall academic standing.',
    },
    {
      title: 'Faculty Feedback',
      path: APP_ROUTES.FEEDBACK,
      icon: MessageSquareQuote,
      phase: 'Phase 2B.5',
      desc: 'Guidance, commendations, and feedback notes authored by your teachers.',
    },
    {
      title: 'Official Documents',
      path: APP_ROUTES.DOCUMENTS,
      icon: FileText,
      phase: 'Phase 2B.5',
      desc: 'Institutional records, certificates, and enrollment verification forms.',
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 font-body">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-blue to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-brand-yellow font-mono text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              Operational Student Portal
            </span>
          </div>
          <h1 className="text-xl sm:text-3xl font-display font-bold tracking-tight">
            Welcome back, {displayName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            You are logged into your educational workspace on <code className="text-brand-yellow bg-white/10 px-2 py-0.5 rounded text-xs font-mono">app.localhost</code>.
          </p>
        </div>

        <div className="shrink-0 hidden sm:block text-right">
          <div className="text-[10px] font-mono text-slate-300 uppercase tracking-wider">Account Role</div>
          <div className="text-xs font-mono font-bold uppercase text-emerald-400">Student</div>
        </div>
      </div>

      {/* Surface Architecture Notice */}
      <div className="p-4 rounded-2xl bg-brand-cream/60 border border-brand-yellow/30 flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 leading-relaxed">
          <strong className="text-brand-blue font-semibold">Phase 2B.0 Operational App Shell:</strong> The student portal surface and authentication boundaries are active. Live attendance, assessments, and grade records will be connected in Phase 2B.5 after faculty data entry is established.
        </div>
      </div>

      {/* Student Modules Grid */}
      <div>
        <h2 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold mb-3">
          Student Portal Modules
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {studentModules.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title}
                to={card.path}
                className="group block p-5 rounded-2xl bg-white border border-slate-200 hover:border-brand-blue/30 shadow-xs hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-cream flex items-center justify-center text-brand-blue group-hover:bg-brand-leaf group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {card.phase}
                  </span>
                </div>

                <h3 className="text-sm font-bold font-display text-brand-blue group-hover:text-brand-leaf transition-colors mb-1 flex items-center gap-1.5">
                  <span>{card.title}</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-brand-leaf" />
                </h3>

                <p className="text-xs text-slate-500 leading-relaxed">
                  {card.desc}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
