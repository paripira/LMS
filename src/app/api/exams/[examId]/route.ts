import { z } from 'zod';
import { sql, handle, requireRole, ApiError } from '@/lib/server';
import { ExamBase, assertExamAccess, assertQuestionsUsable, assertWindow } from '@/lib/cbt/exam-server';

const Id = z.string().uuid();

export const GET = handle(async (_req, { params }) => {
  const me = await requireRole('guru', 'admin');
  const examId = Id.parse((await params).examId);
  const e = await assertExamAccess(me, examId);
  const qs = await sql`SELECT question_id FROM exam_questions WHERE exam_id = ${examId} ORDER BY position`;
  return Response.json({
    id: e.id, status: e.status, title: e.title, instructions: e.instructions, assignmentId: e.teaching_assignment_id,
    durationMinutes: e.duration_minutes, opensAt: e.opens_at, closesAt: e.closes_at,
    shuffleQuestions: e.shuffle_questions, shuffleOptions: e.shuffle_options, passingScore: e.passing_score,
    showScore: !!e.settings?.show_score, questionIds: qs.map((q) => q.question_id),
  });
});

const Patch = z.discriminatedUnion('action', [
  z.object({ action: z.literal('publish') }),
  z.object({ action: z.literal('archive') }),
  // Published exams: only extend the closing time / toggle score visibility (content stays frozen).
  z.object({ action: z.literal('adjust'), closesAt: z.string().datetime(), showScore: z.boolean() }),
  ExamBase.omit({ assignmentId: true }).extend({ action: z.literal('update') }),
]);

export const PATCH = handle(async (req, { params }) => {
  const me = await requireRole('guru');
  const examId = Id.parse((await params).examId);
  const e = await assertExamAccess(me, examId);
  const b = Patch.parse(await req.json());

  if (b.action === 'publish') {
    if (e.status !== 'draft') throw new ApiError(409, 'Hanya ujian berstatus draf yang dapat diterbitkan.');
    const [c] = await sql`
      SELECT (SELECT count(*) FROM exam_questions WHERE exam_id = ${examId})::int AS n,
             (SELECT count(*) FROM exam_questions eq
                JOIN questions q ON q.id = eq.question_id AND q.deleted_at IS NULL
                JOIN question_keys k ON k.question_id = q.id AND k.deleted_at IS NULL
              WHERE eq.exam_id = ${examId})::int AS valid`;
    if (c.n === 0) throw new ApiError(422, 'Ujian belum memiliki soal.');
    if (c.valid !== c.n) throw new ApiError(422, 'Ada soal yang sudah dihapus atau belum punya kunci jawaban. Ubah daftar soal terlebih dahulu.');
    if (new Date(e.closes_at).getTime() <= Date.now()) throw new ApiError(422, 'Waktu berakhir ujian sudah lewat. Ubah jadwal terlebih dahulu.');
    await sql`UPDATE exams SET status = 'published' WHERE id = ${examId}`;
    return Response.json({ ok: true });
  }

  if (b.action === 'archive') {
    await sql`UPDATE exams SET status = 'archived' WHERE id = ${examId}`;
    return Response.json({ ok: true });
  }

  if (b.action === 'adjust') {
    if (e.status !== 'published') throw new ApiError(409, 'Pengaturan ini hanya untuk ujian yang sedang diterbitkan.');
    if (new Date(b.closesAt).getTime() <= new Date(e.opens_at).getTime()) throw new ApiError(400, 'Waktu selesai harus setelah waktu mulai.');
    await sql`UPDATE exams SET closes_at = ${b.closesAt}::timestamptz,
              settings = jsonb_set(settings, '{show_score}', ${String(b.showScore)}::jsonb) WHERE id = ${examId}`;
    return Response.json({ ok: true });
  }

  // update (draft only)
  if (e.status !== 'draft') throw new ApiError(409, 'Ujian yang sudah diterbitkan tidak dapat diubah. Arsipkan lalu buat ujian baru.');
  assertWindow(b.opensAt, b.closesAt, b.durationMinutes);
  const ids = await assertQuestionsUsable(me, e.subject_id, b.questionIds);
  await sql.begin(async (tx) => {
    await tx`UPDATE exams SET title = ${b.title}, instructions = ${b.instructions}, duration_minutes = ${b.durationMinutes},
             opens_at = ${b.opensAt}::timestamptz, closes_at = ${b.closesAt}::timestamptz,
             shuffle_questions = ${b.shuffleQuestions}, shuffle_options = ${b.shuffleOptions},
             passing_score = ${b.passingScore}, settings = ${tx.json({ show_score: b.showScore })} WHERE id = ${examId}`;
    await tx`DELETE FROM exam_questions WHERE exam_id = ${examId}`;
    await tx`INSERT INTO exam_questions (exam_id, question_id, position)
             SELECT ${examId}, x.qid, x.pos
             FROM unnest(${tx.array(ids)}::uuid[], ${tx.array(ids.map((_, i) => i + 1))}::int[]) AS x(qid, pos)`;
  });
  return Response.json({ ok: true });
});

export const DELETE = handle(async (_req, { params }) => {
  const me = await requireRole('guru');
  const examId = Id.parse((await params).examId);
  const e = await assertExamAccess(me, examId);
  if (e.status !== 'draft') throw new ApiError(409, 'Hanya ujian berstatus draf yang dapat dihapus. Ujian lain dapat diarsipkan.');
  await sql`UPDATE exams SET deleted_at = now() WHERE id = ${examId}`;
  return Response.json({ ok: true });
});
