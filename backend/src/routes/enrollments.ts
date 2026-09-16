import { Router, Response } from 'express';
import { query } from '../db/index.js';
import { requireAuth, requireRole, AuthenticatedRequest } from '../middleware/auth.js';

export const enrollmentsRouter = Router();

// GET /api/enrollments - Admin: Query Enrollments
enrollmentsRouter.get(
  '/',
  requireAuth,
  requireRole('admin'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const studentId = req.query.studentId as string;
      const batchId = req.query.batchId as string;
      const status = req.query.status as string;

      let queryText = `
        SELECT 
          e.*,
          s.full_name as student_name,
          p.name as program_name,
          b.name as batch_name,
          t.full_name as teacher_name
        FROM enrollments e
        JOIN students s ON e.student_id = s.id
        JOIN programs p ON e.program_id = p.id
        JOIN batches b ON e.batch_id = b.id
        JOIN teachers t ON e.teacher_id = t.id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (studentId) {
        params.push(studentId);
        queryText += ` AND e.student_id = $${params.length}`;
      }

      if (batchId) {
        params.push(batchId);
        queryText += ` AND e.batch_id = $${params.length}`;
      }

      if (status && status !== 'all') {
        params.push(status);
        queryText += ` AND e.status = $${params.length}`;
      }

      queryText += ' ORDER BY e.start_date DESC';

      const result = await query(queryText, params);
      res.json({ enrollments: result.rows });
    } catch (err) {
      console.error('[Enrollments API] List error:', err);
      res.status(500).json({ error: 'Failed to retrieve enrollments.' });
    }
  }
);
