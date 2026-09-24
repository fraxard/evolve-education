import React, { useEffect, useState } from 'react';
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
  Clock,
  RefreshCw,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface DashboardBatch {
  id: string;
  name: string;
  level: string | null;
  schedule: string;
  capacity: number;
  is_active: boolean;
  program_name: string;
  enrolled_student_count: number;
}

interface DashboardMetrics {
  activeBatchCount: number;
  totalBatchCount: number;
  activeStudentCount: number;
}

export const TeacherDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const displayName = user?.fullName || user?.email?.split('@')[0] || 'Faculty Member';

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [batches, setBatches] = useState<DashboardBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/teacher/dashboard', { credentials: 'include' });
      if (!res.ok) {
        throw new Error(`Failed to load teacher dashboard metrics (HTTP ${res.status}).`);
      }
      const data = await res.json();
      setMetrics(data.metrics);
      setBatches(data.batches || []);
    } catch (err: any) {
      console.error('[TeacherDashboardPage] Error:', err);
      setError(err.message || 'An unexpected error occurred while loading dashboard telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const upcomingModules = [
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
              Faculty Workspace Live
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-display font-semibold text-white tracking-tight">
            Welcome, {displayName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            You are logged into the Evolve Education Faculty Workspace on <code className="text-emerald-400 bg-slate-800 px-1.5 py-0.5 rounded text-xs">app.localhost</code>.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Account Role</div>
            <div className="text-xs font-mono font-bold uppercase text-emerald-400">Teacher</div>
          </div>
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-red-950/50 border border-red-800/80 flex items-start gap-3 text-red-200 text-xs">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-semibold text-red-300">Error Loading Faculty Telemetry</div>
            <div className="mt-0.5">{error}</div>
          </div>
          <button
            onClick={fetchDashboardData}
            className="px-2.5 py-1 rounded bg-red-900/60 border border-red-700 hover:bg-red-900 text-xs font-medium text-red-100 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Real Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Metric 1: My Batches */}
        <Link
          to={APP_ROUTES.BATCHES}
          className="group block bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition-all hover:bg-slate-850/60"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 font-semibold">
              Live · Phase 2B.1
            </span>
          </div>
          <div className="text-xs font-medium text-slate-400">Assigned Cohorts</div>
          <div className="text-2xl font-display font-bold text-white mt-0.5 flex items-baseline gap-2">
            {loading ? (
              <span className="text-slate-600 animate-pulse">...</span>
            ) : (
              <>
                <span>{metrics?.activeBatchCount ?? 0}</span>
                <span className="text-xs font-normal text-slate-500 font-mono">
                  active ({metrics?.totalBatchCount ?? 0} total)
                </span>
              </>
            )}
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs text-emerald-400 group-hover:translate-x-0.5 transition-transform">
            <span>Manage My Batches</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        {/* Metric 2: Students */}
        <Link
          to={APP_ROUTES.STUDENTS}
          className="group block bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition-all hover:bg-slate-850/60"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-sky-950/60 border border-sky-800/60 flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 font-semibold">
              Live · Phase 2B.1
            </span>
          </div>
          <div className="text-xs font-medium text-slate-400">Assigned Learners</div>
          <div className="text-2xl font-display font-bold text-white mt-0.5">
            {loading ? (
              <span className="text-slate-600 animate-pulse">...</span>
            ) : (
              metrics?.activeStudentCount ?? 0
            )}
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs text-sky-400 group-hover:translate-x-0.5 transition-transform">
            <span>View Student Directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        {/* Architecture Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              Strictly Scoped
            </span>
          </div>
          <div>
            <div className="text-xs font-semibold text-white">Server-Enforced Authorization</div>
            <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              All cohort queries and student rosters are strictly verified against your authenticated faculty credentials.
            </div>
          </div>
          <div className="mt-3 text-[11px] font-mono text-emerald-400/90">
            IDOR-Protected Database Routing
          </div>
        </div>
      </div>

      {/* Assigned Batches Quick Access */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Active Teaching Cohorts
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Direct access to rosters and details for your currently assigned batches.
            </p>
          </div>
          <Link
            to={APP_ROUTES.BATCHES}
            className="text-xs text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1"
          >
            All Batches &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-500 animate-pulse">
            Loading assigned batches...
          </div>
        ) : batches.length === 0 ? (
          <div className="text-center py-8 px-4 rounded-xl bg-slate-950/40 border border-slate-800/80">
            <Layers className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <div className="text-xs font-semibold text-slate-300">No Batches Assigned Yet</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Cohorts will appear here when assigned to your faculty profile by administrators.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {batches.map((batch) => (
              <Link
                key={batch.id}
                to={APP_ROUTES.BATCH_DETAIL(batch.id)}
                className="group block p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all hover:bg-slate-900"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60 truncate">
                    {batch.program_name}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                    {batch.enrolled_student_count} Students
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors flex items-center justify-between">
                  <span className="truncate">{batch.name}</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400 shrink-0" />
                </h3>

                <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{batch.schedule}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Operational Modules */}
      <div>
        <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-3">
          Upcoming Faculty Roadmap Modules
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {upcomingModules.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title}
                to={card.path}
                className="group block p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all hover:bg-slate-850/60"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-emerald-300 transition-colors">
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
