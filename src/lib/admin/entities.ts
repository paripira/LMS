import { z } from 'zod';
import { sql, ApiError } from '@/lib/server';
import { hashPassword, randomPassword } from '@/lib/password';

// ---------- helpers ----------
const str = (max = 120) => z.string().trim().min(1, 'Wajib diisi').max(max);
const opt = z.string().trim().max(120).nullish().transform((v) => v || null);
const uuidOpt = z.string().uuid().nullish().transform((v) => v || null);
const dateOpt = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal tidak valid').nullish().transform((v) => v || null);

const pick = (d: Record<string, unknown>, allowed: string[]) => Object.keys(d).filter((k) => allowed.includes(k) && d[k] !== undefined);
const softDelete = (table: string) => async (id: string) => {
  // table names below are hard-coded literals, never user input
  const r = await sql.unsafe(`UPDATE ${table} SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL RETURNING id`, [id]);
  if (r.length === 0) throw new ApiError(404, 'Data tidak ditemukan.');
};

export interface Credential { username: string; password: string }

export interface Entity {
  list(): Promise<readonly unknown[]>;
  createSchema?: z.ZodObject<z.ZodRawShape>;
  create?(d: any): Promise<unknown>; // eslint-disable-line @typescript-eslint/no-explicit-any
  update?(id: string, d: any): Promise<unknown>; // eslint-disable-line @typescript-eslint/no-explicit-any
  remove?(id: string): Promise<void>;
  resetPassword?(id: string): Promise<{ credentials: Credential[] }>;
}

const ACTIVE_YEAR = sql`(SELECT id FROM academic_years WHERE is_active AND deleted_at IS NULL)`;

// ---------- students ----------
const students: Entity = {
  createSchema: z.object({
    nis: str(30), nisn: opt, full_name: str(), gender: z.enum(['L', 'P']),
    birth_date: dateOpt, jenjang: z.enum(['TK', 'SD', 'SMP']), class_id: uuidOpt,
  }),
  list: () => sql`
    SELECT s.id, s.nis, s.nisn, s.full_name, s.gender, s.birth_date::text AS birth_date, s.jenjang, s.status,
           c.id AS class_id, c.name AS class_name, (s.user_id IS NOT NULL) AS has_account
    FROM students s
    LEFT JOIN enrollments e ON e.student_id = s.id AND e.deleted_at IS NULL AND e.academic_year_id = ${ACTIVE_YEAR}
    LEFT JOIN classes c ON c.id = e.class_id
    WHERE s.deleted_at IS NULL ORDER BY s.full_name`,
  create: async (d) => {
    const pw = String(d.nis);
    const hash = await hashPassword(pw);
    return sql.begin(async (tx) => {
      const [u] = await tx`INSERT INTO users (username, password_hash, role, full_name, must_change_password)
        VALUES (${d.nis}, ${hash}, 'siswa', ${d.full_name}, true)
        ON CONFLICT (username) WHERE deleted_at IS NULL DO NOTHING RETURNING id`;
      const [s] = await tx`INSERT INTO students (nis, nisn, full_name, gender, birth_date, jenjang, user_id)
        VALUES (${d.nis}, ${d.nisn}, ${d.full_name}, ${d.gender}, ${d.birth_date}, ${d.jenjang}, ${u?.id ?? null}) RETURNING id`;
      if (d.class_id) {
        await tx`INSERT INTO enrollments (student_id, class_id, academic_year_id)
                 SELECT ${s.id}, c.id, c.academic_year_id FROM classes c WHERE c.id = ${d.class_id}`;
      }
      return {
        id: s.id,
        credentials: u ? [{ username: String(d.nis), password: pw }] : undefined,
      };
    });
  },
  update: (id, d) =>
    sql.begin(async (tx) => {
      const cols = pick(d, ['nis', 'nisn', 'full_name', 'gender', 'birth_date', 'jenjang']);
      if (cols.length) await tx`UPDATE students SET ${tx(d, ...cols)} WHERE id = ${id} AND deleted_at IS NULL`;
      if (d.class_id) {
        await tx`INSERT INTO enrollments (student_id, class_id, academic_year_id)
                 SELECT ${id}, c.id, c.academic_year_id FROM classes c WHERE c.id = ${d.class_id}
                 ON CONFLICT (student_id, academic_year_id) WHERE deleted_at IS NULL
                 DO UPDATE SET class_id = EXCLUDED.class_id`;
      }
      return { id };
    }),
  remove: (id) =>
    sql.begin(async (tx) => {
      const [s] = await tx`UPDATE students SET deleted_at = now() WHERE id = ${id} AND deleted_at IS NULL RETURNING user_id`;
      if (!s) throw new ApiError(404, 'Data tidak ditemukan.');
      if (s.user_id) await tx`UPDATE users SET deleted_at = now() WHERE id = ${s.user_id}`;
    }),
  // Creates the login account if missing (username = NIS, initial password = NIS), otherwise resets the password back to NIS.
  resetPassword: async (id) => {
    return sql.begin(async (tx) => {
      const [s] = await tx`SELECT nis, full_name, user_id FROM students WHERE id = ${id} AND deleted_at IS NULL`;
      if (!s) throw new ApiError(404, 'Data tidak ditemukan.');
      const pw = String(s.nis);
      const hash = await hashPassword(pw);
      if (s.user_id) {
        const [u] = await tx`UPDATE users SET password_hash = ${hash}, must_change_password = true WHERE id = ${s.user_id} RETURNING username`;
        return { credentials: [{ username: u.username as string, password: pw }] };
      }
      const [u] = await tx`INSERT INTO users (username, password_hash, role, full_name, must_change_password)
        VALUES (${s.nis}, ${hash}, 'siswa', ${s.full_name}, true)
        ON CONFLICT (username) WHERE deleted_at IS NULL DO NOTHING RETURNING id`;
      if (!u) throw new ApiError(409, `Nama pengguna ${s.nis} sudah dipakai akun lain.`);
      await tx`UPDATE students SET user_id = ${u.id} WHERE id = ${id}`;
      return { credentials: [{ username: s.nis as string, password: pw }] };
    });
  },
};

