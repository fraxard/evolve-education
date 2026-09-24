import { Router, Response } from 'express';
import { z } from 'zod';
import { query } from '../db/index.js';
import { requireAuth, requireRole, requireActive, AuthenticatedRequest } from '../middleware/auth.js';

export const teacherRouter = Router();

// Apply auth and teacher role requirement to all /api/teacher routes
teacherRouter.use(requireAuth);
teacherRouter.use(requireRole('teacher'));
teacherRouter.use(requireActive);

// Helper middleware to assert teacherId resolution
function requireTeacherIdentity(req: AuthenticatedRequest, res: Response, next: () => void): void {
  if (!req.currentUser?.teacherId) {
    res.status(403).json({ error: 'Access restricted: No linked teacher profile found for this account.' });
    return;
  }
  next();
}

teacherRouter.use(requireTeacherIdentity);

const uuidParamSchema = z.string().uuid('Invalid resource identifier format.');

// =============================================================================
// 1. GET /api/teacher/dashboard - Summary telemetry for authenticated teacher
// =============================================================================
teacherRouter.get('/dashboard', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const teacherId = req.currentUser!.teacherId!;

    // Query 1: Active batches count & details
    const batchesRes = await query(
      `SELECT 
        b.id,
        b.name,
        b.level,
        b.schedule,
        b.capacity,
        b.is_active,
        p.name as program_name,
        COUNT(DISTINCT e.student_id)::int as enrolled_student_count
      FROM batches b
      JOIN programs p ON b.program_id = p.id
      LEFT JOIN enrollments e ON e.batch_id = b.id AND e.status = 'active'
      WHERE b.teacher_id = $1
      GROUP BY b.id, p.name
      ORDER BY b.is_active DESC, b.name ASC`,
      [teacherId]
    );

    // Query 2: Active distinct students count
    const studentCountRes = await query(
      `SELECT COUNT(DISTINCT e.student_id)::int as active_student_count
       FROM enrollments e
       JOIN batches b ON e.batch_id = b.id
       WHERE b.teacher_id = $1 AND e.status = 'active'`,
      [teacherId]
    );

    const activeBatchCount = batchesRes.rows.filter((b) => b.is_active).length;
    const totalStudentCount = studentCountRes.rows[0]?.active_student_count || 0;

    res.json({
      teacher: {
        id: teacherId,
        fullName: req.currentUser!.fullName,
        email: req.currentUser!.email,
      },
      metrics: {
        activeBatchCount,
        totalBatchCount: batchesRes.rows.length,
        activeStudentCount: totalStudentCount,
      },
      batches: batchesRes.rows,
    });
  } catch (err) {
    console.error('[Teacher API] Dashboard error:', err);
    res.status(500).json({ error: 'Failed to retrieve teacher dashboard metrics.' });
  }
});

// =============================================================================
// 2. GET /api/teacher/batches - List only batches assigned to authenticated teacher
// =============================================================================
teacherRouter.get('/batches', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const teacherId = req.currentUser!.teacherId!;

    const result = await query(
      `SELECT 
        b.id,
        b.name,
        b.level,
        b.schedule,
        b.start_date,
        b.end_date,
        b.capacity,
        b.is_active,
        p.id as program_id,
        p.name as program_name,
        COUNT(DISTINCT e.student_id)::int as enrolled_student_count
      FROM batches b
      JOIN programs p ON b.program_id = p.id
      LEFT JOIN enrollments e ON e.batch_id = b.id AND e.status = 'active'
      WHERE b.teacher_id = $1
      GROUP BY b.id, p.id, p.name
      ORDER BY b.is_active DESC, b.name ASC`,
      [teacherId]
    );

    res.json({ batches: result.rows });
  } catch (err) {
    console.error('[Teacher API] List batches error:', err);
    res.status(500).json({ error: 'Failed to retrieve assigned batches.' });
  }
});

// =============================================================================
// 3. GET /api/teacher/batches/:batchId - Batch details (enforces ownership)
// =============================================================================
teacherRouter.get('/batches/:batchId', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parseResult = uuidParamSchema.safeParse(req.params.batchId);
    if (!parseResult.success) {
      res.status(400).json({ error: 'Invalid batch identifier.' });
      return;
    }
    const batchId = parseResult.data;
    const teacherId = req.currentUser!.teacherId!;

    // 1. Check if batch exists at all
    const existsRes = await query('SELECT id, teacher_id FROM batches WHERE id = $1', [batchId]);
    if (existsRes.rows.length === 0) {
      res.status(404).json({ error: 'Batch not found.' });
      return;
    }

    // 2. Enforce teacher ownership
    const batchRow = existsRes.rows[0];
    if (batchRow.teacher_id !== teacherId) {
      res.status(403).json({ error: 'Forbidden: You are not assigned to instruct this batch.' });
      return;
    }

    // 3. Query batch info + program
    const batchDetailRes = await query(
      `SELECT 
        b.id,
        b.name,
        b.level,
        b.schedule,
        b.start_date,
        b.end_date,
        b.capacity,
        b.is_active,
        b.created_at,
        p.id as program_id,
        p.name as program_name,
        p.description as program_description,
        p.level as program_level,
        t.full_name as teacher_name
      FROM batches b
      JOIN programs p ON b.program_id = p.id
      JOIN teachers t ON b.teacher_id = t.id
      WHERE b.id = $1 AND b.teacher_id = $2`,
      [batchId, teacherId]
    );

    // 4. Query active roster
    const rosterRes = await query(
      `SELECT 
        s.id,
        s.full_name,
        u.email as account_email,
        s.guardian_name,
        s.guardian_phone,
        s.guardian_email,
        e.id as enrollment_id,
        e.start_date as enrollment_date,
        e.status as enrollment_status
      FROM enrollments e
      JOIN students s ON e.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE e.batch_id = $1 AND e.status = 'active'
      ORDER BY s.full_name ASC`,
      [batchId]
    );

    res.json({
      batch: batchDetailRes.rows[0],
      enrolledCount: rosterRes.rows.length,
      roster: rosterRes.rows,
    });
  } catch (err) {
    console.error('[Teacher API] Batch detail error:', err);
    res.status(500).json({ error: 'Failed to retrieve batch details.' });
  }
});

