import { z } from 'zod';
import { sql, handle, requireRole } from '@/lib/server';
import { assertAssignmentAccess } from '@/lib/access';

export const GET = handle(async () => {
  const me = await requireRole('guru', 'admin');
  const admin = me.role === 'admin';
  const rows = await sql`
    SELECT b.id, b.title, b.grade_level, sub.id AS subject_id, sub.name AS subject,
           (SELECT count(*) FROM questions q WHERE q.bank_id = b.id AND q.deleted_at IS NULL)::int AS question_count
    FROM question_banks b JOIN subjects sub ON sub.id = b.subject_id
    WHERE b.deleted_at IS NULL AND (${admin}::boolean OR b.teacher_id = ${me.teacherId ?? null}::uuid)
    ORDER BY sub.name, b.title`;
  return Response.json(rows);
});

const Post = z.object({ assignmentId: z.string().uuid('Pilih mata pelajaran'), title: z.string().trim().min(1, 'Judul wajib diisi').max(150) });

export const POST = handle(async (req) => {
  const me = await requireRole('guru');
  const b = Post.parse(await req.json());
  await assertAssignmentAccess(me, b.assignmentId);
  const [r] = await sql`
    INSERT INTO question_banks (teacher_id, subject_id, grade_level, title)
    SELECT ${me.teacherId!}, ta.subject_id, c.grade_level, ${b.title}
    FROM teaching_assignments ta JOIN classes c ON c.id = ta.class_id WHERE ta.id = ${b.assignmentId}
    RETURNING id`;
  return Response.json({ id: r.id });
});

const PatchBank = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(1, 'Judul wajib diisi').max(150),
});

export const PATCH = handle(async (req) => {
  const me = await requireRole('guru', 'admin');
  const b = PatchBank.parse(await req.json());

  const [bank] = await sql`
    SELECT id, teacher_id FROM question_banks WHERE id = ${b.id} AND deleted_at IS NULL`;
  if (!bank) return Response.json({ error: 'Bank soal tidak ditemukan.' }, { status: 404 });
  if (me.role === 'guru' && bank.teacher_id !== me.teacherId) {
    return Response.json({ error: 'Anda bukan pemilik bank soal ini.' }, { status: 403 });
  }

  await sql`UPDATE question_banks SET title = ${b.title} WHERE id = ${b.id}`;
  return Response.json({ ok: true, id: b.id });
});

export const DELETE = handle(async (req) => {
  const me = await requireRole('guru', 'admin');
  const id = z.string().uuid().parse(new URL(req.url).searchParams.get('id'));

  const [bank] = await sql`
    SELECT id, teacher_id FROM question_banks WHERE id = ${id} AND deleted_at IS NULL`;
  if (!bank) return Response.json({ error: 'Bank soal tidak ditemukan.' }, { status: 404 });
  if (me.role === 'guru' && bank.teacher_id !== me.teacherId) {
    return Response.json({ error: 'Anda bukan pemilik bank soal ini.' }, { status: 403 });
  }

  await sql`UPDATE question_banks SET deleted_at = now() WHERE id = ${id}`;
  await sql`UPDATE questions SET deleted_at = now() WHERE bank_id = ${id} AND deleted_at IS NULL`;
  return Response.json({ ok: true });
});
