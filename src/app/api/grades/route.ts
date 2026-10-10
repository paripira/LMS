import { z } from 'zod';
import { sql, handle, requireRole } from '@/lib/server';
import { assertAssignmentAccess } from '@/lib/access';

const Id = z.string().uuid();

export const GET = handle(async (req) => {
  const me = await requireRole('guru', 'admin');
  const aid = Id.parse(new URL(req.url).searchParams.get('assignmentId'));
  await assertAssignmentAccess(me, aid);

  // Make sure every enrolled student has a grade row (idempotent).
  await sql`
    INSERT INTO grades (enrollment_id, teaching_assignment_id, semester_id)
    SELECT e.id, ta.id, ta.semester_id
    FROM teaching_assignments ta
    JOIN enrollments e ON e.class_id = ta.class_id AND e.deleted_at IS NULL
    WHERE ta.id = ${aid}
    ON CONFLICT (enrollment_id, teaching_assignment_id) WHERE deleted_at IS NULL DO NOTHING`;

  const rows = await sql`
    SELECT g.id, s.nis, s.full_name AS name,
           g.formative_score::float AS formative, g.sas_score::float AS sas,
           g.final_score::float AS final, g.predicate, (g.locked_at IS NOT NULL) AS locked,
           (
             SELECT round(avg(subm.score)::numeric, 1)::float
             FROM assignment_submissions subm
             JOIN assignments a ON a.id = subm.assignment_id AND a.deleted_at IS NULL
             WHERE a.teaching_assignment_id = ${aid}
               AND subm.student_id = s.id
               AND subm.score IS NOT NULL
               AND subm.deleted_at IS NULL
           ) AS avg_assignment,
           (
             SELECT round(avg(es.score)::numeric, 1)::float
             FROM exam_sessions es
             JOIN exams ex ON ex.id = es.exam_id AND ex.deleted_at IS NULL
             WHERE ex.teaching_assignment_id = ${aid}
               AND es.student_id = s.id
               AND es.status = 'submitted'
               AND es.score IS NOT NULL
               AND es.deleted_at IS NULL
           ) AS avg_exam
    FROM grades g
    JOIN enrollments e ON e.id = g.enrollment_id
    JOIN students s ON s.id = e.student_id AND s.deleted_at IS NULL
    WHERE g.teaching_assignment_id = ${aid} AND g.deleted_at IS NULL
    ORDER BY s.full_name`;
  return Response.json({ rows });
});

const score = z.number().min(0).max(100).nullable();
const Put = z.object({
  assignmentId: Id,
  rows: z.array(z.object({ id: Id, formative: score, sas: score })).min(1).max(200),
});

// Locked rows are skipped by the WHERE clause (and protected again by the DB trigger).
export const PUT = handle(async (req) => {
  const me = await requireRole('guru', 'admin');
  const b = Put.parse(await req.json());
  await assertAssignmentAccess(me, b.assignmentId);

  const updated = await sql`
    UPDATE grades g SET formative_score = v.f, sas_score = v.s
    FROM (SELECT unnest(${sql.array(b.rows.map((r) => r.id))}::uuid[]) AS id,
                 unnest(${sql.array(b.rows.map((r) => r.formative))}::numeric[]) AS f,
                 unnest(${sql.array(b.rows.map((r) => r.sas))}::numeric[]) AS s) v
    WHERE g.id = v.id AND g.teaching_assignment_id = ${b.assignmentId} AND g.locked_at IS NULL
    RETURNING g.id`;
  return Response.json({ ok: true, saved: updated.length });
});