// ---------- teachers ----------
const teachers: Entity = {
  createSchema: z.object({
    username: z.string().trim().toLowerCase().regex(/^[a-z0-9._-]{3,30}$/, 'Nama pengguna 3–30 karakter (huruf kecil, angka, titik, strip)'),
    full_name: str(), nip: opt, phone: opt,
  }),
  list: () => sql`
    SELECT t.id, t.nip, t.full_name, t.phone, u.username
    FROM teachers t JOIN users u ON u.id = t.user_id
    WHERE t.deleted_at IS NULL ORDER BY t.full_name`,
  create: async (d) => {
    const pw = randomPassword();
    const hash = await hashPassword(pw);
    return sql.begin(async (tx) => {
      const [u] = await tx`INSERT INTO users (username, password_hash, role, full_name, must_change_password)
        VALUES (${d.username}, ${hash}, 'guru', ${d.full_name}, true)
        ON CONFLICT (username) WHERE deleted_at IS NULL DO NOTHING RETURNING id`;
      if (!u) throw new ApiError(409, 'Nama pengguna sudah dipakai.');
      await tx`INSERT INTO teachers (user_id, nip, full_name, phone) VALUES (${u.id}, ${d.nip}, ${d.full_name}, ${d.phone})`;
      return { credentials: [{ username: d.username, password: pw }] };
    });
  },
  update: (id, d) =>
    sql.begin(async (tx) => {
      const cols = pick(d, ['nip', 'full_name', 'phone']);
      if (cols.length) await tx`UPDATE teachers SET ${tx(d, ...cols)} WHERE id = ${id} AND deleted_at IS NULL`;
      if (d.full_name) await tx`UPDATE users SET full_name = ${d.full_name} WHERE id = (SELECT user_id FROM teachers WHERE id = ${id})`;
      return { id };
    }),
  remove: (id) =>
    sql.begin(async (tx) => {
      const [t] = await tx`UPDATE teachers SET deleted_at = now() WHERE id = ${id} AND deleted_at IS NULL RETURNING user_id`;
      if (!t) throw new ApiError(404, 'Data tidak ditemukan.');
      await tx`UPDATE users SET deleted_at = now() WHERE id = ${t.user_id}`;
    }),
  resetPassword: async (id) => {
    const pw = randomPassword();
    const [u] = await sql`UPDATE users SET password_hash = ${await hashPassword(pw)}, must_change_password = true
      WHERE id = (SELECT user_id FROM teachers WHERE id = ${id} AND deleted_at IS NULL) RETURNING username`;
    if (!u) throw new ApiError(404, 'Data tidak ditemukan.');
    return { credentials: [{ username: u.username as string, password: pw }] };
  },
};

