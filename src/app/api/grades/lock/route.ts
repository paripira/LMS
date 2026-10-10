import { z } from 'zod';
import { sql, handle, requireRole, ApiError } from '@/lib/server';
import { computeFinal, predicateOf, generateNarasi, type TpScore } from '@/lib/erapor/narasi';

const Body = z.object({ teachingAssignmentId: z.string().uuid() });

export const POST = handle(async (req) => {
  const me = await requireRole('guru', 'admin');
  const { teachingAssignmentId } = Body.parse(await req.json());

  // Ownership: a guru may only lock their own teaching assignment.
  if (me.role === 'guru') {
    const [own] = await sql`
      SELECT 1 FROM teaching_assignments
      WHERE id = ${teachingAssignmentId} AND teacher_id = ${me.teacherId!} AND deleted_at IS NULL`;
    if (!own) throw new ApiError(403, 'Anda bukan pengampu mata pelajaran ini.');
  }

  const count = await sql.begin(async (tx) => {
    const rows = await tx`
      SELECT g.id, s.full_name, sub.name AS subject, sub.kkm::float AS kkm,
             g.formative_score::float AS formative, g.sas_score::float AS sas,
             g.tp_scores, g.narrative
      FROM grades g
      JOIN enrollments e ON e.id = g.enrollment_id
      JOIN students s    ON s.id = e.student_id
      JOIN teaching_assignments ta ON ta.id = g.teaching_assignment_id
      JOIN subjects sub  ON sub.id = ta.subject_id
      WHERE g.teaching_assignment_id = ${teachingAssignmentId}
        AND g.deleted_at IS NULL AND g.locked_at IS NULL
      FOR UPDATE OF g`;

    if (rows.length === 0) throw new ApiError(409, 'Tidak ada nilai yang perlu dikunci.');
    const missing = rows.filter((r) => r.sas == null);
    if (missing.length) {
      throw new ApiError(422, `Nilai SAS belum lengkap: ${missing.length} siswa belum memiliki nilai. Lengkapi dahulu sebelum mengunci.`);
    }

    const ids: string[] = [];
    const finals: number[] = [];
    const preds: string[] = [];
    const narrs: string[] = [];
    for (const r of rows) {
      const final = computeFinal(r.formative, r.sas);
      ids.push(r.id);
      finals.push(final);
      preds.push(predicateOf(final));
      // Keep a narrative the teacher already edited; otherwise auto-generate.
      narrs.push(
        r.narrative?.trim() ||
          generateNarasi({
            studentName: r.full_name,
            subject: r.subject,
            finalScore: final,
            kkm: r.kkm,
            tps: (r.tp_scores ?? []) as TpScore[],
          }),
      );
    }

    await tx`
      UPDATE grades g
      SET final_score = v.final, predicate = v.pred, narrative = v.narr,
          locked_at = now(), locked_by = ${me.userId}
      FROM (
        SELECT unnest(${tx.array(ids)}::uuid[])     AS id,
               unnest(${tx.array(finals)}::numeric[]) AS final,
               unnest(${tx.array(preds)}::text[])     AS pred,
               unnest(${tx.array(narrs)}::text[])     AS narr
      ) v
      WHERE g.id = v.id`;

    return rows.length;
  });

  return Response.json({ ok: true, locked: count });
});
