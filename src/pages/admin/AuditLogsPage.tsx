import React, { useEffect, useState, useCallback } from 'react';
import {
  Search,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Filter,
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

const DEFAULT_KNOWN_ACTIONS = [
  'APPLICATION_SUBMITTED',
  'APPLICATION_REJECTED',
  'STUDENT_ACTIVATED',
  'STUDENT_TRANSFERRED',
  'STUDENT_SUSPENDED',
  'STUDENT_DEACTIVATED',
  'STUDENT_GRADUATED',
  'STUDENT_REACTIVATED',
  'TEACHER_CREATED',
  'TEACHER_UPDATED',
  'TEACHER_DELETED',
  'PROGRAM_CREATED',
  'PROGRAM_UPDATED',
  'PROGRAM_DELETED',
  'BATCH_CREATED',
  'BATCH_UPDATED',
  'BATCH_DELETED',
  'ADMIN_PASSWORD_CHANGED',
];

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filter & Search State
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [selectedActorRole, setSelectedActorRole] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [availableActions, setAvailableActions] = useState<string[]>(DEFAULT_KNOWN_ACTIONS);

  // Expanded row ID
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const fetchLogs = useCallback(
    async (targetPage = page, targetLimit = limit, isManualRefresh = false) => {
      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const params = new URLSearchParams();
        params.append('page', String(targetPage));
        params.append('limit', String(targetLimit));

        if (selectedAction && selectedAction !== 'all') {
          params.append('action', selectedAction);
        }
        if (selectedActorRole && selectedActorRole !== 'all') {
          params.append('actorRole', selectedActorRole);
        }
        if (searchQuery.trim()) {
          params.append('search', searchQuery.trim());
        }

        const res = await fetch(`/api/audit-logs?${params.toString()}`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setLogs(data.auditLogs || []);
          if (data.pagination) {
            setTotal(data.pagination.total);
            setPage(data.pagination.page);
            setTotalPages(data.pagination.totalPages);
          }
          if (data.availableActions && Array.isArray(data.availableActions)) {
            // Merge with known actions to provide comprehensive list
            const combined = Array.from(new Set([...DEFAULT_KNOWN_ACTIONS, ...data.availableActions])).sort();
            setAvailableActions(combined);
          }
        } else {
          setError(`Failed to fetch audit logs (HTTP ${res.status}).`);
        }
      } catch (err) {
        console.error('Failed to fetch audit logs', err);
        setError('Connection error loading audit trail.');
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [page, limit, selectedAction, selectedActorRole, searchQuery]
  );

  // Fetch when page or limit changes
  useEffect(() => {
    fetchLogs(page, limit);
  }, [page, limit, selectedAction, selectedActorRole]);

  // Handle Search submit or debounced search
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs(1, limit);
  };

  const handleActionChange = (action: string) => {
    setSelectedAction(action);
    setPage(1);
  };

  const handleRoleChange = (role: string) => {
    setSelectedActorRole(role);
    setPage(1);
  };

  const handleRefresh = () => {
    fetchLogs(page, limit, true);
  };

  const toggleExpand = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  const fromRecord = total === 0 ? 0 : (page - 1) * limit + 1;
  const toRecord = Math.min(page * limit, total);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
        <div>
          <h1 className="text-base font-semibold text-slate-900 tracking-tight">
            System & Security Audit Log
          </h1>
          <p className="text-xs text-slate-500">
            Immutable, append-only security journal of administrative operations, state transitions, and deletions.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={loading || isRefreshing}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 rounded text-xs font-medium text-slate-700 shadow-xs transition-colors self-start sm:self-auto disabled:opacity-50"
          title="Refresh audit logs from server"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing || loading ? 'animate-spin text-slate-600' : 'text-slate-500'}`} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
          {error}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Action Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <label className="text-[11px] font-mono text-slate-500 uppercase">Action:</label>
            <select
              value={selectedAction}
              onChange={(e) => handleActionChange(e.target.value)}
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-mono text-slate-800 focus:bg-white focus:outline-none focus:border-slate-400 max-w-[200px] truncate"
            >
              <option value="all">ALL ACTIONS ({availableActions.length})</option>
              {availableActions.map((act) => (
                <option key={act} value={act}>
                  {act}
                </option>
              ))}
            </select>
          </div>

          {/* Actor Role Filter */}
          <div className="flex items-center gap-1.5">
            <label className="text-[11px] font-mono text-slate-500 uppercase">Role:</label>
            <select
              value={selectedActorRole}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-mono text-slate-800 focus:bg-white focus:outline-none focus:border-slate-400"
            >
              <option value="all">ALL ROLES</option>
              <option value="admin">ADMIN</option>
              <option value="teacher">TEACHER</option>
              <option value="student">STUDENT</option>
              <option value="system">SYSTEM</option>
            </select>
          </div>
        </div>

        {/* Search Input & Total Counter */}
        <div className="flex items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search entity, ID, actor, payload..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onBlur={() => {
                setPage(1);
                fetchLogs(1, limit);
              }}
              className="w-full pl-8 pr-3 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-slate-400"
            />
          </form>

          <div className="text-[11px] font-mono text-slate-500 whitespace-nowrap">
            Total: <span className="font-semibold text-slate-800">{total}</span>
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
        ) : logs.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No audit records match the current criteria.
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
                {logs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  const isDelete = log.action.endsWith('_DELETED');
                  return (
                    <React.Fragment key={log.id}>
                      <tr className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-[11px]">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] ${
                              isDelete
                                ? 'bg-rose-100 text-rose-800 font-semibold'
                                : 'text-slate-900 bg-slate-100'
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          <div>{log.actor_email || 'System Operation'}</div>
                          <div className="text-[10px] text-slate-400 font-mono uppercase">
                            {log.actor_role || 'System'}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-700">
                          <span>{log.target_entity}</span>
                          {log.target_id && (
                            <span className="block text-[10px] text-slate-400 truncate max-w-[140px]">
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
                            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase mb-1">
                              <span>Context Payload</span>
                              {log.ip_address && <span>Client IP: {log.ip_address}</span>}
                            </div>
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

        {/* Server-Side Pagination Bar */}
        <div className="px-3.5 py-2.5 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span>
              Showing <span className="font-semibold text-slate-900">{fromRecord}</span> to{' '}
              <span className="font-semibold text-slate-900">{toRecord}</span> of{' '}
              <span className="font-semibold text-slate-900">{total}</span> records
            </span>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1">
              <label className="text-[11px] text-slate-500">Rows per page:</label>
              <select
                value={limit}
                onChange={(e) => {
                  const newLimit = Number(e.target.value);
                  setLimit(newLimit);
                  setPage(1);
                  fetchLogs(1, newLimit);
                }}
                className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-xs font-mono text-slate-800 focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <span className="font-mono text-[11px] mr-2">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1 || loading}
              className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page >= totalPages || loading}
              className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
