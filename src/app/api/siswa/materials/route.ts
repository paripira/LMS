import { sql, handle, requireRole } from '@/lib/server';

export const GET = handle(async () => {
  const me = await requireRole('siswa');
  const rows = await sql`
    SELECT m.id, m.title, m.description, m.url, m.published_at,
           sub.name AS subject_name, t.full_name AS teacher_name
    FROM materials m
    JOIN teaching_assignments ta ON ta.id = m.teaching_assignment_id
    JOIN subjects sub ON sub.id = ta.subject_id
    JOIN teachers t ON t.id = ta.teacher_id
    JOIN enrollments e ON e.class_id = ta.class_id AND e.student_id = ${me.studentId!} AND e.deleted_at IS NULL
    WHERE m.deleted_at IS NULL
    ORDER BY m.published_at DESC
    LIMIT 100`;

  return Response.json(rows);
});
