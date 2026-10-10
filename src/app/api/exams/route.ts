import { sql, handle, requireRole } from '@/lib/server';
import { assertAssignmentAccess } from '@/lib/access';
import { ExamBase, assertQuestionsUsable, assertWindow } from '@/lib/cbt/exam-server';

export const GET = handle(async () => {
  const me = await requireRole('guru', 'admin');
  const admin = me.role === 'admin';
  const rows = await sql`
    SELECT e.id, e.title, e.status, e.opens_at, e.closes_at, e.duration_minutes, ta.id AS assignment_id,
           sub.name || ' — ' || c.name AS label,
           (SELECT count(*) FROM exam_questions eq WHERE eq.exam_id = e.id)::int AS question_count,
           (SELECT count(*) FROM exam_sessions s WHERE s.exam_id = e.id AND s.deleted_at IS NULL AND s.status = 'submitted')::int AS submitted,
           (SELECT count(*) FROM enrollments en WHERE en.class_id = ta.class_id AND en.deleted_at IS NULL)::int AS enrolled
    FROM exams e
    JOIN teaching_assignments ta ON ta.id = e.teaching_assignment_id
    JOIN subjects sub ON sub.id = ta.subject_id
    JOIN classes c ON c.id = ta.class_id
    WHERE e.deleted_at IS NULL AND (${admin}::boolean OR ta.teacher_id = ${me.teacherId ?? null}::uuid)
    ORDER BY e.opens_at DESC LIMIT 200`;
  return Response.json(rows);
});

export const POST = handle(async (req) => {
  const me = await requireRole('guru');
  const b = ExamBase.parse(await req.json());
  assertWindow(b.opensAt, b.closesAt, b.durationMinutes);
  const ta = await assertAssignmentAccess(me, b.assignmentId);
  const ids = await assertQuestionsUsable(me, ta.subject_id, b.questionIds);

  const id = await sql.begin(async (tx) => {
    const [e] = await tx`
      INSERT INTO exams (teaching_assignment_id, semester_id, title, instructions, duration_minutes, opens_at, closes_at,
                         shuffle_questions, shuffle_options, passing_score, status, settings, created_by)
      VALUES (${ta.id}, ${ta.semester_id}, ${b.title}, ${b.instructions}, ${b.durationMinutes}, ${b.opensAt}::timestamptz,
              ${b.closesAt}::timestamptz, ${b.shuffleQuestions}, ${b.shuffleOptions}, ${b.passingScore}, 'draft',
              ${tx.json({ show_score: b.showScore })}, ${me.userId})
      RETURNING id`;
    await tx`INSERT INTO exam_questions (exam_id, question_id, position)
             SELECT ${e.id}, x.qid, x.pos
             FROM unnest(${tx.array(ids)}::uuid[], ${tx.array(ids.map((_, i) => i + 1))}::int[]) AS x(qid, pos)`;
    return e.id as string;
  });
  return Response.json({ id });
});
