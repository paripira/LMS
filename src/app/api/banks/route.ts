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

// A bank belongs to the subject (and grade level) of one of the teacher's teaching assignments.
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
