import React, { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  RefreshCw,
  X,
  Edit2,
  CheckCircle2,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

interface Batch {
  id: string;
  program_id: string;
  teacher_id: string;
  name: string;
  level?: string | null;
  schedule?: string | null;
  start_date: string;
  end_date?: string | null;
  capacity: number;
  enrolled_student_count: number;
  is_active: boolean;
  program_name: string;
  teacher_name: string;
}

interface Program {
  id: string;
  name: string;
}

interface Teacher {
  id: string;
  full_name: string;
}

export const BatchesPage: React.FC = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Add Batch Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [batchName, setBatchName] = useState('');
  const [level] = useState('Foundation');
  const [schedule, setSchedule] = useState('');
  const [capacity, setCapacity] = useState(12);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit Batch Modal
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [editName, setEditName] = useState('');
  const [editLevel, setEditLevel] = useState('');
  const [editSchedule, setEditSchedule] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editCapacity, setEditCapacity] = useState(15);
  const [editTeacherId, setEditTeacherId] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete Modal
  const [deletingBatch, setDeletingBatch] = useState<Batch | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/batches', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setBatches(data.batches || []);
      }
    } catch (err) {
      console.error('Failed to fetch batches', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const openAddModal = async () => {
    setError(null);
    setIsAddModalOpen(true);
    try {
      const [pRes, tRes] = await Promise.all([
        fetch('/api/programs', { credentials: 'include' }),
        fetch('/api/teachers', { credentials: 'include' }),
      ]);
      if (pRes.ok) {
        const pData = await pRes.json();
        const activeProgs = (pData.programs || []).filter((p: any) => p.is_active);
        setPrograms(activeProgs);
        if (activeProgs.length > 0 && !selectedProgramId) {
          setSelectedProgramId(activeProgs[0].id);
        }
      }
      if (tRes.ok) {
        const tData = await tRes.json();
        const activeTeachers = (tData.teachers || []).filter((t: any) => t.status === 'active');
        setTeachers(activeTeachers);
        if (activeTeachers.length > 0 && !selectedTeacherId) {
          setSelectedTeacherId(activeTeachers[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load programs/teachers for batch creation', err);
    }
  };

  const handleAddBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgramId || !selectedTeacherId || !batchName.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          programId: selectedProgramId,
          teacherId: selectedTeacherId,
          name: batchName.trim(),
          level: level.trim() || undefined,
          schedule: schedule.trim() || 'TBD',
          startDate,
          capacity: Number(capacity),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create batch');
      }

      setIsAddModalOpen(false);
      setBatchName('');
      setSchedule('');
      await fetchBatches();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error adding batch';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (batch: Batch) => {
    try {
      const nextActive = !batch.is_active;
      const res = await fetch(`/api/batches/${batch.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isActive: nextActive }),
      });
      if (res.ok) {
        setSuccessMessage(`Cohort "${batch.name}" marked ${nextActive ? 'active' : 'inactive'}.`);
        setTimeout(() => setSuccessMessage(null), 3000);
        fetchBatches();
      }
    } catch (err) {
      console.error('Failed to toggle batch status', err);
    }
  };

  const loadPrerequisites = async () => {
    if (programs.length === 0 || teachers.length === 0) {
      try {
        const [pRes, tRes] = await Promise.all([
          fetch('/api/programs', { credentials: 'include' }),
          fetch('/api/teachers', { credentials: 'include' }),
        ]);
        if (pRes.ok) {
          const pData = await pRes.json();
          setPrograms((pData.programs || []).filter((p: any) => p.is_active));
        }
        if (tRes.ok) {
          const tData = await tRes.json();
          setTeachers((tData.teachers || []).filter((t: any) => t.status === 'active'));
        }
      } catch (err) {
        console.error('Failed to load prerequisites', err);
      }
    }
  };

  const openEditModal = async (batch: Batch) => {
    await loadPrerequisites();
    setEditingBatch(batch);
    setEditName(batch.name || '');
    setEditLevel(batch.level || '');
    setEditSchedule(batch.schedule || '');
    setEditStartDate(batch.start_date ? batch.start_date.split('T')[0] : '');
    setEditEndDate(batch.end_date ? batch.end_date.split('T')[0] : '');
    setEditCapacity(batch.capacity || 15);
    setEditTeacherId(batch.teacher_id || '');
    setEditIsActive(batch.is_active);
    setEditError(null);
  };

  const handleUpdateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBatch) return;
    if (!editName.trim()) {
      setEditError('Batch name is required.');
      return;
    }

    const currentEnrolled = editingBatch.enrolled_student_count || 0;
    if (Number(editCapacity) < currentEnrolled) {
      setEditError(
        `Cannot set capacity to ${editCapacity}. There are currently ${currentEnrolled} active students enrolled in this cohort.`
      );
      return;
    }

    setEditError(null);
    setEditSubmitting(true);

    try {
      const res = await fetch(`/api/batches/${editingBatch.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: editName.trim(),
          level: editLevel.trim() || undefined,
          schedule: editSchedule.trim() || undefined,
          startDate: editStartDate || undefined,
          endDate: editEndDate || null,
          capacity: Number(editCapacity),
          teacherId: editTeacherId || null,
          isActive: editIsActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update cohort batch');
      }

      setEditingBatch(null);
      setSuccessMessage(`Cohort "${editName.trim()}" updated successfully.`);
      setTimeout(() => setSuccessMessage(null), 4000);
      await fetchBatches();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating batch';
      setEditError(msg);
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDeleteBatch = async () => {
    if (!deletingBatch) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/batches/${deletingBatch.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete cohort batch');
      }
      setSuccessMessage(data.message || `Cohort "${deletingBatch.name}" deleted successfully.`);
      setTimeout(() => setSuccessMessage(null), 4000);
      setDeletingBatch(null);
      await fetchBatches();
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : 'Error deleting cohort');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredBatches = batches.filter(
    (b) =>
      b.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.program_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.teacher_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
        <div>
          <h1 className="text-base font-semibold text-slate-900 tracking-tight">
            Cohort / Batch Management
          </h1>
          <p className="text-xs text-slate-500">
            Active class cohorts, scheduling rosters, seat capacity allocations, and supervising instructors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchBatches}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 rounded text-xs font-medium text-slate-700 shadow-xs transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Batch</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search batches by name, program, faculty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-slate-400"
          />
        </div>

        <div className="text-[11px] font-mono text-slate-500">
          Cohorts: <span className="font-semibold text-slate-800">{filteredBatches.length}</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-500 flex flex-col items-center justify-center">
            <RefreshCw className="w-4 h-4 animate-spin text-slate-600 mb-2" />
            <span>Loading cohort batches...</span>
          </div>
        ) : filteredBatches.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No cohorts on record.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-[10px] font-mono uppercase text-slate-400">
                  <th className="py-2.5 px-3.5 font-medium">Batch Title</th>
                  <th className="py-2.5 px-3 font-medium">Program</th>
                  <th className="py-2.5 px-3 font-medium">Supervising Instructor</th>
                  <th className="py-2.5 px-3 font-medium">Schedule</th>
                  <th className="py-2.5 px-3 font-medium">Seat Capacity</th>
                  <th className="py-2.5 px-3 font-medium">Status</th>
                  <th className="py-2.5 px-3.5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBatches.map((b) => {
                  const filled = b.enrolled_student_count || 0;
                  const isFull = filled >= b.capacity;
                  const isNearCap = !isFull && b.capacity > 0 && filled / b.capacity >= 0.85;

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3.5 font-medium text-slate-900">
                        <div>{b.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{b.level || 'Standard'}</div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">
                        {b.program_name}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {b.teacher_name || 'Unassigned'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {b.schedule || 'TBD'}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <span className={isFull ? 'text-rose-600 font-semibold' : 'text-slate-800 font-medium'}>
                            {filled} / {b.capacity}
                          </span>
                          {isFull ? (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase bg-rose-100 text-rose-800 font-mono">
                              Full
                            </span>
                          ) : isNearCap ? (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase bg-amber-100 text-amber-800 font-mono">
                              Near Cap
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">
                              ({b.capacity - filled} open)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium uppercase font-mono ${
                            b.is_active
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {b.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(b)}
                          className="text-[11px] font-medium text-slate-700 hover:text-slate-900 inline-flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-200 transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => toggleStatus(b)}
                          className={`text-[11px] font-medium underline ${
                            b.is_active
                              ? 'text-amber-600 hover:text-amber-700'
                              : 'text-emerald-600 hover:text-emerald-700'
                          }`}
                        >
                          {b.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => {
                            setDeletingBatch(b);
                            setDeleteError(null);
                          }}
                          className="text-[11px] font-medium text-rose-600 hover:text-rose-700 inline-flex items-center gap-1 px-2 py-0.5 rounded hover:bg-rose-50 transition-colors"
                          title="Delete Cohort"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl border border-slate-300 max-w-md w-full p-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900">
                Establish New Batch Cohort
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="mt-3 p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleAddBatch} className="space-y-3 mt-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Program <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedProgramId}
                    onChange={(e) => setSelectedProgramId(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:outline-none focus:border-slate-400"
                  >
                    {programs.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Faculty Lead <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedTeacherId}
                    onChange={(e) => setSelectedTeacherId(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:outline-none focus:border-slate-400"
                  >
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>{t.full_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Batch Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Abacus Level 1 - Weekend (Sat/Sun)"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Meeting Schedule <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sat & Sun 10:00 AM - 11:15 AM"
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:outline-none focus:border-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Seat Capacity <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    required
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:outline-none focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Start Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={submitting}
                  className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded text-xs hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold shadow-xs"
                >
                  {submitting ? 'Creating...' : 'Create Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Batch Modal */}
      {editingBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl border border-slate-300 max-w-md w-full p-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900">
                Edit Cohort: {editingBatch.name}
              </h3>
              <button
                onClick={() => setEditingBatch(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Capacity Overview */}
            <div className="mt-3 p-2.5 bg-slate-50 border border-slate-200 rounded text-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-400 block">Enrolled Learners</span>
                <span className="font-semibold text-slate-800 font-mono">
                  {editingBatch.enrolled_student_count || 0} active students
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-400 block">Program</span>
                <span className="font-medium text-slate-700">{editingBatch.program_name}</span>
              </div>
            </div>

            {editError && (
              <div className="mt-3 p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {editError}
              </div>
            )}

            <form onSubmit={handleUpdateBatch} className="space-y-3 mt-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Batch Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:outline-none focus:border-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Curriculum Level</label>
                  <input
                    type="text"
                    value={editLevel}
                    onChange={(e) => setEditLevel(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:outline-none focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Faculty Lead</label>
                  <select
                    value={editTeacherId}
                    onChange={(e) => setEditTeacherId(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:outline-none focus:border-slate-400"
                  >
                    <option value="">Unassigned</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>{t.full_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Meeting Schedule <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editSchedule}
                  onChange={(e) => setEditSchedule(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:outline-none focus:border-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Seat Capacity <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={editingBatch.enrolled_student_count || 1}
                    max={100}
                    required
                    value={editCapacity}
                    onChange={(e) => setEditCapacity(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:outline-none focus:border-slate-400"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Min: {editingBatch.enrolled_student_count || 1} (enrolled count)
                  </span>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Cohort Status</label>
                  <select
                    value={editIsActive ? 'active' : 'inactive'}
                    onChange={(e) => setEditIsActive(e.target.value === 'active')}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:outline-none focus:border-slate-400"
                  >
                    <option value="active">Active (Open to enrollments)</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:outline-none focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">End Date (Optional)</label>
                  <input
                    type="date"
                    value={editEndDate}
                    onChange={(e) => setEditEndDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingBatch(null)}
                  disabled={editSubmitting}
                  className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded text-xs hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold shadow-xs"
                >
                  {editSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-600 font-semibold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Confirm Cohort Deletion</span>
              </div>
              <button
                onClick={() => {
                  setDeletingBatch(null);
                  setDeleteError(null);
                }}
                disabled={deleteLoading}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <p className="text-xs text-slate-700 leading-relaxed">
                Are you sure you want to permanently delete the cohort{' '}
                <strong className="text-slate-900 font-semibold">{deletingBatch.name}</strong>?
              </p>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-600 space-y-1">
                <p className="font-medium text-slate-700">Safety Check Notice:</p>
                <p>
                  Cohorts with student enrollment records or linked assessments cannot be deleted. If student history exists, please mark the cohort inactive instead.
                </p>
              </div>

              {deleteError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded text-rose-800 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <div className="flex-1">
                    <p className="font-semibold text-rose-900">Deletion Blocked</p>
                    <p className="mt-0.5 text-[11px] leading-relaxed">{deleteError}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                disabled={deleteLoading}
                onClick={() => {
                  setDeletingBatch(null);
                  setDeleteError(null);
                }}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium rounded border border-slate-200 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleDeleteBatch}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded transition-colors inline-flex items-center gap-1.5 shadow-xs"
              >
                {deleteLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Checking & Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Cohort</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
