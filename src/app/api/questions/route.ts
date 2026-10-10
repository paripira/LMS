import { z } from 'zod';
import { sql, handle, requireRole } from '@/lib/server';
import { assertBankAccess } from '@/lib/access';
import { questionInput, toStored } from '@/lib/cbt/question-schema';

const BankId = z.string().uuid();

// Teacher view INCLUDES the answer key (students never reach this endpoint).
export const GET = handle(async (req) => {
  const me = await requireRole('guru', 'admin');
  const bankId = BankId.parse(new URL(req.url).searchParams.get('bankId'));
  await assertBankAccess(me, bankId);
  const rows = await sql`
    SELECT q.id, q.type, q.body, q.media, q.options, q.points::float AS points, k.answer, k.explanation,
           EXISTS (SELECT 1 FROM exam_questions eq JOIN exams e ON e.id = eq.exam_id
                   WHERE eq.question_id = q.id AND e.status <> 'draft' AND e.deleted_at IS NULL) AS locked
    FROM questions q LEFT JOIN question_keys k ON k.question_id = q.id AND k.deleted_at IS NULL
    WHERE q.bank_id = ${bankId} AND q.deleted_at IS NULL ORDER BY q.created_at, q.id`;
  return Response.json(rows);
});

export const POST = handle(async (req) => {
  const me = await requireRole('guru', 'admin');
  const raw = await req.json();
  const bankId = BankId.parse(raw?.bankId);
  await assertBankAccess(me, bankId);

  // Bulk import support: { bankId, items: [...] }
  if (Array.isArray(raw?.items)) {
    const parsedItems = z.array(questionInput).min(1).max(500).parse(raw.items);
    const inserted = await sql.begin(async (tx) => {
      let count = 0;
      for (const item of parsedItems) {
        const s = toStored(item);
        const [q] = await tx`
          INSERT INTO questions (bank_id, type, body, media, options, points)
          VALUES (${bankId}, ${s.type}::question_type, ${s.body}, ${tx.json(s.media as never)}, ${tx.json(s.options as never)}, ${item.points})
          RETURNING id`;
        await tx`
          INSERT INTO question_keys (question_id, answer, explanation)
          VALUES (${q.id}, ${tx.json(s.key as never)}, ${item.explanation || null})`;
        count++;
      }
      return count;
    });
    return Response.json({ inserted });
  }

  const s = toStored(questionInput.parse(raw));

  const id = await sql.begin(async (tx) => {
    const [q] = await tx`INSERT INTO questions (bank_id, type, body, media, options, points)
      VALUES (${bankId}, ${s.type}::question_type, ${s.body}, ${tx.json(s.media as never)}, ${tx.json(s.options as never)}, ${raw.points})
      RETURNING id`;
    await tx`INSERT INTO question_keys (question_id, answer, explanation) VALUES (${q.id}, ${tx.json(s.key as never)}, ${raw.explanation || null})`;
    return q.id as string;
  });
  return Response.json({ id });
});
