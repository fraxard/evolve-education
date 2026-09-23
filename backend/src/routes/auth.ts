import { Router, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { query } from '../db/index.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';

export const authRouter = Router();

// Rate limiting on login attempts
const signinLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per IP per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again after 15 minutes.' },
});

const signinSchema = z.object({
  email: z.string().email('Valid email is required').transform((e) => e.toLowerCase().trim()),
  password: z.string().min(1, 'Password is required'),
});

// POST /api/auth/signin
authRouter.post('/signin', signinLimiter, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parseResult = signinSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.errors[0].message });
      return;
    }

    const { email, password } = parseResult.data;

    const userRes = await query(
      'SELECT id, email, password_hash, role, account_status FROM users WHERE email = $1',
      [email]
    );

    if (userRes.rows.length === 0) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const user = userRes.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    // Update last login
    await query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

    // Store in session
    req.session.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      account_status: user.account_status,
    };

    let fullName = '';
    let studentId: string | undefined;
    let teacherId: string | undefined;

    if (user.role === 'student') {
      const studentRes = await query('SELECT id, full_name FROM students WHERE user_id = $1', [user.id]);
      if (studentRes.rows.length > 0) {
        studentId = studentRes.rows[0].id;
        fullName = studentRes.rows[0].full_name;
      } else {
        const appRes = await query('SELECT student_name FROM student_applications WHERE user_id = $1', [user.id]);
        if (appRes.rows.length > 0) {
          fullName = appRes.rows[0].student_name;
        }
      }
    } else if (user.role === 'teacher') {
      const teacherRes = await query('SELECT id, full_name FROM teachers WHERE user_id = $1', [user.id]);
      if (teacherRes.rows.length > 0) {
        teacherId = teacherRes.rows[0].id;
        fullName = teacherRes.rows[0].full_name;
      }
    } else if (user.role === 'admin') {
      fullName = 'Administrator';
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        account_status: user.account_status,
        fullName,
        studentId,
        teacherId,
      },
    });
  } catch (err) {
    console.error('[Auth API] Signin error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/auth/signout
authRouter.post('/signout', (req: AuthenticatedRequest, res: Response) => {
  const cookieName = process.env.SESSION_NAME || 'evolve_sid';
  req.session.destroy((err) => {
    if (err) {
      console.error('[Auth API] Signout error:', err);
      res.status(500).json({ error: 'Failed to terminate session.' });
      return;
    }
    res.clearCookie(cookieName);
    res.json({ message: 'Signed out successfully.' });
  });
});

const passwordChangeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many password update attempts. Please wait 15 minutes before trying again.' },
});

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .regex(/[A-Z]/, 'New password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'New password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'New password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'New password must contain at least one special character'),
    confirmPassword: z.string().optional(),
  })
  .refine((data) => !data.confirmPassword || data.newPassword === data.confirmPassword, {
    message: 'New password and confirmation do not match',
    path: ['confirmPassword'],
  });

// POST /api/auth/change-password
authRouter.post(
  '/change-password',
  passwordChangeLimiter,
  requireAuth,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const parseResult = changePasswordSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({ error: parseResult.error.errors[0].message });
        return;
      }

      const { currentPassword, newPassword } = parseResult.data;
      const userId = req.currentUser!.id;

      const userRes = await query('SELECT id, email, role, password_hash FROM users WHERE id = $1', [userId]);
      if (userRes.rows.length === 0) {
        res.status(404).json({ error: 'User account not found.' });
        return;
      }

      const user = userRes.rows[0];
      const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isMatch) {
        res.status(400).json({ error: 'Current password does not match our records.' });
        return;
      }

      if (currentPassword === newPassword) {
        res.status(400).json({ error: 'New password must be different from current password.' });
        return;
      }

      const newHash = await bcrypt.hash(newPassword, 12);
      await query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [newHash, userId]);

      // Record in audit log
      await query(
        `INSERT INTO audit_logs (actor_id, actor_role, action, target_entity, target_id, details, ip_address)
         VALUES ($1, $2, 'ADMIN_PASSWORD_CHANGED', 'users', $3, $4, $5);`,
        [
          userId,
          user.role,
          String(userId),
          JSON.stringify({ email: user.email, event: 'Password updated via security portal' }),
          req.ip || null,
        ]
      );

      res.json({ message: 'Password updated successfully.' });
    } catch (err) {
      console.error('[Auth API] Change password error:', err);
      res.status(500).json({ error: 'Failed to change password.' });
    }
  }
);

// In-memory short-lived handoff tickets for seamless dev cross-hostname navigation (60s TTL)
const handoffTickets = new Map<string, { user: any; expires: number }>();

setInterval(() => {
  const now = Date.now();
  for (const [k, v] of handoffTickets.entries()) {
    if (v.expires < now) handoffTickets.delete(k);
  }
}, 60000);

// POST /api/auth/sso-ticket (Authenticated: generate one-time transfer ticket)
authRouter.post('/sso-ticket', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const ticket = crypto.randomUUID();
  handoffTickets.set(ticket, {
    user: req.session.user,
    expires: Date.now() + 60 * 1000,
  });
  res.json({ ticket });
});

// GET /api/auth/claim-ticket?ticket=...&redirect=...
authRouter.get('/claim-ticket', async (req: AuthenticatedRequest, res: Response) => {
  const { ticket, redirect } = req.query;
  if (!ticket || typeof ticket !== 'string') {
    res.redirect('/signin');
    return;
  }

  const handoff = handoffTickets.get(ticket);
  if (!handoff || handoff.expires < Date.now()) {
    handoffTickets.delete(ticket);
    res.redirect('/signin');
    return;
  }

  handoffTickets.delete(ticket);

  req.session.user = handoff.user;
  req.session.save((err) => {
    const defaultTarget = handoff.user.role === 'admin' ? '/dashboard' : '/signin';
    let target = typeof redirect === 'string' && redirect.startsWith('/') ? redirect : defaultTarget;
    if (handoff.user.role !== 'admin' && (target === '/dashboard' || target.startsWith('/admin'))) {
      target = '/signin';
    }
    res.redirect(target);
  });
});

// GET /api/auth/me
authRouter.get('/me', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.session || !req.session.user) {
    res.json({ user: null });
    return;
  }

  // Use requireAuth logic to refresh and verify
  requireAuth(req, res, () => {
    res.json({ user: req.currentUser });
  });
});

