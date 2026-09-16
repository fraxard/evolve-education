import React, { useEffect, useState, useMemo } from 'react';
import {
  Search,
  RefreshCw,
  X,
  Eye,
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

interface StudentDetail {
  id: string;
  user_id: string;
  full_name: string;
  date_of_birth: string;
  gender?: string | null;
  guardian_name: string;
  guardian_phone: string;
  guardian_email: string;
  address?: string | null;
  school_name?: string | null;
  current_grade?: string | null;
  status: string;
  account_email: string;
  account_status: string;
  created_at: string;
  enrollments: Array<{
    id: string;
    program_name: string;
    batch_name: string;
    schedule: string;
    teacher_name: string;
    teacher_email: string;
    status: string;
    enrolled_at: string;
  }>;
}

export const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [studentDetail, setStudentDetail] = useState<StudentDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

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

  useEffect(() => {
    fetchStudents();
  }, []);

  const openStudentModal = async (id: string) => {
    setSelectedStudentId(id);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/students/${id}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setStudentDetail(data.student);
      }
    } catch (err) {
      console.error('Failed to load student detail', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const q = searchQuery.toLowerCase();
    return students.filter(
      (s) =>
        s.full_name?.toLowerCase().includes(q) ||
        s.account_email?.toLowerCase().includes(q) ||
        s.guardian_name?.toLowerCase().includes(q) ||
        s.program_name?.toLowerCase().includes(q) ||
        s.batch_name?.toLowerCase().includes(q)
    );
  }, [students, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
        <div>
          <h1 className="text-base font-semibold text-slate-900 tracking-tight">
            Student Registry
          </h1>
          <p className="text-xs text-slate-500">
            Enrolled student profiles and linked active cohort supervision records.
          </p>
        </div>

        <button
          onClick={fetchStudents}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 rounded text-xs font-medium text-slate-700 shadow-xs transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student, guardian, program, batch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-slate-400"
          />
        </div>

        <div className="text-[11px] font-mono text-slate-500">
          Enrolled: <span className="font-semibold text-slate-800">{filteredStudents.length}</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-500 flex flex-col items-center justify-center">
            <RefreshCw className="w-4 h-4 animate-spin text-slate-600 mb-2" />
            <span>Loading student records...</span>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No enrolled student records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-[10px] font-mono uppercase text-slate-400">
                  <th className="py-2.5 px-3.5 font-medium">Student Name</th>
                  <th className="py-2.5 px-3 font-medium">Program & Cohort</th>
                  <th className="py-2.5 px-3 font-medium">Supervising Faculty</th>
                  <th className="py-2.5 px-3 font-medium">Status</th>
                  <th className="py-2.5 px-3 font-medium">Enrolled Date</th>
                  <th className="py-2.5 px-3.5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((stu) => (
                  <tr key={stu.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3.5 font-medium text-slate-900">
                      <div>{stu.full_name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        {stu.account_email}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">
                      <div>{stu.program_name || '—'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{stu.batch_name || 'No Batch'}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {stu.teacher_name || 'Unassigned'}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium uppercase font-mono bg-emerald-100 text-emerald-800">
                        {stu.student_status || stu.account_status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {new Date(stu.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 px-3.5 text-right">
                      <button
                        onClick={() => openStudentModal(stu.id)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded text-[11px] transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Dossier</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Student Dossier Modal */}
      {selectedStudentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl border border-slate-300 max-w-xl w-full max-h-[90vh] flex flex-col my-8">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-xl">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400">Student Record Dossier</span>
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

            <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
              {detailLoading || !studentDetail ? (
                <div className="py-12 text-center text-slate-500">
                  <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2 text-slate-600" />
                  <span>Loading dossier...</span>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-mono">Date of Birth</span>
                      <span className="font-medium text-slate-800">{studentDetail.date_of_birth}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-mono">Account Email</span>
                      <span className="font-mono text-slate-800">{studentDetail.account_email}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-mono">Guardian</span>
                      <span className="font-medium text-slate-800">{studentDetail.guardian_name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-mono">Guardian Contact</span>
                      <span className="font-mono text-slate-800">{studentDetail.guardian_phone}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">Active Enrollments</span>
                    {studentDetail.enrollments?.map((enr) => (
                      <div key={enr.id} className="p-3 bg-white border border-slate-200 rounded shadow-2xs space-y-1">
                        <div className="flex items-center justify-between font-semibold text-slate-900">
                          <span>{enr.program_name}</span>
                          <span className="font-mono text-[10px] uppercase text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                            {enr.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600">Cohort: {enr.batch_name} ({enr.schedule})</div>
                        <div className="text-[11px] text-slate-500">Supervising Teacher: {enr.teacher_name} ({enr.teacher_email})</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end rounded-b-xl">
              <button
                onClick={() => {
                  setSelectedStudentId(null);
                  setStudentDetail(null);
                }}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
