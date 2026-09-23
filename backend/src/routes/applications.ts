import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { query, withTransaction } from '../db/index.js';
import { requireAuth, requireRole, AuthenticatedRequest } from '../middleware/auth.js';

export const applicationsRouter = Router();

// Rate limiting for public application submissions (e.g., max 10 per hour per IP)
const applicationSubmitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many application submissions from this IP. Please try again later.' },
});

// Zod schema for public signup / application
const applicationSchema = z.object({
  studentName: z.string().min(2, 'Student full name must be at least 2 characters').max(255),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid Date of Birth (YYYY-MM-DD) is required'),
  gender: z.string().max(32).optional(),
  personalDetails: z.string().max(2000).optional(),
  guardianName: z.string().min(2, 'Guardian name is required').max(255),
  guardianRelationship: z.string().min(2, 'Relationship to student is required').max(64),
  guardianPhone: z
    .string()
    .trim()
    .min(7, 'Valid guardian phone number is required')
    .max(25, 'Phone number cannot exceed 25 characters')
    .regex(/^\+?[0-9\s\-()]+$/, 'Phone number may only contain digits, spaces, hyphens, and leading +')
    .refine((val) => val.indexOf('+') <= 0, { message: '+ may only appear at the beginning of the phone number' })
    .refine((val) => val.replace(/\D/g, '').length >= 7, { message: 'Phone number must contain at least 7 digits' }),
  guardianEmail: z.string().email('Valid guardian email is required').transform((e) => e.toLowerCase().trim()),
  contactPhone: z
    .string()
    .trim()
    .max(25, 'Contact phone cannot exceed 25 characters')
    .regex(/^\+?[0-9\s\-()]+$/, 'Contact phone may only contain digits, spaces, hyphens, and leading +')
    .refine((val) => val.indexOf('+') <= 0, { message: '+ may only appear at the beginning of the phone number' })
    .refine((val) => val.replace(/\D/g, '').length >= 7, { message: 'Contact phone must contain at least 7 digits' })
    .optional()
    .nullable(),
  address: z.string().max(500).optional(),
  schoolName: z.string().max(255).optional(),
  currentGrade: z.string().max(64).optional(),
  academicNotes: z.string().max(2000).optional(),
  requestedProgramId: z.string().uuid().optional().nullable(),
  preferredLevel: z.string().max(64).optional(),
  preferredSchedule: z.string().max(128).optional(),
  additionalDetails: z.string().max(2000).optional(),
  email: z.string().email('Valid account email is required').transform((e) => e.toLowerCase().trim()),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// POST /api/applications - Public Student Application & Signup
applicationsRouter.post('/', applicationSubmitLimiter, async (req, res: Response): Promise<void> => {
  try {
    const parseResult = applicationSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
      return;
    }

    const data = parseResult.data;

    // 1. Verify email uniqueness
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [data.email]);
    if (existingUser.rows.length > 0) {
      res.status(409).json({ error: 'An account with this email address already exists. Please sign in or use another email.' });
      return;
    }

    // 2. Hash password securely
    const passwordHash = await bcrypt.hash(data.password, 12);

    // 3. Execute transactional insertion
    const result = await withTransaction(async (client) => {
      // Create user account with pending status
      const userRes = await client.query(
        `INSERT INTO users (email, password_hash, role, account_status)
         VALUES ($1, $2, 'student', 'pending')
         RETURNING id;`,
        [data.email, passwordHash]
      );
      const userId = userRes.rows[0].id;

      // Create student application
      const appRes = await client.query(
        `INSERT INTO student_applications (
          user_id, student_name, date_of_birth, gender, personal_details,
          guardian_name, guardian_relationship, guardian_phone, guardian_email,
          contact_phone, address, school_name, current_grade, academic_notes,
          requested_program_id, preferred_level, preferred_schedule, additional_details,
          status, submitted_at
        ) VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9,
          $10, $11, $12, $13, $14,
          $15, $16, $17, $18,
          'pending', NOW()
        ) RETURNING id, submitted_at;`,
        [
          userId,
          data.studentName,
          data.dateOfBirth,
          data.gender || null,
          data.personalDetails || null,
          data.guardianName,
          data.guardianRelationship,
          data.guardianPhone,
          data.guardianEmail,
          data.contactPhone || null,
          data.address || null,
          data.schoolName || null,
          data.currentGrade || null,
          data.academicNotes || null,
          data.requestedProgramId || null,
          data.preferredLevel || null,
          data.preferredSchedule || null,
          data.additionalDetails || null,
        ]
      );
      const application = appRes.rows[0];

      // Audit log entry
      await client.query(
        `INSERT INTO audit_logs (actor_id, actor_role, action, target_entity, target_id, details, ip_address)
         VALUES ($1, 'student', 'APPLICATION_SUBMITTED', 'student_applications', $2, $3, $4);`,
        [
          userId,
          application.id,
          JSON.stringify({
            studentName: data.studentName,
            guardianName: data.guardianName,
            email: data.email,
          }),
          req.ip || null,
        ]
      );

      return {
        applicationId: application.id,
        submittedAt: application.submitted_at,
      };
    });

    res.status(201).json({
      message: 'Your application has been submitted successfully and is currently awaiting administrative review.',
      applicationId: result.applicationId,
      submittedAt: result.submittedAt,
    });
  } catch (err) {
    console.error('[Applications API] Submission error:', err);
    res.status(500).json({ error: 'Internal server error while processing your application.' });
  }
});

