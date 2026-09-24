/**
 * Centralized Route Dictionary & Subdomain Helpers
 * 
 * Defines route paths across the public website, authentication area,
 * and the independent institutional Admin Portal (admin.domain.com / admin.localhost).
 */

export {
  type HostSurface,
  getHostSurface,
  isAdminHostname,
  isAppHostname,
  isPublicHostname,
  getAdminUrl,
  getAppUrl,
  getPublicUrl,
} from '../utils/hostname';

/**
 * Operational App Routes (app.localhost:5173 / app.domain.com)
 * Shared root namespace for both Teacher and Student portals.
 */
export const APP_ROUTES = {
  ROOT: '/',
  SIGN_IN: '/signin',
  DASHBOARD: '/dashboard',
  // Teacher-oriented paths
  BATCHES: '/batches',
  STUDENTS: '/students',
  // Shared pedagogical paths
  ATTENDANCE: '/attendance',
  ASSESSMENTS: '/assessments',
  FEEDBACK: '/feedback',
  PROFILE: '/profile',
  // Student-oriented paths
  PROGRAM: '/program',
  PROGRESS: '/progress',
  DOCUMENTS: '/documents',
} as const;

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
