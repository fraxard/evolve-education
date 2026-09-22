import React, { useEffect, useState } from 'react';
import {
  Search,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface AuditLog {
  id: string;
  actor_id: string | null;
  actor_role: string | null;
  action: string;
  target_entity: string;
  target_id: string | null;
  details: any;
  ip_address: string | null;
  created_at: string;
  actor_email: string | null;
}

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (selectedAction && selectedAction !== 'all') {
        params.append('action', selectedAction);
      }
      params.append('limit', '100');

      const res = await fetch(`/api/audit-logs?${params.toString()}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.auditLogs || data.logs || []);
      } else {
        setError(`Failed to fetch audit logs (HTTP ${res.status}).`);
      }
    } catch (err) {
      console.error('Failed to fetch audit logs', err);
      setError('Connection error loading audit trail.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedAction]);

  const toggleExpand = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  const filteredLogs = logs.filter(
    (l) =>
      l.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.target_entity?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.actor_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.target_id && l.target_id.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
        <div>
          <h1 className="text-base font-semibold text-slate-900 tracking-tight">
            System & Security Audit Log
          </h1>
          <p className="text-xs text-slate-500">
            Immutable, append-only security journal of administrative operations and state transitions.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 rounded text-xs font-medium text-slate-700 shadow-xs transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
          {error}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label className="text-[11px] font-mono text-slate-500 uppercase">Action:</label>
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-mono text-slate-800 focus:bg-white focus:outline-none focus:border-slate-400"
          >
            <option value="all">ALL ACTIONS</option>
            <option value="APPLICATION_SUBMITTED">APPLICATION_SUBMITTED</option>
            <option value="APPLICATION_REJECTED">APPLICATION_REJECTED</option>
            <option value="STUDENT_ACTIVATED">STUDENT_ACTIVATED</option>
            <option value="STUDENT_TRANSFERRED">STUDENT_TRANSFERRED</option>
            <option value="STUDENT_SUSPENDED">STUDENT_SUSPENDED</option>
            <option value="STUDENT_DEACTIVATED">STUDENT_DEACTIVATED</option>
            <option value="STUDENT_GRADUATED">STUDENT_GRADUATED</option>
            <option value="STUDENT_REACTIVATED">STUDENT_REACTIVATED</option>
            <option value="TEACHER_CREATED">TEACHER_CREATED</option>
            <option value="TEACHER_UPDATED">TEACHER_UPDATED</option>
            <option value="PROGRAM_CREATED">PROGRAM_CREATED</option>
            <option value="PROGRAM_UPDATED">PROGRAM_UPDATED</option>
            <option value="BATCH_CREATED">BATCH_CREATED</option>
            <option value="BATCH_UPDATED">BATCH_UPDATED</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search entity, target ID, actor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-slate-400"
            />
          </div>

          <div className="text-[11px] font-mono text-slate-500 whitespace-nowrap">
            Events: <span className="font-semibold text-slate-800">{filteredLogs.length}</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-500 flex flex-col items-center justify-center">
            <RefreshCw className="w-4 h-4 animate-spin text-slate-600 mb-2" />
            <span>Loading security audit trail...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No audit records match the filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-[10px] font-mono uppercase text-slate-400">
                  <th className="py-2.5 px-3.5 font-medium">Timestamp</th>
                  <th className="py-2.5 px-3 font-medium">Action Code</th>
                  <th className="py-2.5 px-3 font-medium">Actor / Role</th>
                  <th className="py-2.5 px-3 font-medium">Target Entity</th>
                  <th className="py-2.5 px-3.5 text-right font-medium">Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  return (
                    <React.Fragment key={log.id}>
                      <tr className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-[11px] text-slate-900">
                          {log.action}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          <div>{log.actor_email || 'System Operation'}</div>
                          <div className="text-[10px] text-slate-400 font-mono uppercase">{log.actor_role || 'System'}</div>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-700">
                          <span>{log.target_entity}</span>
                          {log.target_id && (
                            <span className="block text-[10px] text-slate-400 truncate max-w-[120px]">
                              {log.target_id}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3.5 text-right">
                          <button
                            onClick={() => toggleExpand(log.id)}
                            className="px-2 py-0.5 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded text-[11px] font-mono inline-flex items-center gap-1 transition-colors"
                          >
                            <span>{isExpanded ? 'Hide' : 'Inspect'}</span>
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-slate-900 text-slate-200 border-b border-slate-700">
                          <td colSpan={5} className="p-3">
                            <div className="text-[10px] font-mono text-slate-400 uppercase mb-1">Context Payload</div>
                            <pre className="text-[11px] font-mono overflow-x-auto text-emerald-400">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
