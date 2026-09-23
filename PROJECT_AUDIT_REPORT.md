# Evolve Education — Complete Project Audit & Verification Report

**Date of Audit:** September 24, 2026  
**Auditor:** Antigravity AI Senior Systems Auditor  
**Repository:** `fraxard/evolve-education`  
**Current Branch:** `main`  
**Audit Scope:** Full Stack (Landing Page, Admin Portal, Student Portal, Backend API, Database Relational Foundation, Scripts & Build Pipeline)

---

## 1. Executive Summary

Evolve Education is a full-stack educational and institutional management platform built with React 18, TypeScript, Tailwind CSS, Vite, Node.js (Express), and PostgreSQL. 

The application architecture is divided into three distinct operational domains:
1. **Public Marketing & Conversion Website** (`localhost:5173` / `domain.com`): High-converting marketing landing page featuring 8 distinct content sections, interactive curriculum previews, an accessible modal, and a multi-step admission application workflow.
2. **Institutional Admin Portal** (`admin.localhost:5173` / `admin.domain.com`): Comprehensive administrative operations platform featuring applicant review, approval/rejection lifecycle, student ledger with academic and cohort transfer tracking, teacher assignment, curriculum program management, batch capacity management, and immutable audit logs.
3. **Student Portal** (`/portal/student` on public domain): Student learning dashboard displaying live composite academic telemetry (enrollment, cohort, assigned teacher, calculated attendance percentage, latest assessment results, and recent instructor notes).

### Current Project Baseline
- **Build Status:** **PASS** (100% clean TypeScript build on both frontend and backend; Vite production bundle built in 8.64s).
- **Database Engine:** PostgreSQL 18 with 14 relational tables, foreign key constraints, row-level concurrency locks (`SELECT ... FOR UPDATE`), and `connect-pg-simple` server-side session persistence.
- **Backend API:** 36 endpoints across 10 modular routers with Zod schema validation, Bcrypt (cost 12), rate limiting, and server-side role authorization (`requireAuth`, `requireRole`, `requireActive`).
- **Phase Completion:**
  - **Phase 1 (Landing Page):** Fully implemented and functional.
  - **Phase 2A (Auth & Admin Platform):** Fully implemented and verified.
  - **Phase 2B.1 - 2B.2 (Student Portal Foundation & Composite Dashboard):** Fully implemented and verified.
  - **Phase 2B.3 - 2B.9 (Detailed Student Portal Sub-pages):** Scaffolding / placeholders implemented (`StudentPlaceholderPage` and backend foundation stubs).

---

## 2. Current Architecture

```
                             [ Browser Client ]
                                     │
           ┌─────────────────────────┴─────────────────────────┐
           ▼                                                   ▼
[ Public Domain: localhost:5173 ]             [ Admin Subdomain: admin.localhost:5173 ]
 • Landing Page (Wireframe 01-08)              • Dedicated Admin Sign-In (/signin)
 • Multi-step Admission Form (/auth/signup)    • Administrative Dashboard (/dashboard)
 • Student Sign-In (/auth/signin)              • Admissions & Candidate Review (/admissions/applications)
 • Authenticated Student Portal (/portal/student) • Student Ledger & Cohort Mobility (/people/students)
                                               • Faculty Directory (/people/teachers)
                                               • Academic Programs & Batches (/academic/*)
                                               • Immutable Audit Trail (/system/audit-logs)
                                               • Runtime Governance Telemetry (/system/settings)
           │                                                   │
           └─────────────────────────┬─────────────────────────┘
                                     │ (Vite Proxy: /api -> :5000)
                                     ▼
                      [ Express 4.21 Backend API ]
                         Port: 5000 | TypeScript
     ┌──────────────────────────────────────────────────────────────┐
     │ • Session Auth (connect-pg-simple, HttpOnly, Lax, 7-day TTL) │
     │ • Cross-Hostname SSO Handoff Tickets (60s memory TTL)        │
     │ • Middleware: requireAuth, requireRole, requireActive        │
     │ • Rate Limiters: Auth (/signin: 10/15m), Public Apps (10/1h) │
     └──────────────────────────────┬───────────────────────────────┘
                                    │
                                    ▼
                     [ PostgreSQL Relational Database ]
     ┌──────────────────────────────────────────────────────────────┐
     │ 14 Tables:                                                   │
     │ users, session, programs, teachers, batches,                 │
     │ student_applications, students, enrollments, audit_logs,     │
     │ attendance_records, assessments, assessment_results,         │
     │ teacher_notes, student_documents                             │
     └──────────────────────────────────────────────────────────────┘
```

---

## 3. Current Git & Development Status

### Commit Timeline

| Feature / Phase | Commit Hash | Date | Author | Verified Status |
| :--- | :--- | :--- | :--- | :--- |
| **Initial Landing Page** | `cdbc8b3` | Initial | Ayush | 🟢 Verified Working |
| **Phase 2A Auth & Admin Platform** | `81127c9` | Sep 16, 2026 | Ayush | 🟢 Verified Working |
| **Phase 2B Student Portal & Admin Completion** | `b1265f2` | Sep 22, 2026 | Ayush | 🟢 Verified Working (Dashboard & Foundation) |

- **Current Branch:** `main`
- **Working Tree State:** Clean (`nothing to commit, working tree clean`)
- **Git Consistency:** Branches and remote origins are aligned (`origin/main`).

---

## 4. Feature Inventory

