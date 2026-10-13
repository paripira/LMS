import { execSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

function findPgDump(): string {
  // Check PATH first
  try {
    execSync('pg_dump --version', { stdio: 'ignore' });
    return 'pg_dump';
  } catch {
    // Check standard Windows PostgreSQL install folders
    const base = 'C:\\Program Files\\PostgreSQL';
    if (existsSync(base)) {
      const versions = readdirSync(base).sort().reverse();
      for (const v of versions) {
        const bin = join(base, v, 'bin', 'pg_dump.exe');
        if (existsSync(bin)) return bin;
      }
    }
    throw new Error('pg_dump tidak ditemukan di PATH atau Program Files. Pastikan PostgreSQL terpasang.');
  }
}

async function main() {
  const dbUrl = process.env.DATABASE_URL || 'postgres://lms:lms@localhost:5432/lms_test';
  const outFile = join(process.cwd(), 'backup_lms.sql');
  const pgDumpPath = findPgDump();

  console.log('Menjalankan dump database...');
  console.log(`Target: ${dbUrl}`);
  console.log(`pg_dump: ${pgDumpPath}`);

  const cmd = `"${pgDumpPath}" --dbname="${dbUrl}" --clean --if-exists --no-owner --no-privileges --inserts -f "${outFile}"`;
  execSync(cmd, { stdio: 'inherit' });

  // Clean psql-specific metacommands (like \restrict) and ensure search_path=public
  let sql = readFileSync(outFile, 'utf8');
  sql = sql.replace(/^\\.*$/gm, '-- $&');
  sql += '\n\n-- Reset search_path to public for immediate use\nSET search_path = public;\n';
  writeFileSync(outFile, sql, 'utf8');

  console.log(`\nBerhasil membuat backup database di: ${outFile}`);
  console.log('File ini siap dipindahkan dan direstore ke laptop atau komputer lain.');
}

main().catch((err) => {
  console.error('Gagal membuat dump database:', err);
  process.exit(1);
});
