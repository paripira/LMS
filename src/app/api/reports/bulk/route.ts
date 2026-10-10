import { sql, handle, requireRole, ApiError } from '@/lib/server';

// Returns every approved snapshot for a class in ONE request; the browser renders the PDFs
// and zips them (zero server CPU for PDF generation).
export const GET = handle(async (req) => {
  const me = await requireRole('admin', 'kepala_sekolah', 'guru');
  const url = new URL(req.url);
  const classId = url.searchParams.get('classId');
  const semesterId = url.searchParams.get('semesterId');
  if (!classId || !semesterId) throw new ApiError(400, 'Kelas dan semester wajib dipilih.');

  if (me.role === 'guru') {
    const [wali] = await sql`
      SELECT 1 FROM classes WHERE id = ${classId} AND homeroom_teacher_id = ${me.teacherId!} AND deleted_at IS NULL`;
    if (!wali) throw new ApiError(403, 'Hanya Wali Kelas yang dapat mengunduh e-Rapor kelas ini.');
  }

  const rows = await sql`
    SELECT rc.id, rc.snapshot
    FROM report_cards rc
    JOIN enrollments e ON e.id = rc.enrollment_id
    WHERE e.class_id = ${classId} AND rc.semester_id = ${semesterId}
      AND rc.status = 'approved' AND rc.snapshot IS NOT NULL AND rc.deleted_at IS NULL
    ORDER BY rc.snapshot->'student'->>'name'`;

  return Response.json(rows);
});