// =============================================================================
// 4. GET /api/teacher/batches/:batchId/students - Batch roster (enforces ownership)
// =============================================================================
teacherRouter.get('/batches/:batchId/students', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parseResult = uuidParamSchema.safeParse(req.params.batchId);
    if (!parseResult.success) {
      res.status(400).json({ error: 'Invalid batch identifier.' });
      return;
    }
    const batchId = parseResult.data;
    const teacherId = req.currentUser!.teacherId!;

    // Check batch existence and ownership
    const existsRes = await query('SELECT id, teacher_id FROM batches WHERE id = $1', [batchId]);
    if (existsRes.rows.length === 0) {
      res.status(404).json({ error: 'Batch not found.' });
      return;
    }
    if (existsRes.rows[0].teacher_id !== teacherId) {
      res.status(403).json({ error: 'Forbidden: You are not assigned to instruct this batch.' });
      return;
    }

    const rosterRes = await query(
      `SELECT 
        s.id,
        s.full_name,
        u.email as account_email,
        s.guardian_name,
        s.guardian_phone,
        s.guardian_email,
        e.id as enrollment_id,
        e.start_date as enrollment_date,
        e.status as enrollment_status
      FROM enrollments e
      JOIN students s ON e.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE e.batch_id = $1 AND e.status = 'active'
      ORDER BY s.full_name ASC`,
      [batchId]
    );

    res.json({ students: rosterRes.rows });
  } catch (err) {
    console.error('[Teacher API] Batch roster error:', err);
    res.status(500).json({ error: 'Failed to retrieve batch roster.' });
  }
});

// =============================================================================
// 5. GET /api/teacher/students - All distinct students enrolled in teacher's batches
// =============================================================================
teacherRouter.get('/students', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const teacherId = req.currentUser!.teacherId!;

    const result = await query(
      `SELECT 
        s.id,
        s.full_name,
        u.email as account_email,
        s.guardian_name,
        s.guardian_phone,
        s.guardian_email,
        s.status as student_status,
        b.id as batch_id,
        b.name as batch_name,
        p.id as program_id,
        p.name as program_name,
        e.id as enrollment_id,
        e.start_date as enrollment_date
      FROM enrollments e
      JOIN students s ON e.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN batches b ON e.batch_id = b.id
      JOIN programs p ON e.program_id = p.id
      WHERE b.teacher_id = $1 AND e.status = 'active'
      ORDER BY s.full_name ASC`,
      [teacherId]
    );

    res.json({ students: result.rows });
  } catch (err) {
    console.error('[Teacher API] List students error:', err);
    res.status(500).json({ error: 'Failed to retrieve assigned students.' });
  }
});

// =============================================================================
// 6. GET /api/teacher/students/:studentId - Student detail (enforces active enrollment with teacher)
// =============================================================================
teacherRouter.get('/students/:studentId', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parseResult = uuidParamSchema.safeParse(req.params.studentId);
    if (!parseResult.success) {
      res.status(400).json({ error: 'Invalid student identifier.' });
      return;
    }
    const studentId = parseResult.data;
    const teacherId = req.currentUser!.teacherId!;

    // 1. Check if student exists at all
    const studentCheck = await query('SELECT id FROM students WHERE id = $1', [studentId]);
    if (studentCheck.rows.length === 0) {
      res.status(404).json({ error: 'Student not found.' });
      return;
    }

    // 2. Verify student is actively enrolled in at least one batch assigned to this teacher
    const authorizedEnrollments = await query(
      `SELECT 
        e.id as enrollment_id,
        e.start_date as enrollment_date,
        e.status as enrollment_status,
        b.id as batch_id,
        b.name as batch_name,
        b.schedule as batch_schedule,
        b.level as batch_level,
        p.id as program_id,
        p.name as program_name
      FROM enrollments e
      JOIN batches b ON e.batch_id = b.id
      JOIN programs p ON e.program_id = p.id
      WHERE e.student_id = $1 AND b.teacher_id = $2 AND e.status = 'active'`,
      [studentId, teacherId]
    );

    if (authorizedEnrollments.rows.length === 0) {
      res.status(403).json({ error: 'Forbidden: You do not have an active teaching assignment with this student.' });
      return;
    }

    // 3. Fetch safe student profile fields appropriate for teacher access
    const studentDetailRes = await query(
      `SELECT 
        s.id,
        s.full_name,
        s.date_of_birth,
        s.gender,
        s.guardian_name,
        s.guardian_phone,
        s.guardian_email,
        s.address,
        s.school_name,
        s.current_grade,
        s.status as student_status,
        s.created_at as student_since,
        u.email as account_email
      FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = $1`,
      [studentId]
    );

    res.json({
      student: studentDetailRes.rows[0],
      enrollments: authorizedEnrollments.rows,
    });
  } catch (err) {
    console.error('[Teacher API] Student detail error:', err);
    res.status(500).json({ error: 'Failed to retrieve student details.' });
  }
});
