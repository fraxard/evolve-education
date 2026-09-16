import assert from 'assert';
import app from '../app.js';
import { pool, query } from '../db/index.js';
import dotenv from 'dotenv';
import http from 'http';

dotenv.config();

// Helper to make HTTP requests with cookie retention
class SessionClient {
  private cookies: string[] = [];
  private server: http.Server;
  private port: number;

  constructor(server: http.Server, port: number) {
    this.server = server;
    this.port = port;
  }

  async request(path: string, options: { method?: string; body?: any; headers?: Record<string, string> } = {}) {
    const url = `http://127.0.0.1:${this.port}${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.cookies.length > 0) {
      headers['Cookie'] = this.cookies.join('; ');
    }

    const response = await fetch(url, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      // Split cookies if multiple, or extract value before semicolon
      const rawCookies = setCookie.split(', ');
      for (const rc of rawCookies) {
        const cookieVal = rc.split(';')[0];
        if (cookieVal) {
          this.cookies = this.cookies.filter((c) => !c.startsWith(cookieVal.split('=')[0] + '='));
          this.cookies.push(cookieVal);
        }
      }
    }

    let json: any = null;
    const text = await response.text();
    try {
      json = JSON.parse(text);
    } catch {
      json = text;
    }

    return { status: response.status, data: json };
  }
}

async function runLifecycleTest() {
  console.log('=============================================');
  console.log('[Test] Starting End-to-End Lifecycle Test...');
  console.log('=============================================');

  // Start test server on dynamic port
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as any;
  const port = address.port;
  console.log(`[Test] Test server listening on port ${port}`);

  try {
    // 1. Clean previous test users if any
    const testApplicantEmail = 'applicant.test@example.com';
    const testApplicant2Email = 'applicant.reject.test@example.com';
    await query(
      `DELETE FROM enrollments WHERE student_id IN (
        SELECT id FROM students WHERE user_id IN (
          SELECT id FROM users WHERE email IN ($1, $2)
        )
      )`,
      [testApplicantEmail, testApplicant2Email]
    );
    await query('DELETE FROM users WHERE email IN ($1, $2)', [testApplicantEmail, testApplicant2Email]);

    // Query seeded program, batch, teacher
    const programRes = await query("SELECT id, name FROM programs WHERE slug = 'abacus'");
    assert(programRes.rows.length > 0, 'Seed program Abacus must exist');
    const programId = programRes.rows[0].id;

    const batchRes = await query('SELECT id, name, capacity FROM batches WHERE program_id = $1 LIMIT 1', [programId]);
    assert(batchRes.rows.length > 0, 'Seed batch must exist');
    const batchId = batchRes.rows[0].id;

    const teacherRes = await query("SELECT id, full_name FROM teachers WHERE status = 'active' LIMIT 1");
    assert(teacherRes.rows.length > 0, 'Seed teacher must exist');
    const teacherId = teacherRes.rows[0].id;

    // STEP 1: Applicant submits public application
    console.log('[Test] 1. Submitting public application...');
    const publicClient = new SessionClient(server, port);
    const submitRes = await publicClient.request('/api/applications', {
      method: 'POST',
      body: {
        studentName: 'Leo Test Student',
        dateOfBirth: '2015-06-15',
        guardianName: 'Robert Test',
        guardianRelationship: 'Father',
        guardianPhone: '+1 555-019-2834',
        guardianEmail: 'robert.test@example.com',
        email: testApplicantEmail,
        password: 'Password123!',
        requestedProgramId: programId,
        preferredSchedule: 'Mon/Wed Afternoon',
      },
    });

    assert.strictEqual(submitRes.status, 201, 'Application submission should return 201');
    const applicationId = submitRes.data.applicationId;
    assert(applicationId, 'Must return applicationId');
    console.log(`[Test] ✓ Application created (ID: ${applicationId})`);

    // Verify DB state
    const userCheck = await query('SELECT id, role, account_status FROM users WHERE email = $1', [testApplicantEmail]);
    assert.strictEqual(userCheck.rows[0].role, 'student', 'User role must be student');
    assert.strictEqual(userCheck.rows[0].account_status, 'pending', 'User account_status must be pending');
    const userId = userCheck.rows[0].id;

    // STEP 2: Duplicate check
    console.log('[Test] 2. Testing duplicate email rejection...');
    const dupRes = await publicClient.request('/api/applications', {
      method: 'POST',
      body: {
        studentName: 'Duplicate Test',
        dateOfBirth: '2015-06-15',
        guardianName: 'Robert Test',
        guardianRelationship: 'Father',
        guardianPhone: '+1 555-019-2834',
        guardianEmail: 'robert.test@example.com',
        email: testApplicantEmail,
        password: 'Password123!',
      },
    });
    assert.strictEqual(dupRes.status, 409, 'Duplicate application must return 409 Conflict');
    console.log('[Test] ✓ Duplicate submission rejected with 409');

    // STEP 3: Applicant signs in while pending
    console.log('[Test] 3. Testing sign in for pending applicant...');
    const applicantClient = new SessionClient(server, port);
    const applicantLoginRes = await applicantClient.request('/api/auth/signin', {
      method: 'POST',
      body: { email: testApplicantEmail, password: 'Password123!' },
    });
    assert.strictEqual(applicantLoginRes.status, 200, 'Login should succeed and report pending state');
    assert.strictEqual(applicantLoginRes.data.user.account_status, 'pending', 'Status must be pending');

    // Pending applicant attempting to access admin API must be rejected
    const adminCheckRes = await applicantClient.request('/api/admin/dashboard');
    assert.strictEqual(adminCheckRes.status, 403, 'Pending student must not access admin API (403)');
    console.log('[Test] ✓ Pending applicant authenticated with pending status; admin access forbidden');

    // STEP 4: Admin logs in
    console.log('[Test] 4. Admin authentication and review...');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@evolve.edu';
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminSecure2026!';
    const adminClient = new SessionClient(server, port);

    const adminLoginRes = await adminClient.request('/api/auth/signin', {
      method: 'POST',
      body: { email: adminEmail, password: adminPassword },
    });
    assert.strictEqual(adminLoginRes.status, 200, 'Admin login must succeed');
    assert.strictEqual(adminLoginRes.data.user.role, 'admin', 'Role must be admin');
    console.log('[Test] ✓ Admin logged in successfully');

    // Admin checks dashboard
    const dashboardRes = await adminClient.request('/api/admin/dashboard');
    assert.strictEqual(dashboardRes.status, 200);
    assert(dashboardRes.data.metrics.pendingApplications >= 1, 'Dashboard pending count >= 1');
    console.log(`[Test] ✓ Admin dashboard metrics verified (Pending: ${dashboardRes.data.metrics.pendingApplications})`);

    // Admin checks application detail
    const detailRes = await adminClient.request(`/api/applications/${applicationId}`);
    assert.strictEqual(detailRes.status, 200);
    assert.strictEqual(detailRes.data.application.student_name, 'Leo Test Student');
    console.log('[Test] ✓ Admin retrieved application details');

    // STEP 5: Test rejection flow with second applicant
    console.log('[Test] 5. Testing rejection workflow...');
    const submit2Res = await publicClient.request('/api/applications', {
      method: 'POST',
      body: {
        studentName: 'Reject Me Student',
        dateOfBirth: '2016-01-01',
        guardianName: 'Jane Test',
        guardianRelationship: 'Mother',
        guardianPhone: '+1 555-019-9999',
        guardianEmail: 'jane.test@example.com',
        email: testApplicant2Email,
        password: 'Password123!',
      },
    });
    const app2Id = submit2Res.data.applicationId;

    const rejectRes = await adminClient.request(`/api/applications/${app2Id}/reject`, {
      method: 'POST',
      body: { reason: 'Student age outside current curriculum range' },
    });
    assert.strictEqual(rejectRes.status, 200, 'Rejection should return 200');

    // Verify rejection invariants: zero students, zero enrollments
    const app2Check = await query('SELECT status, rejection_reason FROM student_applications WHERE id = $1', [app2Id]);
    assert.strictEqual(app2Check.rows[0].status, 'rejected');
    const user2Check = await query('SELECT account_status FROM users WHERE email = $1', [testApplicant2Email]);
    assert.strictEqual(user2Check.rows[0].account_status, 'rejected');

    const student2Check = await query('SELECT id FROM students WHERE application_id = $1', [app2Id]);
    assert.strictEqual(student2Check.rows.length, 0, 'No student record must exist for rejected application');
    console.log('[Test] ✓ Rejection flow verified: status = rejected, zero students created');

    // STEP 6: Transactional Approval and Activation
    console.log('[Test] 6. Testing transactional approval and activation...');
    const activateRes = await adminClient.request(`/api/applications/${applicationId}/approve-and-activate`, {
      method: 'POST',
      body: {
        programId,
        batchId,
        teacherId,
        startDate: '2026-09-20',
      },
    });
    assert.strictEqual(activateRes.status, 200, 'Activation must return 200');
    console.log('[Test] ✓ Transactional activation response received');

    // Verify DB state after activation
    const activeAppRes = await query('SELECT status, reviewed_at FROM student_applications WHERE id = $1', [applicationId]);
    assert.strictEqual(activeAppRes.rows[0].status, 'approved');

    const activeUserRes = await query('SELECT account_status FROM users WHERE id = $1', [userId]);
    assert.strictEqual(activeUserRes.rows[0].account_status, 'active');

    const activeStudentRes = await query('SELECT id, status, full_name FROM students WHERE user_id = $1', [userId]);
    assert.strictEqual(activeStudentRes.rows.length, 1);
    assert.strictEqual(activeStudentRes.rows[0].status, 'active');
    const createdStudentId = activeStudentRes.rows[0].id;

    const activeEnrollmentRes = await query(
      'SELECT id, program_id, batch_id, teacher_id, status FROM enrollments WHERE student_id = $1',
      [createdStudentId]
    );
    assert.strictEqual(activeEnrollmentRes.rows.length, 1);
    assert.strictEqual(activeEnrollmentRes.rows[0].status, 'active');
    assert.strictEqual(activeEnrollmentRes.rows[0].program_id, programId);
    assert.strictEqual(activeEnrollmentRes.rows[0].batch_id, batchId);
    assert.strictEqual(activeEnrollmentRes.rows[0].teacher_id, teacherId);

    const auditRes = await query(
      "SELECT id FROM audit_logs WHERE action = 'STUDENT_ACTIVATED' AND target_id = $1",
      [createdStudentId]
    );
    assert(auditRes.rows.length > 0, 'Audit log must record student activation');
    console.log('[Test] ✓ Activation Invariant satisfied: Student active, Enrollment active, User active, Audit logged');

    // STEP 7: Activated student login
    console.log('[Test] 7. Testing sign in for activated student...');
    const studentLoginClient = new SessionClient(server, port);
    const sLoginRes = await studentLoginClient.request('/api/auth/signin', {
      method: 'POST',
      body: { email: testApplicantEmail, password: 'Password123!' },
    });
    assert.strictEqual(sLoginRes.status, 200);
    assert.strictEqual(sLoginRes.data.user.role, 'student');
    assert.strictEqual(sLoginRes.data.user.account_status, 'active');
    assert.strictEqual(sLoginRes.data.user.studentId, createdStudentId);

    // Verify /api/auth/me returns active student
    const meRes = await studentLoginClient.request('/api/auth/me');
    assert.strictEqual(meRes.data.user.studentId, createdStudentId);
    assert.strictEqual(meRes.data.user.account_status, 'active');
    console.log('[Test] ✓ Activated student logged in and verified via /api/auth/me');

    // STEP 8: Sign out
    console.log('[Test] 8. Testing session termination on signout...');
    const signoutRes = await studentLoginClient.request('/api/auth/signout', { method: 'POST' });
    assert.strictEqual(signoutRes.status, 200);
    const postSignoutMe = await studentLoginClient.request('/api/auth/me');
    assert.strictEqual(postSignoutMe.data.user, null, 'Session must be destroyed after signout');
    console.log('[Test] ✓ Session successfully destroyed on signout');

    console.log('=============================================');
    console.log('[Test] ALL END-TO-END LIFECYCLE TESTS PASSED!');
    console.log('=============================================');
  } finally {
    server.close();
    await pool.end();
  }
}

runLifecycleTest()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('[Test] Lifecycle test failed:', err);
    process.exit(1);
  });