// ---------- classes ----------
const classes: Entity = {
  createSchema: z.object({
    academic_year_id: z.string().uuid('Pilih tahun ajaran'), jenjang: z.enum(['TK', 'SD', 'SMP']),
    grade_level: z.coerce.number().int().min(0).max(9), name: str(30), homeroom_teacher_id: uuidOpt,
  }),
  list: () => sql`
    SELECT c.id, c.name, c.jenjang, c.grade_level, c.academic_year_id, ay.name AS year_name,
           c.homeroom_teacher_id, t.full_name AS homeroom_name,
           (SELECT count(*) FROM enrollments e WHERE e.class_id = c.id AND e.deleted_at IS NULL)::int AS student_count
    FROM classes c
    JOIN academic_years ay ON ay.id = c.academic_year_id
    LEFT JOIN teachers t ON t.id = c.homeroom_teacher_id
    WHERE c.deleted_at IS NULL ORDER BY ay.starts_on DESC, c.grade_level, c.name`,
  create: async (d) => {
    const [r] = await sql`INSERT INTO classes (academic_year_id, jenjang, grade_level, name, homeroom_teacher_id)
      VALUES (${d.academic_year_id}, ${d.jenjang}, ${d.grade_level}, ${d.name}, ${d.homeroom_teacher_id}) RETURNING id`;
    return { id: r.id };
  },
  update: async (id, d) => {
    const cols = pick(d, ['academic_year_id', 'jenjang', 'grade_level', 'name', 'homeroom_teacher_id']);
    if (cols.length) await sql`UPDATE classes SET ${sql(d, ...cols)} WHERE id = ${id} AND deleted_at IS NULL`;
    return { id };
  },
  remove: async (id) => {
    const [c] = await sql`SELECT count(*)::int AS n FROM enrollments WHERE class_id = ${id} AND deleted_at IS NULL`;
    if (c.n > 0) throw new ApiError(409, 'Kelas ini masih memiliki siswa. Pindahkan siswa terlebih dahulu.');
    await softDelete('classes')(id);
  },
};

// ---------- subjects ----------
const subjects: Entity = {
  createSchema: z.object({
    jenjang: z.enum(['TK', 'SD', 'SMP']), code: str(20), name: str(), kkm: z.coerce.number().min(0).max(100).default(75),
  }),
  list: () => sql`SELECT id, jenjang, code, name, kkm::float AS kkm FROM subjects WHERE deleted_at IS NULL ORDER BY jenjang, name`,
  create: async (d) => {
    const [r] = await sql`INSERT INTO subjects (jenjang, code, name, kkm) VALUES (${d.jenjang}, ${d.code}, ${d.name}, ${d.kkm}) RETURNING id`;
    return { id: r.id };
  },
  update: async (id, d) => {
    const cols = pick(d, ['jenjang', 'code', 'name', 'kkm']);
    if (cols.length) await sql`UPDATE subjects SET ${sql(d, ...cols)} WHERE id = ${id} AND deleted_at IS NULL`;
    return { id };
  },
  remove: softDelete('subjects'),
};

