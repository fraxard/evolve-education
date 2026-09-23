import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Key,
  Server,
  Activity,
  LogOut,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PasswordInput } from '../../components/common/PasswordInput';

interface SystemStatus {
  database: {
    status: string;
    latencyMs: number;
    version: string;
    pool: {
      total: number;
      idle: number;
      waiting: number;
    };
  };
  server: {
    uptimeSeconds: number;
    nodeVersion: string;
    environment: string;
    memoryMb: {
      rss: number;
      heapUsed: number;
      heapTotal: number;
    };
  };
  sessions: {
    activeSessionsCount: number;
    currentSession: {
      userId: string;
      email: string;
      role: string;
      ipAddress: string;
      cookieExpires: string | null;
    };
  };
  timestamp: string;
}

export const SettingsPage: React.FC = () => {
  const { user, signOut } = useAuth();

  // Telemetry state
  const [telemetry, setTelemetry] = useState<SystemStatus | null>(null);
  const [telemetryLoading, setTelemetryLoading] = useState(true);
  const [telemetryError, setTelemetryError] = useState<string | null>(null);

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // Sign out all state
  const [revokeLoading, setRevokeLoading] = useState(false);
  const [revokeConfirm, setRevokeConfirm] = useState(false);
  const [revokeError, setRevokeError] = useState<string | null>(null);

  // Fetch telemetry from backend
  const fetchTelemetry = async () => {
    setTelemetryLoading(true);
    setTelemetryError(null);
    try {
      const res = await fetch('/api/admin/system-status', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setTelemetry(data);
      } else {
        setTelemetryError(`Failed to fetch system telemetry (HTTP ${res.status}).`);
      }
    } catch (err) {
      console.error('Failed to load system status', err);
      setTelemetryError('Connection error loading system metrics.');
    } finally {
      setTelemetryLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, []);

  // Format uptime
  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0 || d > 0) parts.push(`${h}h`);
    if (m > 0 || h > 0 || d > 0) parts.push(`${m}m`);
    parts.push(`${s}s`);
    return parts.join(' ');
  };

  // Password strength checks
  const hasMinLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
  const isPasswordValid = hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial;
  const passwordsMatch = newPassword === confirmPassword;

  // Handle password change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!isPasswordValid) {
      setPasswordError('Please meet all password complexity requirements.');
      return;
    }

    if (!passwordsMatch) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to change password.');
      }

      setPasswordSuccess('Password updated successfully. This change has been recorded in the security audit log.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(null), 6000);
    } catch (err: unknown) {
      setPasswordError(err instanceof Error ? err.message : 'Error updating password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Handle revoke all sessions
  const handleRevokeAllSessions = async () => {
    setRevokeLoading(true);
    setRevokeError(null);
    try {
      const res = await fetch('/api/admin/signout-all', {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to revoke sessions.');
      }
      window.location.href = '/admin/signin';
    } catch (err: unknown) {
      setRevokeError(err instanceof Error ? err.message : 'Error terminating sessions.');
      setRevokeLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
        <div>
          <h1 className="text-base font-semibold text-slate-900 tracking-tight">
            Administrator Settings & Governance
          </h1>
          <p className="text-xs text-slate-500">
            Account security credentials, live system telemetry, session revocation, and data invariants.
          </p>
        </div>

        <button
          onClick={fetchTelemetry}
          disabled={telemetryLoading}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 rounded text-xs font-medium text-slate-700 shadow-xs transition-colors self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${telemetryLoading ? 'animate-spin text-slate-600' : 'text-slate-500'}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 1. SECURITY & PASSWORD MANAGEMENT */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
            <div className="p-1.5 rounded bg-slate-100 text-slate-700">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-semibold text-slate-900">
                Security & Credential Management
              </h2>
              <p className="text-[10px] text-slate-500 font-mono">Bcrypt (Cost factor 12) • Audited State Change</p>
            </div>
          </div>

          {passwordSuccess && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded text-rose-800 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Current Password <span className="text-rose-500">*</span>
              </label>
              <PasswordInput
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current administrative password"
                required
                className="w-full text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                New Password <span className="text-rose-500">*</span>
              </label>
              <PasswordInput
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new strong password"
                required
                className="w-full text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Confirm New Password <span className="text-rose-500">*</span>
              </label>
              <PasswordInput
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
                className="w-full text-xs"
              />
            </div>

            {/* Password Strength Checklist */}
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-[11px] space-y-1">
              <div className="font-medium text-slate-700 mb-1">Password Complexity Rules:</div>
              <div className="grid grid-cols-2 gap-1 font-mono text-[10px]">
                <span className={hasMinLength ? 'text-emerald-700 font-semibold' : 'text-slate-400'}>
                  {hasMinLength ? '✓' : '○'} Min 8 characters
                </span>
                <span className={hasUpper ? 'text-emerald-700 font-semibold' : 'text-slate-400'}>
                  {hasUpper ? '✓' : '○'} 1 Uppercase letter
                </span>
                <span className={hasLower ? 'text-emerald-700 font-semibold' : 'text-slate-400'}>
                  {hasLower ? '✓' : '○'} 1 Lowercase letter
                </span>
                <span className={hasNumber ? 'text-emerald-700 font-semibold' : 'text-slate-400'}>
                  {hasNumber ? '✓' : '○'} 1 Numeric digit
                </span>
                <span className={hasSpecial ? 'text-emerald-700 font-semibold' : 'text-slate-400'}>
                  {hasSpecial ? '✓' : '○'} 1 Special symbol
                </span>
                <span className={newPassword && passwordsMatch ? 'text-emerald-700 font-semibold' : 'text-slate-400'}>
                  {newPassword && passwordsMatch ? '✓ Passwords match' : '○ Matching confirmation'}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword || !isPasswordValid || !passwordsMatch}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded text-xs font-semibold shadow-xs transition-colors inline-flex items-center gap-1.5"
              >
                {passwordLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <Key className="w-3.5 h-3.5" />
                    <span>Update Password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* 2. REAL-TIME SYSTEM TELEMETRY */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
            <div className="p-1.5 rounded bg-slate-100 text-slate-700">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-semibold text-slate-900">
                Live System Telemetry
              </h2>
              <p className="text-[10px] text-slate-500 font-mono">Backend Diagnostics & Heartbeat</p>
            </div>
          </div>

          {telemetryError ? (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded">
              {telemetryError}
            </div>
          ) : telemetryLoading && !telemetry ? (
            <div className="py-8 text-center text-xs text-slate-500 flex flex-col items-center justify-center">
              <RefreshCw className="w-4 h-4 animate-spin text-slate-600 mb-2" />
              <span>Querying backend diagnostics...</span>
            </div>
          ) : telemetry ? (
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Database Engine</span>
                <span className="font-mono text-slate-800 font-medium">
                  {telemetry.database.version}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Database Ping Latency</span>
                <span className="font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                  {telemetry.database.latencyMs} ms (Connected)
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Connection Pool (pg.Pool)</span>
                <span className="font-mono text-slate-700">
                  {telemetry.database.pool.total} total • {telemetry.database.pool.idle} idle • {telemetry.database.pool.waiting} waiting
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Node Runtime</span>
                <span className="font-mono text-slate-700">{telemetry.server.nodeVersion}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Process Memory Usage</span>
                <span className="font-mono text-slate-700">
                  {telemetry.server.memoryMb.heapUsed}MB heap / {telemetry.server.memoryMb.rss}MB RSS
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Server Process Uptime</span>
                <span className="font-mono text-slate-700">
                  {formatUptime(telemetry.server.uptimeSeconds)}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Application Environment</span>
                <span className="font-mono uppercase text-slate-700">
                  {telemetry.server.environment}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">Last Telemetry Refresh</span>
                <span className="font-mono text-[10px] text-slate-400">
                  {new Date(telemetry.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ) : null}
        </div>

        {/* 3. SESSION GOVERNANCE & ACCESS CONTROL */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
            <div className="p-1.5 rounded bg-slate-100 text-slate-700">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-semibold text-slate-900">
                Session Governance & Controls
              </h2>
              <p className="text-[10px] text-slate-500 font-mono">public.session • Active Pruning (900s)</p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Active Operator</span>
              <span className="font-medium text-slate-900">{user?.email}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Assigned Privilege</span>
              <span className="font-mono text-[10px] uppercase bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-semibold">
                {user?.role}
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Client Remote IP</span>
              <span className="font-mono text-slate-700">
                {telemetry?.sessions.currentSession.ipAddress || '127.0.0.1'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Platform Active Sessions</span>
              <span className="font-mono text-slate-900 font-semibold">
                {telemetry?.sessions.activeSessionsCount ?? '—'} active sessions in database
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500">Cookie Security Policy</span>
              <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                HttpOnly • SameSite: Lax • 7-Day TTL
              </span>
            </div>
          </div>

          {revokeError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded text-rose-800 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{revokeError}</span>
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2">
            <button
              type="button"
              onClick={signOut}
              className="w-full sm:w-auto px-3 py-1.5 text-xs text-slate-700 hover:text-slate-900 font-medium rounded border border-slate-200 hover:bg-slate-50 transition-colors inline-flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-500" />
              <span>Sign Out Current Device</span>
            </button>

            {!revokeConfirm ? (
              <button
                type="button"
                onClick={() => setRevokeConfirm(true)}
                className="w-full sm:w-auto px-3 py-1.5 text-xs text-rose-600 hover:text-rose-700 font-medium rounded border border-rose-200 hover:bg-rose-50 transition-colors inline-flex items-center justify-center gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Revoke All Devices</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <button
                  type="button"
                  disabled={revokeLoading}
                  onClick={handleRevokeAllSessions}
                  className="px-2.5 py-1 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded transition-colors"
                >
                  {revokeLoading ? 'Revoking...' : 'Confirm Revoke All'}
                </button>
                <button
                  type="button"
                  disabled={revokeLoading}
                  onClick={() => setRevokeConfirm(false)}
                  className="px-2 py-1 text-xs text-slate-500 hover:text-slate-700 border border-slate-200 rounded"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 4. TRANSACTIONAL INVARIANTS & INTEGRITY RULES */}
        <div className="bg-slate-900 text-slate-200 p-4 rounded-lg shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
            <ShieldCheck className="w-4 h-4" />
            <span>Institutional Transactional Invariants & State Machine</span>
          </div>
          <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
            <p>
              • <strong className="text-white">Active Enrollment Guarantee:</strong> Every student account in state <code className="bg-slate-800 px-1 py-0.5 rounded text-emerald-300 font-mono">active</code> is guaranteed to have at least one active enrollment record. This invariant is enforced at the database transaction layer using row-level concurrency locks (<code className="bg-slate-800 px-1 py-0.5 rounded text-slate-200 font-mono">SELECT ... FOR UPDATE</code>) on both candidate applications and target cohorts.
            </p>
            <p>
              • <strong className="text-white">Safe Deletion & Dependency Checks:</strong> Programs, Cohorts, and Instructors cannot be deleted while dependent records exist. Deletions are safely blocked by server-side verification with explicit dependency explanations and audit trails.
            </p>
            <p>
              • <strong className="text-white">Immutable Security Journal:</strong> All password updates, user activations, role assignments, and deletions append unmodifiable records to <code className="bg-slate-800 px-1 py-0.5 rounded text-cyan-300 font-mono">audit_logs</code>. Deletion or truncation of audit history is architecturally forbidden.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
