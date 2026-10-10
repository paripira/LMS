import { z } from 'zod';
import { sql, handle, requireRole, ApiError, type Session } from '@/lib/server';
import { assertBankAccess } from '@/lib/access';
import { questionInput, toStored } from '@/lib/cbt/question-schema';

async function load(me: Session, id: string) {
  z.string().uuid().parse(id);
  const [q] = await sql`SELECT id, bank_id FROM questions WHERE id = ${id} AND deleted_at IS NULL`;
  if (!q) throw new ApiError(404, 'Soal tidak ditemukan.');
  await assertBankAccess(me, q.bank_id);
  // Integrity: a question used by a published/archived exam is frozen (students may already have answered it).
  const [used] = await sql`SELECT 1 FROM exam_questions eq JOIN exams e ON e.id = eq.exam_id
                           WHERE eq.question_id = ${id} AND e.status <> 'draft' AND e.deleted_at IS NULL LIMIT 1`;
  if (used) throw new ApiError(409, 'Soal ini sudah dipakai pada ujian yang diterbitkan sehingga tidak dapat diubah atau dihapus. Buat soal baru sebagai gantinya.');
}

export const PUT = handle(async (req, { params }) => {
  const me = await requireRole('guru');
  const { id } = await params;
  await load(me, id);
  const raw = await req.json();
  const s = toStored(questionInput.parse(raw));
  await sql.begin(async (tx) => {
    await tx`UPDATE questions SET type = ${s.type}::question_type, body = ${s.body}, media = ${tx.json(s.media as never)},
             options = ${tx.json(s.options as never)}, points = ${raw.points} WHERE id = ${id}`;
    await tx`INSERT INTO question_keys (question_id, answer, explanation) VALUES (${id}, ${tx.json(s.key as never)}, ${raw.explanation || null})
             ON CONFLICT (question_id) DO UPDATE SET answer = EXCLUDED.answer, explanation = EXCLUDED.explanation, deleted_at = NULL`;
  });
  return Response.json({ ok: true });
});

export const DELETE = handle(async (_req, { params }) => {
  const me = await requireRole('guru');
  const { id } = await params;
  await load(me, id);
  await sql.begin(async (tx) => {
    await tx`UPDATE questions SET deleted_at = now() WHERE id = ${id}`;
    await tx`UPDATE question_keys SET deleted_at = now() WHERE question_id = ${id}`;
  });
  return Response.json({ ok: true });
});
