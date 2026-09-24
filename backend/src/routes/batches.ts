import { Router, Response } from 'express';
import { z } from 'zod';
import { query } from '../db/index.js';
import { requireAuth, requireRole, AuthenticatedRequest } from '../middleware/auth.js';

export const batchesRouter = Router();

// GET /api/batches - List Batches
batchesRouter.get(
  '/',
  requireAuth,
  requireRole('admin'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const programId = req.query.programId as string;
      const isActiveOnly = req.query.activeOnly === 'true';

      let queryText = `
        SELECT 
          b.*,
          p.name as program_name,
          t.full_name as teacher_name,
          COUNT(e.id)::int as enrolled_student_count
        FROM batches b
        JOIN programs p ON b.program_id = p.id
        LEFT JOIN teachers t ON b.teacher_id = t.id
        LEFT JOIN enrollments e ON e.batch_id = b.id AND e.status = 'active'
        WHERE 1=1
      `;
      const params: any[] = [];

      if (programId) {
        params.push(programId);
        queryText += ` AND b.program_id = $${params.length}`;
      }

      if (isActiveOnly) {
        queryText += ` AND b.is_active = true`;
      }

      queryText += ' GROUP BY b.id, p.name, t.full_name ORDER BY b.name ASC';

      const result = await query(queryText, params);
      res.json({ batches: result.rows });
    } catch (err) {
      console.error('[Batches API] List error:', err);
      res.status(500).json({ error: 'Failed to retrieve batches.' });
    }
  }
);

const batchSchema = z.object({
  programId: z.string().uuid('Valid Program ID is required'),
  name: z.string().min(2, 'Batch name is required').max(255),
  level: z.string().max(64).optional(),
  schedule: z.string().min(2, 'Schedule description is required').max(255),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid Start Date (YYYY-MM-DD) is required'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid End Date (YYYY-MM-DD) is required').optional().nullable(),
  capacity: z.number().int().positive().default(15),
  teacherId: z.string().uuid().optional().nullable(),
  isActive: z.boolean().default(true),
});

// POST /api/batches - Admin: Create Batch
batchesRouter.post(
  '/',
  requireAuth,
  requireRole('admin'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const parseResult = batchSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          error: 'Validation failed',
          details: parseResult.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
        });
        return;
      }

      const data = parseResult.data;

      // Validate program
      const programRes = await query('SELECT id FROM programs WHERE id = $1', [data.programId]);
      if (programRes.rows.length === 0) {
        res.status(400).json({ error: 'Referenced program does not exist.' });
        return;
      }

      // Validate teacher if provided
      if (data.teacherId) {
        const teacherRes = await query('SELECT id FROM teachers WHERE id = $1', [data.teacherId]);
        if (teacherRes.rows.length === 0) {
          res.status(400).json({ error: 'Referenced teacher does not exist.' });
          return;
        }
      }

      const result = await query(
        `INSERT INTO batches (program_id, name, level, schedule, start_date, end_date, capacity, is_active, teacher_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *;`,
        [
          data.programId,
          data.name,
          data.level || null,
          data.schedule,
          data.startDate,
          data.endDate || null,
          data.capacity,
          data.isActive,
          data.teacherId || null,
        ]
      );

      await query(
        `INSERT INTO audit_logs (actor_id, actor_role, action, target_entity, target_id, details)
         VALUES ($1, 'admin', 'BATCH_CREATED', 'batches', $2, $3);`,
        [req.currentUser!.id, result.rows[0].id, JSON.stringify({ name: data.name, programId: data.programId })]
      );

      res.status(201).json({ message: 'Batch created successfully.', batch: result.rows[0] });
    } catch (err) {
      console.error('[Batches API] Create error:', err);
      res.status(500).json({ error: 'Failed to create batch.' });
    }
  }
);

