import { z } from 'zod';
import { sql, handle, requireRole, ApiError } from '@/lib/server';
import { assertExamAccess } from '@/lib/cbt/exam-server';
import { isCorrect, gradeExam, type KeyRow, type Answer } from '@/lib/cbt/grade';

const Id = z.string().uuid();

export const GET = handle(async (_req, { params }) => {
  const me = await requireRole('guru', 'admin');
  const examId = Id.parse((await params).examId);
  const e = await assertExamAccess(me, examId);

  // Every enrolled student appears, including those who never started.
  const rows = await sql`
    SELECT s.id AS student_id, s.nis, s.full_name AS name, es.id AS session_id, es.status,
           es.score::float AS score, es.correct_count, es.total_questions,
           es.started_at, es.submitted_at, COALESCE(es.is_late, false) AS is_late,
           COALESCE(es.answers, '{}'::jsonb) AS answers,
           COALESCE(es.essay_scores, '{}'::jsonb) AS essay_scores
    FROM enrollments en
    JOIN students s ON s.id = en.student_id AND s.deleted_at IS NULL
    LEFT JOIN exam_sessions es ON es.exam_id = ${examId} AND es.student_id = s.id AND es.deleted_at IS NULL
    WHERE en.class_id = ${e.class_id} AND en.deleted_at IS NULL
    ORDER BY s.full_name`;

  const keys = (await sql`
    SELECT q.id, q.type, q.body, COALESCE(eq.points, q.points)::float AS points, k.answer, eq.position
    FROM exam_questions eq
    JOIN questions q ON q.id = eq.question_id
    JOIN question_keys k ON k.question_id = q.id
    WHERE eq.exam_id = ${examId} ORDER BY eq.position`) as unknown as (KeyRow & { body: string; position: number })[];
  const subs = await sql`SELECT answers, COALESCE(essay_scores, '{}'::jsonb) AS essay_scores FROM exam_sessions WHERE exam_id = ${examId} AND status = 'submitted' AND deleted_at IS NULL`;

  const stats = keys.map((k) => ({
    id: k.id,
    position: k.position,
    type: k.type,
    points: k.points,
    rubric: k.type === 'esai' ? String(k.answer ?? '') : null,
    body: k.body.slice(0, 140),
    fullBody: k.body,
    correctPct: subs.length
      ? Math.round(
          (100 *
            subs.filter((s) =>
              k.type === 'esai'
                ? Number((s.essay_scores as Record<string, number>)[k.id] ?? 0) >= k.points
                : isCorrect(k, (s.answers as Record<string, string | string[]>)[k.id]),
            ).length) /
            subs.length,
        )
      : null,
  }));

  const done = rows.filter((r) => r.status === 'submitted');
  const scores = done.map((r) => r.score as number);
  const summary = {
    enrolled: rows.length,
    submitted: done.length,
    inProgress: rows.filter((r) => r.status === 'in_progress').length,
    avg: scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100 : null,
    max: scores.length ? Math.max(...scores) : null,
    min: scores.length ? Math.min(...scores) : null,
    passed: e.passing_score != null ? scores.filter((s) => s >= e.passing_score!).length : null,
  };

  return Response.json({ exam: { title: e.title, status: e.status, passingScore: e.passing_score }, summary, rows, stats });
});

// POST actions:
// 1. retake: soft-deletes the student's session so a fresh one can be started
// 2. grade_essay: manually scores essay questions and recalculates total exam score
const ActionSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('retake'),
    sessionId: Id,
  }),
  z.object({
    action: z.literal('grade_essay'),
    sessionId: Id,
    essayScores: z.record(z.string().uuid(), z.number().min(0).max(100)),
  }),
]);

export const POST = handle(async (req, { params }) => {
  const me = await requireRole('guru', 'admin');
  const examId = Id.parse((await params).examId);
  await assertExamAccess(me, examId);
  const body = ActionSchema.parse(await req.json());

  if (body.action === 'retake') {
    const r = await sql`UPDATE exam_sessions SET deleted_at = now() WHERE id = ${body.sessionId} AND exam_id = ${examId} AND deleted_at IS NULL RETURNING id`;
    return Response.json({ ok: r.length === 1, action: body.action });
  }

  // action === 'grade_essay'
  const updated = await sql.begin(async (tx) => {
    const [session] = await tx`
      SELECT id, answers FROM exam_sessions
      WHERE id = ${body.sessionId} AND exam_id = ${examId} AND deleted_at IS NULL
      FOR UPDATE`;
    if (!session) throw new ApiError(404, 'Sesi ujian siswa tidak ditemukan.');

    const keys = (await tx`
      SELECT q.id, q.type, COALESCE(eq.points, q.points)::float AS points, k.answer
      FROM exam_questions eq
      JOIN questions q ON q.id = eq.question_id
      JOIN question_keys k ON k.question_id = q.id
      WHERE eq.exam_id = ${examId}`) as unknown as KeyRow[];

    const g = gradeExam(keys, (session.answers ?? {}) as Record<string, Answer>, body.essayScores);

    const [u] = await tx`
      UPDATE exam_sessions
      SET essay_scores = COALESCE(essay_scores, '{}'::jsonb) || ${tx.json(body.essayScores)},
          score = ${g.score},
          correct_count = ${g.correct}
      WHERE id = ${body.sessionId}
      RETURNING score::float AS score, correct_count`;
    return u;
  });

  return Response.json({ ok: true, action: body.action, score: updated.score, correctCount: updated.correct_count });
});