// GET /api/applications - Admin: List Applications with Filters
applicationsRouter.get(
  '/',
  requireAuth,
  requireRole('admin'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const statusFilter = (req.query.status as string) || 'all';
      const search = ((req.query.search as string) || '').trim();

      let queryText = `
        SELECT 
          a.id,
          a.student_name,
          a.date_of_birth,
          a.guardian_name,
          a.guardian_phone,
          a.guardian_email,
          a.status,
          a.submitted_at,
          a.reviewed_at,
          u.email as account_email,
          p.name as requested_program_name,
          p.id as requested_program_id
        FROM student_applications a
        JOIN users u ON a.user_id = u.id
        LEFT JOIN programs p ON a.requested_program_id = p.id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (statusFilter !== 'all') {
        params.push(statusFilter);
        queryText += ` AND a.status = $${params.length}`;
      }

      if (search) {
        params.push(`%${search}%`);
        const pIdx = params.length;
        queryText += ` AND (a.student_name ILIKE $${pIdx} OR a.guardian_name ILIKE $${pIdx} OR u.email ILIKE $${pIdx})`;
      }

      queryText += ' ORDER BY a.submitted_at DESC';

      const result = await query(queryText, params);
      res.json({ applications: result.rows });
    } catch (err) {
      console.error('[Applications API] List error:', err);
      res.status(500).json({ error: 'Failed to retrieve applications.' });
    }
  }
);

// GET /api/applications/:id - Admin: Detailed Application View
applicationsRouter.get(
  '/:id',
  requireAuth,
  requireRole('admin'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const result = await query(
        `SELECT 
          a.*,
          u.email as account_email,
          u.account_status,
          p.name as requested_program_name,
          admin_u.email as reviewed_by_email
        FROM student_applications a
        JOIN users u ON a.user_id = u.id
        LEFT JOIN programs p ON a.requested_program_id = p.id
        LEFT JOIN users admin_u ON a.reviewed_by = admin_u.id
        WHERE a.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Application not found.' });
        return;
      }

      res.json({ application: result.rows[0] });
    } catch (err) {
      console.error('[Applications API] Detail error:', err);
      res.status(500).json({ error: 'Failed to retrieve application details.' });
    }
  }
);