// PATCH /api/batches/:id - Admin: Update Batch
batchesRouter.patch(
  '/:id',
  requireAuth,
  requireRole('admin'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, level, schedule, startDate, endDate, capacity, isActive, teacherId } = req.body;

      const batchRes = await query('SELECT id FROM batches WHERE id = $1', [id]);
      if (batchRes.rows.length === 0) {
        res.status(404).json({ error: 'Batch not found.' });
        return;
      }

      if (teacherId) {
        const teacherCheck = await query('SELECT id FROM teachers WHERE id = $1', [teacherId]);
        if (teacherCheck.rows.length === 0) {
          res.status(400).json({ error: 'Referenced teacher does not exist.' });
          return;
        }
      }

      if (capacity !== undefined && capacity !== null) {
        const numCapacity = Number(capacity);
        if (isNaN(numCapacity) || numCapacity <= 0) {
          res.status(400).json({ error: 'Capacity must be a positive integer.' });
          return;
        }

        const enrolledCountRes = await query(
          `SELECT COUNT(*)::int as count FROM enrollments WHERE batch_id = $1 AND status = 'active'`,
          [id]
        );
        const currentCount = enrolledCountRes.rows[0].count;
        if (numCapacity < currentCount) {
          res.status(400).json({
            error: `Cannot reduce capacity to ${numCapacity}. There are currently ${currentCount} active students enrolled in this cohort.`
          });
          return;
        }
      }

      const result = await query(
        `UPDATE batches
         SET name = COALESCE($1, name),
             level = COALESCE($2, level),
             schedule = COALESCE($3, schedule),
             start_date = COALESCE($4, start_date),
             end_date = COALESCE($5, end_date),
             capacity = COALESCE($6, capacity),
             is_active = COALESCE($7, is_active),
             teacher_id = CASE WHEN $8::uuid IS NOT NULL THEN $8 ELSE teacher_id END,
             updated_at = NOW()
         WHERE id = $9
         RETURNING *;`,
        [
          name || null,
          level || null,
          schedule || null,
          startDate || null,
          endDate || null,
          capacity || null,
          isActive !== undefined ? isActive : null,
          teacherId || null,
          id,
        ]
      );

      await query(
        `INSERT INTO audit_logs (actor_id, actor_role, action, target_entity, target_id, details)
         VALUES ($1, 'admin', 'BATCH_UPDATED', 'batches', $2, $3);`,
        [req.currentUser!.id, id, JSON.stringify({ name, capacity, isActive, teacherId })]
      );

      res.json({ message: 'Batch updated successfully.', batch: result.rows[0] });
    } catch (err) {
      console.error('[Batches API] Update error:', err);
      res.status(500).json({ error: 'Failed to update batch.' });
    }
  }
);

// DELETE /api/batches/:id - Admin: Safe Delete Cohort Batch
batchesRouter.delete(
  '/:id',
  requireAuth,
  requireRole('admin'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        res.status(400).json({ error: 'Invalid batch ID.' });
        return;
      }

      const batchRes = await query('SELECT id, name FROM batches WHERE id = $1', [id]);
      if (batchRes.rows.length === 0) {
        res.status(404).json({ error: 'Batch not found.' });
        return;
      }
      const batchName = batchRes.rows[0].name;

      // 1. Check student enrollments (active, completed, transferred, or withdrawn)
      const enrollCountRes = await query('SELECT COUNT(*)::int as count FROM enrollments WHERE batch_id = $1', [id]);
      if (enrollCountRes.rows[0].count > 0) {
        res.status(400).json({
          error: `Cannot delete cohort "${batchName}" because it has ${enrollCountRes.rows[0].count} student enrollment record(s). Educational history must be preserved. Please deactivate the cohort instead.`,
          code: 'DEPENDENCY_EXISTS',
        });
        return;
      }

      // 2. Check assessments
      const assessCountRes = await query('SELECT COUNT(*)::int as count FROM assessments WHERE batch_id = $1', [id]);
      if (assessCountRes.rows[0].count > 0) {
        res.status(400).json({
          error: `Cannot delete cohort "${batchName}" because it is linked to ${assessCountRes.rows[0].count} assessment(s). Please deactivate the cohort instead.`,
          code: 'DEPENDENCY_EXISTS',
        });
        return;
      }

      // Safe to delete
      await query('DELETE FROM batches WHERE id = $1', [id]);

      await query(
        `INSERT INTO audit_logs (actor_id, actor_role, action, target_entity, target_id, details)
         VALUES ($1, 'admin', 'BATCH_DELETED', 'batches', $2, $3);`,
        [req.currentUser!.id, id, JSON.stringify({ name: batchName })]
      );

      res.json({ message: `Cohort batch "${batchName}" has been successfully deleted.` });
    } catch (err) {
      console.error('[Batches API] Delete error:', err);
      res.status(500).json({ error: 'Failed to delete batch.' });
    }
  }
);
