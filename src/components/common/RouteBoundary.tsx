import React from 'react';
import { Link } from 'react-router-dom';
import { siteContent } from '../../data/content';
import { ROUTES } from '../../routes/paths';
import { ArrowLeft } from 'lucide-react';

interface RouteBoundaryProps {
  title: string;
  category: 'auth' | 'portal' | 'program' | 'page';
  path: string;
}

export const RouteBoundary: React.FC<RouteBoundaryProps> = ({
  title,
  category,
  path,
}) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-brand-cream text-brand-dark">
      <div className="w-full max-w-md p-8 bg-white rounded-3xl border border-brand-border shadow-card text-center">
        {/* Brand Logo */}
        <Link to={ROUTES.HOME} className="inline-block mb-6">
          <img
            src={siteContent.brand.logoSrc}
            alt={siteContent.brand.logoAlt}
            className="h-12 mx-auto object-contain"
          />
        </Link>

        {/* Temporary Boundary Notice */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-cream-alt text-brand-dark-muted font-accent text-xs font-semibold mb-4 border border-brand-border">
          <span>Route Boundary</span>
          <span>•</span>
          <span className="font-mono">{path}</span>
        </div>

        <h1 className="font-display font-bold text-2xl text-brand-blue mb-2">
          {title}
        </h1>

        <p className="font-body text-sm text-brand-dark-muted leading-relaxed mb-6">
          This route boundary is established for future {category === 'auth' ? 'authentication' : 'portal'} integration in Phase 2.
        </p>

        <Link
          to={ROUTES.HOME}
          className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 bg-brand-leaf hover:bg-brand-leaf-dark text-white font-display font-bold text-sm rounded-full shadow-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Home</span>
        </Link>
      </div>
    </div>
  );
};
