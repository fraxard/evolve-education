import React from 'react';
import { siteContent } from '../data/content';
import { ArrowUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const { footer, brand } = siteContent;

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleNavClick = (href: string) => {
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
    <footer className="bg-white border-t border-brand-border/80 pt-16 pb-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-brand-border-light">
          
          {/* Brand Col */}
          <div className="md:col-span-5 flex flex-col items-start">
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                scrollToTop();
              }}
              className="inline-block mb-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-leaf rounded-xl"
              aria-label="Evolve Education - Return to top"
            >
              <img
                src={brand.logoSrc}
                alt={brand.logoAlt}
                className="h-14 w-auto object-contain"
              />
            </a>

            <p className="font-display font-bold text-lg text-brand-leaf mb-2">
              "{footer.tagline}"
            </p>

            <p className="font-body text-sm text-brand-dark-muted max-w-sm leading-relaxed mb-6">
              {footer.mission}
            </p>

            {/* Neutral Connect note */}
            <div className="p-4 rounded-2xl bg-brand-cream/70 border border-brand-border max-w-sm">
              <span className="block text-xs font-accent font-semibold text-brand-blue uppercase tracking-wider mb-1">
                Connect with Evolve Education
              </span>
              <p className="text-xs text-brand-dark-muted font-body">
                Reach out via our admission enquiry form to confirm batch schedules and learn about our Abacus curriculum.
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3">
            <h4 className="font-display font-bold text-base text-brand-blue mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5 font-body text-sm">
              {footer.quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(link.href);
                    }}
                    className="text-brand-dark-muted hover:text-brand-leaf transition-colors inline-block"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Programs Column */}
          <div className="md:col-span-4">
            <h4 className="font-display font-bold text-base text-brand-blue mb-4">
              Programs
            </h4>
            <ul className="space-y-2.5 font-body text-sm">
              {footer.programs.map((program) => (
                <li key={program.label}>
                  <a
                    href={program.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(program.href);
                    }}
                    className="text-brand-dark-muted hover:text-brand-leaf transition-colors inline-block"
                  >
                    {program.label}
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-6 p-4 rounded-2xl bg-brand-cream/80 border border-brand-border/60">
              <p className="font-accent font-semibold text-xs text-brand-blue mb-1">
                Focused Abacus Training
              </p>
              <p className="font-body text-xs text-brand-dark-muted">
                Structured sessions designed to build number sense, concentration, and mental math fluency.
              </p>
            </div>
          </div>

        </div>

        {/* Footer Bottom Strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-body text-brand-dark-muted">
          <p>{footer.copyright}</p>

          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-cream-alt hover:bg-brand-border/60 text-brand-blue transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-leaf"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </footer>
  );
};
