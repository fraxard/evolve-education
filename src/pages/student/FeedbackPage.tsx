import React from 'react';
import { MessageSquareQuote } from 'lucide-react';
import { StudentPlaceholderPage } from './StudentPlaceholderPage';

export const FeedbackPage: React.FC = () => {
  return (
    <StudentPlaceholderPage
      title="Teacher Feedback & Notes"
      subtitle="Periodic evaluations, formative remarks, and personalized mentor guidance"
      stageBadge="Stage 2B.7 Scheduled"
      icon={MessageSquareQuote}
      description="In Stage 2B.7, this page will query teacher_notes for your authenticated student record. Only feedback specifically addressed to you will be returned, ensuring absolute privacy."
      upcomingFeatures={[
        'Personalized feedback feed from your assigned mentors',
        'Categorized notes (Academic, Behavioral, Developmental)',
        'Chronological history of teacher observations and commendations',
        'Direct instructor attribution and date timestamps',
      ]}
    />
  );
};
