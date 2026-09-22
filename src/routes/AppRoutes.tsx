import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES, ADMIN_ROUTES, isAdminHostname, getAdminUrl } from './paths';
import { LandingPage } from '../pages/LandingPage';
import { RouteBoundary } from '../components/common/RouteBoundary';
import { SignInPage } from '../pages/auth/SignInPage';
import { SignUpPage } from '../pages/auth/SignUpPage';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { AdminLayout } from '../pages/admin/AdminLayout';
import { AdminSignInPage } from '../pages/admin/AdminSignInPage';
import { DashboardPage } from '../pages/admin/DashboardPage';
import { ApplicationsPage } from '../pages/admin/ApplicationsPage';
import { StudentsPage } from '../pages/admin/StudentsPage';
import { TeachersPage } from '../pages/admin/TeachersPage';
import { ProgramsPage } from '../pages/admin/ProgramsPage';
import { BatchesPage } from '../pages/admin/BatchesPage';
import { AuditLogsPage } from '../pages/admin/AuditLogsPage';
import { SettingsPage } from '../pages/admin/SettingsPage';
import { StudentLayout } from '../pages/student/StudentLayout';
import { StudentDashboardPage } from '../pages/student/DashboardPage';
import { MyProgramPage } from '../pages/student/MyProgramPage';
import { AttendancePage } from '../pages/student/AttendancePage';
import { AssessmentsPage } from '../pages/student/AssessmentsPage';
import { ProgressPage } from '../pages/student/ProgressPage';
import { FeedbackPage } from '../pages/student/FeedbackPage';
import { DocumentsPage } from '../pages/student/DocumentsPage';
import { StudentProfilePage } from '../pages/student/ProfilePage';

/**
 * Public domain redirect to Admin Subdomain for /admin/* paths
 */
const CrossDomainAdminRedirect: React.FC = () => {
  useEffect(() => {
    window.location.href = getAdminUrl('/dashboard');
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-300 font-mono text-xs">
      Redirecting to administrative control panel...
    </div>
  );
};

export const AppRoutes: React.FC = () => {
  const isAdminHost = isAdminHostname();

  // ---------------------------------------------------------------------------
  // 1. ADMIN SUBDOMAIN ROUTER (e.g. admin.localhost:5173 or admin.domain.com)
  // ---------------------------------------------------------------------------
  if (isAdminHost) {
    return (
      <Routes>
        {/* Admin Sign-In: Dedicated entry page */}
        <Route path={ADMIN_ROUTES.SIGN_IN} element={<AdminSignInPage />} />
        <Route path="/auth/*" element={<Navigate to={ADMIN_ROUTES.SIGN_IN} replace />} />

        {/* Protected Administrative Control Panel */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path={ADMIN_ROUTES.DASHBOARD} element={<DashboardPage />} />
          <Route path={ADMIN_ROUTES.APPLICATIONS} element={<ApplicationsPage />} />
          <Route path={ADMIN_ROUTES.APPLICATION_DETAIL()} element={<ApplicationsPage />} />
          <Route path={ADMIN_ROUTES.STUDENTS} element={<StudentsPage />} />
          <Route path={ADMIN_ROUTES.STUDENT_RECORD()} element={<StudentsPage />} />
          <Route path={ADMIN_ROUTES.TEACHERS} element={<TeachersPage />} />
          <Route path={ADMIN_ROUTES.PROGRAMS} element={<ProgramsPage />} />
          <Route path={ADMIN_ROUTES.BATCHES} element={<BatchesPage />} />
          <Route path={ADMIN_ROUTES.AUDIT_LOGS} element={<AuditLogsPage />} />
          <Route path={ADMIN_ROUTES.SETTINGS} element={<SettingsPage />} />
        </Route>

        {/* Default root on admin subdomain navigates to dashboard */}
        <Route path="/" element={<Navigate to={ADMIN_ROUTES.DASHBOARD} replace />} />

        {/* Legacy /admin/* fallback on admin host */}
        <Route path="/admin/*" element={<Navigate to={ADMIN_ROUTES.DASHBOARD} replace />} />

        {/* Catch-all fallback on admin host */}
        <Route path="*" element={<Navigate to={ADMIN_ROUTES.DASHBOARD} replace />} />
      </Routes>
    );
  }

  // ---------------------------------------------------------------------------
  // 2. PUBLIC SITE ROUTER (e.g. localhost:5173 or evolve.domain.com)
  // ---------------------------------------------------------------------------
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path={ROUTES.HOME} element={<LandingPage />} />

      {/* Public User Authentication (Students / Teachers) */}
      <Route path={ROUTES.AUTH.SIGN_IN} element={<SignInPage />} />
      <Route path="/signin" element={<Navigate to={ROUTES.AUTH.SIGN_IN} replace />} />
      <Route path={ROUTES.AUTH.SIGN_UP} element={<SignUpPage />} />

      {/* Forward any public /admin attempts across subdomains to admin portal */}
      <Route path="/admin/*" element={<CrossDomainAdminRedirect />} />
      <Route path="/admin" element={<CrossDomainAdminRedirect />} />

      {/* Unauthenticated public /dashboard redirect to public sign-in */}
      <Route path="/dashboard" element={<Navigate to={ROUTES.AUTH.SIGN_IN} replace />} />

      {/* Authenticated Student Portal (Phase 2B) */}
      <Route
        path={ROUTES.PORTAL.STUDENT}
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to={ROUTES.STUDENT.DASHBOARD} replace />} />
        <Route path="dashboard" element={<StudentDashboardPage />} />
        <Route path="program" element={<MyProgramPage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="assessments" element={<AssessmentsPage />} />
        <Route path="progress" element={<ProgressPage />} />
        <Route path="feedback" element={<FeedbackPage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="profile" element={<StudentProfilePage />} />
        <Route path="*" element={<Navigate to={ROUTES.STUDENT.DASHBOARD} replace />} />
      </Route>

      {/* Authenticated Teacher Portal (Reserved for Future Phase via lightweight boundary) */}
      <Route
        path={`${ROUTES.PORTAL.TEACHER}/*`}
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <RouteBoundary
              title="Teacher Portal"
              category="portal"
              path={ROUTES.PORTAL.TEACHER}
            />
          </ProtectedRoute>
        }
      />

      {/* Future Public Program Routes */}
      <Route
        path={ROUTES.PROGRAMS.ROOT}
        element={
          <RouteBoundary
            title="Programs Directory"
            category="program"
            path={ROUTES.PROGRAMS.ROOT}
          />
        }
      />
      <Route
        path={ROUTES.PROGRAMS.DETAIL()}
        element={
          <RouteBoundary
            title="Program Details"
            category="program"
            path="/programs/:programId"
          />
        }
      />

      {/* Future Dedicated Contact Route */}
      <Route
        path={ROUTES.CONTACT}
        element={
          <RouteBoundary
            title="Contact"
            category="page"
            path={ROUTES.CONTACT}
          />
        }
      />

      {/* Catch-all fallback on public host */}
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  );
};
