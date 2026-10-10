// One-time first-run setup: creates the admin account + the current academic year/semesters.
import postgres from 'postgres';
import { hashPassword, randomPassword } from '../src/lib/password';

async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1, onnotice: () => {} });
  try {
    const [exists] = await sql`SELECT 1 FROM users WHERE role = 'admin' AND deleted_at IS NULL LIMIT 1`;
    if (exists) return console.log('Admin sudah ada. Tidak ada yang diubah.');

    const username = process.env.ADMIN_USERNAME ?? 'admin';
    const pw = randomPassword(12);
    const now = new Date();
    const second = now.getMonth() < 6; // Jan–Jun = semester genap
    const start = second ? now.getFullYear() - 1 : now.getFullYear();

    await sql.begin(async (tx) => {
      await tx`INSERT INTO users (username, password_hash, role, full_name, must_change_password)
               VALUES (${username}, ${await hashPassword(pw)}, 'admin', 'Administrator', true)`;
      const [ay] = await tx`INSERT INTO academic_years (name, starts_on, ends_on, is_active)
               VALUES (${`${start}/${start + 1}`}, ${`${start}-07-01`}, ${`${start + 1}-06-30`}, true) RETURNING id`;
      await tx`INSERT INTO semesters (academic_year_id, kind, starts_on, ends_on, status) VALUES
               (${ay.id}, 'ganjil', ${`${start}-07-01`}, ${`${start}-12-31`}, ${second ? 'closed' : 'active'}),
               (${ay.id}, 'genap',  ${`${start + 1}-01-01`}, ${`${start + 1}-06-30`}, ${second ? 'active' : 'upcoming'})`;
      await tx`UPDATE school_settings SET updated_at = now()`;
    });

    console.log(`\nAkun admin dibuat.\n  Nama pengguna : ${username}\n  Kata sandi    : ${pw}\n\nCatat sekarang; Anda akan diminta menggantinya saat login pertama.\n`);
  } finally {
    await sql.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
