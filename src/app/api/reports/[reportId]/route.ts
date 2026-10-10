import { sql, handle, requireRole, ApiError } from '@/lib/server';

export const GET = handle(async (_req, { params }) => {
  const { reportId } = await params;
  const me = await requireRole('siswa', 'orang_tua', 'guru', 'admin', 'kepala_sekolah');

  const [rc] = await sql`
    SELECT rc.id, rc.status, rc.snapshot, e.student_id, e.class_id
    FROM report_cards rc
    JOIN enrollments e ON e.id = rc.enrollment_id
    WHERE rc.id = ${reportId} AND rc.deleted_at IS NULL`;
  if (!rc) throw new ApiError(404, 'e-Rapor tidak ditemukan.');

  // ---- ownership / RBAC ----
  if (me.role === 'siswa' && rc.student_id !== me.studentId) {
    throw new ApiError(403, 'Anda tidak memiliki akses ke e-Rapor ini.');
  }
  if (me.role === 'orang_tua') {
    const [link] = await sql`
      SELECT 1 FROM parent_students
      WHERE parent_user_id = ${me.userId} AND student_id = ${rc.student_id} AND deleted_at IS NULL`;
    if (!link) throw new ApiError(403, 'Anda tidak memiliki akses ke e-Rapor ini.');
  }
  if (me.role === 'guru') {
    // Only the homeroom teacher of that class may open reports as a guru.
    const [wali] = await sql`
      SELECT 1 FROM classes WHERE id = ${rc.class_id} AND homeroom_teacher_id = ${me.teacherId!} AND deleted_at IS NULL`;
    if (!wali) throw new ApiError(403, 'Hanya Wali Kelas yang dapat membuka e-Rapor kelas ini.');
  }

  // Students/parents only ever see approved, frozen reports.
  if ((me.role === 'siswa' || me.role === 'orang_tua') && (rc.status !== 'approved' || !rc.snapshot)) {
    throw new ApiError(403, 'e-Rapor belum disetujui Kepala Sekolah.');
  }
  if (!rc.snapshot) throw new ApiError(409, 'e-Rapor belum difinalisasi.');

  return Response.json(rc.snapshot, {
    headers: { 'Cache-Control': 'private, max-age=300' }, // matches client staleTime
  });
});
