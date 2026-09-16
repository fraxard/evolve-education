import React from 'react';
import { Modal } from './common/Modal';
import { siteContent } from '../data/content';
import { ArrowRight, Sparkles, Target, TrendingUp, HeartHandshake, Compass } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnquireNow?: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
  onEnquireNow,
}) => {
  const { brand, whyChooseUs, footer, hero } = siteContent;

  const handleEnquireClick = () => {
    onClose();
    if (onEnquireNow) {
      onEnquireNow();
    } else {
      const contactSection = document.querySelector('#contact');
      if (contactSection) {
        const headerOffset = 70;
        const elementPosition = contactSection.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
    }
  };

  const pillarIcons: Record<string, React.ReactNode> = {
    personalized: <Compass className="w-5 h-5 text-brand-leaf" />,
    focused: <Target className="w-5 h-5 text-brand-blue" />,
    interactive: <Sparkles className="w-5 h-5 text-brand-orange" />,
    progressive: <TrendingUp className="w-5 h-5 text-brand-purple" />,
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      ariaLabel="About Evolve Education"
      title={
        <div className="flex items-center gap-3">
          <img
            src={brand.logoSrc}
            alt={brand.logoAlt}
            className="h-10 sm:h-11 w-auto object-contain"
          />
        </div>
      }
      description={
        <p className="text-brand-leaf font-display font-semibold text-base sm:text-lg">
          {brand.tagline}
        </p>
      }
      footer={
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-brand-dark-muted font-body order-2 sm:order-1 text-center sm:text-left">
            {footer.mission}
          </p>
          <div className="flex items-center gap-2.5 w-full sm:w-auto order-1 sm:order-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-full border border-brand-border hover:border-brand-dark-muted text-brand-dark-muted font-display font-bold text-sm transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleEnquireClick}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-leaf hover:bg-brand-leaf-dark text-white font-display font-bold text-sm rounded-full shadow-sm hover:shadow transition-all"
            >
              <span>Enquire Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-6 font-body">
        {/* Mission & Purpose */}
        <div className="bg-brand-cream-alt/70 p-5 sm:p-6 rounded-2xl border border-brand-border/80">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-brand-border text-brand-blue font-accent text-xs font-semibold mb-3">
            <HeartHandshake className="w-3.5 h-3.5 text-brand-leaf" />
            <span>Our Educational Mission</span>
          </div>
          <p className="text-brand-blue text-lg sm:text-xl font-display font-bold mb-2">
            {footer.mission}
          </p>
          <p className="text-brand-dark-muted text-sm sm:text-base leading-relaxed">
            {hero.supportingCopy} {whyChooseUs.subheading}
          </p>
        </div>

        {/* 4 Core Pillars */}
        <div>
          <h3 className="font-display font-bold text-lg text-brand-blue mb-3 flex items-center gap-2">
            <span>Our Foundational Framework</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {whyChooseUs.cards.map((card) => (
              <div
                key={card.id}
                className="p-4 rounded-2xl bg-white border border-brand-border/90 hover:border-brand-leaf/40 transition-colors flex items-start gap-3 shadow-xs"
              >
                <div className="p-2.5 rounded-xl bg-brand-cream flex-shrink-0">
                  {pillarIcons[card.id] || <Sparkles className="w-5 h-5 text-brand-leaf" />}
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm text-brand-blue">
                    {card.title}
                  </h4>
                  <p className="font-body text-xs text-brand-dark-muted mt-1 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Commitment to Growth */}
        <div className="p-4 rounded-2xl bg-brand-cream/50 border border-brand-border/60 text-xs sm:text-sm text-brand-dark-muted flex items-center gap-3">
          <span className="text-xl flex-shrink-0">🌱</span>
          <p className="leading-relaxed">
            At Evolve Education, small, consistent steps lay the foundation for independent thinking, concentration, and lifelong self-assurance.
          </p>
        </div>
      </div>
    </Modal>
  );
};
