import { z } from 'zod';
import { sql, handle, requireRole, ApiError } from '@/lib/server';
import { sendNotification } from '@/lib/notifications';

const CreateSchema = z
  .object({
    studentId: z.string().uuid(),
    kind: z.enum(['izin', 'sakit']),
    startsOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endsOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    reason: z.string().trim().min(3, 'Alasan izin/sakit minimal 3 karakter').max(500),
    attachmentUrl: z
      .string()
      .trim()
      .max(500)
      .regex(/^https?:\/\//i, 'Tautan surat harus diawali http:// atau https://')
      .nullish()
      .or(z.literal(''))
      .transform((v) => v || null),
  })
  .refine((d) => d.endsOn >= d.startsOn, {
    message: 'Tanggal selesai tidak boleh sebelum tanggal mulai',
    path: ['endsOn'],
  });

const ReviewSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['approved', 'rejected']),
});

export const GET = handle(async (req) => {
  const me = await requireRole('admin', 'guru', 'orang_tua', 'siswa', 'kepala_sekolah');
  const u = new URL(req.url).searchParams;
  const studentId = u.get('studentId');
  const classId = u.get('classId');
  const date = u.get('date');

  if (me.role === 'orang_tua') {
    const rows = await sql`
      SELECT lr.id, lr.student_id, s.full_name AS student_name, s.nis,
             lr.kind, lr.starts_on::text AS starts_on, lr.ends_on::text AS ends_on,
             lr.reason, lr.attachment_url, lr.status, lr.created_at,
             rv.full_name AS reviewer_name
      FROM leave_requests lr
      JOIN students s ON s.id = lr.student_id AND s.deleted_at IS NULL
      JOIN parent_students ps ON ps.student_id = s.id AND ps.parent_user_id = ${me.userId} AND ps.deleted_at IS NULL
      LEFT JOIN users rv ON rv.id = lr.reviewed_by
      WHERE lr.deleted_at IS NULL
        ${studentId ? sql`AND lr.student_id = ${studentId}` : sql``}
      ORDER BY lr.created_at DESC
      LIMIT 50`;
    return Response.json(rows);
  }

  if (me.role === 'siswa') {
    if (!me.studentId) return Response.json([]);
    const rows = await sql`
      SELECT lr.id, lr.student_id, s.full_name AS student_name, s.nis,
             lr.kind, lr.starts_on::text AS starts_on, lr.ends_on::text AS ends_on,
             lr.reason, lr.attachment_url, lr.status, lr.created_at,
             rv.full_name AS reviewer_name
      FROM leave_requests lr
      JOIN students s ON s.id = lr.student_id AND s.deleted_at IS NULL
      LEFT JOIN users rv ON rv.id = lr.reviewed_by
      WHERE lr.student_id = ${me.studentId} AND lr.deleted_at IS NULL
      ORDER BY lr.created_at DESC
      LIMIT 50`;
    return Response.json(rows);
  }

  // Admin / Guru / Kepala Sekolah
  const isGuru = me.role === 'guru';
  const teacherId = me.teacherId ?? null;
  const rows = await sql`
    SELECT lr.id, lr.student_id, s.full_name AS student_name, s.nis, c.id AS class_id, c.name AS class_name,
           lr.kind, lr.starts_on::text AS starts_on, lr.ends_on::text AS ends_on,
           lr.reason, lr.attachment_url, lr.status, lr.created_at,
           req.full_name AS requester_name, rv.full_name AS reviewer_name
    FROM leave_requests lr
    JOIN students s ON s.id = lr.student_id AND s.deleted_at IS NULL
    LEFT JOIN academic_years ay ON ay.is_active AND ay.deleted_at IS NULL
    LEFT JOIN enrollments en ON en.student_id = s.id AND en.academic_year_id = ay.id AND en.deleted_at IS NULL
    LEFT JOIN classes c ON c.id = en.class_id AND c.deleted_at IS NULL
    LEFT JOIN users req ON req.id = lr.requested_by
    LEFT JOIN users rv ON rv.id = lr.reviewed_by
    WHERE lr.deleted_at IS NULL
      ${classId ? sql`AND c.id = ${classId}` : sql``}
      ${date ? sql`AND ${date}::date BETWEEN lr.starts_on AND lr.ends_on` : sql``}
      AND (
        NOT ${isGuru}::boolean
        OR c.homeroom_teacher_id = ${teacherId}::uuid
        OR EXISTS (
          SELECT 1 FROM teaching_assignments ta
          WHERE ta.class_id = c.id AND ta.teacher_id = ${teacherId}::uuid AND ta.deleted_at IS NULL
        )
      )
    ORDER BY
      CASE WHEN lr.status = 'pending' THEN 0 ELSE 1 END,
      lr.starts_on DESC, lr.created_at DESC
    LIMIT 100`;
  return Response.json(rows);
});

