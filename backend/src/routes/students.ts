import { Router, Response } from 'express';
import { query } from '../db/index.js';
import { requireAuth, requireRole, AuthenticatedRequest } from '../middleware/auth.js';

export const studentsRouter = Router();

// GET /api/students - Admin: List Students with Filters
studentsRouter.get(
  '/',
  requireAuth,
  requireRole(['admin', 'teacher']),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const search = ((req.query.search as string) || '').trim();
      const programId = req.query.programId as string;
      const batchId = req.query.batchId as string;
      const teacherId = req.query.teacherId as string;
      const status = req.query.status as string;

      let queryText = `
        SELECT 
          s.id,
          s.full_name,
          s.date_of_birth,
          s.guardian_name,
          s.guardian_phone,
          s.guardian_email,
          s.status as student_status,
          s.created_at,
          u.email as account_email,
          u.account_status,
          e.id as active_enrollment_id,
          p.name as program_name,
          p.id as program_id,
          b.name as batch_name,
          b.id as batch_id,
          t.full_name as teacher_name,
          t.id as teacher_id
        FROM students s
        JOIN users u ON s.user_id = u.id
        LEFT JOIN enrollments e ON s.id = e.student_id AND e.status = 'active'
        LEFT JOIN programs p ON e.program_id = p.id
        LEFT JOIN batches b ON e.batch_id = b.id
        LEFT JOIN teachers t ON e.teacher_id = t.id
        WHERE 1=1
      `;
      const params: any[] = [];

      // If teacher role, only view assigned students
      if (req.currentUser?.role === 'teacher' && req.currentUser.teacherId) {
        params.push(req.currentUser.teacherId);
        queryText += ` AND e.teacher_id = $${params.length}`;
      } else if (teacherId) {
        params.push(teacherId);
        queryText += ` AND e.teacher_id = $${params.length}`;
      }

      if (programId) {
        params.push(programId);
        queryText += ` AND e.program_id = $${params.length}`;
      }

      if (batchId) {
        params.push(batchId);
        queryText += ` AND e.batch_id = $${params.length}`;
      }

      if (status && status !== 'all') {
        params.push(status);
        queryText += ` AND s.status = $${params.length}`;
      }

      if (search) {
        params.push(`%${search}%`);
        const idx = params.length;
        queryText += ` AND (s.full_name ILIKE $${idx} OR s.guardian_name ILIKE $${idx} OR u.email ILIKE $${idx})`;
      }

      queryText += ' ORDER BY s.full_name ASC';

      const result = await query(queryText, params);
      res.json({ students: result.rows });
    } catch (err) {
      console.error('[Students API] List error:', err);
      res.status(500).json({ error: 'Failed to retrieve students.' });
    }
  }
);

// GET /api/students/:id - Admin: Detailed Student Record
studentsRouter.get(
  '/:id',
  requireAuth,
  requireRole(['admin', 'teacher']),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const studentRes = await query(
        `SELECT 
          s.*,
          u.email as account_email,
          u.account_status,
          u.last_login_at
        FROM students s
        JOIN users u ON s.user_id = u.id
        WHERE s.id = $1`,
        [id]
      );

      if (studentRes.rows.length === 0) {
        res.status(404).json({ error: 'Student not found.' });
        return;
      }

      const student = studentRes.rows[0];

      // If teacher role, verify teacher is assigned to this student
      if (req.currentUser?.role === 'teacher' && req.currentUser.teacherId) {
        const assignedCheck = await query(
          `SELECT id FROM enrollments WHERE student_id = $1 AND teacher_id = $2`,
          [id, req.currentUser.teacherId]
        );
        if (assignedCheck.rows.length === 0) {
          res.status(403).json({ error: 'Forbidden: You are not assigned to this student.' });
          return;
        }
      }

      // Fetch active and past enrollments
      const enrollmentsRes = await query(
        `SELECT 
          e.*,
          p.name as program_name,
          b.name as batch_name,
          b.schedule as batch_schedule,
          t.full_name as teacher_name
        FROM enrollments e
        JOIN programs p ON e.program_id = p.id
        JOIN batches b ON e.batch_id = b.id
        JOIN teachers t ON e.teacher_id = t.id
        WHERE e.student_id = $1
        ORDER BY e.start_date DESC`,
        [id]
      );

      // Fetch academic overview placeholders from DB
      const attendanceCount = await query(
        `SELECT COUNT(*)::int as total_sessions,
                COUNT(CASE WHEN status = 'present' THEN 1 END)::int as present_sessions
         FROM attendance_records ar
         JOIN enrollments e ON ar.enrollment_id = e.id
         WHERE e.student_id = $1`,
        [id]
      );

      const assessmentsRes = await query(
        `SELECT ar.score, a.title, a.max_score, ar.created_at
         FROM assessment_results ar
         JOIN assessments a ON ar.assessment_id = a.id
         WHERE ar.student_id = $1
         ORDER BY ar.created_at DESC LIMIT 5`,
        [id]
      );

      res.json({
        student,
        enrollments: enrollmentsRes.rows,
        currentEnrollment: enrollmentsRes.rows.find((e) => e.status === 'active') || null,
        academicOverview: {
          attendance: attendanceCount.rows[0] || { total_sessions: 0, present_sessions: 0 },
          recentAssessments: assessmentsRes.rows,
          notesPlaceholder: 'Academic evaluations and teacher feedback records will appear here as sessions progress.',
        },
      });
    } catch (err) {
      console.error('[Students API] Detail error:', err);
      res.status(500).json({ error: 'Failed to retrieve student record.' });
    }
  }
);
