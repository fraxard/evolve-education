import React, { useEffect, useState, useMemo } from 'react';
import {
  Search,
  RefreshCw,
  X,
  Eye,
  ArrowRightLeft,
  Clock,
  BookOpen,
  Phone,
  Mail,
  Calendar,
  School,
  MapPin,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface StudentListItem {
  id: string;
  full_name: string;
  date_of_birth: string;
  guardian_name: string;
  guardian_phone: string;
  guardian_email: string;
  student_status: string;
  created_at: string;
  account_email: string;
  account_status: string;
  program_name: string | null;
  batch_name: string | null;
  teacher_name: string | null;
}

interface EnrollmentHistoryItem {
  id: string;
  program_id: string;
  program_name: string;
  batch_id: string;
  batch_name: string;
  batch_schedule?: string;
  schedule?: string;
  teacher_id: string;
  teacher_name: string;
  teacher_email?: string;
  status: 'active' | 'completed' | 'transferred' | 'withdrawn' | string;
  start_date: string;
  created_at?: string;
}

interface StudentDetail {
  id: string;
  user_id: string;
  full_name: string;
  date_of_birth: string;
  gender?: string | null;
  guardian_name: string;
  guardian_phone: string;
  guardian_email: string;
  guardian_relation?: string | null;
  address?: string | null;
  school_name?: string | null;
  current_grade?: string | null;
  status: string;
  account_email: string;
  account_status: string;
  last_login_at?: string | null;
  created_at: string;
  enrollments: EnrollmentHistoryItem[];
  academicOverview?: {
    attendance?: { total_sessions: number; present_sessions: number };
    recentAssessments?: Array<{ title: string; score: number; max_score: number; created_at: string }>;
  };
}

interface ProgramOption {
  id: string;
  name: string;
  is_active: boolean;
}

interface BatchOption {
  id: string;
  name: string;
  program_id: string;
  program_name?: string;
  teacher_id?: string;
  teacher_name?: string;
  capacity: number;
  enrolled_student_count: number;
  is_active: boolean;
}

interface TeacherOption {
  id: string;
  full_name: string;
  status: string;
}

export const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Dossier state
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [studentDetail, setStudentDetail] = useState<StudentDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Transfer modal state
  const [transferModalStudent, setTransferModalStudent] = useState<StudentListItem | StudentDetail | null>(null);
  const [transferProgramId, setTransferProgramId] = useState('');
  const [transferBatchId, setTransferBatchId] = useState('');
  const [transferTeacherId, setTransferTeacherId] = useState('');
  const [transferEffectiveDate, setTransferEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [transferReason, setTransferReason] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);

  // Status transition modal state
  const [statusModalStudent, setStatusModalStudent] = useState<StudentListItem | StudentDetail | null>(null);
  const [targetAction, setTargetAction] = useState<'suspend' | 'withdraw' | 'graduate' | 'activate'>('suspend');
  const [statusReason, setStatusReason] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  // Metadata options for modals
  const [programs, setPrograms] = useState<ProgramOption[]>([]);
  const [batches, setBatches] = useState<BatchOption[]>([]);
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);

  // Flash notifications
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/students', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
      }
    } catch (err) {
      console.error('Failed to fetch students', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [progRes, batchRes, teachRes] = await Promise.all([
        fetch('/api/programs', { credentials: 'include' }),
        fetch('/api/batches', { credentials: 'include' }),
        fetch('/api/teachers', { credentials: 'include' }),
      ]);
      if (progRes.ok) {
        const d = await progRes.json();
        setPrograms(d.programs || []);
      }
      if (batchRes.ok) {
        const d = await batchRes.json();
        setBatches(d.batches || []);
      }
      if (teachRes.ok) {
        const d = await teachRes.json();
        setTeachers(d.teachers || []);
      }
    } catch (err) {
      console.error('Failed to load operational metadata', err);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchMetadata();
  }, []);

  const openStudentModal = async (id: string) => {
    setSelectedStudentId(id);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/students/${id}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setStudentDetail({
          ...data.student,
          enrollments: data.enrollments || [],
          academicOverview: data.academicOverview,
        });
      }
    } catch (err) {
      console.error('Failed to load student detail', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const openTransferModal = (student: StudentListItem | StudentDetail) => {
    setTransferModalStudent(student);
    setTransferProgramId('');
    setTransferBatchId('');
    setTransferTeacherId('');
    setTransferEffectiveDate(new Date().toISOString().split('T')[0]);
    setTransferReason('');
    setTransferError(null);
  };

  const openStatusModal = (student: StudentListItem | StudentDetail) => {
    setStatusModalStudent(student);
    const currStatus = ('student_status' in student ? student.student_status : student.status) || 'active';
    if (currStatus === 'active') {
      setTargetAction('suspend');
    } else {
      setTargetAction('activate');
    }
    setStatusReason('');
    setStatusError(null);
  };

  // Handle program change in transfer modal: update available batches and set default teacher
  const handleTransferProgramChange = (progId: string) => {
    setTransferProgramId(progId);
    setTransferBatchId('');
    setTransferTeacherId('');
  };

  const handleTransferBatchChange = (batchId: string) => {
    setTransferBatchId(batchId);
    const selectedBatch = batches.find((b) => b.id === batchId);
    if (selectedBatch && selectedBatch.teacher_id) {
      setTransferTeacherId(selectedBatch.teacher_id);
    }
  };

  const handleExecuteTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferModalStudent) return;

    if (!transferProgramId) {
      setTransferError('Please select a target program.');
      return;
    }
    if (!transferBatchId) {
      setTransferError('Please select a target cohort batch.');
      return;
    }
    if (!transferTeacherId) {
      setTransferError('Please select a supervising faculty member.');
      return;
    }
    if (!transferReason.trim() || transferReason.trim().length < 3) {
      setTransferError('Formal transfer rationale (minimum 3 characters) is required.');
      return;
    }

    setTransferLoading(true);
    setTransferError(null);

    try {
      const res = await fetch(`/api/students/${transferModalStudent.id}/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          targetProgramId: transferProgramId,
          targetBatchId: transferBatchId,
          targetTeacherId: transferTeacherId,
          effectiveDate: transferEffectiveDate,
          reason: transferReason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setTransferError(data.error || 'Failed to execute cohort transfer.');
        return;
      }

      showNotification('success', `Transfer successful: ${transferModalStudent.full_name} moved to ${data.transfer.batchName}.`);
      setTransferModalStudent(null);
      await fetchStudents();
      await fetchMetadata();
      if (selectedStudentId === transferModalStudent.id) {
        await openStudentModal(transferModalStudent.id);
      }
    } catch (err: any) {
      setTransferError(err.message || 'Network error executing transfer.');
    } finally {
      setTransferLoading(false);
    }
  };

  const handleExecuteStatusChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusModalStudent) return;

    if (['suspend', 'withdraw'].includes(targetAction) && (!statusReason || statusReason.trim().length < 3)) {
      setStatusError(`A formal administrative rationale (minimum 3 characters) is required to ${targetAction} a student.`);
      return;
    }

    setStatusLoading(true);
    setStatusError(null);

    try {
      const res = await fetch(`/api/students/${statusModalStudent.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: targetAction,
          reason: statusReason.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setStatusError(data.error || 'Failed to update student lifecycle status.');
        return;
      }

      showNotification('success', data.message || 'Student lifecycle status successfully updated.');
      setStatusModalStudent(null);
      await fetchStudents();
      if (selectedStudentId === statusModalStudent.id) {
        await openStudentModal(statusModalStudent.id);
      }
    } catch (err: any) {
      setStatusError(err.message || 'Network error updating student status.');
    } finally {
      setStatusLoading(false);
    }
  };

  const filteredStudents = useMemo(() => {
    let result = students;
    if (statusFilter !== 'all') {
      result = result.filter((s) => (s.student_status || s.account_status) === statusFilter);
    }
    if (!searchQuery.trim()) return result;
    const q = searchQuery.toLowerCase();
    return result.filter(
      (s) =>
        s.full_name?.toLowerCase().includes(q) ||
        s.account_email?.toLowerCase().includes(q) ||
        s.guardian_name?.toLowerCase().includes(q) ||
        s.program_name?.toLowerCase().includes(q) ||
        s.batch_name?.toLowerCase().includes(q)
    );
  }, [students, searchQuery, statusFilter]);

  // Batches filtered by selected transfer program
  const availableTargetBatches = useMemo(() => {
    if (!transferProgramId) return [];
    return batches.filter((b) => b.program_id === transferProgramId && b.is_active);
  }, [batches, transferProgramId]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'suspended':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'withdrawn':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'graduated':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'inactive':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'transferred':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
        <div>
          <h1 className="text-base font-semibold text-slate-900 tracking-tight">
            Institutional Student Registry
          </h1>
          <p className="text-xs text-slate-500">
            Enrolled student profiles, academic lifecycle transitions, and cohort mobility management.
          </p>
        </div>

        <button
          onClick={() => {
            fetchStudents();
            fetchMetadata();
          }}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 rounded text-xs font-medium text-slate-700 shadow-xs transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          className={`p-3 rounded-lg border text-xs flex items-center justify-between transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-600 ml-3"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student, guardian, program, batch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded text-xs text-slate-700 px-2 py-1 focus:bg-white focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="withdrawn">Withdrawn</option>
            <option value="graduated">Graduated</option>
          </select>

          <div className="text-[11px] font-mono text-slate-500 whitespace-nowrap">
            Showing <span className="font-semibold text-slate-800">{filteredStudents.length}</span> of{' '}
            <span className="font-semibold text-slate-800">{students.length}</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-500 flex flex-col items-center justify-center">
            <RefreshCw className="w-4 h-4 animate-spin text-slate-600 mb-2" />
            <span>Loading student registry records...</span>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No enrolled student records found matching query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-[10px] font-mono uppercase text-slate-400">
                  <th className="py-2.5 px-3.5 font-medium">Student & Account</th>
                  <th className="py-2.5 px-3 font-medium">Current Program & Cohort</th>
                  <th className="py-2.5 px-3 font-medium">Supervising Faculty</th>
                  <th className="py-2.5 px-3 font-medium">Lifecycle Status</th>
                  <th className="py-2.5 px-3 font-medium">Enrolled Date</th>
                  <th className="py-2.5 px-3.5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((stu) => {
                  const currentStatus = stu.student_status || stu.account_status;
                  return (
                    <tr key={stu.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3.5 font-medium text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span>{stu.full_name}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-normal font-mono">
                          {stu.account_email}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">
                        <div className="font-medium text-slate-800">{stu.program_name || '—'}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {stu.batch_name ? `Batch: ${stu.batch_name}` : 'No active batch'}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {stu.teacher_name || <span className="text-slate-400 italic">Unassigned</span>}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium uppercase font-mono border ${getStatusBadge(
                            currentStatus
                          )}`}
                        >
                          {currentStatus}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {new Date(stu.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-2.5 px-3.5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => openStudentModal(stu.id)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded text-[11px] transition-colors inline-flex items-center gap-1"
                            title="View Full Student Dossier"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Dossier</span>
                          </button>
                          <button
                            onClick={() => openTransferModal(stu)}
                            disabled={currentStatus !== 'active'}
                            className={`px-2 py-1 rounded text-[11px] font-medium inline-flex items-center gap-1 transition-colors ${
                              currentStatus === 'active'
                                ? 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                                : 'bg-slate-50 text-slate-300 cursor-not-allowed'
                            }`}
                            title={
                              currentStatus === 'active'
                                ? 'Transfer to another cohort batch'
                                : 'Only active students can be transferred'
                            }
                          >
                            <ArrowRightLeft className="w-3 h-3" />
                            <span>Transfer</span>
                          </button>
                          <button
                            onClick={() => openStatusModal(stu)}
                            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 font-medium rounded text-[11px] transition-colors inline-flex items-center gap-1"
                            title="Update Student Lifecycle Status"
                          >
                            <Clock className="w-3 h-3" />
                            <span>Status</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. STUDENT DOSSIER MODAL                                      */}
      {/* ------------------------------------------------------------- */}
      {selectedStudentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl border border-slate-300 max-w-2xl w-full max-h-[92vh] flex flex-col my-6">
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-xl">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase text-slate-400">Institutional Dossier</span>
                  {studentDetail && (
                    <span
                      className={`inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-mono uppercase border ${getStatusBadge(
                        studentDetail.status
                      )}`}
                    >
                      {studentDetail.status}
                    </span>
                  )}
                </div>
                <h2 className="text-sm font-semibold text-slate-900 mt-0.5">
                  {studentDetail ? studentDetail.full_name : 'Loading...'}
                </h2>
              </div>
              <button
                onClick={() => {
                  setSelectedStudentId(null);
                  setStudentDetail(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
              {detailLoading || !studentDetail ? (
                <div className="py-12 text-center text-slate-500">
                  <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2 text-slate-600" />
                  <span>Loading student record...</span>
                </div>
              ) : (
                <>
                  {/* Identity & Account Card */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">
                      Student Identity & Educational Profile
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-mono">Date of Birth</span>
                        <span className="font-medium text-slate-800 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {studentDetail.date_of_birth || '—'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-mono">Gender</span>
                        <span className="font-medium text-slate-800 mt-0.5 block capitalize">
                          {studentDetail.gender || '—'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-mono">Current Grade</span>
                        <span className="font-medium text-slate-800 flex items-center gap-1 mt-0.5">
                          <School className="w-3 h-3 text-slate-400" />
                          {studentDetail.current_grade || '—'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-mono">School / College</span>
                        <span className="font-medium text-slate-800 mt-0.5 block">
                          {studentDetail.school_name || '—'}
                        </span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-slate-400 block text-[10px] uppercase font-mono">Address</span>
                        <span className="font-medium text-slate-800 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{studentDetail.address || '—'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Guardian Contact Card */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">
                      Guardian Supervision Contact
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-mono">Guardian Name</span>
                        <span className="font-medium text-slate-800 mt-0.5 block">
                          {studentDetail.guardian_name}{' '}
                          {studentDetail.guardian_relation && (
                            <span className="text-[10px] text-slate-400 font-normal">
                              ({studentDetail.guardian_relation})
                            </span>
                          )}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-mono">Phone Number</span>
                        <span className="font-mono text-slate-800 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {studentDetail.guardian_phone || '—'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-mono">Email Address</span>
                        <span className="font-mono text-slate-800 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {studentDetail.guardian_email || '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Account Metadata */}
                  <div className="p-3 bg-white border border-slate-200 rounded-lg grid grid-cols-2 gap-3 text-slate-600">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-mono">Platform User ID</span>
                      <span className="font-mono text-[11px] text-slate-700">{studentDetail.user_id}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-mono">Account Email</span>
                      <span className="font-mono text-[11px] text-slate-800">{studentDetail.account_email}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-mono">Account Status</span>
                      <span className="font-mono text-[11px] text-slate-700 capitalize">
                        {studentDetail.account_status}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-mono">Enrolled Since</span>
                      <span className="font-mono text-[11px] text-slate-700">
                        {new Date(studentDetail.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Complete Enrollment History */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">
                        Enrollment History & Mobility Records ({studentDetail.enrollments?.length || 0})
                      </span>
                    </div>

                    {(!studentDetail.enrollments || studentDetail.enrollments.length === 0) ? (
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded text-center text-slate-400 text-xs">
                        No enrollment records registered for this student.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {studentDetail.enrollments.map((enr) => (
                          <div
                            key={enr.id}
                            className={`p-3 rounded-lg border transition-colors ${
                              enr.status === 'active'
                                ? 'bg-emerald-50/40 border-emerald-200'
                                : 'bg-white border-slate-200 opacity-90'
                            }`}
                          >
                            <div className="flex items-center justify-between font-semibold text-slate-900">
                              <div className="flex items-center gap-1.5">
                                <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                                <span>{enr.program_name}</span>
                              </div>
                              <span
                                className={`font-mono text-[10px] uppercase px-1.5 py-0.5 rounded border ${getStatusBadge(
                                  enr.status
                                )}`}
                              >
                                {enr.status}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mt-2 text-[11px] text-slate-600">
                              <div>
                                <span className="text-slate-400 block text-[9px] uppercase font-mono">Cohort Batch</span>
                                <span className="font-medium text-slate-800">
                                  {enr.batch_name} {enr.schedule || enr.batch_schedule ? `(${enr.schedule || enr.batch_schedule})` : ''}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[9px] uppercase font-mono">Supervising Faculty</span>
                                <span className="text-slate-700">
                                  {enr.teacher_name || 'Unassigned'}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[9px] uppercase font-mono">Start / Effective Date</span>
                                <span className="font-mono text-slate-600">
                                  {enr.start_date || (enr.created_at ? new Date(enr.created_at).toLocaleDateString() : '—')}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer / Actions */}
            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between rounded-b-xl">
              <div className="flex items-center gap-2">
                {studentDetail && (
                  <>
                    <button
                      onClick={() => openTransferModal(studentDetail)}
                      disabled={studentDetail.status !== 'active'}
                      className={`px-2.5 py-1.5 rounded text-xs font-medium inline-flex items-center gap-1.5 transition-colors ${
                        studentDetail.status === 'active'
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      <span>Transfer Cohort</span>
                    </button>
                    <button
                      onClick={() => openStatusModal(studentDetail)}
                      className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Change Status</span>
                    </button>
                  </>
                )}
              </div>

              <button
                onClick={() => {
                  setSelectedStudentId(null);
                  setStudentDetail(null);
                }}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold shadow-xs"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. COHORT TRANSFER MODAL                                      */}
      {/* ------------------------------------------------------------- */}
      {transferModalStudent && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl border border-slate-300 max-w-lg w-full p-5 my-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 text-blue-700 rounded">
                  <ArrowRightLeft className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-semibold text-slate-900">Transfer Student Cohort</h2>
                  <p className="text-[10px] text-slate-500">
                    Transactional cohort reassignment with historical preservation.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTransferModalStudent(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {transferError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{transferError}</span>
              </div>
            )}

            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-1">
              <div className="font-semibold text-slate-900">{transferModalStudent.full_name}</div>
              <div className="text-slate-500 font-mono text-[11px]">
                Current Cohort: {('batch_name' in transferModalStudent ? transferModalStudent.batch_name : null) || 'None'} • Program: {('program_name' in transferModalStudent ? transferModalStudent.program_name : null) || 'None'}
              </div>
            </div>

            <form onSubmit={handleExecuteTransfer} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Target Academic Program *
                </label>
                <select
                  value={transferProgramId}
                  onChange={(e) => handleTransferProgramChange(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="">Select target program...</option>
                  {programs
                    .filter((p) => p.is_active)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Target Cohort Batch *
                </label>
                <select
                  value={transferBatchId}
                  onChange={(e) => handleTransferBatchChange(e.target.value)}
                  disabled={!transferProgramId}
                  className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-400"
                  required
                >
                  <option value="">
                    {transferProgramId ? 'Select target cohort batch...' : 'Select a program first...'}
                  </option>
                  {availableTargetBatches.map((b) => {
                    const isFull = b.enrolled_student_count >= b.capacity;
                    return (
                      <option key={b.id} value={b.id} disabled={isFull}>
                        {b.name} ({b.enrolled_student_count}/{b.capacity} seats){isFull ? ' — FULL' : ''}
                      </option>
                    );
                  })}
                </select>
                {transferProgramId && availableTargetBatches.length === 0 && (
                  <p className="text-[10px] text-amber-600 mt-1">
                    No active cohort batches found under this program.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Supervising Faculty Member *
                </label>
                <select
                  value={transferTeacherId}
                  onChange={(e) => setTransferTeacherId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="">Select supervising teacher...</option>
                  {teachers
                    .filter((t) => t.status === 'active')
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.full_name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Effective Transfer Date *
                </label>
                <input
                  type="date"
                  value={transferEffectiveDate}
                  onChange={(e) => setTransferEffectiveDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Administrative Transfer Rationale *
                </label>
                <textarea
                  rows={2}
                  placeholder="State the institutional or academic reason for cohort relocation..."
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setTransferModalStudent(null)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={transferLoading}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded text-xs shadow-xs flex items-center gap-1.5"
                >
                  {transferLoading && <RefreshCw className="w-3 h-3 animate-spin" />}
                  <span>Execute Transfer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. STUDENT LIFECYCLE STATUS TRANSITION MODAL                  */}
      {/* ------------------------------------------------------------- */}
      {statusModalStudent && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl border border-slate-300 max-w-lg w-full p-5 my-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-50 text-amber-700 rounded">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-semibold text-slate-900">Student Lifecycle Transition</h2>
                  <p className="text-[10px] text-slate-500">
                    Explicit state alteration with audit trail logging.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setStatusModalStudent(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {statusError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{statusError}</span>
              </div>
            )}

            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900">{statusModalStudent.full_name}</span>
                <span
                  className={`inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-mono uppercase border ${getStatusBadge(
                    ('student_status' in statusModalStudent ? statusModalStudent.student_status : statusModalStudent.status) || 'active'
                  )}`}
                >
                  Current: {('student_status' in statusModalStudent ? statusModalStudent.student_status : statusModalStudent.status) || 'active'}
                </span>
              </div>
              <div className="text-slate-500 font-mono text-[11px]">
                Account: {('account_email' in statusModalStudent ? statusModalStudent.account_email : '')}
              </div>
            </div>

            <form onSubmit={handleExecuteStatusChange} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1.5">
                  Select Lifecycle Action *
                </label>

                {(() => {
                  const currStatus = ('student_status' in statusModalStudent ? statusModalStudent.student_status : statusModalStudent.status) || 'active';
                  if (currStatus === 'active') {
                    return (
                      <div className="space-y-2">
                        <label className="flex items-start gap-2 p-2.5 border rounded cursor-pointer hover:bg-slate-50 border-amber-200 bg-amber-50/30">
                          <input
                            type="radio"
                            name="lifecycle_action"
                            value="suspend"
                            checked={targetAction === 'suspend'}
                            onChange={() => setTargetAction('suspend')}
                            className="mt-0.5 text-amber-600 focus:ring-amber-500"
                          />
                          <div>
                            <span className="font-semibold text-amber-900 block">Suspend Student</span>
                            <span className="text-[11px] text-amber-700">
                              Temporary disciplinary or administrative hold. Account becomes inactive; enrollments remain intact.
                            </span>
                          </div>
                        </label>

                        <label className="flex items-start gap-2 p-2.5 border rounded cursor-pointer hover:bg-slate-50 border-rose-200 bg-rose-50/30">
                          <input
                            type="radio"
                            name="lifecycle_action"
                            value="withdraw"
                            checked={targetAction === 'withdraw'}
                            onChange={() => setTargetAction('withdraw')}
                            className="mt-0.5 text-rose-600 focus:ring-rose-500"
                          />
                          <div>
                            <span className="font-semibold text-rose-900 block">Withdraw from Institution</span>
                            <span className="text-[11px] text-rose-700">
                              Formal exit from program. Active enrollments are marked as withdrawn and released.
                            </span>
                          </div>
                        </label>

                        <label className="flex items-start gap-2 p-2.5 border rounded cursor-pointer hover:bg-slate-50 border-purple-200 bg-purple-50/30">
                          <input
                            type="radio"
                            name="lifecycle_action"
                            value="graduate"
                            checked={targetAction === 'graduate'}
                            onChange={() => setTargetAction('graduate')}
                            className="mt-0.5 text-purple-600 focus:ring-purple-500"
                          />
                          <div>
                            <span className="font-semibold text-purple-900 block">Graduate Student</span>
                            <span className="text-[11px] text-purple-700">
                              Academic completion of coursework. Active enrollments are marked completed (alumni status).
                            </span>
                          </div>
                        </label>
                      </div>
                    );
                  } else {
                    return (
                      <label className="flex items-start gap-2 p-2.5 border rounded cursor-pointer hover:bg-slate-50 border-emerald-200 bg-emerald-50/30">
                        <input
                          type="radio"
                          name="lifecycle_action"
                          value="activate"
                          checked={targetAction === 'activate'}
                          onChange={() => setTargetAction('activate')}
                          className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                        />
                        <div>
                          <span className="font-semibold text-emerald-900 block">Reactivate Student</span>
                          <span className="text-[11px] text-emerald-700">
                            Restores the student to active standing and enables platform login credentials.
                          </span>
                        </div>
                      </label>
                    );
                  }
                })()}
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Administrative Rationale / Documentation {['suspend', 'withdraw'].includes(targetAction) ? '*' : '(Optional)'}
                </label>
                <textarea
                  rows={2}
                  placeholder={
                    ['suspend', 'withdraw'].includes(targetAction)
                      ? 'State the mandatory formal rationale (minimum 3 characters)...'
                      : 'Add administrative notes or graduation reference (optional)...'
                  }
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                  required={['suspend', 'withdraw'].includes(targetAction)}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setStatusModalStudent(null)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={statusLoading}
                  className={`px-4 py-1.5 font-semibold rounded text-xs shadow-xs flex items-center gap-1.5 text-white ${
                    targetAction === 'suspend'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : targetAction === 'withdraw'
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : targetAction === 'graduate'
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {statusLoading && <RefreshCw className="w-3 h-3 animate-spin" />}
                  <span>
                    Confirm{' '}
                    {targetAction === 'suspend'
                      ? 'Suspension'
                      : targetAction === 'withdraw'
                      ? 'Withdrawal'
                      : targetAction === 'graduate'
                      ? 'Graduation'
                      : 'Reactivation'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