// POST /api/applications/:id/reject - Admin: Reject Application
applicationsRouter.post(
  '/:id/reject',
  requireAuth,
  requireRole('admin'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      if (!reason || typeof reason !== 'string' || reason.trim().length < 5) {
        res.status(400).json({ error: 'A specific rejection reason (minimum 5 characters) is required.' });
        return;
      }

      const adminId = req.currentUser!.id;

      await withTransaction(async (client) => {
        // Lock row to prevent concurrent processing
        const appRes = await client.query(
          'SELECT id, user_id, status FROM student_applications WHERE id = $1 FOR UPDATE',
          [id]
        );

        if (appRes.rows.length === 0) {
          throw { status: 404, message: 'Application not found.' };
        }

        const app = appRes.rows[0];
        if (app.status !== 'pending') {
          throw { status: 400, message: `Application cannot be rejected because it is already ${app.status}.` };
        }

        // 1. Update application status
        await client.query(
          `UPDATE student_applications 
           SET status = 'rejected', rejection_reason = $1, reviewed_at = NOW(), reviewed_by = $2
           WHERE id = $3`,
          [reason.trim(), adminId, id]
        );

        // 2. Update user account status
        await client.query(
          `UPDATE users SET account_status = 'rejected', updated_at = NOW() WHERE id = $1`,
          [app.user_id]
        );

        // 3. Record audit log
        await client.query(
          `INSERT INTO audit_logs (actor_id, actor_role, action, target_entity, target_id, details, ip_address)
           VALUES ($1, 'admin', 'APPLICATION_REJECTED', 'student_applications', $2, $3, $4);`,
          [adminId, id, JSON.stringify({ reason: reason.trim(), userId: app.user_id }), req.ip || null]
        );
      });

      res.json({ message: 'Application rejected successfully.' });
    } catch (err: any) {
      if (err.status) {
        res.status(err.status).json({ error: err.message });
        return;
      }
      console.error('[Applications API] Rejection error:', err);
      res.status(500).json({ error: 'Failed to reject application.' });
    }
  }
);

