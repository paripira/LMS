// DESTRUCTIVE: wipes every table, then inserts demo data. Refuses to run on non-test databases.
import postgres from 'postgres';
import { hashPassword } from '../src/lib/password';
import { ID, PASSWORD, QUESTION_IDS } from './seed-ids';

export async function seed() {
  const url = process.env.DATABASE_URL!;
  const looksLikeTest = /test/i.test(new URL(url).pathname);
  if (process.env.NODE_ENV === 'production' || (!looksLikeTest && !process.env.ALLOW_SEED)) {
    throw new Error('Seed menghapus SEMUA data. Gunakan database yang namanya mengandung "test" (atau set ALLOW_SEED=1).');
  }
  const sql = postgres(url, { max: 1, onnotice: () => {} });
  try {
    const tables = await sql`SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> 'schema_migrations'`;
    await sql.unsafe(`TRUNCATE ${tables.map((t) => `"${t.tablename}"`).join(', ')} RESTART IDENTITY CASCADE`);

    const hash = await hashPassword(PASSWORD);
    await sql`INSERT INTO school_settings (name, address, principal_name, principal_nip)
              VALUES ('SMP Contoh Nusantara', 'Jl. Pendidikan No. 1, Batam', 'Dra. Kepala Sekolah, M.Pd', '19700101 199501 2 001')`;

    await sql`INSERT INTO academic_years (id, name, starts_on, ends_on, is_active)
              VALUES (${ID.year}, '2026/2027', '2026-07-01', '2027-06-30', true)`;
    await sql`INSERT INTO semesters (id, academic_year_id, kind, starts_on, ends_on, status) VALUES
              (${ID.semGanjil}, ${ID.year}, 'ganjil', '2026-07-01', '2026-12-31', 'active'),
              (${ID.semGenap},  ${ID.year}, 'genap',  '2027-01-01', '2027-06-30', 'upcoming')`;

    const users: [string, string, string, string][] = [
      [ID.userAdmin, 'admin', 'admin', 'Admin Sekolah'],
      [ID.userGuru1, 'guru1', 'guru', 'Guru Satu'],
      [ID.userGuru2, 'guru2', 'guru', 'Guru Dua'],
      [ID.userKepsek, 'kepsek', 'kepala_sekolah', 'Kepala Sekolah'],
      [ID.userOrtu, 'ortu1', 'orang_tua', 'Orang Tua Satu'],
      [ID.userS1, 'siswa1', 'siswa', 'Siswa Satu'],
      [ID.userS2, 'siswa2', 'siswa', 'Siswa Dua'],
      [ID.userS3, 'siswa3', 'siswa', 'Siswa Tiga'],
    ];
    for (const [id, username, role, name] of users) {
      await sql`INSERT INTO users (id, username, password_hash, role, full_name)
                VALUES (${id}, ${username}, ${hash}, ${role}::user_role, ${name})`;
    }

    await sql`INSERT INTO teachers (id, user_id, nip, full_name) VALUES
              (${ID.teacher1}, ${ID.userGuru1}, '198001', 'Guru Satu'),
              (${ID.teacher2}, ${ID.userGuru2}, '198002', 'Guru Dua')`;
    await sql`INSERT INTO students (id, user_id, nis, full_name, gender, jenjang) VALUES
              (${ID.s1}, ${ID.userS1}, '1001', 'Siswa Satu', 'L', 'SMP'),
              (${ID.s2}, ${ID.userS2}, '1002', 'Siswa Dua',  'P', 'SMP'),
              (${ID.s3}, ${ID.userS3}, '1003', 'Siswa Tiga', 'L', 'SMP')`;
    await sql`INSERT INTO parent_students (parent_user_id, student_id, relation) VALUES
              (${ID.userOrtu}, ${ID.s1}, 'ayah'), (${ID.userOrtu}, ${ID.s2}, 'ayah')`;

    await sql`INSERT INTO classes (id, academic_year_id, jenjang, grade_level, name, homeroom_teacher_id)
              VALUES (${ID.class7A}, ${ID.year}, 'SMP', 7, '7A', ${ID.teacher1})`;
    for (const sid of [ID.s1, ID.s2, ID.s3]) {
      await sql`INSERT INTO enrollments (student_id, class_id, academic_year_id) VALUES (${sid}, ${ID.class7A}, ${ID.year})`;
    }

    await sql`INSERT INTO subjects (id, jenjang, code, name, kkm) VALUES
              (${ID.subjIPA}, 'SMP', 'IPA', 'Ilmu Pengetahuan Alam', 75),
              (${ID.subjMTK}, 'SMP', 'MTK', 'Matematika', 75)`;
    await sql`INSERT INTO teaching_assignments (id, teacher_id, subject_id, class_id, semester_id) VALUES
              (${ID.taIPA}, ${ID.teacher1}, ${ID.subjIPA}, ${ID.class7A}, ${ID.semGanjil}),
              (${ID.taMTK}, ${ID.teacher2}, ${ID.subjMTK}, ${ID.class7A}, ${ID.semGanjil})`;

    // ---- one published exam with 5 multiple-choice questions ----
    await sql`INSERT INTO question_banks (id, teacher_id, subject_id, grade_level, title)
              VALUES (${ID.bank}, ${ID.teacher1}, ${ID.subjIPA}, 7, 'Bank Soal IPA 7')`;
    const opts = (a: string, b: string, c: string, d: string) =>
      [{ id: 'A', text: a }, { id: 'B', text: b }, { id: 'C', text: c }, { id: 'D', text: d }];
    const qs: [string, ReturnType<typeof opts>, string][] = [
      ['Berapa hasil 2 + 3?', opts('4', '5', '6', '7'), 'B'],
      ['Planet terdekat dari Matahari?', opts('Venus', 'Bumi', 'Merkurius', 'Mars'), 'C'],
      ['Satuan SI untuk gaya adalah …', opts('Joule', 'Newton', 'Watt', 'Pascal'), 'B'],
      ['Wujud air di suhu 120°C (tekanan 1 atm)?', opts('Padat', 'Cair', 'Gas', 'Plasma'), 'C'],
      ['Gas yang dihirup manusia untuk bernapas?', opts('Oksigen', 'Nitrogen', 'Helium', 'Argon'), 'A'],
    ];
    for (let i = 0; i < qs.length; i++) {
      await sql`INSERT INTO questions (id, bank_id, type, body, options, points)
                VALUES (${QUESTION_IDS[i]}, ${ID.bank}, 'pilihan_ganda', ${qs[i][0]}, ${sql.json(qs[i][1])}, 1)`;
      await sql`INSERT INTO question_keys (question_id, answer) VALUES (${QUESTION_IDS[i]}, ${sql.json(qs[i][2])})`;
    }
    await sql`INSERT INTO exams (id, teaching_assignment_id, semester_id, title, duration_minutes, opens_at, closes_at,
                                 status, settings, created_by)
              VALUES (${ID.exam}, ${ID.taIPA}, ${ID.semGanjil}, 'Ulangan Harian IPA', 30,
                      now() - interval '1 hour', now() + interval '1 day', 'published',
                      '{"show_score": true}', ${ID.userGuru1})`;
    for (let i = 0; i < QUESTION_IDS.length; i++) {
      await sql`INSERT INTO exam_questions (exam_id, question_id, position) VALUES (${ID.exam}, ${QUESTION_IDS[i]}, ${i + 1})`;
    }

    await sql`INSERT INTO announcements (title, body, pinned, author_id)
              VALUES ('Selamat Datang', 'Selamat datang di sistem informasi sekolah.', true, ${ID.userAdmin})`;

    // Sample materials, assignments, schedules, notifications
    await sql`INSERT INTO materials (teaching_assignment_id, title, description, url)
              VALUES (${ID.taIPA}, 'Modul 1: Besaran dan Pengukuran', 'Pelajari ringkasan materi besaran pokok dan turunan.', 'https://drive.google.com/example-modul-ipa')`;

    await sql`INSERT INTO assignments (teaching_assignment_id, title, instructions, url, due_at)
              VALUES (${ID.taIPA}, 'Tugas Mandiri: Konversi Satuan SI', 'Kerjakan 10 soal di lembar kerja lalu tempelkan link Google Docs Anda.', 'https://docs.google.com/example-tugas-ipa', now() + interval '3 days')`;

    await sql`INSERT INTO schedules (academic_year_id, semester_id, class_id, teaching_assignment_id, day_of_week, start_time, end_time, room) VALUES
              (${ID.year}, ${ID.semGanjil}, ${ID.class7A}, ${ID.taIPA}, 1, '07:30', '09:00', 'R. 7A'),
              (${ID.year}, ${ID.semGanjil}, ${ID.class7A}, ${ID.taMTK}, 2, '07:30', '09:00', 'R. 7A')`;

    await sql`INSERT INTO notifications (user_id, title, body, link, type) VALUES
              (${ID.userS1}, 'Ujian Baru Dibuka', 'Ulangan Harian IPA sudah dibuka dan siap dikerjakan.', '/siswa', 'ujian'),
              (${ID.userOrtu}, 'Selamat Datang di Portal Orang Tua', 'Pantau kehadiran, nilai, dan e-Rapor ananda melalui portal ini.', '/ortu', 'info')`;
  } finally {
    await sql.end();
  }
}

if (require.main === module) {
  seed()
    .then(() => console.log(`Seed selesai. Semua akun demo memakai kata sandi: ${PASSWORD}`))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
