import { z } from 'zod';
import { sql, handle, requireRole, ApiError } from '@/lib/server';

export const GET = handle(async (_req, { params }) => {
  const me = await requireRole();
  const { assignmentId } = await params;

  const [a] = await sql`
    SELECT a.id, a.title, a.due_at, a.teaching_assignment_id, ta.teacher_id, ta.class_id, sub.name AS subject_name
    FROM assignments a
    JOIN teaching_assignments ta ON ta.id = a.teaching_assignment_id
    JOIN subjects sub ON sub.id = ta.subject_id
    WHERE a.id = ${assignmentId} AND a.deleted_at IS NULL`;

  if (!a) throw new ApiError(404, 'Tugas tidak ditemukan.');

  if (me.role === 'siswa') {
    const [subm] = await sql`
      SELECT id, url, note, submitted_at, score, feedback, graded_at
      FROM assignment_submissions
      WHERE assignment_id = ${assignmentId} AND student_id = ${me.studentId!} AND deleted_at IS NULL`;
    return Response.json({ assignment: a, submission: subm ?? null });
  }

  // Guru or Admin
  if (me.role === 'guru' && a.teacher_id !== me.teacherId) {
    throw new ApiError(403, 'Anda bukan pengampu tugas ini.');
  }

  const rows = await sql`
    SELECT s.id AS student_id, s.nis, s.full_name AS student_name,
           subm.id AS submission_id, subm.url, subm.note, subm.submitted_at,
           subm.score, subm.feedback, subm.graded_at,
           (subm.id IS NOT NULL) AS is_submitted
    FROM enrollments e
    JOIN students s ON s.id = e.student_id AND s.deleted_at IS NULL
    LEFT JOIN assignment_submissions subm ON subm.assignment_id = ${assignmentId} AND subm.student_id = s.id AND subm.deleted_at IS NULL
    WHERE e.class_id = ${a.class_id} AND e.deleted_at IS NULL
    ORDER BY s.full_name`;

  return Response.json({ assignment: a, students: rows });
});

const PostSubmission = z.object({
  url: z.string().trim().regex(/^https?:\/\//i, 'Tautan jawaban harus diawali http:// atau https://'),
  note: z.string().trim().max(1000).nullish().transform((v) => v || null),
});

// Siswa submits/updates their answer
export const POST = handle(async (req, { params }) => {
  const me = await requireRole('siswa');
  const { assignmentId } = await params;
  const b = PostSubmission.parse(await req.json());

  const [a] = await sql`
    SELECT a.id, a.due_at, a.teaching_assignment_id, ta.class_id
    FROM assignments a
    JOIN teaching_assignments ta ON ta.id = a.teaching_assignment_id
    JOIN enrollments e ON e.class_id = ta.class_id AND e.student_id = ${me.studentId!} AND e.deleted_at IS NULL
    WHERE a.id = ${assignmentId} AND a.deleted_at IS NULL`;

  if (!a) throw new ApiError(404, 'Tugas tidak ditemukan atau bukan untuk kelas Anda.');

  const [subm] = await sql`
    INSERT INTO assignment_submissions (assignment_id, student_id, url, note, submitted_at)
    VALUES (${assignmentId}, ${me.studentId!}, ${b.url}, ${b.note}, now())
    ON CONFLICT (assignment_id, student_id) WHERE deleted_at IS NULL
    DO UPDATE SET url = EXCLUDED.url, note = EXCLUDED.note, submitted_at = now()
    RETURNING id`;

  return Response.json({ ok: true, id: subm.id });
});

const PutGrade = z.object({
  studentId: z.string().uuid(),
  score: z.number().min(0, 'Nilai minimal 0').max(100, 'Nilai maksimal 100'),
  feedback: z.string().trim().max(1000).nullish().transform((v) => v || null),
});

// Guru grades the student's submission
export const PUT = handle(async (req, { params }) => {
  const me = await requireRole('guru', 'admin');
  const { assignmentId } = await params;
  const b = PutGrade.parse(await req.json());

  const [a] = await sql`
    SELECT a.id, a.title, ta.teacher_id, sub.name AS subject_name
    FROM assignments a
    JOIN teaching_assignments ta ON ta.id = a.teaching_assignment_id
    JOIN subjects sub ON sub.id = ta.subject_id
    WHERE a.id = ${assignmentId} AND a.deleted_at IS NULL`;

  if (!a) throw new ApiError(404, 'Tugas tidak ditemukan.');
  if (me.role === 'guru' && a.teacher_id !== me.teacherId) {
    throw new ApiError(403, 'Anda bukan pengampu tugas ini.');
  }

  const [subm] = await sql`
    UPDATE assignment_submissions
    SET score = ${b.score}, feedback = ${b.feedback}, graded_at = now()
    WHERE assignment_id = ${assignmentId} AND student_id = ${b.studentId} AND deleted_at IS NULL
    RETURNING id`;

  if (!subm) throw new ApiError(404, 'Siswa belum mengumpulkan tugas ini sehingga belum dapat dinilai.');

  // Notify student
  import('@/lib/notifications').then(async ({ sendNotification }) => {
    const [st] = await sql`SELECT user_id FROM students WHERE id = ${b.studentId}`;
    if (st?.user_id) {
      sendNotification(st.user_id as string, {
        title: `Tugas Telah Dinilai: ${a.title}`,
        body: `Nilai Anda: ${b.score}. ${b.feedback ? `Catatan guru: "${b.feedback}"` : ''}`,
        link: '/siswa',
        type: 'tugas',
      }).catch(() => {});
    }
  }).catch(() => {});

  return Response.json({ ok: true });
});
