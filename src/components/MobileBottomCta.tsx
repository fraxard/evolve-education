import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

export const MobileBottomCta: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show when scrolled past hero (around 300px) and not at the very bottom
      const scrolled = window.scrollY > 300;
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        const contactTop = contactSection.getBoundingClientRect().top;
        // Hide if contact form is already in view
        setIsVisible(scrolled && contactTop > window.innerHeight * 0.7);
      } else {
        setIsVisible(scrolled);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = () => {
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

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Quick Enquiry Action"
      className="fixed bottom-4 left-4 right-4 z-30 md:hidden animate-fade-in"
    >
      <div className="bg-white/95 backdrop-blur-md p-2 pl-4 rounded-full border border-brand-border shadow-hover flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-orange" />
          <span className="font-accent font-bold text-xs text-brand-blue truncate">
            Begin Your Journey
          </span>
        </div>
        <button
          type="button"
          onClick={handleClick}
          className="py-2.5 px-5 bg-brand-leaf hover:bg-brand-leaf-dark text-white font-display font-bold text-xs rounded-full shadow-sm flex items-center gap-1.5 transition-colors flex-shrink-0"
        >
          <span>Enquire Now</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
