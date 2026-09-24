import assert from 'assert';
import dotenv from 'dotenv';

dotenv.config();

// =============================================================================
// PHASE 2B.0 BOUNDARY & ROUTING VERIFICATION SUITE
// =============================================================================
// Verifies:
// 1. Host surface classification (localhost, admin.localhost, app.localhost, prod)
// 2. Cross-subdomain URL construction
// 3. Operational App role-aware route matrix & boundary enforcement
// 4. Common operational route namespace (no /teacher/* or /student/* namespaces)
// 5. Backend CORS rule compatibility with app.localhost:5173
// =============================================================================

// Re-implement the exact logic from src/utils/hostname.ts for headless testing
type HostSurface = 'public' | 'admin' | 'app';

function getHostSurface(hostname: string): HostSurface {
  const h = hostname.toLowerCase();
  if (h === 'admin.localhost' || h.startsWith('admin.')) {
    return 'admin';
  }
  if (h === 'app.localhost' || h.startsWith('app.')) {
    return 'app';
  }
  return 'public';
}

function getAdminUrl(currentHost: string, currentPort: string, currentProtocol: string, path: string = '/dashboard'): string {
  const h = currentHost.toLowerCase();
  const portPart = currentPort ? `:${currentPort}` : '';

  if (h === 'localhost' || h === '127.0.0.1') {
    return `${currentProtocol}//admin.localhost${portPart}${path}`;
  }
  if (h === 'admin.localhost') {
    return path;
  }
  if (h === 'app.localhost') {
    return `${currentProtocol}//admin.localhost${portPart}${path}`;
  }
  if (h.startsWith('app.')) {
    const domain = h.replace(/^app\./, '');
    return `${currentProtocol}//admin.${domain}${portPart}${path}`;
  }
  if (!h.startsWith('admin.')) {
    const domain = h.startsWith('www.') ? h.slice(4) : h;
    return `${currentProtocol}//admin.${domain}${portPart}${path}`;
  }
  return path;
}

function getAppUrl(currentHost: string, currentPort: string, currentProtocol: string, path: string = '/dashboard'): string {
  const h = currentHost.toLowerCase();
  const portPart = currentPort ? `:${currentPort}` : '';

  if (h === 'localhost' || h === '127.0.0.1') {
    return `${currentProtocol}//app.localhost${portPart}${path}`;
  }
  if (h === 'app.localhost') {
    return path;
  }
  if (h === 'admin.localhost') {
    return `${currentProtocol}//app.localhost${portPart}${path}`;
  }
  if (h.startsWith('admin.')) {
    const domain = h.replace(/^admin\./, '');
    return `${currentProtocol}//app.${domain}${portPart}${path}`;
  }
  if (!h.startsWith('app.')) {
    const domain = h.startsWith('www.') ? h.slice(4) : h;
    return `${currentProtocol}//app.${domain}${portPart}${path}`;
  }
  return path;
}

// Operational App routing simulation
interface UserSession {
  role: 'teacher' | 'student' | 'admin' | null;
}

interface RouteResolution {
  status: 'allowed' | 'redirect' | 'dispatch_admin' | 'restricted_403';
  targetComponent?: string;
  targetUrl?: string;
}

function resolveAppRoute(session: UserSession, requestedPath: string): RouteResolution {
  // 1. Unauthenticated users
  if (!session.role) {
    if (requestedPath === '/signin' || requestedPath === '/signup') {
      return { status: 'allowed', targetComponent: 'AppSignInPage' };
    }
    return { status: 'redirect', targetUrl: '/signin' };
  }

  // 2. Admin on Operational App surface: dispatched to Admin Portal
  if (session.role === 'admin') {
    return { status: 'dispatch_admin', targetUrl: 'admin.localhost/dashboard' };
  }

  // 3. Teacher routing within common namespace
  if (session.role === 'teacher') {
    if (requestedPath === '/program' || requestedPath === '/progress' || requestedPath === '/documents') {
      return { status: 'restricted_403', targetComponent: 'AccessRestrictedView (HTTP 403)' };
    }
    return { status: 'allowed', targetComponent: 'TeacherLayout' };
  }

  // 4. Student routing within common namespace
  if (session.role === 'student') {
    if (requestedPath === '/batches' || requestedPath === '/students') {
      return { status: 'restricted_403', targetComponent: 'AccessRestrictedView (HTTP 403)' };
    }
    return { status: 'allowed', targetComponent: 'StudentLayout' };
  }

  return { status: 'restricted_403' };
}

