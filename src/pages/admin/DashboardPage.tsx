import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ADMIN_ROUTES } from '../../routes/paths';
import {
  Clock,
  GraduationCap,
  Users,
  BookOpen,
  Layers,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  FileText,
  Activity,
} from 'lucide-react';

interface DashboardData {
  metrics: {
    pendingApplications: number;
    activeStudents: number;
    activeTeachers: number;
    activePrograms: number;
    activeBatches: number;
  };
  recentApplications: Array<{
    id: string;
    student_name: string;
    guardian_name: string;
    submitted_at: string;
    status: 'pending' | 'approved' | 'rejected';
    requested_program_name: string | null;
  }>;
  recentActivity: Array<{
    id: string;
    action: string;
    target_entity: string;
    target_id: string | null;
    created_at: string;
    details: any;
    actor_email: string | null;
  }>;
}

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/dashboard', {
        credentials: 'include',
      });
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Session expired or unauthenticated.');
        }
        if (res.status === 403) {
          throw new Error('Access forbidden. Administrative privileges required.');
        }
        throw new Error(`Failed to load metrics (HTTP ${res.status}).`);
      }
      const json = await res.json();
      setData(json);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to connect to administrative API.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-500">
        <RefreshCw className="w-5 h-5 animate-spin mb-2 text-slate-600" />
        <span className="text-xs font-mono">Querying database metrics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-slate-800 text-xs">
        <div className="flex items-center gap-2 font-semibold text-rose-800 mb-1">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>Database Connectivity Error</span>
        </div>
        <p className="text-rose-700 mb-3">{error}</p>
        <button
          onClick={fetchDashboard}
          className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded font-medium text-xs transition-colors"
        >
          Retry Query
        </button>
      </div>
    );
  }

  const { metrics, recentApplications = [], recentActivity = [] } = data || {
    metrics: {
      pendingApplications: 0,
      activeStudents: 0,
      activeTeachers: 0,
      activePrograms: 0,
      activeBatches: 0,
    },
    recentApplications: [],
    recentActivity: [],
  };

  return (
    <div className="space-y-5">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
        <div>
          <h1 className="text-base font-semibold text-slate-900 tracking-tight">
            Institutional Control Panel
          </h1>
          <p className="text-xs text-slate-500">
            Real-time enrollment pipeline, active academic capacity, and system audit trail.
          </p>
        </div>

        <button
          onClick={fetchDashboard}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 rounded text-xs font-medium text-slate-700 shadow-xs transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* 5 Compact Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Pending Applications */}
        <Link
          to={ADMIN_ROUTES.APPLICATIONS}
          className={`p-3.5 rounded-lg border shadow-xs transition-all hover:border-slate-400 ${
            metrics.pendingApplications > 0
              ? 'bg-amber-50/70 border-amber-300'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium uppercase font-mono tracking-wider">
              Pending Apps
            </span>
            <Clock className={`w-3.5 h-3.5 ${metrics.pendingApplications > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
          </div>
          <div className="text-2xl font-semibold font-mono text-slate-900">
            {metrics.pendingApplications}
          </div>
          <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-0.5">
            <span>Review submissions &rarr;</span>
          </div>
        </Link>

        {/* Active Students */}
        <Link
          to={ADMIN_ROUTES.STUDENTS}
          className="p-3.5 bg-white border border-slate-200 rounded-lg shadow-xs hover:border-slate-400 transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium uppercase font-mono tracking-wider">
              Active Students
            </span>
            <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-semibold font-mono text-slate-900">
            {metrics.activeStudents}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            <span>Enrolled learners</span>
          </div>
        </Link>

        {/* Active Faculty */}
        <Link
          to={ADMIN_ROUTES.TEACHERS}
          className="p-3.5 bg-white border border-slate-200 rounded-lg shadow-xs hover:border-slate-400 transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium uppercase font-mono tracking-wider">
              Active Faculty
            </span>
            <Users className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-semibold font-mono text-slate-900">
            {metrics.activeTeachers}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            <span>Certified instructors</span>
          </div>
        </Link>

        {/* Active Programs */}
        <Link
          to={ADMIN_ROUTES.PROGRAMS}
          className="p-3.5 bg-white border border-slate-200 rounded-lg shadow-xs hover:border-slate-400 transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium uppercase font-mono tracking-wider">
              Programs
            </span>
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-semibold font-mono text-slate-900">
            {metrics.activePrograms}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            <span>Curriculum tracks</span>
          </div>
        </Link>

        {/* Active Batches */}
        <Link
          to={ADMIN_ROUTES.BATCHES}
          className="p-3.5 bg-white border border-slate-200 rounded-lg shadow-xs hover:border-slate-400 transition-all col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium uppercase font-mono tracking-wider">
              Active Cohorts
            </span>
            <Layers className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-semibold font-mono text-slate-900">
            {metrics.activeBatches}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            <span>Scheduled batches</span>
          </div>
        </Link>
      </div>

      {/* Two-Column Operational Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Column: Recent Admissions Applications */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <h2 className="text-xs font-semibold text-slate-900">
                Recent Admissions Applications
              </h2>
            </div>
            <Link
              to={ADMIN_ROUTES.APPLICATIONS}
              className="text-[11px] text-slate-600 hover:text-slate-900 font-medium inline-flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recentApplications.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No admissions applications on record.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/30 text-[10px] font-mono uppercase text-slate-400">
                    <th className="py-2 px-3.5 font-medium">Applicant</th>
                    <th className="py-2 px-3 font-medium">Program</th>
                    <th className="py-2 px-3 font-medium">Status</th>
                    <th className="py-2 px-3 font-medium">Date</th>
                    <th className="py-2 px-3.5 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3.5 font-medium text-slate-900">
                        <div>{app.student_name}</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          Guardian: {app.guardian_name}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                        {app.requested_program_name || 'General'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium uppercase font-mono ${
                            app.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : app.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-slate-400 whitespace-nowrap font-mono">
                        {new Date(app.submitted_at).toLocaleDateString()}
                      </td>
                      <td className="py-2.5 px-3.5 text-right">
                        <Link
                          to={ADMIN_ROUTES.APPLICATIONS}
                          className="text-[11px] font-medium text-slate-700 hover:text-slate-900 underline"
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Recent Administrative Audit Trail */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-slate-500" />
              <h2 className="text-xs font-semibold text-slate-900">
                Recent Audit Trail
              </h2>
            </div>
            <Link
              to={ADMIN_ROUTES.AUDIT_LOGS}
              className="text-[11px] text-slate-600 hover:text-slate-900 font-medium inline-flex items-center gap-1 transition-colors"
            >
              <span>Full Log</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recentActivity.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No audit logs recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {recentActivity.map((log) => (
                <div key={log.id} className="p-3 hover:bg-slate-50/80 transition-colors flex items-start justify-between gap-3">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-semibold text-slate-800">
                        {log.action}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        ({log.target_entity})
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      Actor: <span className="text-slate-700">{log.actor_email || 'System'}</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono whitespace-nowrap pt-0.5">
                    {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