| Feature / Component | File Location | Routed? | Data Source | Functional State | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Header** | `src/components/Header.tsx` | Yes (`/`) | Static config | Navigation, About modal trigger, Auth links | 🟢 VERIFIED |
| **Hero** | `src/components/Hero.tsx` | Yes (`/`) | Static config | Dual CTAs, smooth anchor scrolling | 🟢 VERIFIED |
| **Why Choose Us** | `src/components/WhyChooseUs.tsx` | Yes (`/`) | Static config | 4 differentiator cards | 🟢 VERIFIED |
| **Featured Programs** | `src/components/FeaturedPrograms.tsx` | Yes (`/`) | Static config | Abacus highlight, program select | 🟢 VERIFIED |
| **Methodology** | `src/components/Methodology.tsx` | Yes (`/`) | Static config | 4-step progressive pedagogy | 🟢 VERIFIED |
| **Benefits** | `src/components/Benefits.tsx` | Yes (`/`) | Static config | 6 student outcome cards | 🟢 VERIFIED |
| **Learning Experience** | `src/components/LearningExperience.tsx` | Yes (`/`) | Static config | 3 trust pillars | 🟢 VERIFIED |
| **FAQ Accordion** | `src/components/FAQ.tsx` | Yes (`/`) | Static config | Single-open accordion toggle | 🟢 VERIFIED |
| **Contact Enquiry** | `src/components/ContactEnquiry.tsx` | Yes (`/`) | Client State | Validation, 500ms simulation (no backend endpoint) | 🟠 PARTIAL |
| **About Modal** | `src/components/AboutModal.tsx` | Yes (`/`) | Static config | Portal overlay, Escape key, scroll lock | 🟢 VERIFIED |
| **Footer** | `src/components/Footer.tsx` | Yes (`/`) | Static config | Sitemap links, back-to-top | 🟢 VERIFIED |
| **Mobile Bottom CTA** | `src/components/MobileBottomCta.tsx` | Yes (`/`) | Client State | Visible on mobile, anchor scroll | 🟢 VERIFIED |
| **Public Admission Sign-Up** | `src/pages/auth/SignUpPage.tsx` | `/auth/signup` | Live API | 4-step wizard, validates against `/api/applications` | 🟢 VERIFIED |
| **Public Sign-In** | `src/pages/auth/SignInPage.tsx` | `/auth/signin` | Live API | Authenticates via `/api/auth/signin`, handles SSO tickets | 🟢 VERIFIED |
| **Admin Sign-In** | `src/pages/admin/AdminSignInPage.tsx` | `admin.*/signin` | Live API | Dedicated administrative portal login | 🟢 VERIFIED |
| **Admin Dashboard** | `src/pages/admin/DashboardPage.tsx` | `admin.*/dashboard` | Live API | Real-time counts, recent apps, audit entries | 🟢 VERIFIED |
| **Admin Applications** | `src/pages/admin/ApplicationsPage.tsx` | `admin.*/admissions/applications` | Live API | Search, filter, inspect, reject, approve & activate | 🟢 VERIFIED |
| **Admin Students Ledger** | `src/pages/admin/StudentsPage.tsx` | `admin.*/people/students` | Live API | Full drawer, status update, batch transfer | 🟢 VERIFIED |
| **Admin Teachers Directory** | `src/pages/admin/TeachersPage.tsx` | `admin.*/people/teachers` | Live API | Add faculty, edit details, toggle active status | 🟢 VERIFIED |
| **Admin Programs** | `src/pages/admin/ProgramsPage.tsx` | `admin.*/academic/programs` | Live API | Add program, edit description, toggle active | 🟢 VERIFIED |
| **Admin Batches** | `src/pages/admin/BatchesPage.tsx` | `admin.*/academic/batches` | Live API | Add cohort, capacity guard, teacher assignment | 🟢 VERIFIED |
| **Admin Audit Logs** | `src/pages/admin/AuditLogsPage.tsx` | `admin.*/system/audit-logs` | Live API | Paginated audit trail with JSON detail modal | 🟢 VERIFIED |
| **Admin Settings** | `src/pages/admin/SettingsPage.tsx` | `admin.*/system/settings` | Static config | System runtime & invariant telemetry | 🟢 VERIFIED |
| **Student Dashboard** | `src/pages/student/DashboardPage.tsx` | `/portal/student/dashboard` | Live API | Live composite payload, attendance %, metrics | 🟢 VERIFIED |
| **Student My Program** | `src/pages/student/MyProgramPage.tsx` | `/portal/student/program` | Stub (200 OK) | Placeholder component (`Stage 2B.3 Scheduled`) | ⚪ PLACEHOLDER |
| **Student Attendance** | `src/pages/student/AttendancePage.tsx` | `/portal/student/attendance` | Stub (200 OK) | Placeholder component (`Stage 2B.4 Scheduled`) | ⚪ PLACEHOLDER |
| **Student Assessments** | `src/pages/student/AssessmentsPage.tsx` | `/portal/student/assessments` | Stub (200 OK) | Placeholder component (`Stage 2B.5 Scheduled`) | ⚪ PLACEHOLDER |
| **Student Progress** | `src/pages/student/ProgressPage.tsx` | `/portal/student/progress` | Stub (200 OK) | Placeholder component (`Stage 2B.6 Scheduled`) | ⚪ PLACEHOLDER |
| **Student Feedback** | `src/pages/student/FeedbackPage.tsx` | `/portal/student/feedback` | Stub (200 OK) | Placeholder component (`Stage 2B.7 Scheduled`) | ⚪ PLACEHOLDER |
| **Student Documents** | `src/pages/student/DocumentsPage.tsx` | `/portal/student/documents` | Stub (200 OK) | Placeholder component (`Stage 2B.9 Scheduled`) | ⚪ PLACEHOLDER |
| **Student Profile** | `src/pages/student/ProfilePage.tsx` | `/portal/student/profile` | Stub (200/501) | Placeholder component (`Stage 2B.8 Scheduled`) | ⚪ PLACEHOLDER |

---

## 5. Public Website Status

- **Homepage Rendering:** Fully functional across desktop and mobile viewports.
- **Header & Navigation:** Smooth scrolling to `#home`, `#why-us`, `#programs`, `#methodology`, `#learning-experience`, `#faq`, `#contact`.
- **Hero:** Displays headline, tagline, and two action buttons ("Explore Abacus" sets program focus, "Enquire Now" scrolls to contact form).
- **Curriculum / Programs:** Displays Abacus foundational program and program selection.
- **FAQ Accordion:** Implements accordion state where only one question is expanded at a time.
- **About Modal:** Built with React Portal (`createPortal`), locks body scroll when open, supports Escape key dismiss and backdrop click dismiss.
- **Contact Enquiry:** Validates Full Name, Email, and Phone number. **Note:** Currently uses a `setTimeout` 500ms simulation on client-side rather than persisting to a backend inquiries table.

---

## 6. Routing Audit

| Route | Expected Role | Component / Destination | Status | Implementation Details |
| :--- | :--- | :--- | :--- | :--- |
| `/` | Public | `LandingPage` | 🟢 Working | Full landing page with all 8 sections |
| `/auth/signin` | Public | `SignInPage` | 🟢 Working | Student / Teacher authentication |
| `/auth/signup` | Public | `SignUpPage` | 🟢 Working | 4-step admission application form |
| `/signin` | Public | Redirect | 🟢 Working | Redirects to `/auth/signin` |
| `/dashboard` | Public | Redirect | 🟢 Working | Redirects to `/auth/signin` |
| `/admin` & `/admin/*` | Public host | `CrossDomainAdminRedirect` | 🟢 Working | Forwarding handler redirecting to `admin.localhost:5173` |
| `/portal/student/dashboard` | `student` | `StudentDashboardPage` | 🟢 Working | Authenticated student composite dashboard |
| `/portal/student/program` | `student` | `MyProgramPage` | ⚪ Placeholder | Renders `StudentPlaceholderPage` (Stage 2B.3) |
| `/portal/student/attendance` | `student` | `AttendancePage` | ⚪ Placeholder | Renders `StudentPlaceholderPage` (Stage 2B.4) |
| `/portal/student/assessments` | `student` | `AssessmentsPage` | ⚪ Placeholder | Renders `StudentPlaceholderPage` (Stage 2B.5) |
| `/portal/student/progress` | `student` | `ProgressPage` | ⚪ Placeholder | Renders `StudentPlaceholderPage` (Stage 2B.6) |
| `/portal/student/feedback` | `student` | `FeedbackPage` | ⚪ Placeholder | Renders `StudentPlaceholderPage` (Stage 2B.7) |
| `/portal/student/documents` | `student` | `DocumentsPage` | ⚪ Placeholder | Renders `StudentPlaceholderPage` (Stage 2B.9) |
| `/portal/student/profile` | `student` | `StudentProfilePage` | ⚪ Placeholder | Renders `StudentPlaceholderPage` (Stage 2B.8) |
| `/portal/teacher/*` | `teacher` | `RouteBoundary` | ⚪ Placeholder | Boundary page reserving Teacher portal |
| `/programs` | Public | `RouteBoundary` | ⚪ Placeholder | Boundary page reserving future directory |
| `/programs/:id` | Public | `RouteBoundary` | ⚪ Placeholder | Boundary page reserving future detail view |
| `/contact` | Public | `RouteBoundary` | ⚪ Placeholder | Boundary page reserving standalone contact |
| `admin.*/signin` | Admin Public | `AdminSignInPage` | 🟢 Working | Dedicated institutional login form |
| `admin.*/dashboard` | `admin` | `DashboardPage` | 🟢 Working | Real-time administrative metrics |
| `admin.*/admissions/applications`| `admin` | `ApplicationsPage` | 🟢 Working | Admissions review and approval workflow |
| `admin.*/people/students` | `admin` | `StudentsPage` | 🟢 Working | Student directory, status, transfer modals |
| `admin.*/people/teachers` | `admin` | `TeachersPage` | 🟢 Working | Teacher management |
| `admin.*/academic/programs` | `admin` | `ProgramsPage` | 🟢 Working | Program catalog management |
| `admin.*/academic/batches` | `admin` | `BatchesPage` | 🟢 Working | Cohort & capacity management |
| `admin.*/system/audit-logs` | `admin` | `AuditLogsPage` | 🟢 Working | Paginated audit trail |
| `admin.*/system/settings` | `admin` | `SettingsPage` | 🟢 Working | Runtime configuration & invariants view |

