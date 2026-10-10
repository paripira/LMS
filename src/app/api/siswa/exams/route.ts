import { sql, handle, requireRole } from '@/lib/server';

export const GET = handle(async () => {
  const me = await requireRole('siswa');
  const rows = await sql`
    SELECT e.id, e.title, e.duration_minutes, e.opens_at, e.closes_at, sub.name AS subject,
           es.status AS session_status, (now() BETWEEN e.opens_at AND e.closes_at) AS is_open
    FROM exams e
    JOIN teaching_assignments ta ON ta.id = e.teaching_assignment_id AND ta.deleted_at IS NULL
    JOIN subjects sub ON sub.id = ta.subject_id
    JOIN enrollments en ON en.class_id = ta.class_id AND en.student_id = ${me.studentId ?? null} AND en.deleted_at IS NULL
    LEFT JOIN exam_sessions es ON es.exam_id = e.id AND es.student_id = ${me.studentId ?? null} AND es.deleted_at IS NULL
    WHERE e.deleted_at IS NULL AND e.status = 'published' AND e.closes_at > now() - interval '7 days'
    ORDER BY e.opens_at DESC`;
  return Response.json(rows);
});
