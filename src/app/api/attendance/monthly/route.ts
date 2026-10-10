import { z } from 'zod';
import { sql, handle, requireRole, ApiError } from '@/lib/server';
import { assertClassAccess, assertAssignmentAccess } from '@/lib/access';

// Monthly summary per subject (assignmentId) or per class (classId); CSV/Excel is built in the browser.
export const GET = handle(async (req) => {
  const me = await requireRole('admin', 'guru');
  const u = new URL(req.url).searchParams;
  const assignmentId = u.get('assignmentId');
  const classId = u.get('classId');
  const month = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/).parse(u.get('month'));

  const [y, m] = month.split('-').map(Number);
  const from = `${month}-01`;
  const next = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, '0')}-01`;

  if (assignmentId) {
    const ta = await assertAssignmentAccess(me, z.string().uuid().parse(assignmentId));
    const rows = await sql`
      SELECT s.id AS student_id, s.nis, s.full_name,
             count(*) FILTER (WHERE a.status = 'hadir')::int AS hadir,
             count(*) FILTER (WHERE a.status = 'izin')::int AS izin,
             count(*) FILTER (WHERE a.status = 'sakit')::int AS sakit,
             count(*) FILTER (WHERE a.status = 'alpa')::int AS alpa
      FROM enrollments e
      JOIN students s ON s.id = e.student_id AND s.deleted_at IS NULL
      LEFT JOIN attendance_subject a
             ON a.student_id = s.id
            AND a.teaching_assignment_id = ${ta.id}
            AND a.deleted_at IS NULL
            AND a.attendance_date >= ${from}::date
            AND a.attendance_date < ${next}::date
      WHERE e.class_id = ${ta.class_id} AND e.deleted_at IS NULL
      GROUP BY s.id, s.nis, s.full_name
      ORDER BY s.full_name`;
    return Response.json(rows);
  }

  if (!classId) throw new ApiError(400, 'Pilih mata pelajaran atau kelas terlebih dahulu.');
  await assertClassAccess(me, z.string().uuid().parse(classId));
  const rows = await sql`SELECT * FROM attendance_range(${classId}::uuid, ${from}::date, ${next}::date)`;
  return Response.json(rows);
});
