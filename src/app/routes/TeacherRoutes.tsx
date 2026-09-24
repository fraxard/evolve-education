import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { APP_ROUTES } from '../../routes/paths';
import { TeacherDashboardPage } from '../pages/teacher/TeacherDashboardPage';
import { TeacherBatchesPage } from '../pages/teacher/TeacherBatchesPage';
import { TeacherBatchDetailPage } from '../pages/teacher/TeacherBatchDetailPage';
import { TeacherStudentsPage } from '../pages/teacher/TeacherStudentsPage';
import { TeacherStudentDetailPage } from '../pages/teacher/TeacherStudentDetailPage';
import { PlaceholderView } from '../components/PlaceholderView';
import { AccessRestrictedView } from '../components/AccessRestrictedView';

export const TeacherRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<TeacherDashboardPage />} />
      <Route path="batches" element={<TeacherBatchesPage />} />
      <Route path="batches/:batchId" element={<TeacherBatchDetailPage />} />
      <Route path="students" element={<TeacherStudentsPage />} />
      <Route path="students/:studentId" element={<TeacherStudentDetailPage />} />
      <Route
        path="attendance"
        element={
          <PlaceholderView
            title="Attendance Session Manager"
            phase="Phase 2B.2"
            description="Daily session attendance marking, bulk roster updates, and absence tracking will be implemented in Phase 2B.2."
            role="teacher"
          />
        }
      />
      <Route
        path="assessments"
        element={
          <PlaceholderView
            title="Assessments & Gradebook"
            phase="Phase 2B.3"
            description="Assessment creation, matrix gradebook, and evaluation scoring will be implemented in Phase 2B.3."
            role="teacher"
          />
        }
      />
      <Route
        path="feedback"
        element={
          <PlaceholderView
            title="Pastoral & Feedback Notes"
            phase="Phase 2B.4"
            description="Student feedback, academic warnings, and commendation notes will be implemented in Phase 2B.4."
            role="teacher"
          />
        }
      />
      <Route
        path="profile"
        element={
          <PlaceholderView
            title="Teacher Profile"
            phase="Phase 2B.0 Foundation"
            description="Faculty credentials, profile details, and account security settings."
            role="teacher"
          />
        }
      />

      {/* Role Boundary Guards: If teacher attempts student-exclusive subroutes */}
      <Route
        path="program"
        element={
          <AccessRestrictedView
            requiredRole="student"
            title="Student Program View Restricted"
            message="Curriculum and program enrollment views are reserved for student accounts. Teachers manage assigned batches in the Batches module."
          />
        }
      />
      <Route
        path="progress"
        element={
          <AccessRestrictedView
            requiredRole="student"
            title="Student Progress View Restricted"
            message="Student self-progress views are reserved for enrolled learners. Faculty evaluate progress via Gradebook and Feedback."
          />
        }
      />
      <Route
        path="documents"
        element={
          <AccessRestrictedView
            requiredRole="student"
            title="Student Documents Restricted"
            message="Student document management is reserved for enrolled student accounts."
          />
        }
      />

      {/* Default redirect to Dashboard */}
      <Route path="*" element={<Navigate to={APP_ROUTES.DASHBOARD} replace />} />
    </Routes>
  );
};
