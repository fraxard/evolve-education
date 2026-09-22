import React from 'react';
import { Award } from 'lucide-react';
import { StudentPlaceholderPage } from './StudentPlaceholderPage';

export const AssessmentsPage: React.FC = () => {
  return (
    <StudentPlaceholderPage
      title="Assessments & Results"
      subtitle="View your examination scores, performance breakdown, and graded evaluations"
      stageBadge="Stage 2B.5 Scheduled"
      icon={Award}
      description="In Stage 2B.5, this page will query assessments and assessment_results for your student record, showing test titles, scores, maximum marks, percentages, and teacher remarks."
      upcomingFeatures={[
        'Read-only ledger of all assigned and graded evaluations',
        'Numerical score, percentage, and maximum marks display',
        'Instructor feedback and evaluation remarks',
        'Performance status indicators (distinction, merit, satisfactory)',
      ]}
    />
  );
};
