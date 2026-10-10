import { z } from 'zod';
import { sql, handle, requireRole, ApiError } from '@/lib/server';
import { activeSemester, assertClassAccess } from '@/lib/access';

const Id = z.string().uuid();

// All report cards of a class for the active semester (cards are created on first open).
export const GET = handle(async (req) => {
  const me = await requireRole('guru', 'admin');
  const classId = Id.parse(new URL(req.url).searchParams.get('classId'));
  await assertClassAccess(me, classId, true);
  const sem = await activeSemester();

  await sql`INSERT INTO report_cards (enrollment_id, semester_id)
            SELECT e.id, ${sem.id} FROM enrollments e WHERE e.class_id = ${classId} AND e.deleted_at IS NULL
            ON CONFLICT (enrollment_id, semester_id) WHERE deleted_at IS NULL DO NOTHING`;

  const rows = await sql`
    SELECT rc.id AS report_id, e.student_id, s.full_name AS name, s.nis,
           rc.homeroom_notes, rc.extracurriculars, rc.status, e.promotion_status,
           (SELECT count(*) FROM grades g WHERE g.enrollment_id = e.id AND g.semester_id = ${sem.id} AND g.deleted_at IS NULL)::int AS grades_total,
           (SELECT count(*) FROM grades g WHERE g.enrollment_id = e.id AND g.semester_id = ${sem.id} AND g.deleted_at IS NULL AND g.locked_at IS NOT NULL)::int AS grades_locked
    FROM report_cards rc
    JOIN enrollments e ON e.id = rc.enrollment_id
    JOIN students s ON s.id = e.student_id AND s.deleted_at IS NULL
    WHERE e.class_id = ${classId} AND rc.semester_id = ${sem.id} AND rc.deleted_at IS NULL
    ORDER BY s.full_name`;
  return Response.json({ rows, kind: sem.kind });
});

const Put = z.object({
  reportId: Id,
  homeroomNotes: z.string().max(2000).nullable(),
  extracurriculars: z.array(z.object({
    name: z.string().trim().min(1).max(80),
    grade: z.enum(['A', 'B', 'C', 'D']),
    description: z.string().max(200).optional(),
  })).max(10),
  promotionStatus: z.enum(['naik', 'tinggal', 'lulus', 'pindah']).nullable().optional(),
});

export const PUT = handle(async (req) => {
  const me = await requireRole('guru', 'admin');
  const b = Put.parse(await req.json());

  const [rc] = await sql`SELECT rc.status, rc.enrollment_id, e.class_id FROM report_cards rc
                         JOIN enrollments e ON e.id = rc.enrollment_id WHERE rc.id = ${b.reportId} AND rc.deleted_at IS NULL`;
  if (!rc) throw new ApiError(404, 'e-Rapor tidak ditemukan.');
  await assertClassAccess(me, rc.class_id, true);
  if (rc.status === 'approved') throw new ApiError(409, 'e-Rapor sudah disetujui Kepala Sekolah dan tidak dapat diubah.');

  await sql.begin(async (tx) => {
    // Editing a card that was already sent returns it to draft so it must be re-sent.
    await tx`UPDATE report_cards SET homeroom_notes = ${b.homeroomNotes}, extracurriculars = ${tx.json(b.extracurriculars as never)},
             status = CASE WHEN status = 'submitted' THEN 'draft'::report_status ELSE status END WHERE id = ${b.reportId}`;
    if (b.promotionStatus !== undefined) {
      await tx`UPDATE enrollments SET promotion_status = ${b.promotionStatus}::promotion_status WHERE id = ${rc.enrollment_id}`;
    }
  });
  return Response.json({ ok: true });
});

// Send to Kepala Sekolah: refreshes the semester attendance totals and flips ready cards to 'submitted'.
export const POST = handle(async (req) => {
  const me = await requireRole('guru', 'admin');
  const { classId } = z.object({ classId: Id }).parse(await req.json());
  await assertClassAccess(me, classId, true);
  const sem = await activeSemester();

  const ready = await sql`
    WITH subj_att AS (
      SELECT
        e.student_id,
        count(asub.id) AS subj_total,
        count(asub.id) FILTER (WHERE asub.status = 'hadir')::int AS hadir,
        count(asub.id) FILTER (WHERE asub.status = 'izin')::int AS izin,
        count(asub.id) FILTER (WHERE asub.status = 'sakit')::int AS sakit,
        count(asub.id) FILTER (WHERE asub.status = 'alpa')::int AS alpa
      FROM enrollments e
      LEFT JOIN teaching_assignments ta
        ON ta.class_id = e.class_id AND ta.semester_id = ${sem.id} AND ta.deleted_at IS NULL
      LEFT JOIN attendance_subject asub
        ON asub.student_id = e.student_id AND asub.teaching_assignment_id = ta.id AND asub.deleted_at IS NULL
      WHERE e.class_id = ${classId} AND e.deleted_at IS NULL
      GROUP BY e.student_id
    )
    UPDATE report_cards rc
    SET status = 'submitted', submitted_at = now(),
        attendance_summary = CASE
          WHEN COALESCE(sa.subj_total, 0) > 0 THEN
            jsonb_build_object('hadir', sa.hadir, 'izin', sa.izin, 'sakit', sa.sakit, 'alpa', sa.alpa)
          ELSE
            jsonb_build_object('hadir', a.hadir, 'izin', a.izin, 'sakit', a.sakit, 'alpa', a.alpa)
        END
    FROM enrollments e
    JOIN attendance_range(${classId}::uuid, ${sem.starts_on}::date, (${sem.ends_on}::date + 1)) a ON a.student_id = e.student_id
    LEFT JOIN subj_att sa ON sa.student_id = e.student_id
    WHERE rc.enrollment_id = e.id AND e.class_id = ${classId} AND rc.semester_id = ${sem.id}
      AND rc.status = 'draft' AND rc.deleted_at IS NULL
      AND EXISTS (SELECT 1 FROM grades g WHERE g.enrollment_id = e.id AND g.semester_id = rc.semester_id AND g.deleted_at IS NULL)
      AND NOT EXISTS (SELECT 1 FROM grades g WHERE g.enrollment_id = e.id AND g.semester_id = rc.semester_id
                      AND g.deleted_at IS NULL AND g.locked_at IS NULL)
      AND (${sem.kind}::text <> 'genap' OR e.promotion_status IS NOT NULL)
    RETURNING rc.id`;

  const [{ n }] = await sql`SELECT count(*)::int AS n FROM report_cards rc JOIN enrollments e ON e.id = rc.enrollment_id
                            WHERE e.class_id = ${classId} AND rc.semester_id = ${sem.id} AND rc.status = 'draft' AND rc.deleted_at IS NULL`;
  return Response.json({ submitted: ready.length, notReady: n });
});
