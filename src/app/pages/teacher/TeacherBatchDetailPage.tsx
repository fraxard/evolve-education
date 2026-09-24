import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { APP_ROUTES } from '../../../routes/paths';
import {
  Users,
  Calendar,
  Clock,
  ArrowLeft,
  AlertCircle,
  ShieldAlert,
  Search,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Mail,
  Phone,
  RefreshCw,
} from 'lucide-react';

interface BatchInfo {
  id: string;
  name: string;
  level: string | null;
  schedule: string;
  start_date: string;
  end_date: string | null;
  capacity: number;
  is_active: boolean;
  program_id: string;
  program_name: string;
  program_description: string | null;
  program_level: string | null;
  teacher_name: string;
}

interface EnrolledStudent {
  id: string;
  full_name: string;
  account_email: string;
  guardian_name: string | null;
  guardian_phone: string | null;
  guardian_email: string | null;
  enrollment_id: string;
  enrollment_date: string;
  enrollment_status: string;
}

export const TeacherBatchDetailPage: React.FC = () => {
  const { batchId } = useParams<{ batchId: string }>();

  const [batch, setBatch] = useState<BatchInfo | null>(null);
  const [roster, setRoster] = useState<EnrolledStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchBatchDetail = async () => {
    if (!batchId) return;
    setLoading(true);
    setErrorStatus(null);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/teacher/batches/${batchId}`, { credentials: 'include' });
      if (!res.ok) {
        setErrorStatus(res.status);
        const data = await res.json().catch(() => ({}));
        if (res.status === 403) {
          setErrorMessage(data.error || 'Access Forbidden: You are not assigned to instruct this batch.');
        } else if (res.status === 404) {
          setErrorMessage(data.error || 'Batch not found.');
        } else {
          setErrorMessage(data.error || `Failed to load batch details (HTTP ${res.status}).`);
        }
        return;
      }

      const data = await res.json();
      setBatch(data.batch);
      setRoster(data.roster || []);
    } catch (err: any) {
      console.error('[TeacherBatchDetailPage] Error:', err);
      setErrorMessage(err.message || 'An unexpected connection error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatchDetail();
  }, [batchId]);

  const filteredRoster = roster.filter(
    (student) =>
      student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.account_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.guardian_name && student.guardian_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // 403 Forbidden State
  if (errorStatus === 403) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto font-body">
        <div className="bg-slate-900 border border-amber-900/60 rounded-2xl p-6 sm:p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-800/80 flex items-center justify-center text-amber-400 mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-display font-semibold text-white">Cohort Access Restricted</h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            {errorMessage || 'You are not assigned to instruct this batch. Institutional data boundaries prevent viewing cohorts outside your teaching assignment.'}
          </p>
          <div className="pt-2">
            <Link
              to={APP_ROUTES.BATCHES}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to My Batches
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 404 Not Found State
  if (errorStatus === 404) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto font-body">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-display font-semibold text-white">Batch Not Found</h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            The batch identifier requested does not exist or may have been deleted by administration.
          </p>
          <div className="pt-2">
            <Link
              to={APP_ROUTES.BATCHES}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to My Batches
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Generic Error State
  if (errorMessage && !loading && !batch) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto font-body">
        <div className="p-4 rounded-xl bg-red-950/50 border border-red-800/80 flex items-start gap-3 text-red-200 text-xs">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-semibold text-red-300">Error Loading Batch Detail</div>
            <div className="mt-0.5">{errorMessage}</div>
          </div>
          <button
            onClick={fetchBatchDetail}
            className="px-2.5 py-1 rounded bg-red-900/60 border border-red-700 hover:bg-red-900 text-xs font-medium text-red-100 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 font-body">
      {/* Breadcrumbs & Navigation */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link
            to={APP_ROUTES.BATCHES}
            className="inline-flex items-center gap-1 hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            My Batches
          </Link>
          <span>/</span>
          <span className="text-slate-200 font-medium truncate max-w-xs sm:max-w-md">
            {loading ? 'Loading...' : batch?.name}
          </span>
        </div>

        <button
          onClick={fetchBatchDetail}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Batch Overview Banner */}
      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 animate-pulse space-y-4">
          <div className="h-4 bg-slate-800 rounded w-32" />
          <div className="h-7 bg-slate-800 rounded w-1/3" />
          <div className="h-4 bg-slate-800 rounded w-1/2" />
        </div>
      ) : batch ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-medium text-emerald-400 px-2.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60">
                {batch.program_name}
              </span>
              {batch.level && (
                <span className="text-xs font-mono text-slate-300 px-2.5 py-0.5 rounded bg-slate-800 border border-slate-700">
                  Level: {batch.level}
                </span>
              )}
            </div>

            {batch.is_active ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-400 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/80 self-start sm:self-auto">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Active Cohort
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-400 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 self-start sm:self-auto">
                <XCircle className="w-3.5 h-3.5" />
                Archived Cohort
              </span>
            )}
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-semibold text-white tracking-tight">
              {batch.name}
            </h1>
            {batch.program_description && (
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
                {batch.program_description}
              </p>
            )}
          </div>

          {/* Metric Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-800/80">
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Schedule</div>
                <div className="text-xs sm:text-sm font-medium text-white">{batch.schedule}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-sky-400 shrink-0" />
              <div>
                <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Session Timeline</div>
                <div className="text-xs sm:text-sm font-medium text-white">
                  {batch.start_date} {batch.end_date ? `to ${batch.end_date}` : '· Ongoing'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-purple-400 shrink-0" />
              <div>
                <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Enrolled Capacity</div>
                <div className="text-xs sm:text-sm font-medium text-white font-mono">
                  {roster.length} / {batch.capacity} Students Enrolled
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Student Roster Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              Active Student Roster
              <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                {roster.length}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Learners actively assigned to this cohort. Click a student row to inspect their academic profile.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search roster..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-8 text-center text-xs text-slate-500">Loading student roster...</div>
        ) : filteredRoster.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-xl bg-slate-950/40 border border-slate-800/80">
            <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <h3 className="text-xs font-semibold text-slate-300">
              {roster.length === 0 ? 'No Active Learners Enrolled' : 'No matching learners found'}
            </h3>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-0.5">
              {roster.length === 0
                ? 'Enrollments for this cohort will appear here once registered by academic administration.'
                : 'Try refining your search keyword.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 sm:mx-0">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Account Email</th>
                  <th className="py-3 px-4">Guardian Contact</th>
                  <th className="py-3 px-4">Enrolled Date</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredRoster.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-850/50 transition-colors group"
                  >
                    <td className="py-3 px-4">
                      <Link
                        to={APP_ROUTES.STUDENT_DETAIL(student.id)}
                        className="font-medium text-white group-hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                      >
                        {student.full_name}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {student.account_email}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <div>{student.guardian_name || '—'}</div>
                      {(student.guardian_phone || student.guardian_email) && (
                        <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                          {student.guardian_phone && (
                            <span className="flex items-center gap-0.5">
                              <Phone className="w-2.5 h-2.5" />
                              {student.guardian_phone}
                            </span>
                          )}
                          {student.guardian_email && (
                            <span className="flex items-center gap-0.5">
                              <Mail className="w-2.5 h-2.5" />
                              {student.guardian_email}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {student.enrollment_date}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 capitalize">
                        {student.enrollment_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={APP_ROUTES.STUDENT_DETAIL(student.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-200 text-[11px] font-medium border border-slate-700 transition-colors"
                      >
                        Profile
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
