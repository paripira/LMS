import { z } from 'zod';
import { sql, handle, requireRole, ApiError } from '@/lib/server';

const ROLES = ['admin', 'guru', 'siswa', 'orang_tua', 'kepala_sekolah'] as const;

let schemaReady: Promise<void> | null = null;
function ensureAnnouncementColumns() {
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`ALTER TABLE announcements ADD COLUMN IF NOT EXISTS class_id uuid REFERENCES classes(id)`;
      await sql`ALTER TABLE announcements ADD COLUMN IF NOT EXISTS teaching_assignment_id uuid REFERENCES teaching_assignments(id)`;
    })().catch((e) => {
      schemaReady = null;
      throw e;
    });
  }
  return schemaReady;
}

export const GET = handle(async () => {
  const me = await requireRole();
  await ensureAnnouncementColumns();

  const isAdminOrKepsek = me.role === 'admin' || me.role === 'kepala_sekolah';
  const isSiswa = me.role === 'siswa';
  const isOrtu = me.role === 'orang_tua';
  const isGuru = me.role === 'guru';
  const studentId = me.studentId ?? null;
  const teacherId = me.teacherId ?? null;

  const rows = await sql`
    SELECT a.id, a.title, a.body, a.pinned, a.publish_at,
           u.full_name AS author,
           (a.author_id = ${me.userId}) AS mine,
           COALESCE(a.class_id, ta.class_id) AS class_id,
           a.teaching_assignment_id,
           c.name AS class_name,
           c.jenjang AS jenjang,
           sub.name AS subject_name
    FROM announcements a
    JOIN users u ON u.id = a.author_id
    LEFT JOIN teaching_assignments ta ON ta.id = a.teaching_assignment_id AND ta.deleted_at IS NULL
    LEFT JOIN classes c ON c.id = COALESCE(a.class_id, ta.class_id) AND c.deleted_at IS NULL
    LEFT JOIN subjects sub ON sub.id = ta.subject_id AND sub.deleted_at IS NULL
    WHERE a.deleted_at IS NULL
      AND ${me.role}::user_role = ANY (a.audience)
      AND a.publish_at <= now()
      AND (a.expires_at IS NULL OR a.expires_at > now())
      AND (
        -- 1. Admin & Kepala Sekolah melihat semua pengumuman
        ${isAdminOrKepsek}::boolean
        -- 2. Pengumuman umum seluruh sekolah (hanya yang tidak terikat kelas/mapel)
        OR (a.class_id IS NULL AND a.teaching_assignment_id IS NULL)
        -- 3. Pembuat pengumuman selalu bisa melihat pengumuman miliknya
        OR a.author_id = ${me.userId}::uuid
        -- 4. Siswa: HANYA melihat pengumuman kelas tempat ia terdaftar aktif
        OR (
          ${isSiswa}::boolean AND ${studentId}::uuid IS NOT NULL AND EXISTS (
            SELECT 1 FROM enrollments e
            JOIN academic_years ay ON ay.id = e.academic_year_id AND ay.is_active = true
            WHERE e.student_id = ${studentId}::uuid
              AND e.class_id = COALESCE(a.class_id, ta.class_id)
              AND e.deleted_at IS NULL
          )
        )
        -- 5. Orang Tua: HANYA melihat pengumuman kelas tempat anaknya terdaftar aktif
        OR (
          ${isOrtu}::boolean AND EXISTS (
            SELECT 1 FROM parent_students ps
            JOIN enrollments e ON e.student_id = ps.student_id AND e.deleted_at IS NULL
            JOIN academic_years ay ON ay.id = e.academic_year_id AND ay.is_active = true
            WHERE ps.parent_user_id = ${me.userId}::uuid
              AND e.class_id = COALESCE(a.class_id, ta.class_id)
          )
        )
        -- 6. Guru: melihat pengumuman mapel yang ia ajar atau kelas yang ia walikan/ajar
        OR (
          ${isGuru}::boolean AND ${teacherId}::uuid IS NOT NULL AND (
            (a.teaching_assignment_id IS NOT NULL AND (ta.teacher_id = ${teacherId}::uuid OR c.homeroom_teacher_id = ${teacherId}::uuid))
            OR (
              a.teaching_assignment_id IS NULL AND a.class_id IS NOT NULL AND (
                c.homeroom_teacher_id = ${teacherId}::uuid
                OR EXISTS (
                  SELECT 1 FROM teaching_assignments t2
                  WHERE t2.class_id = a.class_id AND t2.teacher_id = ${teacherId}::uuid AND t2.deleted_at IS NULL
                )
              )
            )
          )
        )
      )
    ORDER BY a.pinned DESC, a.publish_at DESC
    LIMIT 100`;
  return Response.json(rows);
});

