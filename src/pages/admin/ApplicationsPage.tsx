import React, { useEffect, useState, useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  ArrowRight,
  AlertTriangle,
  X,
  ShieldCheck,
  RefreshCw,
  Eye,
} from 'lucide-react';

interface Application {
  id: string;
  user_id: string;
  account_email: string;
  student_name: string;
  date_of_birth: string;
  gender?: string | null;
  personal_details?: string | null;
  guardian_name: string;
  guardian_relationship: string;
  guardian_phone: string;
  guardian_email: string;
  contact_phone?: string | null;
  address?: string | null;
  school_name?: string | null;
  current_grade?: string | null;
  academic_notes?: string | null;
  requested_program_id?: string | null;
  requested_program_name?: string | null;
  preferred_level?: string | null;
  preferred_schedule?: string | null;
  additional_details?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string | null;
  submitted_at: string;
  reviewed_at?: string | null;
}

interface Program {
  id: string;
  name: string;
  slug: string;
  description?: string;
  level?: string;
  duration?: string;
  is_active: boolean;
}

interface Batch {
  id: string;
  program_id: string;
  teacher_id: string;
  name: string;
  level?: string;
  schedule?: string;
  capacity: number;
  enrolled_student_count: number;
  is_active: boolean;
  program_name?: string;
  teacher_name?: string;
}

interface Teacher {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  specialization?: string;
  status: string;
}

