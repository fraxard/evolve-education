import assert from 'assert';
import app from '../app.js';
import { pool, query } from '../db/index.js';
import dotenv from 'dotenv';
import http from 'http';
import bcrypt from 'bcryptjs';

dotenv.config();

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

    return { status: response.status, data: json, headers: response.headers };
  }
}

async function runDashboardTests() {
  console.log('========================================================');
  console.log('PHASE 2B.2 STUDENT DASHBOARD AUTOMATED TEST SUITE');
  console.log('========================================================\n');

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;
  console.log(`[Setup] In-process test server listening on ephemeral port ${port}\n`);

  try {
    // -----------------------------------------------------------------
    // 1. Unauthenticated dashboard access
    // -----------------------------------------------------------------
    console.log('[Security 1] Testing unauthenticated GET /api/student/dashboard...');
    const unauthClient = new SessionClient(server, port);
    const unauthRes = await unauthClient.request('/api/student/dashboard');
    assert.strictEqual(unauthRes.status, 401, 'Unauthenticated access must be rejected with 401');
    assert.strictEqual(unauthRes.data.error, 'Authentication required. No active session.');
    console.log('✓ Unauthenticated request rejected with 401 Unauthorized');

    // -----------------------------------------------------------------
    // 2. Admin dashboard API access
    // -----------------------------------------------------------------
    console.log('[Security 2] Testing Admin accessing /api/student/dashboard...');
    const adminClient = new SessionClient(server, port);
    const adminLogin = await adminClient.request('/api/auth/signin', {
      method: 'POST',
      body: {
        email: 'admin@evolve.edu',
        password: process.env.ADMIN_PASSWORD || 'EvolveAdmin2026!Secure',
      },
    });
    assert.strictEqual(adminLogin.status, 200, 'Admin login failed');

    const adminRes = await adminClient.request('/api/student/dashboard');
    assert.strictEqual(adminRes.status, 403, 'Admin must be forbidden from student dashboard');
    assert.strictEqual(adminRes.data.error, 'Forbidden: Insufficient privileges for this action.');
    console.log('✓ Admin correctly rejected with 403 Forbidden');

    // -----------------------------------------------------------------
    // 3. Teacher dashboard API access
    // -----------------------------------------------------------------
    console.log('[Security 3] Testing Teacher accessing /api/student/dashboard...');
    const teacherEmail = 'teacher.dashboard.test@evolve.edu';
    const pwHash = await bcrypt.hash('Teacher123!', 10);
    const uRes = await query(
      `INSERT INTO users (email, password_hash, role, account_status)
       VALUES ($1, $2, 'teacher', 'active') RETURNING id`,
      [teacherEmail, pwHash]
    );
    const teacherUserId = uRes.rows[0].id;
    await query(
      `INSERT INTO teachers (user_id, full_name, qualification, specialization, status)
       VALUES ($1, 'Dashboard Test Teacher', 'Ph.D', 'Science', 'active')`,
      [teacherUserId]
    );

    const teacherClient = new SessionClient(server, port);
    await teacherClient.request('/api/auth/signin', {
      method: 'POST',
      body: { email: teacherEmail, password: 'Teacher123!' },
    });
    const teacherRes = await teacherClient.request('/api/student/dashboard');
    assert.strictEqual(teacherRes.status, 403, 'Teacher must be forbidden from student dashboard');
    console.log('✓ Teacher correctly rejected with 403 Forbidden');

    // Clean up test teacher
    await query('DELETE FROM teachers WHERE user_id = $1', [teacherUserId]);
    await query('DELETE FROM users WHERE id = $1', [teacherUserId]);

    // -----------------------------------------------------------------
    // 4. Active student access & Composite Payload Structure
    // -----------------------------------------------------------------
    console.log('[Security 4 & 10] Testing Active Student access & field security...');
    const studentEmail = 'applicant.test@example.com';
    const studentClient = new SessionClient(server, port);
    const studentLogin = await studentClient.request('/api/auth/signin', {
      method: 'POST',
      body: { email: studentEmail, password: 'Password123!' },
    });
    assert.strictEqual(studentLogin.status, 200, 'Student login failed');

    const dashRes = await studentClient.request('/api/student/dashboard');
    assert.strictEqual(dashRes.status, 200, 'Dashboard request should succeed with 200');

    const data = dashRes.data;
    console.log('✓ Active student dashboard returned 200 OK');

    // Verify field security: NO password_hash, session, or internal admin fields
    assert.strictEqual(data.student.password_hash, undefined, 'password_hash must never be exposed');
    assert.strictEqual(data.student.password, undefined, 'password must never be exposed');
    assert.strictEqual(data.session, undefined, 'session data must not be exposed');
    assert.strictEqual(data.adminNotes, undefined, 'admin fields must not be exposed');
    console.log('✓ Confirmed zero password, session, or internal security fields in response');

    // Verify exact required composite keys
    assert(data.student, 'student object must exist');
    assert(data.student.id, 'student.id must exist');
    assert.strictEqual(typeof data.student.fullName, 'string', 'student.fullName must be string');
    assert.strictEqual(data.student.accountStatus, 'active', 'student.accountStatus must be active');

    assert(data.enrollment, 'enrollment object must exist for enrolled student');
    assert(data.program, 'program object must exist for enrolled student');
    assert(data.batch, 'batch object must exist for enrolled student');
    assert(data.teacher, 'teacher object must exist for enrolled student');

    assert(data.attendanceSummary, 'attendanceSummary must exist');
    assert.strictEqual(typeof data.attendanceSummary.totalSessions, 'number');
    assert.strictEqual(typeof data.attendanceSummary.present, 'number');
    assert.strictEqual(typeof data.attendanceSummary.absent, 'number');
    assert.strictEqual(typeof data.attendanceSummary.late, 'number');
    assert.strictEqual(typeof data.attendanceSummary.excused, 'number');

    // When 0 sessions, attendanceRate MUST be null
    if (data.attendanceSummary.totalSessions === 0) {
      assert.strictEqual(data.attendanceSummary.attendanceRate, null, 'attendanceRate must be null when totalSessions is 0');
      console.log('✓ Invariant verified: attendanceRate is null when totalSessions == 0 (No fake 0%)');
    }

    assert(data.academicSummary, 'academicSummary must exist');
    assert.strictEqual(typeof data.academicSummary.totalAssessments, 'number');
    assert.strictEqual(typeof data.academicSummary.completedAssessments, 'number');

    assert(Array.isArray(data.recentFeedback), 'recentFeedback must be an array');
    console.log('✓ All composite payload structure and type invariants satisfied');

    // -----------------------------------------------------------------
    // 5. Query Spoofing Invariant
    // -----------------------------------------------------------------
    console.log('[Security 5] Testing studentId query spoofing...');
    const spoofId = '11111111-2222-3333-4444-555555555555';
    const spoofRes = await studentClient.request(`/api/student/dashboard?studentId=${spoofId}&userId=${spoofId}`);
    assert.strictEqual(spoofRes.status, 200);
    assert.strictEqual(spoofRes.data.student.id, data.student.id, 'Server MUST ignore spoofed query parameter');
    assert.notStrictEqual(spoofRes.data.student.id, spoofId, 'Server adopted spoofed student ID!');
    console.log('✓ Query spoofing ignored; server strictly derived student identity from session');

    // -----------------------------------------------------------------
    // 6. Inactive account check
    // -----------------------------------------------------------------
    console.log('[Security 6] Testing inactive account...');
    await query(`UPDATE users SET account_status = 'inactive' WHERE email = $1`, [studentEmail]);
    const inactiveRes = await studentClient.request('/api/student/dashboard');
    assert.strictEqual(inactiveRes.status, 403, 'Inactive user must be rejected with 403');
    await query(`UPDATE users SET account_status = 'active' WHERE email = $1`, [studentEmail]);
    console.log('✓ Inactive user correctly rejected with 403 Forbidden');

    // -----------------------------------------------------------------
    // 7. Student without student record check
    // -----------------------------------------------------------------
    console.log('[Security 7] Testing student without student record...');
    const ghostEmail = 'ghost.student.dash@example.com';
    const ghostUserRes = await query(
      `INSERT INTO users (email, password_hash, role, account_status)
       VALUES ($1, $2, 'student', 'active') RETURNING id`,
      [ghostEmail, pwHash]
    );
    const ghostUserId = ghostUserRes.rows[0].id;
    const ghostClient = new SessionClient(server, port);
    await ghostClient.request('/api/auth/signin', {
      method: 'POST',
      body: { email: ghostEmail, password: 'Teacher123!' },
    });
    const ghostRes = await ghostClient.request('/api/student/dashboard');
    assert.strictEqual(ghostRes.status, 403);
    assert.strictEqual(ghostRes.data.code, 'STUDENT_RECORD_MISSING');
    await query('DELETE FROM users WHERE id = $1', [ghostUserId]);
    console.log('✓ Student without student record rejected with 403 STUDENT_RECORD_MISSING');

    // -----------------------------------------------------------------
    // 8. Student without enrollment -> valid null enrollment state
    // -----------------------------------------------------------------
    console.log('[Security 8] Testing student without active enrollment (valid null state)...');
    const unenrolledEmail = 'unenrolled.student.dash@example.com';
    const uStudentRes = await query(
      `INSERT INTO users (email, password_hash, role, account_status)
       VALUES ($1, $2, 'student', 'active') RETURNING id`,
      [unenrolledEmail, pwHash]
    );
    const uUserId = uStudentRes.rows[0].id;
    const sRes = await query(
      `INSERT INTO students (user_id, full_name, date_of_birth, guardian_name, guardian_phone, guardian_email, status)
       VALUES ($1, 'Unenrolled Student', '2016-01-01', 'Guardian', '555-1234', 'g@example.com', 'active') RETURNING id`,
      [uUserId]
    );
    const uStudentId = sRes.rows[0].id;

    const unenrolledClient = new SessionClient(server, port);
    await unenrolledClient.request('/api/auth/signin', {
      method: 'POST',
      body: { email: unenrolledEmail, password: 'Teacher123!' },
    });
    const uDashRes = await unenrolledClient.request('/api/student/dashboard');
    assert.strictEqual(uDashRes.status, 200, 'Unenrolled student request should return 200');
    assert.strictEqual(uDashRes.data.enrollment, null, 'enrollment must be null');
    assert.strictEqual(uDashRes.data.program, null, 'program must be null');
    assert.strictEqual(uDashRes.data.batch, null, 'batch must be null');
    assert.strictEqual(uDashRes.data.teacher, null, 'teacher must be null');
    assert.strictEqual(uDashRes.data.attendanceSummary.totalSessions, 0);
    assert.strictEqual(uDashRes.data.attendanceSummary.attendanceRate, null);
    assert.strictEqual(uDashRes.data.academicSummary.totalAssessments, 0);
    assert.strictEqual(uDashRes.data.recentFeedback.length, 0);
    console.log('✓ Student without enrollment safely returned valid null enrollment state');

    // Clean up unenrolled student
    await query('DELETE FROM students WHERE id = $1', [uStudentId]);
    await query('DELETE FROM users WHERE id = $1', [uUserId]);

    // -----------------------------------------------------------------
    // 9. Data Integrity & Multi-Tenant Isolation
    // -----------------------------------------------------------------
    console.log('[Security 9 & Data Integrity] Testing multi-tenant isolation and live calculation...');
    // Create Student B with distinct records
    const studentBEmail = 'student.b.isolation@example.com';
    await query('DELETE FROM users WHERE email = $1', [studentBEmail]);
    const uBRes = await query(
      `INSERT INTO users (email, password_hash, role, account_status)
       VALUES ($1, $2, 'student', 'active') RETURNING id`,
      [studentBEmail, pwHash]
    );
    const uBId = uBRes.rows[0].id;
    const sBRes = await query(
      `INSERT INTO students (user_id, full_name, date_of_birth, guardian_name, guardian_phone, guardian_email, status)
       VALUES ($1, 'Student B Isolation', '2016-02-02', 'Guardian B', '555-4321', 'gb@example.com', 'active') RETURNING id`,
      [uBId]
    );
    const studentBId = sBRes.rows[0].id;

    // Get an active enrollment, batch, teacher, program to attach mock academic record
    const baseEnrollment = await query(`SELECT id, program_id, batch_id, teacher_id FROM enrollments WHERE student_id = $1`, [data.student.id]);
    assert(baseEnrollment.rows.length > 0, 'Active enrollment for Student A must exist');
    const enrollRow = baseEnrollment.rows[0];

    // Clean up any previous test records for Student A's enrollment
    await query('DELETE FROM attendance_records WHERE enrollment_id = $1', [enrollRow.id]);
    await query('DELETE FROM teacher_notes WHERE student_id = $1', [data.student.id]);

    // Insert 1 attendance record for Student A
    const attInsert = await query(
      `INSERT INTO attendance_records (enrollment_id, session_date, status, notes)
       VALUES ($1, '2026-09-10', 'present', 'Great active participation') RETURNING id`,
      [enrollRow.id]
    );
    const testAttId = attInsert.rows[0].id;

    // Insert 1 teacher note for Student B (to test Student A CANNOT see it)
    const noteBInsert = await query(
      `INSERT INTO teacher_notes (student_id, teacher_id, note_type, content)
       VALUES ($1, $2, 'academic', 'Confidential Note for Student B ONLY') RETURNING id`,
      [studentBId, enrollRow.teacher_id]
    );
    const testNoteBId = noteBInsert.rows[0].id;

    // Insert 1 teacher note for Student A
    const noteAInsert = await query(
      `INSERT INTO teacher_notes (student_id, teacher_id, note_type, content)
       VALUES ($1, $2, 'behavioral', 'Commendable diligence and enthusiasm') RETURNING id`,
      [data.student.id, enrollRow.teacher_id]
    );
    const testNoteAId = noteAInsert.rows[0].id;

    // Re-authenticate Student A (previous session was destroyed during inactive test in step 6)
    const reLogin = await studentClient.request('/api/auth/signin', {
      method: 'POST',
      body: { email: studentEmail, password: 'Password123!' },
    });
    assert.strictEqual(reLogin.status, 200, 'Student re-login failed');

    // Re-query Student A's dashboard
    const reDashRes = await studentClient.request('/api/student/dashboard');
    assert.strictEqual(reDashRes.status, 200);
    const reData = reDashRes.data;

    // 1. Check Attendance updated
    assert.strictEqual(reData.attendanceSummary.totalSessions, 1);
    assert.strictEqual(reData.attendanceSummary.present, 1);
    assert.strictEqual(reData.attendanceSummary.attendanceRate, 100);
    console.log(`✓ Live attendance calculation verified: totalSessions = 1, present = 1, attendanceRate = 100%`);

    // 2. Check Teacher feedback isolation
    assert.strictEqual(reData.recentFeedback.length, 1);
    assert.strictEqual(reData.recentFeedback[0].id, testNoteAId);
    assert.strictEqual(reData.recentFeedback[0].content, 'Commendable diligence and enthusiasm');
    // Ensure Student B's note does NOT appear anywhere
    const leakedNote = reData.recentFeedback.find((n: any) => n.id === testNoteBId || n.content.includes('Student B'));
    assert.strictEqual(leakedNote, undefined, 'SECURITY BREACH: Student B confidential note was leaked to Student A!');
    console.log('✓ Multi-tenant isolation verified: Student B confidential notes strictly hidden from Student A');

    // Clean up temporary test records
    await query('DELETE FROM attendance_records WHERE id = $1', [testAttId]);
    await query('DELETE FROM teacher_notes WHERE id IN ($1, $2)', [testNoteAId, testNoteBId]);
    await query('DELETE FROM students WHERE id = $1', [studentBId]);
    await query('DELETE FROM users WHERE id = $1', [uBId]);
    console.log('✓ Cleaned up all temporary test records and users from database\n');

    console.log('========================================================');
    console.log('ALL PHASE 2B.2 STUDENT DASHBOARD TESTS PASSED (10/10)!');
    console.log('========================================================');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ DASHBOARD TEST FAILED:', err);
    process.exit(1);
  } finally {
    server.close();
    await pool.end();
  }
}

runDashboardTests();
