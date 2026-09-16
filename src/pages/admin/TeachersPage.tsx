import React, { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  RefreshCw,
  X,
} from 'lucide-react';

interface Teacher {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  qualification: string | null;
  specialization: string | null;
  status: string;
  email: string;
  account_status: string;
  batch_count: number;
  assigned_student_count: number;
}

export const TeachersPage: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Add Teacher Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [qualification, setQualification] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/teachers', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setTeachers(data.teachers || []);
      }
    } catch (err) {
      console.error('Failed to fetch teachers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          password,
          phone: phone.trim() || undefined,
          qualification: qualification.trim() || undefined,
          specialization: specialization.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create teacher account');
      }

      setIsAddModalOpen(false);
      setFullName('');
      setEmail('');
      setPassword('');
      setPhone('');
      setQualification('');
      setSpecialization('');
      await fetchTeachers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error adding teacher';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (teacher: Teacher) => {
    const nextStatus = teacher.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch(`/api/teachers/${teacher.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        fetchTeachers();
      }
    } catch (err) {
      console.error('Failed to toggle teacher status', err);
    }
  };

  const filteredTeachers = teachers.filter(
    (t) =>
      t.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.specialization?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
        <div>
          <h1 className="text-base font-semibold text-slate-900 tracking-tight">
            Faculty Management
          </h1>
          <p className="text-xs text-slate-500">
            Instructor credentials, subject specializations, and active cohort supervision assignments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchTeachers}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 rounded text-xs font-medium text-slate-700 shadow-xs transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Instructor</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search faculty by name, email, specialization..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-slate-400"
          />
        </div>

        <div className="text-[11px] font-mono text-slate-500">
          Faculty Count: <span className="font-semibold text-slate-800">{filteredTeachers.length}</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-500 flex flex-col items-center justify-center">
            <RefreshCw className="w-4 h-4 animate-spin text-slate-600 mb-2" />
            <span>Loading faculty records...</span>
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No instructors on record.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-[10px] font-mono uppercase text-slate-400">
                  <th className="py-2.5 px-3.5 font-medium">Instructor Name</th>
                  <th className="py-2.5 px-3 font-medium">Specialization</th>
                  <th className="py-2.5 px-3 font-medium">Active Cohorts</th>
                  <th className="py-2.5 px-3 font-medium">Status</th>
                  <th className="py-2.5 px-3.5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTeachers.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3.5 font-medium text-slate-900">
                      <div>{t.full_name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        {t.email} {t.phone && `• ${t.phone}`}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">
                      {t.specialization || 'Curriculum Faculty'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">
                      {t.batch_count || 0} batches
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium uppercase font-mono ${
                          t.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 text-right">
                      <button
                        onClick={() => toggleStatus(t)}
                        className={`text-[11px] font-medium underline ${
                          t.status === 'active'
                            ? 'text-rose-600 hover:text-rose-700'
                            : 'text-emerald-600 hover:text-emerald-700'
                        }`}
                      >
                        {t.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl border border-slate-300 max-w-md w-full p-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900">
                Register Faculty Member
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

            <form onSubmit={handleAddTeacher} className="space-y-3 mt-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master David Zhang"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:outline-none focus:border-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="teacher@evolve.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:outline-none focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Initial Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="Min 8 chars"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    placeholder="+1 555-019-2834"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:outline-none focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Specialization</label>
                  <input
                    type="text"
                    placeholder="e.g. Abacus Mental Math"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Qualification / Credentials</label>
                <input
                  type="text"
                  placeholder="e.g. Certified Senior Instructor"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:outline-none focus:border-slate-400"
                />
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
                  {submitting ? 'Registering...' : 'Save Faculty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