---

## 7. Authentication Status

### Student Authentication Flow
1. **Public Registration:** Submitted via `/api/applications` (`POST`). Creates `users` record with `role = 'student'` and `account_status = 'pending'`, and an unapproved `student_applications` row.
2. **Pending Login:** If applicant logs in before admin review, login succeeds but `account_status = 'pending'`. Protected routes block access, showing pending admission state.
3. **Approval & Activation:** Admin approves application, creating student record and enrollment atomically. User status updates to `active`.
4. **Active Student Login:** Student signs in, `requireAuth` populates `req.currentUser.studentId`, allowing access to `/portal/student/dashboard`.

### Admin Authentication Flow
1. **Admin Credentials:** Authenticated against `users` table where `role = 'admin'`. Initial credentials created via `npm run admin:bootstrap`.
2. **Subdomain Security:** Admin routes are isolated to `admin.localhost` or `admin.domain.com`. Accessing admin routes on the public domain triggers `CrossDomainAdminRedirect`.
3. **SSO Ticket Handoff:** In local development where cookies cannot span different hostnames (`localhost` vs `admin.localhost`), an in-memory ticket mechanism (`/api/auth/sso-ticket` and `/api/auth/claim-ticket`) transfers sessions with a 60-second TTL.

### Role Authorization Invariants
- **Student accessing Admin Routes:** Blocked by `requireRole('admin')` returning HTTP 403 Forbidden. Frontend renders `Administrative Access Restricted` screen with a button to return to public site.
- **Admin accessing Student Routes:** Blocked by `requireRole('student')` returning HTTP 403 Forbidden.
- **Teacher accessing Admin Routes:** Blocked by `requireRole('admin')` returning HTTP 403 Forbidden.
- **Unauthenticated Users:** Strictly rejected with HTTP 401 Unauthorized across all protected endpoints.

---

## 8. Session & Cookie Security Audit

| Security Control | Configured Value | Verification Finding | Classification |
| :--- | :--- | :--- | :--- |
| **Session Cookie Name** | `evolve_sid` | Verified in Express session configuration | 🟢 Compliant |
| **HttpOnly Flag** | `true` | Verified; client JavaScript cannot access session cookie | 🟢 Compliant |
| **Secure Flag** | `process.env.NODE_ENV === 'production'` | Enabled in production; disabled in dev to allow HTTP | 🟢 Compliant |
| **SameSite Policy** | `lax` | Protects against CSRF while allowing top-level navigation | 🟢 Compliant |
| **Session Lifetime** | 7 Days (`604,800,000ms`) | Verified in cookie settings | 🟢 Compliant |
| **Session Store** | PostgreSQL (`connect-pg-simple`) | Stored in `public.session` table; survives server restarts | 🟢 Compliant |
| **Session Pruning** | `pruneSessionInterval: 900` | Prunes expired sessions from PostgreSQL every 15 minutes | 🟢 Compliant |
| **Session Termination** | `POST /api/auth/signout` | Destroys row in `session` table and clears cookie | 🟢 Compliant |
| **Role Verification** | Live DB Query | `requireAuth` queries PostgreSQL on every request | 🟢 Compliant |

---

## 9. Admin Portal Status

### Dashboard (`/dashboard`)
- **Metrics Displayed:** Pending Applications, Active Students, Active Teachers, Active Programs, Active Batches.
- **Recent Applications List:** Displays latest 5 submissions with student name, requested program, submission timestamp, and status badge.
- **Recent Activity Ledger:** Displays latest 8 entries from `audit_logs` table with actor email, action code, and timestamp.

### Candidate Admissions (`/admissions/applications`)
- **Search & Filter:** Filters by status (`pending`, `approved`, `rejected`) and program.
- **Rejection Workflow:** Modal captures rejection rationale, sets application status to `rejected`, sets user `account_status = 'rejected'`, and logs audit record. **Verified:** Zero student rows or enrollments created.
- **Approval Workflow:** Modal requires selecting Program, Batch, Teacher, and Start Date. Executes an ACID database transaction:
  1. Concurrency lock on application (`SELECT ... FOR UPDATE`).
  2. Concurrency lock on cohort batch (`SELECT ... FOR UPDATE`).
  3. Validates batch capacity against active enrollments (`COUNT(*) < capacity`).
  4. Updates application status to `approved`.
  5. Inserts new record into `students` table.
  6. Inserts active enrollment record into `enrollments` table.
  7. Updates `users.account_status` to `active`.
  8. Inserts immutable audit record into `audit_logs`.

### Student Management (`/people/students`)
- **Ledger View:** Lists all students with guardian details, active enrollment, program, batch, and status badge.
- **Detail Drawer:** Displays full student profile, guardian details, and complete enrollment history ledger.
- **Cohort Transfer Modal:** Admin can transfer a student to another cohort batch. Invariant verified: Transferred student's prior enrollment is marked `transferred`, new enrollment is created with `active` status, and action is logged. Suspended students cannot be transferred.
- **Lifecycle Status Modal:** Supports changing student status to `active`, `suspended`, `graduated`, or `withdrawn`. Invariant verified: Withdrawing or graduating a student terminates active enrollments (`withdrawn` or `completed`).

### Faculty Directory (`/people/teachers`)
- **Management:** Lists all instructors with qualifications, specialization, phone, and active status.
- **Creation & Update:** Supports creating new teacher accounts (with temporary password) and editing faculty details.

### Academic Programs (`/academic/programs`)
- **Catalog:** Lists educational programs with levels, durations, and active status.
- **Controls:** Supports creating new programs, editing curriculum descriptions, and toggling active/inactive status.

### Cohort Batches (`/academic/batches`)
- **Capacity Controls:** Cohorts have defined capacities. Capacity cannot be reduced below the number of currently enrolled students.
- **Teacher Assignment:** Assigns active faculty member to each cohort.

### Audit Logs (`/system/audit-logs`)
- **Audit Ledger:** Displays all administrative actions (`PROGRAM_CREATED`, `BATCH_CREATED`, `STUDENT_ACTIVATED`, `STUDENT_TRANSFERRED`, `STUDENT_SUSPENDED`, etc.).
- **Details Modal:** Formatted JSON viewer inspecting metadata payloads attached to each action.

---

## 10. Student Portal Status

### Student Dashboard (`/portal/student/dashboard`)
- **Live Composite Payload:** Connected to `GET /api/student/dashboard`. Returns:
  - Student identity (`id`, `fullName`, `email`, `accountStatus`).
  - Active enrollment details (`program`, `batch`, `teacher`, `startDate`).
  - Attendance metrics (`totalSessions`, `present`, `absent`, `late`, `excused`, `attendanceRate`). **Invariant verified:** When `totalSessions == 0`, `attendanceRate` is `null` (renders informative empty state rather than a misleading `0%`).
  - Academic summary (`totalAssessments`, `completedAssessments`, `latestAssessment` with score and percentage).
  - Recent instructor feedback (latest 3 notes from `teacher_notes` table).
