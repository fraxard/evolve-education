import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowLeft } from 'lucide-react';
import { APP_ROUTES } from '../../routes/paths';

interface PlaceholderViewProps {
  title: string;
  phase: string;
  description: string;
  role: 'teacher' | 'student';
}

export const PlaceholderView: React.FC<PlaceholderViewProps> = ({
  title,
  phase,
  description,
  role,
}) => {
  const isTeacher = role === 'teacher';

  return (
    <div className="p-6 max-w-4xl mx-auto font-body">
      {/* Breadcrumb / Top Return */}
      <div className="mb-6">
        <Link
          to={APP_ROUTES.DASHBOARD}
          className={`inline-flex items-center gap-1.5 text-xs font-medium transition-colors ${
            isTeacher
              ? 'text-slate-400 hover:text-slate-200'
              : 'text-brand-blue/70 hover:text-brand-blue'
          }`}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Main Placeholder Container */}
      <div
        className={`rounded-xl border p-8 sm:p-10 text-center ${
          isTeacher
            ? 'bg-slate-900/60 border-slate-800 text-slate-200'
            : 'bg-white border-slate-200 shadow-xs text-slate-800'
        }`}
      >
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${
            isTeacher
              ? 'bg-slate-800 border border-slate-700 text-amber-400'
              : 'bg-brand-cream border border-brand-yellow/40 text-brand-blue'
          }`}
        >
          <Clock className="w-6 h-6" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium mb-3 border">
          <span
            className={`w-2 h-2 rounded-full ${
              isTeacher ? 'bg-amber-400' : 'bg-emerald-500'
            }`}
          />
          <span
            className={
              isTeacher ? 'text-amber-300 border-amber-500/20' : 'text-slate-600'
            }
          >
            {phase}
          </span>
        </div>

        <h1
          className={`text-xl sm:text-2xl font-display font-semibold mb-2 ${
            isTeacher ? 'text-white' : 'text-slate-900'
          }`}
        >
          {title}
        </h1>

        <p
          className={`max-w-md mx-auto text-xs sm:text-sm mb-6 leading-relaxed ${
            isTeacher ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          {description}
        </p>

        <div
          className={`pt-6 border-t text-xs font-mono max-w-sm mx-auto ${
            isTeacher
              ? 'border-slate-800 text-slate-500'
              : 'border-slate-100 text-slate-400'
          }`}
        >
          Operational App Shell Foundation verified. No mock or fake data is rendered.
        </div>
      </div>
    </div>
  );
};
