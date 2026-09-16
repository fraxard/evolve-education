import React, { useState } from 'react';
import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { WhyChooseUs } from '../components/WhyChooseUs';
import { FeaturedPrograms } from '../components/FeaturedPrograms';
import { Methodology } from '../components/Methodology';
import { Benefits } from '../components/Benefits';
import { LearningExperience } from '../components/LearningExperience';
import { FAQ } from '../components/FAQ';
import { ContactEnquiry } from '../components/ContactEnquiry';
import { Footer } from '../components/Footer';
import { MobileBottomCta } from '../components/MobileBottomCta';
import { AboutModal } from '../components/AboutModal';

export const LandingPage: React.FC = () => {
  const [selectedProgram, setSelectedProgram] = useState<string>('Abacus');
  const [isAboutModalOpen, setIsAboutModalOpen] = useState<boolean>(false);

  const handleSelectProgram = (programTitle: string) => {
    if (programTitle.toLowerCase().includes('abacus')) {
      setSelectedProgram('Abacus');
    } else {
      setSelectedProgram('General Consultation');
    }
  };

  const handleEnquireScroll = () => {
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
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-cream text-brand-dark selection:bg-brand-leaf selection:text-white">
      {/* 70px Fixed/Sticky Header with Programs Dropdown & Auth / About triggers */}
      <Header onAboutClick={() => setIsAboutModalOpen(true)} />

      {/* Main Conversion Flow Following Wireframe 01 - 08 */}
      <main className="flex-1">
        {/* 01. Hero */}
        <Hero onExploreAbacus={() => setSelectedProgram('Abacus')} />

        {/* 02. Why Choose Us / Key Differentiators */}
        <WhyChooseUs />

        {/* 03. Featured Program (Abacus) & Directory */}
        <FeaturedPrograms onSelectProgram={handleSelectProgram} />

        {/* 04. Methodology / How It Works */}
        <Methodology />

        {/* 05. Benefits & Student Outcomes */}
        <Benefits />

        {/* 06. Learning Experience (Authentic Trust & Learning Environment) */}
        <LearningExperience />

        {/* 07. FAQ Accordion */}
        <FAQ />

        {/* 08. Final Enquiry / Contact Conversion */}
        <ContactEnquiry selectedProgram={selectedProgram} />
      </main>

      {/* 09. Branded Footer */}
      <Footer onAboutClick={() => setIsAboutModalOpen(true)} />

      {/* Mobile Subtle Fixed Bottom CTA */}
      <MobileBottomCta />

      {/* Reusable About Modal */}
      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
        onEnquireNow={handleEnquireScroll}
      />
    </div>
  );
};
