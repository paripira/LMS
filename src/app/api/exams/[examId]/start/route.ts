import { sql, handle, requireRole, ApiError } from '@/lib/server';

// Question paper is identical for every student → memoise 5 min so a 400-student burst
// costs ~1 DB read instead of 400. Contains NO answer keys.
const paperCache = new Map<string, { at: number; data: unknown[] }>();
const PAPER_TTL = 5 * 60_000;

async function loadPaper(examId: string) {
  const hit = paperCache.get(examId);
  if (hit && Date.now() - hit.at < PAPER_TTL) return hit.data;
  const data = await sql`
    SELECT q.id, q.type, q.body, q.media, q.options,
           COALESCE(eq.points, q.points)::float AS points
    FROM exam_questions eq
    JOIN questions q ON q.id = eq.question_id AND q.deleted_at IS NULL
    WHERE eq.exam_id = ${examId}
    ORDER BY eq.position`;
  const plain = [...data];
  paperCache.set(examId, { at: Date.now(), data: plain });
  return plain;
}

export const POST = handle(async (_req, { params }) => {
  const { examId } = await params;
  const me = await requireRole('siswa');

  // Exam must be published, inside its window, and for a class the student is enrolled in.
  const [exam] = await sql`
    SELECT e.id, e.title, e.instructions, e.duration_minutes, e.opens_at, e.closes_at,
           e.shuffle_questions, e.shuffle_options, e.status
    FROM exams e
    JOIN teaching_assignments ta ON ta.id = e.teaching_assignment_id AND ta.deleted_at IS NULL
    JOIN enrollments en ON en.class_id = ta.class_id
                       AND en.student_id = ${me.studentId!} AND en.deleted_at IS NULL
    WHERE e.id = ${examId} AND e.deleted_at IS NULL`;

  if (!exam) throw new ApiError(404, 'Ujian tidak ditemukan atau bukan untuk kelas Anda.');
  if (exam.status !== 'published') throw new ApiError(403, 'Ujian ini belum dibuka oleh guru.');
  const now = Date.now();
  if (now < new Date(exam.opens_at).getTime()) throw new ApiError(403, 'Ujian belum dimulai.');
  if (now > new Date(exam.closes_at).getTime()) throw new ApiError(403, 'Waktu ujian sudah berakhir.');

  // Create or resume. DO UPDATE is a deliberate no-op so RETURNING gives the existing row.
  const [session] = await sql`
    INSERT INTO exam_sessions (exam_id, student_id, deadline_at)
    VALUES (${examId}, ${me.studentId!},
            LEAST(now() + make_interval(mins => ${exam.duration_minutes}::int), ${exam.closes_at}))
    ON CONFLICT (exam_id, student_id) WHERE deleted_at IS NULL
    DO UPDATE SET exam_id = EXCLUDED.exam_id
    RETURNING id, status, deadline_at, now() AS server_now`;

  if (session.status === 'submitted') {
    throw new ApiError(409, 'Jawaban Anda sudah dikumpulkan sebelumnya.', 'ALREADY_SUBMITTED');
  }

  const questions = await loadPaper(examId);

  return Response.json({
    session: {
      id: session.id,
      deadlineAt: new Date(session.deadline_at).getTime(),
      serverNow: new Date(session.server_now).getTime(),
    },
    exam: {
      title: exam.title,
      instructions: exam.instructions,
      shuffleQuestions: exam.shuffle_questions,
      shuffleOptions: exam.shuffle_options,
    },
    questions,
  });
});
