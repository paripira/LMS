import { z } from 'zod';
import { sql, handle, requireRole, ApiError } from '@/lib/server';
import { hashPassword, randomPassword } from '@/lib/password';
import {
  ROW_SCHEMAS,
  type ClassRow,
  type ImportEntity,
  type StudentRow,
  type TeacherRow,
  type SubjectRow,
  type AssignmentRow,
  type EnrollmentRow,
} from '@/lib/import/schemas';

interface Cred { username: string; password: string; name: string; role: string }
interface Counts { inserted: number; updated: number }

const Body = z.object({ rows: z.array(z.unknown()).min(1).max(100), createAccounts: z.boolean().default(false) });

// ---------- students ----------
async function importStudents(rows: StudentRow[], createAccounts: boolean, creds: Cred[]): Promise<Counts> {
  const prep = await Promise.all(
    rows.map(async (r) => {
      const sp = createAccounts ? String(r.nis) : null;
      const pp = r.ortu_username ? String(r.nis) : null;
      return { sp, sh: sp ? await hashPassword(sp) : null, pp, ph: pp ? await hashPassword(pp) : null };
    }),
  );

  return sql.begin(async (tx) => {
    const [ay] = await tx`SELECT id FROM academic_years WHERE is_active AND deleted_at IS NULL`;
    const classes = ay ? await tx`SELECT id, name FROM classes WHERE academic_year_id = ${ay.id} AND deleted_at IS NULL` : [];
    const cmap = new Map(classes.map((c) => [String(c.name).toLowerCase(), c.id as string]));
    const c: Counts = { inserted: 0, updated: 0 };

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const p = prep[i];
      let classId: string | undefined;
      if (r.kelas) {
        classId = cmap.get(r.kelas.toLowerCase());
        if (!classId) throw new ApiError(422, `Kelas "${r.kelas}" (siswa ${r.nama}) belum ada di tahun ajaran aktif. Impor/buat data kelas terlebih dahulu.`);
      }

      const [st] = await tx`
        INSERT INTO students (nis, nisn, full_name, gender, birth_date, jenjang)
        VALUES (${r.nis}, ${r.nisn ?? null}, ${r.nama}, ${r.jk}, ${r.tanggal_lahir ?? null}, ${r.jenjang})
        ON CONFLICT (nis) WHERE deleted_at IS NULL
        DO UPDATE SET nisn = EXCLUDED.nisn, full_name = EXCLUDED.full_name, gender = EXCLUDED.gender,
                      birth_date = EXCLUDED.birth_date, jenjang = EXCLUDED.jenjang
        RETURNING id, user_id, (xmax = 0) AS inserted`;
      st.inserted ? c.inserted++ : c.updated++;

      if (classId && ay) {
        await tx`INSERT INTO enrollments (student_id, class_id, academic_year_id) VALUES (${st.id}, ${classId}, ${ay.id})
                 ON CONFLICT (student_id, academic_year_id) WHERE deleted_at IS NULL DO UPDATE SET class_id = EXCLUDED.class_id`;
      }

      if (p.sp && !st.user_id) {
        const [u] = await tx`INSERT INTO users (username, password_hash, role, full_name, must_change_password)
          VALUES (${r.nis}, ${p.sh}, 'siswa', ${r.nama}, true)
          ON CONFLICT (username) WHERE deleted_at IS NULL DO NOTHING RETURNING id`;
        if (u) {
          await tx`UPDATE students SET user_id = ${u.id} WHERE id = ${st.id}`;
          creds.push({ username: r.nis, password: p.sp, name: r.nama, role: 'siswa' });
        }
      }

      if (r.ortu_username && p.pp) {
        let [parent] = await tx`SELECT id FROM users WHERE username = ${r.ortu_username} AND deleted_at IS NULL`;
        if (!parent) {
          [parent] = await tx`INSERT INTO users (username, password_hash, role, full_name, must_change_password)
            VALUES (${r.ortu_username}, ${p.ph}, 'orang_tua', ${r.ortu_nama ?? `Orang tua ${r.nama}`}, true) RETURNING id`;
          creds.push({ username: r.ortu_username, password: p.pp, name: r.ortu_nama ?? `Orang tua ${r.nama}`, role: 'orang_tua' });
        } else {
          const [role] = await tx`SELECT role FROM users WHERE id = ${parent.id}`;
          if (role.role !== 'orang_tua') throw new ApiError(422, `Nama pengguna "${r.ortu_username}" sudah dipakai oleh akun non-orang tua.`);
        }
        await tx`INSERT INTO parent_students (parent_user_id, student_id) VALUES (${parent.id}, ${st.id})
                 ON CONFLICT (parent_user_id, student_id) WHERE deleted_at IS NULL DO NOTHING`;
      }
    }
    return c;
  });
}

