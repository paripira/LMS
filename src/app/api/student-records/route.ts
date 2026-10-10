import { z } from 'zod';
import { sql, handle, requireRole, ApiError } from '@/lib/server';
import { sendParentNotification, sendNotification } from '@/lib/notifications';

const RecordInput = z.object({
  studentId: z.string().uuid(),
  kind: z.enum(['prestasi', 'kedisiplinan', 'konseling']),
  category: z.string().trim().min(2).max(100),
  title: z.string().trim().min(3, 'Judul catatan minimal 3 karakter').max(300),
  description: z.string().trim().max(1000).nullish().transform((v) => v || null),
  points: z.number().int().min(-200).max(200).default(0),
  followUp: z.string().trim().max(500).nullish().transform((v) => v || null),
  recordedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const GET = handle(async (req) => {
  const me = await requireRole('admin', 'guru', 'kepala_sekolah', 'orang_tua', 'siswa');
  const u = new URL(req.url).searchParams;
  const studentId = u.get('studentId');
  const classId = u.get('classId');
  const kind = u.get('kind');

  if (me.role === 'siswa') {
    if (!me.studentId) return Response.json([]);
    const rows = await sql`
      SELECT sr.id, sr.student_id, s.full_name AS student_name, s.nis,
             sr.kind, sr.category, sr.title, sr.description, sr.points, sr.follow_up,
             sr.recorded_on::text AS recorded_on, u.full_name AS author_name
      FROM student_records sr
      JOIN students s ON s.id = sr.student_id
      JOIN users u ON u.id = sr.recorded_by
      WHERE sr.student_id = ${me.studentId} AND sr.deleted_at IS NULL
      ORDER BY sr.recorded_on DESC, sr.created_at DESC`;
    return Response.json(rows);
  }

  if (me.role === 'orang_tua') {
    const rows = await sql`
      SELECT sr.id, sr.student_id, s.full_name AS student_name, s.nis,
             sr.kind, sr.category, sr.title, sr.description, sr.points, sr.follow_up,
             sr.recorded_on::text AS recorded_on, u.full_name AS author_name
      FROM student_records sr
      JOIN students s ON s.id = sr.student_id
      JOIN parent_students ps ON ps.student_id = s.id AND ps.parent_user_id = ${me.userId} AND ps.deleted_at IS NULL
      JOIN users u ON u.id = sr.recorded_by
      WHERE sr.deleted_at IS NULL
        ${studentId ? sql`AND sr.student_id = ${studentId}` : sql``}
      ORDER BY sr.recorded_on DESC, sr.created_at DESC`;
    return Response.json(rows);
  }

  // Admin / Guru / Kepala Sekolah
  const rows = await sql`
    SELECT sr.id, sr.student_id, s.full_name AS student_name, s.nis,
           c.id AS class_id, c.name AS class_name,
           sr.kind, sr.category, sr.title, sr.description, sr.points, sr.follow_up,
           sr.recorded_on::text AS recorded_on, u.full_name AS author_name
    FROM student_records sr
    JOIN students s ON s.id = sr.student_id AND s.deleted_at IS NULL
    LEFT JOIN academic_years ay ON ay.is_active AND ay.deleted_at IS NULL
    LEFT JOIN enrollments en ON en.student_id = s.id AND en.academic_year_id = ay.id AND en.deleted_at IS NULL
    LEFT JOIN classes c ON c.id = en.class_id AND c.deleted_at IS NULL
    JOIN users u ON u.id = sr.recorded_by
    WHERE sr.deleted_at IS NULL
      ${studentId ? sql`AND sr.student_id = ${studentId}` : sql``}
      ${classId ? sql`AND c.id = ${classId}` : sql``}
      ${kind ? sql`AND sr.kind = ${kind}` : sql``}
    ORDER BY sr.recorded_on DESC, sr.created_at DESC
    LIMIT 150`;

  return Response.json(rows);
});

export const POST = handle(async (req) => {
  const me = await requireRole('admin', 'guru');
  const b = RecordInput.parse(await req.json());

  const [sem] = await sql`SELECT id FROM semesters WHERE status = 'active' AND deleted_at IS NULL`;
  if (!sem) throw new ApiError(409, 'Belum ada semester aktif.');

  const [stu] = await sql`SELECT id, full_name, user_id FROM students WHERE id = ${b.studentId} AND deleted_at IS NULL`;
  if (!stu) throw new ApiError(404, 'Siswa tidak ditemukan.');

  const signedPoints =
    b.kind === 'kedisiplinan' && b.points > 0
      ? -Math.abs(b.points)
      : b.kind === 'prestasi' && b.points < 0
      ? Math.abs(b.points)
      : b.points;

  const [created] = await sql`
    INSERT INTO student_records (
      student_id, semester_id, kind, category, title, description, points, follow_up,
      recorded_on, recorded_by
    )
    VALUES (
      ${b.studentId}, ${sem.id}, ${b.kind}, ${b.category}, ${b.title}, ${b.description},
      ${signedPoints}, ${b.followUp}, ${b.recordedOn ?? sql`CURRENT_DATE`}, ${me.userId}
    )
    RETURNING id`;

  const kindLabel =
    b.kind === 'prestasi'
      ? 'Catatan Prestasi Siswa'
      : b.kind === 'kedisiplinan'
      ? 'Catatan Kedisiplinan Siswa'
      : 'Catatan Bimbingan Konseling (BK)';

  await sendParentNotification(b.studentId, {
    title: `${kindLabel}: ${stu.full_name}`,
    body: `${b.title} (${b.category})${signedPoints !== 0 ? ` · Poin: ${signedPoints > 0 ? `+${signedPoints}` : signedPoints}` : ''}.`,
    link: '/ortu',
    type: 'info',
  });

  if (stu.user_id) {
    await sendNotification(stu.user_id, {
      title: kindLabel,
      body: `${b.title} (${b.category}).`,
      link: '/siswa',
      type: 'info',
    });
  }

  return Response.json({ id: created.id });
});

export const DELETE = handle(async (req) => {
  await requireRole('admin', 'guru');
  const id = z.string().uuid().parse(new URL(req.url).searchParams.get('id'));
  await sql`UPDATE student_records SET deleted_at = now() WHERE id = ${id}`;
  return Response.json({ ok: true });
});