- **Security & Privacy:** Student identity is strictly derived from server session. Invariant verified: Query parameter spoofing (`?studentId=...`) is ignored. Other students' records or confidential notes cannot be accessed.

### Student Sub-pages (Phase 2B.3 - 2B.9)
The navigation sidebar links to all student sections. Each sub-page renders a structured `StudentPlaceholderPage` with stage badge, description, and list of upcoming features:
- **My Program:** `Phase 2B.3 Scheduled` (Curriculum milestones & syllabus).
- **Attendance:** `Phase 2B.4 Scheduled` (Session ledger & excuse requests).
- **Assessments:** `Phase 2B.5 Scheduled` (Graded exam breakdown & remarks).
- **Progress:** `Phase 2B.6 Scheduled` (Visual milestones & learning curves).
- **Feedback:** `Phase 2B.7 Scheduled` (Teacher notes & evaluations).
- **Profile:** `Phase 2B.8 Scheduled` (Personal & guardian details update).
- **Documents:** `Phase 2B.9 Scheduled` (Certificates & study materials).

---

## 11. Backend API Audit

| Method | Endpoint | Auth | Role | Validation | DB Operations | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | None | Public | None | None | 🟢 Verified |
| `POST` | `/api/auth/signin` | None | Public | Email, password | Reads `users`, writes `users.last_login_at` | 🟢 Verified |
| `POST` | `/api/auth/signout` | None | Any | None | Destroys row in `session` | 🟢 Verified |
| `POST` | `/api/auth/sso-ticket`| Yes | Any | None | In-memory ticket generation | 🟢 Verified |
| `GET` | `/api/auth/claim-ticket`| None | Public | Ticket UUID | Consumes ticket, saves session, redirects | 🟢 Verified |
| `GET` | `/api/auth/me` | None | Any | None | Validates session against `users` | 🟢 Verified |
| `POST` | `/api/applications` | None | Public | Zod `applicationSchema` | Inserts `users`, inserts `student_applications` | 🟢 Verified |
| `GET` | `/api/applications` | Yes | `admin` | Search/status filters | Reads `student_applications`, `programs` | 🟢 Verified |
| `GET` | `/api/applications/:id`| Yes| `admin` | UUID | Reads `student_applications` | 🟢 Verified |
| `POST` | `/api/applications/:id/reject` | Yes | `admin` | Zod `rejectionSchema` | Updates `student_applications`, `users`, logs audit | 🟢 Verified |
| `POST` | `/api/applications/:id/approve-and-activate` | Yes | `admin` | Zod `approvalSchema` | Transaction: locks batch, inserts `students`, `enrollments`, updates `users`, logs audit | 🟢 Verified |
| `GET` | `/api/students` | Yes | `admin`, `teacher` | Program, batch, teacher, status filters | Reads `students`, `users`, `enrollments` | 🟢 Verified |
| `GET` | `/api/students/:id` | Yes | `admin`, `teacher` | UUID | Reads `students`, `enrollments`, `attendance_records`, `assessments` | 🟢 Verified |
| `POST` | `/api/students/:id/transfer` | Yes | `admin` | Zod `transferSchema` | Transaction: closes old enrollment, opens new enrollment, logs audit | 🟢 Verified |
| `POST` | `/api/students/:id/status` | Yes | `admin` | Zod `statusUpdateSchema` | Updates `students.status`, closes enrollments if withdrawn/graduated, logs audit | 🟢 Verified |
| `GET` | `/api/teachers` | Yes | `admin` | Status filter | Reads `teachers`, `users` | 🟢 Verified |
| `POST` | `/api/teachers` | Yes | `admin` | Zod `teacherCreateSchema` | Transaction: creates `users`, creates `teachers`, logs audit | 🟢 Verified |
| `PATCH`| `/api/teachers/:id` | Yes | `admin` | Zod `teacherUpdateSchema` | Updates `teachers`, logs audit | 🟢 Verified |
| `GET` | `/api/programs` | None | Public | Active filter | Reads `programs` | 🟢 Verified |
| `POST` | `/api/programs` | Yes | `admin` | Zod `programCreateSchema` | Inserts `programs`, logs audit | 🟢 Verified |
| `PATCH`| `/api/programs/:id` | Yes | `admin` | Zod `programUpdateSchema` | Updates `programs`, logs audit | 🟢 Verified |
| `GET` | `/api/batches` | None | Public | Program, teacher, active filters | Reads `batches`, `programs`, `teachers` | 🟢 Verified |
| `POST` | `/api/batches` | Yes | `admin` | Zod `batchCreateSchema` | Inserts `batches`, logs audit | 🟢 Verified |
| `PATCH`| `/api/batches/:id` | Yes | `admin` | Zod `batchUpdateSchema` | Validates capacity >= active enrollments, updates `batches`, logs audit | 🟢 Verified |
| `GET` | `/api/enrollments` | Yes | `admin` | Student, batch, status filters | Reads `enrollments`, joins `students`, `batches`, `programs`, `teachers` | 🟢 Verified |
| `GET` | `/api/audit-logs` | Yes | `admin` | Limit, action filter | Reads `audit_logs`, joins `users` | 🟢 Verified |
| `GET` | `/api/admin/dashboard`| Yes | `admin` | None | Parallel aggregation of metrics, recent apps, audit logs | 🟢 Verified |
| `GET` | `/api/student/dashboard`| Yes | `student` | Derived from session | Live composite dashboard payload | 🟢 Verified |
| `GET` | `/api/student/program`| Yes | `student` | Derived from session | Foundation stub (returns 200 OK) | ⚪ Placeholder |
| `GET` | `/api/student/attendance`| Yes| `student` | Derived from session | Foundation stub (returns 200 OK) | ⚪ Placeholder |
| `GET` | `/api/student/assessments`| Yes| `student`| Derived from session | Foundation stub (returns 200 OK) | ⚪ Placeholder |
| `GET` | `/api/student/progress`| Yes | `student` | Derived from session | Foundation stub (returns 200 OK) | ⚪ Placeholder |
| `GET` | `/api/student/feedback`| Yes | `student` | Derived from session | Foundation stub (returns 200 OK) | ⚪ Placeholder |
| `GET` | `/api/student/documents`| Yes| `student` | Derived from session | Foundation stub (returns 200 OK) | ⚪ Placeholder |
| `GET` | `/api/student/profile`| Yes | `student` | Derived from session | Foundation stub (returns 200 OK) | ⚪ Placeholder |
| `PATCH`| `/api/student/profile`| Yes | `student` | None | Stub (returns 501 Not Implemented) | ⚪ Placeholder |

---

## 12. Database Status

