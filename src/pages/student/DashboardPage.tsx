import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useStudentData } from '../../hooks/useStudentData';
import { ROUTES } from '../../routes/paths';
import {
  BookOpen,
  CalendarCheck,
  Award,
  TrendingUp,
  MessageSquareQuote,
  FileText,
  User,
  ArrowRight,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Clock,
  CheckCircle2,
  Calendar,
  GraduationCap,
} from 'lucide-react';

export interface StudentDashboardData {
  student: {
    id: string;
    fullName: string;
    email: string;
    accountStatus: string;
  };
  enrollment: {
    id: string;
    startDate: string;
    status: string;
  } | null;
  program: {
    id: string;
    name: string;
    level: string;
    duration: string;
  } | null;
  batch: {
    id: string;
    name: string;
    schedule: string;
    startDate: string;
  } | null;
  teacher: {
    id: string;
    name: string;
    qualification: string;
    specialization: string;
  } | null;
  attendanceSummary: {
    totalSessions: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    attendanceRate: number | null;
  };
  academicSummary: {
    totalAssessments: number;
    completedAssessments: number;
    latestAssessment: {
      title: string;
      score: number;
      maxScore: number;
      percentage: number;
      date: string;
      remarks: string | null;
    } | null;
  };
  recentFeedback: Array<{
    id: string;
    teacherName: string;
    noteType: string;
    content: string;
    createdDate: string;
  }>;
}