const Post = z.object({
  title: z.string().trim().min(1, 'Judul wajib diisi').max(150),
  body: z.string().trim().min(1, 'Isi pengumuman wajib diisi').max(5000),
  pinned: z.boolean().default(false),
  audience: z.array(z.enum(ROLES)).min(1).default([...ROLES]),
  classId: z.string().uuid().nullable().optional(),
  teachingAssignmentId: z.string().uuid().nullable().optional(),
});

export const POST = handle(async (req) => {
  const me = await requireRole('admin', 'guru');
  await ensureAnnouncementColumns();
  const b = Post.parse(await req.json());

  let targetClassId: string | null = b.classId ?? null;
  let targetTaId: string | null = b.teachingAssignmentId ?? null;
  let targetLabel = 'Pengumuman Sekolah';

  if (me.role === 'guru') {
    if (!targetTaId && !targetClassId) {
      throw new ApiError(400, 'Guru wajib memilih Kelas atau Mata Pelajaran tujuan pengumuman.');
    }
  }

  if (targetTaId) {
    const [ta] = await sql`
      SELECT ta.id, ta.class_id, ta.teacher_id, sub.name AS subject_name, c.name AS class_name
      FROM teaching_assignments ta
      JOIN subjects sub ON sub.id = ta.subject_id
      JOIN classes c ON c.id = ta.class_id
      WHERE ta.id = ${targetTaId} AND ta.deleted_at IS NULL`;
    if (!ta) throw new ApiError(404, 'Penugasan mata pelajaran tidak ditemukan.');
    if (me.role === 'guru' && ta.teacher_id !== me.teacherId) {
      throw new ApiError(403, 'Anda hanya dapat membuat pengumuman untuk mata pelajaran dan kelas yang Anda ajar.');
    }
    targetClassId = ta.class_id;
    targetLabel = `${ta.subject_name} — Kelas ${ta.class_name}`;
  } else if (targetClassId) {
    const [cls] = await sql`
      SELECT c.id, c.name, c.homeroom_teacher_id,
             EXISTS (
               SELECT 1 FROM teaching_assignments ta
               WHERE ta.class_id = c.id AND ta.teacher_id = ${me.teacherId ?? null}::uuid AND ta.deleted_at IS NULL
             ) AS teaches_class
      FROM classes c
      WHERE c.id = ${targetClassId} AND c.deleted_at IS NULL`;
    if (!cls) throw new ApiError(404, 'Kelas tidak ditemukan.');
    if (me.role === 'guru' && cls.homeroom_teacher_id !== me.teacherId && !cls.teaches_class) {
      throw new ApiError(403, 'Anda hanya dapat membuat pengumuman untuk kelas yang Anda ajar atau walikan.');
    }
    targetLabel = `Kelas ${cls.name}`;
  }

  const [a] = await sql`
    INSERT INTO announcements (title, body, pinned, audience, author_id, class_id, teaching_assignment_id)
    VALUES (
      ${b.title},
      ${b.body},
      ${b.pinned},
      ${sql.array(b.audience)}::user_role[],
      ${me.userId},
      ${targetClassId},
      ${targetTaId}
    )
    RETURNING id`;

  // Send in-app notifications to students & parents in that specific class when targeted
  if (targetClassId) {
    await sql`
      INSERT INTO notifications (user_id, title, body, link, type)
      SELECT DISTINCT u_id, ${`Pengumuman (${targetLabel}): ${b.title}`}, ${b.body.slice(0, 160)}, '/pengumuman', 'info'
      FROM (
        SELECT s.user_id AS u_id
        FROM enrollments e
        JOIN academic_years ay ON ay.id = e.academic_year_id AND ay.is_active = true
        JOIN students s ON s.id = e.student_id AND s.deleted_at IS NULL
        WHERE e.class_id = ${targetClassId} AND e.deleted_at IS NULL AND s.user_id IS NOT NULL
        UNION
        SELECT ps.parent_user_id AS u_id
        FROM enrollments e
        JOIN academic_years ay ON ay.id = e.academic_year_id AND ay.is_active = true
        JOIN parent_students ps ON ps.student_id = e.student_id
        WHERE e.class_id = ${targetClassId} AND e.deleted_at IS NULL
      ) recipients
      WHERE u_id IS NOT NULL`;
  }

  return Response.json({ id: a.id });
});

export const DELETE = handle(async (req) => {
  const me = await requireRole('admin', 'guru');
  const id = z.string().uuid().parse(new URL(req.url).searchParams.get('id'));
  const [a] = await sql`UPDATE announcements SET deleted_at = now()
                        WHERE id = ${id} AND deleted_at IS NULL AND (${me.role === 'admin'}::boolean OR author_id = ${me.userId}) RETURNING id`;
  if (!a) throw new ApiError(404, 'Pengumuman tidak ditemukan atau bukan milik Anda.');
  return Response.json({ ok: true });
});

