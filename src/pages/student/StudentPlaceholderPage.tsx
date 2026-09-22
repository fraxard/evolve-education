import React from 'react';
import { LucideIcon, Info, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface StudentPlaceholderPageProps {
  title: string;
  subtitle: string;
  stageBadge: string;
  icon: LucideIcon;
  description: string;
  upcomingFeatures: string[];
}

export const StudentPlaceholderPage: React.FC<StudentPlaceholderPageProps> = ({
  title,
  subtitle,
  stageBadge,
  icon: Icon,
  description,
  upcomingFeatures,
}) => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-leaf/10 border border-brand-leaf/20 text-brand-leaf flex items-center justify-center">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-brand-blue">{title}</h1>
            <p className="text-xs text-slate-500 font-body">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold font-mono bg-amber-50 border border-amber-200 text-amber-800">
            <Sparkles className="w-3 h-3 text-amber-600" />
            {stageBadge}
          </span>
        </div>
      </div>

      {/* Foundation Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs max-w-3xl">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 text-brand-blue flex items-center justify-center shrink-0 mt-0.5">
            <Info className="w-4 h-4" />
          </div>
          <div className="space-y-2">
            <h2 className="text-sm font-bold font-display text-slate-800">
              Foundation Active for {user?.fullName || 'Student'}
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed font-body">
              {description}
            </p>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono mb-3">
            Upcoming Data-Driven Integration
          </h3>
          <ul className="space-y-2 text-xs text-slate-600">
            {upcomingFeatures.map((feature, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-leaf shrink-0"></span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>Session Source: PostgreSQL (Auth State Active)</span>
          <span>Role: {user?.role?.toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
};