export const StudentDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { data, isLoading, error, refetch } = useStudentData<StudentDashboardData>('/api/student/dashboard');

  const firstName = data?.student?.fullName
    ? data.student.fullName.split(' ')[0]
    : user?.fullName
    ? user.fullName.split(' ')[0]
    : 'Student';

  // Format date helper
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? dateStr
      : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Loading Skeleton State
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading student dashboard">
        {/* Welcome Skeleton */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
          <div className="h-4 w-32 bg-slate-200 rounded-full mb-3"></div>
          <div className="h-8 w-64 bg-slate-200 rounded-lg mb-4"></div>
          <div className="h-4 w-48 bg-slate-200 rounded-full"></div>
        </div>

        {/* Top Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 h-64"></div>
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 h-64"></div>
        </div>

        {/* Bottom Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 h-56"></div>
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 h-56"></div>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !data) {
    return (
      <div className="p-8 max-w-xl mx-auto my-12 bg-white rounded-3xl border border-rose-200 shadow-sm text-center">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-display font-bold text-slate-800 mb-2">
          Unable to Load Student Dashboard
        </h2>
        <p className="text-xs text-slate-600 mb-6 font-body leading-relaxed">
          {error || 'An error occurred while connecting to your academic records. Please verify your connection and try again.'}
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-leaf hover:bg-brand-leaf-dark text-white rounded-full text-xs font-display font-bold shadow-xs transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  const { student, enrollment, program, batch, teacher, attendanceSummary, academicSummary, recentFeedback } = data;

  return (
    <div className="space-y-6">
      {/* ----------------------------------------------------------------- */}
      {/* 1. WELCOME / STUDENT HEADER                                       */}
      {/* ----------------------------------------------------------------- */}
      <div className="bg-gradient-to-br from-brand-blue via-brand-blue-dark to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-card relative overflow-hidden">
        {/* Decorative corner glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-brand-yellow/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-brand-leaf/20 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold font-mono bg-white/10 text-emerald-300 border border-white/10 backdrop-blur-xs">
                <Sparkles className="w-3 h-3 text-amber-300" />
                Active Student Portal
              </span>
              <span className="text-xs text-slate-300 font-mono hidden sm:inline">
                • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-white">
              Welcome back, {firstName}!
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 font-body max-w-xl">
              {program ? (
                <>
                  Enrolled in <span className="font-semibold text-amber-300">{program.name}</span> — {batch?.name || 'Assigned Cohort'}. Keep up the steady, confident practice!
                </>
              ) : (
                'Review your program schedule, attendance history, and mentor notes below.'
              )}
            </p>
          </div>

          {/* Student Dossier Badge in Header */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3.5 shrink-0 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-leaf text-white font-display font-bold text-sm flex items-center justify-center shadow-xs">
              {student.fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'ST'}
            </div>
            <div className="min-w-0 text-left">
              <p className="text-xs font-bold font-display text-white truncate max-w-[160px]">
                {student.fullName}
              </p>
              <p className="text-[10px] text-slate-300 font-mono truncate max-w-[160px]">
                {student.email}
              </p>
              <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold font-mono bg-emerald-500/20 text-emerald-300">
                STATUS: {student.accountStatus.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 2. PROGRAM & COHORT CARD                                          */}
      {/* ----------------------------------------------------------------- */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 text-brand-blue flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-display font-bold text-slate-900">Current Program & Cohort</h2>
              <p className="text-xs text-slate-500 font-body">Your active learning curriculum and assigned faculty</p>
            </div>
          </div>

          <Link
            to={ROUTES.STUDENT.PROGRAM}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-leaf hover:text-brand-leaf-dark transition-colors self-start sm:self-auto"
          >
            <span>View My Program</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {enrollment && program ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-5">
            {/* Program Details */}
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono mb-1">
                Program
              </span>
              <p className="text-sm font-bold font-display text-brand-blue truncate">{program.name}</p>
              <p className="text-xs text-slate-600 mt-1">{program.level || 'Foundational'} • {program.duration || 'Flexible'}</p>
            </div>

            {/* Batch Cohort */}
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono mb-1">
                Cohort / Batch
              </span>
              <p className="text-sm font-bold font-display text-slate-800 truncate">{batch?.name || 'Class Cohort'}</p>
              <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{batch?.schedule || 'Schedule pending'}</span>
              </div>
            </div>

            {/* Assigned Teacher */}
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono mb-1">
                Assigned Instructor
              </span>
              <p className="text-sm font-bold font-display text-slate-800 truncate">{teacher?.name || 'Instructor Assigned'}</p>
              <p className="text-xs text-slate-500 mt-1 truncate">{teacher?.specialization || teacher?.qualification || 'Certified Faculty'}</p>
            </div>

            {/* Enrollment Status */}
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono mb-1">
                Enrollment Date
              </span>
              <p className="text-sm font-bold font-display text-slate-800">{formatDate(enrollment.startDate)}</p>
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium mt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="capitalize">{enrollment.status} Enrollment</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 mt-4">
            <GraduationCap className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">No Active Enrollment Record</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Your student account is active, but an enrollment record has not been linked yet. Please contact the admissions office.
            </p>
          </div>
        )}
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 3. CORE METRICS GRID (ATTENDANCE & ASSESSMENTS)                  */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ATTENDANCE CARD */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-display font-bold text-slate-900">Attendance</h2>
                  <p className="text-xs text-slate-500 font-body">Session presence & regularity record</p>
                </div>
              </div>

              <Link
                to={ROUTES.STUDENT.ATTENDANCE}
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-leaf hover:text-brand-leaf-dark transition-colors"
              >
                <span>View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="pt-5">
              {attendanceSummary.totalSessions > 0 && attendanceSummary.attendanceRate !== null ? (
                <div className="space-y-4">
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-display font-extrabold text-brand-blue tracking-tight">
                      {attendanceSummary.attendanceRate}%
                    </span>
                    <span className="text-xs text-slate-500 font-body">
                      regularity over {attendanceSummary.totalSessions} sessions
                    </span>
                  </div>

                  {/* Attendance Breakdown Counters */}
                  <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-center">
                    <div className="p-2 rounded-xl bg-emerald-50/60 border border-emerald-100">
                      <span className="block text-xs font-bold text-emerald-800">{attendanceSummary.present}</span>
                      <span className="text-[10px] text-emerald-600 font-medium">Present</span>
                    </div>
                    <div className="p-2 rounded-xl bg-amber-50/60 border border-amber-100">
                      <span className="block text-xs font-bold text-amber-800">{attendanceSummary.late}</span>
                      <span className="text-[10px] text-amber-600 font-medium">Late</span>
                    </div>
                    <div className="p-2 rounded-xl bg-rose-50/60 border border-rose-100">
                      <span className="block text-xs font-bold text-rose-800">{attendanceSummary.absent}</span>
                      <span className="text-[10px] text-rose-600 font-medium">Absent</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="block text-xs font-bold text-slate-700">{attendanceSummary.excused}</span>
                      <span className="text-[10px] text-slate-500 font-medium">Excused</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Honest Empty State for Attendance */
                <div className="py-6 text-center bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                  <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">No Recorded Sessions Yet</p>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto px-4 leading-relaxed">
                    Attendance records will appear here once classroom sessions are recorded by your instructor.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-mono">
            Formula: (Present + Late) / Total Sessions
          </div>
        </div>

        {/* ASSESSMENTS CARD */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 text-amber-700 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-display font-bold text-slate-900">Assessments</h2>
                  <p className="text-xs text-slate-500 font-body">Examinations, tests & evaluations</p>
                </div>
              </div>

              <Link
                to={ROUTES.STUDENT.ASSESSMENTS}
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-leaf hover:text-brand-leaf-dark transition-colors"
              >
                <span>View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="pt-5">
              {academicSummary.completedAssessments > 0 && academicSummary.latestAssessment ? (
                <div className="space-y-4">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-slate-400 font-mono uppercase tracking-wider block">Completed</span>
                      <span className="text-2xl font-display font-bold text-brand-blue">
                        {academicSummary.completedAssessments}
                      </span>
                      {academicSummary.totalAssessments > 0 && (
                        <span className="text-xs text-slate-400"> of {academicSummary.totalAssessments} Assigned</span>
                      )}
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Latest: {academicSummary.latestAssessment.percentage}%
                    </span>
                  </div>

                  {/* Latest Assessment Preview */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-800 truncate">{academicSummary.latestAssessment.title}</span>
                      <span className="font-mono text-slate-500">{formatDate(academicSummary.latestAssessment.date)}</span>
                    </div>
                    <p className="text-xs text-slate-600 font-mono">
                      Score: <span className="font-bold text-brand-blue">{academicSummary.latestAssessment.score}</span> / {academicSummary.latestAssessment.maxScore}
                    </p>
                    {academicSummary.latestAssessment.remarks && (
                      <p className="text-[11px] text-slate-500 mt-1 italic line-clamp-1">
                        "{academicSummary.latestAssessment.remarks}"
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                /* Honest Empty State for Assessments */
                <div className="py-6 text-center bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                  <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">No Assessments Recorded Yet</p>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto px-4 leading-relaxed">
                    Evaluations, test scores, and performance feedback will appear here as tests are completed.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-mono">
            Read-only examination record
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 4. RECENT TEACHER FEEDBACK & PROGRESS PREVIEW                     */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RECENT FEEDBACK (2 cols on lg) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-100 text-purple-700 flex items-center justify-center">
                  <MessageSquareQuote className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-display font-bold text-slate-900">Recent Teacher Feedback</h2>
                  <p className="text-xs text-slate-500 font-body">Personalized mentor observations and formative guidance</p>
                </div>
              </div>

              <Link
                to={ROUTES.STUDENT.FEEDBACK}
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-leaf hover:text-brand-leaf-dark transition-colors"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="pt-5">
              {recentFeedback.length > 0 ? (
                <div className="space-y-3">
                  {recentFeedback.map((note) => (
                    <div key={note.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-brand-blue font-display">{note.teacherName}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-purple-100/60 text-purple-800 capitalize">
                            {note.noteType}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">{formatDate(note.createdDate)}</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed font-body">
                        "{note.content}"
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                /* Honest Empty State for Feedback */
                <div className="py-8 text-center bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                  <MessageSquareQuote className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">No Teacher Feedback Yet</p>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto px-4 leading-relaxed">
                    Evaluations, constructive recommendations, and remarks will be recorded by your instructors as classroom sessions progress.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-mono">
            Exclusively viewable by you and your authorized instructors
          </div>
        </div>

        {/* PROGRESS PREVIEW CARD (1 col on lg) */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-display font-bold text-slate-900">Academic Progress</h2>
                <p className="text-xs text-slate-500 font-body">Milestone tracking</p>
              </div>
            </div>

            <div className="pt-5 space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono mb-1">
                  Trajectory Status
                </span>
                <p className="text-xs text-slate-600 font-body leading-relaxed">
                  Academic progress will appear as your learning records and graded assessments are updated.
                </p>
              </div>

              <div className="space-y-2 text-xs text-slate-500 font-mono">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Enrolled Program:</span>
                  <span className="font-bold text-slate-700">{program?.name || '—'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Class Regularity:</span>
                  <span className="font-bold text-slate-700">
                    {attendanceSummary.attendanceRate !== null ? `${attendanceSummary.attendanceRate}%` : 'Pending Sessions'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Completed Tests:</span>
                  <span className="font-bold text-slate-700">{academicSummary.completedAssessments}</span>
                </div>
              </div>
            </div>
          </div>

          <Link
            to={ROUTES.STUDENT.PROGRESS}
            className="mt-6 flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200/80 text-brand-blue font-display font-bold text-xs rounded-xl transition-colors"
          >
            <span>View Progress Trajectory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 5. QUICK ACTION NAVIGATION TILES                                  */}
      {/* ----------------------------------------------------------------- */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
        <h2 className="text-sm font-display font-bold text-slate-900 mb-4">
          Quick Portal Navigation
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            to={ROUTES.STUDENT.PROGRAM}
            className="p-3.5 rounded-2xl bg-slate-50 hover:bg-brand-cream/50 border border-slate-100 hover:border-brand-yellow/50 transition-all text-center group"
          >
            <BookOpen className="w-5 h-5 text-brand-blue group-hover:scale-110 transition-transform mx-auto mb-2" />
            <span className="block text-xs font-bold text-slate-800">My Program</span>
            <span className="text-[10px] text-slate-400 font-mono">Curriculum</span>
          </Link>

          <Link
            to={ROUTES.STUDENT.ATTENDANCE}
            className="p-3.5 rounded-2xl bg-slate-50 hover:bg-brand-cream/50 border border-slate-100 hover:border-brand-yellow/50 transition-all text-center group"
          >
            <CalendarCheck className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform mx-auto mb-2" />
            <span className="block text-xs font-bold text-slate-800">Attendance</span>
            <span className="text-[10px] text-slate-400 font-mono">Presence</span>
          </Link>

          <Link
            to={ROUTES.STUDENT.ASSESSMENTS}
            className="p-3.5 rounded-2xl bg-slate-50 hover:bg-brand-cream/50 border border-slate-100 hover:border-brand-yellow/50 transition-all text-center group"
          >
            <Award className="w-5 h-5 text-amber-600 group-hover:scale-110 transition-transform mx-auto mb-2" />
            <span className="block text-xs font-bold text-slate-800">Assessments</span>
            <span className="text-[10px] text-slate-400 font-mono">Test Scores</span>
          </Link>

          <Link
            to={ROUTES.STUDENT.PROGRESS}
            className="p-3.5 rounded-2xl bg-slate-50 hover:bg-brand-cream/50 border border-slate-100 hover:border-brand-yellow/50 transition-all text-center group"
          >
            <TrendingUp className="w-5 h-5 text-teal-600 group-hover:scale-110 transition-transform mx-auto mb-2" />
            <span className="block text-xs font-bold text-slate-800">Progress</span>
            <span className="text-[10px] text-slate-400 font-mono">Milestones</span>
          </Link>

          <Link
            to={ROUTES.STUDENT.DOCUMENTS}
            className="p-3.5 rounded-2xl bg-slate-50 hover:bg-brand-cream/50 border border-slate-100 hover:border-brand-yellow/50 transition-all text-center group"
          >
            <FileText className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform mx-auto mb-2" />
            <span className="block text-xs font-bold text-slate-800">Documents</span>
            <span className="text-[10px] text-slate-400 font-mono">Certificates</span>
          </Link>

          <Link
            to={ROUTES.STUDENT.PROFILE}
            className="p-3.5 rounded-2xl bg-slate-50 hover:bg-brand-cream/50 border border-slate-100 hover:border-brand-yellow/50 transition-all text-center group"
          >
            <User className="w-5 h-5 text-slate-700 group-hover:scale-110 transition-transform mx-auto mb-2" />
            <span className="block text-xs font-bold text-slate-800">My Profile</span>
            <span className="text-[10px] text-slate-400 font-mono">Dossier</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
