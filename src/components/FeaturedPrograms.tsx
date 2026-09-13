import React from 'react';
import { siteContent, ProgramItem } from '../data/content';
import { Check, ArrowRight, Sparkles, BookOpen } from 'lucide-react';

export const FeaturedPrograms: React.FC<{ onSelectProgram?: (programTitle: string) => void }> = ({
  onSelectProgram
}) => {
  const { featuredPrograms } = siteContent;

  const handleEnquire = (programTitle: string) => {
    if (onSelectProgram) {
      onSelectProgram(programTitle);
    }
    const el = document.querySelector('#contact');
    if (el) {
      const headerOffset = 70;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section id="programs" className="py-20 md:py-28 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-soft-green/30 border border-brand-leaf/20 text-brand-leaf font-accent text-sm font-semibold mb-3">
            <span>{featuredPrograms.eyebrow}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-brand-leaf" />
            <span>Structured Curriculum</span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-brand-blue mb-4">
            {featuredPrograms.heading}
          </h2>
          <p className="font-body text-base sm:text-lg text-brand-dark-muted leading-relaxed">
            {featuredPrograms.subheading}
          </p>
        </div>

        {/* Dedicated Single-Program Showcase Card (Abacus) */}
        <div id="abacus-program" className="scroll-mt-24 max-w-4xl mx-auto mb-16">
          {featuredPrograms.programs.map((program: ProgramItem) => (
            <div
              key={program.id}
              className="relative rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-brand-cream via-white to-brand-baby-blue/15 border-2 border-brand-leaf/30 shadow-card hover:shadow-hover transition-all duration-300"
            >
              {/* Top Row: Tag & Subtitle */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-2">
                  <span className="px-3.5 py-1 rounded-full text-xs font-accent font-bold bg-brand-leaf text-white tracking-wider">
                    FEATURED PROGRAM
                  </span>
                  {program.ageGroup && (
                    <span className="px-3 py-1 rounded-full text-xs font-accent font-semibold bg-brand-cream-alt text-brand-blue border border-brand-border">
                      {program.ageGroup}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-accent font-semibold text-brand-dark-muted">
                  <Sparkles className="w-4 h-4 text-brand-yellow" />
                  <span>Interactive & Hands-on</span>
                </div>
              </div>

              {/* Title & Description Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
                <div className="lg:col-span-7">
                  <h3 className="font-display font-extrabold text-3xl sm:text-4xl text-brand-blue mb-3">
                    {program.title}
                  </h3>
                  {program.subtitle && (
                    <p className="font-accent font-semibold text-base text-brand-leaf mb-4">
                      {program.subtitle}
                    </p>
                  )}
                  <p className="font-body text-brand-dark-muted text-base sm:text-lg leading-relaxed mb-6">
                    {program.description}
                  </p>
                </div>

                {/* Highlights Checklist */}
                <div className="lg:col-span-5 bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-brand-border/80 shadow-soft">
                  <h4 className="font-display font-bold text-sm text-brand-blue mb-4 uppercase tracking-wider flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-brand-leaf" />
                    <span>Learning Focus</span>
                  </h4>
                  <ul className="space-y-3" aria-label="Abacus key learning focuses">
                    {program.highlights.map((highlight) => (
                      <li key={highlight} className="flex items-start gap-3 text-sm text-brand-dark font-body font-semibold">
                        <span className="w-5 h-5 rounded-full bg-brand-soft-green/40 text-brand-leaf flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-brand-border flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <button
                  type="button"
                  onClick={() => handleEnquire(program.title)}
                  className="px-8 py-3.5 bg-brand-leaf hover:bg-brand-leaf-dark text-white font-display font-bold text-base rounded-full shadow-card hover:shadow-hover transition-all duration-200 flex items-center justify-center gap-2 hover:-translate-y-0.5"
                >
                  <span>{program.secondaryCta}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleEnquire(program.title)}
                  className="px-6 py-3.5 bg-white hover:bg-brand-cream-alt text-brand-blue border border-brand-border font-display font-bold text-base rounded-full shadow-xs hover:shadow transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <span>{program.primaryCta}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* All Programs Directory Footer Card (Scalable Architecture) */}
        <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-3xl bg-brand-cream-alt/60 border border-brand-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <h4 className="font-display font-bold text-lg text-brand-blue">
                {featuredPrograms.allProgramsInfo.title}
              </h4>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-accent font-bold bg-white text-brand-blue border border-brand-border">
                {featuredPrograms.allProgramsInfo.countLabel}
              </span>
            </div>
            <p className="font-body text-xs sm:text-sm text-brand-dark-muted max-w-lg leading-relaxed">
              {featuredPrograms.allProgramsInfo.note}
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleEnquire('General Consultation')}
            className="px-6 py-3 bg-white hover:bg-brand-cream text-brand-blue font-display font-bold text-sm rounded-full border border-brand-border shadow-xs hover:shadow transition-all duration-200 flex-shrink-0 flex items-center gap-2"
          >
            <span>Consult on Programs</span>
            <ArrowRight className="w-3.5 h-3.5 text-brand-orange" />
          </button>
        </div>

      </div>
    </section>
  );
};
