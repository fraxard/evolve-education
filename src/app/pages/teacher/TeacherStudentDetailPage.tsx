import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { APP_ROUTES } from '../../../routes/paths';
import {
  GraduationCap,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Layers,
  School,
  Clock,
  ShieldAlert,
  AlertCircle,
  CalendarCheck,
  Award,
  MessageSquareQuote,
  RefreshCw,
} from 'lucide-react';

interface StudentProfile {
  id: string;
  full_name: string;
  date_of_birth: string | null;
  gender: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  guardian_email: string | null;
  address: string | null;
  school_name: string | null;
  current_grade: string | null;
  student_status: string;
  student_since: string;
  account_email: string;
}

interface AuthorizedEnrollment {
  enrollment_id: string;
  enrollment_date: string;
  enrollment_status: string;
  batch_id: string;
  batch_name: string;
  batch_schedule: string;
  batch_level: string | null;
  program_id: string;
  program_name: string;
}

export const TeacherStudentDetailPage: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();

  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [enrollments, setEnrollments] = useState<AuthorizedEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchStudentDetail = async () => {
    if (!studentId) return;
    setLoading(true);
    setErrorStatus(null);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/teacher/students/${studentId}`, { credentials: 'include' });
      if (!res.ok) {
        setErrorStatus(res.status);
        const data = await res.json().catch(() => ({}));
        if (res.status === 403) {
          setErrorMessage(
            data.error ||
              'Forbidden: You do not have an active teaching assignment with this student.'
          );
        } else if (res.status === 404) {
          setErrorMessage(data.error || 'Student not found.');
        } else {
          setErrorMessage(data.error || `Failed to load student details (HTTP ${res.status}).`);
        }
        return;
      }

      const data = await res.json();
      setStudent(data.student);
      setEnrollments(data.enrollments || []);
    } catch (err: any) {
      console.error('[TeacherStudentDetailPage] Error:', err);
      setErrorMessage(err.message || 'An unexpected connection error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentDetail();
  }, [studentId]);

  // 403 Forbidden State
  if (errorStatus === 403) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto font-body">
        <div className="bg-slate-900 border border-amber-900/60 rounded-2xl p-6 sm:p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-800/80 flex items-center justify-center text-amber-400 mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-display font-semibold text-white">Student Access Restricted</h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            {errorMessage ||
              'You do not have an active teaching assignment with this student. Faculty members are strictly restricted to students actively enrolled in their assigned cohorts.'}
          </p>
          <div className="pt-2">
            <Link
              to={APP_ROUTES.STUDENTS}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to Student Directory
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
          <h2 className="text-xl font-display font-semibold text-white">Student Not Found</h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            The student identifier requested does not exist or may have been unassigned.
          </p>
          <div className="pt-2">
            <Link
              to={APP_ROUTES.STUDENTS}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to Student Directory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Generic Error State
  if (errorMessage && !loading && !student) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto font-body">
        <div className="p-4 rounded-xl bg-red-950/50 border border-red-800/80 flex items-start gap-3 text-red-200 text-xs">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-semibold text-red-300">Error Loading Student Profile</div>
            <div className="mt-0.5">{errorMessage}</div>
          </div>
          <button
            onClick={fetchStudentDetail}
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
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link
            to={APP_ROUTES.STUDENTS}
            className="inline-flex items-center gap-1 hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Student Directory
          </Link>
          <span>/</span>
          <span className="text-slate-200 font-medium truncate max-w-xs sm:max-w-md">
            {loading ? 'Loading...' : student?.full_name}
          </span>
        </div>

        <button
          onClick={fetchStudentDetail}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Student Profile Card */}
      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 animate-pulse space-y-4">
          <div className="h-4 bg-slate-800 rounded w-24" />
          <div className="h-7 bg-slate-800 rounded w-1/3" />
          <div className="h-4 bg-slate-800 rounded w-1/2" />
        </div>
      ) : student ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 font-mono text-[11px] font-semibold">
                  <GraduationCap className="w-3.5 h-3.5" />
                  Assigned Learner
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[11px] font-medium capitalize">
                  {student.student_status}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-semibold text-white tracking-tight">
                {student.full_name}
              </h1>
              <p className="text-xs font-mono text-slate-400 mt-1">
                Account: <span className="text-slate-200">{student.account_email}</span>
              </p>
            </div>
          </div>

          {/* Student Demographics & Academic Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-800/80">
            <div className="space-y-1">
              <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">School & Grade</div>
              <div className="text-xs text-white font-medium flex items-center gap-1.5">
                <School className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">
                  {student.school_name || 'School Not Recorded'}
                  {student.current_grade ? ` (Grade ${student.current_grade})` : ''}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Date of Birth & Gender</div>
              <div className="text-xs text-white font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>
                  {student.date_of_birth || 'Not Recorded'}
                  {student.gender ? ` · ${student.gender}` : ''}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Guardian Contact</div>
              <div className="text-xs text-white font-medium">
                <div>{student.guardian_name || 'No guardian listed'}</div>
                {(student.guardian_phone || student.guardian_email) && (
                  <div className="text-[11px] text-slate-400 flex flex-col gap-0.5 mt-1 font-mono">
                    {student.guardian_phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-2.5 h-2.5" />
                        {student.guardian_phone}
                      </span>
                    )}
                    {student.guardian_email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-2.5 h-2.5" />
                        {student.guardian_email}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Residential Address</div>
              <div className="text-xs text-slate-300 flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                <span className="line-clamp-2">{student.address || 'Address not recorded.'}</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Cohort Assignments Under You */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            Active Cohort Assignments With You
            <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
              {enrollments.length}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Teaching cohorts instructed by you where this student is actively enrolled.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {enrollments.map((enr) => (
            <Link
              key={enr.enrollment_id}
              to={APP_ROUTES.BATCH_DETAIL(enr.batch_id)}
              className="group block p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60">
                  {enr.program_name}
                </span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/80 capitalize">
                  {enr.enrollment_status}
                </span>
              </div>

              <h3 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors flex items-center justify-between">
                <span>{enr.batch_name}</span>
                <span className="text-xs text-slate-500 group-hover:text-emerald-400 font-normal">
                  View Batch &rarr;
                </span>
              </h3>

              <div className="mt-2 text-xs text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>{enr.batch_schedule}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  <span>Enrolled: {enr.enrollment_date}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Upcoming Pedagogical Extensions Notice */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div>
          <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1">
            Pedagogical Tracking Modules
          </h2>
          <p className="text-xs text-slate-400">
            Attendance sessions, exam evaluations, and pastoral notes for this learner will unlock in subsequent phases.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <div className="flex items-center gap-2 mb-2 text-slate-400">
              <CalendarCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-slate-200">Attendance Log</span>
              <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                Phase 2B.2
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Session attendance records and absenteeism logs will connect here in Phase 2B.2.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <div className="flex items-center gap-2 mb-2 text-slate-400">
              <Award className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-semibold text-slate-200">Academic Assessments</span>
              <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                Phase 2B.3
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Graded tests, rubric evaluations, and matrix scores will connect here in Phase 2B.3.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <div className="flex items-center gap-2 mb-2 text-slate-400">
              <MessageSquareQuote className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-semibold text-slate-200">Pastoral Notes</span>
              <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                Phase 2B.4
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Confidential teacher observations and commendations will connect here in Phase 2B.4.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
