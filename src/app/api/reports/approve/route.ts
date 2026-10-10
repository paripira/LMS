import { z } from 'zod';
import { sql, handle, requireRole, ApiError } from '@/lib/server';

const Body = z.object({ classId: z.string().uuid(), semesterId: z.string().uuid() });

// Kepala Sekolah bulk-approves a class. In ONE statement each submitted report gets a frozen
// JSON snapshot; reports with any unlocked grade are skipped.
export const POST = handle(async (req) => {
  const me = await requireRole('kepala_sekolah');
  const { classId, semesterId } = Body.parse(await req.json());

  const approved = await sql`
    UPDATE report_cards rc
    SET status = 'approved', approved_by = ${me.userId}, approved_at = now(),
        snapshot = jsonb_build_object(
          'student', jsonb_build_object('name', s.full_name, 'nis', s.nis, 'nisn', s.nisn),
          'class',   jsonb_build_object('name', c.name, 'grade_level', c.grade_level, 'jenjang', c.jenjang),
          'semester', jsonb_build_object('kind', sem.kind, 'year', ay.name),
          'grades', COALESCE((
              SELECT jsonb_agg(jsonb_build_object(
                       'subject', sub.name, 'score', g.final_score, 'predicate', g.predicate,
                       'narrative', g.narrative, 'kkm', sub.kkm) ORDER BY sub.name)
              FROM grades g
              JOIN teaching_assignments ta ON ta.id = g.teaching_assignment_id
              JOIN subjects sub            ON sub.id = ta.subject_id
              WHERE g.enrollment_id = rc.enrollment_id AND g.semester_id = rc.semester_id
                AND g.deleted_at IS NULL), '[]'::jsonb),
          'attendance', rc.attendance_summary,
          'extracurriculars', rc.extracurriculars,
          'homeroom_notes', rc.homeroom_notes,
          'promotion_status', e.promotion_status,
          'homeroom_teacher', t.full_name,
          'approved_at', now()
        )
    FROM enrollments e
    JOIN students s        ON s.id = e.student_id
    JOIN classes c         ON c.id = e.class_id
    JOIN semesters sem     ON sem.id = ${semesterId}
    JOIN academic_years ay ON ay.id = sem.academic_year_id
    LEFT JOIN teachers t   ON t.id = c.homeroom_teacher_id
    WHERE rc.enrollment_id = e.id
      AND rc.semester_id = ${semesterId}
      AND e.class_id = ${classId}
      AND rc.status = 'submitted' AND rc.deleted_at IS NULL
      AND NOT EXISTS (
        SELECT 1 FROM grades g
        WHERE g.enrollment_id = rc.enrollment_id AND g.semester_id = rc.semester_id
          AND g.deleted_at IS NULL AND g.locked_at IS NULL)
    RETURNING rc.id`;

  const [{ pending }] = await sql`
    SELECT count(*)::int AS pending
    FROM report_cards rc JOIN enrollments e ON e.id = rc.enrollment_id
    WHERE e.class_id = ${classId} AND rc.semester_id = ${semesterId}
      AND rc.status <> 'approved' AND rc.deleted_at IS NULL`;

  if (approved.length > 0) {
    import('@/lib/notifications').then(async ({ sendClassNotification, sendParentNotification }) => {
      sendClassNotification(classId, {
        title: 'e-Rapor Telah Terbit',
        body: 'e-Rapor Anda telah disetujui Kepala Sekolah dan sudah dapat diunduh.',
        link: '/siswa',
        type: 'rapor',
      }).catch(() => {});

      const students = await sql`SELECT student_id FROM enrollments WHERE class_id = ${classId} AND deleted_at IS NULL`;
      for (const s of students) {
        sendParentNotification(s.student_id as string, {
          title: 'e-Rapor Ananda Telah Terbit',
          body: 'e-Rapor ananda telah disetujui Kepala Sekolah dan dapat diunduh melalui portal orang tua.',
          link: '/ortu',
          type: 'rapor',
        }).catch(() => {});
      }
    }).catch(() => {});
  }

  return Response.json({ ok: true, approved: approved.length, pending });
});
