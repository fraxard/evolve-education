import React from 'react';
import { FileText } from 'lucide-react';
import { StudentPlaceholderPage } from './StudentPlaceholderPage';

export const DocumentsPage: React.FC = () => {
  return (
    <StudentPlaceholderPage
      title="My Documents & Certificates"
      subtitle="Access official enrollment verifications, transcripts, and course certificates"
      stageBadge="Stage 2B.9 Scheduled"
      icon={FileText}
      description="In Stage 2B.9, this page will query student_documents for your student record, rendering verified academic certificates and official documentation with secure, authenticated view/download links."
      upcomingFeatures={[
        'Verified academic transcripts and admission confirmations',
        'Course completion certificates and badges',
        'Document metadata (type, issuance date, file size)',
        'Access-controlled document viewing and downloads',
      ]}
    />
  );
};
