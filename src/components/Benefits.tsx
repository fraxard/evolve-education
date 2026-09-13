import React from 'react';
import { siteContent } from '../data/content';
import { Sparkles, Brain, Target, Calculator, ShieldCheck } from 'lucide-react';
import { StarDoodle } from './DecorativeShapes';

const BenefitIcon: React.FC<{ index: number }> = ({ index }) => {
  switch (index) {
    case 0:
      return <Calculator className="w-5 h-5 text-brand-orange" />;
    case 1:
      return <Target className="w-5 h-5 text-brand-leaf" />;
    case 2:
      return <Brain className="w-5 h-5 text-brand-blue" />;
    case 3:
      return <ShieldCheck className="w-5 h-5 text-brand-purple" />;
    default:
      return <Sparkles className="w-5 h-5 text-brand-leaf" />;
  }
};

export const Benefits: React.FC = () => {
  const { benefits } = siteContent;

  return (
    <section className="py-20 md:py-28 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Educational Outcome & Student Flourishing Visual */}
          <div className="lg:col-span-6 relative flex items-center justify-center order-2 lg:order-1">
            <div className="relative w-full max-w-[480px] aspect-[4/3.8] bg-brand-cream-alt/70 rounded-[2.5rem] p-6 sm:p-8 border border-brand-border flex flex-col justify-between overflow-hidden shadow-card">
              
              {/* Decorative background circle */}
              <div
                className="absolute -bottom-10 -right-10 w-64 h-64 bg-brand-soft-green/20 rounded-full blur-2xl pointer-events-none"
                aria-hidden="true"
              />

              {/* Graphic Header */}
              <div className="flex items-center justify-between z-10">
                <span className="px-3.5 py-1 rounded-full font-accent font-semibold text-xs bg-white text-brand-blue border border-brand-border shadow-xs">
                  Abacus Skill Progression
                </span>
                <div className="flex items-center gap-1">
                  <StarDoodle size={16} color="#CFB850" />
                  <StarDoodle size={16} color="#CFB850" />
                  <StarDoodle size={16} color="#CFB850" />
                </div>
              </div>

              {/* Central Custom Educational Growth SVG Artwork */}
              <div className="my-auto py-6 flex items-center justify-center z-10">
                <svg
                  viewBox="0 0 340 200"
                  className="w-full h-auto max-h-[190px]"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-label="Student milestone progression in Abacus learning"
                >
                  {/* Stepping Stones / Growth Pedestal */}
                  <rect x="30" y="160" width="70" height="24" rx="6" fill="#9FC87B" opacity="0.7" />
                  <rect x="110" y="130" width="70" height="54" rx="6" fill="#B4CEF7" opacity="0.7" />
                  <rect x="190" y="100" width="70" height="84" rx="6" fill="#CFB850" opacity="0.6" />
                  <rect x="270" y="70" width="50" height="114" rx="6" fill="#678A48" opacity="0.8" />

                  {/* Growth Curve */}
                  <path
                    d="M65 155 Q 145 120 225 90 T 295 55"
                    stroke="#38588C"
                    strokeWidth="3.5"
                    strokeDasharray="4 4"
                  />

                  {/* Milestone Points */}
                  <circle cx="65" cy="155" r="7" fill="#678A48" />
                  <circle cx="145" cy="125" r="7" fill="#38588C" />
                  <circle cx="225" cy="95" r="7" fill="#D88B33" />
                  <circle cx="295" cy="55" r="9" fill="#8F6BD4" />

                  {/* Shining Star on Summit */}
                  <polygon
                    points="295,30 299,40 310,42 301,49 304,60 295,54 286,60 289,49 280,42 291,40"
                    fill="#CFB850"
                  />

                  {/* Cheerful Motifs: Butterfly above milestone */}
                  <g transform="translate(195, 30)">
                    <ellipse cx="0" cy="8" rx="2" ry="6" fill="#38588C" />
                    <path d="M0 6 C -8 -2, -12 6, 0 10" fill="#8F6BD4" />
                    <path d="M0 6 C 8 -2, 12 6, 0 10" fill="#8F6BD4" />
                  </g>

                  {/* Micro-captions */}
                  <text x="40" y="177" fill="#1E293B" fontSize="10" fontFamily="Fredoka" fontWeight="600">Bead Basics</text>
                  <text x="122" y="152" fill="#1E293B" fontSize="10" fontFamily="Fredoka" fontWeight="600">Fluency</text>
                  <text x="195" y="122" fill="#1E293B" fontSize="10" fontFamily="Fredoka" fontWeight="600">Mental Math</text>
                </svg>
              </div>

              {/* Floating Outcome Stat Badge */}
              <div className="bg-white p-3.5 rounded-2xl border border-brand-border flex items-center justify-between z-10 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-brand-soft-green/40 flex items-center justify-center text-brand-leaf">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-accent font-bold text-xs text-brand-blue">Active Concentration</p>
                    <p className="font-body text-[11px] text-brand-dark-muted">Nurturing independent learning habits</p>
                  </div>
                </div>
                <span className="font-accent font-bold text-xs text-brand-leaf bg-brand-soft-green/20 px-2 py-0.5 rounded-md">
                  Abacus
                </span>
              </div>

            </div>
          </div>

          {/* Right Column: Heading & Outcomes List */}
          <div className="lg:col-span-6 flex flex-col justify-center order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-soft-green/30 border border-brand-leaf/20 text-brand-leaf font-accent text-sm font-semibold mb-3 w-fit">
              <span>Section {benefits.sectionNumber}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-leaf" />
              <span>{benefits.eyebrow}</span>
            </div>

            <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-brand-blue mb-5">
              {benefits.heading}
            </h2>

            <p className="font-body text-base sm:text-lg text-brand-dark-muted leading-relaxed mb-8">
              {benefits.subheading}
            </p>

            {/* 4 Benefits with Educational Icons */}
            <div className="space-y-6">
              {benefits.points.map((point, index) => (
                <div
                  key={point.title}
                  className="flex items-start gap-4 p-4 rounded-2xl bg-brand-cream/60 hover:bg-brand-cream border border-brand-border-light transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-white border border-brand-border shadow-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    <BenefitIcon index={index} />
                  </div>

                  <div>
                    <h3 className="font-display font-bold text-lg text-brand-blue mb-1">
                      {point.title}
                    </h3>
                    <p className="font-body text-sm text-brand-dark-muted leading-relaxed">
                      {point.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
