import assert from 'assert';
import app from '../app.js';
import { pool, query } from '../db/index.js';
import dotenv from 'dotenv';
import http from 'http';

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

    return { status: response.status, data: json };
  }
}

async function runStudentFoundationTests() {
  console.log('========================================================');
  console.log('[Test] Starting Phase 2B.1 Student Foundation Tests...');
  console.log('========================================================');

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;
  console.log(`[Test] Server listening on port ${port}`);

  try {
    // 1. Unauthenticated access test
    console.log('[Test] 1. Testing unauthenticated access to /api/student/dashboard...');
    const unauthClient = new SessionClient(server, port);
    const unauthRes = await unauthClient.request('/api/student/dashboard');
    assert.strictEqual(unauthRes.status, 401, `Expected 401 for unauthenticated student API, got ${unauthRes.status}`);
    console.log('✓ Unauthenticated request rejected with 401 Unauthorized');

    // 2. Admin access test
    console.log('[Test] 2. Testing Admin attempting to access /api/student/dashboard...');
    const adminClient = new SessionClient(server, port);
    const adminLoginRes = await adminClient.request('/api/auth/signin', {
      method: 'POST',
      body: {
        email: 'admin@evolve.edu',
        password: process.env.ADMIN_PASSWORD || 'EvolveAdmin2026!Secure',
      },
    });
    assert.strictEqual(adminLoginRes.status, 200, 'Admin login should return 200');

    const adminStudentRes = await adminClient.request('/api/student/dashboard');
    assert.strictEqual(adminStudentRes.status, 403, `Expected 403 for Admin accessing student API, got ${adminStudentRes.status}`);
    console.log('✓ Admin access to student API correctly forbidden with 403');

    // 3. Active Student access test
    console.log('[Test] 3. Testing Active Student authentication and student API endpoints...');
    const studentClient = new SessionClient(server, port);
    const studentLoginRes = await studentClient.request('/api/auth/signin', {
      method: 'POST',
      body: {
        email: 'applicant.test@example.com',
        password: 'Password123!',
      },
    });
    assert.strictEqual(studentLoginRes.status, 200, 'Student login should return 200');

    // Test each foundation endpoint
    const endpoints = [
      '/api/student/dashboard',
      '/api/student/program',
      '/api/student/attendance',
      '/api/student/assessments',
      '/api/student/progress',
      '/api/student/feedback',
      '/api/student/documents',
      '/api/student/profile',
    ];

    for (const ep of endpoints) {
      const res = await studentClient.request(ep);
      assert.strictEqual(res.status, 200, `Endpoint ${ep} returned status ${res.status}, expected 200`);
      if (ep === '/api/student/dashboard') {
        assert(res.data.student, 'Dashboard should return student object');
      } else {
        assert.strictEqual(res.data.status, 'ready', `Endpoint ${ep} should have status: 'ready'`);
      }
    }
    console.log(`✓ All ${endpoints.length} student foundation endpoints returned 200 OK`);

    // 4. Test Student Ownership Invariant (query spoofing)
    console.log('[Test] 4. Testing student ID query spoofing...');
    const spoofRes = await studentClient.request('/api/student/dashboard?studentId=00000000-0000-0000-0000-000000000000');
    assert.strictEqual(spoofRes.status, 200);
    const returnedStudentId = spoofRes.data.student?.id || spoofRes.data.studentId;
    assert.notStrictEqual(
      returnedStudentId,
      '00000000-0000-0000-0000-000000000000',
      'Security violation: Server trusted spoofed query parameter studentId!'
    );
    console.log(`✓ Query spoofing ignored. Server strictly derived studentId (${returnedStudentId}) from session.`);

    // 5. Test PATCH /api/student/profile returns 501 stub
    console.log('[Test] 5. Testing PATCH /api/student/profile...');
    const patchRes = await studentClient.request('/api/student/profile', {
      method: 'PATCH',
      body: { phone: '123' },
    });
    assert.strictEqual(patchRes.status, 501, `Expected 501 for PATCH /api/student/profile, got ${patchRes.status}`);
    console.log('✓ Mutation endpoint returned 501 Not Implemented (scheduled for Phase 2B.8)');

    console.log('========================================================');
    console.log('[Test] ALL PHASE 2B.1 STUDENT FOUNDATION TESTS PASSED!');
    console.log('========================================================');
    process.exit(0);
  } finally {
    server.close();
    await pool.end();
  }
}

runStudentFoundationTests().catch((err) => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
