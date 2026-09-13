import React from 'react';
import { siteContent } from '../data/content';
import { ArrowRight, BookOpen, CheckCircle2 } from 'lucide-react';
import { StarDoodle, DottedTrail } from './DecorativeShapes';

export const Hero: React.FC<{ onExploreAbacus?: () => void }> = ({ onExploreAbacus }) => {
  const { hero } = siteContent;

  const scrollToSection = (href: string) => {
    if (href === '#abacus-program' && onExploreAbacus) {
      onExploreAbacus();
    }
    const el = document.querySelector(href);
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
    <section
      id="home"
      className="relative pt-[90px] pb-16 md:pt-[110px] md:pb-24 lg:pt-[130px] lg:pb-28 overflow-hidden bg-gradient-to-b from-brand-cream via-brand-cream to-white"
    >
      {/* Background Soft Blobs */}
      <div
        className="absolute top-12 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-brand-baby-blue/20 rounded-full blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />
      <div
        className="absolute -top-10 -right-20 w-[420px] h-[420px] bg-brand-soft-yellow/25 rounded-full blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-10 left-[-80px] w-[360px] h-[360px] bg-brand-soft-green/20 rounded-full blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headlines & Call to Actions */}
          <div className="lg:col-span-6 flex flex-col items-start text-left z-10">
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-soft-yellow/60 border border-brand-yellow/30 text-brand-dark font-accent text-sm font-semibold mb-5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-brand-orange animate-ping" />
              <span>{hero.eyebrow}</span>
              <StarDoodle size={14} color="#CFB850" />
            </div>

            {/* Main Headline */}
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl text-brand-blue tracking-tight leading-[1.12] mb-6">
              Small Steps.{' '}
              <span className="relative inline-block text-brand-leaf whitespace-nowrap">
                Brighter Futures.
                <svg
                  className="absolute -bottom-2.5 left-0 w-full h-3 text-brand-yellow/80 pointer-events-none"
                  viewBox="0 0 260 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M3 10.5C65 3.5 190 3.5 257 8.5"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            {/* Supporting Copy */}
            <p className="font-body text-lg sm:text-xl text-brand-dark-muted leading-relaxed mb-8 max-w-xl">
              {hero.supportingCopy}
            </p>

            {/* CTA Group */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-10">
              <button
                type="button"
                onClick={() => scrollToSection(hero.primaryCta.href)}
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-brand-leaf hover:bg-brand-leaf-dark text-white font-display font-bold text-lg rounded-full shadow-card hover:shadow-hover transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>{hero.primaryCta.label}</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => scrollToSection(hero.secondaryCta.href)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-brand-cream-alt text-brand-blue border-2 border-brand-border hover:border-brand-yellow font-display font-bold text-lg rounded-full shadow-xs hover:shadow transition-all duration-200"
              >
                <span>{hero.secondaryCta.label}</span>
              </button>
            </div>

            {/* Trust highlights */}
            <div className="pt-6 border-t border-brand-border/70 w-full flex flex-wrap items-center gap-x-6 gap-y-2">
              {hero.trustBadges.map((badge) => (
                <div key={badge} className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-brand-dark-muted font-body">
                  <CheckCircle2 className="w-4 h-4 text-brand-leaf flex-shrink-0" />
                  <span>{badge}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Educational Abacus Visual Composition */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            {/* Playful Dotted Trail */}
            <DottedTrail className="absolute -top-6 right-8 w-28 h-12 hidden sm:block" />

            {/* Main Composition Container */}
            <div className="relative w-full max-w-[520px] aspect-[4/3.7] flex items-center justify-center">
              
              {/* Organic Backdrop Shapes */}
              <div
                className="absolute inset-0 bg-gradient-to-tr from-brand-soft-green/35 via-brand-baby-blue/30 to-brand-soft-yellow/40 rounded-[2.5rem] transform -rotate-1 shadow-card border border-white/60"
                aria-hidden="true"
              />

              {/* Central Educational Illustrated Vignette */}
              <div className="relative z-10 w-[88%] h-[88%] bg-white/95 backdrop-blur-sm rounded-[2rem] p-6 shadow-sm border border-brand-border/60 flex flex-col justify-between overflow-hidden">
                
                {/* Visual Header */}
                <div className="flex items-center justify-between pb-3 border-b border-brand-border-light">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-brand-leaf/80" />
                    <span className="w-3 h-3 rounded-full bg-brand-yellow/80" />
                    <span className="w-3 h-3 rounded-full bg-brand-orange/80" />
                  </div>
                  <div className="flex items-center gap-1.5 font-accent font-semibold text-xs text-brand-blue bg-brand-baby-blue/40 px-3 py-1 rounded-full">
                    <BookOpen className="w-3.5 h-3.5 text-brand-blue" />
                    <span>Abacus & Mental Math</span>
                  </div>
                </div>

                {/* Illustrated Scene Graphic */}
                <div className="relative flex-1 my-3 flex items-center justify-center">
                  <svg
                    viewBox="0 0 360 220"
                    className="w-full h-full max-h-[220px]"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Illustration of Abacus learning and number confidence"
                  >
                    {/* Desk / Base */}
                    <rect x="50" y="170" width="260" height="12" rx="6" fill="#F0B76A" opacity="0.6" />
                    <rect x="70" y="182" width="10" height="28" rx="3" fill="#D88B33" opacity="0.4" />
                    <rect x="280" y="182" width="10" height="28" rx="3" fill="#D88B33" opacity="0.4" />

                    {/* Prominent Abacus Frame on Desk */}
                    <g transform="translate(110, 85)">
                      {/* Outer Frame */}
                      <rect x="0" y="0" width="140" height="85" rx="8" fill="#FFFFFF" stroke="#38588C" strokeWidth="3" />
                      {/* Center Divider Bar */}
                      <rect x="4" y="24" width="132" height="6" fill="#678A48" rx="2" />
                      
                      {/* Vertical Rods */}
                      <line x1="25" y1="4" x2="25" y2="81" stroke="#CFB850" strokeWidth="2.5" />
                      <line x1="50" y1="4" x2="50" y2="81" stroke="#CFB850" strokeWidth="2.5" />
                      <line x1="75" y1="4" x2="75" y2="81" stroke="#CFB850" strokeWidth="2.5" />
                      <line x1="100" y1="4" x2="100" y2="81" stroke="#CFB850" strokeWidth="2.5" />
                      <line x1="120" y1="4" x2="120" y2="81" stroke="#CFB850" strokeWidth="2.5" />

                      {/* Upper Deck Beads (5s) */}
                      <ellipse cx="25" cy="14" rx="7" ry="5" fill="#38588C" />
                      <ellipse cx="50" cy="14" rx="7" ry="5" fill="#8F6BD4" />
                      <ellipse cx="75" cy="14" rx="7" ry="5" fill="#38588C" />
                      <ellipse cx="100" cy="14" rx="7" ry="5" fill="#8F6BD4" />
                      <ellipse cx="120" cy="14" rx="7" ry="5" fill="#38588C" />

                      {/* Lower Deck Beads (1s) */}
                      <ellipse cx="25" cy="40" rx="7" ry="5" fill="#D88B33" />
                      <ellipse cx="25" cy="52" rx="7" ry="5" fill="#D88B33" />
                      <ellipse cx="50" cy="45" rx="7" ry="5" fill="#678A48" />
                      <ellipse cx="75" cy="42" rx="7" ry="5" fill="#D88B33" />
                      <ellipse cx="75" cy="54" rx="7" ry="5" fill="#D88B33" />
                      <ellipse cx="100" cy="65" rx="7" ry="5" fill="#678A48" />
                      <ellipse cx="120" cy="45" rx="7" ry="5" fill="#D88B33" />
                    </g>

                    {/* Caterpillar Growth Motif (brand-inspired) */}
                    <g transform="translate(60, 115)">
                      <circle cx="0" cy="10" r="7" fill="#678A48" />
                      <circle cx="10" cy="8" r="7" fill="#9FC87B" />
                      <circle cx="20" cy="10" r="7" fill="#678A48" />
                      <circle cx="30" cy="7" r="8" fill="#55723B" />
                      <path d="M28 2 Q 26 -5 22 -6" stroke="#55723B" strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M32 2 Q 34 -5 38 -6" stroke="#55723B" strokeWidth="1.5" strokeLinecap="round" />
                      <circle cx="31" cy="6" r="1.2" fill="#FFFFFF" />
                    </g>

                    {/* Butterfly Flutter Motif (brand-inspired outcome) */}
                    <g transform="translate(275, 45)">
                      <path d="M0 8 C -12 -6, -18 6, 0 12" fill="#8F6BD4" opacity="0.85" />
                      <path d="M0 12 C -10 16, -12 24, 0 18" fill="#B4A0E8" opacity="0.85" />
                      <path d="M0 8 C 12 -6, 18 6, 0 12" fill="#8F6BD4" opacity="0.85" />
                      <path d="M0 12 C 10 16, 12 24, 0 18" fill="#B4A0E8" opacity="0.85" />
                      <ellipse cx="0" cy="11" rx="2" ry="7" fill="#38588C" />
                      <circle cx="18" cy="-2" r="2" fill="#CFB850" />
                    </g>

                    {/* Floating Mathematical & Focus Symbols */}
                    <text x="50" y="65" fill="#38588C" fontSize="18" fontFamily="Fredoka" fontWeight="700" opacity="0.7">1</text>
                    <text x="85" y="42" fill="#D88B33" fontSize="20" fontFamily="Fredoka" fontWeight="700" opacity="0.8">2</text>
                    <text x="135" y="32" fill="#678A48" fontSize="22" fontFamily="Fredoka" fontWeight="700" opacity="0.8">3</text>
                    <text x="195" y="38" fill="#8F6BD4" fontSize="20" fontFamily="Fredoka" fontWeight="700" opacity="0.7">+</text>
                    <text x="240" y="40" fill="#CFB850" fontSize="22" fontFamily="Fredoka" fontWeight="700" opacity="0.8">×</text>
                  </svg>
                </div>

                {/* Visual Bottom Bar */}
                <div className="flex items-center justify-between pt-3 border-t border-brand-border-light text-xs font-accent font-semibold text-brand-dark-muted">
                  <span className="flex items-center gap-1 text-brand-leaf">
                    <span className="w-2 h-2 rounded-full bg-brand-leaf inline-block" />
                    Mental Calculation
                  </span>
                  <span className="text-brand-orange">
                    Active Concentration
                  </span>
                </div>
              </div>

              {/* Floating Badge 1 (Top Left) */}
              <div className="absolute -top-4 -left-4 sm:-left-6 bg-white py-2 px-4 rounded-2xl shadow-card border border-brand-border/60 flex items-center gap-2.5 z-20">
                <div className="w-8 h-8 rounded-xl bg-brand-soft-green/30 flex items-center justify-center text-brand-leaf">
                  <span className="font-accent font-bold text-sm">🌱</span>
                </div>
                <div>
                  <p className="font-accent font-bold text-xs text-brand-blue">Small Steps</p>
                  <p className="font-body text-[11px] text-brand-dark-muted">Step-by-step Mastery</p>
                </div>
              </div>

              {/* Floating Badge 2 (Bottom Right) */}
              <div className="absolute -bottom-4 -right-4 sm:-right-6 bg-white py-2.5 px-4 rounded-2xl shadow-card border border-brand-border/60 flex items-center gap-2.5 z-20">
                <div className="w-8 h-8 rounded-xl bg-brand-baby-blue/40 flex items-center justify-center text-brand-blue">
                  <span className="font-accent font-bold text-sm">🦋</span>
                </div>
                <div>
                  <p className="font-accent font-bold text-xs text-brand-blue">Brighter Futures</p>
                  <p className="font-body text-[11px] text-brand-dark-muted">Number Confidence</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
