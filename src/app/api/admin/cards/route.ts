import { sql, handle, requireRole } from '@/lib/server';

export const GET = handle(async (req) => {
  await requireRole('admin');
  const role = new URL(req.url).searchParams.get('role') ?? 'siswa';
  const classId = new URL(req.url).searchParams.get('classId');

  if (role === 'siswa') {
    const rows = await sql`
      SELECT s.id, s.nis, s.full_name AS name, c.name AS class_name,
             u.username, u.must_change_password
      FROM students s
      JOIN users u ON u.id = s.user_id AND u.deleted_at IS NULL
      LEFT JOIN enrollments e ON e.student_id = s.id AND e.deleted_at IS NULL
           AND e.academic_year_id = (SELECT id FROM academic_years WHERE is_active AND deleted_at IS NULL)
      LEFT JOIN classes c ON c.id = e.class_id
      WHERE s.status = 'aktif' AND s.deleted_at IS NULL
        ${classId ? sql`AND e.class_id = ${classId}::uuid` : sql``}
      ORDER BY c.name, s.full_name`;
    return Response.json(rows);
  }

  // Teachers
  const rows = await sql`
    SELECT t.id, t.nip, t.full_name AS name, u.username, u.must_change_password, t.phone
    FROM teachers t
    JOIN users u ON u.id = t.user_id AND u.deleted_at IS NULL
    WHERE t.deleted_at IS NULL
    ORDER BY t.full_name`;
  return Response.json(rows);
});