- **Technology:** PostgreSQL with `pgcrypto` extension for UUID generation.
- **Migration Runner:** `backend/src/db/migrate.ts` executing raw SQL migrations tracked in `migrations_history` table.
- **Relational Tables:**
  1. `users`: System authentication accounts (roles: `student`, `teacher`, `admin`; status: `pending`, `active`, `rejected`, `inactive`).
  2. `session`: Server-side session store managed by `connect-pg-simple`.
  3. `programs`: Educational courses (slug, level, duration, active status).
  4. `teachers`: Faculty records linked 1:1 with `users`.
  5. `batches`: Cohorts linked to `programs` and optional `teachers`, with explicit student capacity constraints.
  6. `student_applications`: Admission applications submitted through public onboarding.
  7. `students`: Active/graduated student records linked 1:1 with `users` and `student_applications`.
  8. `enrollments`: First-class participation ledger linking student, program, batch, and teacher.
  9. `audit_logs`: Immutable security ledger recording actions, actors, targets, and JSON payloads.
  10. `attendance_records`: Session attendance records (present, absent, late, excused).
  11. `assessments`: Tests and exam definitions.
  12. `assessment_results`: Graded student exam scores and remarks.
  13. `teacher_notes`: Faculty feedback notes.
  14. `student_documents`: Uploaded student files and certificates.
- **Indexes:** Comprehensive B-tree indexes covering emails, roles, account status, foreign keys, and audit timestamps.
- **Delete Behavior:** Foreign keys to core educational entities use `ON DELETE RESTRICT` to prevent accidental cascading deletion of educational history.

---

## 13. End-to-End Workflow Status

```
[ Public Applicant ]
        │  POST /api/applications (Form submission with student details, guardian info, program preference)
        ▼
[ Database: users (pending) + student_applications (pending) ]
        │
        ▼
[ Admin Reviews Candidate in Admissions Dashboard ]
        │
        ├─────────────────────────────┬─────────────────────────────┐
        ▼                             ▼                             ▼
   [ REJECT ]                    [ INCOMPLETE ]                [ APPROVE & ACTIVATE ]
• Modal captures reason.        • Left in pending.         • Admin assigns Program, Batch, Teacher.
• users -> rejected.            • Applicant cannot log in  • Concurrency locks check batch capacity.
• applications -> rejected.       to portal.               • users -> active.
• 0 students created.                                      • applications -> approved.
• Audit log recorded.                                      • students row created.
                                                           • enrollments row created (active).
                                                           • Audit log recorded.
                                                                    │
                                                                    ▼
                                                    [ Student Logs In to Portal ]
                                                    • Session attaches studentId.
                                                    • Composite dashboard displays cohort,
                                                      teacher, attendance, assessment marks.
```

---

## 14. UI / UX Audit

- **Design System:** Custom design system built with Tailwind CSS, utilizing warm, educational brand tones:
  - Brand Cream (`#FCFBF7`) for clean, soft backgrounds.
  - Brand Dark (`#1E2229`) and Brand Slate (`#4A5568`) for crisp typography.
  - Brand Leaf (`#38A169` / `#2F855A`) for positive actions and highlights.
  - Brand Blue (`#2B6CB0` / `#1A365D`) for institutional structure.
  - Brand Warm Yellow / Orange (`#D69E2E` / `#DD6B20`) for energy and highlights.
- **Responsive Layouts Tested:**
  - `375px` (Mobile): Header collapses into a full-height mobile drawer; navigation buttons stack vertically; hero headline scales smoothly; table views switch to responsive card stacks in student and admin views; floating mobile CTA button appears when scrolling.
  - `768px` (Tablet): Two-column metric grids; responsive modal sizing; drawer panels slide in from right.
  - `1024px` (Laptop): Sidebar navigation fixed in admin and student portals; comprehensive data tables with horizontal scroll guards.
  - `1440px` (Desktop): Maximum container widths (`max-w-7xl`), spacious metric distributions, zero horizontal clipping.
- **Interactive Feedback:** Loading skeletons, disabled button states with loading spinners (`Loader2`), inline alert banners for validation errors, and confirmation modals for destructive operations.

---

## 15. Accessibility Audit

- **Modal Dialogs:** `Modal.tsx` implements accessible dialog semantics (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `aria-describedby`), focus trapping on `Tab`, and focus restoration to the trigger element on close.
- **Keyboard Navigation:** Forms support keyboard navigation; Escape key dismisses modals and drawers; accordion headers use `<button>` elements with keyboard enter/space toggling.
- **Color Contrast:** Text tokens (`#1E2229`, `#1A365D`, `#2F855A`) meet WCAG 2.1 AA standards for normal text (minimum 4.5:1 ratio) against `#FCFBF7` and `#FFFFFF`.
- **Form Controls:** Public signup wizard uses explicit `<label>` bindings, required indicators, and distinct error messages connected to form inputs.

---

## 16. Security Findings

| Category | Finding | Classification | Remediation / Note |
| :--- | :--- | :--- | :--- |
| **Authentication** | Password hashed with Bcrypt (cost 12) | 🟢 Secure | Strong salt rounds; timing attack protection |
| **Session Fixation** | Server regenerates session on login | 🟢 Secure | `connect-pg-simple` invalidates old sessions |
| **ID Spoofing** | Student ID derived exclusively from session | 🟢 Secure | Verified: `?studentId=` query spoofing strictly ignored |
| **Authorization** | Triple-layer check (`requireAuth`, `requireRole`, `requireActive`) | 🟢 Secure | Verified on all sensitive administrative and student endpoints |
| **Rate Limiting** | Express rate limiters on `/signin` (10/15m) and `/applications` (10/1h) | 🟢 Secure | Protects against automated credential stuffing and signup spam |
| **SQL Injection** | Parameterized queries (`$1, $2, ...`) throughout entire DB layer | 🟢 Secure | Zero raw string concatenations in SQL statements |
| **CORS Policy** | Origin restricted to client domain with credentials support | 🟢 Secure | Explicit origins allowed; wildcards disabled with credentials |
| **Secret Storage** | `.env` file present in `.gitignore` | 🟢 Secure | `.env.example` provides placeholders without exposing secrets |
| **Seed Program State** | `db:seed` does not overwrite `is_active` on conflict | 🟡 Operational Risk | If Abacus is deactivated via Admin UI, re-running `npm run db:seed` does not restore `is_active: true`. |
| **Contact Form** | Client-side simulation without backend persistence | 🟠 Incomplete | Inquiries are validated in UI but not stored in database. |

---

## 17. Build & Test Results

### Automated Test Suite Runs

1. **Frontend TypeScript & Vite Build:**
   ```bash
   npm run build
   ```
   - **Result:** `PASS` (Built in 8.64s; zero TypeScript errors).
   - **Output:** `dist/index.html` (1.22 kB), `dist/assets/index.js` (504 kB), `dist/assets/index.css` (61.5 kB).

2. **Backend TypeScript Build:**
   ```bash
   npm run build (in ./backend)
   ```
   - **Result:** `PASS` (TypeScript `tsc` exited with code 0; zero errors).

3. **Database Migration Check:**
   ```bash
   npm run db:migrate (in ./backend)
   ```
   - **Result:** `PASS` (Schema up to date with `001_initial_schema.sql`).

4. **Lifecycle End-to-End Suite (`test-lifecycle.ts`):**
   ```bash
   npm run test:lifecycle (in ./backend)
   ```
   - **Result:** `PASS` (100% passing across 8 integration phases).
   - **Verified:** Public signup, duplicate rejection, pending login block, admin review, rejection invariants, transactional activation, student login, session termination.

5. **Student Foundation Suite (`test-student-foundation.ts`):**
   ```bash
   npm run test:student-foundation (in ./backend)
   ```
   - **Result:** `PASS` (100% passing).
   - **Verified:** Unauthenticated 401, role isolation 403, 8 foundation endpoints returning 200 OK, student ID query spoofing protection, 501 on profile mutation.

