import { Router, Response } from 'express';
import { z } from 'zod';
import { query, withTransaction } from '../db/index.js';
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
                COUNT(CASE WHEN ar.status = 'present' THEN 1 END)::int as present_sessions
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

const transferSchema = z.object({
  targetProgramId: z.string().uuid('Valid target Program ID is required'),
  targetBatchId: z.string().uuid('Valid target Batch ID is required'),
  targetTeacherId: z.string().uuid('Valid target Teacher ID is required'),
  reason: z.string().min(3, 'Transfer rationale (minimum 3 characters) is required').max(500),
  effectiveDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid Date (YYYY-MM-DD) is required').optional(),
});

// POST /api/students/:id/transfer - Admin: Transfer Student Cohort (Preserves History)
studentsRouter.post(
  '/:id/transfer',
  requireAuth,
  requireRole('admin'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const parseResult = transferSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          error: 'Validation failed',
          details: parseResult.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
        });
        return;
      }

      const { targetProgramId, targetBatchId, targetTeacherId, reason, effectiveDate } = parseResult.data;
      const adminId = req.currentUser!.id;

      const result = await withTransaction(async (client) => {
        // 1. Lock student row
        const studentRes = await client.query(
          `SELECT s.*, u.email as account_email
           FROM students s
           JOIN users u ON s.user_id = u.id
           WHERE s.id = $1 FOR UPDATE`,
          [id]
        );
        if (studentRes.rows.length === 0) {
          throw { status: 404, message: 'Student not found.' };
        }
        const student = studentRes.rows[0];

        if (student.status !== 'active') {
          throw {
            status: 400,
            message: `Cannot transfer student in '${student.status}' status. Student must be active.`,
          };
        }

        // 2. Validate target program
        const programRes = await client.query(
          'SELECT id, name, is_active FROM programs WHERE id = $1',
          [targetProgramId]
        );
        if (programRes.rows.length === 0 || !programRes.rows[0].is_active) {
          throw { status: 400, message: 'Target program is inactive or does not exist.' };
        }
        const targetProgram = programRes.rows[0];

        // 3. Lock target batch and check capacity
        const batchRes = await client.query(
          'SELECT id, name, program_id, capacity, is_active FROM batches WHERE id = $1 FOR UPDATE',
          [targetBatchId]
        );
        if (batchRes.rows.length === 0 || !batchRes.rows[0].is_active) {
          throw { status: 400, message: 'Target cohort batch is inactive or does not exist.' };
        }
        const targetBatch = batchRes.rows[0];

        if (targetBatch.program_id !== targetProgramId) {
          throw { status: 400, message: 'Target batch does not belong to the selected target program.' };
        }

        const activeCountRes = await client.query(
          `SELECT COUNT(*)::int as count FROM enrollments WHERE batch_id = $1 AND status = 'active'`,
          [targetBatchId]
        );
        const currentActiveSeats = activeCountRes.rows[0].count;
        if (currentActiveSeats >= targetBatch.capacity) {
          throw {
            status: 400,
            message: `Target cohort '${targetBatch.name}' is at full capacity (${currentActiveSeats}/${targetBatch.capacity}).`,
          };
        }

        // 4. Validate target teacher
        const teacherRes = await client.query(
          'SELECT id, full_name, status FROM teachers WHERE id = $1',
          [targetTeacherId]
        );
        if (teacherRes.rows.length === 0 || teacherRes.rows[0].status !== 'active') {
          throw { status: 400, message: 'Target supervising teacher is inactive or does not exist.' };
        }
        const targetTeacher = teacherRes.rows[0];

        // 5. Lock and close current active enrollment
        const currentEnrollmentRes = await client.query(
          `SELECT e.*, b.name as batch_name, p.name as program_name, t.full_name as teacher_name
           FROM enrollments e
           JOIN batches b ON e.batch_id = b.id
           JOIN programs p ON e.program_id = p.id
           JOIN teachers t ON e.teacher_id = t.id
           WHERE e.student_id = $1 AND e.status = 'active'
           FOR UPDATE`,
          [id]
        );

        let previousEnrollmentInfo = null;
        if (currentEnrollmentRes.rows.length > 0) {
          const currentEnr = currentEnrollmentRes.rows[0];
          if (currentEnr.batch_id === targetBatchId) {
            throw { status: 400, message: `Student is already actively enrolled in cohort '${targetBatch.name}'.` };
          }

          await client.query(
            `UPDATE enrollments
             SET status = 'transferred', updated_at = NOW()
             WHERE id = $1`,
            [currentEnr.id]
          );

          previousEnrollmentInfo = {
            enrollmentId: currentEnr.id,
            batchId: currentEnr.batch_id,
            batchName: currentEnr.batch_name,
            programName: currentEnr.program_name,
            teacherName: currentEnr.teacher_name,
          };
        }

        // 6. Create new active enrollment
        const startDate = effectiveDate || new Date().toISOString().split('T')[0];
        const newEnrollmentRes = await client.query(
          `INSERT INTO enrollments (student_id, program_id, batch_id, teacher_id, start_date, status)
           VALUES ($1, $2, $3, $4, $5, 'active')
           RETURNING id;`,
          [id, targetProgramId, targetBatchId, targetTeacherId, startDate]
        );
        const newEnrollmentId = newEnrollmentRes.rows[0].id;

        // 7. Audit log entry
        await client.query(
          `INSERT INTO audit_logs (actor_id, actor_role, action, target_entity, target_id, details, ip_address)
           VALUES ($1, 'admin', 'STUDENT_TRANSFERRED', 'students', $2, $3, $4);`,
          [
            adminId,
            id,
            JSON.stringify({
              studentName: student.full_name,
              reason,
              previousEnrollment: previousEnrollmentInfo,
              newEnrollment: {
                enrollmentId: newEnrollmentId,
                programName: targetProgram.name,
                batchName: targetBatch.name,
                teacherName: targetTeacher.full_name,
              },
            }),
            req.ip || null,
          ]
        );

        return {
          newEnrollmentId,
          programName: targetProgram.name,
          batchName: targetBatch.name,
          teacherName: targetTeacher.full_name,
        };
      });

      res.json({
        message: 'Student transferred successfully.',
        transfer: result,
      });
    } catch (err: any) {
      if (err.status) {
        res.status(err.status).json({ error: err.message });
        return;
      }
      console.error('[Students API] Transfer error:', err);
      res.status(500).json({ error: 'Failed to execute student transfer.' });
    }
  }
);

