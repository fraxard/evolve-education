import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { APP_ROUTES } from '../../routes/paths';
import { AppShell } from '../layouts/AppShell';
import { AppSignInPage } from '../pages/auth/AppSignInPage';
import { SignUpPage } from '../../pages/auth/SignUpPage';
import { TeacherRoutes } from './TeacherRoutes';
import { StudentRoutes } from './StudentRoutes';

/**
 * Dispatches active role to the appropriate route bundle inside AppShell.
 */
const OperationalRoleDispatcher: React.FC = () => {
  const { user } = useAuth();

  if (user?.role === 'teacher') {
    return <TeacherRoutes />;
  }

  if (user?.role === 'student') {
    return <StudentRoutes />;
  }

  return null;
};

/**
 * Operational App Router for app.localhost:5173 / app.domain.com
 * Uses the common operational route namespace: /dashboard, /batches, /students, etc.
 * No parallel /teacher/* or /student/* namespaces.
 */
export const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* 1. Normal Student-Facing Authentication Entry */}
      <Route path={APP_ROUTES.SIGN_IN} element={<AppSignInPage />} />
      <Route path="signup" element={<SignUpPage />} />
      <Route path="auth/signup" element={<SignUpPage />} />
      <Route path="auth/signin" element={<Navigate to={APP_ROUTES.SIGN_IN} replace />} />

      {/* 2. Common Protected Operational Area (/dashboard, /batches, /attendance, etc.) */}
      <Route element={<AppShell />}>
        <Route index element={<Navigate to={APP_ROUTES.DASHBOARD} replace />} />
        <Route path="*" element={<OperationalRoleDispatcher />} />
      </Route>

      {/* 3. Fallback */}
      <Route path="*" element={<Navigate to={APP_ROUTES.DASHBOARD} replace />} />
    </Routes>
  );
};
