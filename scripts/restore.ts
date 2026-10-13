import postgres from 'postgres';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL belum diatur di file .env atau .env.test');
  }

  const backupFile = join(process.cwd(), 'backup_lms.sql');
  if (!existsSync(backupFile)) {
    throw new Error(`File ${backupFile} tidak ditemukan. Pastikan file backup_lms.sql sudah ada di folder project.`);
  }

  console.log('Memulai proses restore database...');
  console.log(`Database URL: ${dbUrl}`);
  console.log(`Menggunakan file: ${backupFile}`);

  const sql = postgres(dbUrl, { max: 1, idle_timeout: 30 });

  try {
    // Read and execute backup SQL
    let content = readFileSync(backupFile, 'utf8');
    // Ensure no client-specific metacommands break execution
    content = content.replace(/^\\.*$/gm, '-- $&');
    content += '\n\nSET search_path = public;\n';

    await sql.unsafe(content);

    // Verify record counts
    await sql`SET search_path = public`;
    const [counts] = await sql`
      SELECT 
        (SELECT count(*) FROM users WHERE deleted_at IS NULL) as users_count,
        (SELECT count(*) FROM teachers WHERE deleted_at IS NULL) as teachers_count,
        (SELECT count(*) FROM students WHERE deleted_at IS NULL) as students_count,
        (SELECT count(*) FROM classes WHERE deleted_at IS NULL) as classes_count
    `;

    console.log('\n===========================================');
    console.log('RESTORE DATABASE BERHASIL!');
    console.log(`- Jumlah Pengguna : ${counts.users_count}`);
    console.log(`- Jumlah Guru     : ${counts.teachers_count}`);
    console.log(`- Jumlah Siswa    : ${counts.students_count}`);
    console.log(`- Jumlah Kelas    : ${counts.classes_count}`);
    console.log('===========================================');
    console.log('Database siap digunakan untuk demonstrasi!');
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error('\nGagal merestore database:', err);
  process.exit(1);
});