// ---------- teachers ----------
async function importTeachers(rows: TeacherRow[], creds: Cred[]): Promise<Counts> {
  const prep = await Promise.all(rows.map(async () => { const pw = randomPassword(); return { pw, hash: await hashPassword(pw) }; }));
  return sql.begin(async (tx) => {
    const c: Counts = { inserted: 0, updated: 0 };
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const [ex] = await tx`SELECT t.id FROM teachers t JOIN users u ON u.id = t.user_id
                            WHERE u.username = ${r.username} AND t.deleted_at IS NULL`;
      if (ex) {
        await tx`UPDATE teachers SET nip = ${r.nip ?? null}, full_name = ${r.nama}, phone = ${r.telepon ?? null} WHERE id = ${ex.id}`;
        c.updated++;
        continue;
      }
      const [u] = await tx`INSERT INTO users (username, password_hash, role, full_name, must_change_password)
        VALUES (${r.username}, ${prep[i].hash}, 'guru', ${r.nama}, true)
        ON CONFLICT (username) WHERE deleted_at IS NULL DO NOTHING RETURNING id`;
      if (!u) throw new ApiError(422, `Nama pengguna "${r.username}" sudah dipakai oleh akun lain.`);
      await tx`INSERT INTO teachers (user_id, nip, full_name, phone) VALUES (${u.id}, ${r.nip ?? null}, ${r.nama}, ${r.telepon ?? null})`;
      creds.push({ username: r.username, password: prep[i].pw, name: r.nama, role: 'guru' });
      c.inserted++;
    }
    return c;
  });
}

// ---------- classes ----------
async function importClasses(rows: ClassRow[]): Promise<Counts> {
  return sql.begin(async (tx) => {
    const [ay] = await tx`SELECT id FROM academic_years WHERE is_active AND deleted_at IS NULL`;
    if (!ay) throw new ApiError(409, 'Belum ada tahun ajaran aktif. Buat tahun ajaran terlebih dahulu.');
    const c: Counts = { inserted: 0, updated: 0 };
    for (const r of rows) {
      let teacherId: string | null = null;
      if (r.wali_nip) {
        const [t] = await tx`SELECT id FROM teachers WHERE nip = ${r.wali_nip} AND deleted_at IS NULL`;
        if (!t) throw new ApiError(422, `Wali kelas dengan NIP ${r.wali_nip} (kelas ${r.nama}) tidak ditemukan. Impor data guru terlebih dahulu.`);
        teacherId = t.id;
      }
      const [k] = await tx`
        INSERT INTO classes (academic_year_id, jenjang, grade_level, name, homeroom_teacher_id)
        VALUES (${ay.id}, ${r.jenjang}, ${r.tingkat}, ${r.nama}, ${teacherId})
        ON CONFLICT (academic_year_id, name) WHERE deleted_at IS NULL
        DO UPDATE SET jenjang = EXCLUDED.jenjang, grade_level = EXCLUDED.grade_level,
                      homeroom_teacher_id = COALESCE(EXCLUDED.homeroom_teacher_id, classes.homeroom_teacher_id)
        RETURNING (xmax = 0) AS inserted`;
      k.inserted ? c.inserted++ : c.updated++;
    }
    return c;
  });
}

// ---------- subjects ----------
async function importSubjects(rows: SubjectRow[]): Promise<Counts> {
  return sql.begin(async (tx) => {
    const c: Counts = { inserted: 0, updated: 0 };
    for (const r of rows) {
      const [sub] = await tx`
        INSERT INTO subjects (code, name, jenjang, kkm)
        VALUES (${r.kode}, ${r.nama}, ${r.jenjang}, ${r.kkm})
        ON CONFLICT (jenjang, code) WHERE deleted_at IS NULL
        DO UPDATE SET name = EXCLUDED.name, kkm = EXCLUDED.kkm
        RETURNING (xmax = 0) AS inserted`;
      sub.inserted ? c.inserted++ : c.updated++;
    }
    return c;
  });
}

