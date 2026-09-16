import { Router, Response } from 'express';
import { query } from '../db/index.js';
import { requireAuth, requireRole, AuthenticatedRequest } from '../middleware/auth.js';

export const auditLogsRouter = Router();

// GET /api/audit-logs - Admin: View Audit Logs
auditLogsRouter.get(
  '/',
  requireAuth,
  requireRole('admin'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const limit = Math.min(parseInt((req.query.limit as string) || '50', 10), 100);
      const action = req.query.action as string;

      let queryText = `
        SELECT 
          al.*,
          u.email as actor_email
        FROM audit_logs al
        LEFT JOIN users u ON al.actor_id = u.id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (action) {
        params.push(action);
        queryText += ` AND al.action = $${params.length}`;
      }

      params.push(limit);
      queryText += ` ORDER BY al.created_at DESC LIMIT $${params.length}`;

      const result = await query(queryText, params);
      res.json({ auditLogs: result.rows });
    } catch (err) {
      console.error('[Audit Logs API] List error:', err);
      res.status(500).json({ error: 'Failed to retrieve audit logs.' });
    }
  }
);
