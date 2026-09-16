import { Router, Response } from 'express';
import { query } from '../db/index.js';
import { requireAuth, requireRole, AuthenticatedRequest } from '../middleware/auth.js';

export const dashboardRouter = Router();

// GET /api/admin/dashboard - Real metrics and recent activity
dashboardRouter.get(
  '/',
  requireAuth,
  requireRole('admin'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const [
        pendingAppsRes,
        activeStudentsRes,
        activeTeachersRes,
        activeProgramsRes,
        activeBatchesRes,
        recentAppsRes,
        recentActivityRes,
      ] = await Promise.all([
        query("SELECT COUNT(*)::int as count FROM student_applications WHERE status = 'pending'"),
        query("SELECT COUNT(*)::int as count FROM students WHERE status = 'active'"),
        query("SELECT COUNT(*)::int as count FROM teachers WHERE status = 'active'"),
        query('SELECT COUNT(*)::int as count FROM programs WHERE is_active = true'),
        query('SELECT COUNT(*)::int as count FROM batches WHERE is_active = true'),
        query(`
          SELECT 
            a.id, a.student_name, a.guardian_name, a.submitted_at, a.status,
            p.name as requested_program_name
          FROM student_applications a
          LEFT JOIN programs p ON a.requested_program_id = p.id
          ORDER BY a.submitted_at DESC LIMIT 5
        `),
        query(`
          SELECT 
            al.id, al.action, al.target_entity, al.target_id, al.created_at, al.details,
            u.email as actor_email
          FROM audit_logs al
          LEFT JOIN users u ON al.actor_id = u.id
          ORDER BY al.created_at DESC LIMIT 8
        `),
      ]);

      res.json({
        metrics: {
          pendingApplications: pendingAppsRes.rows[0].count,
          activeStudents: activeStudentsRes.rows[0].count,
          activeTeachers: activeTeachersRes.rows[0].count,
          activePrograms: activeProgramsRes.rows[0].count,
          activeBatches: activeBatchesRes.rows[0].count,
        },
        recentApplications: recentAppsRes.rows,
        recentActivity: recentActivityRes.rows,
      });
    } catch (err) {
      console.error('[Dashboard API] Metrics error:', err);
      res.status(500).json({ error: 'Failed to retrieve dashboard metrics.' });
    }
  }
);