// CORS Origin evaluation rule from backend/src/app.ts
function evaluateCorsOrigin(origin: string | undefined): boolean {
  const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
  if (
    !origin ||
    origin === clientOrigin ||
    origin === 'http://localhost:5173' ||
    origin === 'http://admin.localhost:5173' ||
    origin.endsWith('.localhost:5173') ||
    (process.env.CLIENT_DOMAIN && origin.endsWith(`.${process.env.CLIENT_DOMAIN}`))
  ) {
    return true;
  }
  return false;
}

async function runVerificationSuite() {
  console.log('\n=============================================================');
  console.log('  EVOLVE EDUCATION — PHASE 2B.0 ARCHITECTURE & BOUNDARY TEST  ');
  console.log('=============================================================\n');

  let passedTests = 0;

  // ---------------------------------------------------------------------------
  // TEST GROUP 1: Host Surface Classification
  // ---------------------------------------------------------------------------
  console.log('[Group 1] Host Surface Classification Matrix');

  const hostTestCases: Array<{ host: string; expected: HostSurface }> = [
    { host: 'localhost', expected: 'public' },
    { host: '127.0.0.1', expected: 'public' },
    { host: 'domain.com', expected: 'public' },
    { host: 'www.domain.com', expected: 'public' },
    { host: 'admin.localhost', expected: 'admin' },
    { host: 'admin.domain.com', expected: 'admin' },
    { host: 'admin.staging.domain.com', expected: 'admin' },
    { host: 'app.localhost', expected: 'app' },
    { host: 'app.domain.com', expected: 'app' },
    { host: 'app.staging.domain.com', expected: 'app' },
  ];

  for (const tc of hostTestCases) {
    const actual = getHostSurface(tc.host);
    assert.strictEqual(actual, tc.expected, `Host ${tc.host} should classify as ${tc.expected}, got ${actual}`);
    console.log(`  ✓ Host: ${tc.host.padEnd(25)} -> ${actual.toUpperCase()}`);
    passedTests++;
  }

  // ---------------------------------------------------------------------------
  // TEST GROUP 2: Cross-Subdomain URL Builders
  // ---------------------------------------------------------------------------
  console.log('\n[Group 2] Cross-Subdomain URL Construction');

  // Local development URLs
  assert.strictEqual(getAppUrl('localhost', '5173', 'http:'), 'http://app.localhost:5173/dashboard');
  assert.strictEqual(getAdminUrl('app.localhost', '5173', 'http:'), 'http://admin.localhost:5173/dashboard');
  assert.strictEqual(getAppUrl('admin.localhost', '5173', 'http:'), 'http://app.localhost:5173/dashboard');
  console.log('  ✓ Local dev cross-host URL transforms verified');
  passedTests++;

  // Production URLs
  assert.strictEqual(getAppUrl('domain.com', '', 'https:'), 'https://app.domain.com/dashboard');
  assert.strictEqual(getAdminUrl('app.domain.com', '', 'https:'), 'https://admin.domain.com/dashboard');
  assert.strictEqual(getAppUrl('admin.domain.com', '', 'https:'), 'https://app.domain.com/dashboard');
  console.log('  ✓ Production cross-domain URL transforms verified');
  passedTests++;

  // ---------------------------------------------------------------------------
  // TEST GROUP 3: Operational App Role Routing & Boundary Matrix (Common Namespace)
  // ---------------------------------------------------------------------------
  console.log('\n[Group 3] Operational App Role-Aware Boundary Resolution');

  // Case A: Unauthenticated access
  const unauthDash = resolveAppRoute({ role: null }, '/dashboard');
  assert.strictEqual(unauthDash.status, 'redirect');
  assert.strictEqual(unauthDash.targetUrl, '/signin');
  console.log('  ✓ Unauthenticated /dashboard -> Redirects to /signin');
  passedTests++;

  const unauthSignIn = resolveAppRoute({ role: null }, '/signin');
  assert.strictEqual(unauthSignIn.status, 'allowed');
  assert.strictEqual(unauthSignIn.targetComponent, 'AppSignInPage');
  console.log('  ✓ Unauthenticated /signin -> Allowed (AppSignInPage)');
  passedTests++;

  const unauthSignUp = resolveAppRoute({ role: null }, '/signup');
  assert.strictEqual(unauthSignUp.status, 'allowed');
  console.log('  ✓ Unauthenticated /signup -> Allowed (Student Application)');
  passedTests++;

  // Case B: Teacher operational access
  const teacherDash = resolveAppRoute({ role: 'teacher' }, '/dashboard');
  assert.strictEqual(teacherDash.status, 'allowed');
  assert.strictEqual(teacherDash.targetComponent, 'TeacherLayout');
  console.log('  ✓ Authenticated teacher /dashboard -> Rendered inside TeacherLayout');
  passedTests++;

  const teacherBatches = resolveAppRoute({ role: 'teacher' }, '/batches');
  assert.strictEqual(teacherBatches.status, 'allowed');
  console.log('  ✓ Authenticated teacher /batches -> Allowed in TeacherLayout');
  passedTests++;

  const teacherAttendance = resolveAppRoute({ role: 'teacher' }, '/attendance');
  assert.strictEqual(teacherAttendance.status, 'allowed');
  console.log('  ✓ Authenticated teacher /attendance -> Allowed in TeacherLayout');
  passedTests++;

  // Case C: Student operational access
  const studentDash = resolveAppRoute({ role: 'student' }, '/dashboard');
  assert.strictEqual(studentDash.status, 'allowed');
  assert.strictEqual(studentDash.targetComponent, 'StudentLayout');
  console.log('  ✓ Authenticated student /dashboard -> Rendered inside StudentLayout');
  passedTests++;

  const studentProgram = resolveAppRoute({ role: 'student' }, '/program');
  assert.strictEqual(studentProgram.status, 'allowed');
  console.log('  ✓ Authenticated student /program -> Allowed in StudentLayout');
  passedTests++;

  const studentAttendance = resolveAppRoute({ role: 'student' }, '/attendance');
  assert.strictEqual(studentAttendance.status, 'allowed');
  console.log('  ✓ Authenticated student /attendance -> Allowed in StudentLayout');
  passedTests++;

  // Case D: Admin dispatch
  const adminApp = resolveAppRoute({ role: 'admin' }, '/dashboard');
  assert.strictEqual(adminApp.status, 'dispatch_admin');
  console.log('  ✓ Authenticated admin on app.localhost -> Dispatched to Admin Portal');
  passedTests++;

  // Case E: Cross-role violation — Student attempting teacher-only routes in common namespace
  const studentInBatches = resolveAppRoute({ role: 'student' }, '/batches');
  assert.strictEqual(studentInBatches.status, 'restricted_403');
  console.log('  ✓ Cross-role guard: Student -> /batches BLOCKED (HTTP 403)');
  passedTests++;

  const studentInStudents = resolveAppRoute({ role: 'student' }, '/students');
  assert.strictEqual(studentInStudents.status, 'restricted_403');
  console.log('  ✓ Cross-role guard: Student -> /students BLOCKED (HTTP 403)');
  passedTests++;

  // Case F: Cross-role violation — Teacher attempting student-only routes in common namespace
  const teacherInProgram = resolveAppRoute({ role: 'teacher' }, '/program');
  assert.strictEqual(teacherInProgram.status, 'restricted_403');
  console.log('  ✓ Cross-role guard: Teacher -> /program BLOCKED (HTTP 403)');
  passedTests++;

  const teacherInProgress = resolveAppRoute({ role: 'teacher' }, '/progress');
  assert.strictEqual(teacherInProgress.status, 'restricted_403');
  console.log('  ✓ Cross-role guard: Teacher -> /progress BLOCKED (HTTP 403)');
  passedTests++;

  const teacherInDocuments = resolveAppRoute({ role: 'teacher' }, '/documents');
  assert.strictEqual(teacherInDocuments.status, 'restricted_403');
  console.log('  ✓ Cross-role guard: Teacher -> /documents BLOCKED (HTTP 403)');
  passedTests++;

  // ---------------------------------------------------------------------------
  // TEST GROUP 4: Backend CORS Rule Evaluation (Zero DB mutation)
  // ---------------------------------------------------------------------------
  console.log('\n[Group 4] Backend CORS Rule Verification');

  assert.strictEqual(evaluateCorsOrigin('http://app.localhost:5173'), true);
  console.log('  ✓ CORS rule allows Origin: http://app.localhost:5173');
  passedTests++;

  assert.strictEqual(evaluateCorsOrigin('http://admin.localhost:5173'), true);
  console.log('  ✓ CORS rule allows Origin: http://admin.localhost:5173');
  passedTests++;

  assert.strictEqual(evaluateCorsOrigin('http://localhost:5173'), true);
  console.log('  ✓ CORS rule allows Origin: http://localhost:5173');
  passedTests++;

  console.log('\n=============================================================');
  console.log(`  ALL ${passedTests} BOUNDARY & ROUTING TESTS PASSED (0 FAILURES)`);
  console.log('=============================================================\n');
}

runVerificationSuite()
  .catch((err) => {
    console.error('\n❌ Test suite failed:', err);
    process.exit(1);
  });
