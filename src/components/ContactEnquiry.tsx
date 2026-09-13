import React, { useState } from 'react';
import { siteContent } from '../data/content';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react';

interface ContactEnquiryProps {
  selectedProgram?: string;
}

export const ContactEnquiry: React.FC<ContactEnquiryProps> = ({ selectedProgram = '' }) => {
  const { contact } = siteContent;

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    program: selectedProgram || contact.programOptions[0],
    message: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync selectedProgram if parent passes a new one
  React.useEffect(() => {
    if (selectedProgram) {
      setFormData((prev) => ({ ...prev, program: selectedProgram }));
    }
  }, [selectedProgram]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email Address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone / WhatsApp number is required';
    } else if (formData.phone.trim().length < 7) {
      newErrors.phone = 'Please provide a complete phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    // Simulate clean client-side submission readiness
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 500);
  };

  const handleReset = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      program: contact.programOptions[0],
      message: ''
    });
    setErrors({});
    setIsSubmitted(false);
  };

  const hasSpecificContactDetails =
    Boolean(contact.contactDetails.email) ||
    Boolean(contact.contactDetails.phone) ||
    Boolean(contact.contactDetails.location);

  return (
    <section id="contact" className="py-20 md:py-28 bg-brand-cream relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-soft-green/30 border border-brand-leaf/20 text-brand-leaf font-accent text-sm font-semibold mb-3">
            <span>Section {contact.sectionNumber}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-brand-leaf" />
            <span>Admission & Consultation</span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-brand-blue mb-4">
            {contact.heading}
          </h2>
          <p className="font-body text-base sm:text-lg text-brand-dark-muted leading-relaxed">
            {contact.subheading}
          </p>
        </div>

        {/* Major Conversion Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          
          {/* Left Column: Direct Contact & Advisory Details */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-white p-8 rounded-3xl border border-brand-border shadow-soft">
              <h3 className="font-display font-bold text-2xl text-brand-blue mb-4">
                Contact Evolve Education
              </h3>

              <p className="font-body text-sm text-brand-dark-muted leading-relaxed mb-6">
                {contact.leadText}
              </p>

              {hasSpecificContactDetails ? (
                <div className="space-y-6">
                  {contact.contactDetails.email && (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-brand-baby-blue/30 text-brand-blue flex items-center justify-center flex-shrink-0">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="block text-xs font-accent font-semibold text-brand-dark-muted uppercase tracking-wider">
                          Email
                        </span>
                        <p className="font-body text-sm sm:text-base font-semibold text-brand-blue break-all">
                          {contact.contactDetails.email}
                        </p>
                      </div>
                    </div>
                  )}

                  {contact.contactDetails.phone && (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-brand-soft-green/30 text-brand-leaf flex items-center justify-center flex-shrink-0">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="block text-xs font-accent font-semibold text-brand-dark-muted uppercase tracking-wider">
                          Phone / WhatsApp
                        </span>
                        <p className="font-body text-sm sm:text-base font-semibold text-brand-blue">
                          {contact.contactDetails.phone}
                        </p>
                      </div>
                    </div>
                  )}

                  {contact.contactDetails.location && (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-brand-soft-yellow/50 text-brand-orange flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="block text-xs font-accent font-semibold text-brand-dark-muted uppercase tracking-wider">
                          Location
                        </span>
                        <p className="font-body text-sm sm:text-base font-semibold text-brand-blue">
                          {contact.contactDetails.location}
                        </p>
                      </div>
                    </div>
                  )}

                  {contact.contactDetails.hours && (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-brand-lavender/30 text-brand-purple flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="block text-xs font-accent font-semibold text-brand-dark-muted uppercase tracking-wider">
                          Consultation Hours
                        </span>
                        <p className="font-body text-sm sm:text-base font-semibold text-brand-blue">
                          {contact.contactDetails.hours}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-brand-cream/80 border border-brand-border flex items-start gap-3.5">
                    <MessageSquare className="w-5 h-5 text-brand-leaf flex-shrink-0 mt-0.5" />
                    <div className="text-xs sm:text-sm font-body text-brand-dark-muted leading-relaxed">
                      <strong className="text-brand-blue font-display block text-sm mb-0.5">Prompt Response Guarantee</strong>
                      Our team will reach out directly to answer your queries regarding schedule availability and course materials.
                    </div>
                  </div>
                </div>
              )}

              {/* Consultation Next Steps */}
              <div className="mt-8 p-5 rounded-2xl bg-brand-cream-alt/60 border border-brand-border text-xs text-brand-dark-muted leading-relaxed">
                <strong className="text-brand-blue font-display text-sm block mb-1">What to expect:</strong>
                Following your enquiry, an educational coordinator will discuss your child’s learning level, review available session slots, and arrange an introductory consultation.
              </div>
            </div>
          </div>

          {/* Right Column: Admission Enquiry Form */}
          <div className="lg:col-span-7">
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-brand-border shadow-card">
              
              {isSubmitted ? (
                /* Success Feedback State */
                <div className="py-12 px-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-brand-soft-green/30 text-brand-leaf mx-auto flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-display font-bold text-2xl text-brand-blue mb-2">
                    Enquiry Received!
                  </h3>
                  <p className="font-body text-base text-brand-dark-muted max-w-md mx-auto mb-6">
                    Thank you, <strong className="text-brand-blue">{formData.fullName}</strong>. Your enquiry for <strong className="text-brand-blue">{formData.program}</strong> has been received. Our educational coordinator will connect with you soon.
                  </p>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-6 py-2.5 rounded-full bg-brand-cream-alt text-brand-blue font-display font-bold text-sm border border-brand-border hover:bg-brand-border/40 transition-colors"
                  >
                    Submit Another Enquiry
                  </button>
                </div>
              ) : (
                /* Active Form */
                <form onSubmit={handleSubmit} noValidate className="space-y-6">
                  <div>
                    <h3 className="font-display font-bold text-2xl text-brand-blue mb-1">
                      Admission Enquiry
                    </h3>
                    <p className="font-body text-xs text-brand-dark-muted">
                      Fields marked with an asterisk (<span className="text-brand-berry">*</span>) are required.
                    </p>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-semibold text-brand-dark mb-1.5 font-body">
                      Full Name <span className="text-brand-berry">*</span>
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => {
                        setFormData({ ...formData, fullName: e.target.value });
                        if (errors.fullName) setErrors({ ...errors, fullName: '' });
                      }}
                      placeholder="Your full name"
                      className={`w-full px-4 py-3 rounded-xl border bg-brand-cream/30 text-brand-dark placeholder-brand-dark-muted/50 font-body text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-leaf ${
                        errors.fullName ? 'border-brand-berry' : 'border-brand-border'
                      }`}
                      aria-required="true"
                      aria-invalid={!!errors.fullName}
                      aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                    />
                    {errors.fullName && (
                      <p id="fullName-error" className="mt-1.5 text-xs text-brand-berry flex items-center gap-1 font-body">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{errors.fullName}</span>
                      </p>
                    )}
                  </div>

                  {/* Email & Phone Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-brand-dark mb-1.5 font-body">
                        Email Address <span className="text-brand-berry">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value });
                          if (errors.email) setErrors({ ...errors, email: '' });
                        }}
                        placeholder="Your email address"
                        className={`w-full px-4 py-3 rounded-xl border bg-brand-cream/30 text-brand-dark placeholder-brand-dark-muted/50 font-body text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-leaf ${
                          errors.email ? 'border-brand-berry' : 'border-brand-border'
                        }`}
                        aria-required="true"
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                      />
                      {errors.email && (
                        <p id="email-error" className="mt-1.5 text-xs text-brand-berry flex items-center gap-1 font-body">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{errors.email}</span>
                        </p>
                      )}
                    </div>

                    {/* Phone / WhatsApp */}
                    <div>
                      <label htmlFor="phone" className="block text-sm font-semibold text-brand-dark mb-1.5 font-body">
                        Phone / WhatsApp Number <span className="text-brand-berry">*</span>
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => {
                          setFormData({ ...formData, phone: e.target.value });
                          if (errors.phone) setErrors({ ...errors, phone: '' });
                        }}
                        placeholder="Your contact number"
                        className={`w-full px-4 py-3 rounded-xl border bg-brand-cream/30 text-brand-dark placeholder-brand-dark-muted/50 font-body text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-leaf ${
                          errors.phone ? 'border-brand-berry' : 'border-brand-border'
                        }`}
                        aria-required="true"
                        aria-invalid={!!errors.phone}
                        aria-describedby={errors.phone ? 'phone-error' : undefined}
                      />
                      {errors.phone && (
                        <p id="phone-error" className="mt-1.5 text-xs text-brand-berry flex items-center gap-1 font-body">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{errors.phone}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Program of Interest: Strictly Abacus & General Consultation */}
                  <div>
                    <label htmlFor="program" className="block text-sm font-semibold text-brand-dark mb-1.5 font-body">
                      Program of Interest
                    </label>
                    <select
                      id="program"
                      value={formData.program}
                      onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-brand-border bg-brand-cream/30 text-brand-dark font-body text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-leaf"
                    >
                      {contact.programOptions.map((prog) => (
                        <option key={prog} value={prog}>
                          {prog}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-brand-dark mb-1.5 font-body">
                      Message / Learning Goals (Optional)
                    </label>
                    <textarea
                      id="message"
                      rows={3}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Share your child's age, grade or any specific learning questions..."
                      className="w-full px-4 py-3 rounded-xl border border-brand-border bg-brand-cream/30 text-brand-dark placeholder-brand-dark-muted/50 font-body text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-leaf resize-y"
                    />
                  </div>

                  {/* Submit CTA Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 px-6 bg-brand-leaf hover:bg-brand-leaf-dark text-white font-display font-bold text-base rounded-full shadow-card hover:shadow-hover transition-all duration-200 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sending Enquiry...</span>
                      </span>
                    ) : (
                      <>
                        <span>Submit Admission Enquiry</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <p className="text-center text-xs text-brand-dark-muted font-body">
                    We value family privacy. Your contact details are strictly used for your educational consultation.
                  </p>
                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
