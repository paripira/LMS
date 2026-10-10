import { z } from 'zod';
import { sql, handle, requireRole, ApiError } from '@/lib/server';

const JournalInput = z.object({
  teachingAssignmentId: z.string().uuid(),
  journalDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  topic: z.string().trim().min(3, 'Materi/pokok bahasan wajib diisi').max(500),
  method: z.string().trim().max(200).nullish().transform((v) => v || null),
  studentActivity: z.string().trim().max(1000).nullish().transform((v) => v || null),
  presentCount: z.number().int().min(0).max(200).optional(),
  absentCount: z.number().int().min(0).max(200).optional(),
});

export const GET = handle(async (req) => {
  const me = await requireRole('guru', 'admin', 'kepala_sekolah');
  const u = new URL(req.url).searchParams;
  const assignmentId = u.get('assignmentId');
  const classId = u.get('classId');
  const month = u.get('month'); // YYYY-MM

  const rows = await sql`
    SELECT tj.id, tj.teaching_assignment_id, tj.journal_date::text AS journal_date,
           tj.topic, tj.method, tj.student_activity,
           tj.present_count, tj.absent_count, tj.created_at,
           c.id AS class_id, c.name AS class_name,
           sub.name AS subject_name, sub.code AS subject_code,
           t.full_name AS teacher_name
    FROM teaching_journals tj
    JOIN teaching_assignments ta ON ta.id = tj.teaching_assignment_id AND ta.deleted_at IS NULL
    JOIN classes c ON c.id = ta.class_id AND c.deleted_at IS NULL
    JOIN subjects sub ON sub.id = ta.subject_id AND sub.deleted_at IS NULL
    JOIN teachers t ON t.id = ta.teacher_id AND t.deleted_at IS NULL
    WHERE tj.deleted_at IS NULL
      ${me.role === 'guru' ? sql`AND ta.teacher_id = ${me.teacherId!}` : sql``}
      ${assignmentId ? sql`AND tj.teaching_assignment_id = ${assignmentId}` : sql``}
      ${classId ? sql`AND ta.class_id = ${classId}` : sql``}
      ${month && /^\d{4}-\d{2}$/.test(month) ? sql`AND to_char(tj.journal_date, 'YYYY-MM') = ${month}` : sql``}
    ORDER BY tj.journal_date DESC, tj.created_at DESC
    LIMIT 150`;

  return Response.json(rows);
});

export const POST = handle(async (req) => {
  const me = await requireRole('guru', 'admin');
  const b = JournalInput.parse(await req.json());

  const [ta] = await sql`
    SELECT id, teacher_id, class_id
    FROM teaching_assignments
    WHERE id = ${b.teachingAssignmentId} AND deleted_at IS NULL`;
  if (!ta) throw new ApiError(404, 'Penugasan mengajar tidak ditemukan.');
  if (me.role === 'guru' && ta.teacher_id !== me.teacherId) {
    throw new ApiError(403, 'Anda tidak mengajar pada penugasan ini.');
  }

  // Compute attendance counts automatically if not provided
  let present = b.presentCount;
  let absent = b.absentCount;
  if (present == null || absent == null) {
    const [att] = await sql`
      SELECT
        COUNT(*) FILTER (WHERE status = 'hadir')::int AS present,
        COUNT(*) FILTER (WHERE status IN ('izin', 'sakit', 'alpa'))::int AS absent
      FROM attendance_subject
      WHERE teaching_assignment_id = ${b.teachingAssignmentId}
        AND attendance_date = ${b.journalDate}
        AND deleted_at IS NULL`;
    if ((att?.present ?? 0) + (att?.absent ?? 0) > 0) {
      present = present ?? att.present;
      absent = absent ?? att.absent;
    } else {
      const [daily] = await sql`
        SELECT
          COUNT(*) FILTER (WHERE status = 'hadir')::int AS present,
          COUNT(*) FILTER (WHERE status IN ('izin', 'sakit', 'alpa'))::int AS absent
        FROM attendance_daily
        WHERE class_id = ${ta.class_id}
          AND attendance_date = ${b.journalDate}
          AND deleted_at IS NULL`;
      present = present ?? daily?.present ?? 0;
      absent = absent ?? daily?.absent ?? 0;
    }
  }

  const [created] = await sql`
    INSERT INTO teaching_journals (
      teaching_assignment_id, journal_date, topic, method, student_activity, present_count, absent_count, created_by
    )
    VALUES (
      ${b.teachingAssignmentId}, ${b.journalDate}, ${b.topic}, ${b.method}, ${b.studentActivity},
      ${present ?? 0}, ${absent ?? 0}, ${me.userId}
    )
    RETURNING id`;

  return Response.json({ id: created.id });
});

export const DELETE = handle(async (req) => {
  const me = await requireRole('guru', 'admin');
  const id = z.string().uuid().parse(new URL(req.url).searchParams.get('id'));

  const [row] = await sql`
    SELECT tj.id, ta.teacher_id
    FROM teaching_journals tj
    JOIN teaching_assignments ta ON ta.id = tj.teaching_assignment_id
    WHERE tj.id = ${id} AND tj.deleted_at IS NULL`;
  if (!row) throw new ApiError(404, 'Jurnal mengajar tidak ditemukan.');
  if (me.role === 'guru' && row.teacher_id !== me.teacherId) {
    throw new ApiError(403, 'Akses ditolak.');
  }

  await sql`UPDATE teaching_journals SET deleted_at = now() WHERE id = ${id}`;
  return Response.json({ ok: true });
});
