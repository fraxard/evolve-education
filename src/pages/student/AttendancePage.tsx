import React from 'react';
import { CalendarCheck } from 'lucide-react';
import { StudentPlaceholderPage } from './StudentPlaceholderPage';

export const AttendancePage: React.FC = () => {
  return (
    <StudentPlaceholderPage
      title="Attendance Records"
      subtitle="Track your class presence, session dates, and attendance history"
      stageBadge="Stage 2B.4 Scheduled"
      icon={CalendarCheck}
      description="In Stage 2B.4, this page will query attendance_records for your active enrollment. It will display present/absent/late counts and session-by-session notes logged by your teacher."
      upcomingFeatures={[
        'Overall attendance rate percentage calculation',
        'Present, absent, late, and excused session counts',
        'Chronological session attendance timeline with instructor notes',
        'Transparent empty state when no classes have been conducted yet',
      ]}
    />
  );
};
