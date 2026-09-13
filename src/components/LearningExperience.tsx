import React from 'react';
import { siteContent, LearningPillar } from '../data/content';
import { Target, TrendingUp, HeartHandshake, Sparkles } from 'lucide-react';

const PillarIcon: React.FC<{ iconName: string }> = ({ iconName }) => {
  switch (iconName) {
    case 'Target':
      return <Target className="w-6 h-6 text-brand-leaf" />;
    case 'TrendingUp':
      return <TrendingUp className="w-6 h-6 text-brand-blue" />;
    case 'HeartHandshake':
      return <HeartHandshake className="w-6 h-6 text-brand-purple" />;
    default:
      return <Sparkles className="w-6 h-6 text-brand-yellow" />;
  }
};

export const LearningExperience: React.FC = () => {
  const { learningExperience } = siteContent;

  return (
    <section id="learning-experience" className="py-20 md:py-28 bg-brand-cream-alt/50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-lavender/40 border border-brand-purple/20 text-brand-purple font-accent text-sm font-semibold mb-3">
            <span>Section {learningExperience.sectionNumber}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-brand-purple" />
            <span>{learningExperience.eyebrow}</span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-brand-blue mb-4">
            {learningExperience.heading}
          </h2>
          <p className="font-body text-base sm:text-lg text-brand-dark-muted leading-relaxed">
            {learningExperience.subheading}
          </p>
        </div>

        {/* 3 Learning Environment Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {learningExperience.pillars.map((pillar: LearningPillar, index: number) => {
            const pillarBorders = [
              'border-brand-leaf/30 hover:border-brand-leaf',
              'border-brand-blue/30 hover:border-brand-blue',
              'border-brand-purple/30 hover:border-brand-purple'
            ];
            const iconBgs = [
              'bg-brand-soft-green/30',
              'bg-brand-baby-blue/30',
              'bg-brand-lavender/30'
            ];

            return (
              <div
                key={pillar.title}
                className={`bg-white rounded-3xl p-8 border shadow-soft hover:shadow-card transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 ${pillarBorders[index % pillarBorders.length]}`}
              >
                <div>
                  <div className={`w-14 h-14 rounded-2xl ${iconBgs[index % iconBgs.length]} flex items-center justify-center mb-6`}>
                    <PillarIcon iconName={pillar.iconName} />
                  </div>

                  <h3 className="font-display font-bold text-2xl text-brand-blue mb-3">
                    {pillar.title}
                  </h3>

                  <p className="font-body text-base text-brand-dark-muted leading-relaxed">
                    {pillar.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-brand-border-light flex items-center justify-between text-xs font-accent text-brand-dark-muted">
                  <span>Educational Principle</span>
                  <span className="font-bold text-brand-blue">0{index + 1}</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