6. **Student Composite Dashboard Suite (`test-student-dashboard.ts`):**
   ```bash
   npm run test:student-dashboard (in ./backend)
   ```
   - **Result:** `PASS` (10/10 passing).
   - **Verified:** Unauthenticated 401, admin/teacher rejection 403, field security (zero password hashes or internal secrets leaked), attendance rate null when sessions=0, live attendance calculations (100%), multi-tenant isolation (confidential notes isolated).

7. **Comprehensive Student Verification Suite (`verify-2b1-comprehensive.ts`):**
   ```bash
   npx tsx src/scripts/verify-2b1-comprehensive.ts (in ./backend)
   ```
   - **Result:** `PASS` (Parts A-F 100% passing).
   - **Verified:** All 9 endpoints reject unauthenticated access; strict role denial for admin/teacher; active student session access; account status recheck on live DB; ghost student account rejection.

8. **Admin Platform Completion Suite (`test-admin-completion.ts`):**
   ```bash
   npx tsx src/scripts/test-admin-completion.ts (in ./backend)
   ```
   - **Result:** `PASS` (100% passing across sections A-F).
   - **Verified:** Program CRUD, batch capacity enforcement, teacher assignment, student status state machine (suspend, reactivate, graduate, withdraw), batch transfer with history preservation, and all 11 audit action codes.

---

## 18. Environment & Deployment Findings

| Variable | Purpose | Required | Where Used | Development Value | Production Value |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `PORT` | API Server Port | No (defaults 5000) | `backend/src/index.ts` | `5000` | Port assigned by host (e.g. `8080`) |
| `NODE_ENV` | Runtime environment | No (defaults dev) | `app.ts`, cookie settings | `development` | `production` |
| `DATABASE_URL` | PostgreSQL connection URI | Yes | `backend/src/db/index.ts` | `postgresql://postgres:password@localhost:5432/evolve_education_dev` | Production PostgreSQL connection string |
| `SESSION_SECRET` | Secret key for signing session cookie | Yes | `backend/src/app.ts` | Secure random string | High-entropy random 64-char secret |
| `SESSION_NAME` | Name of session cookie | No (defaults evolve_sid)| `backend/src/app.ts` | `evolve_sid` | `evolve_sid` |
| `CLIENT_ORIGIN` | Allowed CORS origin | Yes | `backend/src/app.ts` | `http://localhost:5173` | `https://yourdomain.com` |
| `COOKIE_DOMAIN` | Domain for sharing cookie across subdomains | Production | `backend/src/app.ts` | Omitted / undefined | `.yourdomain.com` (enables cross-subdomain admin session) |
| `ADMIN_EMAIL` | Default admin bootstrap email | Yes (for bootstrap) | `bootstrap-admin.ts` | `admin@evolve.edu` | Institutional administrator email |
| `ADMIN_PASSWORD`| Default admin bootstrap password | Yes (for bootstrap) | `bootstrap-admin.ts` | Secure test password | Strong temporary master password |

---

## 19. Feature Status Classification

### 🟢 Verified Working (Production Ready)
1. **Public Marketing Homepage:** All 8 sections, navigation, hero, curriculum highlights, FAQ accordion, footer, mobile CTA, and responsive design.
2. **About Modal:** Accessible dialog, scroll lock, focus management.
3. **Public Admission Application:** 4-step wizard with Zod validation, error banners, and database insertion.
4. **User Authentication & Session Management:** Server-side sessions in PostgreSQL, Bcrypt password hashing, rate limiting, and logout.
5. **Cross-Hostname SSO Navigation:** Short-lived ticket handoff between `localhost` and `admin.localhost`.
6. **Admin Dashboard:** Real-time metrics aggregation, recent applications, and audit logs.
7. **Admin Admissions Management:** Application search, status filtering, detail drawer, rejection with reason, and transactional approval with capacity locks.
8. **Admin Student Ledger:** Student listing, detail drawer, enrollment history, status transitions (suspend, reactivate, graduate, withdraw), and batch transfers.
9. **Admin Teacher Management:** Faculty listing, teacher creation, account generation, and detail updates.
10. **Admin Program Management:** Curriculum catalog, program creation, description updates, and active toggling.
11. **Admin Batch Management:** Cohort listing, capacity limit controls, and teacher assignment.
12. **Admin Audit Logs:** Filterable, paginated audit records with JSON detail inspection.
13. **Student Dashboard:** Live composite payload with enrollment, batch, teacher, calculated attendance percentage, exam results, and teacher feedback notes.
14. **Role Authorization & Access Control:** Strict server-side verification blocking unauthorized cross-role access.

### 🟠 Partially Implemented
1. **Contact Enquiry Form:** Validates user inputs and displays success state in UI, but simulates submission client-side using `setTimeout` without persisting to a backend database table.

### ⚪ Placeholder / Scaffolding
1. **Student My Program Page (`/portal/student/program`):** Displays `StudentPlaceholderPage` (Stage 2B.3).
2. **Student Attendance Page (`/portal/student/attendance`):** Displays `StudentPlaceholderPage` (Stage 2B.4).
3. **Student Assessments Page (`/portal/student/assessments`):** Displays `StudentPlaceholderPage` (Stage 2B.5).
4. **Student Progress Page (`/portal/student/progress`):** Displays `StudentPlaceholderPage` (Stage 2B.6).
5. **Student Feedback Page (`/portal/student/feedback`):** Displays `StudentPlaceholderPage` (Stage 2B.7).
6. **Student Profile Page (`/portal/student/profile`):** Displays `StudentPlaceholderPage` (Stage 2B.8); backend returns 501.
7. **Student Documents Page (`/portal/student/documents`):** Displays `StudentPlaceholderPage` (Stage 2B.9).
8. **Teacher Portal (`/portal/teacher/*`):** Reserved via `RouteBoundary`.
9. **Public Program Directory & Details (`/programs`, `/programs/:id`):** Reserved via `RouteBoundary`.
10. **Dedicated Contact Page (`/contact`):** Reserved via `RouteBoundary`.

### 🔴 Broken / Minor Bugs
1. **Database Seed Conflict Handling on Programs:** `backend/src/db/seed.ts` does not update `is_active` in its `ON CONFLICT (slug) DO UPDATE` clause. If a program is deactivated via the Admin UI, running `npm run db:seed` will not reactivate it unless updated in SQL.

---

## 20. Master Feature Matrix

