import assert from 'assert';
import app from '../app.js';
import { pool, query } from '../db/index.js';
import dotenv from 'dotenv';
import http from 'http';

dotenv.config();

class SessionClient {
  private cookies: string[] = [];
  private port: number;

  constructor(port: number) {
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

    return { status: response.status, data: json };
  }
}

async function runAdminCompletionTest() {
  console.log('====================================================');
  console.log('[Admin Audit] Starting Admin Completion Test Suite');
  console.log('====================================================');

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as any;
  const port = address.port;
  console.log(`[Admin Audit] Test server listening on ephemeral port ${port}`);

  try {
    // 1. Get seed admin
    const adminUserRes = await query(
      "SELECT id, email FROM users WHERE role = 'admin' AND account_status = 'active' LIMIT 1"
    );
    assert(adminUserRes.rows.length > 0, 'Seed admin user must exist');
    const adminEmail = adminUserRes.rows[0].email;
    const adminId = adminUserRes.rows[0].id;
    console.log(`[Admin Audit] Admin identity found: ${adminEmail}`);

    // Log in as Admin
    const adminClient = new SessionClient(port);
    const loginRes = await adminClient.request('/api/auth/signin', {
      method: 'POST',
      body: {
        email: adminEmail,
        password: process.env.ADMIN_PASSWORD || 'AdminSecure2026!',
      },
    });
    assert.strictEqual(loginRes.status, 200, `Admin login should succeed. Got: ${JSON.stringify(loginRes.data)}`);
    console.log('[Admin Audit] Admin session established successfully.');

    // =========================================================================
    // SECTION A: AUDIT LOGS RETRIEVAL & FILTERING
    // =========================================================================
    console.log('\n--- Section A: Audit Logs ---');
    const auditLogsRes = await adminClient.request('/api/audit-logs');
    assert.strictEqual(auditLogsRes.status, 200, 'GET /api/audit-logs should return 200');
    assert(Array.isArray(auditLogsRes.data.auditLogs), 'Response must contain auditLogs array');
    console.log(`[Admin Audit] Retrieved ${auditLogsRes.data.auditLogs.length} audit log records.`);

    // Filter audit logs
    const filteredAuditRes = await adminClient.request('/api/audit-logs?action=STUDENT_ACTIVATED');
    assert.strictEqual(filteredAuditRes.status, 200);
    assert(Array.isArray(filteredAuditRes.data.auditLogs));
    console.log(`[Admin Audit] Filtered audit logs by action=STUDENT_ACTIVATED: ${filteredAuditRes.data.auditLogs.length} found.`);

    // =========================================================================
    // SECTION B: TEACHER, PROGRAM, BATCH CRUD
    // =========================================================================
    console.log('\n--- Section B: Faculty, Curriculum & Batch CRUD ---');

    // 1. Teacher Management
    const testTeacherEmail = `test.faculty.${Date.now()}@example.com`;
    const createTeacherRes = await adminClient.request('/api/teachers', {
      method: 'POST',
      body: {
        fullName: 'Dr. Evelyn Reed',
        email: testTeacherEmail,
        password: 'TeacherSecure2026!',
        phone: '+1 555-404-5050',
        qualification: 'Ph.D. in Mathematics',
        specialization: 'Mental Abacus & Speed Arithmetic',
      },
    });
    assert.strictEqual(createTeacherRes.status, 201, `Teacher creation should return 201. Got ${JSON.stringify(createTeacherRes.data)}`);
    const teacherId = createTeacherRes.data.teacher.id;
    console.log(`[Admin Audit] Created instructor ID: ${teacherId}`);

    // Update Teacher (including fullName and status)
    const updateTeacherRes = await adminClient.request(`/api/teachers/${teacherId}`, {
      method: 'PATCH',
      body: {
        fullName: 'Prof. Evelyn Reed-Vance',
        phone: '+1 555-777-8888',
        qualification: 'D.Sc. in Cognitive Science',
        specialization: 'Advanced Abacus Pedagogy',
        status: 'active',
      },
    });
    assert.strictEqual(updateTeacherRes.status, 200, `Teacher update should return 200. Got ${JSON.stringify(updateTeacherRes.data)}`);
    assert.strictEqual(updateTeacherRes.data.teacher.full_name, 'Prof. Evelyn Reed-Vance');
    console.log('[Admin Audit] Teacher updated successfully with new full_name.');

    // 2. Program Management
    const testProgSlug = `neuro-logic-${Date.now()}`;
    const createProgRes = await adminClient.request('/api/programs', {
      method: 'POST',
      body: {
        name: 'NeuroLogic Foundations',
        slug: testProgSlug,
        description: 'Cognitive reasoning and spatial awareness curriculum.',
        level: 'intermediate',
        duration: '12 weeks',
        isActive: true,
      },
    });
    assert.strictEqual(createProgRes.status, 201, `Program creation should return 201. Got ${JSON.stringify(createProgRes.data)}`);
    const programId = createProgRes.data.program.id;
    console.log(`[Admin Audit] Created program ID: ${programId}`);

    // Update Program
    const updateProgRes = await adminClient.request(`/api/programs/${programId}`, {
      method: 'PATCH',
      body: {
        name: 'NeuroLogic Advanced Foundations',
        description: 'Enhanced cognitive reasoning and spatial awareness curriculum.',
        level: 'advanced',
        duration: '16 weeks',
        isActive: true,
      },
    });
    assert.strictEqual(updateProgRes.status, 200, `Program update should return 200. Got ${JSON.stringify(updateProgRes.data)}`);
    assert.strictEqual(updateProgRes.data.program.name, 'NeuroLogic Advanced Foundations');
    console.log('[Admin Audit] Program updated successfully.');

    // 3. Batch Management & Capacity Bounds
    const createBatch1Res = await adminClient.request('/api/batches', {
      method: 'POST',
      body: {
        programId,
        teacherId,
        name: 'Cohort Alpha 2026',
        capacity: 2,
        schedule: 'Tue/Thu 4:00 PM',
        startDate: '2026-10-01',
      },
    });
    assert.strictEqual(createBatch1Res.status, 201, `Batch 1 creation should return 201. Got ${JSON.stringify(createBatch1Res.data)}`);
    const batch1Id = createBatch1Res.data.batch.id;

    const createBatch2Res = await adminClient.request('/api/batches', {
      method: 'POST',
      body: {
        programId,
        teacherId,
        name: 'Cohort Beta 2026',
        capacity: 1, // small capacity to test overflow protection
        schedule: 'Mon/Wed 5:00 PM',
        startDate: '2026-10-01',
      },
    });
    assert.strictEqual(createBatch2Res.status, 201, `Batch 2 creation should return 201. Got ${JSON.stringify(createBatch2Res.data)}`);
    const batch2Id = createBatch2Res.data.batch.id;
    console.log(`[Admin Audit] Created Cohort Alpha (${batch1Id}) and Cohort Beta (${batch2Id}).`);

    // =========================================================================
    // SECTION C: STUDENT LIFECYCLE & COHORT MOBILITY
    // =========================================================================
    console.log('\n--- Section C: Student Lifecycle & Cohort Mobility ---');

    // Create a student candidate via application and enroll into Batch 1
    const testCandidateEmail = `candidate.admin.test.${Date.now()}@example.com`;
    const applyClient = new SessionClient(port);
    const applyRes = await applyClient.request('/api/applications', {
      method: 'POST',
      body: {
        studentName: 'Samantha Parker',
        dateOfBirth: '2016-04-12',
        guardianName: 'Arthur Parker',
        guardianRelationship: 'Father',
        guardianPhone: '+1 555-888-9999',
        guardianEmail: 'arthur.parker@example.com',
        email: testCandidateEmail,
        password: 'Password123!',
        requestedProgramId: programId,
      },
    });
    const applicationId = applyRes.data.applicationId;

    // Approve & Enroll candidate into Batch 1
    const approveRes = await adminClient.request(`/api/applications/${applicationId}/approve-and-activate`, {
      method: 'POST',
      body: {
        programId,
        batchId: batch1Id,
        teacherId,
        startDate: '2026-10-01',
      },
    });
    const studentId = approveRes.data.data.studentId;
    console.log(`[Admin Audit] Student approved and enrolled: Student ID ${studentId}`);

    // Verify GET /api/students/:id returns complete dossier with enrollments
    const studentDossierRes = await adminClient.request(`/api/students/${studentId}`);
    assert.strictEqual(studentDossierRes.status, 200, 'GET /api/students/:id should return 200');
    assert.strictEqual(studentDossierRes.data.student.id, studentId);
    assert.strictEqual(studentDossierRes.data.enrollments.length, 1);
    assert.strictEqual(studentDossierRes.data.enrollments[0].status, 'active');
    assert.strictEqual(studentDossierRes.data.enrollments[0].batch_id, batch1Id);
    console.log('[Admin Audit] Student dossier verified: 1 active enrollment found.');

    // Test Batch Capacity Downsizing Prevention:
    // Batch 1 has 1 active student. Attempt to set capacity to 0 should be rejected with 400.
    const downsizeRes = await adminClient.request(`/api/batches/${batch1Id}`, {
      method: 'PATCH',
      body: {
        capacity: 0,
      },
    });
    assert.strictEqual(downsizeRes.status, 400, 'Downsizing capacity below active student count must return 400');
    console.log('[Admin Audit] Capacity reduction guard verified: rejected downsizing below enrolled count.');

    // TEST COHORT TRANSFER: Batch 1 -> Batch 2
    console.log('\n--- Testing Cohort Transfer ---');
    const transferRes = await adminClient.request(`/api/students/${studentId}/transfer`, {
      method: 'POST',
      body: {
        targetProgramId: programId,
        targetBatchId: batch2Id,
        targetTeacherId: teacherId,
        reason: 'Accelerated pacing transfer requested by faculty',
        effectiveDate: '2026-10-05',
      },
    });
    assert.strictEqual(transferRes.status, 200, `Transfer should succeed with 200. Got ${JSON.stringify(transferRes.data)}`);

    // Verify enrollment history in DB
    const postTransferDossier = await adminClient.request(`/api/students/${studentId}`);
    assert.strictEqual(postTransferDossier.data.enrollments.length, 2, 'Must now have 2 enrollment records');
    const oldEnr = postTransferDossier.data.enrollments.find((e: any) => e.batch_id === batch1Id);
    const newEnr = postTransferDossier.data.enrollments.find((e: any) => e.batch_id === batch2Id);
    assert.strictEqual(oldEnr.status, 'transferred', 'Old enrollment must be marked transferred');
    assert.strictEqual(newEnr.status, 'active', 'New enrollment must be marked active');
    console.log('[Admin Audit] Cohort transfer verified: Historical record preserved as transferred, new record active.');

    // TEST OVERBOOKING REJECTION: Batch 2 has capacity=1 and now has 1 student.
    // Try to transfer another student into Batch 2 -> Must fail with 400.
    // Create 2nd student in Batch 1
    const testCandidate2Email = `candidate2.admin.test.${Date.now()}@example.com`;
    const apply2Res = await applyClient.request('/api/applications', {
      method: 'POST',
      body: {
        studentName: 'Oliver Twist',
        dateOfBirth: '2016-01-10',
        guardianName: 'Agnes Twist',
        guardianRelationship: 'Mother',
        guardianPhone: '+1 555-111-2222',
        guardianEmail: 'agnes.twist@example.com',
        email: testCandidate2Email,
        password: 'Password123!',
        requestedProgramId: programId,
      },
    });
    const app2Id = apply2Res.data.applicationId;
    const approve2Res = await adminClient.request(`/api/applications/${app2Id}/approve-and-activate`, {
      method: 'POST',
      body: {
        programId,
        batchId: batch1Id,
        teacherId,
        startDate: '2026-10-01',
      },
    });
    const student2Id = approve2Res.data.data.studentId;

    // Now try to transfer Student 2 into Batch 2 (which is full)
    const overbookTransferRes = await adminClient.request(`/api/students/${student2Id}/transfer`, {
      method: 'POST',
      body: {
        targetProgramId: programId,
        targetBatchId: batch2Id,
        targetTeacherId: teacherId,
        reason: 'Attempting transfer into full batch',
      },
    });
    assert.strictEqual(overbookTransferRes.status, 400, 'Transfer into full cohort must fail with 400');
    console.log('[Admin Audit] Overbooking prevention verified: rejected transfer into full cohort.');

    // =========================================================================
    // SECTION D: STUDENT LIFECYCLE STATE TRANSITIONS
    // =========================================================================
    console.log('\n--- Section D: Student Lifecycle Transitions ---');

    // 1. Suspend Student 1
    const suspendRes = await adminClient.request(`/api/students/${studentId}/status`, {
      method: 'POST',
      body: {
        action: 'suspend',
        reason: 'Temporary medical absence hold',
      },
    });
    assert.strictEqual(suspendRes.status, 200, 'Suspension should return 200');
    const suspendedCheck = await query('SELECT status FROM students WHERE id = $1', [studentId]);
    assert.strictEqual(suspendedCheck.rows[0].status, 'suspended', 'DB student status must be suspended');
    const suspendedUserCheck = await query(
      'SELECT account_status FROM users WHERE id = (SELECT user_id FROM students WHERE id = $1)',
      [studentId]
    );
    assert.strictEqual(suspendedUserCheck.rows[0].account_status, 'inactive', 'User account must be inactive');
    console.log('[Admin Audit] Student suspension verified.');

    // Verify suspended student cannot be transferred
    const suspendedTransferRes = await adminClient.request(`/api/students/${studentId}/transfer`, {
      method: 'POST',
      body: {
        targetProgramId: programId,
        targetBatchId: batch1Id,
        targetTeacherId: teacherId,
        reason: 'Transfer while suspended should fail',
      },
    });
    assert.strictEqual(suspendedTransferRes.status, 400, 'Cannot transfer non-active student');
    console.log('[Admin Audit] Invariant verified: Suspended student cannot be transferred.');

    // 2. Reactivate Student 1
    const reactivateRes = await adminClient.request(`/api/students/${studentId}/status`, {
      method: 'POST',
      body: {
        action: 'activate',
      },
    });
    assert.strictEqual(reactivateRes.status, 200, 'Reactivation should return 200');
    const reactivatedCheck = await query('SELECT status FROM students WHERE id = $1', [studentId]);
    assert.strictEqual(reactivatedCheck.rows[0].status, 'active', 'DB student status must be active');
    console.log('[Admin Audit] Student reactivation verified.');

    // 3. Graduate Student 1
    const graduateRes = await adminClient.request(`/api/students/${studentId}/status`, {
      method: 'POST',
      body: {
        action: 'graduate',
        reason: 'Curriculum completion and final certification awarded',
      },
    });
    assert.strictEqual(graduateRes.status, 200, 'Graduation should return 200');
    const graduatedCheck = await query('SELECT status FROM students WHERE id = $1', [studentId]);
    assert.strictEqual(graduatedCheck.rows[0].status, 'graduated', 'DB student status must be graduated');
    const gradEnrollmentCheck = await query(
      "SELECT status FROM enrollments WHERE student_id = $1 AND batch_id = $2",
      [studentId, batch2Id]
    );
    assert.strictEqual(gradEnrollmentCheck.rows[0].status, 'completed', 'Active enrollment must be marked completed');
    console.log('[Admin Audit] Student graduation verified (enrollment marked completed).');

    // 4. Reactivate and then Withdraw
    await adminClient.request(`/api/students/${studentId}/status`, {
      method: 'POST',
      body: { action: 'activate' },
    });
    // Set enrollment active again for testing withdrawal
    await query("UPDATE enrollments SET status = 'active' WHERE student_id = $1 AND batch_id = $2", [studentId, batch2Id]);

    const withdrawRes = await adminClient.request(`/api/students/${studentId}/status`, {
      method: 'POST',
      body: {
        action: 'withdraw',
        reason: 'Family relocated to another school district',
      },
    });
    assert.strictEqual(withdrawRes.status, 200, 'Withdrawal should return 200');
    const withdrawnCheck = await query('SELECT status FROM students WHERE id = $1', [studentId]);
    assert.strictEqual(withdrawnCheck.rows[0].status, 'inactive', 'DB student status must be inactive');
    const withEnrollmentCheck = await query(
      "SELECT status FROM enrollments WHERE student_id = $1 AND batch_id = $2",
      [studentId, batch2Id]
    );
    assert.strictEqual(withEnrollmentCheck.rows[0].status, 'withdrawn', 'Active enrollment must be marked withdrawn');
    console.log('[Admin Audit] Student withdrawal verified (enrollment marked withdrawn).');

    // =========================================================================
    // SECTION E: AUDIT TRAIL ACTION CODES VERIFICATION
    // =========================================================================
    console.log('\n--- Section E: Audit Trail Action Codes ---');
    const auditActionsRes = await query(
      `SELECT DISTINCT action FROM audit_logs WHERE target_id IN ($1, $2, $3, $4, $5, $6)`,
      [teacherId, programId, batch1Id, batch2Id, studentId, student2Id]
    );
    const recordedActions = auditActionsRes.rows.map((r) => r.action);
    console.log('[Admin Audit] Recorded action codes for test entities:', recordedActions);

    assert(recordedActions.includes('TEACHER_CREATED'), 'Must contain TEACHER_CREATED');
    assert(recordedActions.includes('TEACHER_UPDATED'), 'Must contain TEACHER_UPDATED');
    assert(recordedActions.includes('PROGRAM_CREATED'), 'Must contain PROGRAM_CREATED');
    assert(recordedActions.includes('PROGRAM_UPDATED'), 'Must contain PROGRAM_UPDATED');
    assert(recordedActions.includes('BATCH_CREATED'), 'Must contain BATCH_CREATED');
    assert(recordedActions.includes('STUDENT_ACTIVATED'), 'Must contain STUDENT_ACTIVATED');
    assert(recordedActions.includes('STUDENT_TRANSFERRED'), 'Must contain STUDENT_TRANSFERRED');
    assert(recordedActions.includes('STUDENT_SUSPENDED'), 'Must contain STUDENT_SUSPENDED');
    assert(recordedActions.includes('STUDENT_REACTIVATED'), 'Must contain STUDENT_REACTIVATED');
    assert(recordedActions.includes('STUDENT_GRADUATED'), 'Must contain STUDENT_GRADUATED');
    assert(recordedActions.includes('STUDENT_WITHDRAWN'), 'Must contain STUDENT_WITHDRAWN');
    console.log('[Admin Audit] All 11 expected audit action codes successfully recorded and verified!');

    // =========================================================================
    // SECTION F: SECURITY & ROLE ISOLATION
    // =========================================================================
    console.log('\n--- Section F: Role Isolation & Authorization ---');
    const anonClient = new SessionClient(port);
    const unauthTransfer = await anonClient.request(`/api/students/${studentId}/transfer`, {
      method: 'POST',
      body: { targetProgramId: programId, targetBatchId: batch1Id, targetTeacherId: teacherId, reason: 'test' },
    });
    assert.strictEqual(unauthTransfer.status, 401, 'Anonymous transfer request must return 401');

    const unauthStatus = await anonClient.request(`/api/students/${studentId}/status`, {
      method: 'POST',
      body: { action: 'activate' },
    });
    assert.strictEqual(unauthStatus.status, 401, 'Anonymous status update must return 401');

    // Reactivate student account for testing student role isolation
    await query("UPDATE users SET account_status = 'active' WHERE email = $1", [testCandidateEmail]);
    const studentClient = new SessionClient(port);
    const studentLoginRes = await studentClient.request('/api/auth/signin', {
      method: 'POST',
      body: { email: testCandidateEmail, password: 'Password123!' },
    });
    assert.strictEqual(studentLoginRes.status, 200, 'Student login should succeed');

    const studentForbiddenTransfer = await studentClient.request(`/api/students/${studentId}/transfer`, {
      method: 'POST',
      body: { targetProgramId: programId, targetBatchId: batch1Id, targetTeacherId: teacherId, reason: 'test' },
    });
    assert.strictEqual(studentForbiddenTransfer.status, 403, 'Student role must be forbidden from cohort transfer');

    const studentForbiddenStatus = await studentClient.request(`/api/students/${studentId}/status`, {
      method: 'POST',
      body: { action: 'activate' },
    });
    assert.strictEqual(studentForbiddenStatus.status, 403, 'Student role must be forbidden from status updates');

    const studentForbiddenTeacherEdit = await studentClient.request(`/api/teachers/${teacherId}`, {
      method: 'PATCH',
      body: { fullName: 'Hacked Name' },
    });
    assert.strictEqual(studentForbiddenTeacherEdit.status, 403, 'Student role must be forbidden from editing teachers');

    console.log('[Admin Audit] Role isolation verified: Unauthorized callers properly blocked (401/403).');

    console.log('\n====================================================');
    console.log('ALL ADMIN PORTAL COMPLETION TESTS PASSED (100%)');
    console.log('====================================================\n');
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await pool.end();
  }
}

runAdminCompletionTest().catch((err) => {
  console.error('[Admin Audit FAILED]:', err);
  process.exit(1);
});
