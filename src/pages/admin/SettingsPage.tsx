import React from 'react';
import {
  ShieldCheck,
  Database,
  Key,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="pb-3 border-b border-slate-200">
        <h1 className="text-base font-semibold text-slate-900 tracking-tight">
          System Infrastructure & Governance
        </h1>
        <p className="text-xs text-slate-500">
          Runtime environment configuration, session persistence telemetry, and transactional invariants.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Authentication & Session Architecture */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
            <div className="p-1.5 rounded bg-slate-100 text-slate-700">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-semibold text-slate-900">
                Server-Side Session Store
              </h2>
              <p className="text-[10px] text-slate-500 font-mono">connect-pg-simple / PostgreSQL</p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Persistence Store</span>
              <span className="font-mono text-slate-800">public.session</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Cookie Security Policy</span>
              <span className="font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                HttpOnly • SameSite: Lax
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Session Max Age</span>
              <span className="font-mono text-slate-700">7 Days (604,800s)</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Session Pruning Interval</span>
              <span className="font-mono text-emerald-700">Active (900s / 15m)</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500">Credential Hashing</span>
              <span className="font-mono text-slate-700">Bcrypt (Cost 12)</span>
            </div>
          </div>
        </div>

        {/* Database Engine */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
            <div className="p-1.5 rounded bg-slate-100 text-slate-700">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-semibold text-slate-900">
                Relational Database Cluster
              </h2>
              <p className="text-[10px] text-slate-500 font-mono">PostgreSQL 18</p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Database Name</span>
              <span className="font-mono text-slate-800">evolve_education_dev</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Connection Pool</span>
              <span className="font-mono text-slate-700">pg.Pool (Max 20 clients)</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Migration DDL</span>
              <span className="font-mono text-emerald-700">001_initial_schema.sql</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Rate Limiting Protection</span>
              <span className="font-mono text-slate-700">Auth & Applications Enabled</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500">Subdomain Isolation</span>
              <span className="font-mono text-emerald-700">admin.domain.com</span>
            </div>
          </div>
        </div>

        {/* Invariant Card */}
        <div className="md:col-span-2 bg-slate-900 text-slate-200 p-4 rounded-lg shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
            <ShieldCheck className="w-4 h-4" />
            <span>Institutional Transactional Invariant</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Every student account in state <code className="bg-slate-800 px-1 py-0.5 rounded text-emerald-300 font-mono">active</code> is guaranteed to have at least one active enrollment record.
            This invariant is enforced at the database transaction layer using row-level concurrency locks (<code className="bg-slate-800 px-1 py-0.5 rounded text-slate-200 font-mono">SELECT ... FOR UPDATE</code>) on both the candidate application and the selected cohort batch to prevent race-condition overbooking.
          </p>
        </div>

        {/* Active Operator */}
        <div className="md:col-span-2 bg-white p-4 rounded-lg border border-slate-200 shadow-xs text-xs space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">Active Session Identity</span>
          <div className="font-medium text-slate-900">{user?.email}</div>
          <div className="text-slate-500 font-mono text-[11px]">Role: {user?.role} • Status: {user?.account_status} • ID: {user?.id}</div>
        </div>
      </div>
    </div>
  );
};