export const ApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  // Review Drawer / Modal
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  // Rejection Modal
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingReject, setSubmittingReject] = useState(false);
  const [rejectError, setRejectError] = useState<string | null>(null);

  // Activation Wizard
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<string>('');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [submittingActivation, setSubmittingActivation] = useState(false);
  const [activationError, setActivationError] = useState<string | null>(null);
  const [activationSuccess, setActivationSuccess] = useState<any | null>(null);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await fetch(`/api/applications?${params.toString()}`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
      }
    } catch (err) {
      console.error('Failed to fetch applications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const openActivationWizard = async () => {
    if (!selectedApp) return;
    setActivationError(null);
    setActivationSuccess(null);
    setWizardStep(1);
    setIsWizardOpen(true);

    try {
      const [progRes, teachRes, batchRes] = await Promise.all([
        fetch('/api/programs', { credentials: 'include' }),
        fetch('/api/teachers', { credentials: 'include' }),
        fetch('/api/batches', { credentials: 'include' }),
      ]);

      if (progRes.ok) {
        const progData = await progRes.json();
        const activeProgs = (progData.programs || []).filter((p: Program) => p.is_active);
        setPrograms(activeProgs);

        if (selectedApp.requested_program_id) {
          setSelectedProgramId(selectedApp.requested_program_id);
        } else if (activeProgs.length > 0) {
          setSelectedProgramId(activeProgs[0].id);
        }
      }

      if (teachRes.ok) {
        const teachData = await teachRes.json();
        setTeachers((teachData.teachers || []).filter((t: Teacher) => t.status === 'active'));
      }

      if (batchRes.ok) {
        const batchData = await batchRes.json();
        setBatches(batchData.batches || []);
      }
    } catch (err) {
      console.error('Error loading enrollment setup options', err);
    }
  };

  const availableBatchesForProgram = useMemo(() => {
    if (!selectedProgramId) return [];
    return batches.filter((b) => b.program_id === selectedProgramId && b.is_active);
  }, [batches, selectedProgramId]);

  useEffect(() => {
    if (availableBatchesForProgram.length > 0) {
      const openBatch = availableBatchesForProgram.find((b) => (b.enrolled_student_count || 0) < b.capacity);
      if (openBatch) {
        setSelectedBatchId(openBatch.id);
        if (openBatch.teacher_id) setSelectedTeacherId(openBatch.teacher_id);
      } else {
        setSelectedBatchId(availableBatchesForProgram[0].id);
      }
    } else {
      setSelectedBatchId('');
    }
  }, [selectedProgramId, availableBatchesForProgram]);

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    if (!rejectionReason.trim()) {
      setRejectError('A formal reason is required to reject an application.');
      return;
    }

    setSubmittingReject(true);
    setRejectError(null);

    try {
      const res = await fetch(`/api/applications/${selectedApp.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason: rejectionReason.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reject application');
      }

      setIsRejectModalOpen(false);
      setSelectedApp(null);
      setRejectionReason('');
      await fetchApplications();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error rejecting application';
      setRejectError(message);
    } finally {
      setSubmittingReject(false);
    }
  };

  const handleActivationSubmit = async () => {
    if (!selectedApp || !selectedProgramId || !selectedBatchId || !selectedTeacherId) {
      setActivationError('Please complete all selections before confirming activation.');
      return;
    }

    setSubmittingActivation(true);
    setActivationError(null);

    try {
      const res = await fetch(`/api/applications/${selectedApp.id}/approve-and-activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          programId: selectedProgramId,
          batchId: selectedBatchId,
          teacherId: selectedTeacherId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to activate student enrollment');
      }

      setActivationSuccess(data);
      await fetchApplications();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error executing activation';
      setActivationError(message);
    } finally {
      setSubmittingActivation(false);
    }
  };

  const filteredApplications = useMemo(() => {
    if (!searchQuery.trim()) return applications;
    const q = searchQuery.toLowerCase();
    return applications.filter(
      (app) =>
        app.student_name?.toLowerCase().includes(q) ||
        app.guardian_name?.toLowerCase().includes(q) ||
        app.account_email?.toLowerCase().includes(q) ||
        app.guardian_phone?.toLowerCase().includes(q)
    );
  }, [applications, searchQuery]);

  const selectedBatchObj = batches.find((b) => b.id === selectedBatchId);
  const selectedProgramObj = programs.find((p) => p.id === selectedProgramId);
  const selectedTeacherObj = teachers.find((t) => t.id === selectedTeacherId);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
        <div>
          <h1 className="text-base font-semibold text-slate-900 tracking-tight">
            Admissions Applications
          </h1>
          <p className="text-xs text-slate-500">
            Review applicant submissions, record admission determinations, and execute enrollment activations.
          </p>
        </div>

        <button
          onClick={fetchApplications}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 rounded text-xs font-medium text-slate-700 shadow-xs transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded">
          {(['pending', 'approved', 'rejected', 'all'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded text-xs font-medium capitalize transition-colors ${
                statusFilter === status
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter applicant, guardian, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-slate-400"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-500 flex flex-col items-center justify-center">
            <RefreshCw className="w-4 h-4 animate-spin text-slate-600 mb-2" />
            <span>Loading application records...</span>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No application records match the active criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-[10px] font-mono uppercase text-slate-400">
                  <th className="py-2.5 px-3.5 font-medium">Applicant Name</th>
                  <th className="py-2.5 px-3 font-medium">Requested Program</th>
                  <th className="py-2.5 px-3 font-medium">Guardian Contact</th>
                  <th className="py-2.5 px-3 font-medium">Status</th>
                  <th className="py-2.5 px-3 font-medium">Submitted</th>
                  <th className="py-2.5 px-3.5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3.5 font-medium text-slate-900">
                      <div>{app.student_name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        {app.account_email}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">
                      {app.requested_program_name || 'General Ingestion'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      <div>{app.guardian_name} ({app.guardian_relationship})</div>
                      <div className="text-[10px] text-slate-400 font-mono">{app.guardian_phone}</div>
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
                    <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {new Date(app.submitted_at).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 px-3.5 text-right">
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded text-[11px] transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl border border-slate-300 max-w-xl w-full max-h-[90vh] flex flex-col my-8">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-xl">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400">Application Dossier</span>
                <h2 className="text-sm font-semibold text-slate-900 mt-0.5">{selectedApp.student_name}</h2>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
              {selectedApp.status === 'rejected' && (
                <div className="p-3 rounded bg-rose-50 border border-rose-200 text-rose-800">
                  <div className="font-semibold text-xs text-rose-900 mb-1">Application Rejected</div>
                  <p><strong>Rationale:</strong> {selectedApp.rejection_reason || 'None recorded'}</p>
                </div>
              )}

              {selectedApp.status === 'approved' && (
                <div className="p-3 rounded bg-emerald-50 border border-emerald-200 text-emerald-800">
                  <div className="font-semibold text-xs text-emerald-900 mb-0.5">Approved & Activated</div>
                  <p>Student enrollment has been activated in the designated cohort.</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">Date of Birth</span>
                  <span className="font-medium text-slate-800">{selectedApp.date_of_birth}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">Account Email</span>
                  <span className="font-mono text-slate-800">{selectedApp.account_email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">Guardian</span>
                  <span className="font-medium text-slate-800">{selectedApp.guardian_name} ({selectedApp.guardian_relationship})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">Contact Phone</span>
                  <span className="font-mono text-slate-800">{selectedApp.guardian_phone}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Curriculum / Schedule Notes</span>
                <div><strong>Program:</strong> {selectedApp.requested_program_name || 'General Ingestion'}</div>
                {selectedApp.preferred_schedule && <div><strong>Preferred Schedule:</strong> {selectedApp.preferred_schedule}</div>}
                {selectedApp.academic_notes && <div><strong>Academic Notes:</strong> {selectedApp.academic_notes}</div>}
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between rounded-b-xl">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded text-xs hover:bg-white transition-colors"
              >
                Close
              </button>

              {selectedApp.status === 'pending' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setRejectionReason('');
                      setRejectError(null);
                      setIsRejectModalOpen(true);
                    }}
                    className="px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 rounded text-xs hover:bg-rose-100 transition-colors font-medium"
                  >
                    Reject
                  </button>
                  <button
                    onClick={openActivationWizard}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold shadow-xs transition-colors flex items-center gap-1"
                  >
                    <span>Approve & Activate</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {isRejectModalOpen && selectedApp && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-300 max-w-md w-full p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Reject Candidate Application</span>
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Enter formal rejection rationale for {selectedApp.student_name}. Recorded permanently in the audit log.
            </p>

            {rejectError && (
              <div className="p-2.5 mb-3 rounded bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {rejectError}
              </div>
            )}

            <form onSubmit={handleRejectSubmit} className="space-y-3">
              <textarea
                rows={3}
                required
                placeholder="Formal rejection rationale..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:outline-none focus:border-slate-400"
              />

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(false)}
                  disabled={submittingReject}
                  className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded text-xs hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReject}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold"
                >
                  {submittingReject ? 'Saving...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Activation Wizard */}
      {isWizardOpen && selectedApp && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl border border-slate-300 max-w-xl w-full flex flex-col my-8">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-xl">
              <div>
                <span className="text-[10px] font-mono uppercase text-emerald-600">Transactional Activation</span>
                <h2 className="text-sm font-semibold text-slate-900 mt-0.5">Activate Enrollment: {selectedApp.student_name}</h2>
              </div>
              <button
                onClick={() => setIsWizardOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs flex-1">
              {activationSuccess ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900">Student & Enrollment Activated</h3>
                  <p className="text-slate-500 max-w-xs mx-auto">
                    Student account is active. The applicant may now authenticate using their registered email.
                  </p>
                  <button
                    onClick={() => {
                      setIsWizardOpen(false);
                      setSelectedApp(null);
                    }}
                    className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded font-medium text-xs shadow-xs"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  {activationError && (
                    <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                      {activationError}
                    </div>
                  )}

                  {/* Step 1: Program */}
                  {wizardStep === 1 && (
                    <div className="space-y-2">
                      <label className="block font-medium text-slate-800">Select Academic Program</label>
                      <div className="space-y-1.5">
                        {programs.map((prog) => (
                          <label
                            key={prog.id}
                            className={`flex items-start gap-2.5 p-2.5 rounded border cursor-pointer ${
                              selectedProgramId === prog.id ? 'border-slate-800 bg-slate-50' : 'border-slate-200'
                            }`}
                          >
                            <input
                              type="radio"
                              name="program"
                              checked={selectedProgramId === prog.id}
                              onChange={() => setSelectedProgramId(prog.id)}
                              className="mt-0.5"
                            />
                            <div>
                              <div className="font-semibold text-slate-900">{prog.name}</div>
                              <div className="text-[11px] text-slate-500">{prog.description}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 2: Batch */}
                  {wizardStep === 2 && (
                    <div className="space-y-2">
                      <label className="block font-medium text-slate-800">Select Cohort / Batch</label>
                      {availableBatchesForProgram.length === 0 ? (
                        <div className="p-4 text-center bg-slate-50 rounded border border-slate-200 text-slate-500">
                          No active cohorts available for this program.
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {availableBatchesForProgram.map((batch) => {
                            const isFull = (batch.enrolled_student_count || 0) >= batch.capacity;
                            return (
                              <label
                                key={batch.id}
                                className={`flex items-start gap-2.5 p-2.5 rounded border ${
                                  isFull ? 'opacity-50 cursor-not-allowed bg-slate-100 border-slate-200' : selectedBatchId === batch.id ? 'border-slate-800 bg-slate-50 cursor-pointer' : 'border-slate-200 cursor-pointer'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="batch"
                                  disabled={isFull}
                                  checked={selectedBatchId === batch.id}
                                  onChange={() => {
                                    setSelectedBatchId(batch.id);
                                    if (batch.teacher_id) setSelectedTeacherId(batch.teacher_id);
                                  }}
                                  className="mt-0.5"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold text-slate-900">{batch.name}</span>
                                    <span className="font-mono text-[10px] text-slate-500">
                                      {batch.enrolled_student_count || 0} / {batch.capacity} seats filled
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-slate-500">{batch.schedule} • Lead: {batch.teacher_name || 'Unassigned'}</div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 3: Teacher */}
                  {wizardStep === 3 && (
                    <div className="space-y-2">
                      <label className="block font-medium text-slate-800">Assign Supervising Teacher</label>
                      <div className="space-y-1.5">
                        {teachers.map((teach) => (
                          <label
                            key={teach.id}
                            className={`flex items-start gap-2.5 p-2.5 rounded border cursor-pointer ${
                              selectedTeacherId === teach.id ? 'border-slate-800 bg-slate-50' : 'border-slate-200'
                            }`}
                          >
                            <input
                              type="radio"
                              name="teacher"
                              checked={selectedTeacherId === teach.id}
                              onChange={() => setSelectedTeacherId(teach.id)}
                              className="mt-0.5"
                            />
                            <div>
                              <div className="font-semibold text-slate-900">{teach.full_name}</div>
                              <div className="text-[11px] text-slate-500">{teach.specialization || 'Curriculum Instructor'} • {teach.email}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 4: Confirm */}
                  {wizardStep === 4 && (
                    <div className="space-y-3">
                      <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1.5">
                        <div className="font-mono text-[10px] uppercase text-slate-400 font-semibold">Verification Summary</div>
                        <div><strong>Student:</strong> {selectedApp.student_name}</div>
                        <div><strong>Program:</strong> {selectedProgramObj?.name}</div>
                        <div><strong>Batch:</strong> {selectedBatchObj?.name} ({selectedBatchObj?.schedule})</div>
                        <div><strong>Supervising Teacher:</strong> {selectedTeacherObj?.full_name}</div>
                      </div>
                      <div className="text-[11px] text-slate-500 bg-amber-50 border border-amber-200 p-2.5 rounded">
                        <strong>Transactional Invariant:</strong> Atomically creates student record, generates active enrollment, sets user account to active, and logs the administrative action.
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {!activationSuccess && (
              <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between rounded-b-xl">
                <button
                  onClick={() => {
                    if (wizardStep > 1) setWizardStep((wizardStep - 1) as any);
                    else setIsWizardOpen(false);
                  }}
                  className="px-3 py-1.5 border border-slate-200 rounded text-xs text-slate-600 hover:bg-white"
                >
                  {wizardStep === 1 ? 'Cancel' : 'Back'}
                </button>

                {wizardStep < 4 ? (
                  <button
                    onClick={() => setWizardStep((wizardStep + 1) as any)}
                    disabled={
                      (wizardStep === 1 && !selectedProgramId) ||
                      (wizardStep === 2 && !selectedBatchId) ||
                      (wizardStep === 3 && !selectedTeacherId)
                    }
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded text-xs font-semibold"
                  >
                    Next &rarr;
                  </button>
                ) : (
                  <button
                    onClick={handleActivationSubmit}
                    disabled={submittingActivation}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{submittingActivation ? 'Activating...' : 'Confirm Activation'}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
