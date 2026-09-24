import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { APP_ROUTES } from '../../../routes/paths';
import {
  Layers,
  Search,
  Users,
  Calendar,
  Clock,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  BookOpen,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface TeacherBatch {
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
  enrolled_student_count: number;
}

export const TeacherBatchesPage: React.FC = () => {
  const [batches, setBatches] = useState<TeacherBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const fetchBatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/teacher/batches', { credentials: 'include' });
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error('Access forbidden: Your account is not authorized as a faculty member.');
        }
        throw new Error(`Failed to load assigned batches (HTTP ${res.status}).`);
      }
      const data = await res.json();
      setBatches(data.batches || []);
    } catch (err: any) {
      console.error('[TeacherBatchesPage] Error:', err);
      setError(err.message || 'An unexpected error occurred while loading batches.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const filteredBatches = batches.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.program_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.level && b.level.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && b.is_active) ||
      (statusFilter === 'inactive' && !b.is_active);

    return matchesSearch && matchesStatus;
  });

  const activeCount = batches.filter((b) => b.is_active).length;
  const totalEnrolled = batches.reduce((acc, b) => acc + (b.enrolled_student_count || 0), 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 font-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 font-mono text-[11px] font-semibold">
              <Layers className="w-3 h-3" />
              Faculty Workspace
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-display font-semibold text-white tracking-tight">
            My Assigned Batches
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Cohorts assigned to your faculty profile. Click a batch to inspect its active student roster.
          </p>
        </div>

        <button
          onClick={fetchBatches}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 transition-colors disabled:opacity-50 self-start sm:self-center"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400">Active Cohorts</div>
            <div className="text-xl font-display font-bold text-white">
              {loading ? '—' : `${activeCount} / ${batches.length}`}
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sky-950/60 border border-sky-800/60 flex items-center justify-center text-sky-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400">Total Enrolled Learners</div>
            <div className="text-xl font-display font-bold text-white">
              {loading ? '—' : totalEnrolled}
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-950/60 border border-purple-800/60 flex items-center justify-center text-purple-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400">Programs Represented</div>
            <div className="text-xl font-display font-bold text-white">
              {loading ? '—' : new Set(batches.map((b) => b.program_id)).size}
            </div>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-red-950/50 border border-red-800/80 flex items-start gap-3 text-red-200 text-xs">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-semibold text-red-300">Error Loading Batches</div>
            <div className="mt-0.5">{error}</div>
          </div>
          <button
            onClick={fetchBatches}
            className="px-2.5 py-1 rounded bg-red-900/60 border border-red-700 hover:bg-red-900 text-xs font-medium text-red-100 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by batch name, program, level..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['all', 'active', 'inactive'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                statusFilter === filter
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Batches Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-5 animate-pulse space-y-4">
              <div className="flex justify-between items-center">
                <div className="h-4 bg-slate-800 rounded w-24" />
                <div className="h-4 bg-slate-800 rounded w-16" />
              </div>
              <div className="h-5 bg-slate-800 rounded w-3/4" />
              <div className="h-3 bg-slate-800 rounded w-1/2" />
              <div className="pt-3 border-t border-slate-800 flex justify-between">
                <div className="h-3 bg-slate-800 rounded w-20" />
                <div className="h-3 bg-slate-800 rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredBatches.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-xl bg-slate-900/40 border border-slate-800">
          <Layers className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-white mb-1">
            {batches.length === 0 ? 'No Batches Assigned' : 'No Matching Batches'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {batches.length === 0
              ? 'You do not have any teaching cohorts assigned to your faculty profile yet. Contact your administrator if this is unexpected.'
              : 'No assigned cohorts match your search query or filter selection.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBatches.map((batch) => {
            const fillPercentage = batch.capacity > 0 ? Math.min(100, Math.round((batch.enrolled_student_count / batch.capacity) * 100)) : 0;
            return (
              <Link
                key={batch.id}
                to={APP_ROUTES.BATCH_DETAIL(batch.id)}
                className="group block bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition-all hover:bg-slate-850/60 shadow-sm"
              >
                {/* Header: Program & Status Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-mono font-medium text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60 truncate">
                    {batch.program_name}
                  </span>
                  {batch.is_active ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/80 shrink-0">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-slate-400 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 shrink-0">
                      <XCircle className="w-2.5 h-2.5" />
                      Archived
                    </span>
                  )}
                </div>

                {/* Batch Name & Level */}
                <h3 className="text-base font-semibold text-white group-hover:text-emerald-400 transition-colors flex items-center justify-between">
                  <span>{batch.name}</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-emerald-400 shrink-0" />
                </h3>
                {batch.level && (
                  <div className="text-xs text-slate-400 mt-0.5 font-medium">
                    Level: {batch.level}
                  </div>
                )}

                {/* Schedule info */}
                <div className="mt-3.5 space-y-1.5 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{batch.schedule}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>
                      Starts {batch.start_date}
                      {batch.end_date ? ` · Ends ${batch.end_date}` : ''}
                    </span>
                  </div>
                </div>

                {/* Capacity & Enrollment Bar */}
                <div className="mt-4 pt-3.5 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      Roster Size
                    </span>
                    <span className="font-mono font-semibold text-white">
                      {batch.enrolled_student_count} / {batch.capacity}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        fillPercentage >= 100
                          ? 'bg-amber-400'
                          : fillPercentage > 75
                          ? 'bg-emerald-400'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${fillPercentage}%` }}
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
