import { Router, Response } from 'express';
import { query } from '../db/index.js';
import { requireAuth, requireRole, AuthenticatedRequest } from '../middleware/auth.js';

export const auditLogsRouter = Router();

// GET /api/audit-logs - Admin: View Audit Logs with server-side pagination & filtering
auditLogsRouter.get(
  '/',
  requireAuth,
  requireRole('admin'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
      const limit = Math.min(Math.max(1, parseInt((req.query.limit as string) || '25', 10)), 100);
      const action = req.query.action as string;
      const actorRole = req.query.actorRole as string;
      const search = ((req.query.search as string) || '').trim();

      const conditions: string[] = ['1=1'];
      const params: any[] = [];

      if (action && action !== 'all') {
        params.push(action);
        conditions.push(`al.action = $${params.length}`);
      }

      if (actorRole && actorRole !== 'all') {
        params.push(actorRole);
        conditions.push(`al.actor_role = $${params.length}`);
      }

      if (search) {
        params.push(`%${search}%`);
        conditions.push(`(
          al.action ILIKE $${params.length} OR
          al.target_entity ILIKE $${params.length} OR
          al.target_id::text ILIKE $${params.length} OR
          u.email ILIKE $${params.length} OR
          al.details::text ILIKE $${params.length}
        )`);
      }

      const whereClause = conditions.join(' AND ');

      // Total count query
      const countRes = await query(
        `SELECT COUNT(*)::int as total
         FROM audit_logs al
         LEFT JOIN users u ON al.actor_id = u.id
         WHERE ${whereClause}`,
        params
      );
      const total = countRes.rows[0]?.total || 0;
      const totalPages = Math.max(1, Math.ceil(total / limit));
      const offset = (page - 1) * limit;

      // Paged records query
      const dataParams = [...params, limit, offset];
      const recordsRes = await query(
        `SELECT 
           al.*,
           u.email as actor_email
         FROM audit_logs al
         LEFT JOIN users u ON al.actor_id = u.id
         WHERE ${whereClause}
         ORDER BY al.created_at DESC
         LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
        dataParams
      );

      // Distinct actions for UI filter
      const actionsRes = await query(
        `SELECT DISTINCT action FROM audit_logs ORDER BY action ASC`
      );
      const availableActions = actionsRes.rows.map((r) => r.action);

      res.json({
        auditLogs: recordsRes.rows,
        pagination: {
          total,
          page,
          limit,
          totalPages,
        },
        availableActions,
      });
    } catch (err) {
      console.error('[Audit Logs API] List error:', err);
      res.status(500).json({ error: 'Failed to retrieve audit logs.' });
    }
  }
);

