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

const createTeacherSchema = z.object({
  fullName: z.string().min(2, 'Full name is required').max(255),
  email: z.string().email('Valid email is required').transform((e) => e.toLowerCase().trim()),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().max(64).optional(),
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

        return { teacherId, userId, fullName: data.fullName, email: data.email };
      });

      res.status(201).json({ message: 'Teacher account created successfully.', teacher: result });
    } catch (err) {
      console.error('[Teachers API] Create error:', err);
      res.status(500).json({ error: 'Failed to create teacher account.' });
    }
  }
);

// PATCH /api/teachers/:id - Admin: Update Teacher Status / Details
teachersRouter.patch(
  '/:id',
  requireAuth,
  requireRole('admin'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status, phone, qualification, specialization } = req.body;

      if (status && !['active', 'inactive'].includes(status)) {
        res.status(400).json({ error: 'Status must be active or inactive.' });
        return;
      }

      await withTransaction(async (client) => {
        const teacherRes = await client.query('SELECT user_id FROM teachers WHERE id = $1', [id]);
        if (teacherRes.rows.length === 0) {
          throw { status: 404, message: 'Teacher not found.' };
        }
        const userId = teacherRes.rows[0].user_id;

        await client.query(
          `UPDATE teachers 
           SET status = COALESCE($1, status),
               phone = COALESCE($2, phone),
               qualification = COALESCE($3, qualification),
               specialization = COALESCE($4, specialization),
               updated_at = NOW()
           WHERE id = $5`,
          [status || null, phone || null, qualification || null, specialization || null, id]
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
          [req.currentUser!.id, id, JSON.stringify({ status, phone, qualification, specialization }), req.ip || null]
        );
      });

      res.json({ message: 'Teacher updated successfully.' });
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