export const POST = handle(async (req) => {
  const me = await requireRole('orang_tua', 'siswa', 'admin');
  const b = CreateSchema.parse(await req.json());

  if (me.role === 'orang_tua') {
    const [ok] = await sql`
      SELECT 1 FROM parent_students
      WHERE parent_user_id = ${me.userId} AND student_id = ${b.studentId} AND deleted_at IS NULL`;
    if (!ok) throw new ApiError(403, 'Anda tidak memiliki akses untuk siswa ini.');
  } else if (me.role === 'siswa' && me.studentId !== b.studentId) {
    throw new ApiError(403, 'Akses ditolak.');
  }

  const [created] = await sql`
    INSERT INTO leave_requests (student_id, requested_by, kind, starts_on, ends_on, reason, attachment_url)
    VALUES (${b.studentId}, ${me.userId}, ${b.kind}, ${b.startsOn}, ${b.endsOn}, ${b.reason}, ${b.attachmentUrl})
    RETURNING id`;

  // Notify homeroom teacher if assigned
  const [info] = await sql`
    SELECT s.full_name AS student_name, c.name AS class_name, t.user_id AS wali_user_id
    FROM students s
    LEFT JOIN academic_years ay ON ay.is_active AND ay.deleted_at IS NULL
    LEFT JOIN enrollments en ON en.student_id = s.id AND en.academic_year_id = ay.id AND en.deleted_at IS NULL
    LEFT JOIN classes c ON c.id = en.class_id AND c.deleted_at IS NULL
    LEFT JOIN teachers t ON t.id = c.homeroom_teacher_id AND t.deleted_at IS NULL
    WHERE s.id = ${b.studentId}`;

  if (info?.wali_user_id) {
    await sendNotification(info.wali_user_id, {
      title: `Pengajuan ${b.kind.toUpperCase()}: ${info.student_name}`,
      body: `${info.student_name} (${info.class_name ?? ''}) mengajukan ${b.kind} tanggal ${b.startsOn} s/d ${b.endsOn}: "${b.reason}".`,
      link: '/guru/presensi',
      type: 'presensi',
    });
  }

  return Response.json({ id: created.id });
});

export const PATCH = handle(async (req) => {
  const me = await requireRole('guru', 'admin');
  const { id, status } = ReviewSchema.parse(await req.json());

  const updated = await sql.begin(async (tx) => {
    const [lr] = await tx`
      SELECT lr.*, s.full_name AS student_name, en.class_id
      FROM leave_requests lr
      JOIN students s ON s.id = lr.student_id AND s.deleted_at IS NULL
      LEFT JOIN academic_years ay ON ay.is_active AND ay.deleted_at IS NULL
      LEFT JOIN enrollments en ON en.student_id = s.id AND en.academic_year_id = ay.id AND en.deleted_at IS NULL
      WHERE lr.id = ${id} AND lr.deleted_at IS NULL
      FOR UPDATE`;
    if (!lr) throw new ApiError(404, 'Pengajuan izin tidak ditemukan.');

    await tx`
      UPDATE leave_requests
      SET status = ${status}, reviewed_by = ${me.userId}, reviewed_at = now()
      WHERE id = ${id}`;

    // When approved, automatically populate daily & per-subject attendance for each date in [starts_on, ends_on]
    if (status === 'approved' && lr.class_id) {
      await tx`
        INSERT INTO attendance_daily (student_id, class_id, attendance_date, status, note, marked_by)
        SELECT ${lr.student_id}, ${lr.class_id}, d::date, ${lr.kind}::attendance_status, ${lr.reason}, ${me.userId}
        FROM generate_series(${lr.starts_on}::date, ${lr.ends_on}::date, interval '1 day') AS d
        ON CONFLICT (student_id, attendance_date) WHERE deleted_at IS NULL
        DO UPDATE SET status = EXCLUDED.status, note = EXCLUDED.note, marked_by = EXCLUDED.marked_by, updated_at = now()`;

      await tx`
        INSERT INTO attendance_subject (student_id, teaching_assignment_id, attendance_date, status, note, marked_by)
        SELECT ${lr.student_id}, ta.id, d::date, ${lr.kind}::attendance_status, ${lr.reason}, ${me.userId}
        FROM teaching_assignments ta
        JOIN semesters sem ON sem.id = ta.semester_id AND sem.status = 'active' AND sem.deleted_at IS NULL
        CROSS JOIN generate_series(${lr.starts_on}::date, ${lr.ends_on}::date, interval '1 day') AS d
        WHERE ta.class_id = ${lr.class_id} AND ta.deleted_at IS NULL
        ON CONFLICT (student_id, teaching_assignment_id, attendance_date) WHERE deleted_at IS NULL
        DO UPDATE SET status = EXCLUDED.status, note = EXCLUDED.note, marked_by = EXCLUDED.marked_by, updated_at = now()`;
    }

    return lr;
  });

  if (updated.requested_by) {
    const label = status === 'approved' ? 'DISETUJUI' : 'DITOLAK';
    await sendNotification(updated.requested_by, {
      title: `Pengajuan ${String(updated.kind).toUpperCase()} ${label}`,
      body: `Pengajuan ${updated.kind} untuk ${updated.student_name} (${String(updated.starts_on).slice(0, 10)}) telah ${label.toLowerCase()} oleh pihak sekolah.`,
      link: '/ortu',
      type: 'presensi',
    });
  }

  return Response.json({ ok: true, status });
});
