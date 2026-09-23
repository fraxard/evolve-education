import assert from 'assert';
import http from 'http';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import app from '../app.js';
import { pool, query } from '../db/index.js';

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

async function runSprint1Verification() {
  console.log('====================================================');
  console.log('[Sprint 1 Test] Starting Verification Suite...');
  console.log('====================================================');

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as any;
  const port = address.port;
  console.log(`[Sprint 1 Test] Ephemeral server running on port ${port}`);

  try {
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@evolve.edu').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'EvolveAdmin2026!';

    // Ensure seed admin user exists with known password
    const existingAdmin = await query('SELECT id FROM users WHERE email = $1', [adminEmail]);
    let adminUserId: string;
    if (existingAdmin.rows.length === 0) {
      const hash = await bcrypt.hash(adminPassword, 12);
      const res = await query(
        `INSERT INTO users (email, password_hash, role, account_status)
         VALUES ($1, $2, 'admin', 'active') RETURNING id`,
        [adminEmail, hash]
      );
      adminUserId = res.rows[0].id;
    } else {
      adminUserId = existingAdmin.rows[0].id;
      // Ensure password matches adminPassword
      const hash = await bcrypt.hash(adminPassword, 12);
      await query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, adminUserId]);
    }

    // ----------------------------------------------------
    // TEST SECTION 1: 401 & 403 Authorization Security
    // ----------------------------------------------------
    console.log('\n[Test 1] Verifying 401 & 403 Authorization on all new endpoints...');

    const unauthClient = new SessionClient(server, port);

    // 1.1 Unauthenticated requests must return 401
    const dummyId = '00000000-0000-0000-0000-000000000000';
    const unauthDeleteProg = await unauthClient.request(`/api/programs/${dummyId}`, { method: 'DELETE' });
    assert.strictEqual(unauthDeleteProg.status, 401, 'DELETE /api/programs/:id without auth should be 401');

    const unauthDeleteBatch = await unauthClient.request(`/api/batches/${dummyId}`, { method: 'DELETE' });
    assert.strictEqual(unauthDeleteBatch.status, 401, 'DELETE /api/batches/:id without auth should be 401');

    const unauthDeleteTeacher = await unauthClient.request(`/api/teachers/${dummyId}`, { method: 'DELETE' });
    assert.strictEqual(unauthDeleteTeacher.status, 401, 'DELETE /api/teachers/:id without auth should be 401');

    const unauthChangePw = await unauthClient.request('/api/auth/change-password', {
      method: 'POST',
      body: { currentPassword: 'foo', newPassword: 'Bar' },
    });
    assert.strictEqual(unauthChangePw.status, 401, 'POST /api/auth/change-password without auth should be 401');

    const unauthSysStatus = await unauthClient.request('/api/admin/system-status');
    assert.strictEqual(unauthSysStatus.status, 401, 'GET /api/admin/system-status without auth should be 401');

    const unauthRevokeAll = await unauthClient.request('/api/admin/signout-all', { method: 'POST' });
    assert.strictEqual(unauthRevokeAll.status, 401, 'POST /api/admin/signout-all without auth should be 401');

    console.log('  ✓ All 6 unauthenticated endpoints correctly return 401 Unauthorized');

    // 1.2 Non-admin role (student) must return 403 Forbidden
    const testStudentEmail = 'student.permtest@example.com';
    const studentPw = 'StudentPass123!';
    const studentHash = await bcrypt.hash(studentPw, 12);
    await query('DELETE FROM users WHERE email = $1', [testStudentEmail]);
    const studentUserRes = await query(
      `INSERT INTO users (email, password_hash, role, account_status)
       VALUES ($1, $2, 'student', 'active') RETURNING id`,
      [testStudentEmail, studentHash]
    );
    const studentUserId = studentUserRes.rows[0].id;

    const studentClient = new SessionClient(server, port);
    const studentLogin = await studentClient.request('/api/auth/signin', {
      method: 'POST',
      body: { email: testStudentEmail, password: studentPw },
    });
    assert.strictEqual(studentLogin.status, 200, 'Student should sign in');

    const studentDeleteProg = await studentClient.request(`/api/programs/${dummyId}`, { method: 'DELETE' });
    assert.strictEqual(studentDeleteProg.status, 403, 'Student deleting program should be 403 Forbidden');

    const studentDeleteBatch = await studentClient.request(`/api/batches/${dummyId}`, { method: 'DELETE' });
    assert.strictEqual(studentDeleteBatch.status, 403, 'Student deleting batch should be 403 Forbidden');

    const studentDeleteTeacher = await studentClient.request(`/api/teachers/${dummyId}`, { method: 'DELETE' });
    assert.strictEqual(studentDeleteTeacher.status, 403, 'Student deleting teacher should be 403 Forbidden');

    const studentSysStatus = await studentClient.request('/api/admin/system-status');
    assert.strictEqual(studentSysStatus.status, 403, 'Student querying admin telemetry should be 403 Forbidden');

    console.log('  ✓ Role enforcement verified: Student role gets 403 Forbidden on admin endpoints');

    // Clean up student test user
    await query('DELETE FROM users WHERE id = $1', [studentUserId]);

    // ----------------------------------------------------
    // TEST SECTION 2: Safe Admin Deletion (Programs, Batches, Teachers)
    // ----------------------------------------------------
    console.log('\n[Test 2] Verifying Safe Admin Deletion & Dependency Checks...');

    const adminClient = new SessionClient(server, port);
    const adminLogin = await adminClient.request('/api/auth/signin', {
      method: 'POST',
      body: { email: adminEmail, password: adminPassword },
    });
    assert.strictEqual(adminLogin.status, 200, 'Admin should sign in');

    // 2.1 Attempt deleting seed Abacus program (has dependent batches & enrollments)
    const abacusRes = await query("SELECT id FROM programs WHERE slug = 'abacus'");
    assert(abacusRes.rows.length > 0, 'Seed program Abacus must exist');
    const abacusId = abacusRes.rows[0].id;

    const blockedProgDelete = await adminClient.request(`/api/programs/${abacusId}`, { method: 'DELETE' });
    assert.strictEqual(blockedProgDelete.status, 400, 'Program with dependencies must return 400 Bad Request');
    assert.strictEqual(blockedProgDelete.data.code, 'DEPENDENCY_EXISTS');
    assert(blockedProgDelete.data.error.includes('cohort batch(es)'), 'Error message must explain dependent batches');
    console.log('  ✓ Program deletion with dependent cohorts successfully blocked (400 DEPENDENCY_EXISTS)');

    // 2.2 Attempt deleting seed batch (with enrolled students or assessments)
    const seedBatchRes = await query('SELECT id, name FROM batches WHERE program_id = $1 LIMIT 1', [abacusId]);
    if (seedBatchRes.rows.length > 0) {
      const seedBatchId = seedBatchRes.rows[0].id;
      // Ensure it has an enrollment or check block if enrollments exist
      const enrollCountRes = await query('SELECT count(*)::int as count FROM enrollments WHERE batch_id = $1', [seedBatchId]);
      if (enrollCountRes.rows[0].count > 0) {
        const blockedBatchDelete = await adminClient.request(`/api/batches/${seedBatchId}`, { method: 'DELETE' });
        assert.strictEqual(blockedBatchDelete.status, 400, 'Batch with enrollments must return 400 Bad Request');
        assert.strictEqual(blockedBatchDelete.data.code, 'DEPENDENCY_EXISTS');
        console.log('  ✓ Cohort batch deletion with dependent enrollments successfully blocked (400 DEPENDENCY_EXISTS)');
      }
    }

    // 2.3 Attempt deleting seed teacher (has assigned cohorts or notes)
    const seedTeacherRes = await query("SELECT id, full_name FROM teachers WHERE status = 'active' LIMIT 1");
    assert(seedTeacherRes.rows.length > 0, 'Seed teacher must exist');
    const seedTeacherId = seedTeacherRes.rows[0].id;
    const blockedTeacherDelete = await adminClient.request(`/api/teachers/${seedTeacherId}`, { method: 'DELETE' });
    assert.strictEqual(blockedTeacherDelete.status, 400, 'Teacher with assigned batches must return 400 Bad Request');
    assert.strictEqual(blockedTeacherDelete.data.code, 'DEPENDENCY_EXISTS');
    console.log('  ✓ Teacher deletion with dependent cohorts/notes successfully blocked (400 DEPENDENCY_EXISTS)');

    // 2.4 Create isolated entities with no dependencies and verify clean deletion
    console.log('  Creating unassigned test entities for deletion test...');
    const testSuffix = Date.now().toString().slice(-6);
    // Create isolated Program
    const newProgRes = await adminClient.request('/api/programs', {
      method: 'POST',
      body: {
        name: `Ephemeral Test Curriculum ${testSuffix}`,
        slug: `ephemeral-curriculum-${testSuffix}`,
        description: 'Test program to verify clean deletion',
        level: 'Alpha',
        duration: '1 Week',
      },
    });
    assert.strictEqual(newProgRes.status, 201, 'Should create isolated program');
    const isoProgId = newProgRes.data.program.id;

    // Create isolated Teacher
    const newTeacherRes = await adminClient.request('/api/teachers', {
      method: 'POST',
      body: {
        fullName: `Ephemeral Instructor ${testSuffix}`,
        email: `instructor.${testSuffix}@example.com`,
        password: 'Password123!',
        phone: '+1 555-987-6543',
        specialization: 'Quantum Math',
      },
    });
    assert.strictEqual(newTeacherRes.status, 201, 'Should create isolated teacher');
    const isoTeacherId = newTeacherRes.data.teacher.id;

    // Create isolated Batch
    const newBatchRes = await adminClient.request('/api/batches', {
      method: 'POST',
      body: {
        programId: isoProgId,
        teacherId: isoTeacherId,
        name: `Ephemeral Test Batch ${testSuffix}`,
        schedule: 'Mon & Wed 4:00 PM - 5:00 PM',
        capacity: 10,
        startDate: '2026-10-01',
      },
    });
    assert.strictEqual(newBatchRes.status, 201, 'Should create isolated batch');
    const isoBatchId = newBatchRes.data.batch.id;

    // Try deleting program now -> Should fail because isoBatchId is linked!
    const blockedIsoProg = await adminClient.request(`/api/programs/${isoProgId}`, { method: 'DELETE' });
    assert.strictEqual(blockedIsoProg.status, 400, 'Program with batch must be blocked');

    // Try deleting teacher now -> Should fail because isoBatchId is linked!
    const blockedIsoTeacher = await adminClient.request(`/api/teachers/${isoTeacherId}`, { method: 'DELETE' });
    assert.strictEqual(blockedIsoTeacher.status, 400, 'Teacher with assigned batch must be blocked');

    // Delete isolated Batch (no enrollments) -> 200 OK
    const deleteBatchRes = await adminClient.request(`/api/batches/${isoBatchId}`, { method: 'DELETE' });
    assert.strictEqual(deleteBatchRes.status, 200, 'Isolated batch should delete cleanly');
    const checkBatchDb = await query('SELECT id FROM batches WHERE id = $1', [isoBatchId]);
    assert.strictEqual(checkBatchDb.rows.length, 0, 'Batch must no longer exist in DB');

    // Delete isolated Program (now batch is gone) -> 200 OK
    const deleteProgRes = await adminClient.request(`/api/programs/${isoProgId}`, { method: 'DELETE' });
    assert.strictEqual(deleteProgRes.status, 200, 'Isolated program should delete cleanly');
    const checkProgDb = await query('SELECT id FROM programs WHERE id = $1', [isoProgId]);
    assert.strictEqual(checkProgDb.rows.length, 0, 'Program must no longer exist in DB');

    // Delete isolated Teacher (now batch is gone) -> 200 OK
    const deleteTeacherRes = await adminClient.request(`/api/teachers/${isoTeacherId}`, { method: 'DELETE' });
    assert.strictEqual(deleteTeacherRes.status, 200, 'Isolated teacher should delete cleanly');
    const checkTeacherDb = await query('SELECT id FROM teachers WHERE id = $1', [isoTeacherId]);
    assert.strictEqual(checkTeacherDb.rows.length, 0, 'Teacher must no longer exist in DB');
    const checkTeacherUserDb = await query('SELECT id FROM users WHERE email = $1', [`instructor.${testSuffix}@example.com`]);
    assert.strictEqual(checkTeacherUserDb.rows.length, 0, 'Associated user account must be deleted');

    // Verify audit logs were written for all 3 deletions
    const auditLogsRes = await query(
      `SELECT action FROM audit_logs WHERE target_id IN ($1, $2, $3)`,
      [isoProgId, isoBatchId, isoTeacherId]
    );
    const recordedActions = auditLogsRes.rows.map((r) => r.action);
    assert(recordedActions.includes('BATCH_DELETED'), 'BATCH_DELETED must be in audit log');
    assert(recordedActions.includes('PROGRAM_DELETED'), 'PROGRAM_DELETED must be in audit log');
    assert(recordedActions.includes('TEACHER_DELETED'), 'TEACHER_DELETED must be in audit log');

    console.log('  ✓ Clean deletion verified for Program, Batch, and Teacher');
    console.log('  ✓ BATCH_DELETED, PROGRAM_DELETED, TEACHER_DELETED audit records logged');

    // ----------------------------------------------------
    // TEST SECTION 3: Live + Paginated Audit Logs
    // ----------------------------------------------------
    console.log('\n[Test 3] Verifying Live + Paginated Audit Logs...');

    // 3.1 Fetch with pagination parameters
    const paginatedRes = await adminClient.request('/api/audit-logs?page=1&limit=5');
    assert.strictEqual(paginatedRes.status, 200, 'Audit logs request should succeed');
    assert(Array.isArray(paginatedRes.data.auditLogs), 'Response must have auditLogs array');
    assert(paginatedRes.data.auditLogs.length <= 5, 'Returned logs should respect limit 5');
    assert(paginatedRes.data.pagination, 'Response must have pagination object');
    assert(typeof paginatedRes.data.pagination.total === 'number', 'pagination.total must be a number');
    assert(paginatedRes.data.pagination.total > 0, 'pagination.total must be > 0');
    assert.strictEqual(paginatedRes.data.pagination.page, 1, 'pagination.page must be 1');
    assert.strictEqual(paginatedRes.data.pagination.limit, 5, 'pagination.limit must be 5');
    assert(paginatedRes.data.pagination.totalPages >= 1, 'pagination.totalPages must be >= 1');
    assert(Array.isArray(paginatedRes.data.availableActions), 'availableActions must be an array');
    console.log(`  ✓ Pagination metadata verified (Total: ${paginatedRes.data.pagination.total}, TotalPages: ${paginatedRes.data.pagination.totalPages})`);

    // 3.2 Filter by specific action
    const filteredActionRes = await adminClient.request('/api/audit-logs?action=TEACHER_DELETED');
    assert.strictEqual(filteredActionRes.status, 200);
    for (const log of filteredActionRes.data.auditLogs) {
      assert.strictEqual(log.action, 'TEACHER_DELETED', 'All logs must match filtered action');
    }
    console.log('  ✓ Action filter correctly isolates target events');

    // 3.3 Search filter
    const searchRes = await adminClient.request(`/api/audit-logs?search=${adminEmail}`);
    assert.strictEqual(searchRes.status, 200);
    assert(searchRes.data.auditLogs.length > 0, 'Should find logs with admin email');
    console.log('  ✓ Full-text search correctly filters audit events');

    // ----------------------------------------------------
    // TEST SECTION 4: Admin System Status Telemetry
    // ----------------------------------------------------
    console.log('\n[Test 4] Verifying System Status & Telemetry Endpoint...');

    const statusRes = await adminClient.request('/api/admin/system-status');
    assert.strictEqual(statusRes.status, 200, 'System status should return 200');
    const sysData = statusRes.data;

    // Check database telemetry
    assert.strictEqual(sysData.database.status, 'connected', 'Database status must be connected');
    assert(typeof sysData.database.latencyMs === 'number', 'latencyMs must be a number');
    assert(sysData.database.version.includes('PostgreSQL'), 'Database version must report PostgreSQL');
    assert(typeof sysData.database.pool.total === 'number', 'pool.total must be a number');
    assert(typeof sysData.database.pool.idle === 'number', 'pool.idle must be a number');
    assert(typeof sysData.database.pool.waiting === 'number', 'pool.waiting must be a number');

    // Check server telemetry
    assert(typeof sysData.server.uptimeSeconds === 'number', 'uptimeSeconds must be a number');
    assert.strictEqual(sysData.server.nodeVersion, process.version, 'nodeVersion must match process.version');
    assert(typeof sysData.server.memoryMb.rss === 'number', 'memoryMb.rss must be a number');
    assert(typeof sysData.server.memoryMb.heapUsed === 'number', 'memoryMb.heapUsed must be a number');

    // Check session telemetry
    assert(typeof sysData.sessions.activeSessionsCount === 'number', 'activeSessionsCount must be a number');
    assert.strictEqual(sysData.sessions.currentSession.email, adminEmail, 'Session must reflect current admin email');
    assert.strictEqual(sysData.sessions.currentSession.role, 'admin', 'Session must reflect admin role');

    console.log(`  ✓ System telemetry verified: DB Latency = ${sysData.database.latencyMs}ms, PG Version = ${sysData.database.version}, Pool Total = ${sysData.database.pool.total}`);

    // ----------------------------------------------------
    // TEST SECTION 5: Password Change Workflow & Audit Log
    // ----------------------------------------------------
    console.log('\n[Test 5] Verifying Admin Password Change Workflow...');

    // 5.1 Reject weak password
    const weakPwRes = await adminClient.request('/api/auth/change-password', {
      method: 'POST',
      body: {
        currentPassword: adminPassword,
        newPassword: 'simple',
        confirmPassword: 'simple',
      },
    });
    assert.strictEqual(weakPwRes.status, 400, 'Weak password must be rejected');
    assert(weakPwRes.data.error.includes('8 characters'), 'Error should cite minimum length');

    // 5.2 Reject incorrect current password
    const wrongCurRes = await adminClient.request('/api/auth/change-password', {
      method: 'POST',
      body: {
        currentPassword: 'WrongPassword123!',
        newPassword: 'NewAdminPass2026@',
        confirmPassword: 'NewAdminPass2026@',
      },
    });
    assert.strictEqual(wrongCurRes.status, 400, 'Wrong current password must be rejected');
    assert(wrongCurRes.data.error.includes('does not match'), 'Error should cite mismatch with records');

    // 5.3 Reject identical new password
    const samePwRes = await adminClient.request('/api/auth/change-password', {
      method: 'POST',
      body: {
        currentPassword: adminPassword,
        newPassword: adminPassword,
        confirmPassword: adminPassword,
      },
    });
    assert.strictEqual(samePwRes.status, 400, 'Identical password must be rejected');
    assert(samePwRes.data.error.includes('different'), 'Error should cite requirement for new password');

    // 5.4 Successfully change password
    const newAdminPass = 'SuperSecureAdmin2026!';
    const validPwRes = await adminClient.request('/api/auth/change-password', {
      method: 'POST',
      body: {
        currentPassword: adminPassword,
        newPassword: newAdminPass,
        confirmPassword: newAdminPass,
      },
    });
    assert.strictEqual(validPwRes.status, 200, 'Valid password change should succeed');

    // Verify login with new password
    const newLoginClient = new SessionClient(server, port);
    const newLoginRes = await newLoginClient.request('/api/auth/signin', {
      method: 'POST',
      body: { email: adminEmail, password: newAdminPass },
    });
    assert.strictEqual(newLoginRes.status, 200, 'Login with newly set password must succeed');

    // Verify old password no longer works
    const oldLoginRes = await newLoginClient.request('/api/auth/signin', {
      method: 'POST',
      body: { email: adminEmail, password: adminPassword },
    });
    assert.strictEqual(oldLoginRes.status, 401, 'Login with old password must now fail');

    // Verify audit log record for ADMIN_PASSWORD_CHANGED
    const pwAuditRes = await query(
      `SELECT action, details FROM audit_logs WHERE action = 'ADMIN_PASSWORD_CHANGED' AND target_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [adminUserId]
    );
    assert(pwAuditRes.rows.length > 0, 'ADMIN_PASSWORD_CHANGED audit record must exist');
    console.log('  ✓ Password changed, authenticated, old password invalidated, audit log recorded');

    // Restore original admin password so other test suites don't break
    const restoreHash = await bcrypt.hash(adminPassword, 12);
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [restoreHash, adminUserId]);
    console.log('  ✓ Admin password safely restored to original seed state');

    console.log('\n====================================================');
    console.log('  ALL SPRINT 1 AUTOMATED TESTS PASSED SUCCESSFULLY! ✅');
    console.log('====================================================');
  } finally {
    server.close();
    await pool.end();
  }
}

runSprint1Verification().catch((err) => {
  console.error('\n❌ Sprint 1 Verification Failed:', err);
  process.exit(1);
});
