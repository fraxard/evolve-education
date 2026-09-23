import { Router, Response } from 'express';
import { pool, query } from '../db/index.js';
import { requireAuth, requireRole, AuthenticatedRequest } from '../middleware/auth.js';

export const adminRouter = Router();

// GET /api/admin/system-status - Admin: Real Read-Only Telemetry
adminRouter.get(
  '/system-status',
  requireAuth,
  requireRole('admin'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const startTime = performance.now();
      const dbVersionRes = await query('SELECT version()');
      const dbLatencyMs = Math.round((performance.now() - startTime) * 100) / 100;

      const mem = process.memoryUsage();
      const uptimeSec = Math.floor(process.uptime());

      // Query active session count
      const sessionCountRes = await query('SELECT COUNT(*)::int as count FROM "session"');
      const activeSessionsCount = sessionCountRes.rows[0]?.count || 0;

      // Extract pg version
      const rawVersion = dbVersionRes.rows[0]?.version || 'PostgreSQL';
      const pgVersionMatch = rawVersion.match(/PostgreSQL\s+([\d.]+)/i);
      const postgresVersion = pgVersionMatch ? `PostgreSQL ${pgVersionMatch[1]}` : rawVersion.split(',')[0];

      res.json({
        database: {
          status: 'connected',
          latencyMs: dbLatencyMs,
          version: postgresVersion,
          pool: {
            total: pool.totalCount,
            idle: pool.idleCount,
            waiting: pool.waitingCount,
          },
        },
        server: {
          uptimeSeconds: uptimeSec,
          nodeVersion: process.version,
          environment: process.env.NODE_ENV || 'development',
          memoryMb: {
            rss: Math.round(mem.rss / 1024 / 1024),
            heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
            heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
          },
        },
        sessions: {
          activeSessionsCount,
          currentSession: {
            userId: req.currentUser!.id,
            email: req.currentUser!.email,
            role: req.currentUser!.role,
            ipAddress: req.ip || '127.0.0.1',
            cookieExpires: req.session.cookie.expires ? req.session.cookie.expires.toISOString() : null,
          },
        },
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error('[Admin System Status API] Error:', err);
      res.status(500).json({ error: 'Failed to retrieve system status telemetry.' });
    }
  }
);

// POST /api/admin/signout-all - Admin: Terminate all sessions for current user
adminRouter.post(
  '/signout-all',
  requireAuth,
  requireRole('admin'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.currentUser!.id;
      const cookieName = process.env.SESSION_NAME || 'evolve_sid';

      await query(
        `DELETE FROM "session" WHERE sess->'user'->>'id' = $1`,
        [userId]
      );

      await query(
        `INSERT INTO audit_logs (actor_id, actor_role, action, target_entity, target_id, details, ip_address)
         VALUES ($1, 'admin', 'ALL_SESSIONS_REVOKED', 'users', $1, $2, $3)`,
        [
          userId,
          JSON.stringify({ email: req.currentUser!.email, event: 'Revoked all active sessions' }),
          req.ip || null,
        ]
      );

      req.session.destroy(() => {
        res.clearCookie(cookieName);
        res.json({ message: 'All active sessions have been terminated. Please sign in again.' });
      });
    } catch (err) {
      console.error('[Admin API] Signout-all error:', err);
      res.status(500).json({ error: 'Failed to revoke active sessions.' });
    }
  }
);
