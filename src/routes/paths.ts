/**
 * Centralized Route Dictionary & Subdomain Helpers
 * 
 * Defines route paths across the public website, authentication area,
 * and the independent institutional Admin Portal (admin.domain.com / admin.localhost).
 */

/**
 * Checks whether the current window location corresponds to the Admin subdomain.
 * Supports both local development (admin.localhost) and production (admin.*).
 */
export const isAdminHostname = (): boolean => {
  if (typeof window === 'undefined') return false;
  const h = window.location.hostname.toLowerCase();
  return h === 'admin.localhost' || h.startsWith('admin.');
};

/**
 * Builds an absolute URL pointing to the Admin subdomain.
 * In local dev: http://admin.localhost:5173{path}
 * In production: https://admin.{domain}{path}
 */
export const getAdminUrl = (path: string = '/dashboard'): string => {
  if (typeof window === 'undefined') return path;
  const { protocol, port, hostname } = window.location;

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    const portPart = port ? `:${port}` : '';
    return `${protocol}//admin.localhost${portPart}${path}`;
  }

  if (hostname === 'admin.localhost') {
    return path;
  }

  if (!hostname.startsWith('admin.')) {
    const domain = hostname.startsWith('www.') ? hostname.slice(4) : hostname;
    const portPart = port ? `:${port}` : '';
    return `${protocol}//admin.${domain}${portPart}${path}`;
  }

  return path;
};

/**
 * Builds an absolute URL pointing to the Public website.
 * In local dev: http://localhost:5173{path}
 * In production: https://{domain}{path}
 */
export const getPublicUrl = (path: string = '/'): string => {
  if (typeof window === 'undefined') return path;
  const { protocol, port, hostname } = window.location;

  if (hostname.startsWith('admin.localhost')) {
    const portPart = port ? `:${port}` : '';
    return `${protocol}//localhost${portPart}${path}`;
  }

  if (hostname.startsWith('admin.')) {
    const domain = hostname.replace(/^admin\./, '');
    const portPart = port ? `:${port}` : '';
    return `${protocol}//${domain}${portPart}${path}`;
  }

  return path;
};

/**
 * Admin Subdomain Routes
 * Mounted at root on the admin subdomain (e.g. admin.localhost:5173/dashboard)
 */
export const ADMIN_ROUTES = {
  ROOT: '/',
  SIGN_IN: '/signin',
  DASHBOARD: '/dashboard',
  APPLICATIONS: '/admissions/applications',
  APPLICATION_DETAIL: (id: string = ':id') => `/admissions/applications/${id}`,
  STUDENTS: '/people/students',
  STUDENT_RECORD: (id: string = ':id') => `/people/students/${id}`,
  TEACHERS: '/people/teachers',
  PROGRAMS: '/academic/programs',
  BATCHES: '/academic/batches',
  AUDIT_LOGS: '/system/audit-logs',
  SETTINGS: '/system/settings',
} as const;

/**
 * Public Site Routes
 * Mounted on the main domain (e.g. localhost:5173 or evolve.domain.com)
 */
export const ROUTES = {
  HOME: '/',
  
  // Public Authentication
  AUTH: {
    ROOT: '/auth',
    SIGN_IN: '/auth/signin',
    SIGN_UP: '/auth/signup',
  },

  // Admin mapping reference
  ADMIN: ADMIN_ROUTES,

  // Authenticated Educational Student Portal (Phase 2B)
  STUDENT: {
    ROOT: '/portal/student',
    DASHBOARD: '/portal/student/dashboard',
    PROGRAM: '/portal/student/program',
    ATTENDANCE: '/portal/student/attendance',
    ASSESSMENTS: '/portal/student/assessments',
    PROGRESS: '/portal/student/progress',
    FEEDBACK: '/portal/student/feedback',
    DOCUMENTS: '/portal/student/documents',
    PROFILE: '/portal/student/profile',
  },

  // Authenticated Educational Portal Area
  PORTAL: {
    ROOT: '/portal',
    STUDENT: '/portal/student',
    TEACHER: '/portal/teacher',
  },

  // Public Program Pages
  PROGRAMS: {
    ROOT: '/programs',
    DETAIL: (programId: string = ':programId') => `/programs/${programId}`,
  },

  // Public Contact Page
  CONTACT: '/contact',
} as const;