// ---------- teaching assignments ----------
const assignments: Entity = {
  createSchema: z.object({
    teacher_id: z.string().uuid('Pilih guru'), subject_id: z.string().uuid('Pilih mata pelajaran'),
    class_id: z.string().uuid('Pilih kelas'), semester_id: z.string().uuid('Pilih semester'),
  }),
  list: () => sql`
    SELECT ta.id, ta.teacher_id, ta.subject_id, ta.class_id, ta.semester_id,
           c.jenjang, t.full_name AS teacher_name, sub.name AS subject_name, c.name AS class_name,
           ay.name || ' ' || initcap(sem.kind::text) AS semester_name
    FROM teaching_assignments ta
    JOIN teachers t ON t.id = ta.teacher_id
    JOIN subjects sub ON sub.id = ta.subject_id
    JOIN classes c ON c.id = ta.class_id
    JOIN semesters sem ON sem.id = ta.semester_id
    JOIN academic_years ay ON ay.id = sem.academic_year_id
    WHERE ta.deleted_at IS NULL ORDER BY sem.starts_on DESC, c.jenjang, c.name, sub.name`,
  create: async (d) => {
    const [chk] = await sql`
      SELECT sub.jenjang AS sub_j, c.jenjang AS cls_j
      FROM subjects sub, classes c
      WHERE sub.id = ${d.subject_id} AND c.id = ${d.class_id}`;
    if (chk && chk.sub_j !== chk.cls_j) {
      throw new ApiError(400, `Mata pelajaran jenjang ${chk.sub_j} tidak dapat ditugaskan ke kelas jenjang ${chk.cls_j}.`);
    }
    const [r] = await sql`INSERT INTO teaching_assignments (teacher_id, subject_id, class_id, semester_id)
      VALUES (${d.teacher_id}, ${d.subject_id}, ${d.class_id}, ${d.semester_id}) RETURNING id`;
    return { id: r.id };
  },
  update: async (id, d) => {
    const cols = pick(d, ['teacher_id', 'subject_id', 'class_id', 'semester_id']);
    if (cols.length) await sql`UPDATE teaching_assignments SET ${sql(d, ...cols)} WHERE id = ${id} AND deleted_at IS NULL`;
    return { id };
  },
  remove: softDelete('teaching_assignments'),
};

// ---------- parents ----------
const parents: Entity = {
  createSchema: z.object({
    username: str(30), full_name: str(), email: opt,
  }),
  list: () => sql`
    SELECT u.id, u.username, u.full_name, u.email,
           (SELECT count(*)::int FROM parent_students ps WHERE ps.parent_user_id = u.id AND ps.deleted_at IS NULL) AS children_count
    FROM users u
    WHERE u.role = 'orang_tua' AND u.deleted_at IS NULL
    ORDER BY u.full_name`,
  create: async (d) => {
    const pw = randomPassword();
    const hash = await hashPassword(pw);
    const [u] = await sql`
      INSERT INTO users (username, password_hash, role, full_name, email, must_change_password)
      VALUES (${d.username.toLowerCase()}, ${hash}, 'orang_tua', ${d.full_name}, ${d.email}, true)
      RETURNING id`;
    return { id: u.id, credentials: [{ username: d.username, password: pw }] };
  },
  update: async (id, d) => {
    const cols = pick(d, ['full_name', 'email']);
    if (cols.length) await sql`UPDATE users SET ${sql(d, ...cols)} WHERE id = ${id} AND deleted_at IS NULL`;
    return { id };
  },
  remove: softDelete('users'),
  resetPassword: async (id) => {
    const pw = randomPassword();
    const hash = await hashPassword(pw);
    const [u] = await sql`UPDATE users SET password_hash = ${hash}, must_change_password = true WHERE id = ${id} RETURNING username`;
    return { credentials: [{ username: u.username, password: pw }] };
  },
};

// ---------- read-only option lists ----------
const years: Entity = {
  list: () => sql`SELECT id, name, starts_on::text AS starts_on, ends_on::text AS ends_on, is_active
                  FROM academic_years WHERE deleted_at IS NULL ORDER BY starts_on DESC`,
};
const semesters: Entity = {
  list: () => sql`
    SELECT s.id, s.kind, s.status, s.academic_year_id, ay.name || ' ' || initcap(s.kind::text) AS label
    FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id
    WHERE s.deleted_at IS NULL ORDER BY s.starts_on DESC`,
};

export const ENTITIES: Record<string, Entity> = { students, teachers, parents, classes, subjects, assignments, years, semesters };