| Feature | Location | Expected Behavior | Test Performed | Result | Status | How Developer Can Re-test |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Landing Navigation** | `src/components/Header.tsx` | Smooth scroll to anchors | Clicked nav links on `/` | Scrolled correctly | 🟢 VERIFIED | Open `http://localhost:5173/`, click "About", "Programs", "Why Us" |
| **About Modal** | `src/components/AboutModal.tsx` | Opens overlay, locks scroll, Escape closes | Triggered from Header and Footer | Rendered and closed via ESC | 🟢 VERIFIED | Click "About" in Header, press Escape key |
| **FAQ Accordion** | `src/components/FAQ.tsx` | Toggle questions, single-open state | Clicked FAQ items | Expands clicked, closes others | 🟢 VERIFIED | Click question 1, then question 2 on `/` |
| **Contact Validation** | `src/components/ContactEnquiry.tsx` | Flags missing name, email, phone | Submitted empty form | Displayed inline errors | 🟢 VERIFIED | Scroll to Contact on `/`, click "Send Enquiry" empty |
| **Public Admission Form** | `src/pages/auth/SignUpPage.tsx` | 4-step wizard, creates application in DB | Submitted complete applicant form | Returned 201, application created | 🟢 VERIFIED | Run `npm run test:lifecycle` or submit `/auth/signup` |
| **Student Sign-In** | `src/pages/auth/SignInPage.tsx` | Verifies credentials, stores session | Signed in with test applicant | Authenticated with active session | 🟢 VERIFIED | Sign in at `http://localhost:5173/auth/signin` |
| **Admin Sign-In** | `src/pages/admin/AdminSignInPage.tsx` | Validates admin role, loads dashboard | Signed in with `admin@evolve.edu` | Loaded admin dashboard | 🟢 VERIFIED | Open `http://admin.localhost:5173/signin` and sign in |
| **Admin Candidate Rejection** | `src/pages/admin/ApplicationsPage.tsx`| Sets application & user to rejected | Submitted rejection with reason | Status=rejected, 0 students | 🟢 VERIFIED | Reject candidate in Admin Applications |
| **Admin Candidate Approval** | `src/pages/admin/ApplicationsPage.tsx`| Transactional activation with batch capacity | Approved candidate with batch & teacher | Created student & active enrollment | 🟢 VERIFIED | Approve candidate in Admin Applications |
| **Admin Student Transfer** | `src/pages/admin/StudentsPage.tsx` | Transfers batch, marks old transferred | Transferred student to new batch | Old=transferred, New=active | 🟢 VERIFIED | Open student drawer, click Transfer Cohort |
| **Admin Student Status** | `src/pages/admin/StudentsPage.tsx` | State transitions (suspend/withdraw) | Changed status to suspended | Account & student suspended | 🟢 VERIFIED | Open student drawer, click Update Status |
| **Admin Batch Capacity** | `src/pages/admin/BatchesPage.tsx` | Prevents overbooking and capacity cuts | Attempted enrollment past capacity | Returned 400 capacity exceeded | 🟢 VERIFIED | Run `npx tsx src/scripts/test-admin-completion.ts` |
| **Student Dashboard** | `src/pages/student/DashboardPage.tsx` | Displays composite academic summary | Fetched `/api/student/dashboard` | Returned 200 OK with live data | 🟢 VERIFIED | Log in as active student, view `/portal/student/dashboard` |
| **Student Sub-pages** | `src/pages/student/*Page.tsx` | Scaffolded placeholder with upcoming info | Navigated to all 7 sub-routes | Rendered `StudentPlaceholderPage` | ⚪ PLACEHOLDER | Click "Attendance", "Assessments", etc. in student sidebar |

---

## 21. Manual Testing Guide

Follow this step-by-step testing guide to verify every major subsystem manually.

### Prerequisites & Starting Services

1. **Start PostgreSQL:**
   Ensure PostgreSQL is running locally on port 5432 and database `evolve_education_dev` exists.
   ```bash
   # From root directory:
   cd backend
   npm run db:migrate
   npm run db:seed
   npm run admin:bootstrap
   ```

2. **Start Backend API:**
   ```bash
   cd backend
   npm run dev
   # Server starts on http://localhost:5000
   ```

3. **Start Frontend Client:**
   ```bash
   # In a separate terminal from root directory:
   npm run dev
   # Vite development server starts on http://localhost:5173
   ```

4. **Hosts File Setup for Admin Subdomain:**
   To test the Admin portal on `admin.localhost`, ensure your `hosts` file contains:
   ```
   127.0.0.1 admin.localhost
   ```
   *(Note: Most modern browsers automatically resolve `*.localhost` to `127.0.0.1` without modifying the hosts file).*

---

### Step-by-Step Test Scenarios

#### Scenario 1: Public Website & About Modal
1. Open `http://localhost:5173/` in your browser.
2. Verify that the Hero headline, tagline, and navigation bar render correctly.
3. Click **"About"** in the top navigation bar.
4. **Expected Result:** The `AboutModal` opens with an overlay, and the background page scroll is locked.
5. Press the **Escape** key on your keyboard.
6. **Expected Result:** The modal closes smoothly and focus returns to the page.
7. Scroll down to the **FAQ** section. Click on the first question to expand it. Then click the second question.
8. **Expected Result:** The second question expands and the first question collapses.

#### Scenario 2: Public Admission Application (Student Signup)
1. Navigate to `http://localhost:5173/auth/signup`.
2. **Step 1 (Student Details):** Enter Student Name (`"Julian Test"`), Date of Birth (`"2016-04-12"`), and select Gender. Click **"Next Step"**.
3. **Step 2 (Guardian Details):** Enter Guardian Name (`"Maria Test"`), Phone (`"+1 555-019-4829"`), Guardian Email (`"maria.test@example.com"`). Click **"Next Step"**.
4. **Step 3 (Program Preferences):** Select Program (`Abacus`), Preferred Schedule, and Level. Click **"Next Step"**.
5. **Step 4 (Account Setup):** Enter Account Email (`"julian.student@example.com"`), Password (`"Password123!"`), confirm password, and check the admission agreement checkbox. Click **"Submit Admission Application"**.
6. **Expected Result:** The submission succeeds, displaying the success card with an Application ID and confirmation timestamp.

#### Scenario 3: Pending Applicant Login Attempt
1. Navigate to `http://localhost:5173/auth/signin`.
2. Sign in with the credentials just created:
   - Email: `julian.student@example.com`
   - Password: `Password123!`
3. **Expected Result:** The login succeeds, but the system recognizes the account status is `pending`. A status banner appears explaining that the application is under review by admissions and the student portal cannot be accessed yet.

#### Scenario 4: Admin Candidate Review & Transactional Activation
1. Open `http://admin.localhost:5173/signin` in your browser.
2. Sign in with default admin credentials:
   - Email: `admin@evolve.edu`
   - Password: `EvolveAdmin2026!Secure` (or value in `backend/.env`)
3. **Expected Result:** The Admin Dashboard loads, displaying real-time metrics and recent applications.
4. Click **"Applications"** in the sidebar (`/admissions/applications`).
5. Locate the pending application for `"Julian Test"`. Click **"Review"** to open the candidate review drawer.
6. Click the green **"Approve & Activate"** button.
7. In the approval modal:
   - Select Program: `Abacus`
   - Select Cohort Batch: `Abacus Level 1 - Weekday (Mon/Wed)`
   - Select Faculty Teacher: `Sarah Jenkins`
   - Confirm Start Date.
8. Click **"Confirm Enrollment & Activate Student"**.
9. **Expected Result:** The application status immediately changes to `Approved`. An audit log entry is recorded, and a new record appears in the Students ledger.

#### Scenario 5: Active Student Portal Access
1. Return to the public site sign-in: `http://localhost:5173/auth/signin`.
2. Log in with `julian.student@example.com` and `Password123!`.
3. **Expected Result:** The browser redirects immediately to `/portal/student/dashboard`.
4. **Verify Composite Dashboard:**
   - Displays student name `"Julian"` in the welcome banner.
   - Active Enrollment card displays `"Abacus"`, cohort `"Abacus Level 1 - Weekday (Mon/Wed)"`, and teacher `"Sarah Jenkins"`.
   - Attendance metric card displays attendance overview.
   - Quick links navigate to the placeholder sub-pages.
5. Click **"Attendance"** in the sidebar (`/portal/student/attendance`).
6. **Expected Result:** Renders the `StudentPlaceholderPage` explaining that full session ledger functionality is scheduled for Phase 2B.4.
7. Click the **"Sign Out"** button in the student sidebar.
8. **Expected Result:** The session is destroyed in PostgreSQL, the cookie is cleared, and you are redirected to `/auth/signin`.

