import { sql, handle, requireRole } from '@/lib/server';

// One cached call feeds every picker (class / assignment) for admin & guru, scoped to what they may touch.
export const GET = handle(async () => {
  const me = await requireRole('admin', 'guru');
  const [semester] = await sql`
    SELECT s.id, s.kind, s.starts_on::text AS starts_on, s.ends_on::text AS ends_on, s.academic_year_id, ay.name AS year_name
    FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id
    WHERE s.status = 'active' AND s.deleted_at IS NULL`;
  if (!semester) return Response.json({ semester: null, classes: [], assignments: [] });

  const admin = me.role === 'admin';
  const tid = me.teacherId ?? null;

  const classes = await sql`
    SELECT c.id, c.name, c.jenjang, COALESCE(c.homeroom_teacher_id = ${tid}::uuid, false) AS is_wali
    FROM classes c
    WHERE c.academic_year_id = ${semester.academic_year_id} AND c.deleted_at IS NULL
      AND (${admin}::boolean OR c.homeroom_teacher_id = ${tid}::uuid
           OR EXISTS (SELECT 1 FROM teaching_assignments ta
                      WHERE ta.class_id = c.id AND ta.teacher_id = ${tid}::uuid
                        AND ta.semester_id = ${semester.id} AND ta.deleted_at IS NULL))
    ORDER BY c.grade_level, c.name`;

  const assignments = await sql`
    SELECT ta.id, ta.class_id, ta.subject_id, c.jenjang, sub.name || ' — ' || c.name AS label
    FROM teaching_assignments ta
    JOIN subjects sub ON sub.id = ta.subject_id
    JOIN classes c ON c.id = ta.class_id
    WHERE ta.semester_id = ${semester.id} AND ta.deleted_at IS NULL
      AND (${admin}::boolean OR ta.teacher_id = ${tid}::uuid)
    ORDER BY c.jenjang, c.name, sub.name`;

  return Response.json({ semester, classes, assignments });
});
