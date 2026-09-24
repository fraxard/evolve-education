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

async function runTeacherFoundationsTests() {
  console.log('========================================================');
  console.log('PHASE 2B.1 TEACHER FOUNDATIONS & ROSTERS TEST SUITE');
  console.log('========================================================\n');

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;
  console.log(`[Setup] In-process test server listening on ephemeral port ${port}\n`);

  // Track created temporary entities for cleanup
  let tempUserTeacherBId: string | null = null;
  let tempTeacherBId: string | null = null;
  let tempBatchBId: string | null = null;
  let tempUserStudentBId: string | null = null;
  let tempStudentBId: string | null = null;
  let tempEnrollmentBId: string | null = null;

  try {
    // -----------------------------------------------------------------
    // TEST 1: Unauthenticated Access to Teacher Endpoints
    // -----------------------------------------------------------------
    console.log('[Security 1] Testing unauthenticated access to /api/teacher endpoints...');
    const unauthClient = new SessionClient(server, port);

    const endpoints = [
      '/api/teacher/dashboard',
      '/api/teacher/batches',
      '/api/teacher/batches/11111111-1111-1111-1111-111111111111',
      '/api/teacher/students',
      '/api/teacher/students/11111111-1111-1111-1111-111111111111',
    ];

    for (const ep of endpoints) {
      const res = await unauthClient.request(ep);
      assert.strictEqual(res.status, 401, `Unauthenticated ${ep} must return 401`);
    }
    console.log('✓ All /api/teacher endpoints reject unauthenticated requests with 401 Unauthorized\n');

    // -----------------------------------------------------------------
    // TEST 2: Student Role Boundary Enforcement (Student cannot access Teacher APIs)
    // -----------------------------------------------------------------
    console.log('[Security 2] Testing Student role boundary rejection on /api/teacher...');
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash('Password123!', salt);

    const studentUserRes = await query(`SELECT u.id, u.email FROM users u WHERE u.role = 'student' LIMIT 1`);
    if (studentUserRes.rows.length > 0) {
      const studentUser = studentUserRes.rows[0];
      await query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashed, studentUser.id]);

      const studentClient = new SessionClient(server, port);
      const sLogin = await studentClient.request('/api/auth/signin', {
        method: 'POST',
        body: { email: studentUser.email, password: 'Password123!' },
      });
      assert.strictEqual(sLogin.status, 200, 'Student signin failed');

      const sDash = await studentClient.request('/api/teacher/dashboard');
      assert.strictEqual(sDash.status, 403, 'Student accessing /api/teacher/dashboard must be rejected with 403');

      const sBatches = await studentClient.request('/api/teacher/batches');
      assert.strictEqual(sBatches.status, 403, 'Student accessing /api/teacher/batches must be rejected with 403');

      const sStudents = await studentClient.request('/api/teacher/students');
      assert.strictEqual(sStudents.status, 403, 'Student accessing /api/teacher/students must be rejected with 403');
      console.log('✓ Student role strictly forbidden (403) from all /api/teacher endpoints\n');
    }

    // -----------------------------------------------------------------
    // TEST 3: Institutional Leakage Protection (Teachers blocked from Admin endpoints)
    // -----------------------------------------------------------------
    console.log('[Security 3] Verifying Teachers cannot access institutional /api/batches and /api/students...');
    // Find Teacher A in database
    const teacherARes = await query(
      `SELECT u.id as user_id, u.email, t.id as teacher_id, t.full_name
       FROM teachers t
       JOIN users u ON t.user_id = u.id
       WHERE t.status = 'active'
       LIMIT 1`
    );
    assert(teacherARes.rows.length > 0, 'At least one active teacher must exist in DB for testing');
    const teacherA = teacherARes.rows[0];

    // Ensure password for Teacher A is known ('Password123!')
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashed, teacherA.user_id]);

    const teacherAClient = new SessionClient(server, port);
    const tALogin = await teacherAClient.request('/api/auth/signin', {
      method: 'POST',
      body: { email: teacherA.email, password: 'Password123!' },
    });
    assert.strictEqual(tALogin.status, 200, 'Teacher A signin failed');

    // Attempt broad admin endpoints
    const leakBatches = await teacherAClient.request('/api/batches');
    assert.strictEqual(leakBatches.status, 403, 'Teacher must be forbidden from accessing admin /api/batches');

    const leakStudents = await teacherAClient.request('/api/students');
    assert.strictEqual(leakStudents.status, 403, 'Teacher must be forbidden from accessing admin /api/students');
    console.log('✓ Broad admin /api/batches and /api/students return 403 Forbidden to teachers\n');

    // -----------------------------------------------------------------
    // TEST 4: Teacher A Authorized Access (Dashboard, Batches, Students)
    // -----------------------------------------------------------------
    console.log('[Authorized 4] Testing Teacher A legitimate workspace endpoints...');
    const tDash = await teacherAClient.request('/api/teacher/dashboard');
    assert.strictEqual(tDash.status, 200, 'Teacher A dashboard must return 200');
    assert(tDash.data.teacher, 'Dashboard must return teacher info');
    assert(tDash.data.metrics, 'Dashboard must return telemetry metrics');
    assert.strictEqual(tDash.data.teacher.id, teacherA.teacher_id, 'Teacher ID must match authenticated teacher');
    console.log(`✓ Dashboard telemetry loaded: activeBatches=${tDash.data.metrics.activeBatchCount}, activeStudents=${tDash.data.metrics.activeStudentCount}`);

    const tBatches = await teacherAClient.request('/api/teacher/batches');
    assert.strictEqual(tBatches.status, 200, 'Teacher A batches must return 200');
    assert(Array.isArray(tBatches.data.batches), 'batches must be an array');
    console.log(`✓ Retrieved ${tBatches.data.batches.length} batches strictly assigned to Teacher A`);

    // Pick one assigned batch of Teacher A (or verify if Teacher A has assigned batches)
    let batchAId: string | null = null;
    if (tBatches.data.batches.length > 0) {
      batchAId = tBatches.data.batches[0].id;
      const bDetail = await teacherAClient.request(`/api/teacher/batches/${batchAId}`);
      assert.strictEqual(bDetail.status, 200, 'Batch detail must return 200 for assigned batch');
      assert.strictEqual(bDetail.data.batch.id, batchAId);
      assert(Array.isArray(bDetail.data.roster), 'roster must be an array');
      console.log(`✓ Teacher A retrieved own batch "${bDetail.data.batch.name}" with ${bDetail.data.roster.length} roster students`);

      const bRoster = await teacherAClient.request(`/api/teacher/batches/${batchAId}/students`);
      assert.strictEqual(bRoster.status, 200, 'Batch roster endpoint must return 200');
      assert(Array.isArray(bRoster.data.students));
      console.log(`✓ Teacher A retrieved batch roster (${bRoster.data.students.length} students)`);
    }

    const tStudents = await teacherAClient.request('/api/teacher/students');
    assert.strictEqual(tStudents.status, 200, 'Teacher A student directory must return 200');
    assert(Array.isArray(tStudents.data.students));
    console.log(`✓ Retrieved ${tStudents.data.students.length} assigned students for Teacher A`);

    if (tStudents.data.students.length > 0) {
      const studentAId = tStudents.data.students[0].id;
      const sDetail = await teacherAClient.request(`/api/teacher/students/${studentAId}`);
      assert.strictEqual(sDetail.status, 200, 'Student detail must return 200 for assigned student');
      assert.strictEqual(sDetail.data.student.id, studentAId);
      assert(Array.isArray(sDetail.data.enrollments));
      console.log(`✓ Teacher A inspected student "${sDetail.data.student.full_name}" profile and enrollments`);
    }

    // -----------------------------------------------------------------
    // TEST 5: Cross-Teacher IDOR Prevention (Batches and Students)
    // -----------------------------------------------------------------
    console.log('\n[Security 5] Setting up isolated Teacher B fixture to test cross-teacher IDOR isolation...');

    // 1. Get an existing program
    const progRes = await query('SELECT id FROM programs LIMIT 1');
    assert(progRes.rows.length > 0, 'Program must exist');
    const programId = progRes.rows[0].id;

    // 2. Create User Teacher B + Teacher B
    const uTeacherBRes = await query(
      `INSERT INTO users (email, password_hash, role, account_status)
       VALUES ('teacherb.test@evolve.edu', $1, 'teacher', 'active')
       RETURNING id`,
      [hashed]
    );
    tempUserTeacherBId = uTeacherBRes.rows[0].id;

    const tBRes = await query(
      `INSERT INTO teachers (user_id, full_name, specialization, status)
       VALUES ($1, 'Faculty Member B', 'Advanced Computer Science', 'active')
       RETURNING id`,
      [tempUserTeacherBId]
    );
    tempTeacherBId = tBRes.rows[0].id;

    // 3. Create Batch B assigned to Teacher B (NOT Teacher A)
    const bBRes = await query(
      `INSERT INTO batches (program_id, teacher_id, name, schedule, start_date, capacity, is_active)
       VALUES ($1, $2, 'Cohort Beta (Teacher B Exclusive)', 'Tue/Thu 14:00-16:00', '2026-09-01', 15, true)
       RETURNING id`,
      [programId, tempTeacherBId]
    );
    tempBatchBId = bBRes.rows[0].id;

    // 4. Create User Student B + Student B
    const uStudentBRes = await query(
      `INSERT INTO users (email, password_hash, role, account_status)
       VALUES ('studentb.test@evolve.edu', $1, 'student', 'active')
       RETURNING id`,
      [hashed]
    );
    tempUserStudentBId = uStudentBRes.rows[0].id;

    const sBRes = await query(
      `INSERT INTO students (user_id, full_name, date_of_birth, guardian_name, guardian_phone, guardian_email, status)
       VALUES ($1, 'Learner B', '2010-01-01', 'Guardian B', '+15550009999', 'guardianb@test.edu', 'active')
       RETURNING id`,
      [tempUserStudentBId]
    );
    tempStudentBId = sBRes.rows[0].id;

    // 5. Enroll Student B into Batch B with Teacher B
    const enrBRes = await query(
      `INSERT INTO enrollments (student_id, program_id, batch_id, teacher_id, start_date, status)
       VALUES ($1, $2, $3, $4, '2026-09-01', 'active')
       RETURNING id`,
      [tempStudentBId, programId, tempBatchBId, tempTeacherBId]
    );
    tempEnrollmentBId = enrBRes.rows[0].id;
    console.log(`✓ Temporary test fixture created: Teacher B (${tempTeacherBId}), Batch B (${tempBatchBId}), Student B (${tempStudentBId})`);

    // IDOR TEST A: Teacher A tries to fetch Batch B details
    console.log('\n[IDOR Test A] Teacher A attempts GET /api/teacher/batches/:batchBId...');
    const idorBatchRes = await teacherAClient.request(`/api/teacher/batches/${tempBatchBId}`);
    assert.strictEqual(idorBatchRes.status, 403, 'Teacher A MUST receive 403 Forbidden when requesting Teacher B batch');
    assert.strictEqual(idorBatchRes.data.error, 'Forbidden: You are not assigned to instruct this batch.');
    console.log('✓ IDOR PREVENTED: Teacher A received 403 Forbidden on Teacher B cohort batch');

    // IDOR TEST B: Teacher A tries to fetch Batch B students
    console.log('[IDOR Test B] Teacher A attempts GET /api/teacher/batches/:batchBId/students...');
    const idorBatchStudents = await teacherAClient.request(`/api/teacher/batches/${tempBatchBId}/students`);
    assert.strictEqual(idorBatchStudents.status, 403, 'Teacher A MUST receive 403 Forbidden when requesting Teacher B roster');
    console.log('✓ IDOR PREVENTED: Teacher A received 403 Forbidden on Teacher B roster');

    // IDOR TEST C: Teacher A tries to fetch Student B profile
    console.log('[IDOR Test C] Teacher A attempts GET /api/teacher/students/:studentBId...');
    const idorStudentRes = await teacherAClient.request(`/api/teacher/students/${tempStudentBId}`);
    assert.strictEqual(idorStudentRes.status, 403, 'Teacher A MUST receive 403 Forbidden when requesting Student B profile');
    assert.strictEqual(idorStudentRes.data.error, 'Forbidden: You do not have an active teaching assignment with this student.');
    console.log('✓ IDOR PREVENTED: Teacher A received 403 Forbidden on Student B profile');

    // IDOR TEST D: Teacher A tries non-existent batch & student
    console.log('[Boundary Test D] Testing 404 on non-existent batch and student...');
    const fakeUuid = '00000000-0000-0000-0000-000000000000';
    const notFoundBatch = await teacherAClient.request(`/api/teacher/batches/${fakeUuid}`);
    assert.strictEqual(notFoundBatch.status, 404, 'Non-existent batch must return 404');

    const notFoundStudent = await teacherAClient.request(`/api/teacher/students/${fakeUuid}`);
    assert.strictEqual(notFoundStudent.status, 404, 'Non-existent student must return 404');

    const invalidUuidBatch = await teacherAClient.request('/api/teacher/batches/not-a-uuid');
    assert.strictEqual(invalidUuidBatch.status, 400, 'Invalid UUID batch parameter must return 400');

    const invalidUuidStudent = await teacherAClient.request('/api/teacher/students/not-a-uuid');
    assert.strictEqual(invalidUuidStudent.status, 400, 'Invalid UUID student parameter must return 400');
    console.log('✓ 404 Not Found and 400 Bad Request boundaries correctly enforced');

    // -----------------------------------------------------------------
    // TEST 6: Admin Access to Institutional Endpoints
    // -----------------------------------------------------------------
    console.log('\n[Admin 6] Verifying Admin role still has full access to /api/batches and /api/students...');
    const adminUserRes = await query(`SELECT email FROM users WHERE role = 'admin' LIMIT 1`);
    if (adminUserRes.rows.length > 0) {
      const adminClient = new SessionClient(server, port);
      const adminLogin = await adminClient.request('/api/auth/signin', {
        method: 'POST',
        body: { email: adminUserRes.rows[0].email, password: 'AdminEvolve2026!' },
      });
      if (adminLogin.status === 200) {
        const adminBatches = await adminClient.request('/api/batches');
        assert.strictEqual(adminBatches.status, 200, 'Admin must be able to list /api/batches');

        const adminStudents = await adminClient.request('/api/students');
        assert.strictEqual(adminStudents.status, 200, 'Admin must be able to list /api/students');
        console.log('✓ Admin successfully accessed institutional /api/batches and /api/students (200 OK)');
      }
    }

    console.log('\n========================================================');
    console.log('ALL PHASE 2B.1 TEACHER FOUNDATIONS TESTS PASSED (100%)!');
    console.log('========================================================\n');
  } catch (err) {
    console.error('\n❌ PHASE 2B.1 TEST FAILED:', err);
    process.exitCode = 1;
  } finally {
    // Teardown temporary test entities
    if (tempEnrollmentBId) {
      await query('DELETE FROM enrollments WHERE id = $1', [tempEnrollmentBId]);
    }
    if (tempStudentBId) {
      await query('DELETE FROM students WHERE id = $1', [tempStudentBId]);
    }
    if (tempUserStudentBId) {
      await query('DELETE FROM users WHERE id = $1', [tempUserStudentBId]);
    }
    if (tempBatchBId) {
      await query('DELETE FROM batches WHERE id = $1', [tempBatchBId]);
    }
    if (tempTeacherBId) {
      await query('DELETE FROM teachers WHERE id = $1', [tempTeacherBId]);
    }
    if (tempUserTeacherBId) {
      await query('DELETE FROM users WHERE id = $1', [tempUserTeacherBId]);
    }
    console.log('✓ Cleaned up all temporary test fixtures from database');

    server.close();
    await pool.end();
    process.exit(process.exitCode ? 1 : 0);
  }
}

runTeacherFoundationsTests();
