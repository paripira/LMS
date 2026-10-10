import { sql, handle, requireRole } from '@/lib/server';

export const GET = handle(async () => {
  const me = await requireRole();

  if (me.role === 'admin') {
    const [[ay], [sem]] = await Promise.all([
      sql`SELECT id, name FROM academic_years WHERE is_active AND deleted_at IS NULL`,
      sql`SELECT id, kind, status FROM semesters WHERE status = 'active' AND deleted_at IS NULL`,
    ]);

    const ayId = ay?.id ?? null;
    const semId = sem?.id ?? null;

    const [counts] = await sql`
      SELECT
        (SELECT count(*)::int FROM students s
          WHERE s.status = 'aktif' AND s.deleted_at IS NULL
            AND NOT EXISTS (
              SELECT 1 FROM enrollments e
              WHERE e.student_id = s.id AND e.academic_year_id = ${ayId}::uuid AND e.deleted_at IS NULL
            )) AS students_no_class,
        (SELECT count(*)::int FROM students
          WHERE status = 'aktif' AND (nisn IS NULL OR nisn = '') AND deleted_at IS NULL) AS students_no_nisn,
        (SELECT count(*)::int FROM teachers
          WHERE (nip IS NULL OR nip = '') AND deleted_at IS NULL) AS teachers_no_nip,
        (SELECT count(*)::int FROM classes
          WHERE academic_year_id = ${ayId}::uuid AND homeroom_teacher_id IS NULL AND deleted_at IS NULL) AS classes_no_wali,
        (SELECT count(*)::int FROM subjects sub
          WHERE deleted_at IS NULL
            AND NOT EXISTS (
              SELECT 1 FROM teaching_assignments ta
              WHERE ta.subject_id = sub.id AND ta.semester_id = ${semId}::uuid AND ta.deleted_at IS NULL
            )) AS subjects_no_assignment,
        (SELECT count(*)::int FROM students WHERE status = 'aktif' AND deleted_at IS NULL) AS total_students,
        (SELECT count(*)::int FROM teachers WHERE deleted_at IS NULL) AS total_teachers,
        (SELECT count(*)::int FROM classes WHERE academic_year_id = ${ayId}::uuid AND deleted_at IS NULL) AS total_classes`;

    return Response.json({
      role: 'admin',
      academicYear: ay ?? null,
      activeSemester: sem ?? null,
      stats: {
        totalStudents: counts.total_students,
        totalTeachers: counts.total_teachers,
        totalClasses: counts.total_classes,
        integrity: {
          studentsNoClass: counts.students_no_class,
          studentsNoNisn: counts.students_no_nisn,
          teachersNoNip: counts.teachers_no_nip,
          classesNoWali: counts.classes_no_wali,
          subjectsNoAssignment: counts.subjects_no_assignment,
        },
      },
    });
  }

  if (me.role === 'guru') {
    const tid = me.teacherId ?? null;
    const [[{ pending_grading }], activeExams, [{ today_marked }]] = await Promise.all([
      sql`
        SELECT count(subm.id)::int AS pending_grading
        FROM assignment_submissions subm
        JOIN assignments a ON a.id = subm.assignment_id AND a.deleted_at IS NULL
        JOIN teaching_assignments ta ON ta.id = a.teaching_assignment_id AND ta.deleted_at IS NULL
        WHERE ta.teacher_id = ${tid}::uuid AND subm.score IS NULL AND subm.deleted_at IS NULL`,
      sql`
        SELECT e.id, e.title, sub.name AS subject_name, c.name AS class_name, e.opens_at, e.closes_at
        FROM exams e
        JOIN teaching_assignments ta ON ta.id = e.teaching_assignment_id AND ta.deleted_at IS NULL
        JOIN subjects sub ON sub.id = ta.subject_id
        JOIN classes c ON c.id = ta.class_id
        WHERE ta.teacher_id = ${tid}::uuid AND e.status = 'published'
          AND now() BETWEEN e.opens_at AND e.closes_at AND e.deleted_at IS NULL`,
      sql`
        SELECT count(DISTINCT teaching_assignment_id)::int AS today_marked
        FROM attendance_subject
        WHERE attendance_date = current_date AND marked_by = ${me.userId} AND deleted_at IS NULL`,
    ]);

    return Response.json({
      role: 'guru',
      pendingGrading: pending_grading,
      activeExams,
      todayMarked: today_marked,
    });
  }

  return Response.json({ role: me.role });
});
