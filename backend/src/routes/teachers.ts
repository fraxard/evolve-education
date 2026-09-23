import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { query, withTransaction } from '../db/index.js';
import { requireAuth, requireRole, AuthenticatedRequest } from '../middleware/auth.js';

export const teachersRouter = Router();

// GET /api/teachers - Admin: List Teachers
teachersRouter.get(
  '/',
  requireAuth,
  requireRole('admin'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const result = await query(
        `SELECT 
          t.*,
          u.email,
          u.account_status,
          COUNT(DISTINCT b.id)::int as batch_count,
          COUNT(DISTINCT e.student_id)::int as assigned_student_count
        FROM teachers t
        JOIN users u ON t.user_id = u.id
        LEFT JOIN batches b ON b.teacher_id = t.id AND b.is_active = true
        LEFT JOIN enrollments e ON e.teacher_id = t.id AND e.status = 'active'
        GROUP BY t.id, u.email, u.account_status
        ORDER BY t.full_name ASC`
      );

      res.json({ teachers: result.rows });
    } catch (err) {
      console.error('[Teachers API] List error:', err);
      res.status(500).json({ error: 'Failed to retrieve teachers.' });
    }
  }
);

const phoneValidator = z
  .string()
  .trim()
  .max(25, 'Phone number cannot exceed 25 characters')
  .regex(/^\+?[0-9\s\-()]+$/, 'Phone number may only contain digits, spaces, hyphens, and leading +')
  .refine((val) => val.indexOf('+') <= 0, { message: '+ may only appear at the beginning of the phone number' })
  .refine((val) => val.replace(/\D/g, '').length >= 7, { message: 'Phone number must contain at least 7 digits' })
  .optional()
  .nullable();

const createTeacherSchema = z.object({
  fullName: z.string().min(2, 'Full name is required').max(255),
  email: z.string().email('Valid email is required').transform((e) => e.toLowerCase().trim()),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: phoneValidator,
  qualification: z.string().max(255).optional(),
  specialization: z.string().max(255).optional(),
});

// POST /api/teachers - Admin: Create Teacher Account
teachersRouter.post(
  '/',
  requireAuth,
  requireRole('admin'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const parseResult = createTeacherSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          error: 'Validation failed',
          details: parseResult.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
        });
        return;
      }

      const data = parseResult.data;
      const adminId = req.currentUser!.id;

      const existingUser = await query('SELECT id FROM users WHERE email = $1', [data.email]);
      if (existingUser.rows.length > 0) {
        res.status(409).json({ error: 'An account with this email address already exists.' });
        return;
      }

      const passwordHash = await bcrypt.hash(data.password, 12);

      const result = await withTransaction(async (client) => {
        const userRes = await client.query(
          `INSERT INTO users (email, password_hash, role, account_status)
           VALUES ($1, $2, 'teacher', 'active')
           RETURNING id;`,
          [data.email, passwordHash]
        );
        const userId = userRes.rows[0].id;

        const teacherRes = await client.query(
          `INSERT INTO teachers (user_id, full_name, phone, qualification, specialization, status)
           VALUES ($1, $2, $3, $4, $5, 'active')
           RETURNING id;`,
          [userId, data.fullName, data.phone || null, data.qualification || null, data.specialization || null]
        );
        const teacherId = teacherRes.rows[0].id;

        await client.query(
          `INSERT INTO audit_logs (actor_id, actor_role, action, target_entity, target_id, details, ip_address)
           VALUES ($1, 'admin', 'TEACHER_CREATED', 'teachers', $2, $3, $4);`,
          [adminId, teacherId, JSON.stringify({ email: data.email, fullName: data.fullName }), req.ip || null]
        );

        return { id: teacherId, teacherId, userId, fullName: data.fullName, email: data.email };
      });

      res.status(201).json({ message: 'Teacher account created successfully.', teacher: result });
    } catch (err) {
      console.error('[Teachers API] Create error:', err);
      res.status(500).json({ error: 'Failed to create teacher account.' });
    }
  }
);

// PATCH /api/teachers/:id - Admin: Update Teacher Status / Details
const updateTeacherSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(255).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  phone: phoneValidator,
  qualification: z.string().max(255).optional().nullable(),
  specialization: z.string().max(255).optional().nullable(),
});

