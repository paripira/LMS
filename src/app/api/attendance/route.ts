import { z } from 'zod';
import { sql, handle, requireRole, ApiError, type Session } from '@/lib/server';
import { assertClassAccess, assertAssignmentAccess } from '@/lib/access';

const DateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Tanggal tidak valid');

async function resolveTarget(me: Session, mode: 'daily' | 'subject', classId?: string | null, assignmentId?: string | null) {
  if (mode === 'daily') {
    if (!classId) throw new ApiError(400, 'Pilih kelas terlebih dahulu.');
    await assertClassAccess(me, classId);
    return { classId, assignmentId: null as string | null };
  }
  if (!assignmentId) throw new ApiError(400, 'Pilih mata pelajaran terlebih dahulu.');
  const ta = await assertAssignmentAccess(me, assignmentId);
  return { classId: ta.class_id, assignmentId };
}

export const GET = handle(async (req) => {
  const me = await requireRole('admin', 'guru');
  const u = new URL(req.url).searchParams;
  const mode = z.enum(['daily', 'subject']).default('subject').parse(u.get('mode') ?? 'subject');
  const date = DateStr.parse(u.get('date'));
  const t = await resolveTarget(me, mode, u.get('classId'), u.get('assignmentId'));

  const students =
    mode === 'daily'
      ? await sql`
          SELECT s.id, s.nis, s.full_name AS name, a.status, a.note
          FROM enrollments e
          JOIN students s ON s.id = e.student_id AND s.deleted_at IS NULL
          LEFT JOIN attendance_daily a ON a.student_id = s.id AND a.attendance_date = ${date}::date AND a.deleted_at IS NULL
          WHERE e.class_id = ${t.classId} AND e.deleted_at IS NULL ORDER BY s.full_name`
      : await sql`
          SELECT s.id, s.nis, s.full_name AS name,
                 COALESCE(
                   a.status,
                   CASE WHEN ad.status IN ('izin', 'sakit') THEN ad.status ELSE NULL END
                 ) AS status,
                 COALESCE(a.note, ad.note) AS note
          FROM enrollments e
          JOIN students s ON s.id = e.student_id AND s.deleted_at IS NULL
          LEFT JOIN attendance_subject a
                 ON a.student_id = s.id
                AND a.attendance_date = ${date}::date
                AND a.teaching_assignment_id = ${t.assignmentId}
                AND a.deleted_at IS NULL
          LEFT JOIN attendance_daily ad
                 ON ad.student_id = s.id
                AND ad.attendance_date = ${date}::date
                AND ad.deleted_at IS NULL
          WHERE e.class_id = ${t.classId} AND e.deleted_at IS NULL
          ORDER BY s.full_name`;

  return Response.json({ students });
});

const Put = z.object({
  mode: z.enum(['daily', 'subject']).default('subject'),
  classId: z.string().uuid().optional(),
  assignmentId: z.string().uuid().optional(),
  date: DateStr,
  records: z.array(z.object({
    studentId: z.string().uuid(),
    status: z.enum(['hadir', 'izin', 'sakit', 'alpa']),
    note: z.string().max(200).optional(),
  })).min(1).max(200),
});

// Bulk upsert in ONE statement. Students not enrolled in the target class are silently ignored.
export const PUT = handle(async (req) => {
  const me = await requireRole('admin', 'guru');
  const b = Put.parse(await req.json());
  const t = await resolveTarget(me, b.mode, b.classId, b.assignmentId);

  const ids = b.records.map((r) => r.studentId);
  const statuses = b.records.map((r) => r.status);
  const notes = b.records.map((r) => r.note ?? '');

  const saved =
    b.mode === 'daily'
      ? await sql`
          INSERT INTO attendance_daily (student_id, class_id, attendance_date, status, note, marked_by)
          SELECT x.sid, ${t.classId}, ${b.date}::date, x.st::attendance_status, NULLIF(x.nt, ''), ${me.userId}
          FROM unnest(${sql.array(ids)}::uuid[], ${sql.array(statuses)}::text[], ${sql.array(notes)}::text[]) AS x(sid, st, nt)
          WHERE EXISTS (SELECT 1 FROM enrollments e WHERE e.student_id = x.sid AND e.class_id = ${t.classId} AND e.deleted_at IS NULL)
          ON CONFLICT (student_id, attendance_date) WHERE deleted_at IS NULL
          DO UPDATE SET status = EXCLUDED.status, note = EXCLUDED.note, marked_by = EXCLUDED.marked_by, class_id = EXCLUDED.class_id
          RETURNING id`
      : await sql.begin(async (tx) => {
          const rows = await tx`
            INSERT INTO attendance_subject (student_id, teaching_assignment_id, attendance_date, status, note, marked_by)
            SELECT x.sid, ${t.assignmentId}, ${b.date}::date, x.st::attendance_status, NULLIF(x.nt, ''), ${me.userId}
            FROM unnest(${sql.array(ids)}::uuid[], ${sql.array(statuses)}::text[], ${sql.array(notes)}::text[]) AS x(sid, st, nt)
            WHERE EXISTS (SELECT 1 FROM enrollments e WHERE e.student_id = x.sid AND e.class_id = ${t.classId} AND e.deleted_at IS NULL)
            ON CONFLICT (student_id, teaching_assignment_id, attendance_date) WHERE deleted_at IS NULL
            DO UPDATE SET status = EXCLUDED.status, note = EXCLUDED.note, marked_by = EXCLUDED.marked_by
            RETURNING id`;

          // Sync to attendance_daily so semester & e-Rapor attendance summaries stay up to date
          await tx`
            INSERT INTO attendance_daily (student_id, class_id, attendance_date, status, note, marked_by)
            SELECT x.sid, ${t.classId}, ${b.date}::date, x.st::attendance_status, NULLIF(x.nt, ''), ${me.userId}
            FROM unnest(${sql.array(ids)}::uuid[], ${sql.array(statuses)}::text[], ${sql.array(notes)}::text[]) AS x(sid, st, nt)
            WHERE EXISTS (SELECT 1 FROM enrollments e WHERE e.student_id = x.sid AND e.class_id = ${t.classId} AND e.deleted_at IS NULL)
            ON CONFLICT (student_id, attendance_date) WHERE deleted_at IS NULL
            DO UPDATE SET status = EXCLUDED.status, note = COALESCE(EXCLUDED.note, attendance_daily.note), marked_by = EXCLUDED.marked_by, class_id = EXCLUDED.class_id`;

          return rows;
        });

  let subjectLabel = '';
  if (t.assignmentId) {
    const [info] = await sql`
      SELECT sub.name AS subject_name, c.name AS class_name
      FROM teaching_assignments ta
      JOIN subjects sub ON sub.id = ta.subject_id
      JOIN classes c ON c.id = ta.class_id
      WHERE ta.id = ${t.assignmentId}`;
    if (info) subjectLabel = ` pada mata pelajaran ${info.subject_name} (Kelas ${info.class_name})`;
  }

  // Asynchronously notify parents for alpa or sakit
  for (const r of b.records) {
    if (r.status === 'alpa' || r.status === 'sakit') {
      import('@/lib/notifications').then(({ sendParentNotification }) => {
        sendParentNotification(r.studentId, {
          title: `Pemberitahuan Presensi (${r.status.toUpperCase()})`,
          body: `Ananda tercatat ${r.status}${subjectLabel} pada tanggal ${b.date}.${r.note ? ` Catatan: ${r.note}` : ''}`,
          link: '/ortu',
          type: 'presensi',
        }).catch(() => {});
      });
    }
  }

  return Response.json({ ok: true, saved: saved.length });
});
