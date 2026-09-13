import React from 'react';
import { siteContent } from '../data/content';
import { Search, Route, Users, Award } from 'lucide-react';

const StepIcon: React.FC<{ index: number }> = ({ index }) => {
  switch (index) {
    case 0:
      return <Search className="w-6 h-6 text-brand-leaf" />;
    case 1:
      return <Route className="w-6 h-6 text-brand-blue" />;
    case 2:
      return <Users className="w-6 h-6 text-brand-orange" />;
    case 3:
      return <Award className="w-6 h-6 text-brand-purple" />;
    default:
      return null;
  }
};

export const Methodology: React.FC = () => {
  const { methodology } = siteContent;

  return (
    <section id="methodology" className="py-20 md:py-28 bg-brand-cream relative overflow-hidden">
      {/* Decorative background aura */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] bg-brand-soft-yellow/15 rounded-full blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-soft-yellow/40 border border-brand-yellow/30 text-brand-dark font-accent text-sm font-semibold mb-3">
            <span>Section {methodology.sectionNumber}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
            <span>Learning Roadmap</span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-brand-blue mb-4">
            {methodology.heading}
          </h2>
          <p className="font-body text-base sm:text-lg text-brand-dark-muted leading-relaxed">
            {methodology.subheading}
          </p>
        </div>

        {/* Desktop Process with Connecting Path (hidden on mobile, visible on lg) */}
        <div className="hidden lg:block relative mb-8">
          {/* Connecting Curved / Dashed Pathway */}
          <div className="absolute top-16 left-[10%] right-[10%] h-1 pointer-events-none -z-0">
            <svg className="w-full h-8 overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M 0,4 Q 250,24 500,4 T 1000,4"
                stroke="#678A48"
                strokeWidth="3"
                strokeDasharray="6 8"
                opacity="0.35"
              />
            </svg>
          </div>

          <div className="grid grid-cols-4 gap-6 relative z-10">
            {methodology.steps.map((step, idx) => (
              <div
                key={step.number}
                className="flex flex-col items-center text-center group"
              >
                {/* Numbered Badge with Step Icon */}
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-3xl bg-white border-2 border-brand-border shadow-card flex items-center justify-center group-hover:scale-105 group-hover:border-brand-leaf transition-all duration-300">
                    <StepIcon index={idx} />
                  </div>
                  {/* Fredoka step indicator badge */}
                  <span className="absolute -bottom-2.5 -right-2 px-2.5 py-0.5 rounded-full font-accent font-bold text-xs bg-brand-cream-alt text-brand-dark border border-brand-border shadow-xs">
                    {step.number}
                  </span>
                </div>

                {/* Step Stage Tag */}
                <span className="font-accent font-semibold text-xs tracking-wider text-brand-dark-muted mb-2 uppercase">
                  {step.step}
                </span>

                {/* Step Title */}
                <h3 className="font-display font-bold text-lg text-brand-blue mb-2.5">
                  {step.title}
                </h3>

                {/* Step Description */}
                <p className="font-body text-sm text-brand-dark-muted leading-relaxed px-2">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile / Tablet Vertical Timeline (visible on < lg) */}
        <div className="lg:hidden relative">
          {/* Vertical Connecting Line */}
          <div
            className="absolute top-8 bottom-8 left-8 w-1 bg-brand-leaf/25 rounded-full pointer-events-none"
            aria-hidden="true"
          />

          <div className="space-y-6">
            {methodology.steps.map((step, idx) => (
              <div
                key={step.number}
                className="relative flex items-start gap-5 pl-2 group"
              >
                {/* Step Icon Bubble */}
                <div className="relative z-10 w-12 h-12 rounded-2xl bg-white border-2 border-brand-border shadow-soft flex items-center justify-center flex-shrink-0 group-hover:border-brand-leaf transition-colors">
                  <span className="font-accent font-bold text-base text-brand-blue">
                    {step.number}
                  </span>
                </div>

                {/* Card Container */}
                <div className="flex-1 bg-white p-5 rounded-2xl border border-brand-border shadow-soft">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-accent font-semibold text-brand-dark-muted">
                      {step.step}
                    </span>
                    <StepIcon index={idx} />
                  </div>
                  <h3 className="font-display font-bold text-lg text-brand-blue mb-1">
                    {step.title}
                  </h3>
                  <p className="font-body text-sm text-brand-dark-muted leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Reassurance Banner */}
        <div className="mt-14 max-w-2xl mx-auto p-4 rounded-2xl bg-white/80 border border-brand-border/80 text-center flex items-center justify-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-leaf" />
          <p className="text-xs sm:text-sm font-body text-brand-dark-muted">
            Each stage adapts dynamically according to student evaluation and milestone reviews.
          </p>
        </div>

      </div>
    </section>
  );
};
