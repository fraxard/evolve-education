import bcrypt from 'bcryptjs';
import { pool, withTransaction } from '../db/index.js';
import dotenv from 'dotenv';

dotenv.config();

async function bootstrapAdmin() {
  console.log('[Admin Bootstrap] Starting secure admin creation...');

  const email = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('[Admin Bootstrap] Error: ADMIN_EMAIL and ADMIN_PASSWORD must be configured in .env');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('[Admin Bootstrap] Error: ADMIN_PASSWORD must be at least 8 characters.');
    process.exit(1);
  }

  await withTransaction(async (client) => {
    const existing = await client.query('SELECT id, role, account_status FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      console.log(`[Admin Bootstrap] Account for ${email} already exists (Role: ${existing.rows[0].role}, Status: ${existing.rows[0].account_status}).`);
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const userRes = await client.query(
      `INSERT INTO users (email, password_hash, role, account_status)
       VALUES ($1, $2, 'admin', 'active')
       RETURNING id;`,
      [email, passwordHash]
    );

    const adminId = userRes.rows[0].id;

    await client.query(
      `INSERT INTO audit_logs (actor_id, actor_role, action, target_entity, target_id, details)
       VALUES ($1, 'admin', 'ADMIN_BOOTSTRAPPED', 'users', $2, $3);`,
      [adminId, adminId, JSON.stringify({ email, method: 'CLI Bootstrap Script' })]
    );

    console.log(`[Admin Bootstrap] Success: Admin account created for ${email}`);
  });

  await pool.end();
}

bootstrapAdmin().catch((err) => {
  console.error('[Admin Bootstrap] Execution failed:', err);
  process.exit(1);
});
