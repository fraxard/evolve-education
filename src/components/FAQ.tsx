import React, { useState } from 'react';
import { siteContent, FaqItem } from '../data/content';
import { Plus, Minus, HelpCircle } from 'lucide-react';

export const FAQ: React.FC = () => {
  const { faq } = siteContent;
  const [openIndices, setOpenIndices] = useState<number[]>([1]); // Default open item 1

  const toggleAccordion = (index: number) => {
    setOpenIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <section id="faq" className="py-20 md:py-28 bg-white relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-soft-yellow/50 border border-brand-yellow/30 text-brand-dark font-accent text-sm font-semibold mb-3">
            <span>Section {faq.sectionNumber}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow" />
            <span>Common Questions</span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-brand-blue mb-4">
            {faq.heading}
          </h2>
          <p className="font-body text-base sm:text-lg text-brand-dark-muted leading-relaxed">
            {faq.subheading}
          </p>
        </div>

        {/* Accessible Accordion List */}
        <div className="space-y-4" role="region" aria-label="Frequently Asked Questions">
          {faq.items.map((item: FaqItem, index: number) => {
            const isOpen = openIndices.includes(index);
            const questionId = `faq-q-${index}`;
            const answerId = `faq-a-${index}`;

            return (
              <div
                key={index}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-brand-cream-alt/40 border-brand-blue/30 shadow-soft'
                    : 'bg-white border-brand-border hover:border-brand-border/80 shadow-2xs'
                }`}
              >
                <h3>
                  <button
                    type="button"
                    id={questionId}
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                    onClick={() => toggleAccordion(index)}
                    className="w-full py-5 px-6 sm:px-7 text-left flex items-center justify-between gap-4 font-display font-bold text-lg sm:text-xl text-brand-blue hover:text-brand-leaf transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-leaf"
                  >
                    <span className="flex items-center gap-3">
                      <HelpCircle className="w-5 h-5 text-brand-orange flex-shrink-0" />
                      <span>{item.question}</span>
                    </span>
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-200 ${
                        isOpen ? 'bg-brand-leaf text-white rotate-180' : 'bg-brand-cream text-brand-blue'
                      }`}
                    >
                      {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </span>
                  </button>
                </h3>

                <div
                  id={answerId}
                  role="region"
                  aria-labelledby={questionId}
                  hidden={!isOpen}
                  className={`px-6 sm:px-7 pb-6 pt-1 transition-all ${
                    isOpen ? 'block opacity-100' : 'hidden opacity-0'
                  }`}
                >
                  <div className="pl-8 border-l-2 border-brand-leaf/40">
                    <p className="font-body text-sm sm:text-base text-brand-dark-muted leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Support Callout */}
        <div className="mt-12 p-6 rounded-2xl bg-brand-cream/80 border border-brand-border text-center">
          <p className="font-body text-sm text-brand-dark-muted mb-2">
            Have a specific question not addressed above?
          </p>
          <a
            href="#contact"
            className="font-display font-bold text-sm text-brand-leaf hover:text-brand-leaf-dark underline decoration-2 underline-offset-4"
          >
            Speak directly with an educational consultant →
          </a>
        </div>

      </div>
    </section>
  );
};