const statusActionSchema = z.object({
  action: z.enum(['suspend', 'withdraw', 'graduate', 'activate']),
  reason: z.string().max(500).optional(),
});

// POST /api/students/:id/status - Admin: Explicit Student Lifecycle Action
studentsRouter.post(
  '/:id/status',
  requireAuth,
  requireRole('admin'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const parseResult = statusActionSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          error: 'Validation failed',
          details: parseResult.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
        });
        return;
      }

      const { action, reason } = parseResult.data;
      const adminId = req.currentUser!.id;

      if (['suspend', 'withdraw'].includes(action) && (!reason || reason.trim().length < 3)) {
        res.status(400).json({ error: `A formal rationale (minimum 3 characters) is required to ${action} a student.` });
        return;
      }

      const result = await withTransaction(async (client) => {
        // Lock student
        const studentRes = await client.query(
          'SELECT id, user_id, full_name, status FROM students WHERE id = $1 FOR UPDATE',
          [id]
        );
        if (studentRes.rows.length === 0) {
          throw { status: 404, message: 'Student not found.' };
        }
        const student = studentRes.rows[0];

        let targetStudentStatus = 'active';
        let targetUserStatus = 'active';
        let auditAction = 'STUDENT_REACTIVATED';

        if (action === 'suspend') {
          targetStudentStatus = 'suspended';
          targetUserStatus = 'inactive';
          auditAction = 'STUDENT_SUSPENDED';

          await client.query('UPDATE students SET status = $1, updated_at = NOW() WHERE id = $2', [
            targetStudentStatus,
            id,
          ]);
          await client.query('UPDATE users SET account_status = $1, updated_at = NOW() WHERE id = $2', [
            targetUserStatus,
            student.user_id,
          ]);
        } else if (action === 'withdraw') {
          targetStudentStatus = 'inactive';
          targetUserStatus = 'inactive';
          auditAction = 'STUDENT_WITHDRAWN';

          await client.query('UPDATE students SET status = $1, updated_at = NOW() WHERE id = $2', [
            targetStudentStatus,
            id,
          ]);
          await client.query('UPDATE users SET account_status = $1, updated_at = NOW() WHERE id = $2', [
            targetUserStatus,
            student.user_id,
          ]);
          // Close active enrollments
          await client.query(
            "UPDATE enrollments SET status = 'withdrawn', updated_at = NOW() WHERE student_id = $1 AND status = 'active'",
            [id]
          );
        } else if (action === 'graduate') {
          targetStudentStatus = 'graduated';
          targetUserStatus = 'active';
          auditAction = 'STUDENT_GRADUATED';

          await client.query('UPDATE students SET status = $1, updated_at = NOW() WHERE id = $2', [
            targetStudentStatus,
            id,
          ]);
          await client.query('UPDATE users SET account_status = $1, updated_at = NOW() WHERE id = $2', [
            targetUserStatus,
            student.user_id,
          ]);
          // Complete active enrollments
          await client.query(
            "UPDATE enrollments SET status = 'completed', updated_at = NOW() WHERE student_id = $1 AND status = 'active'",
            [id]
          );
        } else if (action === 'activate') {
          targetStudentStatus = 'active';
          targetUserStatus = 'active';
          auditAction = 'STUDENT_REACTIVATED';

          await client.query('UPDATE students SET status = $1, updated_at = NOW() WHERE id = $2', [
            targetStudentStatus,
            id,
          ]);
          await client.query('UPDATE users SET account_status = $1, updated_at = NOW() WHERE id = $2', [
            targetUserStatus,
            student.user_id,
          ]);
        }

        // Audit log
        await client.query(
          `INSERT INTO audit_logs (actor_id, actor_role, action, target_entity, target_id, details, ip_address)
           VALUES ($1, 'admin', $2, 'students', $3, $4, $5);`,
          [
            adminId,
            auditAction,
            id,
            JSON.stringify({
              studentName: student.full_name,
              previousStatus: student.status,
              newStatus: targetStudentStatus,
              reason: reason?.trim() || 'Administrative determination',
            }),
            req.ip || null,
          ]
        );

        return {
          studentId: id,
          previousStatus: student.status,
          newStatus: targetStudentStatus,
          accountStatus: targetUserStatus,
        };
      });

      res.json({
        message: `Student status successfully changed to '${result.newStatus}'.`,
        result,
      });
    } catch (err: any) {
      if (err.status) {
        res.status(err.status).json({ error: err.message });
        return;
      }
      console.error('[Students API] Status change error:', err);
      res.status(500).json({ error: 'Failed to update student lifecycle status.' });
    }
  }
);
