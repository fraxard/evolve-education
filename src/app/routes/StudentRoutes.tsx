import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { APP_ROUTES } from '../../routes/paths';
import { StudentDashboardPage } from '../pages/student/StudentDashboardPage';
import { PlaceholderView } from '../components/PlaceholderView';
import { AccessRestrictedView } from '../components/AccessRestrictedView';

export const StudentRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<StudentDashboardPage />} />
      <Route
        path="program"
        element={
          <PlaceholderView
            title="My Program"
            phase="Phase 2B.5"
            description="Program progression, syllabus breakdown, and active term schedules will connect to live data in Phase 2B.5."
            role="student"
          />
        }
      />
      <Route
        path="attendance"
        element={
          <PlaceholderView
            title="My Attendance"
            phase="Phase 2B.5"
            description="Personal session attendance records and absence history will display live data in Phase 2B.5."
            role="student"
          />
        }
      />
      <Route
        path="assessments"
        element={
          <PlaceholderView
            title="Assessments & Grades"
            phase="Phase 2B.5"
            description="Assessment submissions, scores, and teacher evaluations will display live data in Phase 2B.5."
            role="student"
          />
        }
      />
      <Route
        path="progress"
        element={
          <PlaceholderView
            title="Academic Progress"
            phase="Phase 2B.5"
            description="Learning milestones and competency tracking will connect to live data in Phase 2B.5."
            role="student"
          />
        }
      />
      <Route
        path="feedback"
        element={
          <PlaceholderView
            title="Faculty Feedback"
            phase="Phase 2B.5"
            description="Guidance, feedback, and notes authored by your instructors will display live in Phase 2B.5."
            role="student"
          />
        }
      />
      <Route
        path="documents"
        element={
          <PlaceholderView
            title="Official Documents"
            phase="Phase 2B.5"
            description="Official institutional certificates, transcripts, and application documents will connect in Phase 2B.5."
            role="student"
          />
        }
      />
      <Route
        path="profile"
        element={
          <PlaceholderView
            title="Student Profile"
            phase="Phase 2B.0 Foundation"
            description="Student contact information, emergency contacts, and personal settings."
            role="student"
          />
        }
      />

      {/* Role Boundary Guards: If student attempts teacher-exclusive subroutes */}
      <Route
        path="batches"
        element={
          <AccessRestrictedView
            requiredRole="teacher"
            title="Faculty Batches Restricted"
            message="Batch administration and roster management are restricted to faculty members. Students view their active enrolled course under My Program."
          />
        }
      />
      <Route
        path="students"
        element={
          <AccessRestrictedView
            requiredRole="teacher"
            title="Faculty Student Directory Restricted"
            message="Institutional student directories and peer academic records are strictly restricted to faculty and administrative personnel."
          />
        }
      />

      {/* Default redirect to Dashboard */}
      <Route path="*" element={<Navigate to={APP_ROUTES.DASHBOARD} replace />} />
    </Routes>
  );
};
