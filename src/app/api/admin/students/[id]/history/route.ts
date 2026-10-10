import { sql, handle, requireRole, ApiError } from '@/lib/server';

export const GET = handle(async (_req, { params }) => {
  await requireRole('admin', 'guru');
  const { id } = await params;

  const [student] = await sql`
    SELECT id, nis, nisn, full_name, gender, birth_date, jenjang, status
    FROM students
    WHERE id = ${id} AND deleted_at IS NULL`;

  if (!student) throw new ApiError(404, 'Siswa tidak ditemukan.');

  const history = await sql`
    SELECT e.id AS enrollment_id, e.academic_year_id, e.class_id, e.promotion_status,
           ay.name AS year_name, c.name AS class_name, c.grade_level,
           t.full_name AS homeroom_name
    FROM enrollments e
    JOIN academic_years ay ON ay.id = e.academic_year_id
    JOIN classes c ON c.id = e.class_id
    LEFT JOIN teachers t ON t.id = c.homeroom_teacher_id
    WHERE e.student_id = ${id} AND e.deleted_at IS NULL
    ORDER BY ay.starts_on DESC`;

  return Response.json({ student, history });
});
