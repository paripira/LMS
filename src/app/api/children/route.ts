import { sql, handle, requireRole } from '@/lib/server';

// orang_tua → their children (multi-child switcher); siswa → themself. Only APPROVED reports are listed.
export const GET = handle(async () => {
  const me = await requireRole('orang_tua', 'siswa');
  const scope =
    me.role === 'siswa'
      ? sql`s.id = ${me.studentId ?? null}`
      : sql`s.id IN (SELECT student_id FROM parent_students WHERE parent_user_id = ${me.userId} AND deleted_at IS NULL)`;

  const rows = await sql`
    SELECT s.id, s.full_name AS name, s.nis, c.name AS class_name,
      COALESCE((
        SELECT jsonb_agg(jsonb_build_object('id', rc.id, 'label', initcap(sem.kind::text) || ' ' || ay.name) ORDER BY sem.starts_on DESC)
        FROM report_cards rc
        JOIN enrollments e2 ON e2.id = rc.enrollment_id
        JOIN semesters sem ON sem.id = rc.semester_id
        JOIN academic_years ay ON ay.id = sem.academic_year_id
        WHERE e2.student_id = s.id AND rc.status = 'approved' AND rc.deleted_at IS NULL), '[]'::jsonb) AS reports
    FROM students s
    LEFT JOIN enrollments e ON e.student_id = s.id AND e.deleted_at IS NULL
         AND e.academic_year_id = (SELECT id FROM academic_years WHERE is_active AND deleted_at IS NULL)
    LEFT JOIN classes c ON c.id = e.class_id
    WHERE s.deleted_at IS NULL AND ${scope}
    ORDER BY s.full_name`;
  return Response.json(rows);
});
