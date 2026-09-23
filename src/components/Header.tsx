import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { siteContent, NavItem } from '../data/content';
import { ROUTES } from '../routes/paths';
import { Menu, X, ArrowRight, ChevronDown } from 'lucide-react';

export interface HeaderProps {
  onAboutClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onAboutClick }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProgramsDropdownOpen, setIsProgramsDropdownOpen] = useState(false);
  const [isMobileProgramsOpen, setIsMobileProgramsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Monitor scroll for subtle shadow elevation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsProgramsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isMobileMenuOpen) setIsMobileMenuOpen(false);
        if (isProgramsDropdownOpen) setIsProgramsDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen, isProgramsDropdownOpen]);

  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false);
    setIsProgramsDropdownOpen(false);
    const element = document.querySelector(href);
    if (element) {
      const headerOffset = 70;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 h-[70px] bg-white/95 backdrop-blur-md transition-all duration-300 border-b ${
          isScrolled ? 'border-brand-border shadow-sm' : 'border-brand-border/60'
        }`}
      >
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('#home');
            }}
            className="flex items-center gap-2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-leaf rounded-xl"
            aria-label="Evolve Education - Return to top"
          >
            <img
              src={siteContent.brand.logoSrc}
              alt={siteContent.brand.logoAlt}
              className="h-11 sm:h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
            />
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2" aria-label="Main Navigation">
            {siteContent.navigation.map((item: NavItem) => {
              if (item.label === 'About') {
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      if (onAboutClick) onAboutClick();
                    }}
                    className="px-3 py-1.5 text-sm font-semibold text-brand-dark-muted hover:text-brand-blue hover:bg-brand-cream-alt/70 rounded-lg transition-colors font-body focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-leaf"
                  >
                    {item.label}
                  </button>
                );
              }

              if (item.children) {
                return (
                  <div
                    key={item.label}
                    ref={dropdownRef}
                    className="relative"
                    onMouseEnter={() => setIsProgramsDropdownOpen(true)}
                    onMouseLeave={() => setIsProgramsDropdownOpen(false)}
                  >
                    <button
                      type="button"
                      onClick={() => setIsProgramsDropdownOpen(!isProgramsDropdownOpen)}
                      aria-expanded={isProgramsDropdownOpen}
                      aria-haspopup="true"
                      className="px-3 py-1.5 text-sm font-semibold text-brand-dark-muted hover:text-brand-blue hover:bg-brand-cream-alt/70 rounded-lg transition-colors font-body flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-leaf"
                    >
                      <span>{item.label}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          isProgramsDropdownOpen ? 'rotate-180 text-brand-leaf' : ''
                        }`}
                      />
                    </button>

                    {/* Simple, polished desktop dropdown */}
                    {isProgramsDropdownOpen && (
                      <div
                        className="absolute top-full left-0 mt-1 w-64 bg-white rounded-2xl p-2 shadow-card border border-brand-border/80 animate-fade-in z-50"
                        role="menu"
                        aria-label="Programs submenu"
                      >
                        {item.children.map((subItem) => (
                          <a
                            key={subItem.label}
                            href={subItem.href}
                            role="menuitem"
                            onClick={(e) => {
                              e.preventDefault();
                              handleNavClick(subItem.href);
                            }}
                            className="block p-2.5 rounded-xl hover:bg-brand-cream transition-colors group"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-display font-bold text-brand-blue group-hover:text-brand-leaf">
                                {subItem.label}
                              </span>
                              {subItem.label === 'All Programs' && (
                                <ArrowRight className="w-3.5 h-3.5 text-brand-dark-muted group-hover:text-brand-leaf transition-transform group-hover:translate-x-0.5" />
                              )}
                            </div>
                            {subItem.description && (
                              <p className="text-xs text-brand-dark-muted font-body mt-0.5">
                                {subItem.description}
                              </p>
                            )}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.href);
                  }}
                  className="px-3 py-1.5 text-sm font-semibold text-brand-dark-muted hover:text-brand-blue hover:bg-brand-cream-alt/70 rounded-lg transition-colors font-body"
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Desktop Right Account Action: Sign In */}
          <div className="hidden lg:flex items-center">
            <Link
              to={ROUTES.AUTH.SIGN_IN}
              className="inline-flex items-center justify-center px-4 py-1.5 text-sm font-display font-bold text-brand-blue hover:text-brand-leaf bg-white hover:bg-brand-cream-alt border border-brand-border hover:border-brand-yellow rounded-full shadow-xs transition-all duration-200"
            >
              Sign In
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center lg:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-brand-blue hover:text-brand-dark hover:bg-brand-cream-alt rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-leaf"
              aria-label="Open navigation menu"
              aria-expanded={isMobileMenuOpen}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Off-Canvas Drawer */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-visibility duration-300 ${
          isMobileMenuOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation"
      >
        {/* Backdrop overlay */}
        <div
          className={`absolute inset-0 bg-brand-dark/40 backdrop-blur-sm transition-opacity duration-300 ${
            isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />

        {/* Drawer panel */}
        <div
          className={`absolute top-0 right-0 bottom-0 w-[85%] max-w-[340px] bg-white shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-out transform ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Drawer Top Header */}
          <div className="p-5 flex items-center justify-between border-b border-brand-border/60">
            <img
              src={siteContent.brand.logoSrc}
              alt={siteContent.brand.logoAlt}
              className="h-9 w-auto object-contain"
            />
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-brand-dark-muted hover:text-brand-dark hover:bg-brand-cream-alt rounded-xl transition-colors"
              aria-label="Close navigation menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Links */}
          <div className="flex-1 overflow-y-auto px-5 py-6">
            <nav className="flex flex-col gap-1">
              <a
                href="#home"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick('#home');
                }}
                className="px-4 py-3 text-base font-semibold text-brand-blue hover:text-brand-leaf hover:bg-brand-cream-alt/70 rounded-xl transition-colors"
              >
                Home
              </a>

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (onAboutClick) onAboutClick();
                }}
                className="w-full text-left px-4 py-3 text-base font-semibold text-brand-blue hover:text-brand-leaf hover:bg-brand-cream-alt/70 rounded-xl transition-colors"
              >
                About Us
              </button>

              {/* Mobile Programs Submenu */}
              <div>
                <button
                  type="button"
                  onClick={() => setIsMobileProgramsOpen(!isMobileProgramsOpen)}
                  className="w-full px-4 py-3 text-base font-semibold text-brand-blue hover:text-brand-leaf hover:bg-brand-cream-alt/70 rounded-xl transition-colors flex items-center justify-between"
                  aria-expanded={isMobileProgramsOpen}
                >
                  <span>Programs</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isMobileProgramsOpen ? 'rotate-180 text-brand-leaf' : ''
                    }`}
                  />
                </button>

                {isMobileProgramsOpen && (
                  <div className="pl-6 pr-2 py-1 flex flex-col gap-1 bg-brand-cream/50 rounded-xl my-1">
                    <a
                      href="#abacus-program"
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavClick('#abacus-program');
                      }}
                      className="px-3 py-2 text-sm font-semibold text-brand-blue hover:text-brand-leaf rounded-lg"
                    >
                      Abacus
                    </a>
                    <a
                      href="#programs"
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavClick('#programs');
                      }}
                      className="px-3 py-2 text-sm font-semibold text-brand-dark-muted hover:text-brand-leaf rounded-lg flex items-center justify-between"
                    >
                      <span>All Programs</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>

              <a
                href="#methodology"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick('#methodology');
                }}
                className="px-4 py-3 text-base font-semibold text-brand-blue hover:text-brand-leaf hover:bg-brand-cream-alt/70 rounded-xl transition-colors"
              >
                Methodology
              </a>

              <a
                href="#why-us"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick('#why-us');
                }}
                className="px-4 py-3 text-base font-semibold text-brand-blue hover:text-brand-leaf hover:bg-brand-cream-alt/70 rounded-xl transition-colors"
              >
                Why Choose Us
              </a>

              <a
                href="#learning-experience"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick('#learning-experience');
                }}
                className="px-4 py-3 text-base font-semibold text-brand-blue hover:text-brand-leaf hover:bg-brand-cream-alt/70 rounded-xl transition-colors"
              >
                Learning Experience
              </a>

              <a
                href="#faq"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick('#faq');
                }}
                className="px-4 py-3 text-base font-semibold text-brand-blue hover:text-brand-leaf hover:bg-brand-cream-alt/70 rounded-xl transition-colors"
              >
                FAQs
              </a>

              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick('#contact');
                }}
                className="px-4 py-3 text-base font-semibold text-brand-blue hover:text-brand-leaf hover:bg-brand-cream-alt/70 rounded-xl transition-colors"
              >
                Contact Details
              </a>

            </nav>
          </div>

          {/* Drawer Bottom Portal Action */}
          <div className="p-5 border-t border-brand-border/60 bg-brand-cream/50">
            <Link
              to={ROUTES.AUTH.SIGN_IN}
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-white hover:bg-brand-cream-alt text-brand-blue border-2 border-brand-border hover:border-brand-yellow font-display font-bold text-base rounded-full shadow-xs transition-colors"
            >
              <span>Sign In</span>
            </Link>
            <p className="mt-3 text-center text-xs text-brand-dark-muted font-body">
              {siteContent.brand.tagline}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
