import { sql, handle, requireRole, ApiError } from '@/lib/server';

export const GET = handle(async (req) => {
  await requireRole('admin', 'guru', 'kepala_sekolah');
  const u = new URL(req.url).searchParams;
  const classId = u.get('classId');
  if (!classId) throw new ApiError(400, 'Pilih kelas terlebih dahulu.');

  const [sem] = await sql`SELECT id, kind, academic_year_id FROM semesters WHERE status = 'active' AND deleted_at IS NULL`;
  if (!sem) throw new ApiError(409, 'Belum ada semester aktif.');

  const [cls] = await sql`
    SELECT c.id, c.name, c.jenjang, t.full_name AS homeroom_name, ay.name AS year_name
    FROM classes c
    JOIN academic_years ay ON ay.id = c.academic_year_id
    LEFT JOIN teachers t ON t.id = c.homeroom_teacher_id
    WHERE c.id = ${classId} AND c.deleted_at IS NULL`;

  if (!cls) throw new ApiError(404, 'Kelas tidak ditemukan.');

  // Subjects in this class
  const subjects = await sql`
    SELECT DISTINCT sub.id, sub.code, sub.name, sub.kkm
    FROM teaching_assignments ta
    JOIN subjects sub ON sub.id = ta.subject_id
    WHERE ta.class_id = ${classId} AND ta.semester_id = ${sem.id} AND ta.deleted_at IS NULL
    ORDER BY sub.name`;

  // Students & Grades
  const students = await sql`
    SELECT s.id, s.nis, s.full_name AS name, e.id AS enrollment_id
    FROM enrollments e
    JOIN students s ON s.id = e.student_id AND s.deleted_at IS NULL
    WHERE e.class_id = ${classId} AND e.deleted_at IS NULL
    ORDER BY s.full_name`;

  const grades = await sql`
    SELECT g.enrollment_id, ta.subject_id, g.final_score::float AS final, g.predicate
    FROM grades g
    JOIN teaching_assignments ta ON ta.id = g.teaching_assignment_id
    WHERE ta.class_id = ${classId} AND g.semester_id = ${sem.id} AND g.deleted_at IS NULL`;

  const gradeMap = new Map<string, { final: number | null; predicate: string | null }>();
  grades.forEach((g) => {
    gradeMap.set(`${g.enrollment_id}_${g.subject_id}`, { final: g.final, predicate: g.predicate });
  });

  const studentRows = students.map((st) => {
    const scores: Record<string, number | null> = {};
    let sum = 0;
    let count = 0;

    subjects.forEach((sub) => {
      const val = gradeMap.get(`${st.enrollment_id}_${sub.id}`);
      scores[sub.id] = val?.final ?? null;
      if (val?.final != null) {
        sum += val.final;
        count++;
      }
    });

    const avg = count > 0 ? Math.round((sum / count) * 100) / 100 : null;
    return {
      studentId: st.id,
      nis: st.nis,
      name: st.name,
      scores,
      total: sum > 0 ? Math.round(sum) : null,
      average: avg,
    };
  });

  // Rank by average descending
  studentRows.sort((a, b) => (b.average ?? -1) - (a.average ?? -1));
  const ranked = studentRows.map((s, idx) => ({ ...s, rank: s.average != null ? idx + 1 : '-' }));

  return Response.json({
    class: cls,
    semester: sem,
    subjects,
    rows: ranked,
  });
});
