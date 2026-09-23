import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../routes/paths';
import { siteContent } from '../../data/content';
import { ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, User, Users, BookOpen, Lock } from 'lucide-react';
import { PasswordInput } from '../../components/common/PasswordInput';
import { sanitizePhone, isValidPhone } from '../../utils/validation';

interface ProgramOption {
  id: string;
  name: string;
  level?: string;
  description?: string;
}

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [programs, setPrograms] = useState<ProgramOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<{ applicationId: string; submittedAt: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Student Details
    studentName: '',
    dateOfBirth: '',
    gender: 'Prefer not to say',
    schoolName: '',
    currentGrade: '',
    personalDetails: '',
    // Step 2: Guardian Details
    guardianName: '',
    guardianRelationship: 'Mother',
    guardianPhone: '',
    guardianEmail: '',
    address: '',
    // Step 3: Program Preferences
    requestedProgramId: '',
    preferredLevel: 'Foundation Level 1',
    preferredSchedule: 'Weekday (Mon/Wed)',
    additionalDetails: '',
    // Step 4: Account Setup
    email: '',
    password: '',
    confirmPassword: '',
    termsAgreed: false,
  });

  // Load programs from backend
  useEffect(() => {
    fetch('/api/programs')
      .then((res) => (res.ok ? res.json() : { programs: [] }))
      .then((data) => {
        if (data.programs && data.programs.length > 0) {
          setPrograms(data.programs);
          setFormData((prev) => ({ ...prev, requestedProgramId: data.programs[0].id }));
        }
      })
      .catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === 'guardianPhone') {
      setFormData((prev) => ({ ...prev, [name]: sanitizePhone(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateStep = (step: number): boolean => {
    setError(null);
    if (step === 1) {
      if (!formData.studentName.trim() || formData.studentName.trim().length < 2) {
        setError('Please provide student full name (at least 2 characters).');
        return false;
      }
      if (!formData.dateOfBirth) {
        setError('Please select student date of birth.');
        return false;
      }
    } else if (step === 2) {
      if (!formData.guardianName.trim() || formData.guardianName.trim().length < 2) {
        setError('Please provide parent / guardian name.');
        return false;
      }
      if (!formData.guardianPhone.trim() || !isValidPhone(formData.guardianPhone)) {
        setError('Please enter a valid guardian phone number (minimum 7 digits, digits and leading + only).');
        return false;
      }
      if (!formData.guardianEmail.trim() || !formData.guardianEmail.includes('@')) {
        setError('Please enter a valid guardian email address.');
        return false;
      }
    } else if (step === 4) {
      if (!formData.email.trim() || !formData.email.includes('@')) {
        setError('Please provide a valid account email address.');
        return false;
      }
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters in length.');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match.');
        return false;
      }
      if (!formData.termsAgreed) {
        setError('Please confirm acknowledgment of admission terms.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setError(null);
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        studentName: formData.studentName.trim(),
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        personalDetails: formData.personalDetails.trim() || undefined,
        guardianName: formData.guardianName.trim(),
        guardianRelationship: formData.guardianRelationship,
        guardianPhone: formData.guardianPhone.trim(),
        guardianEmail: formData.guardianEmail.trim(),
        address: formData.address.trim() || undefined,
        schoolName: formData.schoolName.trim() || undefined,
        currentGrade: formData.currentGrade.trim() || undefined,
        requestedProgramId: formData.requestedProgramId || undefined,
        preferredLevel: formData.preferredLevel,
        preferredSchedule: formData.preferredSchedule,
        additionalDetails: formData.additionalDetails.trim() || undefined,
        email: formData.email.trim(),
        password: formData.password,
      };

      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to submit application.');
        return;
      }

      setSubmittedData({
        applicationId: data.applicationId,
        submittedAt: data.submittedAt || new Date().toISOString(),
      });
      setIsSubmitted(true);
    } catch {
      setError('A network error occurred. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted && submittedData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-brand-cream text-brand-dark">
        <div className="w-full max-w-xl p-8 sm:p-10 bg-white rounded-3xl sm:rounded-4xl border border-brand-border shadow-card text-center">
          <Link to={ROUTES.HOME} className="inline-block mb-6">
            <img src={siteContent.brand.logoSrc} alt={siteContent.brand.logoAlt} className="h-12 mx-auto object-contain" />
          </Link>

          <div className="w-16 h-16 rounded-full bg-brand-soft-green/30 text-brand-leaf flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="inline-block px-3.5 py-1 rounded-full bg-brand-leaf/10 text-brand-leaf-dark font-accent text-xs font-bold uppercase tracking-wider mb-3">
            Application Submitted
          </span>

          <h1 className="font-display font-bold text-2xl sm:text-3xl text-brand-blue mb-3">
            Thank You, {formData.studentName}!
          </h1>

          <p className="font-body text-sm sm:text-base text-brand-dark-muted leading-relaxed mb-6">
            Your admission application has been safely received and queued for administrative review. 
            Our academic admissions team will review your details, establish your curriculum pathway, and assign you to an appropriate batch and teacher.
          </p>

          <div className="p-5 rounded-2xl bg-brand-cream-alt/70 border border-brand-border/80 text-left text-xs text-brand-dark-muted mb-8 space-y-2 font-body">
            <p><span className="font-semibold text-brand-dark">Student Name:</span> {formData.studentName}</p>
            <p><span className="font-semibold text-brand-dark">Account Email:</span> {formData.email}</p>
            <p><span className="font-semibold text-brand-dark">Application Status:</span> Pending Administrative Review</p>
            <p className="text-[11px] text-brand-dark-muted pt-1 border-t border-brand-border">
              You may sign in with your email and password at any time to monitor your enrollment status.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to={ROUTES.HOME}
              className="w-full sm:w-auto px-6 py-3 rounded-full border border-brand-border text-brand-blue font-display font-bold text-sm hover:bg-brand-cream transition-colors"
            >
              Return to Website
            </Link>
            <button
              type="button"
              onClick={() => navigate(ROUTES.AUTH.SIGN_IN)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-brand-leaf hover:bg-brand-leaf-dark text-white font-display font-bold text-sm shadow-sm transition-all"
            >
              <span>Go to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const steps = [
    { number: 1, title: 'Student', icon: User },
    { number: 2, title: 'Guardian', icon: Users },
    { number: 3, title: 'Program', icon: BookOpen },
    { number: 4, title: 'Account', icon: Lock },
  ];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-brand-cream">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to={ROUTES.HOME} className="inline-block mb-3">
            <img src={siteContent.brand.logoSrc} alt={siteContent.brand.logoAlt} className="h-12 mx-auto object-contain" />
          </Link>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-brand-blue tracking-tight">
            Student Admission Application
          </h1>
          <p className="mt-2 text-sm text-brand-dark-muted font-body">
            Begin your educational journey with Evolve Education. Step {currentStep} of 4.
          </p>
        </div>

        {/* Stepper Progress Bar */}
        <div className="grid grid-cols-4 gap-2 mb-8">
          {steps.map((s) => {
            const Icon = s.icon;
            const isCompleted = currentStep > s.number;
            const isCurrent = currentStep === s.number;
            return (
              <div
                key={s.number}
                className={`flex items-center gap-2 p-2.5 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'bg-white border-brand-leaf shadow-sm'
                    : isCompleted
                    ? 'bg-brand-soft-green/20 border-brand-leaf/30 text-brand-leaf'
                    : 'bg-white/60 border-brand-border text-brand-dark-muted opacity-70'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                    isCurrent
                      ? 'bg-brand-leaf text-white'
                      : isCompleted
                      ? 'bg-brand-leaf text-white'
                      : 'bg-brand-cream-alt text-brand-dark-muted'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="hidden sm:inline font-accent text-xs font-semibold text-brand-blue truncate">
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Card Form */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl sm:rounded-4xl border border-brand-border shadow-card">
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="font-body leading-relaxed">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* STEP 1: Student Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h2 className="font-display font-bold text-xl text-brand-blue mb-4">
                  1. Student Personal Information
                </h2>

                <div>
                  <label className="block text-xs font-accent font-bold uppercase tracking-wider text-brand-blue mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleChange}
                    placeholder="e.g. Leo Parker"
                    className="w-full px-4 py-3 rounded-2xl border border-brand-border focus:border-brand-leaf focus:ring-2 focus:ring-brand-leaf/20 outline-none text-sm font-body"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-accent font-bold uppercase tracking-wider text-brand-blue mb-1">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      required
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-2xl border border-brand-border focus:border-brand-leaf focus:ring-2 focus:ring-brand-leaf/20 outline-none text-sm font-body"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-accent font-bold uppercase tracking-wider text-brand-blue mb-1">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-2xl border border-brand-border focus:border-brand-leaf focus:ring-2 focus:ring-brand-leaf/20 outline-none text-sm font-body bg-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-accent font-bold uppercase tracking-wider text-brand-blue mb-1">
                      Current School (Optional)
                    </label>
                    <input
                      type="text"
                      name="schoolName"
                      value={formData.schoolName}
                      onChange={handleChange}
                      placeholder="e.g. Oakridge Elementary"
                      className="w-full px-4 py-3 rounded-2xl border border-brand-border focus:border-brand-leaf focus:ring-2 focus:ring-brand-leaf/20 outline-none text-sm font-body"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-accent font-bold uppercase tracking-wider text-brand-blue mb-1">
                      Current Grade / Level (Optional)
                    </label>
                    <input
                      type="text"
                      name="currentGrade"
                      value={formData.currentGrade}
                      onChange={handleChange}
                      placeholder="e.g. Grade 4"
                      className="w-full px-4 py-3 rounded-2xl border border-brand-border focus:border-brand-leaf focus:ring-2 focus:ring-brand-leaf/20 outline-none text-sm font-body"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-accent font-bold uppercase tracking-wider text-brand-blue mb-1">
                    Special Needs or Relevant Learning Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    name="personalDetails"
                    value={formData.personalDetails}
                    onChange={handleChange}
                    placeholder="Any medical, dietary, or learning pace details we should know"
                    className="w-full px-4 py-3 rounded-2xl border border-brand-border focus:border-brand-leaf focus:ring-2 focus:ring-brand-leaf/20 outline-none text-sm font-body"
                  />
                </div>
              </div>
            )}

            {/* STEP 2: Guardian & Contact Information */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h2 className="font-display font-bold text-xl text-brand-blue mb-4">
                  2. Parent / Guardian Information
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-accent font-bold uppercase tracking-wider text-brand-blue mb-1">
                      Guardian Name *
                    </label>
                    <input
                      type="text"
                      required
                      name="guardianName"
                      value={formData.guardianName}
                      onChange={handleChange}
                      placeholder="e.g. Robert Parker"
                      className="w-full px-4 py-3 rounded-2xl border border-brand-border focus:border-brand-leaf focus:ring-2 focus:ring-brand-leaf/20 outline-none text-sm font-body"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-accent font-bold uppercase tracking-wider text-brand-blue mb-1">
                      Relationship to Student *
                    </label>
                    <select
                      name="guardianRelationship"
                      value={formData.guardianRelationship}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-2xl border border-brand-border focus:border-brand-leaf focus:ring-2 focus:ring-brand-leaf/20 outline-none text-sm font-body bg-white"
                    >
                      <option value="Mother">Mother</option>
                      <option value="Father">Father</option>
                      <option value="Legal Guardian">Legal Guardian</option>
                      <option value="Grandparent">Grandparent</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-accent font-bold uppercase tracking-wider text-brand-blue mb-1">
                      Guardian Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      name="guardianPhone"
                      value={formData.guardianPhone}
                      onChange={handleChange}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-4 py-3 rounded-2xl border border-brand-border focus:border-brand-leaf focus:ring-2 focus:ring-brand-leaf/20 outline-none text-sm font-body"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-accent font-bold uppercase tracking-wider text-brand-blue mb-1">
                      Guardian Email *
                    </label>
                    <input
                      type="email"
                      required
                      name="guardianEmail"
                      value={formData.guardianEmail}
                      onChange={handleChange}
                      placeholder="guardian@example.com"
                      className="w-full px-4 py-3 rounded-2xl border border-brand-border focus:border-brand-leaf focus:ring-2 focus:ring-brand-leaf/20 outline-none text-sm font-body"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-accent font-bold uppercase tracking-wider text-brand-blue mb-1">
                    Residential Address (Optional)
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Street address, city, postal code"
                    className="w-full px-4 py-3 rounded-2xl border border-brand-border focus:border-brand-leaf focus:ring-2 focus:ring-brand-leaf/20 outline-none text-sm font-body"
                  />
                </div>
              </div>
            )}

            {/* STEP 3: Program Preferences */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h2 className="font-display font-bold text-xl text-brand-blue mb-4">
                  3. Program & Schedule Preferences
                </h2>

                <div>
                  <label className="block text-xs font-accent font-bold uppercase tracking-wider text-brand-blue mb-1">
                    Select Program of Interest *
                  </label>
                  <select
                    name="requestedProgramId"
                    value={formData.requestedProgramId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-2xl border border-brand-border focus:border-brand-leaf focus:ring-2 focus:ring-brand-leaf/20 outline-none text-sm font-body bg-white"
                  >
                    {programs.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} {p.level ? `(${p.level})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-accent font-bold uppercase tracking-wider text-brand-blue mb-1">
                      Preferred Batch Timing
                    </label>
                    <select
                      name="preferredSchedule"
                      value={formData.preferredSchedule}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-2xl border border-brand-border focus:border-brand-leaf focus:ring-2 focus:ring-brand-leaf/20 outline-none text-sm font-body bg-white"
                    >
                      <option value="Weekday (Mon/Wed Afternoon)">Weekday (Mon/Wed Afternoon)</option>
                      <option value="Weekday (Tue/Thu Afternoon)">Weekday (Tue/Thu Afternoon)</option>
                      <option value="Weekend (Sat/Sun Morning)">Weekend (Sat/Sun Morning)</option>
                      <option value="Weekend (Sat/Sun Afternoon)">Weekend (Sat/Sun Afternoon)</option>
                      <option value="Flexible">Flexible / Discuss during review</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-accent font-bold uppercase tracking-wider text-brand-blue mb-1">
                      Current Arithmetic Experience
                    </label>
                    <select
                      name="preferredLevel"
                      value={formData.preferredLevel}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-2xl border border-brand-border focus:border-brand-leaf focus:ring-2 focus:ring-brand-leaf/20 outline-none text-sm font-body bg-white"
                    >
                      <option value="Beginner (No prior Abacus)">Beginner (No prior Abacus)</option>
                      <option value="Intermediate (Some prior calculation)">Intermediate (Some prior calculation)</option>
                      <option value="Advanced Mental Math">Advanced Mental Math</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-accent font-bold uppercase tracking-wider text-brand-blue mb-1">
                    Student Goals or Additional Notes (Optional)
                  </label>
                  <textarea
                    rows={3}
                    name="additionalDetails"
                    value={formData.additionalDetails}
                    onChange={handleChange}
                    placeholder="Specific academic objectives, concentration goals, or scheduling constraints"
                    className="w-full px-4 py-3 rounded-2xl border border-brand-border focus:border-brand-leaf focus:ring-2 focus:ring-brand-leaf/20 outline-none text-sm font-body"
                  />
                </div>
              </div>
            )}

            {/* STEP 4: Account Credentials */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <h2 className="font-display font-bold text-xl text-brand-blue mb-4">
                  4. Account Setup & Confirmation
                </h2>

                <p className="text-xs text-brand-dark-muted font-body leading-relaxed mb-4">
                  These credentials will be used to log in to the portal once your admission is approved by our academic administrators.
                </p>

                <div>
                  <label className="block text-xs font-accent font-bold uppercase tracking-wider text-brand-blue mb-1">
                    Portal Login Email *
                  </label>
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. student.login@example.com"
                    className="w-full px-4 py-3 rounded-2xl border border-brand-border focus:border-brand-leaf focus:ring-2 focus:ring-brand-leaf/20 outline-none text-sm font-body"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-accent font-bold uppercase tracking-wider text-brand-blue mb-1">
                      Create Password * (min 8 chars)
                    </label>
                    <PasswordInput
                      required
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="px-4 py-3 rounded-2xl border border-brand-border focus:border-brand-leaf focus:ring-2 focus:ring-brand-leaf/20 outline-none text-sm font-body"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-accent font-bold uppercase tracking-wider text-brand-blue mb-1">
                      Confirm Password *
                    </label>
                    <PasswordInput
                      required
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="px-4 py-3 rounded-2xl border border-brand-border focus:border-brand-leaf focus:ring-2 focus:ring-brand-leaf/20 outline-none text-sm font-body"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      name="termsAgreed"
                      checked={formData.termsAgreed}
                      onChange={handleChange}
                      className="w-4 h-4 mt-1 rounded text-brand-leaf focus:ring-brand-leaf"
                    />
                    <span className="text-xs text-brand-dark-muted font-body leading-relaxed">
                      I confirm that the information provided is accurate, and I acknowledge that portal access will be granted following administrative application review and batch assignment.
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 pt-6 border-t border-brand-border flex items-center justify-between">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-brand-border text-brand-dark-muted font-display font-bold text-sm hover:bg-brand-cream transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              ) : (
                <Link
                  to={ROUTES.AUTH.SIGN_IN}
                  className="text-xs text-brand-dark-muted hover:text-brand-blue font-body"
                >
                  Already have an account? Sign In
                </Link>
              )}

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-brand-leaf hover:bg-brand-leaf-dark text-white font-display font-bold text-sm shadow-sm transition-all"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-brand-leaf hover:bg-brand-leaf-dark text-white font-display font-bold text-sm shadow-sm hover:shadow transition-all disabled:opacity-70 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Submitting Application...</span>
                  ) : (
                    <>
                      <span>Submit Application</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
