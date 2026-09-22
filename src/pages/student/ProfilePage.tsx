import React from 'react';
import { User } from 'lucide-react';
import { StudentPlaceholderPage } from './StudentPlaceholderPage';

export const StudentProfilePage: React.FC = () => {
  return (
    <StudentPlaceholderPage
      title="Student Profile & Settings"
      subtitle="View your student identification, guardian details, and contact preferences"
      stageBadge="Stage 2B.8 Scheduled"
      icon={User}
      description="In Stage 2B.8, this page will present your official student dossier. Read-only fields (official student ID, enrolled program, cohort, account status) will be strictly separated from editable contact fields (guardian contact, phone, address)."
      upcomingFeatures={[
        'Official student profile dossier (Student ID, Date of Birth, Grade, School)',
        'Guardian contact information and emergency phone numbers',
        'Controlled contact update flow with server-side field whitelist validation',
        'Account security status and session information',
      ]}
    />
  );
};
