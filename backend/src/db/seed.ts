import bcrypt from 'bcryptjs';
import { pool, withTransaction } from './index.js';
import dotenv from 'dotenv';

dotenv.config();

async function seed() {
  console.log('[Seed] Starting database seed...');

  await withTransaction(async (client) => {
    // 1. Seed Programs
    console.log('[Seed] Seeding Programs...');
    const programRes = await client.query(
      `INSERT INTO programs (name, slug, description, level, duration, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (slug) DO UPDATE 
       SET name = EXCLUDED.name, description = EXCLUDED.description
       RETURNING id;`,
      [
        'Abacus',
        'abacus',
        'Our structured Abacus curriculum guides students through tactile and visual calculation techniques, developing strong number sense, deep concentration, and mental arithmetic fluency.',
        'Foundational to Advanced',
        'Multi-level progressive',
        true,
      ]
    );
    const abacusProgramId = programRes.rows[0].id;

    // 2. Seed Initial Teacher User & Record
    console.log('[Seed] Seeding Teacher...');
    const teacherEmail = 'teacher.sarah@evolve.edu';
    const teacherPassword = process.env.SEED_TEACHER_PASSWORD || 'TeacherEvolve2026!';
    const teacherHash = await bcrypt.hash(teacherPassword, 12);

    let teacherUserId: string;
    const existingTeacherUser = await client.query('SELECT id FROM users WHERE email = $1', [teacherEmail]);
    if (existingTeacherUser.rows.length === 0) {
      const userRes = await client.query(
        `INSERT INTO users (email, password_hash, role, account_status)
         VALUES ($1, $2, 'teacher', 'active')
         RETURNING id;`,
        [teacherEmail, teacherHash]
      );
      teacherUserId = userRes.rows[0].id;
    } else {
      teacherUserId = existingTeacherUser.rows[0].id;
    }

    let teacherId: string;
    const existingTeacher = await client.query('SELECT id FROM teachers WHERE user_id = $1', [teacherUserId]);
    if (existingTeacher.rows.length === 0) {
      const teacherRes = await client.query(
        `INSERT INTO teachers (user_id, full_name, phone, qualification, specialization, status)
         VALUES ($1, $2, $3, $4, $5, 'active')
         RETURNING id;`,
        [
          teacherUserId,
          'Sarah Jenkins',
          '+1 (555) 234-5678',
          'B.Ed, Certified Abacus Master Trainer',
          'Primary Mental Arithmetic & Cognitive Skills',
        ]
      );
      teacherId = teacherRes.rows[0].id;
    } else {
      teacherId = existingTeacher.rows[0].id;
    }

    // 3. Seed Batches
    console.log('[Seed] Seeding Batches...');
    const batches = [
      {
        name: 'Abacus Level 1 - Weekday (Mon/Wed)',
        level: 'Foundation',
        schedule: 'Mon & Wed 4:00 PM - 5:15 PM',
        capacity: 12,
      },
      {
        name: 'Abacus Level 1 - Weekend (Sat/Sun)',
        level: 'Foundation',
        schedule: 'Sat & Sun 10:00 AM - 11:15 AM',
        capacity: 10,
      },
    ];

    for (const b of batches) {
      const existingBatch = await client.query(
        'SELECT id FROM batches WHERE program_id = $1 AND name = $2',
        [abacusProgramId, b.name]
      );
      if (existingBatch.rows.length === 0) {
        await client.query(
          `INSERT INTO batches (program_id, name, level, schedule, start_date, capacity, is_active, teacher_id)
           VALUES ($1, $2, $3, $4, CURRENT_DATE, $5, true, $6);`,
          [abacusProgramId, b.name, b.level, b.schedule, b.capacity, teacherId]
        );
      }
    }

    // 4. Seed Admin if environment variables are defined
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@evolve.edu').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (adminPassword) {
      console.log(`[Seed] Checking Admin account (${adminEmail})...`);
      const existingAdmin = await client.query('SELECT id FROM users WHERE email = $1', [adminEmail]);
      if (existingAdmin.rows.length === 0) {
        const adminHash = await bcrypt.hash(adminPassword, 12);
        const adminRes = await client.query(
          `INSERT INTO users (email, password_hash, role, account_status)
           VALUES ($1, $2, 'admin', 'active')
           RETURNING id;`,
          [adminEmail, adminHash]
        );
        const adminId = adminRes.rows[0].id;

        await client.query(
          `INSERT INTO audit_logs (actor_id, actor_role, action, target_entity, target_id, details)
           VALUES ($1, 'admin', 'ADMIN_BOOTSTRAPPED', 'users', $2, $3);`,
          [adminId, adminId, JSON.stringify({ email: adminEmail, notes: 'Seeded via bootstrap' })]
        );
        console.log('[Seed] Admin account successfully created.');
      } else {
        console.log('[Seed] Admin account already exists.');
      }
    }

    console.log('[Seed] Database seeding completed successfully.');
  });

  await pool.end();
}

seed().catch((err) => {
  console.error('[Seed] Seeding failed:', err);
  process.exit(1);
});