const approvalSchema = z.object({
  programId: z.string().uuid('Valid Program ID is required'),
  batchId: z.string().uuid('Valid Batch ID is required'),
  teacherId: z.string().uuid('Valid Teacher ID is required'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid Start Date (YYYY-MM-DD) is required').optional(),
});

// POST /api/applications/:id/approve-and-activate - Admin: Transactional Enrollment & Activation
applicationsRouter.post(
  '/:id/approve-and-activate',
  requireAuth,
  requireRole('admin'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const parseResult = approvalSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          error: 'Validation failed',
          details: parseResult.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
        });
        return;
      }

      const { programId, batchId, teacherId, startDate } = parseResult.data;
      const adminId = req.currentUser!.id;

      const result = await withTransaction(async (client) => {
        // 1. Lock and validate application
        const appRes = await client.query(
          `SELECT * FROM student_applications WHERE id = $1 FOR UPDATE`,
          [id]
        );

        if (appRes.rows.length === 0) {
          throw { status: 404, message: 'Application not found.' };
        }

        const app = appRes.rows[0];
        if (app.status !== 'pending') {
          throw { status: 400, message: `Application cannot be approved because it is currently ${app.status}.` };
        }

        // 2. Validate Program exists and is active
        const programRes = await client.query(
          'SELECT id, name, is_active FROM programs WHERE id = $1',
          [programId]
        );
        if (programRes.rows.length === 0 || !programRes.rows[0].is_active) {
          throw { status: 400, message: 'Selected program is invalid or inactive.' };
        }
        const program = programRes.rows[0];

        // 3. Lock and validate Batch and check capacity
        const batchRes = await client.query(
          'SELECT id, name, program_id, capacity, is_active FROM batches WHERE id = $1 FOR UPDATE',
          [batchId]
        );
        if (batchRes.rows.length === 0 || !batchRes.rows[0].is_active) {
          throw { status: 400, message: 'Selected batch is invalid or inactive.' };
        }
        const batch = batchRes.rows[0];

        if (batch.program_id !== programId) {
          throw { status: 400, message: 'Selected batch does not belong to the selected program.' };
        }

        const enrollmentCountRes = await client.query(
          `SELECT COUNT(*)::int as active_count 
           FROM enrollments 
           WHERE batch_id = $1 AND status = 'active'`,
          [batchId]
        );
        const currentActiveCount = enrollmentCountRes.rows[0].active_count;
        if (currentActiveCount >= batch.capacity) {
          throw {
            status: 400,
            message: `Selected batch (${batch.name}) has reached full capacity (${currentActiveCount}/${batch.capacity}).`,
          };
        }

        // 4. Validate Teacher exists and is active
        const teacherRes = await client.query(
          'SELECT id, full_name, status FROM teachers WHERE id = $1',
          [teacherId]
        );
        if (teacherRes.rows.length === 0 || teacherRes.rows[0].status !== 'active') {
          throw { status: 400, message: 'Selected teacher is invalid or inactive.' };
        }
        const teacher = teacherRes.rows[0];

        // 5. Invariant check: Verify user doesn't already have an active student row
        const existingStudentRes = await client.query(
          'SELECT id FROM students WHERE user_id = $1',
          [app.user_id]
        );
        if (existingStudentRes.rows.length > 0) {
          throw { status: 400, message: 'A student record already exists for this user account.' };
        }

        // 6. Update application status to approved
        await client.query(
          `UPDATE student_applications 
           SET status = 'approved', reviewed_at = NOW(), reviewed_by = $1
           WHERE id = $2`,
          [adminId, id]
        );

        // 7. Create student record
        const studentRes = await client.query(
          `INSERT INTO students (
            user_id, application_id, full_name, date_of_birth, gender,
            guardian_name, guardian_phone, guardian_email, address,
            school_name, current_grade, status
          ) VALUES (
            $1, $2, $3, $4, $5,
            $6, $7, $8, $9,
            $10, $11, 'active'
          ) RETURNING id;`,
          [
            app.user_id,
            app.id,
            app.student_name,
            app.date_of_birth,
            app.gender,
            app.guardian_name,
            app.guardian_phone,
            app.guardian_email,
            app.address,
            app.school_name,
            app.current_grade,
          ]
        );
        const studentId = studentRes.rows[0].id;

        // 8. Create enrollment
        const effectiveStartDate = startDate || new Date().toISOString().split('T')[0];
        const enrollmentRes = await client.query(
          `INSERT INTO enrollments (
            student_id, program_id, batch_id, teacher_id, start_date, status
          ) VALUES ($1, $2, $3, $4, $5, 'active')
          RETURNING id;`,
          [studentId, programId, batchId, teacherId, effectiveStartDate]
        );
        const enrollmentId = enrollmentRes.rows[0].id;

        // 9. Activate user account
        await client.query(
          `UPDATE users SET account_status = 'active', updated_at = NOW() WHERE id = $1`,
          [app.user_id]
        );

        // 10. Record audit log
        await client.query(
          `INSERT INTO audit_logs (actor_id, actor_role, action, target_entity, target_id, details, ip_address)
           VALUES ($1, 'admin', 'STUDENT_ACTIVATED', 'students', $2, $3, $4);`,
          [
            adminId,
            studentId,
            JSON.stringify({
              applicationId: app.id,
              userId: app.user_id,
              studentName: app.student_name,
              programName: program.name,
              batchName: batch.name,
              teacherName: teacher.full_name,
              enrollmentId,
            }),
            req.ip || null,
          ]
        );

        return {
          studentId,
          enrollmentId,
          studentName: app.student_name,
          programName: program.name,
          batchName: batch.name,
          teacherName: teacher.full_name,
        };
      });

      res.status(200).json({
        message: 'Student approved and activated successfully.',
        data: result,
      });
    } catch (err: any) {
      if (err.status) {
        res.status(err.status).json({ error: err.message });
        return;
      }
      console.error('[Applications API] Approval error:', err);
      res.status(500).json({ error: 'Failed to approve and activate student.' });
    }
  }
);
