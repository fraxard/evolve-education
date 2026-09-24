import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { APP_ROUTES } from '../../../routes/paths';
import {
  Layers,
  GraduationCap,
  CalendarCheck,
  Award,
  MessageSquareQuote,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export const TeacherDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const displayName = user?.fullName || user?.email?.split('@')[0] || 'Faculty Member';

  const operationalCards = [
    {
      title: 'My Batches',
      path: APP_ROUTES.BATCHES,
      icon: Layers,
      phase: 'Phase 2B.1',
      desc: 'Assigned teaching batches, schedules, and active student rosters.',
    },
    {
      title: 'Students',
      path: APP_ROUTES.STUDENTS,
      icon: GraduationCap,
      phase: 'Phase 2B.1',
      desc: 'Enrolled students, academic histories, and emergency contact details.',
    },
    {
      title: 'Attendance Sessions',
      path: APP_ROUTES.ATTENDANCE,
      icon: CalendarCheck,
      phase: 'Phase 2B.2',
      desc: 'Daily session marking, bulk roster updates, and attendance rates.',
    },
    {
      title: 'Assessments & Gradebook',
      path: APP_ROUTES.ASSESSMENTS,
      icon: Award,
      phase: 'Phase 2B.3',
      desc: 'Exam and assignment creation, matrix grading, and scoring limits.',
    },
    {
      title: 'Feedback & Pastoral Notes',
      path: APP_ROUTES.FEEDBACK,
      icon: MessageSquareQuote,
      phase: 'Phase 2B.4',
      desc: 'Student feedback, academic warnings, and commendable progress notes.',
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 font-body">
      {/* Welcome Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 font-mono text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Operational App Surface Active
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-display font-semibold text-white tracking-tight">
            Welcome, {displayName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            You are logged into the Evolve Education Faculty Workspace on <code className="text-emerald-400 bg-slate-800 px-1.5 py-0.5 rounded text-xs">app.localhost</code>.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Account Role</div>
            <div className="text-xs font-mono font-bold uppercase text-emerald-400">Teacher</div>
          </div>
        </div>
      </div>

      {/* Surface Architecture Notice */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-white font-semibold">Phase 2B.0 Verified:</strong> Host classification, role-aware routing, and teacher shell boundaries are established. Operational features will connect in sequence beginning with batch rosters in Phase 2B.1.
        </div>
      </div>

      {/* Operational Modules Grid */}
      <div>
        <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-3">
          Upcoming Faculty Modules
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {operationalCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title}
                to={card.path}
                className="group block p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all hover:bg-slate-850/60"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 group-hover:text-emerald-300 transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-amber-400 border border-slate-700">
                    {card.phase}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors mb-1 flex items-center gap-1.5">
                  <span>{card.title}</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-emerald-400" />
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed">
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