#### Scenario 6: Admin Student Management & Cohort Transfer
1. Return to `http://admin.localhost:5173/people/students`.
2. Locate `"Julian Test"` in the active student list. Click **"View Record"**.
3. Inspect the **Enrollment History** ledger to verify the active enrollment in `Abacus Level 1 - Weekday (Mon/Wed)`.
4. Click **"Transfer Cohort"**.
5. Select a new target batch (e.g. `Abacus Level 1 - Weekend (Sat/Sun)`), assign a teacher, enter reason (`"Schedule adjustment request"`), and click **"Execute Cohort Transfer"**.
6. **Expected Result:** The previous enrollment is updated to status `transferred`, a new active enrollment is created, and the action is recorded in `audit_logs`.

---

## 22. End-to-End Test Scenarios Matrix

| Scenario ID | Test Name | Target Layer | Automated Script | Manual Verification | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TEST-001** | Public Landing Page Rendering | Frontend | Vite build | View `http://localhost:5173/` | 🟢 PASS |
| **TEST-002** | About Modal Interaction | Frontend | Vite build | Click About in Header, test ESC key | 🟢 PASS |
| **TEST-003** | Public Application Submission | Full Stack | `test-lifecycle.ts` | Complete `/auth/signup` form | 🟢 PASS |
| **TEST-004** | Duplicate Email Rejection | Backend API | `test-lifecycle.ts` | Submit duplicate email to `/api/applications` | 🟢 PASS |
| **TEST-005** | Pending Applicant Login Guard | Full Stack | `test-lifecycle.ts` | Log in with pending user | 🟢 PASS |
| **TEST-006** | Admin Dashboard Aggregation | Full Stack | `test-admin-completion.ts` | View `admin.*/dashboard` | 🟢 PASS |
| **TEST-007** | Application Rejection Invariant | Full Stack | `test-lifecycle.ts` | Reject application; verify 0 students | 🟢 PASS |
| **TEST-008** | Transactional Approval & Activation | Full Stack | `test-lifecycle.ts` | Approve candidate with cohort & teacher | 🟢 PASS |
| **TEST-009** | Batch Capacity & Overbooking Guard | Full Stack | `test-admin-completion.ts` | Enroll student past max batch capacity | 🟢 PASS |
| **TEST-010** | Student Cohort Transfer | Full Stack | `test-admin-completion.ts` | Transfer student to new cohort | 🟢 PASS |
| **TEST-011** | Student Lifecycle State Transitions | Full Stack | `test-admin-completion.ts` | Suspend, reactivate, graduate, withdraw | 🟢 PASS |
| **TEST-012** | Faculty Directory & CRUD | Full Stack | `test-admin-completion.ts` | Create and update teacher records | 🟢 PASS |
| **TEST-013** | Curriculum Program Catalog CRUD | Full Stack | `test-admin-completion.ts` | Create and update program records | 🟢 PASS |
| **TEST-014** | Audit Trail Recording | Full Stack | `test-admin-completion.ts` | Inspect all 11 action codes in audit logs | 🟢 PASS |
| **TEST-015** | Student Composite Dashboard | Full Stack | `test-student-dashboard.ts` | View live payload on student dashboard | 🟢 PASS |
| **TEST-016** | Student Identity Spoofing Guard | Backend API | `verify-2b1-comprehensive.ts` | Call `/api/student/*?studentId=spoofed` | 🟢 PASS |
| **TEST-017** | Cross-Role Authorization Isolation | Full Stack | `verify-2b1-comprehensive.ts` | Cross-call endpoints with wrong role | 🟢 PASS |
| **TEST-018** | Session Invalidation on Sign Out | Full Stack | `verify-2b1-comprehensive.ts` | Sign out and reuse stale cookie | 🟢 PASS |

---

## 23. Test Data Requirements

### Default Seeded Accounts

```
1. Institutional Administrator
   Email:    admin@evolve.edu
   Password: EvolveAdmin2026!Secure (or value in backend/.env)
   Role:     admin
   Status:   active

2. Default Faculty Instructor
   Email:    teacher.sarah@evolve.edu
   Password: TeacherEvolve2026!
   Role:     teacher
   Status:   active

3. Default Active Curriculum Program
   Name:     Abacus
   Slug:     abacus
   Status:   active

4. Default Seeded Batches
   Batch A:  Abacus Level 1 - Weekday (Mon/Wed)  [Capacity: 12]
   Batch B:  Abacus Level 1 - Weekend (Sat/Sun)  [Capacity: 10]
```

### Re-seeding Development Data
If the database needs to be reset to a pristine baseline:
```bash
cd backend
npm run db:migrate
npm run db:seed
npm run admin:bootstrap
```

---

## 24. Prioritized Next Development Tasks

Based on the audit findings, here is the prioritized roadmap for subsequent development phases:

### [P0] Critical / Reliability Fixes
- **Fix Program Seed Invariant in `seed.ts`:**
  - *Reason:* If a program is deactivated via Admin UI, running `npm run db:seed` does not reactivate it due to missing `is_active = EXCLUDED.is_active` in `ON CONFLICT (slug) DO UPDATE`.
  - *Affected Files:* `backend/src/db/seed.ts`
  - *Dependencies:* None.
  - *Verification:* Deactivate Abacus, run `npm run db:seed`, verify `is_active == true` in database.

### [P1] Required for Complete Existing Workflows
- **Persist Contact & General Enquiry Submissions:**
  - *Reason:* The public Contact form currently simulates submission via `setTimeout` without persisting inquiries to the database.
  - *Affected Files:* `backend/src/db/migrations/002_contact_inquiries.sql`, `backend/src/routes/inquiries.ts`, `src/components/ContactEnquiry.tsx`
  - *Dependencies:* PostgreSQL migration.
  - *Verification:* Submit form on `/`, verify row in `contact_inquiries` table and notification in admin dashboard.

### [P2] Phase 2B Scheduled Functionality (Student Portal Sub-pages)
- **Implement Student Sub-pages (Phase 2B.3 to 2B.9):**
  - *Phase 2B.3:* Student Program & Syllabus view (`/portal/student/program`).
  - *Phase 2B.4:* Student Attendance session history & excuse submission (`/portal/student/attendance`).
  - *Phase 2B.5:* Student Assessment results & examination score ledger (`/portal/student/assessments`).
  - *Phase 2B.6:* Student Academic progress & learning curve tracker (`/portal/student/progress`).
  - *Phase 2B.7:* Student Faculty feedback & notes history (`/portal/student/feedback`).
  - *Phase 2B.8:* Student Profile viewing and editable guardian contact information (`/portal/student/profile`).
  - *Phase 2B.9:* Student Document download center for certificates and learning kits (`/portal/student/documents`).
  - *Affected Files:* `backend/src/routes/student.ts`, `src/pages/student/*Page.tsx`.

### [P3] Polish & Performance Optimization
- **Vite Bundle Code-Splitting:**
  - *Reason:* The production bundle outputs a single main chunk (`index.js` at 504 kB). Code-splitting routes with `React.lazy()` and `import()` will optimize initial page load performance.
  - *Affected Files:* `vite.config.ts`, `src/routes/AppRoutes.tsx`.

---

## 25. Final Project Status

The Evolve Education codebase is in **excellent structural and architectural condition**. The multi-tier separation between the public landing site, institutional admin portal, and authenticated student portal is cleanly established. The backend enforces robust data integrity constraints, atomic multi-table transactions, concurrency locking, and server-side role validation.

All existing automated test suites compile cleanly and pass with 100% success when the database is seeded. The platform provides a solid foundation for completing the remaining Phase 2B student portal sub-pages and subsequent teacher portal phases.
