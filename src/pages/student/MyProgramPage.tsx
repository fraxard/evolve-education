import React from 'react';
import { BookOpen } from 'lucide-react';
import { StudentPlaceholderPage } from './StudentPlaceholderPage';

export const MyProgramPage: React.FC = () => {
  return (
    <StudentPlaceholderPage
      title="My Program & Cohort"
      subtitle="Comprehensive view of your active curriculum, class schedule, and mentor details"
      stageBadge="Stage 2B.3 Scheduled"
      icon={BookOpen}
      description="In Stage 2B.3, this page will present the complete syllabus breakdown, duration, cohort schedule (Mon/Wed etc.), batch peers count, and instructor biography resolved dynamically from the database."
      upcomingFeatures={[
        'Full curriculum overview, level progression, and program description',
        'Batch timetable, room/session schedules, and semester bounds',
        'Instructor credentials, qualifications, and specializations',
        'Enrollment history and verification badge',
      ]}
    />
  );
};
