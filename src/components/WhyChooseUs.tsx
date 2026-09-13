import React from 'react';
import { siteContent } from '../data/content';
import { StarDoodle } from './DecorativeShapes';

// Custom friendly educational illustrations for each card
const CardIllustration: React.FC<{ type: string }> = ({ type }) => {
  switch (type) {
    case 'personalized':
      return (
        <svg viewBox="0 0 100 100" className="w-16 h-16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="42" fill="#EBF3E5" />
          <path d="M50 72 V45" stroke="#678A48" strokeWidth="4" strokeLinecap="round" />
          <path d="M50 55 C 38 52, 34 40, 48 40" fill="#9FC87B" stroke="#678A48" strokeWidth="2" />
          <path d="M50 48 C 62 45, 66 33, 52 33" fill="#678A48" stroke="#55723B" strokeWidth="2" />
          <circle cx="50" cy="26" r="4" fill="#CFB850" />
          <circle cx="28" cy="65" r="2.5" fill="#678A48" opacity="0.6" />
          <circle cx="72" cy="65" r="2.5" fill="#678A48" opacity="0.6" />
        </svg>
      );
    case 'focused':
      return (
        <svg viewBox="0 0 100 100" className="w-16 h-16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="42" fill="#EBF1FA" />
          {/* Target / Focus concentric rings */}
          <circle cx="50" cy="50" r="28" stroke="#38588C" strokeWidth="2" strokeDasharray="4 4" />
          <circle cx="50" cy="50" r="18" fill="#FFFFFF" stroke="#38588C" strokeWidth="2.5" />
          <circle cx="50" cy="50" r="8" fill="#38588C" />
          {/* Spark of focus */}
          <circle cx="50" cy="22" r="3" fill="#CFB850" />
          <circle cx="78" cy="50" r="3" fill="#CFB850" />
        </svg>
      );
    case 'interactive':
      return (
        <svg viewBox="0 0 100 100" className="w-16 h-16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="42" fill="#FAF6DF" />
          <path
            d="M50 28 C 42 28, 36 34, 36 42 C 36 48, 41 52, 43 56 L 57 56 C 59 52, 64 48, 64 42 C 64 34, 58 28, 50 28 Z"
            fill="#CFB850"
            stroke="#968228"
            strokeWidth="2"
          />
          <rect x="44" y="58" width="12" height="4" rx="1.5" fill="#D88B33" />
          <rect x="46" y="64" width="8" height="3" rx="1.5" fill="#D88B33" />
          <line x1="28" y1="42" x2="22" y2="42" stroke="#D88B33" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="72" y1="42" x2="78" y2="42" stroke="#D88B33" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="34" y1="26" x2="30" y2="22" stroke="#D88B33" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="66" y1="26" x2="70" y2="22" stroke="#D88B33" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 'progressive':
      return (
        <svg viewBox="0 0 100 100" className="w-16 h-16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="42" fill="#F2EDFB" />
          <rect x="28" y="58" width="12" height="14" rx="2" fill="#B4A0E8" />
          <rect x="44" y="46" width="12" height="26" rx="2" fill="#8F6BD4" />
          <rect x="60" y="34" width="12" height="38" rx="2" fill="#6F4FB0" />
          <path d="M30 50 Q 48 38 66 22" stroke="#8F6BD4" strokeWidth="2" strokeDasharray="3 3" />
          <polygon points="68,14 70,19 75,20 71,24 72,29 68,26 63,29 65,24 61,20 66,19" fill="#CFB850" />
        </svg>
      );
    default:
      return null;
  }
};

export const WhyChooseUs: React.FC = () => {
  const { whyChooseUs } = siteContent;

  const cardThemeStyles = {
    leaf: {
      cardBg: 'bg-white',
      borderHover: 'hover:border-brand-leaf/50',
      numColor: 'text-brand-leaf',
      pillBg: 'bg-brand-leaf/10 text-brand-leaf-dark',
      badgeBorder: 'border-brand-leaf/20',
      accentTop: 'bg-brand-leaf'
    },
    blue: {
      cardBg: 'bg-white',
      borderHover: 'hover:border-brand-blue/50',
      numColor: 'text-brand-blue',
      pillBg: 'bg-brand-blue/10 text-brand-blue-dark',
      badgeBorder: 'border-brand-blue/20',
      accentTop: 'bg-brand-blue'
    },
    yellow: {
      cardBg: 'bg-white',
      borderHover: 'hover:border-brand-yellow/60',
      numColor: 'text-brand-orange',
      pillBg: 'bg-brand-yellow/15 text-brand-orange-dark',
      badgeBorder: 'border-brand-yellow/30',
      accentTop: 'bg-brand-yellow'
    },
    purple: {
      cardBg: 'bg-white',
      borderHover: 'hover:border-brand-purple/50',
      numColor: 'text-brand-purple',
      pillBg: 'bg-brand-purple/10 text-brand-purple',
      badgeBorder: 'border-brand-purple/20',
      accentTop: 'bg-brand-purple'
    }
  };

  return (
    <section id="why-us" className="py-20 md:py-28 bg-brand-cream-alt/40 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-baby-blue/40 border border-brand-blue/20 text-brand-blue font-accent text-sm font-semibold mb-3">
            <span>Section {whyChooseUs.sectionNumber}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-brand-blue" />
            <span>Key Differentiators</span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-brand-blue mb-4">
            {whyChooseUs.heading}
          </h2>
          <p className="font-body text-base sm:text-lg text-brand-dark-muted leading-relaxed">
            {whyChooseUs.subheading}
          </p>
        </div>

        {/* 4 Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {whyChooseUs.cards.map((card) => {
            const theme = cardThemeStyles[card.accentColor];

            return (
              <div
                key={card.id}
                className={`relative flex flex-col justify-between p-7 rounded-3xl bg-white border border-brand-border shadow-card ${theme.borderHover} hover:shadow-hover transition-all duration-300 hover:-translate-y-1 group`}
              >
                {/* Top Subtle Color Accent Bar */}
                <div
                  className={`absolute top-0 left-8 right-8 h-1.5 rounded-b-md ${theme.accentTop}`}
                  aria-hidden="true"
                />

                {/* Card Top: Number & Friendly Illustration */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className={`font-accent font-extrabold text-2xl tracking-wider ${theme.numColor}`}>
                      {card.number}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-accent font-bold ${theme.pillBg}`}>
                      Pillar {card.number}
                    </span>
                  </div>

                  {/* Custom Educational SVG Illustration */}
                  <div className="mb-6 flex items-center justify-center">
                    <CardIllustration type={card.id} />
                  </div>

                  {/* Card Title */}
                  <h3 className="font-display font-bold text-xl text-brand-blue mb-3 group-hover:text-brand-dark transition-colors">
                    {card.title}
                  </h3>

                  {/* Card Description */}
                  <p className="font-body text-sm text-brand-dark-muted leading-relaxed">
                    {card.description}
                  </p>
                </div>

                {/* Card Bottom Indicator */}
                <div className="pt-6 mt-4 border-t border-brand-border-light flex items-center justify-between text-xs font-accent text-brand-dark-muted">
                  <span className="font-medium">Foundational pillar</span>
                  <StarDoodle size={14} color="#CFB850" className="opacity-70 group-hover:opacity-100" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
