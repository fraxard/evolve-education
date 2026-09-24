import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { APP_ROUTES } from '../../../routes/paths';
import {
  GraduationCap,
  Search,
  Users,
  Layers,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Mail,
  Phone,
  BookOpen,
} from 'lucide-react';

interface AssignedStudent {
  id: string;
  full_name: string;
  account_email: string;
  guardian_name: string | null;
  guardian_phone: string | null;
  guardian_email: string | null;
  student_status: string;
  batch_id: string;
  batch_name: string;
  program_id: string;
  program_name: string;
  enrollment_id: string;
  enrollment_date: string;
}

export const TeacherStudentsPage: React.FC = () => {
  const [students, setStudents] = useState<AssignedStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBatch, setSelectedBatch] = useState<string>('all');

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/teacher/students', { credentials: 'include' });
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error('Access forbidden: Your account is not authorized as a faculty member.');
        }
        throw new Error(`Failed to load assigned students (HTTP ${res.status}).`);
      }
      const data = await res.json();
      setStudents(data.students || []);
    } catch (err: any) {
      console.error('[TeacherStudentsPage] Error:', err);
      setError(err.message || 'An unexpected error occurred while loading students.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Unique batches for filter dropdown
  const uniqueBatches = Array.from(
    new Map(students.map((s) => [s.batch_id, { id: s.batch_id, name: s.batch_name }])).values()
  );

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.account_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.guardian_name && s.guardian_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      s.batch_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.program_name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBatch = selectedBatch === 'all' || s.batch_id === selectedBatch;

    return matchesSearch && matchesBatch;
  });

  // Unique distinct student IDs
  const distinctStudentCount = new Set(students.map((s) => s.id)).size;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 font-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 font-mono text-[11px] font-semibold">
              <GraduationCap className="w-3 h-3" />
              Faculty Workspace
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-display font-semibold text-white tracking-tight">
            Assigned Student Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Learners actively enrolled across your assigned cohorts. Click a student to inspect their educational profile.
          </p>
        </div>

        <button
          onClick={fetchStudents}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 transition-colors disabled:opacity-50 self-start sm:self-center"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400">Distinct Learners</div>
            <div className="text-xl font-display font-bold text-white">
              {loading ? '—' : distinctStudentCount}
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sky-950/60 border border-sky-800/60 flex items-center justify-center text-sky-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400">Active Cohort Assignments</div>
            <div className="text-xl font-display font-bold text-white">
              {loading ? '—' : uniqueBatches.length}
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-950/60 border border-purple-800/60 flex items-center justify-center text-purple-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400">Total Active Enrollments</div>
            <div className="text-xl font-display font-bold text-white">
              {loading ? '—' : students.length}
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-xl bg-red-950/50 border border-red-800/80 flex items-start gap-3 text-red-200 text-xs">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-semibold text-red-300">Error Loading Student Directory</div>
            <div className="mt-0.5">{error}</div>
          </div>
          <button
            onClick={fetchStudents}
            className="px-2.5 py-1 rounded bg-red-900/60 border border-red-700 hover:bg-red-900 text-xs font-medium text-red-100 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name, email, guardian, or batch..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {uniqueBatches.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">Cohort:</span>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Cohorts ({uniqueBatches.length})</option>
              {uniqueBatches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Directory Table / Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500 animate-pulse">
            Loading student records...
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-xl bg-slate-950/40 border border-slate-800/80">
            <GraduationCap className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-300">
              {students.length === 0 ? 'No Students Assigned' : 'No Matching Students'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {students.length === 0
                ? 'You do not have any students actively enrolled in your assigned cohorts yet.'
                : 'Try adjusting your search terms or cohort filter.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 sm:mx-0">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Account Email</th>
                  <th className="py-3 px-4">Assigned Cohort</th>
                  <th className="py-3 px-4">Program</th>
                  <th className="py-3 px-4">Guardian Contact</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredStudents.map((student) => (
                  <tr
                    key={`${student.id}-${student.enrollment_id}`}
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
                    <td className="py-3 px-4">
                      <Link
                        to={APP_ROUTES.BATCH_DETAIL(student.batch_id)}
                        className="text-emerald-400 hover:text-emerald-300 hover:underline font-mono text-[11px]"
                      >
                        {student.batch_name}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {student.program_name}
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
