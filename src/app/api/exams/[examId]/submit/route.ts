import { z } from 'zod';
import { sql, handle, requireRole, ApiError } from '@/lib/server';
import { gradeExam, type KeyRow } from '@/lib/cbt/grade';

const Body = z.object({
  sessionId: z.string().uuid(),
  answers: z.record(z.string().uuid(), z.union([z.string().max(2000), z.array(z.string().max(50)).max(20)])),
  tabSwitches: z.number().int().min(0).max(10000).optional(),
});

export const POST = handle(async (req, { params }) => {
  const { examId } = await params;
  const me = await requireRole('siswa');
  const { sessionId, answers, tabSwitches } = Body.parse(await req.json());

  const result = await sql.begin(async (tx) => {
    // Row lock → concurrent duplicate submits (double-click, retry) serialise here.
    const [s] = await tx`
      SELECT id, status, score, correct_count, total_questions
      FROM exam_sessions
      WHERE id = ${sessionId} AND exam_id = ${examId}
        AND student_id = ${me.studentId!} AND deleted_at IS NULL
      FOR UPDATE`;
    if (!s) throw new ApiError(404, 'Sesi ujian tidak ditemukan.');

    const [{ show_score }] = await tx`
      SELECT COALESCE((settings->>'show_score')::boolean, false) AS show_score
      FROM exams WHERE id = ${examId}`;

    // Idempotent: already submitted → return the stored outcome, change nothing.
    if (s.status === 'submitted') {
      return { score: s.score, correct: s.correct_count, total: s.total_questions, show: show_score };
    }

    const keys = (await tx`
      SELECT q.id, q.type, COALESCE(eq.points, q.points)::float AS points, k.answer
      FROM exam_questions eq
      JOIN questions q      ON q.id = eq.question_id
      JOIN question_keys k  ON k.question_id = q.id
      WHERE eq.exam_id = ${examId}`) as unknown as KeyRow[];

    const g = gradeExam(keys, answers);
    const metaJson = tabSwitches ? { __tab_switches: tabSwitches } : {};

    // Late = beyond deadline + 120 s grace. Still stored & graded; teacher decides.
    const [u] = await tx`
      UPDATE exam_sessions
      SET status = 'submitted', submitted_at = now(),
          answers = ${tx.json(answers)},
          essay_scores = COALESCE(essay_scores, '{}'::jsonb) || ${tx.json(metaJson)},
          score = ${g.score}, correct_count = ${g.correct}, total_questions = ${g.total},
          is_late = (now() > deadline_at + interval '120 seconds')
      WHERE id = ${sessionId}
      RETURNING score, correct_count, total_questions`;

    return { score: u.score, correct: u.correct_count, total: u.total_questions, show: show_score };
  });

  // Hide the score from the student unless the teacher enabled it for this exam.
  return Response.json({
    ok: true,
    score: result.show ? Number(result.score) : null,
    correct: result.show ? result.correct : null,
    total: result.total,
  });
});
