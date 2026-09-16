import express from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './db/index.js';
import { authRouter } from './routes/auth.js';
import { applicationsRouter } from './routes/applications.js';
import { studentsRouter } from './routes/students.js';
import { teachersRouter } from './routes/teachers.js';
import { programsRouter } from './routes/programs.js';
import { batchesRouter } from './routes/batches.js';
import { enrollmentsRouter } from './routes/enrollments.js';
import { auditLogsRouter } from './routes/auditLogs.js';
import { dashboardRouter } from './routes/dashboard.js';

dotenv.config();

export const app = express();
const PgSession = connectPgSimple(session);

// Trust proxy if in production
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// 1. CORS Configuration
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl) or matching client
      if (
        !origin ||
        origin === clientOrigin ||
        origin === 'http://localhost:5173' ||
        origin === 'http://admin.localhost:5173' ||
        origin.endsWith('.localhost:5173') ||
        (process.env.CLIENT_DOMAIN && origin.endsWith(`.${process.env.CLIENT_DOMAIN}`))
      ) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev, can restrict in strict prod
      }
    },
    credentials: true,
  })
);

// 2. Request Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. PostgreSQL-Backed Session Store with Active Pruning
app.use(
  session({
    store: new PgSession({
      pool,
      tableName: 'session',
      createTableIfMissing: false, // Created via migration 001
      pruneSessionInterval: 900, // Explicitly runs pruning every 15 minutes (900 seconds)
    }),
    name: process.env.SESSION_NAME || 'evolve_sid',
    secret: process.env.SESSION_SECRET || 'fallback_dev_session_secret_replace_in_prod',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      domain: process.env.COOKIE_DOMAIN || undefined,
    },
  })
);

// 4. API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRouter);
app.use('/api/applications', applicationsRouter);
app.use('/api/students', studentsRouter);
app.use('/api/teachers', teachersRouter);
app.use('/api/programs', programsRouter);
app.use('/api/batches', batchesRouter);
app.use('/api/enrollments', enrollmentsRouter);
app.use('/api/audit-logs', auditLogsRouter);
app.use('/api/admin/dashboard', dashboardRouter);

// 5. 404 Handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

// 6. Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Global Error]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error.',
  });
});

export default app;