// ---------- assignments (teaching assignments) ----------
async function importAssignments(rows: AssignmentRow[]): Promise<Counts> {
  return sql.begin(async (tx) => {
    const [sem] = await sql`
      SELECT id, academic_year_id FROM semesters WHERE status = 'active' AND deleted_at IS NULL`;
    if (!sem) throw new ApiError(409, 'Belum ada semester aktif.');

    const c: Counts = { inserted: 0, updated: 0 };
    for (const r of rows) {
      // Find teacher
      const [t] = await tx`
        SELECT t.id FROM teachers t
        JOIN users u ON u.id = t.user_id
        WHERE (u.username = ${r.guru.toLowerCase()} OR t.nip = ${r.guru}) AND t.deleted_at IS NULL`;
      if (!t) throw new ApiError(422, `Guru "${r.guru}" tidak ditemukan.`);

      // Find subject
      const [sub] = await tx`
        SELECT id FROM subjects WHERE code = ${r.kode_mapel} AND deleted_at IS NULL`;
      if (!sub) throw new ApiError(422, `Mata pelajaran dengan kode "${r.kode_mapel}" tidak ditemukan.`);

      // Find class in active academic year
      const [cls] = await tx`
        SELECT id FROM classes WHERE name = ${r.nama_kelas} AND academic_year_id = ${sem.academic_year_id} AND deleted_at IS NULL`;
      if (!cls) throw new ApiError(422, `Kelas "${r.nama_kelas}" tidak ditemukan pada tahun ajaran aktif.`);

      const [ta] = await tx`
        INSERT INTO teaching_assignments (teacher_id, subject_id, class_id, semester_id)
        VALUES (${t.id}, ${sub.id}, ${cls.id}, ${sem.id})
        ON CONFLICT (subject_id, class_id, semester_id) WHERE deleted_at IS NULL
        DO UPDATE SET teacher_id = EXCLUDED.teacher_id
        RETURNING (xmax = 0) AS inserted`;
      ta.inserted ? c.inserted++ : c.updated++;
    }
    return c;
  });
}

// ---------- enrollments (student class placement) ----------
async function importEnrollments(rows: EnrollmentRow[]): Promise<Counts> {
  return sql.begin(async (tx) => {
    const [ay] = await sql`
      SELECT id FROM academic_years WHERE is_active AND deleted_at IS NULL`;
    if (!ay) throw new ApiError(409, 'Belum ada tahun ajaran aktif.');

    const c: Counts = { inserted: 0, updated: 0 };
    for (const r of rows) {
      const [st] = await tx`SELECT id FROM students WHERE nis = ${r.nis} AND deleted_at IS NULL`;
      if (!st) throw new ApiError(422, `Siswa dengan NIS "${r.nis}" tidak ditemukan.`);

      const [cls] = await tx`SELECT id FROM classes WHERE name = ${r.nama_kelas} AND academic_year_id = ${ay.id} AND deleted_at IS NULL`;
      if (!cls) throw new ApiError(422, `Kelas "${r.nama_kelas}" tidak ditemukan pada tahun ajaran aktif.`);

      const [en] = await tx`
        INSERT INTO enrollments (student_id, class_id, academic_year_id)
        VALUES (${st.id}, ${cls.id}, ${ay.id})
        ON CONFLICT (student_id, academic_year_id) WHERE deleted_at IS NULL
        DO UPDATE SET class_id = EXCLUDED.class_id
        RETURNING (xmax = 0) AS inserted`;
      en.inserted ? c.inserted++ : c.updated++;
    }
    return c;
  });
}

export const POST = handle(async (req, { params }) => {
  await requireRole('admin');
  const entity = (await params).entity as ImportEntity;
  const schema = ROW_SCHEMAS[entity];
  if (!schema) throw new ApiError(404, 'Jenis data tidak dikenal.');

  const { rows: raw, createAccounts } = Body.parse(await req.json());
  const rows = raw.map((r, i) => {
    const p = schema.safeParse(r);
    if (!p.success) throw new ApiError(422, `Baris ke-${i + 1} pada kelompok ini tidak valid: ${p.error.issues[0]?.message}`);
    return p.data;
  });

  const credentials: Cred[] = [];
  let counts: Counts;

  switch (entity) {
    case 'students':
      counts = await importStudents(rows as StudentRow[], createAccounts, credentials);
      break;
    case 'teachers':
      counts = await importTeachers(rows as TeacherRow[], credentials);
      break;
    case 'classes':
      counts = await importClasses(rows as ClassRow[]);
      break;
    case 'subjects':
      counts = await importSubjects(rows as SubjectRow[]);
      break;
    case 'assignments':
      counts = await importAssignments(rows as AssignmentRow[]);
      break;
    case 'enrollments':
      counts = await importEnrollments(rows as EnrollmentRow[]);
      break;
    default:
      throw new ApiError(404, 'Entitas impor tidak didukung.');
  }

  return Response.json({ ...counts, credentials });
});
