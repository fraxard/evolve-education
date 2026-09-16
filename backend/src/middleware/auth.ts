import { Request, Response, NextFunction } from 'express';
import { query } from '../db/index.js';

// Extend Express Request and Session interfaces
declare module 'express-session' {
  interface SessionData {
    user?: {
      id: string;
      email: string;
      role: 'student' | 'teacher' | 'admin';
      account_status: 'pending' | 'active' | 'rejected' | 'inactive';
    };
  }
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  account_status: 'pending' | 'active' | 'rejected' | 'inactive';
  fullName?: string;
  studentId?: string;
  teacherId?: string;
}

export interface AuthenticatedRequest extends Request {
  currentUser?: AuthenticatedUser;
}

/**
 * Ensures request has an active server-side session and validates against DB
 */
export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.session || !req.session.user) {
    res.status(401).json({ error: 'Authentication required. No active session.' });
    return;
  }

  try {
    // Verify user in database to ensure account is not deactivated or deleted
    const userRes = await query(
      'SELECT id, email, role, account_status FROM users WHERE id = $1',
      [req.session.user.id]
    );

    if (userRes.rows.length === 0) {
      req.session.destroy(() => {});
      res.status(401).json({ error: 'User account no longer exists.' });
      return;
    }

    const dbUser = userRes.rows[0];

    // If account was deactivated or rejected since session start
    if (dbUser.account_status === 'inactive' || dbUser.account_status === 'rejected') {
      req.session.destroy(() => {});
      res.status(403).json({ error: `Account is ${dbUser.account_status}. Access denied.` });
      return;
    }

    // Keep session data synchronized with DB
    req.session.user.role = dbUser.role;
    req.session.user.account_status = dbUser.account_status;

    let fullName = '';
    let studentId: string | undefined;
    let teacherId: string | undefined;

    if (dbUser.role === 'student') {
      const studentRes = await query('SELECT id, full_name FROM students WHERE user_id = $1', [dbUser.id]);
      if (studentRes.rows.length > 0) {
        studentId = studentRes.rows[0].id;
        fullName = studentRes.rows[0].full_name;
      }
    } else if (dbUser.role === 'teacher') {
      const teacherRes = await query('SELECT id, full_name FROM teachers WHERE user_id = $1', [dbUser.id]);
      if (teacherRes.rows.length > 0) {
        teacherId = teacherRes.rows[0].id;
        fullName = teacherRes.rows[0].full_name;
      }
    } else if (dbUser.role === 'admin') {
      fullName = 'Administrator';
    }

    req.currentUser = {
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
      account_status: dbUser.account_status,
      fullName,
      studentId,
      teacherId,
    };

    next();
  } catch (err) {
    console.error('[Auth Middleware] Verification error:', err);
    res.status(500).json({ error: 'Internal server error during authentication.' });
  }
}

/**
 * Enforces role check server-side.
 */
export function requireRole(allowedRoles: string | string[]) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.currentUser) {
      res.status(401).json({ error: 'Unauthorized. Please sign in.' });
      return;
    }

    if (!roles.includes(req.currentUser.role)) {
      res.status(403).json({
        error: 'Forbidden: Insufficient privileges for this action.',
        requiredRoles: roles,
        currentRole: req.currentUser.role,
      });
      return;
    }

    next();
  };
}

/**
 * Enforces active account status for role-based portal access
 */
export function requireActive(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.currentUser) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }

  if (req.currentUser.account_status !== 'active') {
    res.status(403).json({
      error: `Account is not active (current status: ${req.currentUser.account_status}).`,
      account_status: req.currentUser.account_status,
    });
    return;
  }

  next();
}
