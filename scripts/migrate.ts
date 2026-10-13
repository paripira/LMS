import postgres from 'postgres';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const FILES = ['schema.sql', '002_extras.sql', '003_features.sql', '004_features_phase2.sql', '005_multi_jenjang.sql', '006_targeted_announcements.sql', '007_flexible_teacher_nip.sql']; // append new migration files here, in order

export async function migrate() {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1, onnotice: () => {} });
  try {
    await sql`CREATE TABLE IF NOT EXISTS schema_migrations (
      name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())`;
    for (const f of FILES) {
      const [done] = await sql`SELECT 1 FROM schema_migrations WHERE name = ${f}`;
      if (done) continue;
      await sql.unsafe(readFileSync(join(__dirname, '..', 'database', f), 'utf8'));
      await sql`INSERT INTO schema_migrations (name) VALUES (${f})`;
      console.log('applied', f);
    }
  } finally {
    await sql.end();
  }
}

if (require.main === module) {
  migrate().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
