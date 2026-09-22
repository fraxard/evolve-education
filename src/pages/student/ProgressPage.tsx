import React from 'react';
import { TrendingUp } from 'lucide-react';
import { StudentPlaceholderPage } from './StudentPlaceholderPage';

export const ProgressPage: React.FC = () => {
  return (
    <StudentPlaceholderPage
      title="Academic Progress"
      subtitle="Track your curriculum milestone trajectory and skill mastery"
      stageBadge="Stage 2B.6 Scheduled"
      icon={TrendingUp}
      description="In Stage 2B.6, this page will present an honest, mathematically sound representation of your academic journey derived strictly from completed modules, attended sessions, and completed assessments."
      upcomingFeatures={[
        'Evaluation completion ratio and academic trajectory',
        'Milestone indicators derived from actual student records',
        'Skill progression indicators across program modules',
        'Transparent documentation of the progress formula without arbitrary placeholder metrics',
      ]}
    />
  );
};
