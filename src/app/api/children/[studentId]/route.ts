import { sql, handle, requireRole, ApiError } from '@/lib/server';

export const GET = handle(async (_req, { params }) => {
  const me = await requireRole('orang_tua', 'siswa', 'admin');
  const { studentId } = await params;

  if (me.role === 'orang_tua') {
    const [ok] = await sql`
      SELECT 1 FROM parent_students
      WHERE parent_user_id = ${me.userId} AND student_id = ${studentId} AND deleted_at IS NULL`;
    if (!ok) throw new ApiError(403, 'Siswa ini tidak terhubung dengan akun Anda.');
  } else if (me.role === 'siswa' && me.studentId !== studentId) {
    throw new ApiError(403, 'Akses ditolak.');
  }

  const [student] = await sql`
    SELECT s.id, s.full_name AS name, s.nis, s.nisn, s.gender, s.jenjang,
           c.id AS class_id, c.name AS class_name
    FROM students s
    LEFT JOIN enrollments e ON e.student_id = s.id AND e.deleted_at IS NULL
         AND e.academic_year_id = (SELECT id FROM academic_years WHERE is_active AND deleted_at IS NULL)
    LEFT JOIN classes c ON c.id = e.class_id
    WHERE s.id = ${studentId} AND s.deleted_at IS NULL`;

  if (!student) throw new ApiError(404, 'Data siswa tidak ditemukan.');

  // Attendance summary for current semester (per-subject attendance, fallback to daily)
  const [attSubj] = await sql`
    SELECT
      count(*) FILTER (WHERE a.status = 'hadir')::int AS hadir,
      count(*) FILTER (WHERE a.status = 'izin')::int AS izin,
      count(*) FILTER (WHERE a.status = 'sakit')::int AS sakit,
      count(*) FILTER (WHERE a.status = 'alpa')::int AS alpa,
      count(*)::int AS total
    FROM attendance_subject a
    JOIN teaching_assignments ta ON ta.id = a.teaching_assignment_id AND ta.deleted_at IS NULL
    JOIN semesters sem ON sem.id = ta.semester_id AND sem.status = 'active' AND sem.deleted_at IS NULL
    WHERE a.student_id = ${studentId} AND a.deleted_at IS NULL`;

  const [attDaily] = await sql`
    SELECT
      count(*) FILTER (WHERE status = 'hadir')::int AS hadir,
      count(*) FILTER (WHERE status = 'izin')::int AS izin,
      count(*) FILTER (WHERE status = 'sakit')::int AS sakit,
      count(*) FILTER (WHERE status = 'alpa')::int AS alpa,
      count(*)::int AS total
    FROM attendance_daily a
    JOIN semesters sem ON sem.status = 'active' AND sem.deleted_at IS NULL
    WHERE a.student_id = ${studentId} AND a.deleted_at IS NULL
      AND a.attendance_date >= sem.starts_on AND a.attendance_date <= sem.ends_on`;

  const att = (attSubj?.total ?? 0) > 0 ? attSubj : attDaily;
  const totalDays = (att?.total ?? 0);
  const hadir = (att?.hadir ?? 0);
  const attPct = totalDays > 0 ? Math.round((hadir / totalDays) * 1000) / 10 : 100;

  // Recent 15 subject attendance records
  const subjLogs = await sql`
    SELECT a.attendance_date::text AS date, a.status, a.note, sub.name AS subject
    FROM attendance_subject a
    JOIN teaching_assignments ta ON ta.id = a.teaching_assignment_id
    JOIN subjects sub ON sub.id = ta.subject_id
    WHERE a.student_id = ${studentId} AND a.deleted_at IS NULL
    ORDER BY a.attendance_date DESC, sub.name
    LIMIT 15`;

  const attLogs =
    subjLogs.length > 0
      ? subjLogs
      : await sql`
          SELECT attendance_date::text AS date, status, note, NULL::text AS subject
          FROM attendance_daily
          WHERE student_id = ${studentId} AND deleted_at IS NULL
          ORDER BY attendance_date DESC
          LIMIT 10`;

  // Subject Grades for active semester
  const grades = await sql`
    SELECT sub.name AS subject, g.formative_score::float AS formative, g.sas_score::float AS sas,
           g.final_score::float AS final, g.predicate, g.narrative, (g.locked_at IS NOT NULL) AS is_locked
    FROM grades g
    JOIN enrollments e ON e.id = g.enrollment_id
    JOIN teaching_assignments ta ON ta.id = g.teaching_assignment_id
    JOIN subjects sub ON sub.id = ta.subject_id
    JOIN semesters sem ON sem.id = g.semester_id AND sem.status = 'active'
    WHERE e.student_id = ${studentId} AND g.deleted_at IS NULL
    ORDER BY sub.name`;

  // CBT Exam Results
  const cbtResults = await sql`
    SELECT e.title, sub.name AS subject, es.score::float AS score, es.submitted_at, es.status
    FROM exam_sessions es
    JOIN exams e ON e.id = es.exam_id
    JOIN teaching_assignments ta ON ta.id = e.teaching_assignment_id
    JOIN subjects sub ON sub.id = ta.subject_id
    WHERE es.student_id = ${studentId} AND es.deleted_at IS NULL
    ORDER BY es.submitted_at DESC NULLS LAST
    LIMIT 10`;

  // Assignments
  const assignments = await sql`
    SELECT a.title, sub.name AS subject, a.due_at,
           subm.submitted_at, subm.score::float AS score, subm.feedback,
           (subm.id IS NOT NULL) AS is_submitted
    FROM assignments a
    JOIN teaching_assignments ta ON ta.id = a.teaching_assignment_id
    JOIN subjects sub ON sub.id = ta.subject_id
    JOIN enrollments e ON e.class_id = ta.class_id AND e.student_id = ${studentId} AND e.deleted_at IS NULL
    LEFT JOIN assignment_submissions subm ON subm.assignment_id = a.id AND subm.student_id = ${studentId} AND subm.deleted_at IS NULL
    WHERE a.deleted_at IS NULL
    ORDER BY a.due_at DESC NULLS LAST
    LIMIT 10`;

  // Weekly lesson schedule for the student's active class
  const schedules = student.class_id
    ? await sql`
        SELECT s.id, s.day_of_week, s.start_time::text AS start_time, s.end_time::text AS end_time,
               s.room, sub.name AS subject_name, sub.code AS subject_code, t.full_name AS teacher_name
        FROM schedules s
        JOIN teaching_assignments ta ON ta.id = s.teaching_assignment_id AND ta.deleted_at IS NULL
        JOIN subjects sub ON sub.id = ta.subject_id
        JOIN teachers t ON t.id = ta.teacher_id
        JOIN semesters sem ON sem.id = s.semester_id AND sem.status = 'active'
        WHERE s.class_id = ${student.class_id} AND s.deleted_at IS NULL
        ORDER BY s.day_of_week, s.start_time`
    : [];

  // Leave requests (izin / sakit)
  const leaveRequests = await sql`
    SELECT lr.id, lr.kind, lr.starts_on::text AS starts_on, lr.ends_on::text AS ends_on,
           lr.reason, lr.attachment_url, lr.status, lr.created_at,
           rv.full_name AS reviewer_name
    FROM leave_requests lr
    LEFT JOIN users rv ON rv.id = lr.reviewed_by
    WHERE lr.student_id = ${studentId} AND lr.deleted_at IS NULL
    ORDER BY lr.created_at DESC
    LIMIT 20`;

  // Student records (prestasi, kedisiplinan, konseling)
  const studentRecords = await sql`
    SELECT sr.id, sr.kind, sr.category, sr.title, sr.description, sr.points, sr.follow_up,
           sr.recorded_on::text AS recorded_on, u.full_name AS author_name
    FROM student_records sr
    JOIN users u ON u.id = sr.recorded_by
    WHERE sr.student_id = ${studentId} AND sr.deleted_at IS NULL
    ORDER BY sr.recorded_on DESC, sr.created_at DESC
    LIMIT 50`;

  return Response.json({
    student,
    attendance: { ...att, pct: attPct, logs: attLogs },
    grades,
    cbtResults,
    assignments,
    schedules,
    leaveRequests,
    studentRecords,
  });
});
