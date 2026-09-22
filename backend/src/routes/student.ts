import { Router, Response } from 'express';
import { query } from '../db/index.js';
import { requireAuth, requireRole, requireActive, AuthenticatedRequest } from '../middleware/auth.js';

export const studentRouter = Router();

// Base protection: All routes in this router require an authenticated, active student session.
studentRouter.use(requireAuth);
studentRouter.use(requireRole('student'));
studentRouter.use(requireActive);

// Middleware to ensure the student record is properly attached
studentRouter.use((req: AuthenticatedRequest, res: Response, next) => {
  if (!req.currentUser?.studentId) {
    res.status(403).json({
      error: 'Active student record not found for this user account.',
      code: 'STUDENT_RECORD_MISSING',
    });
    return;
  }
  next();
});

/**
 * GET /api/student/dashboard
 * Real authenticated database-backed composite dashboard payload
 */
studentRouter.get('/dashboard', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.currentUser!.studentId!;

    // 1. Resolve student and active enrollment details
    const studentQuery = `
      SELECT 
        s.id as student_id,
        s.full_name,
        u.email,
        u.account_status,
        e.id as enrollment_id,
        e.start_date as enrollment_start_date,
        e.status as enrollment_status,
        p.id as program_id,
        p.name as program_name,
        p.level as program_level,
        p.duration as program_duration,
        b.id as batch_id,
        b.name as batch_name,
        b.schedule as batch_schedule,
        b.start_date as batch_start_date,
        t.id as teacher_id,
        t.full_name as teacher_name,
        t.qualification as teacher_qualification,
        t.specialization as teacher_specialization
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN enrollments e ON s.id = e.student_id AND e.status = 'active'
      LEFT JOIN programs p ON e.program_id = p.id
      LEFT JOIN batches b ON e.batch_id = b.id
      LEFT JOIN teachers t ON e.teacher_id = t.id
      WHERE s.id = $1
    `;
    const studentRes = await query(studentQuery, [studentId]);

    if (studentRes.rows.length === 0) {
      res.status(404).json({ error: 'Student record not found.' });
      return;
    }

    const row = studentRes.rows[0];

    const student = {
      id: row.student_id,
      fullName: row.full_name,
      email: row.email,
      accountStatus: row.account_status,
    };

    let enrollment: { id: string; startDate: string; status: string } | null = null;
    let program: { id: string; name: string; level: string; duration: string } | null = null;
    let batch: { id: string; name: string; schedule: string; startDate: string } | null = null;
    let teacher: { id: string; name: string; qualification: string; specialization: string } | null = null;

    if (row.enrollment_id) {
      enrollment = {
        id: row.enrollment_id,
        startDate: row.enrollment_start_date,
        status: row.enrollment_status,
      };
      if (row.program_id) {
        program = {
          id: row.program_id,
          name: row.program_name,
          level: row.program_level,
          duration: row.program_duration,
        };
      }
      if (row.batch_id) {
        batch = {
          id: row.batch_id,
          name: row.batch_name,
          schedule: row.batch_schedule,
          startDate: row.batch_start_date,
        };
      }
      if (row.teacher_id) {
        teacher = {
          id: row.teacher_id,
          name: row.teacher_name,
          qualification: row.teacher_qualification,
          specialization: row.teacher_specialization,
        };
      }
    }

    // 2. Attendance Summary
    let totalSessions = 0;
    let present = 0;
    let absent = 0;
    let late = 0;
    let excused = 0;
    let attendanceRate: number | null = null;

    if (row.enrollment_id) {
      const attRes = await query(
        `SELECT 
           COUNT(*)::int as total_sessions,
           COUNT(CASE WHEN status = 'present' THEN 1 END)::int as present,
           COUNT(CASE WHEN status = 'absent' THEN 1 END)::int as absent,
           COUNT(CASE WHEN status = 'late' THEN 1 END)::int as late,
           COUNT(CASE WHEN status = 'excused' THEN 1 END)::int as excused
         FROM attendance_records
         WHERE enrollment_id = $1`,
        [row.enrollment_id]
      );
      if (attRes.rows.length > 0) {
        totalSessions = attRes.rows[0].total_sessions || 0;
        present = attRes.rows[0].present || 0;
        absent = attRes.rows[0].absent || 0;
        late = attRes.rows[0].late || 0;
        excused = attRes.rows[0].excused || 0;

        if (totalSessions > 0) {
          attendanceRate = Math.round(((present + late) / totalSessions) * 1000) / 10;
        }
      }
    }

    const attendanceSummary = {
      totalSessions,
      present,
      absent,
      late,
      excused,
      attendanceRate,
    };

    // 3. Academic Summary
    let totalAssessments = 0;
    if (row.program_id) {
      const assessCountRes = await query(
        `SELECT COUNT(DISTINCT a.id)::int as count
         FROM assessments a
         WHERE a.program_id = $1 AND (a.batch_id = $2 OR a.batch_id IS NULL)`,
        [row.program_id, row.batch_id || null]
      );
      totalAssessments = assessCountRes.rows[0]?.count || 0;
    }

    const resultsRes = await query(
      `SELECT 
         ar.score,
         ar.remarks,
         ar.created_at,
         a.title,
         a.max_score
       FROM assessment_results ar
       JOIN assessments a ON ar.assessment_id = a.id
       WHERE ar.student_id = $1
       ORDER BY ar.created_at DESC`,
      [studentId]
    );

    const completedAssessments = resultsRes.rows.length;
    let latestAssessment: {
      title: string;
      score: number;
      maxScore: number;
      percentage: number;
      date: string;
      remarks: string | null;
    } | null = null;

    if (resultsRes.rows.length > 0) {
      const latest = resultsRes.rows[0];
      const maxScore = Number(latest.max_score) || 100;
      const score = Number(latest.score) || 0;
      latestAssessment = {
        title: latest.title,
        score,
        maxScore,
        percentage: Math.round((score / maxScore) * 100),
        date: latest.created_at,
        remarks: latest.remarks || null,
      };
    }

    const academicSummary = {
      totalAssessments,
      completedAssessments,
      latestAssessment,
    };

    // 4. Recent Feedback (latest 3 notes)
    const notesRes = await query(
      `SELECT 
         tn.id,
         tn.note_type,
         tn.content,
         tn.created_at,
         t.full_name as teacher_name
       FROM teacher_notes tn
       JOIN teachers t ON tn.teacher_id = t.id
       WHERE tn.student_id = $1
       ORDER BY tn.created_at DESC
       LIMIT 3`,
      [studentId]
    );

    const recentFeedback = notesRes.rows.map((n) => ({
      id: n.id,
      teacherName: n.teacher_name,
      noteType: n.note_type,
      content: n.content,
      createdDate: n.created_at,
    }));

    res.json({
      student,
      enrollment,
      program,
      batch,
      teacher,
      attendanceSummary,
      academicSummary,
      recentFeedback,
    });
  } catch (err) {
    console.error('[Student API] Dashboard error:', err);
    res.status(500).json({ error: 'Failed to retrieve student dashboard.' });
  }
});

