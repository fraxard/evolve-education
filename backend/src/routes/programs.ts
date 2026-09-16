import { Router, Response } from 'express';
import { z } from 'zod';
import { query } from '../db/index.js';
import { requireAuth, requireRole, AuthenticatedRequest } from '../middleware/auth.js';

export const programsRouter = Router();

// GET /api/programs - Public (active only) or Admin (all)
programsRouter.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const isAdmin = req.session?.user?.role === 'admin';

    let queryText = `
      SELECT 
        p.*,
        COUNT(DISTINCT b.id)::int as batch_count,
        COUNT(DISTINCT e.student_id)::int as active_student_count
      FROM programs p
      LEFT JOIN batches b ON b.program_id = p.id AND b.is_active = true
      LEFT JOIN enrollments e ON e.program_id = p.id AND e.status = 'active'
    `;

    if (!isAdmin) {
      queryText += ' WHERE p.is_active = true';
    }

    queryText += ' GROUP BY p.id ORDER BY p.name ASC';

    const result = await query(queryText);
    res.json({ programs: result.rows });
  } catch (err) {
    console.error('[Programs API] List error:', err);
    res.status(500).json({ error: 'Failed to retrieve programs.' });
  }
});

const programSchema = z.object({
  name: z.string().min(2, 'Program name is required').max(255),
  slug: z.string().min(2).max(255).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().optional(),
  level: z.string().max(64).optional(),
  duration: z.string().max(64).optional(),
  isActive: z.boolean().default(true),
});

// POST /api/programs - Admin: Create Program
programsRouter.post(
  '/',
  requireAuth,
  requireRole('admin'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const parseResult = programSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          error: 'Validation failed',
          details: parseResult.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
        });
        return;
      }

      const data = parseResult.data;

      const existingSlug = await query('SELECT id FROM programs WHERE slug = $1', [data.slug]);
      if (existingSlug.rows.length > 0) {
        res.status(409).json({ error: 'A program with this slug already exists.' });
        return;
      }

      const result = await query(
        `INSERT INTO programs (name, slug, description, level, duration, is_active)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *;`,
        [data.name, data.slug, data.description || null, data.level || null, data.duration || null, data.isActive]
      );

      await query(
        `INSERT INTO audit_logs (actor_id, actor_role, action, target_entity, target_id, details)
         VALUES ($1, 'admin', 'PROGRAM_CREATED', 'programs', $2, $3);`,
        [req.currentUser!.id, result.rows[0].id, JSON.stringify({ name: data.name, slug: data.slug })]
      );

      res.status(201).json({ message: 'Program created successfully.', program: result.rows[0] });
    } catch (err) {
      console.error('[Programs API] Create error:', err);
      res.status(500).json({ error: 'Failed to create program.' });
    }
  }
);

// PATCH /api/programs/:id - Admin: Update Program
programsRouter.patch(
  '/:id',
  requireAuth,
  requireRole('admin'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, description, level, duration, isActive } = req.body;

      const programRes = await query('SELECT id FROM programs WHERE id = $1', [id]);
      if (programRes.rows.length === 0) {
        res.status(404).json({ error: 'Program not found.' });
        return;
      }

      const result = await query(
        `UPDATE programs
         SET name = COALESCE($1, name),
             description = COALESCE($2, description),
             level = COALESCE($3, level),
             duration = COALESCE($4, duration),
             is_active = COALESCE($5, is_active),
             updated_at = NOW()
         WHERE id = $6
         RETURNING *;`,
        [
          name || null,
          description !== undefined ? description : null,
          level || null,
          duration || null,
          isActive !== undefined ? isActive : null,
          id,
        ]
      );

      await query(
        `INSERT INTO audit_logs (actor_id, actor_role, action, target_entity, target_id, details)
         VALUES ($1, 'admin', 'PROGRAM_UPDATED', 'programs', $2, $3);`,
        [req.currentUser!.id, id, JSON.stringify({ name, isActive })]
      );

      res.json({ message: 'Program updated successfully.', program: result.rows[0] });
    } catch (err) {
      console.error('[Programs API] Update error:', err);
      res.status(500).json({ error: 'Failed to update program.' });
    }
  }
);