teachersRouter.patch(
  '/:id',
  requireAuth,
  requireRole('admin'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const parseResult = updateTeacherSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          error: 'Validation failed',
          details: parseResult.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
        });
        return;
      }
      const { fullName, status, phone, qualification, specialization } = parseResult.data;

      const result = await withTransaction(async (client) => {
        const teacherRes = await client.query('SELECT user_id FROM teachers WHERE id = $1', [id]);
        if (teacherRes.rows.length === 0) {
          throw { status: 404, message: 'Teacher not found.' };
        }
        const userId = teacherRes.rows[0].user_id;

        await client.query(
          `UPDATE teachers 
           SET full_name = COALESCE($1, full_name),
               status = COALESCE($2, status),
               phone = COALESCE($3, phone),
               qualification = COALESCE($4, qualification),
               specialization = COALESCE($5, specialization),
               updated_at = NOW()
           WHERE id = $6`,
          [fullName || null, status || null, phone || null, qualification || null, specialization || null, id]
        );

        if (status) {
          await client.query(
            'UPDATE users SET account_status = $1, updated_at = NOW() WHERE id = $2',
            [status, userId]
          );
        }

        await client.query(
          `INSERT INTO audit_logs (actor_id, actor_role, action, target_entity, target_id, details, ip_address)
           VALUES ($1, 'admin', 'TEACHER_UPDATED', 'teachers', $2, $3, $4);`,
          [req.currentUser!.id, id, JSON.stringify({ fullName, status, phone, qualification, specialization }), req.ip || null]
        );

        const updated = await client.query('SELECT * FROM teachers WHERE id = $1', [id]);
        return updated.rows[0];
      });

      res.json({ message: 'Teacher updated successfully.', teacher: result });
    } catch (err: any) {
      if (err.status) {
        res.status(err.status).json({ error: err.message });
        return;
      }
      console.error('[Teachers API] Update error:', err);
      res.status(500).json({ error: 'Failed to update teacher.' });
    }
  }
);

// DELETE /api/teachers/:id - Admin: Safe Delete Teacher
teachersRouter.delete(
  '/:id',
  requireAuth,
  requireRole('admin'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        res.status(400).json({ error: 'Invalid teacher ID.' });
        return;
      }

      const teacherRes = await query('SELECT id, user_id, full_name FROM teachers WHERE id = $1', [id]);
      if (teacherRes.rows.length === 0) {
        res.status(404).json({ error: 'Teacher not found.' });
        return;
      }

      const teacher = teacherRes.rows[0];
      const teacherName = teacher.full_name;

      // 1. Check assigned batches/cohorts
      const batchCountRes = await query('SELECT COUNT(*)::int as count FROM batches WHERE teacher_id = $1', [id]);
      if (batchCountRes.rows[0].count > 0) {
        res.status(400).json({
          error: `Cannot delete instructor "${teacherName}" because they are currently assigned to ${batchCountRes.rows[0].count} cohort batch(es). Please reassign the cohorts before deleting, or set the instructor status to inactive instead.`,
          code: 'DEPENDENCY_EXISTS',
        });
        return;
      }

      // 2. Check student enrollments
      const enrollCountRes = await query('SELECT COUNT(*)::int as count FROM enrollments WHERE teacher_id = $1', [id]);
      if (enrollCountRes.rows[0].count > 0) {
        res.status(400).json({
          error: `Cannot delete instructor "${teacherName}" because they are recorded on ${enrollCountRes.rows[0].count} student enrollment record(s). Educational history must be preserved. Please deactivate the instructor account instead.`,
          code: 'DEPENDENCY_EXISTS',
        });
        return;
      }

      // 3. Check teacher progress notes
      const notesCountRes = await query('SELECT COUNT(*)::int as count FROM teacher_notes WHERE teacher_id = $1', [id]);
      if (notesCountRes.rows[0].count > 0) {
        res.status(400).json({
          error: `Cannot delete instructor "${teacherName}" because they have authored ${notesCountRes.rows[0].count} student progress note(s). Historical notes must be preserved. Please deactivate the instructor account instead.`,
          code: 'DEPENDENCY_EXISTS',
        });
        return;
      }

      // Safe to delete: Delete teacher & associated user in a transaction
      await withTransaction(async (client) => {
        await client.query('DELETE FROM teachers WHERE id = $1', [id]);
        if (teacher.user_id) {
          await client.query('DELETE FROM users WHERE id = $1', [teacher.user_id]);
        }
        await client.query(
          `INSERT INTO audit_logs (actor_id, actor_role, action, target_entity, target_id, details, ip_address)
           VALUES ($1, 'admin', 'TEACHER_DELETED', 'teachers', $2, $3, $4);`,
          [
            req.currentUser!.id,
            id,
            JSON.stringify({ fullName: teacherName, userId: teacher.user_id }),
            req.ip || null,
          ]
        );
      });

      res.json({ message: `Instructor "${teacherName}" has been successfully deleted.` });
    } catch (err) {
      console.error('[Teachers API] Delete error:', err);
      res.status(500).json({ error: 'Failed to delete teacher.' });
    }
  }
);