/**
 * GET /api/student/program
 * Foundation stub for Phase 2B.3
 */
studentRouter.get('/program', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  res.json({
    status: 'ready',
    stage: 'Phase 2B.1 Foundation',
    message: 'Program curriculum API foundation is initialized. Full enrollment details will be implemented in Phase 2B.3.',
  });
});

/**
 * GET /api/student/attendance
 * Foundation stub for Phase 2B.4
 */
studentRouter.get('/attendance', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  res.json({
    status: 'ready',
    stage: 'Phase 2B.1 Foundation',
    records: [],
    message: 'Attendance API foundation is initialized. Full session history will be implemented in Phase 2B.4.',
  });
});

/**
 * GET /api/student/assessments
 * Foundation stub for Phase 2B.5
 */
studentRouter.get('/assessments', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  res.json({
    status: 'ready',
    stage: 'Phase 2B.1 Foundation',
    records: [],
    message: 'Assessments API foundation is initialized. Assessment results will be implemented in Phase 2B.5.',
  });
});

/**
 * GET /api/student/progress
 * Foundation stub for Phase 2B.6
 */
studentRouter.get('/progress', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  res.json({
    status: 'ready',
    stage: 'Phase 2B.1 Foundation',
    message: 'Academic progress API foundation is initialized. Progress calculation will be implemented in Phase 2B.6.',
  });
});

/**
 * GET /api/student/feedback
 * Foundation stub for Phase 2B.7
 */
studentRouter.get('/feedback', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  res.json({
    status: 'ready',
    stage: 'Phase 2B.1 Foundation',
    records: [],
    message: 'Teacher feedback API foundation is initialized. Feedback records will be implemented in Phase 2B.7.',
  });
});

/**
 * GET /api/student/documents
 * Foundation stub for Phase 2B.9
 */
studentRouter.get('/documents', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  res.json({
    status: 'ready',
    stage: 'Phase 2B.1 Foundation',
    records: [],
    message: 'Student documents API foundation is initialized. Document records will be implemented in Phase 2B.9.',
  });
});

/**
 * GET /api/student/profile
 * Foundation stub for Phase 2B.8
 */
studentRouter.get('/profile', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  res.json({
    status: 'ready',
    stage: 'Phase 2B.1 Foundation',
    message: 'Student profile API foundation is initialized. Profile data will be implemented in Phase 2B.8.',
  });
});

/**
 * PATCH /api/student/profile
 * Foundation stub for Phase 2B.8
 */
studentRouter.patch('/profile', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  res.status(501).json({
    error: 'Profile update mutation will be activated in Phase 2B.8.',
  });
});
